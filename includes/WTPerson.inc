<?php

class WTPerson extends WTBase {
	function __construct($title) {
		parent::__construct($title);
	}

	/*function setJavascriptVariables($out) {
		parent::setJavascriptVariables($out);
		$out->addHTML("<script>var wtpagetype = 'WTPerson';</script>\n");
	}*/

	function modifyWikiPage($out) {
		$old = $out->getHTML();
		$out->clearHTML();

		# WTPerson Div
		$this->addPersonDiv( $out );

		# -- Add Existing Markup Here
		$out->addHTML( $old );

		# -- Add a Facts Table Here
		$this->addFactsDiv( $out );

		# -- Credits Div
		$this->addCreditsDiv( $out );

		# -- CategoryChooser Div
		$this->addCategoryChooserDiv( $out );
	}

	function getPageDetails() {
		$details = parent::getPageDetails();
		$details["WTPerson"] = $this->getWTPerson();
		return $details;
	}

	function getWTPerson() {
		$details = array(
			'contributions'=>array()
		);
		$userid = "";
		if($this->title->getNamespace() == NS_USER) {
			// If this is a User:[userid] type of page
			$userid = $this->title->getText();
		}
		else {
			// If this is a normal page with Category Person
			$store = &smwfGetStore();
			$subject = SMWDIWikiPage::newFromTitle( $this->title );
			$semdata = $store->getSemanticData( $subject );
			$useridProp = new SMWDIProperty('Has_User_ID');
			$userids = $semdata->getPropertyValues($useridProp);
			foreach($userids as $uidobj) {
				$userid = $uidobj->getString();
				break;
			}
		}

		$details["contributions"] = $this->getRecentContributions( $userid, 1000 );
		return $details;
	}

	function getRecentContributions($user, $limit) {
		$dbr = wfGetDB( DB_SLAVE );
		$res = $dbr->select(
			array( 'revision', 'page' ),
			array( 'page_title', 'page_namespace', 'rev_comment', 'rev_timestamp' ),
			array( "rev_user_text = '$user'"),
			__METHOD__,
			array( 
				'ORDER BY' => "rev_timestamp DESC",
				'LIMIT' => "$limit"
			),
			array( 'page' => array( 'INNER JOIN', array('rev_page=page_id') ) )
		);
		$recentContribs = array();
		if( $res && $dbr->numRows( $res ) > 0 ) {
			while($row = $dbr->fetchObject( $res ))
				$recentContribs[] = array(
					Title::makeName($row->page_namespace, $row->page_title),
					$row->rev_comment, 
					$row->rev_timestamp);
		}
		return $recentContribs;
	}

}

