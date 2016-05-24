/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2011. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:  
 * Use, duplication or disclosure restricted by GSA ADP Schedule 
 * Contract with IBM Corp. 
 *******************************************************************************/
// dojo.provide allows pages to use all of the types declared in this resource.
dojo.provide("com.jke.widgets.LandingPage");

// dojo.require the necessary dijit hierarchy
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");

dojo.require("dijit.layout.ContentPane");

dojo.declare("com.jke.widgets.LandingPage", [ dijit._Widget, dijit._Templated ], {
	// Path to the template
	templateString : dojo.cache("com.jke.widgets", "templates/LandingPage.html"),

	// Set this to true if your widget contains other widgets
	widgetsInTemplate : true,

	// Override this method to perform custom behavior during dijit construction.
	// Common operations for constructor:
	// 1) Initialize non-primitive types (i.e. objects and arrays)
	// 2) Add additional properties needed by succeeding lifecycle methods
	constructor : function() {

	},

	// When this method is called, all variables inherited from superclasses are
	// 'mixed in'.
	// Common operations for postMixInProperties
	// 1) Modify or assign values for widget property variables defined in the
	// template HTML file
	postMixInProperties : function() {
	}
});