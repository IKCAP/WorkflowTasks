var WTWorkflow = function(title, details, util, api ) {
	this.title = title;
	this.details = details;
	this.util = util;
	this.api = api;
};

WTWorkflow.prototype.appendLinkItem = function( list, link, name ) {
	if(!name) name = link;
	var cls = link.match(/^http/i) ? 'external' : '';
	var vlink = link.replace(/\s/g, '_');
	var vname = name.replace(/.+\//, '');
	list.append($j('<li></li>').append($j('<a class="'+cls+'" href="'+vlink+'"></a>').append(vname)));
};

WTWorkflow.prototype.appendImageItem = function( item, imguri ) {
	imguri = imguri.replace(/\s/g, '_');
	var vimage = $j('<img class="wflowimage" src="'+imguri+'"></img>');
	item.append($j('<a href="'+imguri+'"></a>').append(vimage));
};


WTWorkflow.prototype.getListItem = function( list, wflow ) {
	var wflow_li = $j('<li></li>');

	var me = this;
	if(wtuid) {
		var delhref = $j('<a class="lodlink"><i class="fa fa-times-circle fa-lg delbutton"></i></a>');
		delhref.click( function(e) {
			list.mask(lpMsg('Removing Workflow Link..'));
			me.api.removeWorkflow( me.title, wflow.url, function(resp) {
				list.unmask();
				if(!resp || !resp.wtfacts) return;
				if(resp.wtfacts.result == 'Success') {
					me.addwflow_link.css('display', '');
					wflow_li.remove();
				}
			});
		});
		wflow_li.append(delhref).append(' ');
	}
	
	var wfname = wflow.url.replace(/.+\//, '');
	//wfname = wfname.replace(/_/g, ' ');
	var wflink = wflow.url.replace(/\s/g,'_');
	wflow_li.append($j('<a href="'+wflink+'"></a>').append(wfname));

	var dvars = $j('<ul></ul>');
	$j.each(wflow.datavariables, function(i, v) {
		var vname = v.replace(/.+\//, '');
		vname = vname.replace(wfname+'_', '');
		me.appendLinkItem(dvars, v, vname);
	});

	var pvars = $j('<ul></ul>');
	$j.each(wflow.paramvariables, function(i, v) {
		var vname = v.replace(/.+\//, '');
		vname = vname.replace(wfname+'_', '');
		me.appendLinkItem(pvars, v, vname);
	});

	var procs = $j('<ul></ul>');
	$j.each(wflow.processes, function(i, p) {
		var pname = p.replace(/.+\//, '');
		pname = pname.replace(wfname+'_', '');
		me.appendLinkItem(procs, p, pname);
	});

	var executions = $j('<ul></ul>');
	$j.each(wflow.executions, function(i, p) {
		me.appendLinkItem(executions, p);
	});

	var contrib = $j('<ul></ul>');
	this.appendLinkItem(contrib, wflow.contributor);

	var crsys = $j('<ul></ul>');
	this.appendLinkItem(crsys, wflow.createdin);

	var wingstemp = $j('<ul></ul>');
	this.appendLinkItem(wingstemp, wflow.wingstemplate);

	wflow_li.append($j('<br><hr><b>Processes</b>')).append(procs);
	wflow_li.append($j('<hr><b>Data Variables</b>')).append(dvars);
	wflow_li.append($j('<hr><b>Parameter Variables</b>')).append(pvars);
	wflow_li.append($j('<hr><b>Workflow Executions</b>')).append(executions);
	wflow_li.append($j('<hr><b>Contributor</b>')).append(contrib);
	wflow_li.append($j('<hr><b>Workflow Created In</b>')).append(crsys);
	wflow_li.append($j('<hr><b>Template File</b>')).append(wingstemp);

	if(wflow.templateimage) {
		var timage = $j('<div></div>');
		this.appendImageItem(timage, wflow.templateimage);
		wflow_li.append($j('<hr><b>Workflow Template Image</b>')).append(timage);
	}

	return wflow_li;
};

WTWorkflow.prototype.getList = function( item, data ) {
	var list = $j('<ul></ul>');

	var me = this;

	var ival = $j('<input style="width:30%" type="text" />');
	var igo = $j('<a class="lodbutton">' + lpMsg('Go') + '</a>');
	var icancel = $j('<a class="lodbutton">' + lpMsg('Cancel') + '</a>');

	var addwflow_li = $j('<li></li>').append($j('<div style="width:24px"></div>'));
	addwflow_li.append(ival).append(igo).append(icancel).hide();
	list.append(addwflow_li);

	icancel.click(function( e ) {
		ival.val('');
		ival.data('val','');
		addwflow_li.hide();
	});

	igo.click(function( e ) {
		var val = ival.data('val') ? ival.data('val') : ival.val();
		addwflow_li.hide();
		if(!val) return; 
		ival.val('');
		ival.data('val','');

		item.mask(lpMsg('Adding Workflow Link.. Please wait..'));
		me.api.addWorkflow( me.title, val, function(response) {
			item.unmask();
			if(!response || !response.wtfacts || !response.wtfacts.newdetails) return; 
			if(response.wtfacts.result == 'Success') {
				var data = response.wtfacts.newdetails;
				var wflow_li = me.getListItem(item, data.Workflow);
				me.addwflow_link.css('display', 'none');
				list.append(wflow_li);
			}
		});
	});

	if(data && data.Workflow) {
		list.append(me.getListItem(item, data.Workflow));
	}

	item.data('list', list);
	return list;
};


WTWorkflow.prototype.display = function( item ) {
	var me = this;

	item.data('data', me.details);

	var list = me.getList( item, me.details );

	if(wtuid) {
		me.addwflow_link = $j('<a class="x-small lodbutton">' + lpMsg('Add Pubby Link') + '</a>');
		me.addwflow_link.click(function( e ) {
			list.find('li:first').css('display', '');
		});
	}

	var header = $j('<div class="heading"></div>').append($j('<b>Workflow</b>'));
	item.append(header);

	var wrapper = $j('<div style="padding:5px"></div>');
	var toolbar = $j('<div></div>').append(me.addwflow_link);
	//toolbar.append(me.util.getHelpButton('add_wflow')));
	wrapper.append(toolbar);
	wrapper.append(list);
	item.append(wrapper);

	if(me.details.Workflow) {
		me.addwflow_link.css('display', 'none');
	}
};

