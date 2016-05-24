dojo.provide("com.jke.widgets.StockQuote");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");

dojo.require("com.jke.AppController");

dojo.declare("com.jke.widgets.StockQuote", [ dijit._Widget, dijit._Templated ], {
		// Path to the template
		templateString : dojo.cache("com.jke.widgets", "templates/StockQuote.html"),

		// Set this to true if your widget contains other widgets
		widgetsInTemplate : true,
		user : {},
		
		// Override this method to perform custom behavior during dijit construction.
		// Common operations for constructor:
		// 1) Initialize non-primitive types (i.e. objects and arrays)
		// 2) Add additional properties needed by succeeding lifecycle methods
		constructor : function() {
		},

		// When this method is called, all variables inherited from superclasses are 'mixed in'.
		// Common operations for postMixInProperties
		// 1) Modify or assign values for widget property variables defined in the template HTML file
		postMixInProperties : function() {
		},

		// postCreate() is called after buildRendering().  This is useful to override when 
		// you need to access and/or manipulate DOM nodes included with your widget.
		// DOM nodes and widgets with the dojoAttachPoint attribute specified can now be directly
		// accessed as fields on "this". 
		// Common operations for postCreate
		// 1) Access and manipulate DOM nodes created in buildRendering()
		// 2) Add new DOM nodes or widgets 
		postCreate : function() {
			
			dojo.connect(this.stockQuoteButton, "onClick", dojo.hitch(this, function(event) {
				dojo.style("stockQuoteError", "display", "none");
				var tickerSymbol = this.tickerSymbolBox.getValue();
				dojo.xhrGet({
					url : "/quote/" + tickerSymbol,
					handleAs : "text",
					load : function(response, ioArgs) {
						if (response) {
							dojo.byId("displayTickerSymbol").innerHTML = tickerSymbol;
							dojo.byId("displayTickerPrice").innerHTML = response;
							dojo.style("enterTickerContent", "display", "none");
							dojo.style("displayTickerContent", "display", "block");
						}
					},
					error : function(response, ioArgs) {
						dojo.style("stockQuoteError", "display", "block");
						dojo.byId("stockQuoteErrorDetail").innerHTML = response;
						dojo.style("stockQuoteErrorDetail", "display", "block");
					},
					handle : function(response, ioArgs) {
						
					}
				});
			}));
			
			dojo.connect(this.newStockQuoteButton, "onClick", dojo.hitch(this, function(event) {
				dojo.style("displayTickerContent", "display", "none");
				dojo.style("stockQuoteError", "display", "none");
				dojo.style("stockQuoteErrorDetail", "display", "none");
				dojo.style("enterTickerContent", "display", "block");
			}));
		}
	});