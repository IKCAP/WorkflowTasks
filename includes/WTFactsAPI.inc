<?php
/**
 * API for adding and removing SMW Property Values to a Title
 * 
 * @ingroup WorkflowTasks
 * @addtogroup API
 * @author varun
 */

global $ontNS;
//$ontNS = "http://wings.isi.edu/ontology/opmv/";
$ontNS = "http://www.opmw.org/ontology/";

class WTFactsAPI extends ApiBase {
	private $facts = array();
	private $newdetails = null;

	public function __construct($query, $moduleName) {
		parent :: __construct($query, $moduleName);
	}

	public function execute() {
		$params = $this->extractRequestParams();
		$error = '';
		$text = '';
		
		$op = $params['operation'];
		if (is_null($op))
			$this->dieUsage('Must specify operation', 'unspecified_operation');

		$title = $params['title'];
		if (is_null($title)) $this->dieUsage('Must specify page title', 'unspecified_title');

		$property = $params['property'];
		$value = $params['value'];
		$type = $params['type'];

		if ($op === 'newpage') {
			$category = $params['category'];
			if (is_null($category)) $this->dieUsage('Must specify category', 'unspecified_category');
			list($error, $text) = WTFactsAPI::createPageWithCategory($title, $category);
		} elseif ($op === 'show') {
			list($error, $this->facts, $text) = WTFactsAPI::getFacts($title);
		} elseif ($op === 'add') {
			if (is_null($property)) $this->dieUsage('Must specify property', 'unspecified_property');
			if (is_null($value)) $this->dieUsage('Must specify value', 'unspecified_value');
			list($error, $text, $data, $this->newdetails) = WTFactsAPI::addFact($title, $property, $value, $type);
			list($error2, $this->facts, $text2) = WTFactsAPI::getFacts($title, $data);
		} elseif ($op === 'del') {
			if (is_null($property)) $this->dieUsage('Must specify property', 'unspecified_property');
			if (is_null($value)) $this->dieUsage('Must specify value', 'unspecified_value');
			list($error, $text, $data) = WTFactsAPI::delFact($title, $property, $value, $type);
			list($error2, $this->facts, $text2) = WTFactsAPI::getFacts($title, $data);
		}
		
		if ($error === '')
			$error = 'UnknownOperation';
		
		$result=array();
		$result['result']=$error;
		$result['operation']=$op;
		if ($title) $result['page'] = $title;
		if ($text) $result['text'] = $text;
		foreach($this->facts as $prop => $values) {
			$this->getResult()->setIndexedTagName( $this->facts[$prop], 'value');
		}
		$result['facts'] = $this->facts;

		if($this->newdetails) {
			$result['newdetails'] = $this->newdetails;
		}

		$this->getResult()->addValue(null, 'wtfacts', $result);
	}

	public static function getDVText($dataValue) {
		$text = $dataValue->getShortText(null);
		return $text;
	}

	public static function getDIText($di) {
		switch ( $di->getDIType() ) {
			case SMWDataItem::TYPE_TIME:
				return date(DateTime::ISO8601, $di->getMwTimestamp());
			case SMWDataItem::TYPE_NUMBER:
				return $di->getNumber();
			case SMWDataItem::TYPE_URI:
				return $di->getURI();
			case SMWDataItem::TYPE_WIKIPAGE:
				return $di->getDBKey();
			default:
				return $di->getSerialization();
		}
	}
	
	public static function getDVDetails($dv, $di) {
		$text = WTFactsAPI::getDVText($dv);
		$val = WTFactsAPI::getDIText($di);
		$type = get_class($di);
		$type = str_replace("SMWDI","", $type);
		$key = ($type=="WikiPage") ? $di->getDbKey() : "";
		$exists = ($type=="WikiPage") ? $di->getTitle()->exists() : "";
		return array("val"=>$val, "text"=>$text, "type"=>$type, "key"=>$key, "exists"=>$exists);
	}

