var WTFacts = function(title, wtfacts, util, api ) {
	this.title = title;
	this.wtfacts = wtfacts;
	this.util = util;
	this.api = api;
};

WTFacts.prototype.getfactrow = function( fact, item, data ) {
	var me = this;

	var tr = $j('<tr class="fact"></tr>');

	var delhref = $j('<a class="lodlink">[x]</a>');
	tr.append($j('<td style="width:2em" valign="top" align="left"></td>').append(delhref));

	// Minus [-] link's event handler
	delhref.click( function(e) {
		item.mask(lpMsg('Removing Fact..'));
		me.api.removeFact( me.title, fact.property.name, fact.value.val, function(resp) {
			item.unmask();
			if(!resp || !resp.wtfacts || !resp.wtfacts.facts) return;
			if(resp.wtfacts.result == 'Success') {
				item.children('table').remove();
				item.append(me.getfactstable(item, resp.wtfacts.facts));
				//me.util.showFacts([{p:fact.property, o:fact.value}]);
			}
		});
	});

	var subtable = $j('<table class="lod-facts-inner-table"></table>');
	tr.append($j('<td></td>').append(subtable));

	var lprop = fact.property.name;
	var propcls = fact.property.exists ? 'lodlink' : 'lodlink new';
	var propuri = wgScriptPath + '/index.php/Property:' + fact.property.name;
	var propentity = $j('<a href="' + propuri + '" class="'+propcls+'">' + lprop + '</a>');

	var valentity = fact.value.text;
	if(fact.value.type == 'WikiPage') {
		var valcls = fact.value.exists ? '' : 'new';
		valentity = "<a href='"+fact.value.key+"' class='"+valcls+"'>"+fact.value.val.replace(/_/g,' ')+"</a>";
	}
	else if(fact.value.type == 'Uri') {
		var valtext = fact.value.val.replace(/Www/, 'www');
		valentity = "<a href='"+fact.value.val+"'>"+valtext+"</a>";
	}

	var authentity = "<span style='font-size:9px;color:#999'>(By "+fact.value.author+")</span>";
	var subtr = $j('<tr></tr>');
	subtr.append($j('<td style="width:30%"></td>').append(propentity));
	subtr.append($j('<td></td>').append(valentity));
	subtr.append($j('<td style="width:15%"></td>').append(authentity));
	subtable.append(subtr);

	tr.data('data', [fact.property, fact.value, fact.sources]);
	return tr;
};

WTFacts.prototype.blacklist = ['SubTask', 'Answer', 'Answered', 'Workflow', 'DataLocation', 'DataWikiLocation', 'DataExtractedFrom', 'Columns'];

WTFacts.prototype.getfactstable = function( item, data ) {
	var table = $j('<table id="facts-table" class="lod-table"></table>');

	var iprop = $j('<input style="width:30%" type="text"/>');
	var ival = $j('<input style="width:30%" type="text" />');
	var igo = $j('<a class="lodbutton">' + lpMsg('Go') + '</a>');
	var icancel = $j('<a class="lodbutton">' + lpMsg('Cancel') + '</a>');
	var addfact_tr = $j('<tr></tr>').append($j('<td style="width:24px"></td>'));
	addfact_tr.append($j('<td></td>').append(iprop).append(' ').append(ival).append(igo).append(icancel)).hide();
	table.append(addfact_tr);

	var me = this;

	iprop.autocomplete({
		api: me.api,
		position: 'property',
		minChars:1,
		maxHeight:200,
		deferRequestBy:300,
		width:'100%',
		zIndex:9999,
		onSelect: function(value, data) { iprop.data('val', data); }
	});
	/*ival.autocomplete({
		api: me.api,
		position: 'object',
		minChars:1,
		maxHeight:200,
		deferRequestBy:300,
		width:'100%',
		zIndex:9999,
		onSelect: function(value, data) { ival.data('val', data); }
	});*/

	if(data) {
		$j.each(data, function(prop, propdata) {
			if($j.inArray(prop, me.blacklist) == -1) {
				if(!propdata.values) return;
				$j.each(propdata.values, function(key, val) {
					var fact = {property:{name:prop, exists:propdata.exists}, value:val};
					var tr = me.getfactrow(fact, item, data);
					table.append(tr);
				});
			}
		});
	}

	icancel.click(function( e ) {
		iprop.val(''); ival.val('');
		iprop.data('val',''); ival.data('val','');
		addfact_tr.hide();
	});

	igo.click(function( e ) {
		var prop = iprop.data('val') ? iprop.data('val') : iprop.val();
		var val = ival.data('val') ? ival.data('val') : ival.val();
		addfact_tr.hide();
		if(!prop || !val) return; // TODO Error message?
		iprop.val(''); ival.val('');
		iprop.data('val',''); ival.data('val','');

		item.mask(lpMsg('Adding Fact..'));
		me.api.addFact( me.title, prop, val, function(response) {
			item.unmask();
			if(!response || !response.wtfacts || !response.wtfacts.facts) return; // TODO Error message?
			// Redrawing the whole box, i.e. removing the old facts, adding the new ones
			item.find('.fact').remove();
			item.find('.urirow').remove();
			var tr = null;
			$j.each(response.wtfacts.facts, function(prop, propdata) {
				if($j.inArray(prop, me.blacklist) == -1) {
					$j.each(propdata.values, function(key, val) {
						var fact = {property:{name:prop, exists:propdata.exists}, value:val};
						var tr = me.getfactrow(fact, item, data);
						table.append(tr);
					});
				}
			});
		});
	});

	item.data('table', table);
	return table;
};


WTFacts.prototype.display = function( item ) {
	var me = this;

	item.data('numchecked', 0);
	item.data('checked_data', []);
	item.data('data', me.wtfacts);

	var table = me.getfactstable( item, me.wtfacts );

	var addfact_link = $j('<a class="x-small lodbutton">' + lpMsg('Add') + '</a>');
	addfact_link.click(function( e ) {
		var table = item.data('table');
		table.find('tr:first').css('display', '');
	});

	var header = $j('<h2 style="margin-bottom:5px;margin-top:0px;padding-top:0px"></h2>').append('Structured Properties');
	item.append(header).append(addfact_link);
	//item.append(me.util.getHelpButton('add-fact'));
	item.append(table);
};

