var WTExecutedWorkflow = function(title, details, util, api ) {
	this.title = title;
	this.details = details;
	this.util = util;
	this.api = api;
};


WTExecutedWorkflow.prototype.appendLinkItem = function( list, link ) {
	var cls = link.match(/^http/i) ? 'external' : '';
	var vlink = link.replace(/\s/g, '_');
	var vname = link.replace(/.+\//, '');
	list.append($j('<li></li>').append($j('<a class="'+cls+'" href="'+vlink+'"></a>').append(vname)));
	//list.append($j('<li></li>').append($j('<a href="'+vlink+'"></a>').append(vname)));
};

WTExecutedWorkflow.prototype.appendImageItem = function( item, imguri ) {
	imguri = imguri.replace(/\s/g, '_');
	var vimage = $j('<img class="wflowimage" src="'+imguri+'"></img>');
	item.append($j('<a href="'+imguri+'"></a>').append(vimage));
};

WTExecutedWorkflow.prototype.getListItem = function( list, wflow ) {
	var wflow_li = $j('<li></li>');

	var me = this;
	var delhref = $j('<a class="lodlink">[x]</a>');
	// Minus [-] link's event handler
	delhref.click( function(e) {
		list.mask(lpMsg('Removing Executed Workflow Link..'));
		me.api.removeExecutedWorkflow( me.title, wflow.url, function(resp) {
			list.unmask();
			if(!resp || !resp.wtfacts) return;
			if(resp.wtfacts.result == 'Success') {
				me.addwflow_link.css('display', '');
				wflow_li.remove();
			}
		});
	});
	wflow_li.append(delhref).append(' ');
	var wfname = wflow.url.replace(/.+\//, '');
	var wflink = wflow.url.replace(/\s/,'_');
	wflow_li.append($j('<a href="'+wflink+'"></a>').append(wfname));

	var idsets = this.getVariableDatasetsList(wflow.inputdatasets, wflow.workflowtemplate);
	var dsets = this.getVariableDatasetsList(wflow.datasets, wflow.workflowtemplate);
	var params = this.groupListItems(wflow.parameters);
	var procs = this.groupListItems(wflow.processes);

	var exsys = $j('<ul></ul>');
	$j.each(wflow.executedin, function(i, link) {
		me.appendLinkItem(exsys, link);
	});

	var wftemp = $j('<ul></ul>');
	this.appendLinkItem(wftemp, wflow.templatewikipage ? wflow.templatewikipage : wflow.workflowtemplate);

	var wingsxfile = $j('<ul></ul>');
	this.appendLinkItem(wingsxfile, wflow.wingsexecutionfile);

	var contrib = $j('<ul></ul>');
	this.appendLinkItem(contrib, wflow.user);

	var exectime = $j('<ul></ul>');
	var starttimestr = '<b>Start:</b> '+(new Date(wflow.starttime*1000));
	var endtimestr = '<b>End:</b> '+(new Date(wflow.endtime*1000));
	exectime.append($j('<li></li>').append(starttimestr));
	exectime.append($j('<li></li>').append(endtimestr));

	var execstatus = $j('<ul></ul>');
	execstatus.append($j('<li></li>').append(wflow.status));

	wflow_li.append($j('<br>'));
	wflow_li.append($j('<hr><b>Input Data</b>')).append(idsets);
	wflow_li.append($j('<hr><b>Generated Data</b>')).append(dsets);
	wflow_li.append($j('<hr><b>Parameters</b>')).append(params);
	wflow_li.append($j('<hr><b>Process Runs</b>')).append(procs);
	wflow_li.append($j('<hr><b>Executed by</b>')).append(contrib);
	wflow_li.append($j('<hr><b>Time of Execution</b>')).append(exectime);
	wflow_li.append($j('<hr><b>Status of Execution</b>')).append(execstatus);
	wflow_li.append($j('<hr><b>Execution Systems</b>')).append(exsys);
	wflow_li.append($j('<hr><b>Workflow Template</b>')).append(wftemp);
	wflow_li.append($j('<hr><b>Execution File</b>')).append(wingsxfile);

	if(wflow.runimage) {
		var rimage = $j('<div></div>');
		this.appendImageItem(rimage, wflow.runimage);
		wflow_li.append($j('<hr><b>Workflow Run Image</b>')).append(rimage);
	}
	if(wflow.templateimage) {
		var timage = $j('<div></div>');
		this.appendImageItem(timage, wflow.templateimage);
		wflow_li.append($j('<hr><b>Workflow Template Image</b>')).append(timage);
	}

	return wflow_li;
};

WTExecutedWorkflow.prototype.getVariableDatasetsList = function( data, wflink ) {
	var ditem = $j('<ul class="grouplist"></ul>');
	var dindexed = {};
	var me = this;
	var wfname = wflink.replace(/.+\//, '');
	$j.each(data, function(variable, dvals) {
		var sdvals = dvals.sort();
		var subditem = $j('<ul></ul>');
		$j.each(sdvals, function(i, d) {
			var dname = d.replace(wfname+'_', '');
			me.appendLinkItem(subditem, dname);
		});
		var vname = variable.replace(/.+\//, '');
		vname = vname.replace(wfname+'_', '');
		ditem.append($j('<li>'+vname+' ('+dvals.length+')</li>').append(subditem));
	});
	return ditem;
};

WTExecutedWorkflow.prototype.groupListItems = function( data ) {
	var ditem = $j('<ul class="grouplist"></ul>');
	data = data.sort();
	var dindexed = {};
	var me = this;
	$j.each(data, function(i, d) {
		var dname = d.replace(/.+\//, '');
		dname = dname.replace(/^(.+?)\s*(\d|\.|-)+.*$/, "$1");
		//dname = dname.replace(/(\d|\.|-|\s)+Z?$/, '');
		if(dindexed[dname]) dindexed[dname].push(d)
		else dindexed[dname] = [d];
	});
	$j.each(dindexed, function(dname, dvals) {
		if(dvals.length > 1) {
			var subditem = $j('<ul></ul>');
			$j.each(dvals, function(i, d) {
				me.appendLinkItem(subditem, d);
			});
			ditem.append($j('<li>'+dname+' ('+dvals.length+')</li>').append(subditem));
		}
		else if(dvals.length == 1) {
			me.appendLinkItem(ditem, dvals[0]);
		}
	});
	return ditem;
};

WTExecutedWorkflow.prototype.getList = function( item, data ) {
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

		item.mask(lpMsg('Adding Workflow Execution Details.. Please wait..'));
		me.api.addExecutedWorkflow( me.title, val, function(response) {
			item.unmask();
			if(!response || !response.wtfacts || !response.wtfacts.newdetails) return; 
			if(response.wtfacts.result == 'Success') {
				var data = response.wtfacts.newdetails;
				var wflow_li = me.getListItem(item, data.Workflow);
				me.addwflow_link.css('display', 'none');
				list.append(wflow_li);
				me.convertGroupLists();
			}
		});
	});

	if(data && data.Workflow) {
		list.append(me.getListItem(item, data.Workflow));
	}

	item.data('list', list);
	return list;
};


WTExecutedWorkflow.prototype.display = function( item ) {
	var me = this;

	item.data('numchecked', 0);
	item.data('checked_data', []);
	item.data('data', me.details);

	var list = me.getList( item, me.details );

	me.addwflow_link = $j('<a class="x-small lodbutton">' + lpMsg('Add Pubby Link') + '</a>');
	me.addwflow_link.click(function( e ) {
		list.find('li:first').css('display', '');
	});

	var header = $j('<h2 style="margin-bottom:5px;margin-top:0px;padding-top:0px"></h2>').append('Executed Workflow');
	var toolbar = $j('<div></div>').append(header).append(me.addwflow_link);
	//toolbar.append(me.util.getHelpButton('add_wflow')));
	item.append(toolbar);
	item.append(list);

	if(me.details.Workflow) {
		me.addwflow_link.css('display', 'none');
	}
	me.convertGroupLists();
};


WTExecutedWorkflow.prototype.convertGroupLists = function() {
	// Find list items representing folders and style them accordingly.  Also, turn them
	// into links that can expand/collapse the  tree leaf.
	$('ul.grouplist li > ul').each(function(i) {
		// Find this list's parent list item.
		var parent_li = $(this).parent('li');

		// Style the list item as folder.
		parent_li.addClass('folder');

		// Temporarily remove the list from the
		// parent list item, wrap the remaining
		// text in an anchor, then reattach it.
		var sub_ul = $(this).remove();
		parent_li.wrapInner('<a style="cursor:pointer">[+] </a>').find('a').click(function() {
			// Make the anchor toggle the leaf display.
			sub_ul.toggle();
		});
		parent_li.append(sub_ul);
	});

	// Hide all lists except the outermost.
	$('ul.grouplist ul').hide();
};

