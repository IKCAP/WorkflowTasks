<?php

class WTBase {
	var $title;

	function __construct($title) {
		$this->title = $title;
	}

	function getItemLink($item) {
		$title = $item->getTitle();
		$url = $title->getInternalURL();
		$text = $title->getText();
		$cls = $title->exists() ? '' : 'new';
		return "<a class='$cls' href='$url'>$text</a>";
	}


	function getContributors($title, $allow_anon=false) {
		$conds['rev_page'] = $title->getArticleId();
		$conds[] = 'rev_deleted & ' . Revision::DELETED_USER . ' = 0';
		if(!$allow_anon) $conds[] = 'rev_user != 0'; 
	
		$contributors = array();
		$dbr = wfGetDB( DB_SLAVE );
		$res = $dbr->select(
			'revision',
			array(
				'COUNT(*) AS count',
				'rev_user',
				'rev_user_text',
			),
			$conds,
			__METHOD__,
			array(
				'GROUP BY' => 'rev_user_text',
				'ORDER BY' => 'count DESC'
			)
		);
		if( $res && $dbr->numRows( $res ) > 0 ) {
			while( $row = $dbr->fetchObject( $res ) )
				$contributors[ $row->rev_user_text ] = array( $row->rev_user, $row->count );
		}
		return $contributors;
	}

	function mergeContributors($c1s, $c2s) {
		$newcs = array_merge($c1s, array_diff_key($c2s, $c1s));
		$intersection = array_intersect_key($c2s, $c1s);
		foreach($intersection as $key=>$val) {
			$newcs[$key][1] += $c2s[$key][1];
		}
		return $newcs;
	}

	public static function compareContributors($a,$b) {
		if($a[1]==$b[1]) return 0; 
		return ($a[1]<$b[1]) ? 1 : -1;
	}

	function getPageDetails($title=null) {
		global $wgAnonCredit;
		if(!$title) $title = $this->title;
		$details = array();
		$details["Contributors"] = $this->getContributors($title, $wgAnonCredit);
		uasort($details["Contributors"], "WTBase::compareContributors");
		return $details;
	}

	function includeJSHeaders($out, $wgDir) {
		$out->includeJQuery();
		//$out->addScriptFile( $wgDir . '/js/jquery/jquery.jeditable.js' );
		$out->addScriptFile( $wgDir . '/js/jquery/jquery.loadmask.min.js' );
		$out->addScriptFile( $wgDir . '/js/jquery/jquery.autocomplete.js' );
		//$out->addScriptFile( $wgDir . '/js/jquery/jquery.translate-NCT,core,NCT-adapter,ui,progress.min.js' );
		//$out->addScriptFile( $wgDir . '/js/jquery/jqModal.js' );

		$out->addScriptFile( $wgDir . '/js/WTAPI.js' );
		$out->addScriptFile( $wgDir . '/js/WTUtil.js' );
		$out->addScriptFile( $wgDir . '/js/WTFacts.js' );
		$out->addScriptFile( $wgDir . '/js/WTCredits.js' );
		$out->addScriptFile( $wgDir . '/js/WTSidebar.js' );
		$out->addScriptFile( $wgDir . '/js/WTCategoryChooser.js' );

		$out->addScriptFile( $wgDir . '/js/WTSubTasks.js' );
		$out->addScriptFile( $wgDir . '/js/WTAnswers.js' );
		$out->addScriptFile( $wgDir . '/js/WTTasks.js' );
		$out->addScriptFile( $wgDir . '/js/WTData.js' );
		$out->addScriptFile( $wgDir . '/js/WTDataColumns.js' );
		$out->addScriptFile( $wgDir . '/js/WTUserProvidedData.js' );
		$out->addScriptFile( $wgDir . '/js/WTUserDescribedData.js' );
		$out->addScriptFile( $wgDir . '/js/WTComponent.js' );
		$out->addScriptFile( $wgDir . '/js/WTPerson.js' );
		$out->addScriptFile( $wgDir . '/js/WTWorkflow.js' );
		$out->addScriptFile( $wgDir . '/js/WTExecutedWorkflow.js' );
		$out->addScriptFile( $wgDir . '/js/main.js' );
	}

	function includeCSSHeaders($out, $wgDir) {
		$out->addExtensionStyle( $wgDir . '/css/jquery/jquery.autocomplete.css' );
		$out->addExtensionStyle( $wgDir . '/css/jquery/jquery.loadmask.css' );
		$out->addExtensionStyle( $wgDir . '/css/wtree.css' );
	}

	function setJavascriptVariables($out) {
		$details = $this->getPageDetails();
		list ($error, $facts, $text) = WTFactsAPI::getFacts($this->title->getFullText());
		$out->addHTML("<script>var allwtfacts = ".json_encode($facts).";</script>\n");
		$out->addHTML("<script>var allwtdetails = ".json_encode($details).";</script>\n");
		$out->addHTML("<script>var allwttree = {};</script>\n");
		$out->addHTML("<script>var wtallcategories = ['Workflow', 'ExecutedWorkflow', 'Task', 'Answer', 'Data', 'UserProvidedData', 'UserDescribedData', 'Component', 'Model', 'Person', 'Object', 'DataType', 'Thing'];</script>\n");
		//$out->addHTML("<script>var wtallcategories = ['UserProvidedData', 'UserDescribedData', 'Person', 'DataType', 'Thing'];</script>\n");
		$out->addHTML("<script>var wtcategories = [];</script>\n");
		$cats = $out->getCategories();
		foreach($cats as $cat) 
			$out->addHTML("<script>wtcategories['$cat'] = true;</script>\n");
	}

	function modifyWikiPage($out) {
		# -- Add the Category Changer
		$this->addCategoryChooserDiv( $out );

		# -- Add a Facts Table
		$this->addFactsDiv( $out );

		# -- Credits Div
		$this->addCreditsDiv( $out );

		# -- Sidebar Div
		$this->addSidebarDiv( $out );
	}

	function addCategoryChooserDiv($out) {
		$out->addHTML("<div id='category-chooser'></div>");
	}

	function addTreeDiv($out, $type) {
		$out->addHTML("<div id='main-tree'></div>");
	}

	function addFactsDiv($out) {
		$out->addHTML("<div id='main-facts'></div>");
	}

	function addSidebarDiv($out) {
		$out->addHTML("<div id='main-tree-sidebar'></div>");
	}

	function addCreditsDiv($out) {
		$out->addHTML("<div id='main-credits'></div>");
	}

	function addAnswersDiv($out) {
		$out->addHTML("<div id='main-answers'></div>");
	}

	function addTasksDiv($out) {
		$out->addHTML("<div id='main-tasks'></div>");
	}

	function addWorkflowDiv($out) {
		$out->addHTML("<div id='main-workflow'></div>");
	}

	function addDataDiv($out) {
		$out->addHTML("<div id='main-data'></div>");
	}

	function addPersonDiv($out) {
		$out->addHTML("<div id='main-person'></div>");
	}

	function addComponentDiv($out) {
		$out->addHTML("<div id='main-comp'></div>");
	}
}

?>
