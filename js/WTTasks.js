var WTTasks = function(title, details, util, api ) {
	this.title = title;
	this.details = details;
	this.util = util;
	this.api = api;
};

WTTasks.prototype.display = function( item ) {
	var me = this;

	var header = $j('<div class="heading"></div>').append($j('<b>Tasks Answered</b>'));
	item.append(header);
	var wrapper = $j('<div style="padding:5px"></div>');
	item.append(wrapper);

	wrapper.append("<div>This page answers the following Tasks:</div>");

	var tasks = me.details.Tasks;
	var list = $j('<ul></ul>');
	$j.each(tasks, function(name, task) {
		var q_cls = task.exists ? '' : 'new';
		var qlink = $j('<a class="'+q_cls+'" href="'+task.key+'"></a>').append(task.text);
		list.append($j("<li></li>").append(qlink));
	});

	wrapper.append(list);
	item.append(wrapper);
};

