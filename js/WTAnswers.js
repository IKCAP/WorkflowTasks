var WTAnswers = function(title, tree, util, api ) {
	this.title = title;
	this.tree = tree;
	this.util = util;
	this.api = api;
};


WTAnswers.prototype.getListItem = function( list, ansdata ) {
	var ans_li = $j('<li></li>');

	var me = this;
	var delhref = $j('<a class="lodlink">[x]</a>');
	// Minus [-] link's event handler
	delhref.click( function(e) {
		list.mask(lpMsg('Removing Answer..'));
		me.api.removeAnswer( me.title, ansdata.text, function(resp) {
			list.unmask();
			if(!resp || !resp.wtfacts) return;
			if(resp.wtfacts.result == 'Success') {
				ans_li.remove();
			}
		});
	});
	ans_li.append(delhref).append(' ');

	var ans_cls = ansdata.exists ? '' : 'new';
	ans_li.append($j('<a class="'+ans_cls+'" href="'+ansdata.key+'"></a>').append(ansdata.text));

	return ans_li;
};

WTAnswers.prototype.getList = function( item, data ) {
	var list = $j('<ul></ul>');

	var me = this;

	var ival = $j('<input style="width:30%" type="text" />');
	var igo = $j('<a class="lodbutton">' + lpMsg('Go') + '</a>');
	var icancel = $j('<a class="lodbutton">' + lpMsg('Cancel') + '</a>');

	var addans_li = $j('<li></li>').append($j('<div style="width:24px"></div>'));
	addans_li.append(ival).append(igo).append(icancel).hide();
	list.append(addans_li);

	icancel.click(function( e ) {
		ival.val('');
		ival.data('val','');
		addans_li.hide();
	});

	igo.click(function( e ) {
		var val = ival.data('val') ? ival.data('val') : ival.val();
		addans_li.hide();
		if(!val) return; 
		ival.val('');
		ival.data('val','');

		item.mask(lpMsg('Adding Answer..'));
		me.api.addAnswer( me.title, val, function(response) {
			item.unmask();
			if(!response || !response.wtfacts || !response.wtfacts.newdetails) return; 
			if(response.wtfacts.result == 'Success') {
				var ans = response.wtfacts.newdetails;
				var ans_li = me.getListItem(item, ans.item);
				list.append(ans_li);
			}
		});
	});

	if(data) {
		$j.each(data.Answers, function(ind, ans) {
			var ans_li = me.getListItem(item, ans.item);
			list.append(ans_li);
		});
	}

	item.data('list', list);
	return list;
};


WTAnswers.prototype.display = function( item ) {
	var me = this;

	item.data('numchecked', 0);
	item.data('checked_data', []);
	item.data('data', me.tree);

	var list = me.getList( item, me.tree );

	var addans_link = $j('<a class="x-small lodbutton">' + lpMsg('Add') + '</a>');
	addans_link.click(function( e ) {
		list.find('li:first').css('display', '');
	});

	var header = $j('<h2 style="margin-bottom:5px;margin-top:0px;padding-top:0px"></h2>').append('Answers to this Task');
	var toolbar = $j('<div></div>').append(header).append(addans_link);
	//toolbar.append(me.util.getHelpButton('add_answer')));

	item.append(toolbar);
	item.append(list);
};