	public static function setFactAuthors($title, $facts, $data) {
		$dbr = wfGetDB( DB_SLAVE );
		$titObj = Title::newFromText($title);
		$title = $titObj->getDbKey();
		$props = $data->getProperties();
		$res = $dbr->query(
			"SELECT rev_user_text, rev_user, rev_comment FROM revision a LEFT JOIN page b ON a.rev_page=b.page_id WHERE page_title='$title' AND rev_comment LIKE 'Added PropertyValue%' ORDER BY rev_timestamp DESC"
		);
		$auths = array();
		if( $res && $dbr->numRows( $res ) > 0 ) {
			while( $row = $dbr->fetchObject( $res ) ) {
				if(preg_match("/Added PropertyValue: (.+) = (.+)\s*$/", $row->rev_comment, $m)) {
					$prop = ucfirst(preg_replace('/\s/','_',$m[1]));
					$propDI = array_key_exists($prop, $props) ? $props[$prop] : null;
					if(!$propDI) continue;
					$sprop = strtolower($prop);
					$val = $m[2];
					$val = preg_replace("/^http:\/?\/?/i", "", $val);
					$val = preg_replace("/^mailto:/i", "", $val);
					$valDV = SMWDataValueFactory::newTypeIdValue ($propDI->findPropertyTypeId(), $val);
					$val = WTFactsAPI::getDIText($valDV->getDataItem());
					$val = strtolower($val);
					$val = preg_replace("/\/$/", "", $val);
					$val = preg_replace("/ /", "_", $val);
					if(array_key_exists("$sprop||$val", $auths) && $auths["$sprop||$val"]) 
						continue;
					$user = $row->rev_user > 0 ? $row->rev_user_text : 'Anonymous';
					$auths["$sprop||$val"] = $user;
				}
			}
		}

		$newfacts = array();
		foreach($facts as $prop=>$pd) {
			$sprop = preg_replace("/ /", "_", strtolower($prop));
			$newvals = array();
			foreach($pd["values"] as $valobj) {
				$val = strtolower($valobj["val"]);
				//$val = preg_replace("/^http:\/?\/?/i", "", $val);
				//$val = preg_replace("/^mailto:/i", "", $val);
				$val = preg_replace("/\/$/", "", $val);
				$val = preg_replace("/ /", "_", $val);
				$author = $auths["$sprop||$val"];
				$valobj["author"] = $author ? $author: 'Anonymous';
				$newvals[] = $valobj;
			}
			$newfacts[$prop] = array("exists"=>$pd["exists"], "values"=>$newvals);
		}

		return $newfacts;
	}

	public static function getFacts($title, $data=null) {
		$blacklist = array("Answer", "SubTask", "Answered", "Workflow", 
				"WorkflowDataVariable", "WorkflowParamVariable", "WorkflowProcessVariable",
				"WorkflowContributor", "WorkflowDataArtifact", "WorkflowInputDataArtifact", 
				"WorkflowParamArtifact", "WorkflowProcess", "ExecutedWorkflow", "WorkflowCreatedIn", 
				"WorkflowEndTime", "WorkflowExecutedIn", "WorkflowStartTime", "WorkflowStatus",
				"WorkflowTemplate", "WorkflowWingsTemplate", "WorkflowWingsExecution",
				"WorkflowUser", "WorkflowRunImage", "WorkflowTemplateImage", "DataHasLocation",
				"DataHasPubbyLink", "DataHasType", "DataUsedForVariable");
		$facts = array();
		if(!$data) {
			$store = &smwfGetStore();
			$titObj = Title::newFromText($title);
			$subject = SMWDIWikiPage::newFromTitle( $titObj );
			$data = $store->getSemanticData( $subject );
		}

		$props = $data->getProperties();
		foreach($props as $prop) {
			$pkey = $prop->getKey();
			if($pkey[0] == "_") continue;
			if(in_array($prop->getLabel(), $blacklist)) continue;
			$ptitle = Title::newFromText("Property:".$pkey);
			$propexists = $ptitle->exists();
			if($prop->getLabel()) {
				$valobjs = $data->getPropertyValues($prop);
				$vals = array();
				foreach ( $valobjs as $di ) {
					$dv = SMWDataValueFactory::newDataItemValue( $di, $prop );
					$vals[] = WTFactsAPI::getDVDetails($dv, $di);
				}
				$facts[$prop->getLabel()] = array("exists"=>$propexists, "values"=>$vals);
			}
		}

		$facts = WTFactsAPI::setFactAuthors($title, $facts, $data);
		return array( "Success", $facts, "Facts for $title");
	}

