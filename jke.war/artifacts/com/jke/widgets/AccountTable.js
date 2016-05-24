/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2011. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:  
 * Use, duplication or disclosure restricted by GSA ADP Schedule 
 * Contract with IBM Corp. 
 *******************************************************************************/
dojo.provide("com.jke.widgets.AccountTable");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dojo.currency");

dojo.require("com.jke.widgets.AccountDetails");
dojo.require("com.jke.AppController");

dojo.declare("com.jke.widgets.AccountTable", [ dijit._Widget, dijit._Templated ], {
	accountsOfThisType : null,
	allAccounts : null,
	title : "",
	templateString : dojo.cache("com.jke.widgets", "templates/AccountTable.html"),

	constructor : function(args) {
		this.accountsOfThisType = args.accountsOfThisType;
		this.allAccounts = args.allAccounts;
	},
	postCreate : function() {
		dojo.forEach(this.accountsOfThisType, dojo.hitch(this, function(account) {
			var tr = dojo.create("tr", null, this.tableBody);
			var accountLink = dojo.create("td", {
				innerHTML : account.accountNumber
			}, tr);
			dojo.connect(accountLink, "onclick", dojo.hitch(this, function(clickedNode) {
				com.jke.AppController.navigate({
					state : "accountDetails",
					accountNumber : account.accountNumber
				});
				// var accountDetails = new com.jke.widgets.AccountDetails({accounts:
				// this.allAccounts, initialSelection:account.accountNumber});
				// accountDetails.placeAt("functionalArea", "only");
				// alert('navigate to account: ' + account.accountNumber);
			}));

			dojo.addClass(accountLink, "jsLink");

			var balanceCell = dojo.create("td", {
				innerHTML : dojo.currency.format(account.balance, {
					symbol : '$'
				})
			}, tr);
			dojo.addClass(balanceCell, "right");
		}));
	}
});