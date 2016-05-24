/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2011. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:  
 * Use, duplication or disclosure restricted by GSA ADP Schedule 
 * Contract with IBM Corp. 
 *******************************************************************************/
// dojo.provide allows pages to use all of the types declared in this resource.
dojo.provide("com.jke.AppController");

dojo.require("dojo.hash");
dojo.require("dojo.cookie");

dojo.require("com.jke.widgets.AccountSummary");
dojo.require("com.jke.widgets.DonationWizard");
dojo.require("com.jke.widgets.AccountDetails");
dojo.require("com.jke.widgets.LandingPage");
dojo.require("com.jke.widgets.TransactionHistory");
dojo.require("com.jke.widgets.StockQuote");

com.jke.AppController.login = function(name) {
	dojo.xhrGet({
		url : "/user/" + name,
		handleAs : "json",
		load : function(response, ioArgs) {
			if (response) {
				// Response format is { first, last, userId }
				dojo.cookie("JKEUser", dojo.objectToQuery(response));
				com.jke.AppController.navigate({
					state : "accountSummary"
				});
			}
		},
		error : function(response, ioArgs) {
			dojo.style("loginError", "display", "block");
		},
		handle : function(response, ioArgs) {
			// always clear the form, no matter what
			dijit.byId('loginForm').reset();
		}
	});
};

com.jke.AppController.logout = function() {
	// delete the login cookie
	dojo.cookie("JKEUser", null, {
		expires : -1
	});

	com.jke.AppController.navigate({
		state : "welcome"
	});
};

com.jke.AppController.navigate = function(state) {
	dojo.hash(dojo.objectToQuery(state));
	com.jke.AppController.reloadPage();
};

com.jke.AppController.reloadPage = function() {
	var hash = dojo.queryToObject(dojo.hash());
	var state = hash.state;

	var user = com.jke.AppController.getLoggedInUser();
	if (!state) {
		if (user) {
			// we are logged in already... go to account summary
			com.jke.AppController.navigate({
				state : "accountSummary"
			});
		} else {
			com.jke.AppController.navigate({
				state : "welcome"
			});
		}
	} else if (state == "welcome") {
		// only go back to the landing page if they are not logged in, otherwise
		// just stay put
		if (!user) {
			// populate with the landing page
			com.jke.AppController._showLandingPage();
		}
	} else {
		if (!user) {
			// this is a strange state of affairs... the hash goes to a
			// restricted URL, but they are not logged in.
			// take 'em back to the welcome page
			com.jke.AppController.navigate({
				state : "welcome"
			});
		} else {
			if (state == "accountSummary") {
				// populate with the Account Summary page
				com.jke.AppController._showLoggedIn(user);
				com.jke.AppController._showAccountSummary(user);
			} else if (state == "accountDetails") {
				// populate with the details page
				var accountNumber = hash.accountNumber;
				com.jke.AppController._showAccountDetails(user, null, accountNumber);
			} else if (state == "contributeDividend") {
				var accountNumber = hash.accountNumber;
			} else if (state == "history") {
				var accountType = hash.accountType;
				com.jke.AppController._showHistory(user, accountType);
			} else if (state == "stockQuote") {
				com.jke.AppController._showStockQuoteForm();
			}
		}
	}
};

com.jke.AppController.getLoggedInUser = function() {
	var userCookie = dojo.cookie("JKEUser");
	if (userCookie) {
		return dojo.queryToObject(userCookie);
	} else {
		return undefined;
	}
};

com.jke.AppController.showDonationWizard = function() {
	var user = com.jke.AppController.getLoggedInUser();
	var wiz = new com.jke.widgets.DonationWizard({
		userName : user.userName
	});
	wiz.placeAt("functionalArea", "only");
	wiz.startup();
};

/* private methods below */
com.jke.AppController._showLandingPage = function() {
	dojo.style("moneyMattersPortlet", "display", "none");
	dojo.style("loginContent", "display", "block");
	dojo.style("loggedInContent", "display", "none");

	// restore the functional area to the landing page content
	var landingPage = new com.jke.widgets.LandingPage();
	landingPage.placeAt("functionalArea", "only");

	// focus the username field
	dijit.byId("usernameBox").focus();
};

com.jke.AppController._showLoggedIn = function(user) {
	// login was successful
	dojo.style("loginError", "display", "none");
	dojo.style("moneyMattersPortlet", "display", "block");
	dojo.style("loginContent", "display", "none");

	var usernameSpan = dojo.create("span", {
		id : "usersName",
		innerHTML : user.first
	});
	dojo.place(usernameSpan, "usersName", "replace");
	dojo.style("loggedInContent", "display", "block");
};

com.jke.AppController._showAccountSummary = function(user) {
	com.jke.AppController._showLoggedIn(user);

	// load up this user's account summary
	var accountSummary = new com.jke.widgets.AccountSummary({
		url : "/user/" + user.userId + "/accounts"
	});
	accountSummary.placeAt("functionalArea", "only");
};

com.jke.AppController._showAccountDetails = function(user, accounts, accountNumber) {
	com.jke.AppController._showLoggedIn(user);

	// define callback out here to enclose the accountNumber var
	var callback = function(response, ioArgs) {
		var accountDetails = new com.jke.widgets.AccountDetails({
			accounts : response,
			initialSelection : accountNumber
		});
		accountDetails.placeAt("functionalArea", "only");
	};

	dojo.xhrGet({
		url : "/user/" + user.userId + "/accounts",
		handleAs : "json",
		load : callback,
		error : function(response, ioArgs) {
		}
	});
};

com.jke.AppController._showHistory = function(user, accountType) {
	com.jke.AppController._showLoggedIn(user);

	var callback = function(response, ioArgs) {
		var widget = new com.jke.widgets.TransactionHistory({
			transactions : response,
			accountType : accountType
		});
		widget.placeAt("functionalArea", "only");
	};

	dojo.xhrGet({
		url : "/transactions/" + user.userId + "/" + accountType,
		handleAs : "json",
		load : callback,
		error : function(response, ioArgs) {
		}
	});
};

com.jke.AppController._showStockQuoteForm = function() {
	
	// load up the Stock Quote form
	var stockQuoteWidget = new com.jke.widgets.StockQuote();
	stockQuoteWidget.placeAt("functionalArea", "only");
};