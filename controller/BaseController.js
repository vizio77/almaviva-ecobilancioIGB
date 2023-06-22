sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/ui/model/Filter",
	"sap/ui/model/json/JSONModel",
	"zsap/com/r3/cobi/s4/ecobilancioigb/model/models",
	"zsap/com/r3/cobi/s4/ecobilancioigb/util/formatter",
	"sap/ui/model/FilterOperator",
	'sap/ui/export/Spreadsheet',
	'sap/ui/export/library',

], function (Controller, MessageBox, Filter, JSONModel, models, formatter, FilterOperator, SpreadSheet, exportLibrary) {
	"use strict";
	var EdmType = exportLibrary.EdmType;
	return Controller.extend("zsap.com.r3.cobi.s4.ecobilancioigb.controller.BaseController", {
		
		models: models,
		formatter: formatter,


		getJsonModel: function (sCase) {
			switch (sCase) {
				case "0":
					return this.models.getModelCodici();
				case "1":
					return this.models.getModelCepa();
				case "2":
					return this.models.getModelTableCepa();
				case "3":
					return this.models.getModelTableClassifica();
				case "4":
					return this.models.getModelClassificazioni();

			}
		},

		_onClearInput: function(oEvent) {
			//this._onClearInput();
			var aSelectionsSets = oEvent.getParameters().selectionSet;
			//lt setto il valore della posizione finanziaria a "" così da resettare il valore
			
			if(this.byId("idPosFin")) this.byId("idPosFin").setValue("");
			this.getView().getModel("modelAdattaFiltri").setProperty("/CodiceAmmin", "");
			//this.clearGlobalModel();
			for (var i = 0; i < aSelectionsSets.length; i++) {
				var oControl = this.getView().byId(aSelectionsSets[i].getId());
				//oControl.setValue("");
				if (oControl.getMetadata().getName() === "sap.m.ComboBox") {
					oControl.setSelectedKey("");
				}

				if (oControl.getMetadata().getName() === "sap.m.Select") {
					oControl.setSelectedKey("");
				}

				if (oControl.getMetadata().getName() === "sap.m.Input" & aSelectionsSets[i].getEnabled()) {
					oControl.setValue("");
				}

				if (oControl.getMetadata().getName() === "sap.m.CheckBox") {
					oControl.setSelected(false);
				}
			}
		},

		_getSelectItem: function (sOption) {
			var sSelectedKey;
			if (this.getView().getModel("modelHome")) {
				if (this.getView().byId("idTableRisultatiRicerca").getSelectedContextPaths().length !== 0) {
					sSelectedKey = this.getView().byId("idTableRisultatiRicerca").getSelectedContextPaths()[0].split("/")[1];
					var oItem = this.getView().getModel("modelHome").getData()[sSelectedKey];
					if (oItem) {
						switch (sOption) {
							case 'CHECK':
								return true;
							case 'GET':
								return oItem;
						}
					}
				} else {
					this.messageChangeStato("noRiga", "SelezRiga", "", "warning");
				}
			} else {
				this.messageChangeStato("noData", "noData", "", "warning");
			}

		},

		getSelectedItems: function () {
			var aObject = Object.keys(this._oDialog.getModel("modelTableClassifica").oData);
			var aData = this._oDialog.getModel("modelTableClassifica").oData;
			var aSelected = [],
				aValResult = [];
			for (var i = 0; i < aObject.length; i++) {
				if (aData[aObject[i]].SELECTED === true) {
					aSelected.push(aData[aObject[i]]);
				}
			}

			return aSelected;
		},

		_setProperty: function () {

			this._oDialog.setRememberSelections(true);

			var oButton = this._oDialog.getAggregation("_dialog").getEndButton();
			if (oButton) {
				sap.ui.getCore().byId(oButton.sId).setType("Emphasized");
			}
			var oButton = this._oDialog.getAggregation("_dialog").getBeginButton();
			if (oButton) {
				sap.ui.getCore().byId(oButton.sId).setType("Emphasized");
			}

			this._oDialog.setMultiSelect(true);

		},

		onClose: function () {
			this._oDialog.close();
			this._oDialog.destroy();
			this._oDialog = undefined;
		},

		_readFromDb: function (sDbSource, sEntitySet, aFilters, aSorters) {
			var aReturn = this._getDbOperationReturn();
			var oModel = this._getDbModel(sDbSource);
			// var sUrlParamtersExpand = sExpand === "" ? {} : {
			// 	"$expand": sExpand
			// };
			return new Promise(function (resolve, reject) {
				oModel.read(sEntitySet, {
					filters: aFilters,
					sorters: aSorters,
					// urlParameters: sUrlParamtersExpand,
					success: function (oData) {
						aReturn.returnStatus = true;
						if (oData.results === undefined) {
							aReturn.data = oData;
						} else {
							aReturn.data = oData.results;
						}

						// resolve(aReturn.data);
						return resolve(aReturn.data);
					},
					error: function (e) {
						aReturn.returnStatus = false;
						reject(e);
						// return reject(e);
					}
				});
			});
		},
		_getDbOperationReturn: function () {
			return {
				returnStatus: false,
				data: []
			};
		},

		_insertRecord: function(sDbSource, sEntitySet, oRecord) {
			var that = this;
			var aReturn = this._getDbOperationReturn();
			var oModel = this._getDbModel(sDbSource);
			return new Promise(function(resolve, reject) {
				oModel.create(sEntitySet, oRecord, {
					success: function(oData) {
						if (oData.results === undefined) {
							aReturn.data = oData;
						} else {
							aReturn.data = oData.results;
						}
						aReturn.returnStatus = true;
						that.closeBusyDialog();
						// MessageBox.success(
						// 	'Operazione effettuata con successo!'
						// );
						return resolve(aReturn);
					},
					error: function(e) {
						aReturn.returnStatus = false;
						that.closeBusyDialog();
						MessageBox.error("Operazione fallita!");
						return reject(aReturn.returnStatus);
					},
				});
			});
		},

		_getDbModel: function (sDbSource) {
			switch (sDbSource) {
				case "1":
					return this.getOwnerComponent().getModel("sapHanaS2Match");
				case "2":
					return this.getOwnerComponent().getModel("sapHanaS2Ecobilancio");
				case "3":
					return this.getOwnerComponent().getModel("sapHanaS2Tipologiche");
				case "4":
					return this.getOwnerComponent().getModel("sapHanaS2");
				case "5":
					return this.getOwnerComponent().getModel("sapHanaS2EcobilancioIGB");
				case "6":
					return this.getOwnerComponent().getModel("ZKTIP_AMM_01_CDS");
				case "7":
					return this.getOwnerComponent().getModel("bilgenIgb");

			}
		},

		messageChangeStato: function(sMessage, sMod, option) {
			var that = this;
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			if (option === "warning") {
				sap.m.MessageBox.warning(
					that.recuperaTestoI18n(that.recuperaTestoI18n(sMessage)), {
						id: "messageWarning",
						title: that.recuperaTestoI18n("opWa"),
						actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
						styleClass: bCompact ? "sapUiSizeCompact" : "",
						onClose: function(sAction) {
							if (sAction === "OK") {

								switch (sMod) {
									case "chiusura":
										that.onClose();
										break;
									case "valida":
										that.onValida();
										break;

								}

							}

						}
					}
				);
			} else if(option === "warning2"){
				sap.m.MessageBox.warning(
					that.recuperaTestoI18n(that.recuperaTestoI18n(sMessage)), {
						id: "messageWarning",
						title: that.recuperaTestoI18n("opWa"),
						actions: [MessageBox.Action.OK],
						styleClass: bCompact ? "sapUiSizeCompact" : "",
						onClose: function(sAction) {
							if (sAction === "OK") {

								switch (sMod) {
									case "checkLivelli":
										break;
									case "noSelezione":
										break;

								}

							}

						}
					}
				);	
			} else if (option === "success") {
				sap.m.MessageBox.success(
					that.recuperaTestoI18n(that.recuperaTestoI18n(sMessage)), {
						title: that.recuperaTestoI18n("opSu"),
						id: "succMess",
						actions: [MessageBox.Action.OK],
						styleClass: bCompact ? "sapUiSizeCompact" : "",
						onClose: function(sAction) {
							if (sAction === "OK") {

								switch (sMod) {

								}

							}

						}
					}
				);
			}
			if (sap.ui.getCore().byId("messageWarning")) {
				sap.ui.getCore().byId("messageWarning").getButtons()[0].setType("Emphasized");
			} else {
				sap.ui.getCore().byId("succMess").getButtons()[0].setType("Emphasized");
			}
		},

		messageChangeStato_OLD: function (sMessage, sMod, option) {
			var that = this;
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			if (option === "warning") {
				sap.m.MessageBox.warning(
					that.recuperaTestoI18n(that.recuperaTestoI18n(sMessage)), {
					id: "messageWarning",
					title: that.recuperaTestoI18n("opWa"),
					actions: [MessageBox.Action.OK],
					styleClass: bCompact ? "sapUiSizeCompact" : "",
					onClose: function (sAction) {
						if (sAction === "OK") {

							switch (sMod) {
								case "zeroSelezionati":
									break;
								case "noData":
									break;

							}

						}

					}
				}
				);
			} else if (option === "success") {
				sap.m.MessageBox.success(
					that.recuperaTestoI18n(that.recuperaTestoI18n(sMessage)), {
					title: that.recuperaTestoI18n("opSu"),
					id: "succMess",
					actions: [MessageBox.Action.OK],
					styleClass: bCompact ? "sapUiSizeCompact" : "",
					onClose: function (sAction) {
						if (sAction === "OK") {

							switch (sMod) {

							}

						}

					}
				}
				);
			}
			if (sap.ui.getCore().byId("messageWarning")) {
				sap.ui.getCore().byId("messageWarning").getButtons()[0].setType("Emphasized");
			} else {
				sap.ui.getCore().byId("succMess").getButtons()[0].setType("Emphasized");
			}
		},
		recuperaTestoI18n: function (testoDaRecuperare) {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(testoDaRecuperare);
		},

		openBusyDialog: function (sText) {
			// instantiate dialog
			// if (!this._dialog) {
			sap.ui.getCore()._dialog = sap.ui.xmlfragment("zsap.com.r3.cobi.s4.ecobilancioigb.view.fragment.BusyDialog", this);
			if (sText) {
				sap.ui.getCore()._dialog.setText(sText);
			}
			this.getView().addDependent(sap.ui.getCore()._dialog);
			// }

			// open dialog
			// jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._dialog);
			sap.ui.getCore()._dialog.open();
		},

		closeBusyDialog: function () {
			try {
				if (sap.ui.getCore()._dialog) {
					sap.ui.getCore()._dialog.close();
					sap.ui.getCore()._dialog.destroy();
				}
			} catch (error) {
				//Popup già chiusa
			}
		},

		_formatDataForExcell: function (aData) {
			let oAmminModel = this.getView().getModel("amministrazioniModel");
			aData.forEach(obj => {
				if (obj.stat_status) {
					obj.stat_status = formatter.formatterStatus(obj.stat_status);
				}
				if (obj.StatStatus) {
					obj.StatStatus = formatter.formatterStatus(obj.StatStatus);
				}
				
				if (obj.codice_ammin) {
					obj.DescrAmmin = formatter.formatterDescrAmmin(oAmminModel, obj.codice_ammin);
				}
				if (obj.CodiceAmmin) {
					obj.DescrAmmin = formatter.formatterDescrAmmin(oAmminModel, obj.CodiceAmmin);
				}
				for (let i = 1; i <= 16; i++) {
					const livello = "livello" + i.toString();
					obj[livello]
					if (obj[livello]) {
						obj[livello] = parseFloat(obj[livello]);
					}					
				}
			});
			return aData;
		},

		downloadExcel: function (nameFile, nameModel, sMod, isProposta) {
			var arrExcel = this.getView().getModel(nameModel).getData();
			// copia dei dati, si rompe il binding
			var aDataCopy = JSON.parse(JSON.stringify(arrExcel));
			var oSetting = {
				workbook: {
					columns: this._getColsForExcel(sMod),
					context: {
						sheetName: "Data"
					}
				},
				dataSource: this._formatDataForExcell(aDataCopy),
				worker: true,
				fileName: nameFile
			}
			new SpreadSheet(oSetting).build();

		},
		_getColsForExcel: function (sMod) {
			var aCols = [];

			if (sMod === "Ecobilancio") {
				aCols.push(this._addColsExcelBase("thAmmin", "codice_ammin", 'string'));
				aCols.push(this._addColsExcelBase("thDescrAmmin", "DescrAmmin", 'string'));
				aCols.push(this._addColsExcelBase("thPosfin", "fipex", 'string'));
				aCols.push(this._addColsExcelBase("thCdr", "Codice_cdr", 'string'));
				aCols.push(this._addColsExcelBase("thDescrCdr", "Cdr", 'string'));
				aCols.push(this._addColsExcelBase("thMissione", "codice_missione", 'string'));
				aCols.push(this._addColsExcelBase("thDescrMissione", "Missione", 'string'));
				aCols.push(this._addColsExcelBase("thProgramma", "codice_programma", 'string'));
				aCols.push(this._addColsExcelBase("thDescrProgramma", "Programma", 'string'));
				aCols.push(this._addColsExcelBase("thAzione", "codice_azione", 'string'));
				aCols.push(this._addColsExcelBase("thDescrAzione", "Azione", 'string'));
				aCols.push(this._addColsExcelBase("thTitolo", "codice_titolo", 'string'));
				aCols.push(this._addColsExcelBase("thDescrTitolo", "Titolo", 'string'));
				aCols.push(this._addColsExcelBase("thCat", "codice_categoria", 'string'));
				aCols.push(this._addColsExcelBase("thDescrCat", "Categoria", 'string'));
				aCols.push(this._addColsExcelBase("thCe2", "codice_claeco2", 'string'));
				aCols.push(this._addColsExcelBase("thDescrCe2", "Claeco2", 'string'));
				aCols.push(this._addColsExcelBase("thCe3", "codice_claeco3", 'string'));
				aCols.push(this._addColsExcelBase("thDescrCe3", "Claeco3", 'string'));
				aCols.push(this._addColsExcelBase("thCap", "codice_capitolo", 'string'));
				aCols.push(this._addColsExcelBase("thDenomCap", "Capitolo", 'string'));
				aCols.push(this._addColsExcelBase("thPg", "codice_pg", 'string'));
				aCols.push(this._addColsExcelBase("thDenomPg", "Pg", 'string'));
				aCols.push(this._addColsExcelBase("thStato", "stat_status", 'string'));
				aCols.push(this._addColsExcelBase("thSpeseInt", "SpeseInt", 'string'));
				aCols.push(this._addColsExcelBase("thMultiambito", "multiambito", 'string'));
				// aCols.push(this._addColsExcelBase("thCapAggr", "capi_aggr", 'string'));
				aCols.push(this._addColsExcelBase("thSpeseDirTra", "spese_dir", 'string'));
				aCols.push(this._addColsExcelBase("thEsito", "esito_eco", 'string'));
				aCols.push(this._addColsExcelBase("thEsitoPerc", "esito_eco_perc", EdmType.Number, 2));
				aCols.push(this._addColsExcelBase("thDescrCc1", "livello1", EdmType.Number, 2));
				aCols.push(this._addColsExcelBase("thDescrCc2", "livello2", EdmType.Number, 2));
				aCols.push(this._addColsExcelBase("thDescrCc3", "livello3", EdmType.Number, 2));
				aCols.push(this._addColsExcelBase("thDescrCc4", "livello4", EdmType.Number, 2));
				aCols.push(this._addColsExcelBase("thDescrCc5", "livello5", EdmType.Number, 2));
				aCols.push(this._addColsExcelBase("thDescrCc6", "livello6", EdmType.Number, 2));
				aCols.push(this._addColsExcelBase("thDescrCc7", "livello7", EdmType.Number, 2));
				aCols.push(this._addColsExcelBase("thDescrCc8", "livello8", EdmType.Number, 2));
				aCols.push(this._addColsExcelBase("thDescrCc9", "livello9", EdmType.Number, 2));
				aCols.push(this._addColsExcelBase("thDescrCc10", "livello10", EdmType.Number, 2));
				aCols.push(this._addColsExcelBase("thDescrCc11", "livello11", EdmType.Number, 2));
				aCols.push(this._addColsExcelBase("thDescrCc12", "livello12", EdmType.Number, 2));
				aCols.push(this._addColsExcelBase("thDescrCc13", "livello13", EdmType.Number, 2));
				aCols.push(this._addColsExcelBase("thDescrCc14", "livello14", EdmType.Number, 2));
				aCols.push(this._addColsExcelBase("thDescrCc15", "livello15", EdmType.Number, 2));
				aCols.push(this._addColsExcelBase("thDescrCc16", "livello16", EdmType.Number, 2));
				aCols.push(this._addColsExcelBase("thNota", "Nota", 'string'));
			} else if (sMod === "AnalisiClassificatoria") {
				let sCdr = this.recuperaTestoI18n("thCdr") + " ";
				let sMissione = this.recuperaTestoI18n("thMissione") + " ";
				let sProgramma = this.recuperaTestoI18n("thProgramma") + " ";
				let sAzione = this.recuperaTestoI18n("thAzione") + " ";
				// let sCapitolo = this.recuperaTestoI18n("thCap") + " ";
				let sDenomCapitolo = this.recuperaTestoI18n("thDenomCap") + " ";
				let sDenomPg = this.recuperaTestoI18n("thDenomPg") + " ";
				let oModelAnnoConfronto = this.getView().getModel("modelAnnoConfronto");

				aCols.push(this._addColsExcelBase("thAmmin", "CodiceAmmin", 'string'));
				aCols.push(this._addColsExcelBase("thDescrAmmin", "DescrAmmin", 'string'));
				aCols.push(this._addColsExcelBase("thPosfin", "Fipex", 'string'));
				aCols.push(this._addColsExcelBase(sCdr + oModelAnnoConfronto.getProperty("/anno2"), "CodiceCdrPre", 'string'));
				aCols.push(this._addColsExcelBase(sCdr + oModelAnnoConfronto.getProperty("/anno1"), "CodiceCdr", 'string'));
				aCols.push(this._addColsExcelBase(sMissione + oModelAnnoConfronto.getProperty("/anno2"), "CodiceMissionePre", 'string'));
				aCols.push(this._addColsExcelBase(sMissione + oModelAnnoConfronto.getProperty("/anno1"), "CodiceMissione", 'string'));
				aCols.push(this._addColsExcelBase(sProgramma + oModelAnnoConfronto.getProperty("/anno2"), "CodiceProgrammaPre", 'string'));
				aCols.push(this._addColsExcelBase(sProgramma + oModelAnnoConfronto.getProperty("/anno1"), "CodiceProgramma", 'string'));
				aCols.push(this._addColsExcelBase(sAzione + oModelAnnoConfronto.getProperty("/anno2"), "CodiceAzionePre", 'string'));
				aCols.push(this._addColsExcelBase(sAzione + oModelAnnoConfronto.getProperty("/anno1"), "CodiceAzione", 'string'));
				aCols.push(this._addColsExcelBase("thCap", "CodiceCapitolo", 'string'));
				// aCols.push(this._addColsExcelBase(sCapitolo + oModelAnnoConfronto.getProperty("/anno1"), "CodiceCapitolo", 'string'));
				// aCols.push(this._addColsExcelBase(sCapitolo + oModelAnnoConfronto.getProperty("/anno2"), "CodiceCapitoloPre", 'string'));
				aCols.push(this._addColsExcelBase(sDenomCapitolo + oModelAnnoConfronto.getProperty("/anno2"), "CapitoloPre", 'string'));
				aCols.push(this._addColsExcelBase(sDenomCapitolo + oModelAnnoConfronto.getProperty("/anno1"), "DescCapitolo", 'string'));
				aCols.push(this._addColsExcelBase("thPg", "CodicePg", 'string'));
				aCols.push(this._addColsExcelBase(sDenomPg + oModelAnnoConfronto.getProperty("/anno2"), "PgPre", 'string'));
				aCols.push(this._addColsExcelBase(sDenomPg + oModelAnnoConfronto.getProperty("/anno1"), "Pg", 'string'));
				aCols.push(this._addColsExcelBase("thTitolo", "CodiceTitolo", 'string'));
				aCols.push(this._addColsExcelBase("thDescrTitolo", "Titolo", 'string'));
				aCols.push(this._addColsExcelBase("thCat", "CodiceCategoria", 'string'));
				aCols.push(this._addColsExcelBase("thDescrCat", "Categoria", 'string'));
				aCols.push(this._addColsExcelBase("thCe2", "CodiceClaeco2", 'string'));
				aCols.push(this._addColsExcelBase("thDescrCe2", "Claeco2", 'string'));
				aCols.push(this._addColsExcelBase("thCe3", "CodiceClaeco3", 'string'));
				aCols.push(this._addColsExcelBase("thDescrCe3", "Claeco3", 'string'));
				aCols.push(this._addColsExcelBase("thStato", "StatStatus", 'string'));
				aCols.push(this._addColsExcelBase("thSpeseInt", "Speseint", 'string'));
				aCols.push(this._addColsExcelBase("thMultiambito", "Multiambito", 'string'));
				// aCols.push(this._addColsExcelBase("thCapAggr", "CapiAggr", 'string'));
				aCols.push(this._addColsExcelBase("thSpeseDirTra", "SpeDirette", 'string'));
				aCols.push(this._addColsExcelBase("thEsito", "EsitoEco", 'string'));
				aCols.push(this._addColsExcelBase("thEsitoPerc", "EsitoEcoPerc", 'string'));
				aCols.push(this._addColsExcelBase("thDescrCc1", "Livello1", 'string'));
				aCols.push(this._addColsExcelBase("thDescrCc2", "Livello2", 'string'));
				aCols.push(this._addColsExcelBase("thDescrCc3", "Livello3", 'string'));
				aCols.push(this._addColsExcelBase("thDescrCc4", "Livello4", 'string'));
				aCols.push(this._addColsExcelBase("thDescrCc5", "Livello5", 'string'));
				aCols.push(this._addColsExcelBase("thDescrCc6", "Livello6", 'string'));
				aCols.push(this._addColsExcelBase("thDescrCc7", "Livello7", 'string'));
				aCols.push(this._addColsExcelBase("thDescrCc8", "Livello8", 'string'));
				aCols.push(this._addColsExcelBase("thDescrCc9", "Livello9", 'string'));
				aCols.push(this._addColsExcelBase("thDescrCc10", "Livello10", 'string'));
				aCols.push(this._addColsExcelBase("thDescrCc11", "Livello11", 'string'));
				aCols.push(this._addColsExcelBase("thDescrCc12", "Livello12", 'string'));
				aCols.push(this._addColsExcelBase("thDescrCc13", "Livello13", 'string'));
				aCols.push(this._addColsExcelBase("thDescrCc14", "Livello14", 'string'));
				aCols.push(this._addColsExcelBase("thDescrCc15", "Livello15", 'string'));
				aCols.push(this._addColsExcelBase("thDescrCc16", "Livello16", 'string'));
				aCols.push(this._addColsExcelBase("thNota", "Nota", 'string'));
			}else if(sMod === "Proposta"){			
				aCols.push(this._addColsExcelBase("thPosfin", "Fipex", 'string'));			
				aCols.push(this._addColsExcelBase("thEsitoPerc", "EsitoEcoPerc", EdmType.Number, 2));
				aCols.push(this._addColsExcelBase("thDescrCc1", "Livello1", EdmType.Number, 2));
				aCols.push(this._addColsExcelBase("thDescrCc2", "Livello2", EdmType.Number, 2));
				aCols.push(this._addColsExcelBase("thDescrCc3", "Livello3", EdmType.Number, 2));
				aCols.push(this._addColsExcelBase("thDescrCc4", "Livello4", EdmType.Number, 2));
				aCols.push(this._addColsExcelBase("thDescrCc5", "Livello5", EdmType.Number, 2));
				aCols.push(this._addColsExcelBase("thDescrCc6", "Livello6", EdmType.Number, 2));
				aCols.push(this._addColsExcelBase("thDescrCc7", "Livello7", EdmType.Number, 2));
				aCols.push(this._addColsExcelBase("thDescrCc8", "Livello8", EdmType.Number, 2));
				aCols.push(this._addColsExcelBase("thDescrCc9", "Livello9", EdmType.Number, 2));
				aCols.push(this._addColsExcelBase("thDescrCc10", "Livello10", EdmType.Number, 2));
				aCols.push(this._addColsExcelBase("thDescrCc11", "Livello11", EdmType.Number, 2));
				aCols.push(this._addColsExcelBase("thDescrCc12", "Livello12", EdmType.Number, 2));
				aCols.push(this._addColsExcelBase("thDescrCc13", "Livello13", EdmType.Number, 2));
				aCols.push(this._addColsExcelBase("thDescrCc14", "Livello14", EdmType.Number, 2));
				aCols.push(this._addColsExcelBase("thDescrCc15", "Livello15", EdmType.Number, 2));
				aCols.push(this._addColsExcelBase("thDescrCc16", "Livello16", EdmType.Number, 2));
			}

			return aCols;
		},
		_addColsExcelBase: function (nameLabel, field, type, scale) {
			let column = {
				label: this.recuperaTestoI18n(nameLabel),
				property: [field],
				type: type
			};

			if(scale) column.scale = scale
			
			return column;

			aCols.push({
				label: 'Decimal (scale=2)',
				type: EdmType.Number,
				property: 'SampleDecimal',
				scale: 2
			});
		},
		// robe copiate da gestposfin per matchcode di posfin

		__getAnnoFaseProcessoMacroFase: function () {
			let modelTopologiche = this.getOwnerComponent().getModel("sapHanaS2Tipologiche")
			var that = this;
			return new Promise((resolve, reject) => {
				modelTopologiche.read("/ZES_CAL_FIN_SET", {
					filters: [new Filter("FASE", FilterOperator.EQ, "F")],
					success: (oData) => {
						resolve({
							ANNO: oData.results[0].ANNO,
							//DDTEXT : oData.results[0].DDTEXT,
							DDTEXT: oData.results[0].FASE === "F" ? "Formazione" : oData.results[0].DDTEXT,
							STAT_FASE: oData.results[0].STAT_FASE === "0" ? "Disegno di legge di bilancio" : "Note di variazione",
						})
						that.getView().setModel(new JSONModel({
							ANNO: oData.results[0].ANNO,
							DDTEXT: oData.results[0].FASE === "F" ? "Formazione" : oData.results[0].DDTEXT,
							STAT_FASE: oData.results[0].STAT_FASE === "0" ? "Disegno di legge di bilancio" : "Note di variazione",
						}), "globalModel")
						//resolve(ritorno)
					},
					error: (err) => {
						reject(err)
					}
				})
			})
		},

		__getSottoStrumento(oKeySStr, sAnnoFase) {
			const oModel = this.getView().getModel("sapHanaS2")

			oModel.read("/SottostrumentoSet", {
				filters: [
					new Filter("Fikrs", FilterOperator.EQ, oKeySStr.Fikrs),
					new Filter("CodiceStrumento", FilterOperator.EQ, oKeySStr.CodiceStrumento),
					new Filter("CodiceStrumentoOri", FilterOperator.EQ, oKeySStr.CodiceStrumentoOri),
					new Filter("CodiceSottostrumento", FilterOperator.EQ, oKeySStr.CodiceSottostrumento),
					new Filter("Datbis", FilterOperator.EQ, new Date(oKeySStr.Datbis)),
					new Filter("AnnoSstr", FilterOperator.EQ, sAnnoFase)
				],
				urlParameters: {
					$expand: "DomInterno,DomAmministrazione,DomMissione,DomTitolo"
				},
				success: (oData, res) => {
					let modelPosFin = this.getView().getModel("modelPosFin")
					modelPosFin.setProperty("/Sottostrumento", `${oData.results[0].DescTipoSstr} - ${oData.results[0].NumeroSstr}`)
					modelPosFin.setProperty("/infoSottoStrumento", oData.results[0])
					//this.getView().byId('filterBarPosFin').setStrumento(oData.results[0].CodiceSottostrumento);
					this.__getHVValue()
					this.__getHVAmministrazione(oModel, modelPosFin, oData.results[0].DomAmministrazione)
					this.getView().setBusy(false)
				},
				error: (res) => {
					this.getView().setBusy(false)
				}
			})
		},

		onReset: function () {
			const modelPosFin = this.getView().getModel("modelPosFin");
			const modelHomePosFin = this.getView().getModel("modelHomePosFin");
			//Pulizia Tabella
			modelPosFin.setProperty("/adatta_filtri", {})
			modelPosFin.setProperty("/posFinHelp", {})
			modelPosFin.setProperty("/tablePosFin", [])
			modelHomePosFin.setProperty("/tablePosFin", [])

		},

		__getAnnoFase: function () {
			let modelTopologiche = this.getView().getModel("sapHanaS2Tipologiche")
			return new Promise((resolve, reject) => {
				modelTopologiche.read("/ZES_CAL_FIN_SET", {
					filters: [new Filter("FASE", FilterOperator.EQ, "F")],
					success: (oData) => {
						resolve(oData.results[0].ANNO)
					},
					error: (err) => {
						reject(err)
					}
				})
			})
		},

		__getHVValue: function () {

		},

		__getHVAmministrazione: function (modelHana, modelPosFin, aDomAmministrazione) {
            let filtersAmm = [new Filter("Fikrs", FilterOperator.EQ, "S001"),
							new Filter("Fase", FilterOperator.EQ, "DLB"),
							new Filter("Anno", FilterOperator.EQ, modelPosFin.getProperty("/infoSottoStrumento/AnnoSstr")),
							new Filter("Reale", FilterOperator.EQ, modelPosFin.getProperty("/infoSottoStrumento/Reale")),
                            new Filter("Datbis", FilterOperator.GE, new Date()),
                            new Filter("Prctr", FilterOperator.NE, "S000")
							]
            if(aDomAmministrazione.results.length > 0)
                filtersAmm.push(this.__getFiltersOR(aDomAmministrazione.results, "Prctr"))

			return new Promise((resolve, reject) => {
				modelHana.read("/TipAmministrazioneSet",{
					filters: filtersAmm,
					success: (oData) => {
						//debugger
						modelPosFin.setProperty("/formPosFin/amministrazioni", oData.results)
						resolve()
					},
					error:  (err) => {
						debugger
						resolve(err)
					}
				})
			})
		},

		__getFiltersOR: function (aData, field) {
			return new Filter({
				filters: function () {
					let aFilters = []
					for(let i =0 ; i < aData.length; i++){
						aFilters.push(new Filter(field, FilterOperator.EQ, aData[i][field]))
					}
					return aFilters
				}(),
				and: false,
			  })	
		},

		onMatchCodePress: async function (oEvent) {

			this.openBusyDialog("");
			let oView = this.getView();
			let sSourceId = oEvent.getSource().getId();

			// costruisco la popup di selelzione
			let oTemplate = this._getMatchCodeTemplate(sSourceId);
			let sPath = "matchCodeModel>/";
			let aSearchField = this._getMatchCodeSearchField(sSourceId);
			let aObjectList = await this._getModelForMatchcode(oView, sSourceId);

			oView.setModel(new JSONModel(aObjectList), "matchCodeModel");
			 
			let that = this;
			let ValueHelpDialog = new sap.m.SelectDialog({
				title: that.recuperaTestoI18n("cerca"),
				buttons: new sap.m.Button({
					text: that.recuperaTestoI18n("annulla"),
					type: sap.m.ButtonType.Emphasized
				}),
				items: {
					path: sPath,
					template: oTemplate
				},
				contentHeight: "60%",
				contentWidth: "30%",
				confirm: function(oConfirm) {
					// let sText = oConfirm.getParameter("selectedItem").getTitle();
					let oSelectedItem = oConfirm.getParameter("selectedItem");

					that._setInputValue(oView, sSourceId, oSelectedItem);
				},
				cancel: function(oCancel) {},
				search: function(oSearch) {
					let V = oSearch.getParameter("value");
					let h = aSearchField; // campi su cui cercare
					let k;
					if (h instanceof Array) {
						let l = [];
						for (let i = 0; i < h.length; i++) {
							let s = new sap.ui.model.Filter(h[i], sap.ui.model.FilterOperator.Contains, V);
							l.push(s);
						}
						k = new sap.ui.model.Filter(l, false);
					}
					oSearch.getSource().getBinding("items").filter([k]);
				}
			});

			sap.ui.getCore().byId(ValueHelpDialog.getAggregation("_dialog", null).getLeftButton()).setType("Emphasized");
			// ValueHelpDialog.setModel(oModel);
			oView.addDependent(ValueHelpDialog);
			this.closeBusyDialog();
			ValueHelpDialog.open("");
		},

		_setInputValue: function (oView, sId, oSelectedItem) {
			if (sId.includes("idCepacruma")) {
				oView.byId("idCepacruma").setValue(oSelectedItem.getDescription());
				oView.setModel({
					Livello: oSelectedItem.getTitle(),
					Denominazione: oSelectedItem.getDescription()
				}, "cepaCrumaModel");
			} else if (sId.includes("AmmFA")) {
				oView.byId("AmmFA").setValue(oSelectedItem.getTitle());
				oView.getModel("modelAdattaFiltri").setProperty("/CodiceAmmin", oSelectedItem.getTitle());
			}
		},

		_getMatchCodeSearchField: function (sId) {
			let aSearchField = [];

			if (sId.includes("idCepacruma")) {
				aSearchField.push("LIVELLO", "DENOMINAZIONE");
			} else if (sId.includes("AmmFA")) {
				aSearchField.push("prctr", "desc_breve");
			}
			return aSearchField;
		},

		_getMatchCodeTemplate: function (sId) {
			let oTemplate;

			if (sId.includes("idCepacruma")) {
				oTemplate = {
					title: "{matchCodeModel>LIVELLO}",
					description: "{matchCodeModel>DENOMINAZIONE}"
				}
			} else if (sId.includes("AmmFA")) {
				oTemplate = {
					title: "{matchCodeModel>prctr}",
					description: "{matchCodeModel>desc_breve}"
				}
			}

			return new sap.m.StandardListItem(oTemplate);
		},
		
		_getModelForMatchcode: async function(oView, sId) {
			let aResults = [];
			let aFilter = [];

			if (sId.includes("idCepacruma")) {
				aResults = await this._readFromDb("5", "/ZET_CEPACRUMASet", aFilter, []);
			} else if (sId.includes("AmmFA")) {
				// let sToday = new Date().toISOString().slice(0,10).replace(/-/g,"");

				// aFilter.push(new Filter("FIKRS", sap.ui.model.FilterOperator.EQ, "S001"));
				// aFilter.push(new Filter("PRCTR", sap.ui.model.FilterOperator.NE, "S000"));
				// aFilter.push(new Filter("VERSIONE", sap.ui.model.FilterOperator.EQ, "D"));
				// aFilter.push(new Filter("REALE", sap.ui.model.FilterOperator.EQ, "R"));
				// aFilter.push(new Filter("FASE", sap.ui.model.FilterOperator.EQ, "DLB"));
				// aFilter.push(new Filter("ANNO", sap.ui.model.FilterOperator.EQ, (new Date()).getFullYear().toString()));
				// aFilter.push(new Filter("DATAB", sap.ui.model.FilterOperator.LE, sToday));
				// aFilter.push(new Filter("DATBIS", sap.ui.model.FilterOperator.GE, sToday));

				aResults = await this._readFromDb("6", "/zktip_amm_01", aFilter, []);
				aResults.sort((a,b) => (a.prctr > b.prctr) ? 1 : ((b.prctr > a.prctr) ? -1 : 0));
			}
			
			return aResults;
		},

		afterDialogClose: function (oEvent) {
			oEvent.getSource().destroy();
		}

	});
});