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
	var col_li = $j('<li class="column"></li>');

	var me = this;
	var delhref = $j('<a class="lodlink">[x]</a>');
	// Delete [x] link's event handler
	delhref.click( function(e) {
		list.mask(lpMsg('Removing Column..'));
		var newlist = me.createNewList(list, null, col.key);
		me.api.removeDataColumn( me.title, col.key, newlist, function(resp) {
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
		var newlist = me.createNewList(list, null, null, col.key);
		me.api.moveDataColumn( me.title, newlist, function(resp) {
			list.unmask();
			if(!resp || !resp.wtfacts) return;
			if(resp.wtfacts.result == 'Success') {
				list.data('data', resp.wtfacts.facts);
				$("li.column").remove();
				me.fillList(list);
			}
		});
	});
	var valcls = col.exists ? '' : 'new';
	var valentity = "<a href='"+col.key+"' class='"+valcls+"'>"+col.val.replace(/_/g,' ')+"</a>";
	col_li.append(delhref).append(' ').append(movehref).append(' ');
	col_li.append(valentity);
	return col_li;
};

WTDataColumns.prototype.upperCaseFirst = function(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
};

WTDataColumns.prototype.fillList = function( list ) {
	var data = list.data('data');
	if(data && data.Columns && data.Columns.values) {
		this.sortDataColumns(data);
		for(var i=data.Columns.values.length-1; i>=0; i--) 
			list.prepend(this.getListItem(list, data.Columns.values[i]));
	}
};

WTDataColumns.prototype.sortDataColumns = function(data) {
	var sobjects = {};
	for(var sobj in data.subobjects) 
		sobjects[this.upperCaseFirst(sobj)] = parseInt(data.subobjects[sobj].Index.values[0].val);
	var vals = [];
	var colhash = {};
	for (var i=0; i<data.Columns.values.length; i++) {
		var ind = sobjects[data.Columns.values[i].val];
		vals[ind] = data.Columns.values[i];	
	}
	data.Columns.values = vals;
};

WTDataColumns.prototype.createNewList = function(list, addcol, delcol, moveupcol) {
	var newlist = [];
	this.sortDataColumns(list.data('data'));
	var curlist = list.data('data').Columns;
	if(curlist) {
		for(var i=0; i<curlist.values.length; i++) {
			if(curlist.values[i].key == moveupcol && i>0) {
				var tmp = newlist[i-1];
				newlist[i-1] = moveupcol;
				newlist[i] = tmp;
			}
			else if(curlist.values[i].key != delcol)
				newlist.push(curlist.values[i].key);
		}
	}
	if(addcol)
		newlist.push(this.upperCaseFirst(addcol));
	return newlist;
};

WTDataColumns.prototype.getList = function( item, data ) {
	var me = this;

	var ival = $j('<input style="width:30%" type="text" />');
	var igo = $j('<a class="lodbutton">' + lpMsg('Go') + '</a>');
	var icancel = $j('<a class="lodbutton">' + lpMsg('Cancel') + '</a>');
	ival.autocomplete({
		api: me.api,
		position: 'columntype',
		minChars:1,
		maxHeight:200,
		deferRequestBy:300,
		width:'100%',
		zIndex:9999,
		onSelect: function(value, data) { ival.data('val', data); }
	});

	var addcol_li = $j('<li></li>').append($j('<div style="width:24px"></div>'));
	addcol_li.append(ival).append(igo).append(icancel).hide();

	var list = $j('<ul></ul>');
	list.data('data', data);
	this.fillList(list);
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
		var newlist = me.createNewList(list, val);
		me.api.addDataColumn( me.title, val, newlist, function(response) {
			item.unmask();
			if(!response || !response.wtfacts) return;
			if(response.wtfacts.result == 'Success') {
				list.data('data', response.wtfacts.facts);
				$("li.column").remove();
				me.fillList(list);
			}
		});
	});

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
		list.find('li:last').css('display', '');
	});

	var header = $j('<h2 style="margin-bottom:5px;margin-top:0px;padding-top:0px"></h2>').append('Data Columns');
	var toolbar = $j('<div></div>').append(header).append(me.addcol_link);
	//toolbar.append(me.util.getHelpButton('add_col')));
	item.append(toolbar);
	item.append(list);
};

