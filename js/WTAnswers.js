var WTAnswers = function(title, tree, util, api ) {
	this.title = title;
	this.tree = tree;
	this.util = util;
	this.api = api;
};


WTAnswers.prototype.getListItem = function( list, ansdata ) {
	var ans_li = $j('<li></li>');

	var me = this;
	if(wtuid) {
		var delhref = $j('<a class="lodlink"><i class="fa fa-times-circle fa-lg delbutton"></i></a>');
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
	}

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

	var addans_link = '';
	if(wtuid) {
		addans_link = $j('<a class="lodlink"><i class="fa fa-plus-circle fa-lg"></i></a>');
		addans_link.click(function( e ) {
			list.find('li:first').css('display', '');
		});
	}

	var header = $j('<div class="heading"></div>').append($j('<b>Answers</b>')).append(' ').append(addans_link);
	item.append(header);
	var wrapper = $j('<div style="padding:5px"></div>');
	wrapper.append(list);
	item.append(wrapper);
};

