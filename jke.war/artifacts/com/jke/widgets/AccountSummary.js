/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2011. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:  
 * Use, duplication or disclosure restricted by GSA ADP Schedule 
 * Contract with IBM Corp. 
 *******************************************************************************/
// dojo.provide allows pages to use all of the types declared in this resource.
dojo.provide("com.jke.widgets.AccountSummary");

// dojo.require the necessary dijit hierarchy
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("com.jke.widgets.AccountTable");
dojo.require("com.jke.AccountTypeMap");

dojo.declare("com.jke.widgets.AccountSummary", [ dijit._Widget, dijit._Templated ], {
	// Path to the template
	templateString : dojo.cache("com.jke.widgets", "templates/AccountSummary.html"),

	// Set this to true if your widget contains other widgets
	widgetsInTemplate : false,
	url : null,
	_accounts : null,

	constructor : function(args) {
		this.url = args.url;
	},

	postCreate : function() {
		dojo.xhrGet({
			url : this.url,
			handleAs : "json",
			load : dojo.hitch(this, function(response, ioArgs) {
				console.log(response);
				dojo.forEach(response, function(account) {
					var tr = dojo.create("tr", null, this.tableBody);
					var td = dojo.create("td", null, tr);
					var a = dojo.create("a", {
						href : "#",
						innerHTML : com.jke.AccountTypeMap[account.type]
					}, td);
					td = dojo.create("td", {
						innerHTML : dojo.currency.format(account.balance, {
							symbol : '$'
						})
					}, tr);
					dojo.addClass(td, "right");
					dojo.connect(a, "onclick", dojo.hitch(this, function(event) {
						event.preventDefault();
						com.jke.AppController.navigate({
							state : "accountDetails",
							accountNumber : account.accountNumber
						});
					}));
				}, this);
			}),
			error : function(response, ioArgs) {
				alert('error');
			}
		});
	}
});