	public static function addFact($title, $property, $value, $type=null, $create_prop=true) {
		$ptitle = Title::newFromText("Property:".$property);
		if(!$ptitle->exists() && $create_prop) {
			$type = WTFactsAPI::guessValueType($value);
			$text = "Property type: [[has type::$type]]\n";
			$summary = "Creating new Property";
			WTFactsAPI::createWikiPage("Property:$property", $text, $summary);
		}

		$store = &smwfGetStore();
		$subTitle = Title::newFromText($title);
		$subject = SMWDIWikiPage::newFromTitle( $subTitle );
		$data = $store->getSemanticData( $subject );

		$propDI = SMWDIProperty::newFromUserLabel( $property );
		$valDV = SMWDataValueFactory::newPropertyObjectValue( $propDI, $value );
		$valDI = $valDV->getDataItem();

		$data = WTFactsAPI::addPropValToData($subject, $data, $propDI, $valDI);

		if($property == "Workflow") {
			$data = WTFactsAPI::addFactsFromWorkflowPage($title, $subject, $data, $value);
			$summary = "Added Workflow Properties from $value";
			$ret = WTFactsAPI::updateWiki($title, $summary, $data);

			$wflow = new Workflow(Title::newFromText($title));
			$ret[] = $wflow->getPageDetails();
		}
		else if($property == "ExecutedWorkflow") {
			$data = WTFactsAPI::addFactsFromExecutedWorkflowPage($title, $subject, $data, $value);
			$summary = "Added Executed Workflow Properties from $value";
			$ret = WTFactsAPI::updateWiki($title, $summary, $data);

			$wflow = new ExecutedWorkflow(Title::newFromText($title));
			$ret[] = $wflow->getPageDetails();
		}
		else {
			$summary = "Added PropertyValue: $property = $value";
			$ret = WTFactsAPI::updateWiki($title, $summary, $data);

			if($property == "SubTask") {
				$task = new Task(Title::newFromText($value));
				$ret[] = $task->getPageDetails();
			}
			else if($property == "Answer") {
				$antitle = Title::newFromText($value);
				$item = array("text"=>$antitle->getText(), 
							"exists"=>$antitle->exists(), 
							"key"=>$antitle->getDbKey());
				$ret[] = array("item"=>$item);
			}
			else if($property == "DataLocation") {
				$page = new WTUserDescribedData(Title::newFromText($title));
				$ret[] = $page->getPageDetails();
			}
			else if($property == "DataWikiLocation") {
				$page = new WTUserProvidedData(Title::newFromText($title));
				$ret[] = $page->getPageDetails();
			}
		}
		return $ret;
	}

	public static function delFact($title, $property, $value, $type=null) {
		$store = &smwfGetStore();
		$subTitle = Title::newFromText($title);
		$subject = SMWDIWikiPage::newFromTitle( $subTitle );
		$data = $store->getSemanticData( $subject );

		$propDI = SMWDIProperty::newFromUserLabel( $property );
		$valDV = SMWDataValueFactory::newPropertyObjectValue( $propDI, $value );
		$valDI = $valDV->getDataItem();

		if($property == "Workflow") {
			$props = array("Workflow", "WorkflowDataVariable", "WorkflowParamVariable", 
				"WorkflowContributor", "WorkflowProcessVariable", "WorkflowTemplateImage",
				"WorkflowWingsTemplate", "WorkflowCreatedIn");
			foreach($props as $prop) {
				$propDI = SMWDIProperty::newFromUserLabel( $prop );
				$data = WTFactsAPI::removePropValsFromData($subject, $data, $propDI);
			}
			$summary = "Removed Workflow Properties from $value";
			return WTFactsAPI::updateWiki($title, $summary, $data);
		}
		if($property == "ExecutedWorkflow") {
			$props = array("ExecutedWorkflow", "WorkflowEndTime", "WorkflowExecutedIn", 
				"WorkflowStartTime", "WorkflowStatus", "WorkflowTemplate", 
				"WorkflowWingsExecution", "WorkflowUser", "WorkflowDataArtifact", "WorkflowInputDataArtifact",
				"WorkflowParamArtifact", "WorkflowProcess", "WorkflowTemplateImage", "WorkflowRunImage");

			$datasets = array();
			$dataProp = SMWDIProperty::newFromUserLabel("WorkflowDataArtifact");
			$idataProp = SMWDIProperty::newFromUserLabel("WorkflowInputDataArtifact");
			$dataitems = $data->getPropertyValues($dataProp);
			$idataitems = $data->getPropertyValues($idataProp);
			$dataitems = array_merge($dataitems, $idataitems);
			foreach($dataitems as $di) {
				$dtitle = Title::newFromText($di->getDbKey());
				if($dtitle->exists()) $datasets[] = $di->getDbKey();
			}
			foreach($props as $prop) {
				$propDI = SMWDIProperty::newFromUserLabel( $prop );
				$data = WTFactsAPI::removePropValsFromData($subject, $data, $propDI);
			}
			$summary = "Removed Executed Workflow Properties from $value";
			$ret = WTFactsAPI::updateWiki($title, $summary, $data);
			WTFactsAPI::removeOrphanDatasetPages($datasets, $dataProp);
			WTFactsAPI::removeOrphanDatasetPages($datasets, $idataProp);
			return $ret;
		}
		else {
			$data = WTFactsAPI::removePropValFromData($subject, $data, $propDI, $valDI);
			$summary = "Deleted PropertyValue: $property = $value";
			return WTFactsAPI::updateWiki($title, $summary, $data);
		}
	}

