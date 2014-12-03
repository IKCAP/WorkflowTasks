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

	//if (typeof smw_tooltipInit !== 'undefined') smw_tooltipInit();
	//$('#ca-edit').hide();
	//$('a.actionlink').click(function() { return false; });
	
	var wtapi = new WTAPI(wgPageName, wgScriptPath+'/api.php');
	var wtutil = new WTUtil(wgPageName, wtapi);

	// Create sidebar
	var treediv = $('#main-tree-sidebar');
	if(treediv) {
		treediv.detach().appendTo('#p-navigation');
		var wtsidebar = new WTSidebar(wgPageName, allwttree, wtutil, wtapi);
		wtsidebar.display(treediv);
	}

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
	else if(!Object.keys(wtcategories).length) {
		var wtcatchooser = new WTCategoryChooser(wgPageName, wtutil, wtapi);
		var catchooserdiv = $("#category-chooser");
		wtcatchooser.display(catchooserdiv);
	}
	else {
		$("#category-chooser").css('display', 'none');
	}

	if(Object.keys(stdwtprops).length) {
		var wtstdprops = new WTStdProperties(wgPageName, allwtfacts, stdwtprops, wtutil, wtapi);
		var stdpropsdiv = $("#main-std-props");
		wtstdprops.display(stdpropsdiv);
	}
	else {
		$("#main-std-props").css('display', 'none');
	}

	var wtfacts = new WTFacts(wgPageName, allwtfacts, stdwtprops, wtutil, wtapi);
	var factsdiv = $("#main-facts");
	wtfacts.display(factsdiv);

	var wtcredits = new WTCredits(wgPageName, allwtdetails, wtutil, wtapi);
	var creditsdiv = $("#main-credits");
	wtcredits.display(creditsdiv);

});
