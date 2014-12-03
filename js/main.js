var lpMsg = function(key) {
	return key;
};

$(function() {
    // Custom autocomplete instance.
    $.widget( "app.autocomplete", $.ui.autocomplete, {
        options: { highlightClass: "ui-state-highlight" },
        _renderItem: function( ul, item ) {
            var re = new RegExp( "(" + this.term + ")", "gi" ),
                cls = this.options.highlightClass,
                template = "<span class='" + cls + "'>$1</span>",
                label = item.label.replace( re, template ),
                $li = $( "<li/>" ).appendTo( ul );
            $( "<a/>" ).attr( "href", "#" )
                       .html( label )
                       .appendTo( $li );
            return $li;
        }
    });

	var wtapi = new WTAPI(wgPageName, wgScriptPath+'/api.php');
	var wtutil = new WTUtil(wgPageName, wtapi);

	if(wtcategories["Task"]) {
		var wtanswers = new WTAnswers(wgPageName, allwtdetails, wtutil, wtapi);
		var answersdiv = $("#main-answers");
		wtanswers.display(answersdiv);

		var wtsubs = new WTSubTasks(wgPageName, allwtdetails, wtutil, wtapi);
		var treediv = $("#main-tree");
		wtsubs.display(treediv);
	}
	else if(wtcategories["Procedure"]) {
		$("#main-answers").css('display', 'none');
		var wtsubs = new WTSubTasks(wgPageName, allwtdetails, wtutil, wtapi);
		var treediv = $("#main-tree");
		wtsubs.display(treediv);
	}
	else if(wtcategories["Answer"]) {
		var wttasks = new WTTasks(wgPageName, allwtdetails, wtutil, wtapi);
		var tasksdiv = $("#main-tasks");
		wttasks.display(tasksdiv);
	}
	else if(wtcategories["Workflow"]) {
		var wtworkflow = new WTWorkflow(wgPageName, allwtdetails, wtutil, wtapi);
		var wflowdiv = $("#main-workflow");
		wtworkflow.display(wflowdiv);
	}
	else if(wtcategories["ExecutedWorkflow"]) {
		var wtworkflow = new WTExecutedWorkflow(wgPageName, allwtdetails, wtutil, wtapi);
		var wflowdiv = $("#main-workflow");
		wtworkflow.display(wflowdiv);
	}
	else if(wtcategories["Data"]) {
		var wtdata = new WTData(wgPageName, allwtdetails, wtutil, wtapi);
		var datadiv = $("#main-data");
		wtdata.display(datadiv);
	}
	else if(wtcategories["UserDescribedData"]) {
		var wtdata = new WTUserDescribedData(wgPageName, allwtdetails, wtutil, wtapi);
		var datadiv = $("#main-data");
		wtdata.display(datadiv);
		var wtdatacols = new WTDataColumns(wgPageName, allwtfacts, wtutil, wtapi);
		wtdatacols.display(datadiv);
	}
	else if(wtcategories["UserProvidedData"]) {
		var wtdata = new WTUserProvidedData(wgPageName, allwtdetails, wtutil, wtapi);
		var datadiv = $("#main-data");
		wtdata.display(datadiv);
		var wtdatacols = new WTDataColumns(wgPageName, allwtfacts, wtutil, wtapi);
		wtdatacols.display(datadiv);
	}
	else if(wtcategories["Component"]) {
		var wtcomp = new WTComponent(wgPageName, allwtdetails, wtutil, wtapi);
		var compdiv = $("#main-comp");
		wtcomp.display(compdiv);
	}
	else if(wtcategories["Person"] || wgNamespaceNumber == 2) {
		var wtperson = new WTPerson(wgPageName, allwtdetails, wtutil, wtapi);
		var persondiv = $("#main-person");
		wtperson.display(persondiv);
	}

	var stdpropsdiv = $("#main-std-props");
	var factsdiv = $("#main-facts");
	var creditsdiv = $("#main-credits");
	if(!wtpagenotfound) {
		if(Object.keys(stdwtprops).length) {
			var wtstdprops = new WTStdProperties(wgPageName, allwtfacts, stdwtprops, wtutil, wtapi);
			wtstdprops.display(stdpropsdiv);
		}
		else {
			stdpropsdiv.css('display', 'none');
		}

		var wtfacts = new WTFacts(wgPageName, allwtfacts, stdwtprops, wtutil, wtapi);
		wtfacts.display(factsdiv);

		var wtcredits = new WTCredits(wgPageName, allwtdetails, wtutil, wtapi);
		wtcredits.display(creditsdiv);
	}
	else {
		stdpropsdiv.css('display', 'none');
		factsdiv.css('display', 'none');
		creditsdiv.css('display', 'none');
	}

	// Display category chooser
	//if(!Object.keys(wtcategories).length) {
	var catchooserdiv = $("#category-chooser");
	if(wtpagenotfound) {
		catchooserdiv.html(
			"<div style='padding:5px;color:red;font-weight:bold'>Uh oh, this page doesn't exist yet.</div>");
	}
	if(wtuid) {
		var wtcatchooser = new WTCategoryChooser(wgPageName, wtutil, wtapi);
		wtcatchooser.display(catchooserdiv);
	}
	else if(!wtpagenotfound) {
		wtcatchooser.css('display', 'none');
	}
});