	public static function addFactsMultiple($title, $pvarray, $create_prop=true) {
		$store = &smwfGetStore();
		$subTitle = Title::newFromText($title);
		$subject = SMWDIWikiPage::newFromTitle( $subTitle );
		$data = $store->getSemanticData( $subject );

		//$summaries = array();
		foreach($pvarray as $pv) {
			$property = $pv["prop"];
			$value = $pv["value"];
			$ptitle = Title::newFromText("Property:".$property);
			$type = null;
			if(!$ptitle->exists() && $create_prop) {
				$type = WTFactsAPI::guessValueType($value);
				$text = "Property type: [[has type::$type]]\n";
				$summary = "Creating new Property";
				WTFactsAPI::createWikiPage("Property:$property", $text, $summary);
			}

			if(preg_match('/^http[s]?:\/\//', $value))
				$value = preg_replace('/^http[s]?:\/\//', '', $value);

			$propDI = SMWDIProperty::newFromUserLabel( $property );
			$valDV = SMWDataValueFactory::newPropertyObjectValue( $propDI, $value );
			$valDI = $valDV->getDataItem();
			$data = WTFactsAPI::addPropValToData($subject, $data, $propDI, $valDI);

			$summary = "Added PropertyValue: $property = $value";
			$ret = WTFactsAPI::updateWiki($title, $summary, $data);
			//$summaries[] = "Added PropertyValue: $property = $value";
		}
		//$summary = "Added Multiple PropertyValues";
		//$ret = WTFactsAPI::updateWiki($title, $summaries, $data);
		return $ret;
	}


	/* --- private methods --- */
	private static function addPropValToData($subject, $data, $propDI, $valDI) {
		$valDI = WTFactsAPI::fixDI($valDI);
		/*$newdata = new SMWSemanticData($subject);
		foreach ( $data->getProperties() as $property ) {
			$values = $data->getPropertyValues( $property );
			foreach ( $values as $dataItem ) {
				$newdata->addPropertyObjectValue( $property, $dataItem );
			}
		}*/
		$data->addPropertyObjectValue( $propDI, $valDI );
		return $data;
	}

	// FIXME: Hack to fix hierpart for URIs
	private static function fixDI($valDI) {
		if($valDI->getDIType() != SMWDataItem::TYPE_URI) return $valDI;
		if($valDI->getScheme() == "http" || $valDI->getScheme() == "https") {
			$hierpart = preg_replace('/^\/\//', '', $valDI->getHierpart());
			$valDI = new SMWDIUri($valDI->getScheme(), 
							$hierpart, 
							$valDI->getQuery(), 
							$valDI->getFragment());
		}
		return $valDI;
	}

	private static function removePropValFromData($subject, $data, $propDI, $valDI) {
		$valDI = WTFactsAPI::fixDI($valDI);
		$newdata = new SMWSemanticData($subject);
		foreach ( $data->getProperties() as $pDI ) {
			$values = $data->getPropertyValues( $pDI );
			foreach ( $values as $vDI ) {
				if($propDI != $pDI || $valDI != $vDI)
					$newdata->addPropertyObjectValue( $pDI, $vDI );
			}
		}
		return $newdata;
	}

	private static function removePropValsFromData($subject, $data, $propDI) {
		$newdata = new SMWSemanticData($subject);
		foreach ( $data->getProperties() as $pDI ) {
			if($propDI->getKey() != $pDI->getKey()) {
				$values = $data->getPropertyValues( $pDI );
				foreach ( $values as $vDI )
					$newdata->addPropertyObjectValue( $pDI, $vDI );
			}
		}
		return $newdata;
	}

	private static function getPValue($arr, $key) {
		if(array_key_exists($key, $arr))
			return $arr[$key];
		return null;
	}

