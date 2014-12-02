var WTCategoryChooser = function(title, util, api ) {
	this.title = title;
	this.util = util;
	this.api = api;
};

WTCategoryChooser.prototype.display = function( item ) {
	var me = this;

	var select = $j('<select></select>');
	select.append($j("<option value=''> -- None -- </option>"));
	$j.each(wtallcategories, function(i, cat) {
		if(wtcategories[cat]) 
			select.append($j("<option selected='selected' value='"+cat+"'>"+cat+"</option>"));
		else
			select.append($j("<option value='"+cat+"'>"+cat+"</option>"));
	});

	select.change(function( e ) {
		var val = select.val();
		if(!val) return;

		item.mask(lpMsg('Setting Category..'));
		me.api.createPageWithCategory( me.title, val, function(response) {
			item.unmask();
			if(!response || !response.wtfacts) return; 
			if(response.wtfacts.result == 'Success') {
				window.location.reload();
			}
		});
	});

	if(wtuid) {
		var catdiv = $j('<div style="padding:5px">Choose a Category for this page:</div>');
		catdiv.append('<br/>').append(select);
		item.append(catdiv);
	}
	else {
		item.append($j('<div style="padding:5px">No Category</div>'));
	}
};

