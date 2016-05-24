/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2011. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:  
 * Use, duplication or disclosure restricted by GSA ADP Schedule 
 * Contract with IBM Corp. 
 *******************************************************************************/
dojo.provide("com.jke.widgets.TransactionHistory");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.form.Select");
dojo.require("dijit.form.Button");
dojo.require("dojo.data.ItemFileReadStore");
dojo.require("com.jke.AccountTypeMap");
dojo.require("dojo.currency");

dojo.declare("com.jke.widgets.TransactionHistory", [ dijit._Widget, dijit._Templated ], {
	// Path to the template
	templateString : dojo.cache("com.jke.widgets", "templates/TransactionHistory.html"),
	widgetsInTemplate : true,
	constructor : function(args) {
	},

	postCreate : function() {
		var i = 0;
		this.accountLabel.innerHTML = this.params.accountType;
		console.log(this.params.transactions);
		dojo.forEach(this.params.transactions, dojo.hitch(this, function(transaction) {
			var tr, td;
			tr = dojo.create("tr", null, this.tableBody);
			if (i++ % 2 == 0)
				dojo.attr(tr, "style", "background-color: #efefef");

			td = dojo.create("td", {
				style : "text-align: right"
			}, tr);
			td.innerHTML = transaction.id;
			td = dojo.create("td", null, tr);
			td.innerHTML = transaction.type;
			td = dojo.create("td", null, tr);
			td.innerHTML = transaction.source;

			var amountCell = dojo.create("td", {
				innerHTML : dojo.currency.format(transaction.amount, {
					symbol : '$'
				}),
				style : "text-align: right"
			}, tr);

			var balanceCell = dojo.create("td", {
				innerHTML : dojo.currency.format(transaction.balance, {
					symbol : '$'
				}),
				style : "text-align: right"
			}, tr);

			td = dojo.create("td", {
				style : "text-align: right"
			}, tr);
			td.innerHTML = transaction.date;

		}));
	}
});