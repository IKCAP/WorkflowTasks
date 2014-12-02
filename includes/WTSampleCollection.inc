<?php

class WTSampleCollection extends WTBase {
	function __construct($title) {
		parent::__construct($title);
	}

	/*function setJavascriptVariables($out) {
		parent::setJavascriptVariables($out);
	}*/

	function modifyWikiPage($out) {
		$old = $out->getHTML();
		$out->clearHTML();

		# -- Add Existing Markup Here
		$out->addHTML( $old );

		# -- Add the Standard Properties Table
		$this->addStdPropsDiv( $out );

		# -- Add a Facts Table Here
		$this->addFactsDiv( $out );

		# -- Credits Div
		$this->addCreditsDiv( $out );

		# -- Sidebar Div
		$this->addSidebarDiv( $out );
	}

	function getPageDetails() {
		$details = parent::getPageDetails();
		$details["WTSampleCollection"] = $this->getWTSampleCollection();
		return $details;
	}

	protected function getText($di) {
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

	protected function getUri($di) {
		if($di->getDIType() == SMWDataItem::TYPE_URI)
			return $di->getURI();
		else {
			$url = $di->getTitle();
			return preg_replace('/^http/i', 'http', $url);
		}
	}

	function getWTSampleCollection() {
		$details = array(
			'owner_institution'=>'',
			'curation_procedure'=>'',
			'number_of_samples'=>'',
			'website'=>'',
		);

		# SMW Initialization 
		$subject = SMWDIWikiPage::newFromTitle( $this->title );
		$ownerProp = SMWDIProperty::newFromUserLabel('Owner_Institution');
		$curationProp = SMWDIProperty::newFromUserLabel('Curation_Procedures');
		$numProp = SMWDIProperty::newFromUserLabel('Number_of_Samples');
		$siteProp = SMWDIProperty::newFromUserLabel('Website');

		$owners = smwfGetStore()->getPropertyValues( $subject, $ownerProp );
		foreach($owners as $di) {
			$dv = SMWDataValueFactory::newDataItemValue( $di, $ownerProp );
			$details["owner_institution"] = WTFactsAPI::getDVDetails($dv, $di);
			break;
		}
		$curationprocs = smwfGetStore()->getPropertyValues( $subject, $curationProp );
		foreach($owners as $di) {
			$dv = SMWDataValueFactory::newDataItemValue( $di, $curationProp );
			$details["curation_procedure"] = WTFactsAPI::getDVDetails($dv, $di);
			break;
		}
		$nums = smwfGetStore()->getPropertyValues( $subject, $numProp );
		foreach($nums as $di) {
			$details["number_of_samples"] = $this->getText($di);
			break;
		}
		$sites = smwfGetStore()->getPropertyValues( $subject, $siteProp );
		foreach($sites as $di) {
			$details["website"] = $this->getUri($di);
			break;
		}
		return $details;
	}
}

