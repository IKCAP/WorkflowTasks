var WTStdProperties = function(title, wtfacts, stdprops, util, api ) {
	this.title = title;
	this.wtfacts = wtfacts;
	this.stdprops = stdprops;
	this.util = util;
	this.api = api;
};

WTStdProperties.prototype.display = function($item) {
	this.$item = $item;
	this.$item.empty();
	this.$item.unmask();
	this.generateTable();
	var me = this;
	$('body').click(function() {
		me.closeAllEdits();
	});
};

WTStdProperties.prototype.notify = function() {
	this.display();
};

WTStdProperties.prototype.generateTable = function() {
	var me = this;
	me.$table =  $('<div class="table"></div>');
	me.appendHeadingRow();
	me.$item.append(me.$table);
	for(var pname in this.stdprops) {
		var property = this.stdprops[pname];
		me.appendRow(property, pname)
	}
	me.appendNotesRow();
	me.updateIcons();
};

WTStdProperties.prototype.appendRow = function(property, pname) {
	var me = this;
	var $row = $('<div class="row"></div>');
	$row.attr('property', pname);
	me.$table.append($row);
	$row.click(function(e){	
		$t = $(this);
		if(!$t.hasClass('edit') && wtuid){
			me.closeAllEdits();
			$t.addClass('edit');
			$c = $t.find('.content');
			me.generateEdit(pname, $c);
		}
		e.stopPropagation();
	});	
	me.appendIconCell($row, pname, property);
	me.appendLabelCell($row, pname, property);
	me.appendContentCell($row, pname);
	me.appendAuthorCell($row, pname);
	return $row;
};

WTStdProperties.prototype.appendHeadingRow = function() {
	var me = this;
	var heading  = '<div class="heading">';
		heading += '  <span><b>Standard Properties</b></span>'
		heading += '</div>';
	me.$item.append($(heading));
};

WTStdProperties.prototype.appendNotesRow = function() {
	var me = this;
	var notes  = '<div class="notes">';
		notes += '  <span><b>Legend: </b></span>'
		notes += '	<span style="color:#cccccc; vertical-align: -1px; font-size:17px;">&#9632;</span> Not defined, ';
		notes += '	<span style="color:#b7db7a; vertical-align: -1px; font-size:17px;">&#9632;</span> Valid, ';
		notes += '</div>';
	me.$item.append($(notes));
};

WTStdProperties.prototype.closeAllEdits = function() {
	var me = this;
	me.$table.find('.row').each(function(k, row){		
		$row = $(row);
		$row.removeClass('edit');
		var pname = $row.attr('property');
		$row.find('.content').html(me.generateContent(pname));
		$row.find('.author').html(me.getAuthorCredit(pname));
	});
};

WTStdProperties.prototype.appendIconCell = function($row, pname, property) {
	$cell = $('<div class="cell wt-icon"></div>');
	var icon = property.icon ? property.icon : 'fa-tag';
	var iconhtml = '<i class="fa '+icon+' fa-lg"></i> ';
	$cell.html(iconhtml);
	$row.append($cell);
};

WTStdProperties.prototype.appendLabelCell = function($row, pname, property) {
	$cell = $('<div class="cell label"></div>');
    var lprop = property.label;
    var propcls = property.exists ? 'lodlink' : 'lodlink new';
    var propuri = wgScriptPath + '/index.php/Property:' + property.label;
    $propentity = $('<a href="' + propuri + '" class="'+propcls+'">' + lprop + '</a>');
	$propentity.click(function(e) { e.stopPropagation(); });
	$cell.append($propentity);
	//$cell.html(this.typeToLabel(pname));
	$row.append($cell);
}

WTStdProperties.prototype.appendContentCell = function($row, pname) {	
	$cell = $('<div class="cell content"></div>');
	$cell.append(this.generateContent(pname));	
	$row.append($cell)
};

