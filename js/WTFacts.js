var WTFacts = function(title, wtfacts, stdprops, util, api ) {
	this.title = title;
	this.wtfacts = wtfacts;
	this.stdprops = stdprops;
	this.util = util;
	this.api = api;
};

WTFacts.prototype.closeAllEdits = function() {
	var me = this;
	me.$table.find('.row').each(function(k, row){		
		$row = $(row);
		$row.removeClass('edit');
		var fact = $row.data('fact');
		if(fact)
			$row.find('.content').html(me.generateContent(fact));
	});
};

WTFacts.prototype.generateContent = function(fact) {
	var me = this;
	var pname = fact.property.name;
	var property = this.stdprops[pname];
	var valobj = fact.value;
	$valentity = "";
	if(valobj) {
    	$valentity = $("<span></span>");
		$valentity.html(valobj.text);
    	if(valobj.type == 'WikiPage') {
        	var valcls = valobj.exists ? '' : 'new';
        	$valentity = $("<a href='"+valobj.key+"' class='"+valcls+"'>"+valobj.val.replace(/_/g,' ')+"</a>");
			$valentity.click(function( e ) { e.stopPropagation(); });
    	}
    	else if(valobj.type == 'Uri') {
        	var valtext = valobj.val.replace(/Www/, 'www');
        	$valentity = $("<a href='"+valobj.val+"'>"+valtext+"</a>");
			$valentity.click(function( e ) { e.stopPropagation(); });
    	}
	}
	return $valentity;
};

WTFacts.prototype.getfactrow = function( fact, item, data ) {
	var me = this;

	var tr = $('<div class="row"></div>');
	tr.data('fact', fact);
	tr.click(function(e){
		$t = $(this);
		if(!$t.hasClass('edit') && wtuid){
			me.closeAllEdits();
			$t.addClass('edit');
			var pname = fact.property.name;
			$content = $t.find('.content');
			$in = $('<input type="text"/>');
			var valobj = fact.value;
			if(valobj)
				$in.val(valobj.val);
			$in.keyup(function(e){
				if(e.keyCode == 13){
					var v = $in.val();
					var oldv = (valobj && valobj.val) ? valobj.val : null;
					me.$table.mask('Setting '+pname);
					me.api.setFact(me.title, pname, v, oldv, function(response){
						me.$table.unmask();
						if(!response || !response.wtfacts || !response.wtfacts.facts) return; 
						if(response.wtfacts.result == 'Success') {
							me.wtfacts = response.wtfacts.facts;
							item.children('.table').remove();
							item.append(me.getfactstable(item, response.wtfacts.facts));
						}
        			});
				}
			});
			$content.html('');
			$content.append($in);
			$in.focus();
		}
		e.stopPropagation();
	});	

	// Delete link and event handler
	var delhref = '';
	if(wtuid) {
		delhref = $('<a class="lodlink"><i class="fa fa-times-circle fa-lg delbutton"></i></a>');
		delhref.click( function(e) {
			item.mask(lpMsg('Removing Fact..'));
			me.api.removeFact( me.title, fact.property.name, fact.value.val, function(resp) {
				item.unmask();
				if(!resp || !resp.wtfacts || !resp.wtfacts.facts) return;
				if(resp.wtfacts.result == 'Success') {
					item.children('.table').remove();
					item.append(me.getfactstable(item, resp.wtfacts.facts));
					//me.util.showFacts([{p:fact.property, o:fact.value}]);
				}
			});
		});
	}
	else {
		delhref = $('<i class="fa fa-tag fa-lg" style="color:#667"></i>');
	}

	var lprop = fact.property.name;
	var propcls = fact.property.exists ? 'lodlink' : 'lodlink new';
	var propuri = wgScriptPath + '/index.php/Property:' + fact.property.name;
	var propentity = $('<a href="' + propuri + '" class="'+propcls+'">' + lprop + '</a>');
	propentity.click(function(e) { e.stopPropagation(); });

	var valentity = me.generateContent(fact);
	var authtext = "(By "+fact.value.author+")";
	tr.append($('<div class="cell icon"></div>').append(delhref));
	tr.append($('<div class="cell label"></div>').append(propentity));
	tr.append($('<div class="cell content"></div>').append(valentity));
	tr.append($('<div class="cell author"></div>').html(authtext));

	return tr;
};

WTFacts.prototype.blacklist = ['SubTask', 'Answer', 'Answered', 'Workflow', 'DataLocation', 'DataWikiLocation', 'DataExtractedFrom', 'Columns'];

WTFacts.prototype.getfactstable = function( item, data ) {
	var table = $('<div class="table"></div>');

	var iprop = $('<input style="width:97%" type="text"/>');
	var ival = $('<input style="width:99%" type="text" />');
	var igo = $('<a class="lodbutton">' + lpMsg('Go') + '</a>');
	var icancel = $('<a class="lodbutton">' + lpMsg('Cancel') + '</a>');

	var addfact_tr = $('<div class="row"></div>');
	addfact_tr.append($('<div class="cell icon"></div>'));
	addfact_tr.append($('<div class="cell label"></div>').append(iprop));
	addfact_tr.append($('<div class="cell content"></div>').append(ival));
	addfact_tr.append($('<div class="cell"></div>').append(igo).append(icancel)).hide();
	table.append(addfact_tr);

	var me = this;

	iprop.autocomplete({
		delay:300,
		minLength:1,
		source: function(request, response) {
			var item = this;
			me.api.getSuggestions(request.term, 'property', function(sug) {
				response.call(this, sug.wtsuggest.suggestions);
			});
		},
		select: function(e, ui) {
			iprop.data('val', ui.item.value);
		}
	});

	if(data) {
		$.each(data, function(prop, propdata) {
			if(($.inArray(prop, me.blacklist) == -1)  &&
				(!me.stdprops[prop])) {
				if(!propdata.values) return;
				$.each(propdata.values, function(key, val) {
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

	igo.click(function(e) { localAddFact(); });
	ival.keyup(function(e){
		if(e.keyCode == 13){ localAddFact(); }
	});
			

	function localAddFact() {
		var prop = iprop.data('val') ? iprop.data('val') : iprop.val();
		var val = ival.data('val') ? ival.data('val') : ival.val();
		addfact_tr.hide();
		if(!prop || !val) return; // TODO Error message?
		iprop.val(''); ival.val('');
		iprop.data('val',''); ival.data('val','');

		item.mask(lpMsg('Adding Fact..'));
		me.api.addFact( me.title, prop, val, function(response) {
			item.unmask();
			if(!response || !response.wtfacts || !response.wtfacts.facts) return; 
			if(response.wtfacts.result == 'Success') {
				me.wtfacts = response.wtfacts.facts;
				item.children('.table').remove();
				item.append(me.getfactstable(item, response.wtfacts.facts));
			}
		});
	}

	item.data('table', table);
	return table;
};

WTFacts.prototype.display = function( item ) {
	var me = this;

	item.data('data', me.wtfacts);

	me.$table = me.getfactstable( item, me.wtfacts );

	var addfact_link = '';
	if(wtuid) {
		addfact_link = $('<a class="lodlink"><i class="fa fa-plus-circle fa-lg"></i></a>');
		addfact_link.click(function( e ) {
			var table = item.data('table');
			table.find('div.row:first').css('display', '');
		});
	}

	var header = $('<div class="heading"></div>').append($('<b>Properties</b>').append(' ').append(addfact_link));
	item.append(header);
	//item.append(me.util.getHelpButton('add-fact'));
	item.append(me.$table);

	$('body').click(function() {
		me.closeAllEdits();
	});
};
