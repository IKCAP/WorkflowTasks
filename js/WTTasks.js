var WTTasks = function(title, details, util, api ) {
	this.title = title;
	this.details = details;
	this.util = util;
	this.api = api;
};

WTTasks.prototype.display = function( item ) {
	var me = this;

	var header = $j('<h2 style="margin-bottom:5px;margin-top:0px;padding-top:0px"></h2>').append('Tasks Answered');
	item.append(header);
	item.append("<div>This page answers the following Tasks:</div>");

	var tasks = me.details.Tasks;
	var list = $j('<ul></ul>');
	$j.each(tasks, function(name, task) {
		var q_cls = task.exists ? '' : 'new';
		var qlink = $j('<a class="'+q_cls+'" href="'+task.key+'"></a>').append(task.text);
		list.append($j("<li></li>").append(qlink));
	});

	item.append(list);
};

