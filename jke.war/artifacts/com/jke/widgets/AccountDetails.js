/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2011. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:  
 * Use, duplication or disclosure restricted by GSA ADP Schedule 
 * Contract with IBM Corp. 
 *******************************************************************************/
dojo.provide("com.jke.widgets.AccountDetails");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.form.Select");
dojo.require("dijit.form.Button");
dojo.require("dojo.data.ItemFileReadStore");
dojo.require("com.jke.AccountTypeMap");
dojo.require("dojo.currency");

dojo.declare("com.jke.widgets.AccountDetails", [ dijit._Widget, dijit._Templated ], {
	// Path to the template
	templateString : dojo.cache("com.jke.widgets", "templates/AccountDetails.html"),
	widgetsInTemplate : true,
	accounts : null,
	type2Account : null,
	initialSelection : null,
	constructor : function(args) {
		this.accounts = args.accounts;
		this.initialSelection = args.initialSelection;
	},

	postCreate : function() {
		var selected;
		type2Account = {};
		dojo.forEach(this.accounts, dojo.hitch(this, function(account) {
			type2Account[account.type] = account;
			if (this.initialSelection && this.initialSelection == account.accountNumber)
				selected = account.type;
			var label = com.jke.AccountTypeMap[account.type] + " - " + account.accountNumber;
			this.accountSelect.addOption({
				label : label,
				value : account.type
			});
		}));
		
		dojo.connect(this.accountSelect, "onChange", dojo.hitch(this, function(newType) {
			this._setAccount(type2Account[newType]);
		}));

		dojo.connect(this.transactionHistoryButton, "onClick", dojo.hitch(this, function(event) {
			var accountType = this.accountSelect.getValue();
			com.jke.AppController.navigate({
				state : "history",
				accountType : accountType
			});
		}));

		dojo.connect(this.dividendPercentageButton, "onClick", dojo.hitch(this, function(event) {
			com.jke.AppController.showDonationWizard();
		}));

		if (selected)
			this.accountSelect.setValue(selected);
	},

	_setAccount : function(account) {
		this.accountLabel.innerHTML = com.jke.AccountTypeMap[account.type] + " - " + account.accountNumber;
		this.balanceValue.innerHTML = dojo.currency.format(account.balance, {
			symbol : '$'
		});
		this.dividendsValue.innerHTML = dojo.currency.format(account.dividends, {
			symbol : '$'
		});
		this.dividendsETDValue.innerHTML = dojo.currency.format(account.dividendsETD, {
			symbol : '$'
		});
		this.dividendsContValue.innerHTML = dojo.currency.format(account.contributions, {
			symbol : '$'
		});
		this.dividendsContETDValue.innerHTML = dojo.currency.format(account.contributionsETD, {
			symbol : '$'
		});
	}
});