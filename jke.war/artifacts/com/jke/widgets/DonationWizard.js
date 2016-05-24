/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2011. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:  
 * Use, duplication or disclosure restricted by GSA ADP Schedule 
 * Contract with IBM Corp. 
 *******************************************************************************/
// dojo.provide allows pages to use all of the types declared in this resource.
dojo.provide("com.jke.widgets.DonationWizard");

// dojo.require the necessary dijit hierarchy
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.Dialog");
dojo.require("dojox.widget.Wizard");
dojo.require("dijit.form.Select");
dojo.require("dojo.data.ItemFileReadStore");
dojo.require("dijit.form.NumberTextBox");
dojo.require("dojo.currency");

dojo.require("com.jke.AccountTypeMap");
dojo.require("com.jke.AppController");

dojo.declare("com.jke.widgets.DonationWizard", [ dijit._Widget, dijit._Templated ], {
	// Path to the template
	templateString : dojo.cache("com.jke.widgets", "templates/DonationWizard.html"),

	// Set this to true if your widget contains other widgets
	widgetsInTemplate : true,
	user : {},
	_charitiesURL : null,
	_accountsURL : null,

	constructor : function(args) {
		this.user = com.jke.AppController.getLoggedInUser();

		this._charitiesURL = "/organizations";
		this._accountsURL = "/user/" + this.user.userId + "/accounts";
	},

	postCreate : function() {
		dojo.xhrGet({
			url : this._charitiesURL,
			handleAs : "json",
			load : dojo.hitch(this, function(response, ioArgs) {
				dojo.forEach(response, dojo.hitch(this, function(organization) {
					this.charitySelect.addOption({
						label : organization.name,
						value : organization
					});
				}));
			}),
			error : function(response, ioArgs) {
			}
		});

		dojo.xhrGet({
			url : this._accountsURL,
			handleAs : "json",
			load : dojo.hitch(this, function(response, ioArgs) {
				dojo.forEach(response, dojo.hitch(this, function(account) {
					this.accountSelect.addOption({
						label : com.jke.AccountTypeMap[account.type] + " - " + account.accountNumber,
						value : account
					});
				}));

				// if coming from the account details page, set that account here
				var hash = dojo.queryToObject(dojo.hash());
				if (hash.accountNumber) {
					this.accountSelect.setValue(hash.accountNumber);
				}
			}),
			error : function(response, ioArgs) {
			}
		});

		this.donePane.doneFunction = dojo.hitch(this, function() {
			var account = this.accountSelect.getValue();
			var organization = this.charitySelect.getValue();
			var date = "31+Aug+2010";
			var percent = this.percentageBox.getValue();
			var url = "transactions/create?account=" + account.accountNumber + "&org=" + organization.name + "&date=" + date + "&percent=" + percent;

			dojo.xhrPost({
				url : url,
				handleAs : "text",
				load : function(response, ioArgs) {
					// navigate to the details of that account
					com.jke.AppController.navigate({
						state : "accountDetails",
						accountNumber : account.accountNumber
					});
				},
				error : function(response, ioArgs) {
				}
			});
		});

		this.contributionPane.passFunction = dojo.hitch(this, function() {
			var passed = this.percentageBox.isInRange() && this.percentageBox.isValid();
			if (!passed) {
				dojo.style(this.errorMessage, "display", "block");
			} else {
				dojo.style(this.errorMessage, "display", "none");
			}
			this.accountSummary.innerHTML = this.accountSelect.getValue().accountNumber;
			this.charitySummary.innerHTML = this.charitySelect.getValue().name;
			this.percentSummary.innerHTML = this.percentageBox.getValue();
			return passed;
		});

		this.contWizard.cancelFunction = dojo.hitch(this, function() {
			// take them back to whereever they were before
			com.jke.AppController.reloadPage();
		});
	}
});