	private static function addFactsFromWorkflowPage($title, $subject, $data, $url) {
		global $IP;
		global $ontNS;
		include_once( "$IP/lib/arc2/ARC2.php" );

		$url = preg_replace("/export\/resource/", "export/page/resource", $url);
		$objuri = preg_replace("/page\/resource/", "resource", $url);
		$rdfuri = preg_replace("/page\/resource/", "data/resource", $url);
		$rdfuri = $rdfuri."?output=xml&all=1";
		$parser = ARC2::getRDFParser();
		$parser->parse( $rdfuri );
		$index = $parser->getSimpleIndex();
		$pvals = $index[$objuri];
		$processes = WTFactsAPI::getPValue($pvals, "http://openprovenance.org/model/opmo#hasProcess");
		$artifacts = WTFactsAPI::getPValue($pvals, "http://openprovenance.org/model/opmo#hasArtifact");
		$contributors = WTFactsAPI::getPValue($pvals, "http://purl.org/dc/terms/contributor");
		$timages = WTFactsAPI::getPValue($pvals, $ontNS."hasTemplateDiagram");
		$tfiles = WTFactsAPI::getPValue($pvals, $ontNS."hasNativeSystemTemplate");
		$tfile = $tfiles ? $tfiles[0] : null;
		$csys = WTFactsAPI::getPValue($pvals, $ontNS."createdInWorkflowSystem");

		foreach($contributors as $uri) 
			$data = WTFactsAPI::addPV($subject, $data, "WorkflowContributor", "_uri", $uri);
		foreach ($timages as $timage) 
			$data = WTFactsAPI::addPV($subject, $data, "WorkflowTemplateImage", "_uri", $timage);
		if($tfile)
			$data = WTFactsAPI::addPV($subject, $data, "WorkflowWingsTemplate", "_uri", $tfile);
		if($csys) 
			foreach ($csys as $cs) 
				$data = WTFactsAPI::addPV($subject, $data, "WorkflowCreatedIn", "_uri", $cs);

		//print_r($index);
		foreach($index as $key=>$val) {
			#$templates = $val["http://www.opmw.org/ontology/template"];
			#if($templates && in_array($objuri, $templates)) {
				$types = WTFactsAPI::getPValue($val, "http://www.w3.org/1999/02/22-rdf-syntax-ns#type");
				if(!$types) continue;
				if(in_array($ontNS."WorkflowTemplateArtifact", $types)) {
					if(in_array($ontNS."ParameterVariable", $types)) {
						$data = WTFactsAPI::addPV($subject, $data, "WorkflowParamVariable", "_uri", $key);
					}
					else { //if(in_array($ontNS."DataVariable", $types))
						$data = WTFactsAPI::addPV($subject, $data, "WorkflowDataVariable", "_uri", $key);
					}
					//print "Artifact: $key\n";
				}
				else if(in_array($ontNS."WorkflowTemplateProcess", $types)) {
					//print "Process: $key\n";
					$data = WTFactsAPI::addPV($subject, $data, "WorkflowProcessVariable", "_uri", $key);
				}
			#}
		}
		return $data;
	}

