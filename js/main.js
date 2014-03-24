var lpMsg = function(key) {
	return key;
};

$j(function() {
	//if (typeof smw_tooltipInit !== 'undefined') smw_tooltipInit();
	//$j('#ca-edit').hide();
	//$j('a.actionlink').click(function() { return false; });
	
	var wtapi = new WTAPI(wgPageName, wgScriptPath+'/api.php');
	var wtutil = new WTUtil(wgPageName, wtapi);

	if(wtcategories["Task"]) {
		var wtanswers = new WTAnswers(wgPageName, allwtdetails, wtutil, wtapi);
		var answersdiv = $j("#main-answers");
		wtanswers.display(answersdiv);

		var wtsubs = new WTSubTasks(wgPageName, allwtdetails, wtutil, wtapi);
		var treediv = $j("#main-tree");
		wtsubs.display(treediv);
	}
	else if(wtcategories["Answer"]) {
		var wttasks = new WTTasks(wgPageName, allwtdetails, wtutil, wtapi);
		var tasksdiv = $j("#main-tasks");
		wttasks.display(tasksdiv);
	}
	else if(wtcategories["Workflow"]) {
		var wtworkflow = new WTWorkflow(wgPageName, allwtdetails, wtutil, wtapi);
		var wflowdiv = $j("#main-workflow");
		wtworkflow.display(wflowdiv);
	}
	else if(wtcategories["ExecutedWorkflow"]) {
		var wtworkflow = new WTExecutedWorkflow(wgPageName, allwtdetails, wtutil, wtapi);
		var wflowdiv = $j("#main-workflow");
		wtworkflow.display(wflowdiv);
	}
	else if(wtcategories["Data"]) {
		var wtdata = new WTData(wgPageName, allwtdetails, wtutil, wtapi);
		var datadiv = $j("#main-data");
		wtdata.display(datadiv);
	}
	else if(wtcategories["UserDescribedData"]) {
		var wtdata = new WTUserDescribedData(wgPageName, allwtdetails, wtutil, wtapi);
		var datadiv = $j("#main-data");
		wtdata.display(datadiv);
		datadiv.append('<br/>');
		var wtdatacols = new WTDataColumns(wgPageName, allwtfacts, wtutil, wtapi);
		wtdatacols.display(datadiv);
	}
	else if(wtcategories["UserProvidedData"]) {
		var wtdata = new WTUserProvidedData(wgPageName, allwtdetails, wtutil, wtapi);
		var datadiv = $j("#main-data");
		wtdata.display(datadiv);
		datadiv.append('<br/>');
		var wtdatacols = new WTDataColumns(wgPageName, allwtfacts, wtutil, wtapi);
		wtdatacols.display(datadiv);
	}
	else if(wtcategories["Component"]) {
		var wtcomp = new WTComponent(wgPageName, allwtdetails, wtutil, wtapi);
		var compdiv = $j("#main-comp");
		wtcomp.display(compdiv);
	}
	else if(wtcategories["Person"] || wgNamespaceNumber == 2) {
		var wtperson = new WTPerson(wgPageName, allwtdetails, wtutil, wtapi);
		var persondiv = $j("#main-person");
		wtperson.display(persondiv);
	}
	else {
		var wtcatchooser = new WTCategoryChooser(wgPageName, wtutil, wtapi);
		var catchooserdiv = $j("#category-chooser");
		wtcatchooser.display(catchooserdiv);
	}

	var wtfacts = new WTFacts(wgPageName, allwtfacts, wtutil, wtapi);
	var factsdiv = $j("#main-facts");
	wtfacts.display(factsdiv);

	var wtcredits = new WTCredits(wgPageName, allwtdetails, wtutil, wtapi);
	var creditsdiv = $j("#main-credits");
	wtcredits.display(creditsdiv);

});
