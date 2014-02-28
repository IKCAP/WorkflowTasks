<?php

$wgExtensionCredits['validextensionclass'][] = array(
	'path' => __FILE__,
	'name' => 'WorkflowTasks',
	'author' =>'Varun Ratnakar', 
	'url' => 'http://www.isi.edu/~varunr/wiki/WorkflowTasks', 
	'description' => 'Uses Semantic Media Wiki. Handles Categories: Task, Answer, Workflow, ExecutedWorkflow, Data, Component',
	'version'  => 0.1,
	);

global $wgDir;
global $wgScriptPath;
$wgAbsDir = dirname(__File__);
$wgDir = $wgScriptPath."/extensions/WorkflowTasks";

$wgAutoloadClasses['WTBase'] = $wgAbsDir . '/includes/WTBase.inc';
$wgAutoloadClasses['Task'] = $wgAbsDir . '/includes/Task.inc';
$wgAutoloadClasses['Answer'] = $wgAbsDir . '/includes/Answer.inc';
$wgAutoloadClasses['Workflow'] = $wgAbsDir . '/includes/Workflow.inc';
$wgAutoloadClasses['ExecutedWorkflow'] = $wgAbsDir . '/includes/ExecutedWorkflow.inc';
$wgAutoloadClasses['WTData'] = $wgAbsDir . '/includes/WTData.inc';
$wgAutoloadClasses['WTUserProvidedData'] = $wgAbsDir . '/includes/WTUserProvidedData.inc';
$wgAutoloadClasses['WTUserDescribedData'] = $wgAbsDir . '/includes/WTUserDescribedData.inc';
$wgAutoloadClasses['WTComponent'] = $wgAbsDir . '/includes/WTComponent.inc';
$wgAutoloadClasses['WTProperty'] = $wgAbsDir . '/includes/WTProperty.inc';
$wgAutoloadClasses['WTMainPage'] = $wgAbsDir . '/includes/WTMainPage.inc';
$wgAutoloadClasses['WTFactsAPI'] = $wgAbsDir . '/includes/WTFactsAPI.inc';
$wgAutoloadClasses['WTSuggestAPI'] = $wgAbsDir . '/includes/WTSuggestAPI.inc';
$wgAutoloadClasses['WTPerson'] = $wgAbsDir . '/includes/WTPerson.inc';

$wgAPIModules['wtfacts'] = 'WTFactsAPI';
$wgAPIModules['wtsuggest'] = 'WTSuggestAPI';

$wgHooks['BeforePageDisplay'][] = 'WTRender';

function WTRender (&$out, &$skin) {
	global $wgRequest, $wgDir;

	$title = $out->getTitle();
	$ns = $title->getNamespace();
	if (($ns !== NS_MAIN && $ns !== NS_USER) && ($ns !== SMW_NS_PROPERTY)) //SMW_NS_TYPE
		return false;

	$action = $wgRequest->getText( 'action' );
	if (($action !== 'view') && ($action !== 'purge') && ($action !== '')) 
		return false;

	$item = null;
	$cats = $out->getCategories();
	$url = $title->getPrefixedURL();

	if ($url === 'Main_Page') {
		$item = new WTMainPage($title);
	}
	else if ($ns === SMW_NS_PROPERTY) {
		$item = new WTProperty($title);
	}
	else if(in_array("Task", $cats)) { 
		$item = new Task($title);
	}
	else if(in_array("Answer", $cats)) {
		$item = new Answer($title);
	}
	else if(in_array("Workflow", $cats)) {
		$item = new Workflow($title);
	}
	else if(in_array("ExecutedWorkflow", $cats)) {
		$item = new ExecutedWorkflow($title);
	}
	else if(in_array("Data", $cats)) {
		$item = new WTData($title);
	}
	else if(in_array("UserProvidedData", $cats)) {
		$item = new WTUserProvidedData($title);
	}
	else if(in_array("UserDescribedData", $cats)) {
		$item = new WTUserDescribedData($title);
	}
	else if(in_array("Component", $cats)) {
		$item = new WTComponent($title);
	}
	else if(in_array("Person", $cats) || ($ns == NS_USER)) {
		$item = new WTPerson($title);
	}
	else {
		$item = new WTBase($title);
	}

	$item->includeJSHeaders($out, $wgDir);
	$item->includeCSSHeaders($out, $wgDir);
	$item->setJavascriptVariables($out);
	$item->modifyWikiPage($out);

	return true;
}


?>
