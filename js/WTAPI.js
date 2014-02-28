var WTAPI = function(title, apiuri, editToken) {
	this.title = title;
	this.apiuri = apiuri;
	this.editToken = editToken ? editToken : "";
};

WTAPI.prototype.addSubTask = function( task, subtask, callbackfunction ) {
	this.addFact( task, 'SubTask', subtask, callbackfunction );
};

WTAPI.prototype.removeSubTask = function( task, subtask, callbackfunction ) {
	this.removeFact( task, 'SubTask', subtask, callbackfunction );
};

WTAPI.prototype.addAnswer = function( task, answer, callbackfunction ) {
	this.addFact( task, 'Answer', answer, callbackfunction );
};

WTAPI.prototype.removeAnswer = function( task, answer, callbackfunction ) {
	this.removeFact( task, 'Answer', answer, callbackfunction );
};

WTAPI.prototype.addWorkflow = function( title, url, callbackfunction ) {
	this.addFact( title, 'Workflow', url, callbackfunction );
};

WTAPI.prototype.removeWorkflow = function( title, url, callbackfunction ) {
	this.removeFact( title, 'Workflow', url, callbackfunction );
};

WTAPI.prototype.addExecutedWorkflow = function( title, url, callbackfunction ) {
	this.addFact( title, 'ExecutedWorkflow', url, callbackfunction );
};

WTAPI.prototype.removeExecutedWorkflow = function( title, url, callbackfunction ) {
	this.removeFact( title, 'ExecutedWorkflow', url, callbackfunction );
};

WTAPI.prototype.addDataLink = function( title, url, callbackfunction ) {
	this.addFact( title, 'DataLocation', url, callbackfunction );
};

WTAPI.prototype.removeDataLink = function( title, url, callbackfunction ) {
	this.removeFact( title, 'DataLocation', url, callbackfunction );
};

WTAPI.prototype.addDataWikiLink = function( title, url, callbackfunction ) {
	this.addFact( title, 'DataWikiLocation', url, callbackfunction );
};

WTAPI.prototype.removeDataWikiLink = function( title, url, callbackfunction ) {
	this.removeFact( title, 'DataWikiLocation', url, callbackfunction );
};

WTAPI.prototype.addDataExtractedFrom = function( title, url, callbackfunction ) {
	this.addFact( title, 'DataExtractedFrom', url, callbackfunction );
};

WTAPI.prototype.removeDataExtractedFrom = function( title, url, callbackfunction ) {
	this.removeFact( title, 'DataExtractedFrom', url, callbackfunction );
};

WTAPI.prototype.createPageWithCategory = function( title, category, callbackfunction ) {
	$j.post(this.apiuri, {
		"action"   : "wtfacts",
		"operation": "newpage",
		"title"    : title,
		"category" : category,
		"format"   : "json",
		"token"    : this.editToken
	}, callbackfunction, "json");
};

WTAPI.prototype.addFact = function( subject, predicate, object, callbackfunction ) {
	$j.post(this.apiuri, {
		"action"   : "wtfacts",
		"operation": "add",
		"title"    : subject,
		"property" : predicate,
		"value"    : object,
		"format"   : "json",
		"token"    : this.editToken
	}, callbackfunction, "json");
};

WTAPI.prototype.removeFact = function( subject, predicate, object, callbackfunction ) {
	$j.post(this.apiuri, {
		"action"   : "wtfacts",
		"operation": "del",
		"title"    : subject,
		"property" : predicate,
		"value"    : object,
		"format"   : "json",
		"token"    : this.editToken
	}, callbackfunction, "json");
};

WTAPI.prototype.getFacts = function( subject, predicate, object, callbackfunction ) {
	$j.post(this.apiuri, {
		"action"   : "wtfacts",
		"operation": "show",
		"title"    : subject,
		"format"   : "json"
	}, callbackfunction, "json");
};

WTAPI.prototype.getSuggestions = function( search, type, callbackfunction ) {
	$j.post(this.apiuri, {
		"action"   : "wtsuggest",
		"type"     : type,
		"search"   : search,
		"format"   : "json"
	}, callbackfunction, "json");
};

WTAPI.prototype.setToken = function() {
	var me = this;
	$j.getJSON(this.apiuri, {
		"action"   : "query",
		"prop"     : "info",
		"intoken"  : "edit",
		"titles"   : this.title,
		"format"   : "json"
	}, function(result) {
		for (i in result.query.pages)
			me.editToken =  result.query.pages[i].edittoken;
	});
};

