<?php
/**
 * API for adding and removing SMW Property Values to a Title
 * 
 * @ingroup WorkflowTasks
 * @addtogroup API
 * @author varun
 */
class WTSuggestAPI extends ApiBase {

	public function __construct($query, $moduleName) {
		parent :: __construct($query, $moduleName);
	}

	public function execute() {
		$params = $this->extractRequestParams();
		$error = '';
		$text = '';
		
		$type = $params['type'];
		if (is_null($type))
			$this->dieUsage('Must specify type', 'unspecified_type');

		$search = $params['search'];

		$suggestions = array();
		if ($type === 'property') 
			list($error, $suggestions, $text) = WTSuggestAPI::getProperties($search);
		
		if ($error === '')
			$error = 'UnknownType';
		
		$result=array();
		$result['result']=$error;
		$result['type']=$type;
		if ($text) $result['text'] = $text;
		foreach($suggestions as $prop => $values) {
			$this->getResult()->setIndexedTagName( $suggestions[$prop], 'value');
		}
		$result['suggestions'] = $suggestions;
		$this->getResult()->addValue(null, 'wtsuggest', $result);
	}

	public static function getProperties($search) {
		$suggestions = array();
		$main_suggestions = array();
		$extra_suggestions = array();
		$store = &smwfGetStore();

		$propcounts = $store->getPropertiesSpecial();
		foreach($propcounts as $pcount) {
			$prop = $pcount[0];
			$count = $pcount[1];
			$pkey = $prop->getKey();
			if($pkey[0] == "_") continue;
			// FIXME: removing this for efficiency
			//$ptitle = Title::newFromText("Property:".$pkey);
			//$propexists = $ptitle->exists();
			$propexists = true;
			$plabel = $prop->getLabel();
			if($plabel && !preg_match('/^(SubTask|Answer|Workflow)$/', $plabel)) {
				if(!$search) 
					$main_suggestions[] = array("exists"=>$propexists, "label"=>$plabel);
				else if(preg_match("/^$search/i", $plabel))
					$main_suggestions[] = array("exists"=>$propexists, "label"=>$plabel);
				else if(preg_match("/$search/i", $plabel))
					$extra_suggestions[] = array("exists"=>$propexists, "label"=>$plabel);
			}
		}

		$unusedprops = $store->getUnusedPropertiesSpecial();
		foreach($unusedprops as $prop) {
			$plabel = $prop->getLabel();
			if($plabel && 
					!preg_match('/^(SubTask|Answer|Workflow)$/', $plabel) && 
					preg_match("/$search/i", $plabel))
				$extra_suggestions[] = array("exists"=>true, "label"=>$plabel);
		}

		$suggestions = array_merge($main_suggestions, $extra_suggestions);
		return array( "Success", $suggestions, "Properties matching $search");
	}

	protected function getAllowedParams() {
		return array (
			'type' => null,
			'search' => null,
		);
	}

	protected function getParamDescription() {
		return array (
			'type' => 'Type of the Suggestion. One of property, value(unsupported)',
			'search' => 'Partial word to get completions for'
		);
	}

	protected function getDescription() {
		return 'Get Suggestions';
	}

	protected function getExamples() {
		return array (
			'api.php?action=wtsuggest&type=property&format=json&search='
		);
	}

	public function getVersion() {
		return __CLASS__ . ': $Id$';
	}
}