WTStdProperties.prototype.appendAuthorCell = function($row, pname) {	
    $cell = $('<div class="cell author"></div>');
	$cell.html(this.getAuthorCredit(pname));
	$row.append($cell)
};

WTStdProperties.prototype.getAuthorCredit = function(pname) {	
	var html = "";
	var valobj = this.propValue(pname);
	if(valobj && valobj.author)
		html = "(By "+valobj.author+")";
	return html;
};

WTStdProperties.prototype.generateEdit = function(pname, $content) {
	var me = this;
	var p = me.stdprops[pname];

	$in = $('<input type="text"/>');
	switch(p.type) {
		case('_wpg'):
			var placeholder = p.category ? p.category : '';
			$in = $('<input type="text" placeholder="'+placeholder+'"/>');
			if(p.category) {
				$in.autocomplete({
					delay:300,
					minLength:1,
					source: function(request, response) {
						var item = this;
						me.api.getSuggestions(request.term, p.category, function(sug) {
							response.call(this, sug.wtsuggest.suggestions);
						});
					}
				});
			}
			break;
		case('_num'):
			$in = $('<input type="text" placeholder="Number"/>');
			break;
		case('_date'):
			$in = $('<input type="text" placeholder="Date"/>');
			break;
		case('_uri'):
			$in = $('<input type="text" placeholder="URL"/>');
			break;
	}
	var valobj = this.propValue(pname);
	if(valobj)
		$in.val(valobj.val);
	$in.keyup(function(e){
		if(e.keyCode == 13){
			var v = $in.val();
			var oldv = (valobj && valobj.val) ? valobj.val : null;
			me.$item.mask('Setting '+p.label);
			me.api.setFact(me.title, p.label, v, oldv, function(response){
				me.$item.unmask();
				if(!response || !response.wtfacts || !response.wtfacts.facts) return; 
				me.wtfacts = response.wtfacts.facts;
				me.closeAllEdits();
				me.updateIcons();
        	});
		}
	});
	$content.html('');
	$content.append($in);
	$in.focus();
};

WTStdProperties.prototype.generateContent = function(pname) {
	var me = this;
	var property = this.stdprops[pname];
	var valobj = me.propValue(pname);
	$content = $('<div></div>');
	if(valobj) {
    	$valentity = $("<span></span>");
		$valentity.html(valobj.text);
    	if(valobj.type == 'WikiPage') {
        	var valcls = valobj.exists ? '' : 'new';
        	$valentity = $("<a href='"+valobj.key+"' class='"+valcls+"'>"+valobj.val.replace(/_/g,' ')+"</a>");
			$valentity.click(function(e) { e.stopPropagation(); });
    	}
    	else if(valobj.type == 'Uri') {
        	var valtext = valobj.val.replace(/Www/, 'www');
        	$valentity = $("<a href='"+valobj.val+"'>"+valtext+"</a>");
			$valentity.click(function(e) { e.stopPropagation(); });
    	}
		$content.html('');
		$content.append($valentity);
	}else{
		$content.html('Not defined!');
		$content.addClass('notexist');	
	}
	return $content;
};

WTStdProperties.prototype.propValue = function(pname) {
	var me = this;
	var valobj = this.wtfacts[pname];
	if(valobj && valobj.values && valobj.values.length)
		return valobj.values[0];
	return null;
};

WTStdProperties.prototype.typeToLabel = function(pname) {
	return pname.replace(/_/g, ' ');
};

WTStdProperties.prototype.lock = function(message) {
	this.$item.mask(lpMsg(message));
};

WTStdProperties.prototype.updateIcons = function(){
	var me = this;
	me.$table.find('.row').each(function(){
		$t = $(this);		
		var pname = $t.attr('property');
		var valobj = me.propValue(pname);
		var fade = !valobj;
		if(fade)
			$t.addClass('fade');
		else
			$t.removeClass('fade');
	});	
};

