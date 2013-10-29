var WTComponent = function(title, details, util, api ) {
	this.title = title;
	this.details = details;
	this.util = util;
	this.api = api;
};

WTComponent.prototype.appendLinkItem = function( list, link, name ) {
	if(!name) name = link;
	var vlink = link.replace(/\s/g, '_');
	list.append($j('<li></li>').append($j('<a href="'+vlink+'"></a>').append(name)));
};

WTComponent.prototype.populateList = function( list, data ) {
	var me = this;
	//me.appendLinkItem( list, data.location, "<b>DOWNLOAD</b>" );
	console.log(data);

	var idvs = $j('<ul></ul>');
	$j.each(data.inputdatavars, function(i, v) {
		idvs.append($j('<li>'+v+'</li>'));
	});
	list.append($j('<li><b>Input</b></li>')).append(idvs);

	if(data.inputparamvars.length) {
		var ipvs = $j('<ul></ul>');
		$j.each(data.inputparamvars, function(i, v) {
			ipvs.append($j('<li>'+v+'</li>'));
		});
		list.append($j('<li><b>Param</b></li>')).append(ipvs);
	}

	var odvs = $j('<ul></ul>');
	$j.each(data.outputdatavars, function(i, v) {
		odvs.append($j('<li>'+v+'</li>'));
	});
	list.append($j('<li><b>Output</b></li>')).append(odvs);

	if(data.usedintemplates.length) {
		var plinks = $j('<ul></ul>');
		$j.each(data.usedintemplates, function(i, link) {
			var name = link.replace(/.+\//, '');
			me.appendLinkItem( plinks, link, name );
		});
		list.append($j('<li><b>Used in the following Templates:</b></li>')).append(plinks);
	}
};

WTComponent.prototype.getList = function( item, data ) {
	var list = $j('<ul></ul>');
	var me = this;

	if(data && data.WTComponent) {
		me.populateList(list, data.WTComponent);
	}
	item.data('list', list);
	return list;
};


WTComponent.prototype.display = function( item ) {
	var me = this;

	item.data('numchecked', 0);
	item.data('checked_data', []);
	item.data('data', me.details);

	var list = me.getList( item, me.details );

	var header = $j('<h2 style="margin-bottom:5px;margin-top:0px;padding-top:0px"></h2>').append('Component');
	var toolbar = $j('<div></div>').append(header);
	//toolbar.append(me.util.getHelpButton('add_wflow')));
	item.append(toolbar);
	item.append(list);
};