	private static function addFactsFromExecutedWorkflowPage($title, $subject, $data, $url) {
		global $IP;
		global $ontNS;
		include_once( "$IP/lib/arc2/ARC2.php" );

		set_time_limit (0);

		$url = preg_replace("/export\/resource/", "export/page/resource", $url);
		$objuri = preg_replace("/page\/resource/", "resource", $url);
		$rdfuri = preg_replace("/page\/resource/", "data/resource", $url);
		$rdfuri = $rdfuri."?output=xml&all=1";
		$parser = ARC2::getRDFParser();
		$parser->parse( $rdfuri );
		$index = $parser->getSimpleIndex();
		$pvals = $index[$objuri];

		$startTime = $pvals[$ontNS."overallStartTime"][0];
		$endTime = $pvals[$ontNS."overallEndTime"][0];
		$status = $pvals[$ontNS."hasStatus"][0];
		$efile = $pvals[$ontNS."hasOriginalLogFile"][0];
		$tpage = $pvals[$ontNS."correspondsToTemplate"][0];
		$esys = $pvals[$ontNS."executedInWorkflowSystem"];
		$timages = $pvals[$ontNS."hasTemplateDiagram"];
		$rimages = $pvals[$ontNS."hasExecutionDiagram"];
		#$tfile = $pvals[$ontNS."hasOriginalTemplate"][0];
		#$csys = $pvals[$ontNS."createdInWorkflowSystem"];

		set_time_limit (0);

		if($startTime)
			$data = WTFactsAPI::addPV($subject, $data, "WorkflowStartTime", "_num", strtotime($startTime));
		if($endTime)
			$data = WTFactsAPI::addPV($subject, $data, "WorkflowEndTime", "_num", strtotime($endTime));
		if($status)
			$data = WTFactsAPI::addPV($subject, $data, "WorkflowStatus", "_str", $status);
		if($efile)
			$data = WTFactsAPI::addPV($subject, $data, "WorkflowWingsExecution", "_uri", $efile);
		if($tpage)
			$data = WTFactsAPI::addPV($subject, $data, "WorkflowTemplate", "_uri", $tpage);
		if($esys)
			foreach ($esys as $es) 
				$data = WTFactsAPI::addPV($subject, $data, "WorkflowExecutedIn", "_uri", $es);
		if($timages)
			foreach ($timages as $timage) 
				$data = WTFactsAPI::addPV($subject, $data, "WorkflowTemplateImage", "_uri", $timage);
		if($rimages)
			foreach ($rimages as $rimage) 
				$data = WTFactsAPI::addPV($subject, $data, "WorkflowRunImage", "_uri", $rimage);
		#if($tfile)
		#	$data = WTFactsAPI::addPV($subject, $data, "WorkflowWingsTemplate", "_uri", $tfile);
		#if($csys) 
		#	foreach ($csys as $cs) 
		#		$data = WTFactsAPI::addPV($subject, $data, "WorkflowCreatedIn", "_uri", $cs);

		$ip_datasets = array();
		$op_datasets = array();
		$params = array();
		$procs = array();

		foreach($index as $key=>$val) {
			//$accounts = $val["http://openprovenance.org/model/opmo#account"];
			//if($accounts && in_array($objuri, $accounts)) {
				if(!array_key_exists("http://www.w3.org/1999/02/22-rdf-syntax-ns#type", $val)) 
					continue;
				$types = $val["http://www.w3.org/1999/02/22-rdf-syntax-ns#type"];
				if(!$types) continue;
				if(in_array($ontNS."WorkflowExecutionArtifact", $types)) {
					if(array_key_exists($ontNS."hasLocation", $val)) {
						if(array_key_exists("http://purl.org/net/opmv/ns#wasGeneratedBy", $val)) {
							$op_datasets[] = $key;
							$name = $val[$ontNS."hasFileName"][0];;
							$data = WTFactsAPI::addPV($subject, $data, "WorkflowDataArtifact", "_wpg", $name);
						} else {
							$ip_datasets[] = $key;
							$name = $val[$ontNS."hasFileName"][0];;
							$data = WTFactsAPI::addPV($subject, $data, "WorkflowInputDataArtifact", "_wpg", $name);
						}
					} else{
						$params[] = $key;
						$data = WTFactsAPI::addPV($subject, $data, "WorkflowParamArtifact", "_uri", $key);
					}
				}
				else if(in_array($ontNS."WorkflowExecutionProcess", $types)) {
					$procs[] = $key;
					$data = WTFactsAPI::addPV($subject, $data, "WorkflowProcess", "_uri", $key);
					//$name = preg_replace("/.+(#|\/)/", "", $key);
					//$data = WTFactsAPI::addPV($subject, $data, "WorkflowProcess", "_wpg", $name);
				}
				else if(in_array("http://purl.org/net/opmv/ns#Agent", $types)) {
					$data = WTFactsAPI::addPV($subject, $data, "WorkflowUser", "_uri", $key);
				}
			//}
		}
		$datasets = array_merge($ip_datasets, $op_datasets);
		$dsmapping = WTFactsAPI::createDatasetPages($datasets, $index);
		//print_r($procs);
		//print_r($datasets);
		//WTFactsAPI::createProcessPages($procs, $index, $dsmapping);

		return $data;
	}

