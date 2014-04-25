var WTSidebar = function(title, tree, util, api ) {
	this.title = title;
	this.tree = tree;
	this.util = util;
	this.api = api;
};

WTSidebar.prototype.display = function( item ) {
	var me = this;

	// Can use some jquery code here to create the tree
	var header = $j('<hr/><b>Tasks Tree</b>');

	// Read the this.tree variable
	item.append(header);
};

