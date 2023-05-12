sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function (JSONModel, Device) {
	"use strict";

	return {

		createDeviceModel: function () {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},

		getModelTableExpansion: function () {
			return {
				"isCompressed": true,
				"isExpanded": false
			};
		},

		getModelEsito: function () {
			return {
				"Esiti": [
					{
						"id": "",
						"Name": ""
					},
					{
						"id": "SNA",
						"name": "SNA"
					},
					{
						"id": "SEA",
						"name": "SEA"
					},
					{
						"id": "SCA",
						"name": "SCA"
					},
					{
						"id": "SPA",
						"name": "SPA"
					},
					{
						"id": "SFI",
						"name": "SFI"
					},
					{
						"id": "N_E",
						"name": "Privo di Esito"
					}
				]
			}
		},

		getModelEsitoTable: function () {
			return {
				"Esiti": [
					{
						"id": "",
						"Name": ""
					},
					{
						"id": "SNA",
						"name": "SNA"
					},
					{
						"id": "SEA",
						"name": "SEA"
					},
					{
						"id": "SCA",
						"name": "SCA"
					},
					{
						"id": "SPA",
						"name": "SPA"
					},
					{
						"id": "SFI",
						"name": "SFI"
					}
				]
			}
		},

		getModelAnnoConfronto: function () {
			return [
				{
					"anno1": "",
					"anno2": ""
				}
			];
		},
		getModelSpeseInterne: function(){
			return {"Spese":[
				{
					"id":"",
					"name":""
				},
				{
					"id":"IU",
					"name":"IU"
				},
				{
					"id":"IP",
					"name":"IP"
				}
			]}
		},

		getModelSpeseInterneFilter: function(){
			return {"Spese":[
				{
					"id":"",
					"name":""
				},
				{
					"id":"IU",
					"name":"IU"
				},
				{
					"id":"IP",
					"name":"IP"
				},
				{
					"id":"NO",
					"name":"No Spese Int."
				}
			]}
		},

		getModelSpeseInterneRows: function(){
			return {"Spese":[
				{
					"id":"",
					"name":"No Spese Int."
				},
				{
					"id":"IU",
					"name":"IU"
				},
				{
					"id":"IP",
					"name":"IP"
				}
			]}
		},

		getModelSpeseDirTrasf: function(){
			return {"Spese":[
				{
					"id":"",
					"name":""
				},
				{
					"id":"SI",
					"name":"SI"
				},
				{
					"id":"NO",
					"name":"NO"
				}
			]}
		},

		getModelMultiambito: function(){
			return {"Multiambito":[
				{
					"id":"",
					"name":""
				},
				{
					"id":"true",
					"name":"SI"
				},
				{
					"id":"false",
					"name":"NO"
				}
			]}
		},

		getMockupAnalisi: function () {
			return [{
				"ammin": "T000",
				"fipex": "00000000000001",
				"cdr1": "cdr1",
				"cdr2": "cdr2",
				"missi1": "m1",
				"missi2": "m2",
				"prog1": "prog1",
				"prog2": "prog2",
				"azi1": "azi1",
				"azi2": "azi2",
				"cap": "cap",
				"dencap1": "dencap1",
				"dencap2": "dencap2",
				"pg": "pg",
				"pg1": "pg1",
				"pg2": "pg2",
				"titolo": "titolo",
				"cat": "cat",
				"ce2": "ce2",
				"ce3": "ce3",
				"stato": "stato",
				"speseint": "speseint",
				"multiam": "multiam",
				"capagg": "capagg",
				"spesedirtr": "",
				"esito": "",
				"esitoperc": "",
				"cc1": "",
				"cc2": "",
				"cc3": "",
				"cc4": "",
				"cc5": "",
				"cc6": "",
				"cc7": "",
				"cc8": "",
				"cc9": "",
				"cc10": "",
				"cc11": "",
				"cc12": "",
				"cc13": "",
				"cc14": "",
				"cc15": "",
				"cc16": "",
				"nota": ""
			}]
		},

		getModelPosFin: function(){
			return {
				faseRicerca: true,
				infoSottoStrumento: {}
			}
		},

		getModelHomePosFin: function(){
			return {
				tablePosFin: []
			}
		},
	};
});