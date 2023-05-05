sap.ui.define(["sap/ui/core/format/NumberFormat"], function(NumberFormat) {
	"use strict";
	return {

		formatterProgress: function(sValue) {

			if (sValue === "" || sValue === undefined) {
				return 0;
			}
			var iNum = parseInt(sValue);
			return iNum;
		},
		fomratterPosFin: function(sValue) {
			if (sValue === "" || sValue === null) {
				return "";
			} else {
				return sValue.replaceAll(".", "");
			}

		},

		formatterStatus: function (sStatus) {
			if (sStatus == "0") {
				return "Disattivo"
			} else if (sStatus == "1") {
				return "Attivo";
			}
			return "";
		},

		formatterDescrAmmin: function (oAmminModel, sAmmin) {
			if (oAmminModel && oAmminModel.getData()) {
				let oAmministrazione = oAmminModel.getData().find(amm => amm.prctr === sAmmin);
				
				if (oAmministrazione) {
					return oAmministrazione.desc_breve;
				}
			}
			return "";
		}
	};
});