var WTSubTasks = function(title, tree, util, api ) {
	this.title = title;
	this.tree = tree;
	this.util = util;
	this.api = api;
};


WTSubTasks.prototype.getListItem = function( list, subdata, answers, is_sub ) {
	var sub_li = $j('<li></li>');

	var me = this;
	if(!is_sub) {
		var delhref = $j('<a class="lodlink">[x]</a>');
		// Minus [-] link's event handler
		delhref.click( function(e) {
			list.mask(lpMsg('Removing SubTask..'));
			me.api.removeSubTask( me.title, subdata.text, function(resp) {
				list.unmask();
				if(!resp || !resp.wtfacts) return;
				if(resp.wtfacts.result == 'Success') {
					sub_li.remove();
				}
			});
		});
		sub_li.append(delhref).append(' ');
	}

	var sub_cls = subdata.exists ? '' : 'new';
	sub_li.append($j('<a class="'+sub_cls+'" href="'+subdata.key+'"></a>').append(subdata.text));

	if(answers && answers.length) {
		sub_li.append(' (Answer: ');
		var i=0;
		$j.each(answers, function(ind, ans) {
			if(i) sub_li.append(', ');
			var ans_cls = ans.item.exists ? '' : 'new';
			sub_li.append($j('<a class="'+ans_cls+'" href="'+ans.item.key+'"></a>').append(ans.item.text));
			i++;
		});
		sub_li.append(')');
	}

	return sub_li;
};

WTSubTasks.prototype.getTree = function( item, data, is_sub ) {
	var list = $j('<ul class="wt-tree"></ul>');

	var me = this;

	if(!is_sub) {
		var ival = $j('<input style="width:30%" type="text" />');
		var igo = $j('<a class="lodbutton">' + lpMsg('Go') + '</a>');
		var icancel = $j('<a class="lodbutton">' + lpMsg('Cancel') + '</a>');
		var addsub_li = $j('<li></li>').append($j('<div style="width:24px"></div>'));
		addsub_li.append(ival).append(igo).append(icancel).hide();
		list.append(addsub_li);

		icancel.click(function( e ) {
			ival.val('');
			ival.data('val','');
			addsub_li.hide();
		});

		igo.click(function( e ) {
			var val = ival.data('val') ? ival.data('val') : ival.val();
			addsub_li.hide();
			if(!val) return; 
			ival.val('');
			ival.data('val','');
	
			item.mask(lpMsg('Adding SubTask..'));
			me.api.addSubTask( me.title, val, function(response) {
				item.unmask();
				if(!response || !response.wtfacts || !response.wtfacts.newdetails) return; 
				if(response.wtfacts.result == 'Success') {
					var sub = response.wtfacts.newdetails;
					var sub_li = me.getListItem(item, sub.item, sub.Answers, is_sub);
					var sublist = me.getTree(sub_li, sub, true);
					list.append(sub_li.append(sublist));
				}
			});
		});
	}

	if(data) {
		$j.each(data.SubTasks, function(ind, sub) {
			var sub_li = me.getListItem(item, sub.item, sub.details.Answers, is_sub);
			var sublist = me.getTree(sub_li, sub.details, true);
			list.append(sub_li.append(sublist));
		});
	}

	item.data('list', list);
	return list;
};


WTSubTasks.prototype.appendParents = function( item ) {
	if( !this.tree.Parents || !this.tree.Parents.length ) return;

	var header = $j('<h2 style="margin-bottom:5px;margin-top:0px;padding-top:0px"></h2>').append('Parent Tasks');
	item.append(header);

	var list = $j('<ul style="margin-bottom:8px"></ul>');
	$j.each(this.tree.Parents, function(ind, par) {
		var par_cls = par.exists ? '' : 'new';
		var link = $j('<a class="'+par_cls+'" href="'+par.key+'"></a>').append(par.text);
		list.append($j("<li></li>").append(link));
	});

	item.append(list);
}

WTSubTasks.prototype.display = function( item ) {
	var me = this;

	item.data('numchecked', 0);
	item.data('checked_data', []);
	item.data('data', me.tree);

	var list = me.getTree( item, me.tree );

	var addsub_link = $j('<a class="x-small lodbutton">' + lpMsg('Add') + '</a>');
	addsub_link.click(function( e ) {
		list.find('li:first').css('display', '');
	});

	this.appendParents(item);

	var header = $j('<h2 style="margin-bottom:5px;margin-top:0px;padding-top:0px"></h2>').append('Sub Tasks');
	var toolbar = $j('<div></div>').append(header).append(addsub_link);
	//toolbar.append(me.util.getHelpButton('add_subtask')));

	item.append(toolbar);
	item.append(list);
};

