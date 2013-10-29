var WTCredits = function(title, tree, util, api ) {
	this.title = title;
	this.tree = tree;
	this.util = util;
	this.api = api;
};

WTCredits.prototype.display = function( item ) {
	var me = this;

	var header = $j('<h2 style="margin-bottom:5px;margin-top:0px;padding-top:0px"></h2>').append('Credits');
	item.append(header);
	if(wtcategories['Task']) 
		item.append("<div>Users who have contributed to this Task, its SubTasks and Answers:</div>");
	else 
		item.append("<div>Users who have contributed to this Page:</div>");

	var contributors = me.tree.Contributors;
	var list = $j('<ul></ul>');
	$j.each(contributors, function(name, details) {
		var userlink = $j("<a href='./User:"+name+"'>"+name+"</a>");
		list.append($j("<li></li>").append(userlink).append(" ("+details[1]+" Edits)"));
	});

	item.append(list);
};

