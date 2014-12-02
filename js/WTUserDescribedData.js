var WTUserDescribedData = function(title, details, util, api ) {
	this.title = title;
	this.details = details;
	this.util = util;
	this.api = api;
};

WTUserDescribedData.prototype.appendLinkItem = function( list, link, name ) {
	if(!name) name = link;
	var vlink = link.replace(/\s/g, '_');
	list.append($j('<li></li>').append($j('<a href="'+vlink+'"></a>').append(name)));
};

WTUserDescribedData.prototype.getListItem = function( list, data ) {
	var data_li = $j('<li></li>');

	var me = this;
	if(wtuid) {
		var delhref = $j('<a class="lodlink"><i class="fa fa-times-circle fa-lg delbutton"></i></a>');
		delhref.click( function(e) {
			list.mask(lpMsg('Removing Data Link..'));
			me.api.removeDataLink( me.title, data.location, function(resp) {
				list.unmask();
				if(!resp || !resp.wtfacts) return;
				if(resp.wtfacts.result == 'Success') {
					me.add_data_link.css('display', '');
					data_li.remove();
				}
			});
		});
		data_li.append(delhref).append(' ');
	}
	
	var wflink = data.location.replace(/\s/g,'_');
	data_li.append($j('<a href="'+wflink+'"></a>').append("<b>"+wflink+"</b>"));

	return data_li;
};

WTUserDescribedData.prototype.populateList = function( list, data ) {
	var me = this;
	if(data.location)
		return list.append(this.getListItem(list, data));
};

WTUserDescribedData.prototype.getList = function( item, data ) {
	var list = $j('<ul></ul>');
	var me = this;

	var ival = $j('<input style="width:30%" type="text" />');
	var igo = $j('<a class="lodbutton">' + lpMsg('Go') + '</a>');
	var icancel = $j('<a class="lodbutton">' + lpMsg('Cancel') + '</a>');

	var add_data_li = $j('<li></li>').append($j('<div style="width:24px"></div>'));
	add_data_li.append(ival).append(igo).append(icancel).hide();
	list.append(add_data_li);

	icancel.click(function( e ) {
		ival.val('');
		ival.data('val','');
		add_data_li.hide();
	});

	igo.click(function( e ) {
		var val = ival.data('val') ? ival.data('val') : ival.val();
		add_data_li.hide();
		if(!val) return; 
		ival.val('');
		ival.data('val','');

		item.mask(lpMsg('Adding Data Link.. Please wait..'));
		me.api.addDataLink( me.title, val, function(response) {
			item.unmask();
			if(!response || !response.wtfacts || !response.wtfacts.newdetails) return; 
			if(response.wtfacts.result == 'Success') {
				var data = response.wtfacts.newdetails;
				var data_li = me.getListItem(item, data.WTUserDescribedData);
				me.add_data_link.css('display', 'none');
				list.append(data_li);
			}
		});
	});

	if(data && data.Workflow) {
		list.append(me.getListItem(item, data.Workflow));
	}

	item.data('list', list);
	if(data && data.WTUserDescribedData) {
		me.populateList(list, data.WTUserDescribedData);
	}
	item.data('list', list);
	return list;
};


WTUserDescribedData.prototype.display = function( item ) {
	var me = this;

	item.data('data', me.details);

	var list = me.getList( item, me.details );

	if(wtuid) {
		me.add_data_link = $j('<a class="x-small lodbutton">' + lpMsg('Add Link to Data') + '</a>');
		me.add_data_link.click(function( e ) {
			list.find('li:first').css('display', '');
		});
	}

	if(me.details && me.details.WTUserDescribedData.location)
		me.add_data_link.css('display', 'none');

	var header = $j('<div class="heading"></div>').append($j('<b>User Described Data</b>'));
	item.append(header);
	var wrapper = $j('<div style="padding:5px"></div>');
	var toolbar = $j('<div></div>').append(me.add_data_link);
	wrapper.append(toolbar);
	wrapper.append(list);
	item.append(wrapper);
};