	private static function createDatasetPages($datasets, $index) {
		global $ontNS;
		$dsmapping = array();

		$import_blacklist = array(
			"http://openprovenance.org/model/opmo#account",
			"http://www.w3.org/2000/01/rdf-schema#label"
		);
		foreach($datasets as $dset) {
			$info = $index[$dset];
			$dsname = preg_replace("/.+(#|\/)/", "", $dset);
			$dsfile = $dsname;

			$pvals = array();
			$varusage = null;
			foreach($info as $purl=>$vals) {
				if($purl == "http://www.w3.org/1999/02/22-rdf-syntax-ns#type") {
					foreach($vals as $val) {
						$vname = preg_replace("/.+(#|\/)/", "", $val);
						if($vname != "WorkflowExecutionArtifact" && $vname != "Artifact") 
							$pvals[] = array("prop"=>"DataHasType", "value"=>$vname);
					}
				}
				else if($purl == $ontNS."hasLocation") 
					$pvals[] = array("prop"=>"DataHasLocation", "value"=>$vals[0]);
				else if($purl == $ontNS."correspondsToTemplateArtifact") {
					foreach($vals as $val) {
						$val = preg_replace('/.+\//', '', $val);
						$varusage = $val;
						$pvals[] = array("prop"=>"DataUsedForVariable", "value"=>$val);
					}
				}
				else if($purl == $ontNS."hasFileName")
					$dsfile = preg_replace("/.+(#|\/)/", "", $vals[0]);
				else if(strpos($purl, "ontology/wasGeneratedBy_") !== FALSE) 
					continue;
				else if(!in_array($purl, $import_blacklist)) {
					$pname = preg_replace("/.+(#|\/)/", "", $purl);
					foreach($vals as $val) 
						$pvals[] = array("prop"=>$pname, "value"=>$val);
				}
			}
			//$pvals[] = array("prop"=>"DataHasPubbyLink", "value"=>$dset);

			// Create Dataset Page
			$dstitle = Title::newFromText($dsfile);
			if(!$dstitle->exists()) {
				$text = "[[Category:Data]]\n";
				$summary = "Creating new Dataset";
				WTFactsAPI::createWikiPage($dsfile, $text, $summary);
				WTFactsAPI::addFactsMultiple($dsfile, $pvals, true);
			}
			else {
				if($varusage) WTFactsAPI::addFact($dsfile, "DataUsedForVariable", $varusage);
				//WTFactsAPI::addFact($dsfile, "DataHasPubbyLink", $dset);
			}

			$dsmapping[$dsname] = $dsfile;
			/*print "\n$dsfile\n";
			foreach($pvals as $pval) {
				print "\t".$pval["prop"]." = ".$pval["value"]."\n";
			}*/
		}
		return $dsmapping;
	}

	// Remove datasets who don't have any page with the property pointing to them
	private static function removeOrphanDatasetPages($datasets, $propDI) {
		$store = &smwfGetStore();
		foreach($datasets as $dset) {
			$dstitle = Title::newFromText($dset);
			$dsitem = SMWDIWikiPage::newFromTitle( $dstitle );
			$subjs = $store->getPropertySubjects($propDI, $dsitem);
			if(!sizeof($subjs)) {
				// Remove Dataset Page if no pages point to it
				WTFactsAPI::deleteWikiPage($dset, "Removing dataset as the workflow pointing to it was removed");
			}
		}
	}

	private static function createProcessPages($procs, $index, $dsmapping) {
		$import_blacklist = array(
			"http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
			"http://openprovenance.org/model/opmo#account"
		);
		foreach($procs as $proc) {
			$info = $index[$proc];
			$procname = preg_replace("/.+(#|\/)/", "", $proc);
			$proclabel = "";

			$pvals = array();
			foreach($info as $purl=>$vals) {
				if($purl == "http://purl.org/net/opmv/ns#used") {
					foreach($vals as $val) {
						$vname = preg_replace("/.+(#|\/)/", "", $val);
						$dsname = array_key_exists($vname, $dsmapping) ? $dsmapping[$vname] : $vname;
						$pvals[] = array("prop"=>"usedDataset", "value"=>$dsname);
					}
				}
				else if($purl == "http://www.w3.org/2000/01/rdf-schema#label") 
					$proclabel = $vals[0];
				else if(strpos($purl, "ontology/used_") !== FALSE) 
					continue;
				else if(!in_array($purl, $import_blacklist)) {
					$pname = preg_replace("/.+(#|\/)/", "", $purl);
					foreach($vals as $val) 
						$pvals[] = array("prop"=>$pname, "value"=>$val);
				}
			}
			print "\n$procname\n";
			print "/* $proclabel */\n";
			foreach($pvals as $pval) {
				print "\t".$pval["prop"]." = ".$pval["value"]."\n";
				//$proctitle = Title::newFromText($procname);
				//print $proctitle->exists()."\n";
			}
		}
	}

	private static function addPV($subject, $data, $prop, $ptype, $val) {
		$propDI = SMWDIProperty::newFromUserLabel( $prop );
		$valDV = SMWDataValueFactory::newTypeIdValue ($ptype, $val);
		$data = WTFactsAPI::addPropValToData($subject, $data, $propDI, $valDV->getDataItem());
		return $data;
	}

