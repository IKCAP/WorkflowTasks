<?php

class Workflow extends WTBase {
	function __construct($title) {
		parent::__construct($title);
	}

	/*function setJavascriptVariables($out) {
		parent::setJavascriptVariables($out);
		$out->addHTML("<script>var wtpagetype = 'Workflow';</script>\n");
	}*/

	function modifyWikiPage($out) {
		$old = $out->getHTML();
		$out->clearHTML();

		# Workflow Div
		$this->addWorkflowDiv( $out );

		# -- Add Existing Markup Here
		$out->addHTML( $old );

		# -- Add a Facts Table Here
		$this->addFactsDiv( $out );

		# -- Credits Div
		$this->addCreditsDiv( $out );
	}

	public function getPageDetails($title=null) {
		$details = parent::getPageDetails();
		$details["Workflow"] = $this->getWorkflow();
		return $details;
	}

	protected function getUri($di) {
		if($di->getDIType() == SMWDataItem::TYPE_URI)
			return $di->getURI();
		else {
			$url = $di->getTitle();
			return preg_replace('/^http/i', 'http', $url);
		}
	}

	function getWorkflow() {
		$details = array('url'=>'', 
			'contributor'=>'', 
			'wingstemplate'=>'', 
			'templateimage'=>'', 
			'createdin'=>'', 
			'variables'=>array(),
			'processes'=>array(),
			'executions'=>array()
		);

		# SMW Initialization 
		$subject = SMWDIWikiPage::newFromTitle( $this->title );

		$url = "";
		$wflowProp = new SMWDIProperty('Workflow');
		$wflows = smwfGetStore()->getPropertyValues( $subject, $wflowProp );
		foreach($wflows as $wflow) {
			$url = $this->getUri($wflow);
			break;
		}

		if($url) {
			$dvarProp = new SMWDIProperty('WorkflowDataVariable');
			$pvarProp = new SMWDIProperty('WorkflowParamVariable');
			$procProp = new SMWDIProperty('WorkflowProcessVariable');
			$contProp = new SMWDIProperty('WorkflowContributor');
			$timageProp = new SMWDIProperty('WorkflowTemplateImage');
			$tfileProp = new SMWDIProperty('WorkflowWingsTemplate');
			$crinProp = new SMWDIProperty('WorkflowCreatedIn');
			$wtempProp = new SMWDIProperty('WorkflowTemplate');
	
			$dvars = smwfGetStore()->getPropertyValues( $subject, $dvarProp );
			$pvars = smwfGetStore()->getPropertyValues( $subject, $pvarProp );
			$procs = smwfGetStore()->getPropertyValues( $subject, $procProp );
			$contribs = smwfGetStore()->getPropertyValues( $subject, $contProp );
			$timages = smwfGetStore()->getPropertyValues( $subject, $timageProp );
			$tfiles = smwfGetStore()->getPropertyValues( $subject, $tfileProp );
			$crins = smwfGetStore()->getPropertyValues( $subject, $crinProp );

			$tmpurl = preg_replace('/page\//', '', $url);
			$urlDV = SMWDataValueFactory::newTypeIdValue ('_uri', $tmpurl);
			$execs = smwfGetStore()->getPropertySubjects( $wtempProp, $urlDV->getDataItem() );

			$details["url"] = $url;
			foreach($dvars as $dvar) 
				$details['datavariables'][] = $this->getUri($dvar);
			foreach($pvars as $pvar) 
				$details['paramvariables'][] = $this->getUri($pvar);
			foreach($procs as $proc) 
				$details['processes'][] = $this->getUri($proc);
			foreach($contribs as $cont) 
				$details['contributor'] = $this->getUri($cont);
			foreach($timages as $timage) 
				$details['templateimage'] = $this->getUri($timage);
			foreach($tfiles as $tfile) 
				$details['wingstemplate'] = $this->getUri($tfile);
			foreach($crins as $crin) 
				$details['createdin'] = $this->getUri($crin);
			foreach($execs as $exec) 
				$details['executions'][] = $exec->getDbKey();
			return $details;
		}
	}
}

