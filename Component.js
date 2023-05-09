sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"zsap/com/r3/cobi/s4/ecobilancioigb/model/models",
	"sap/m/MessageBox",
	"z_s4_coniauth/coniauth/controls/GestConi"
], function(UIComponent, Device, models, MessageBox, GestConi) {
	"use strict";

	return UIComponent.extend("zsap.com.r3.cobi.s4.ecobilancioigb.Component", {

		GestConi: GestConi,
		metadata: {
			manifest: "json",
			config: {
				fullWidth: true
			}
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function() {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);
			this.getRouter().initialize();
			// set the device model
			this.setModel(models.createDeviceModel(), "device");
			this._getConi();
		},

		_getConi: async function() {
			var oCostructor = new this.GestConi();
			var sAction = this.getDynamicAction();
			var sReturn = await oCostructor.getStructureConi("ZECOBILIGB", sAction);
			if (!sReturn.ReturnStatus) {
				this.navToAppLaunchpad("");
				this._messageBox(sReturn.Message, "error");
			}
		},

		getDynamicAction: function() {
			var sUrl = window.location.href;
			if (sUrl.includes("-display")) {
				return "display";
			} else {
				return "manage";
			}
		},

		navToAppLaunchpad: function(sSemanticOb) {
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
				target: {
					semanticObject: sSemanticOb,
					action: "display"
				}
			})) || "";
			// l'hash viene usato per navigare alla nuova app
			oCrossAppNavigator.toExternal({
				target: {
					shellHash: hash
				}
			});
		},

		_messageBox: function(sText, sType) {
			var sIdButtonError = "buttonError";
			var sIdButtonSuccess = "buttonSuccess";
			var sIdButtonWarning = "buttonWarning";
			switch (sType) {
				case "error":
					MessageBox.error(sText, {
						actions: sap.m.MessageBox.Action.OK,
						emphasizedAction: sap.m.MessageBox.Action.OK,
						id: sIdButtonError
					});
					sap.ui.getCore().byId(sIdButtonError).getButtons()[0].setType("Emphasized");
					break;
				case "success":
					MessageBox.success(sText, {
						actions: sap.m.MessageBox.Action.OK,
						emphasizedAction: sap.m.MessageBox.Action.OK,
						id: sIdButtonSuccess
					});
					sap.ui.getCore().byId(sIdButtonSuccess).getButtons()[0].setType("Emphasized");
					break;
				case "warning":
					MessageBox.warning(sText, {
						actions: sap.m.MessageBox.Action.OK,
						emphasizedAction: sap.m.MessageBox.Action.OK,
						id: sIdButtonWarning
					});
					sap.ui.getCore().byId(sIdButtonWarning).getButtons()[0].setType("Emphasized");
					break;
			}
		}
	});
});