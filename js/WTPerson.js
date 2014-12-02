var WTPerson = function(title, details, util, api ) {
	this.title = title;
	this.details = details;
	this.util = util;
	this.api = api;
};

WTPerson.prototype.display = function( item ) {
	var me = this;
	item.data('data', me.details);
	var header = $j('<div class="heading"></div>').append($j('<b>Recent Contributions</b>'));
	item.append(header);

	var contribs = me.details.WTPerson.contributions;
	if(!contribs.length) {
		item.append('No contributions by this person to the wiki.');
		item.append('<br/><i>Note: If this person exists on the wiki, then add the "Has User ID" property to this page with its value set to the Wiki User ID.</i>'); 
		return;
	}

	var topdiv = $j('<div class="scroller"></div>');
	var table = $j('<table class="contribs"></table>');
	var tr = $j('<tr></tr>');
	tr.append('<th style="text-align:left">Time</th>');
	tr.append('<th style="text-align:left">Page</th>');
	tr.append('<th style="text-align:left">Comment</th>');
	table.append(tr);
	
	for(var i=0; i<contribs.length; i++) {
		var contrib = contribs[i];

		var tr = $j('<tr></tr>');
		var timestr = contrib[2];
		var year = timestr.substring(0,4);
		var month = timestr.substring(4,6);
		var day = timestr.substring(6,8);
		var hour = timestr.substring(8,10);
		var minute = timestr.substring(10,12);
		var time = year+"-"+month+"-"+day+" "+hour+":"+minute;
		tr.append('<td style="white-space:nowrap">'+time+'</td>');
		tr.append('<td><a href="./'+contrib[0]+'">'+contrib[0]+'</a></td>');
		var comment = contrib[1];
		if(comment.length > 100) comment = comment.substring(0, 100) + '...';
		if(comment == '') comment = '-- None --';
		tr.append('<td>'+comment+'</td>');
		table.append(tr);
	}
	topdiv.append(table);
	item.append(topdiv);
};

