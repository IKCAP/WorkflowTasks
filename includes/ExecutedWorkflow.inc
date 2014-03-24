<?php

class ExecutedWorkflow extends Workflow {
	function __construct($title) {
		parent::__construct($title);
	}

	/*function setJavascriptVariables($out) {
		parent::setJavascriptVariables($out);
		$out->addHTML("<script>var wtpagetype = 'ExecutedWorkflow';</script>\n");
	}*/

	function getWorkflow() {
		$details = array(
			'url'=>'', 
			'user'=>'', 
			'starttime'=>'', 
			'endtime'=>'', 
			'status'=>'', 
			'wingsexecutionfile'=>'', 
			'workflowtemplate'=>'', 
			'runimage'=>'', 
			'executedin'=>array(), 
			'inputdatasets'=>array(),
			'datasets'=>array(),
			'parameters'=>array(),
			'processes'=>array()
			//'wingstemplate'=>'', 
			//'createdin'=>'', 
			//'templateimage'=>'', 
		);

		# SMW Initialization 
		$subject = SMWDIWikiPage::newFromTitle( $this->title );

		$url = "";
		$wflowProp = SMWDIProperty::newFromUserLabel('ExecutedWorkflow');
		$wflows = smwfGetStore()->getPropertyValues( $subject, $wflowProp );
		foreach($wflows as $wflow) {
			$url = $this->getUri($wflow);
			break;
		}

		if($url) {
			$idsetProp = SMWDIProperty::newFromUserLabel('WorkflowInputDataArtifact');
			$dsetProp = SMWDIProperty::newFromUserLabel('WorkflowDataArtifact');
			$paramProp = SMWDIProperty::newFromUserLabel('WorkflowParamArtifact');
			$procProp = SMWDIProperty::newFromUserLabel('WorkflowProcess');
			$userProp = SMWDIProperty::newFromUserLabel('WorkflowUser');
			$stimeProp = SMWDIProperty::newFromUserLabel('WorkflowStartTime');
			$etimeProp = SMWDIProperty::newFromUserLabel('WorkflowEndTime');
			$stProp = SMWDIProperty::newFromUserLabel('WorkflowStatus');
			$exinProp = SMWDIProperty::newFromUserLabel('WorkflowExecutedIn');
			$efileProp = SMWDIProperty::newFromUserLabel('WorkflowWingsExecution');
			$tpageProp = SMWDIProperty::newFromUserLabel('WorkflowTemplate');
			$rimageProp = SMWDIProperty::newFromUserLabel('WorkflowRunImage');
			//$crinProp = SMWDIProperty::newFromUserLabel('WorkflowCreatedIn');
			//$tfileProp = SMWDIProperty::newFromUserLabel('WorkflowWingsTemplate');
			//$timageProp = SMWDIProperty::newFromUserLabel('WorkflowTemplateImage');
	
			$idsets = smwfGetStore()->getPropertyValues( $subject, $idsetProp );
			$dsets = smwfGetStore()->getPropertyValues( $subject, $dsetProp );
			$params = smwfGetStore()->getPropertyValues( $subject, $paramProp );
			$procs = smwfGetStore()->getPropertyValues( $subject, $procProp );
			$users = smwfGetStore()->getPropertyValues( $subject, $userProp );
			$stimes = smwfGetStore()->getPropertyValues( $subject, $stimeProp );
			$etimes = smwfGetStore()->getPropertyValues( $subject, $etimeProp );
			$statuses = smwfGetStore()->getPropertyValues( $subject, $stProp );
			$exins = smwfGetStore()->getPropertyValues( $subject, $exinProp );
			$efiles = smwfGetStore()->getPropertyValues( $subject, $efileProp );
			$tpages = smwfGetStore()->getPropertyValues( $subject, $tpageProp );
			$rimages = smwfGetStore()->getPropertyValues( $subject, $rimageProp );
			//$crins = smwfGetStore()->getPropertyValues( $subject, $crinProp );
			//$tfiles = smwfGetStore()->getPropertyValues( $subject, $tfileProp );
			//$timages = smwfGetStore()->getPropertyValues( $subject, $timageProp );

			$details["url"] = $url;
			//foreach($idsets as $idset) 
			//	$details['inputdatasets'][] = $this->getUri($idset);
			//foreach($dsets as $dset) 
			//	$details['datasets'][] = $this->getUri($dset);
			foreach($params as $param) 
				$details['parameters'][] = $this->getUri($param);
			foreach($procs as $proc) 
				$details['processes'][] = $this->getUri($proc);
			foreach($users as $user) 
				$details['user'] = $this->getUri($user);
			foreach($stimes as $stime) 
				$details['starttime'] = $stime->getSortKey();
			foreach($etimes as $etime) 
				$details['endtime'] = $etime->getSortKey();
			foreach($statuses as $status) 
				$details['status'] = $status->getSortKey();
			foreach($exins as $exin) 
				$details['executedin'][] = $this->getUri($exin);
			foreach($efiles as $efile) 
				$details['wingsexecutionfile'] = $this->getUri($efile);
			foreach($tpages as $tpage) {
				$tname = preg_replace('/.+\//','', $this->getUri($tpage));
				$ttitle = Title::newFromText($tname);
				$details['workflowtemplate'] = $ttitle->exists() ? $tname : $this->getUri($tpage);
			}
			foreach($rimages as $rimage) 
				$details['runimage'] = $this->getUri($rimage);

			$details["inputdatasets"] = $this->getVariableDatasetMapping($idsets, $details['workflowtemplate']);
			$details["datasets"] = $this->getVariableDatasetMapping($dsets, $details['workflowtemplate']);

			//foreach($crins as $crin) 
			// $details['createdin'] = $this->getUri($crin);
			//foreach($tfiles as $tfile) 
			//	$details['wingstemplate'] = $this->getUri($tfile);
			//foreach($timages as $timage) 
			//	$details['templateimage'] = $this->getUri($timage);

			return $details;
		}
	}

	function getVariableDatasetMapping($datasets, $tname) {
		$dsVars = array();
		$tname = preg_replace('/.+\//', '', $tname);
		$varProp = SMWDIProperty::newFromUserLabel('DataUsedForVariable');
		foreach($datasets as $dsitem) {
			$ds = $dsitem->getDbKey();
			$dstitle = Title::newFromText($ds);
			$dsubj = SMWDIWikiPage::newFromTitle( $dstitle );
			$vars = smwfGetStore()->getPropertyValues( $dsubj, $varProp );
			foreach($vars as $varitem) {
				$var = $varitem->getDbKey();
				if(!array_key_exists($var, $dsVars)) $dsVars[$var] = array();
				$dsVars[$var][] = $ds;
			}
		}
		return $dsVars;
	}
}

