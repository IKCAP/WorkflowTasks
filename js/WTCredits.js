var WTCredits = function(title, tree, util, api ) {
	this.title = title;
	this.tree = tree;
	this.util = util;
	this.api = api;
};

WTCredits.prototype.display = function( item ) {
	var me = this;

	var header = $j('<div class="heading"></div>').append($j('<b>Credits</b>'));
	item.append(header);
	var wrapper = $j('<div style="padding:5px"></div>');
	if(wtcategories['Task']) 
		wrapper.append("<div>Users who have contributed to this Task, its SubTasks and Answers:</div>");
	else 
		wrapper.append("<div>Users who have contributed to this Page:</div>");

	var contributors = me.tree.Contributors;
	var list = $j('<ul></ul>');
	$j.each(contributors, function(name, details) {
		var userlink = $j("<a href='./User:"+name+"'>"+name+"</a>");
		list.append($j("<li></li>").append(userlink).append(" ("+details[1]+" Edits)"));
	});
	wrapper.append(list);
	item.append(wrapper);
};

