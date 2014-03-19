var WTDataColumns = function(title, details, util, api ) {
	this.title = title;
	this.details = details;
	this.util = util;
	this.api = api;
}

WTDataColumns.prototype.appendLinkItem = function( list, link, name ) {
	if(!name) name = link;
	var cls = link.match(/^http/i) ? 'external' : '';
	var vlink = link.replace(/\s/g, '_');
	var vname = name.replace(/.+\//, '');
	list.append($j('<li></li>').append($j('<a class="'+cls+'" href="'+vlink+'"></a>').append(vname)));
};

WTDataColumns.prototype.getListItem = function( list, col ) {
	var col_li = $j('<li></li>');

	var me = this;
	var delhref = $j('<a class="lodlink">[x]</a>');
	// Delete [x] link's event handler
	delhref.click( function(e) {
		list.mask(lpMsg('Removing Column..'));
		me.api.removeColumn( me.title, col, function(resp) {
			list.unmask();
			if(!resp || !resp.wtfacts) return;
			if(resp.wtfacts.result == 'Success') {
				col_li.remove();
			}
		});
	});
	var movehref = $j('<a class="lodlink">[^]</a>');
	// Move [^] link's event handler
	movehref.click( function(e) {
		list.mask(lpMsg('Moving column up..'));
		me.api.moveColumnUp( me.title, col, function(resp) {
			list.unmask();
			if(!resp || !resp.wtfacts) return;
			if(resp.wtfacts.result == 'Success') {
				col_li.remove();
			}
		});
	});
	col_li.append(delhref).append(' ').append(movehref).append(' ');
	col_li.append('<a href="'+col+'"/>'+col+'</a>');
	return col_li;
};

WTDataColumns.prototype.getList = function( item, data ) {
	var list = $j('<ul></ul>');

	var me = this;

	var ival = $j('<input style="width:30%" type="text" />');
	var igo = $j('<a class="lodbutton">' + lpMsg('Go') + '</a>');
	var icancel = $j('<a class="lodbutton">' + lpMsg('Cancel') + '</a>');

	var addcol_li = $j('<li></li>').append($j('<div style="width:24px"></div>'));
	addcol_li.append(ival).append(igo).append(icancel).hide();
	list.append(addcol_li);

	icancel.click(function( e ) {
		ival.val('');
		ival.data('val','');
		addcol_li.hide();
	});

	igo.click(function( e ) {
		var val = ival.data('val') ? ival.data('val') : ival.val();
		addcol_li.hide();
		if(!val) return; 
		ival.val('');
		ival.data('val','');

		item.mask(lpMsg('Adding Data Column.. Please wait..'));
		me.api.addDataColumn( me.title, val, function(response) {
			item.unmask();
			if(!response || !response.wtfacts || !response.wtfacts.newdetails) return; 
			if(response.wtfacts.result == 'Success') {
				var data = response.wtfacts.newdetails;
				var col_li = me.getListItem(item, data.Workflow);
				me.addcol_link.css('display', 'none');
				list.append(col_li);
			}
		});
	});

	if(data && data.Workflow) {
		list.append(me.getListItem(item, data.Workflow));
	}

	item.data('list', list);
	return list;
};


WTDataColumns.prototype.display = function( item ) {
	var me = this;

	item.data('numchecked', 0);
	item.data('checked_data', []);
	item.data('data', me.details);

	var list = me.getList( item, me.details );

	me.addcol_link = $j('<a class="x-small lodbutton">' + lpMsg('Add Data Column') + '</a>');
	me.addcol_link.click(function( e ) {
		list.find('li:first').css('display', '');
	});

	var header = $j('<h2 style="margin-bottom:5px;margin-top:0px;padding-top:0px"></h2>').append('Data Description');
	var toolbar = $j('<div></div>').append(header).append(me.addcol_link);
	//toolbar.append(me.util.getHelpButton('add_col')));
	item.append(toolbar);
	item.append(list);
};

