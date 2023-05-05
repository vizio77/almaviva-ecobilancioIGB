sap.ui.define(["sap/ui/core/format/NumberFormat"], function(NumberFormat) {
	"use strict";
	return {

		formatterProgress: function(sValue) {
			var iNum = parseInt(sValue);
			return iNum;
		}

	};
});