	private static function updateWiki($title, $summary, $data) {
		$article = new Article(Title::newFromText($title));
		$text = $article->getContent();
		$doc = new POMPage($text);

		$facts = null;
		$setobj = array_key_exists('#set', $doc->templates) ? $doc->templates['#set'] : null;
		if($setobj && is_array($setobj)) {
			$facts = $setobj[0];
			while($facts->getParametersCount())
				$facts->removeParameterByNumber(0);
		}
		else {
			$facts = new POMTemplate("{{#set:}}");
			$doc->addChild(new POMTextNode("\n"));
			$doc->addChild(new POMComment("<!-- Add any wiki Text above this Line -->"));
			$doc->addChild(new POMTextNode("\n"));
			$doc->addChild(new POMComment("<!-- Do NOT Edit below this Line -->"));
			$doc->addChild(new POMTextNode("\n"));
			$doc->addChild($facts);
			$doc->addChild(new POMTextNode("\n"));
		}

		foreach ( $data->getProperties() as $property ) {
			$values = $data->getPropertyValues( $property );
			$propkey = $property->getKey();
			if($propkey[0] == "_") continue;
			//print "$propkey = ".implode(array_map("WTFactsAPI::getDIText", $values), ",")."\n";
			foreach ( array_unique($values, SORT_REGULAR) as $dataItem ) {
				$facts->addParameter( "\n  ".$property->getLabel(), WTFactsAPI::getDIText($dataItem)."  " );
			}
		}

		$newtext = $doc->asString();
		//print "$newtext\n";
		if(strpos($newtext, "{{#set}}") !== false) {
			$newtext = str_replace("{{#set}}", "{{#set:}}", $newtext);
		}

		// If summary is an array, do multiple edits with all summary items
		if(is_array($summary)) {
			foreach($summary as $sum) {
				$status = $article->doEdit($newtext, $sum);
				if (!$status->isOK()) 
					return array( "Error", "Something went wrong: " . $status->getWikiText(), $data );
			}
			return array( "Success", $summary, $data );
		}
		else {
			$status = $article->doEdit($newtext, $summary);
			if ($status->isOK()) {
				return array( "Success", $summary, $data );
			} else {
				return array( "Error", "Something went wrong: " . $status->getWikiText(), $data );
			}
		}
	}

	private static function guessValueType($value) {
		if(preg_match('/^\d+$/', $value))
			return "Number";
		if(preg_match('/^\d+\.\d+$/', $value))
			return "Number";
		if(preg_match('/^(true|false)$/i', $value))
			return "Boolean";
		if(preg_match("/^http/", $value))
			return "URL";
		if(preg_match("/^.+@.+\..+/", $value))
			return "Email";
		if(preg_match('/^".+"$/', $value))
			return "String";
		if(preg_match("/^'.+'$/", $value))
			return "String";
		return "Page";
	}

	private static function createPageWithCategory($title, $category) {
		$text = "[[Category:$category]]\n";
		$summary = "Creating new page with Category: $category";
		return WTFactsAPI::createWikiPage($title, $text, $summary);
	}

	private static function createWikiPage($title, $text, $summary) {
		$article = new Article(Title::newFromText($title));
		$status = $article->doEdit($text, $summary);
		if ($status->isOK()) {
			return array( "Success", $summary );
		} else {
			return array( "Error", "Something went wrong: " . $status->getWikiText() );
		}
	}

	private static function deleteWikiPage($title, $reason) {
		$article = new Article(Title::newFromText($title));
		$article->doDelete($reason);
	}

	protected function getAllowedParams() {
		return array (
			'operation' => null,
			'title' => null,
			'category' => null,
			'property' => null,
			'value' => null,
			'type' => null
		);
	}

	protected function getParamDescription() {
		return array (
			'operation' => 'Operation to be performed. One of newpage, show, add or del',
			'title' => 'Title of the page (required)',
			'property' => 'Property of the page (required for add, del)',
			'value' => 'Value of the page Property (required for add)',
			'type' => 'Type of the Property value. One of page, number, boolean (optional for add)',
			'category' => 'Category of the new page (required for newpage)'
		);
	}

	protected function getDescription() {
		return 'Shows, adds or removes semantic facts for a page';
	}

	protected function getExamples() {
		return array (
			'api.php?action=wtfacts&operation=show&title=TestSMW&format=json'
		);
	}

	public function getVersion() {
		return __CLASS__ . ': $Id$';
	}
}
