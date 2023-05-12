sap.ui.define(
	[
		"zsap/com/r3/cobi/s4/ecobilancioigb/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/core/Fragment",
		"zsap/com/r3/cobi/s4/ecobilancioigb/model/models",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/m/MessageBox"
	],//"zsap/com/r3/cobi/s4/custadattafiltri/spese/adattafiltrispese/controls/InputAdattaFiltriSpese",
	function (
		BaseController,
		JSONModel,
		//Bar,
		Fragment,
		models,
		Filter,
		FilterOperator,
		MessageBox
	) {
		"use strict";

		//TODO:
		// 5) funzione di export
		// 6) il tasto salva fa la stessa cosa di aps e ecobil
		// 7) prendi le funzioni dei tasti seleziona e annulla dei popup del matchcode posfin
		// 8) cerca di impostare l'esito in tabella col valore preso dal backend
		// 9) DAI PRIORITÀ A SISTEMARE I FILTRI IN MODO CHE FUNZIONINO ---> fai riferimento allo screen che ha passato Ilaria in chat di gruppo
		// 10) Lunedì chiedi a Mir di aggiungere il campo "Stato" nell'entity set ZES_AVVIOSet
		// 11) I filtri spese funzionamento, nuova istituzione, spese correnti e spese conto capitale non sono compatibili con ZES_AVVIOSet, indaga
		// 12) Nell'entity set ZES_AVVIOSet ci sono due spese int, indaga

		return BaseController.extend(
			"zsap.com.r3.cobi.s4.ecobilancioigb.controller.Home",
			{
				models: models,
				//Bar: Bar,
				onInit: function () {
					this.getOwnerComponent().getRouter().getRoute("Home").attachPatternMatched(this._onObjectMatched, this);
					this.getView().setModel(new JSONModel(), "modelAdattaFiltri");

					this.getData();
				},

				_onObjectMatched: async function (oEvent) {

					this.getView().setModel(new JSONModel({
						Cdr			: false,
						Missione 	: false,
						Programma 	: false,
						Azione 		: false,
						DenCap 		: false,
						DenPg 		: false
					}), "criteriModel");

					this.getView().setModel(new JSONModel({
						enabled: false
					}), "listaButtonEnabled");

					this.getView().setModel(new JSONModel([]), "modelEcobilancio");
					this.getView().setModel(new JSONModel([]), "modelAnalisi");

					// this.getView().setModel(new JSONModel({
					// 	Cdr			: true,
					// 	Missione 	: true,
					// 	Programma 	: true,
					// 	Azione 		: true,
					// 	DenCap 		: true,
					// 	DenPg 		: true
					// }), "criteriEnabledModel");

					// disattivo checkbox selectAll dalle tabelle
					// this.getView().byId("tableEcobilancio")._getSelectAllCheckbox().setVisible(false);
					// this.getView().byId("tableAnalisi")._getSelectAllCheckbox().setVisible(false);

					this.getView().setModel(new JSONModel(this.models.getModelTableExpansion()),"modelTableExpansion");
					this.getView().setModel(new JSONModel(this.models.getModelEsito()),"modelEsito");
					this.getView().setModel(new JSONModel(this.models.getModelEsitoTable()),"modelEsitoTable");
					this.getView().setModel(new JSONModel(this.models.getModelAnnoConfronto()),"modelAnnoConfronto");
					this.getView().setModel(new JSONModel(this.models.getModelSpeseInterne()),"modelSpeseInt");
					this.getView().setModel(new JSONModel(this.models.getModelSpeseInterneFilter()),"modelSpeseIntFilter");
					this.getView().setModel(new JSONModel(this.models.getModelSpeseInterneRows()),"modelSpeseIntRows");
					this.getView().setModel(new JSONModel(this.models.getModelSpeseDirTrasf()),"modelSpeseDirTrasf");
					this.getOwnerComponent().setModel(new JSONModel(this.models.getModelPosFin()),"modelPosFin");
					this.getView().setModel(new JSONModel(this.models.getModelHomePosFin()),"modelHomePosFin");
					this.getView().setModel(new JSONModel(this.models.getModelMultiambito()),"modelMultiambito");
					//this.Bar.prototype.addFilterItem("B","G1","idAmministrazione","Amministrazione");

					// robe copiate da gestposfin
					this.getView().getModel("modelPosFin").setProperty("/initialDetail", true);
					this.getView().getModel("modelPosFin").setProperty("/form", {});
					this.getView().getModel("modelPosFin").setProperty("/formPosFin", {amministrazioni: [],capitoli: [],pg: [],});
					this.getView().getModel("modelPosFin").setProperty("/adatta_filtri", {});
					this.getView().getModel("modelPosFin").setProperty("/posFinHelp", {});
					this.getView().getModel("modelPosFin").setProperty("/tablePosFin", []);
					this.getView().getModel("modelPosFin").setProperty("/elencoPosFin", []);
					// this.getView().getModel("modelPosFin").setProperty("/action_filtri", {})
					const oKeySStr = oEvent.getParameter("arguments");
					let sAnnoFase = await this.__getAnnoFase(true);
					this.getView().getModel("modelAnnoConfronto").setProperty("/anno1", sAnnoFase);
					this.getView().getModel("modelAnnoConfronto").setProperty("/anno2", sAnnoFase - 1);
					await this.__getAnnoFaseProcessoMacroFase();
					this.getView().getModel("modelPosFin").setProperty("/esercizio", sAnnoFase);
					this.__getSottoStrumento(oKeySStr, sAnnoFase);
					this.onReset();
				},

				getData: function () {
					this._getAmministrazioniModel();
				},

				_getAmministrazioniModel: async function () {
					let aResults = await this._readFromDb("6", "/zktip_amm_01", [], []);
					aResults.sort((a,b) => (a.prctr > b.prctr) ? 1 : ((b.prctr > a.prctr) ? -1 : 0));

					this.getView().setModel(new JSONModel(aResults), "amministrazioniModel");
				},

				onClear: function(oEvent) {
					this._onClearInput(oEvent);
					/* var oTreeTablePF = this.getView().byId("treeTablePF");
					oTreeTablePF.unbindRows(); */
					//lt da togliere quando ci saranno i coni visibilità ecc
					// this.getView().byId("AmmFA").setValue("A020");
					this.getView().byId("AmmFA").setValue("");
					
					this.getView().setModel(new JSONModel({
						Cdr			: false,
						Missione 	: false,
						Programma 	: false,
						Azione 		: false,
						DenCap 		: false,
						DenPg 		: false
					}), "criteriModel");

					this.getView().setModel(new JSONModel({
						enabled: false
					}), "listaButtonEnabled");

					// pulizia modello
					this.getView().setModel(new JSONModel([]), "modelAnalisi");
					this.getView().setModel(new JSONModel([]), "modelEcobilancio");

					// attivo i checkbox criteri
					// this.getView().setModel(new JSONModel({
					// 	Cdr			: true,
					// 	Missione 	: true,
					// 	Programma 	: true,
					// 	Azione 		: true,
					// 	DenCap 		: true,
					// 	DenPg 		: true
					// }), "criteriEnabledModel");
				},

				onChangeSpeseInt: function (oEvent, sTable) {
					//lt verifico che tabella é selezionata
					var tableEcobilancio =this.byId("tableEcobilancio");
					
					var tableEcobilancioVis = tableEcobilancio.getVisible();
					
					var model;
					if(tableEcobilancioVis){
						model = "modelEcobilancio";
					}else{
						model = "modelAnalisi";
					}

					var sPath = oEvent.getSource().getParent().getBindingContextPath();
					var oRow = this.getView().getModel(model).getObject(sPath);

					if (model === "modelEcobilancio") {
						if ((oRow.esito_eco === "SFI" || oRow.esito_eco === "SNA") && (oRow.SpeseInt === "IU" || oRow.SpeseInt === "IP")) {
							this.messageChangeStato("esitoSpeseIntNotValid", "", "warning2");
							oRow.SpeseInt = oRow.SpeseInt_previous;
							return;
						} else {
							oRow.SpeseInt_previous = oRow.SpeseInt;
						}
					} else {
						if ((oRow.EsitoEco === "SFI" || oRow.EsitoEco === "SNA") && (oRow.Speseint === "IU" || oRow.Speseint === "IP")) {
							this.messageChangeStato("esitoSpeseIntNotValid", "", "warning2");
							oRow.Speseint = oRow.Speseint_previous;
							return;
						} else {
							oRow.Speseint_previous = oRow.Speseint;
						}
					}
				},

				// ----------------------- GESTIONE DELLE SELECT
				onChangeEsito: function (oEvent, sTable) {
					//lt verifico che tabella é selezionata
					var tableEcobilancio =this.byId("tableEcobilancio");
					var tableAnalisi =this.byId("tableAnalisi");
					//tableAnalisi
					
					var tableEcobilancioVis = tableEcobilancio.getVisible();
					//var tableAnalisiVis = tableAnalisi.getVisible();
					
					var model,table;
					if(tableEcobilancioVis){
						model = "modelEcobilancio";
						table = tableEcobilancio;
					}else{
						model = "modelAnalisi";
						table = tableAnalisi;
					}

					var sEsito = oEvent.getParameters().selectedItem.getProperty("text");
					var sPath = oEvent.getSource().getParent().getBindingContextPath();
					var oRow = this.getView().getModel(model).getObject(sPath);
					var oTable = this.getView().getModel(model);
					var fnSetRowLivelli = function (oRow, sLivello, sValue) {
						for (let i = 1; i <= 16; i++) {
							oRow[sLivello + i] = sValue;
						}
					}

					if (model === "modelEcobilancio") {

						if ((oRow.esito_eco === "SFI" || oRow.esito_eco === "SNA") && (oRow.SpeseInt === "IU" || oRow.SpeseInt === "IP")) {
							this.messageChangeStato("esitoSpeseIntNotValid", "", "warning2");
							oRow.esito_eco = oRow.esito_eco_previous;
							return;
						} else {
							oRow.esito_eco_previous = oRow.esito_eco;
						}

						oRow.esito_eco = sEsito;
						switch (oRow.esito_eco) {
							case "SNA":
								oRow.esito_eco_perc = "0";
								oRow.ENABLED_ESITOPERC = false;
								oRow.ENABLED_LIVELLO = false;
								fnSetRowLivelli(oRow, "livello", "");
								oTable.refresh();
								break;
							case "SFI":
								oRow.esito_eco_perc = "0";
								oRow.ENABLED_ESITOPERC = false;
								oRow.ENABLED_LIVELLO = false;
								fnSetRowLivelli(oRow, "livello", "");
								oTable.refresh();
								break;
							case "SEA":
								oRow.esito_eco_perc = "100";
								oRow.ENABLED_ESITOPERC = false;
								oRow.ENABLED_LIVELLO = true;
								oTable.refresh();
								break;
							case "SCA":
								oRow.esito_eco_perc = "100";
								oRow.ENABLED_ESITOPERC = false;
								oRow.ENABLED_LIVELLO = true;
								oTable.refresh();
								break;
							case "SPA":
								oRow.esito_eco_perc = "";
								oRow.ENABLED_ESITOPERC = true;
								oRow.ENABLED_LIVELLO = true;
								oTable.refresh();
								break;
							case "":
								oRow.ENABLED_ESITOPERC = false;
								oRow.ENABLED_LIVELLO = false;
								fnSetRowLivelli(oRow, "Livello", "");
								oTable.refresh();
								break;

						}
					} else {

						if ((oRow.EsitoEco === "SFI" || oRow.EsitoEco === "SNA") && (oRow.Speseint === "IU" || oRow.Speseint === "IP")) {
							this.messageChangeStato("esitoSpeseIntNotValid", "", "warning2");
							oRow.EsitoEco = oRow.EsitoEco_previous;
							return;
						} else {
							oRow.EsitoEco_previous = oRow.EsitoEco;
						}

						oRow.EsitoEco = sEsito;
						switch (oRow.EsitoEco) {
							case "SNA":
								oRow.EsitoEcoPerc = "0";
								oRow.ENABLED_ESITOPERC = false;
								oRow.ENABLED_LIVELLO = false;
								fnSetRowLivelli(oRow, "Livello", "");
								oTable.refresh();
								break;
							case "SFI":
								oRow.EsitoEcoPerc = "0";
								oRow.ENABLED_ESITOPERC = false;
								oRow.ENABLED_LIVELLO = false;
								fnSetRowLivelli(oRow, "Livello", "");
								oTable.refresh();
								break;
							case "SEA":
								oRow.EsitoEcoPerc = "100";
								oRow.ENABLED_ESITOPERC = false;
								oRow.ENABLED_LIVELLO = true;
								oTable.refresh();
								break;
							case "SCA":
								oRow.EsitoEcoPerc = "100";
								oRow.ENABLED_ESITOPERC = false;
								oRow.ENABLED_LIVELLO = true;
								oTable.refresh();
								break;
							case "SPA":
								oRow.EsitoEcoPerc = "";
								oRow.ENABLED_ESITOPERC = true;
								oRow.ENABLED_LIVELLO = true;
								oTable.refresh();
								break;
							case "":
								oRow.ENABLED_ESITOPERC = false;
								oRow.ENABLED_LIVELLO = false;
								fnSetRowLivelli(oRow, "Livello", "");
								oTable.refresh();
								break;
						}
					}
					
				},

				onChangeSpesaInt: function (oEvent, sTable) {
					if(sTable === 'analisi'){
						
					}
					if(sTable === 'ecobilancio'){
						
					}
				},

				// onChangeSpesaInt: function (oEvent, sTable) {
				// 	if(sTable === 'analisi'){
				// 		let modelAnalisi = this.getView().getModel("modelAnalisi").getData();
				// 		modelAnalisi.SpeseInterne = oEvent.getParameters().selectedItem.getProperty("text");
				// 	}
				// 	if(sTable === 'ecobilancio'){
				// 		let modelEcobilancio = this.getView().getModel("modelEcobilancio").getData();
				// 		modelEcobilancio.SpeseInt = oEvent.getParameters().selectedItem.getProperty("text");
				// 	}
				// },

				// ------------------------modelli visibilità
				
				// NON SERVE, PRIMA DI ELIMINARLA RICONTROLLA
				onChangeSelect: function (oEvent) {
					let sKey = oEvent.getParameters().selectedItem.getKey();
					switch (sKey) {
						case "2023":
							this.getView().getModel("modelChangeSelect").setProperty("/2023", true);
							this.getView().getModel("modelChangeSelect").setProperty("/2024", false);
							break;
						case "2024":
							this.getView().getModel("modelChangeSelect").setProperty("/2023", false);
							this.getView().getModel("modelChangeSelect").setProperty("/2024", true);
							break;
					}
				},

				onTabBarSelect: function (oEvent, sKey) {
					if (oEvent !== null) {
						var sKey = oEvent.getParameter("key");
					}
					switch (sKey) {
						case "keyAnalisi":
							this.getView().byId("tableAnalisi").setVisible(true);
							this.getView().byId("tableEcobilancio").setVisible(false);
							break;
						case "keyEcobilancio":
							this.getView().byId("tableAnalisi").setVisible(false);
							this.getView().byId("tableEcobilancio").setVisible(true);
							break;
					}
				},

				onPressListaRidotta: function () {
					this.getView().getModel("modelTableExpansion").setProperty("/isExpanded", false);
					this.getView().getModel("modelTableExpansion").setProperty("/isCompressed", true);
				},

				onPressListaEstesa: function () {
					this.getView().getModel("modelTableExpansion").setProperty("/isExpanded", true);
					this.getView().getModel("modelTableExpansion").setProperty("/isCompressed", false);
				},

				// ------------------------funzioni dei button Avvio e Salva

				onSearch: async function () {
					var aFilters = new Filter({
						filters: [],
						and: true,
					});

					//controllo sui criteri di confronto
					let flagCriteri = 0;
					let critCdr = this.getView().byId("idCritCdr").getSelected();
					if (critCdr === true) {
						flagCriteri = 1;
					}
					let critMissione = this.getView().byId("idCritMissione").getSelected();
					if (critMissione === true) {
						flagCriteri = 1;
					}
					let critProgramma = this.getView().byId("idCritProgramma").getSelected();
					if (critProgramma === true) {
						flagCriteri = 1;
					}
					let critCritAzione = this.getView().byId("idCritAzione").getSelected();
					if (critCritAzione === true) {
						flagCriteri = 1;
					}
					let critDenomCap = this.getView().byId("idCritDenomCap").getSelected();
					if (critDenomCap === true) {
						flagCriteri = 1;
					}
					let critDenomPg = this.getView().byId("idCritDenomPg").getSelected();
					if (critDenomPg === true) {
						flagCriteri = 1;
					}
					
					//LETTURA ANALISI CLASSIFICATORIA
					
					if (flagCriteri === 1) {

						// filtro amministrazione
						var ammin = this.getView().byId("AmmFA").getValue();
						if (ammin) {
							aFilters.aFilters.push(new Filter("CodiceAmmin", sap.ui.model.FilterOperator.EQ, ammin));
						}

						// valori dei filtri
						if(this.byId("idPosFin")) var posfin = this.getView().byId("idPosFin").getValue();
						/* var posfin = this.getView().byId("idPosFin").getValue();
						if (posfin) {
							aFilters.aFilters.push(new Filter("Fipex", sap.ui.model.FilterOperator.EQ, posfin));
						} */
						var sCapitolo = this.getView().byId("idCapitolo").getValue();
						if (sCapitolo) {
							aFilters.aFilters.push(new Filter("CodiceCapitolo", sap.ui.model.FilterOperator.EQ, sCapitolo));
						}
						var speseFunz = this.getView().byId("idSpeseFunzionamento").getSelected();
						if (speseFunz) {
							aFilters.aFilters.push(new Filter("SpeFunz", sap.ui.model.FilterOperator.EQ, "X"));
						}
						var speseInt = this.getView().byId("idSpeseInterne").getSelectedKey();
						if (speseInt) {
							speseInt !== "NO" ? speseInt = speseInt : speseInt = "",
							aFilters.aFilters.push(new Filter("SpeInt",sap.ui.model.FilterOperator.EQ,speseInt));
						}
						var nuovaIstit = this.getView().byId("idNuovaIstituzione").getSelected();
						if (nuovaIstit) {
							aFilters.aFilters.push(new Filter("NewFipex", sap.ui.model.FilterOperator.EQ, nuovaIstit));
						}
						var noCC = this.getView().byId("idNoCepacruma").getSelected();
						if (noCC) {
							aFilters.aFilters.push(new Filter("NoCeCru", sap.ui.model.FilterOperator.EQ, "X"));
						}
						var esito = this.getView().byId("idEsito").getSelectedKey();
						if (esito) {
							aFilters.aFilters.push(new Filter("EsitoEco", sap.ui.model.FilterOperator.EQ, esito));
						}
						var multiambito = this.getView().byId("idMultiambito").getSelectedKey();
						if (multiambito) {
							aFilters.aFilters.push(new Filter("Multiambito",sap.ui.model.FilterOperator.EQ,multiambito));
						}
						var cepacruma = this.getView().byId("idCepacruma").getValue();
						if (cepacruma) {
							var cepaCrumaModel = this.getView().getModel("cepaCrumaModel");
							aFilters.aFilters.push(new Filter("Livello" + parseInt(cepaCrumaModel.Livello), sap.ui.model.FilterOperator.EQ, cepaCrumaModel.Denominazione));
							// aFilters.aFilters.push(new Filter("fipex", sap.ui.model.FilterOperator.EQ, cepacruma));
						}
						// let categorie = ["1","2","3","10","11","12","13","21","31"];
						var speseDir = this.getView().byId("idSpeseDirette").getSelected();
						if (speseDir) {
							aFilters.aFilters.push(new Filter("SpeDirette", sap.ui.model.FilterOperator.EQ, "X"));
							// aFilters.aFilters.push(new Filter("CodiceCategoria", sap.ui.model.FilterOperator.Contains, categorie));
						}
						var speseTrasferite = this.getView().byId("idSpeseTrasf").getSelected();
						// categorie = [4,5,6,7,8,22,23,24,26,27];
						if (speseTrasferite) {
							aFilters.aFilters.push(new Filter("SpeTrasferite", sap.ui.model.FilterOperator.EQ, "X"));
						}
						var speseCorr = this.getView().byId("idSpeseCorrenti").getSelected();
						if (speseCorr) {
							aFilters.aFilters.push(new Filter("SpeCorrenti", sap.ui.model.FilterOperator.EQ, "X"));
						}
						var speseContoCapitale = this.getView().byId("idSpeseContoCap").getSelected();
						if (speseContoCapitale) {
							aFilters.aFilters.push(new Filter("SpeCcap", sap.ui.model.FilterOperator.EQ, "X"));
						}
						var sRicercaDescr = this.getView().byId("idRicercaDescr").getValue();
						if (sRicercaDescr) {
							aFilters.aFilters.push(new Filter("TextSearch", sap.ui.model.FilterOperator.EQ, sRicercaDescr));
						}

						var selectedIndex = this.getView().byId("filtroAndOr").getSelectedIndex();

						if(selectedIndex === 0) aFilters.aFilters.push(new Filter("FlagCriteriAnd", sap.ui.model.FilterOperator.EQ, true));

						aFilters = this._setFlagFilters(aFilters, selectedIndex);
						// var ammin = this.getView().byId("idAmministrazione").getValue();
						// var ammin = this.getView().getModel("modelAdattaFiltri").getData().CodiceAmmin;
						// if (ammin !== undefined && ammin.length !== 0) {
						// 	aFilters.aFilters.push(new Filter("Prctr", sap.ui.model.FilterOperator.EQ, ammin));
						// }
						// aFilters.aFilters.push(new Filter("Anno", sap.ui.model.FilterOperator.EQ, "2024"));
            			// aFilters.aFilters.push(new Filter("Reale", sap.ui.model.FilterOperator.EQ, "R"));
						this.openBusyDialog();
						var aResult = await this._readFromDb("5","/EcoBilIgb_Analisi_ClassSet",aFilters.aFilters,[]);
						this.closeBusyDialog();

						// TOGLI IN DEPLOY
						//console.log(aResult);

						this._setCustomFields(aResult, "analisi");

						this.getView().setModel(new JSONModel(aResult), "modelAnalisi");
						this.onTabBarSelect(null, "keyAnalisi");
						this.getView().byId("idTabBar").setSelectedKey("keyAnalisi");
						this.getView().getModel("modelAnalisi").refresh();

						// if (aResult.length) {
						// 	// disattivo i checkbox criteri
						// 	this.getView().setModel(new JSONModel({
						// 		Cdr			: false,
						// 		Missione 	: false,
						// 		Programma 	: false,
						// 		Azione 		: false,
						// 		DenCap 		: false,
						// 		DenPg 		: false
						// 	}), "criteriEnabledModel");
						// }
					}

					//LETTURA ECOBILANCIO
					
					if (flagCriteri === 0) {
						
						// filtro amministrazione
						var ammin = this.getView().byId("AmmFA").getValue();
						if (ammin) {
							aFilters.aFilters.push(new Filter("codice_ammin", sap.ui.model.FilterOperator.EQ, ammin));
						}

						// valori dei filtri
						if(this.byId("idPosFin")) var posfin = this.getView().byId("idPosFin").getValue();
						/* var posfin = this.getView().byId("idPosFin").getValue();
						if (posfin) {
							aFilters.aFilters.push(new Filter("fipex", sap.ui.model.FilterOperator.EQ, posfin));
						} */

						var sCapitolo = this.getView().byId("idCapitolo").getValue();
						if (sCapitolo) {
							aFilters.aFilters.push(new Filter("codice_capitolo", sap.ui.model.FilterOperator.EQ, sCapitolo));
						}

						var speseFunz = this.getView().byId("idSpeseFunzionamento").getSelected();
						if (speseFunz) {
							aFilters.aFilters.push(new Filter("SpeFunz", sap.ui.model.FilterOperator.EQ, "X"));
						}

						var speseInt = this.getView().byId("idSpeseInterne").getSelectedKey();
						if (speseInt) {
							speseInt !== "NO" ? speseInt = speseInt : speseInt = "",
							aFilters.aFilters.push(new Filter("Spese_int", sap.ui.model.FilterOperator.EQ, speseInt));
						}
						var nuovaIstit = this.getView().byId("idNuovaIstituzione").getSelected();
						if (nuovaIstit) {
							aFilters.aFilters.push(new Filter("NewFipex", sap.ui.model.FilterOperator.EQ, nuovaIstit));
						}
						var noCC = this.getView().byId("idNoCepacruma").getSelected();
						if (noCC) {
							aFilters.aFilters.push(new Filter("NoCeCru", sap.ui.model.FilterOperator.EQ, "X"));
						}
						var esito = this.getView().byId("idEsito").getSelectedKey();
						if (esito) {
							aFilters.aFilters.push(new Filter("esito_eco", sap.ui.model.FilterOperator.EQ, esito));
						}
						
						var multiambito = this.getView().byId("idMultiambito").getSelectedKey();
						// if (multiambito && esito !== "SNA" && esito !== "SFI" && esito !== "SPA") {
						if (multiambito) {
							aFilters.aFilters.push(new Filter("multiambito",sap.ui.model.FilterOperator.EQ,multiambito));
						}
						
						var cepacruma = this.getView().byId("idCepacruma").getValue();
						if (cepacruma) {
							var cepaCrumaModel = this.getView().getModel("cepaCrumaModel");
							aFilters.aFilters.push(new Filter("livello" + parseInt(cepaCrumaModel.Livello), sap.ui.model.FilterOperator.EQ, cepaCrumaModel.Denominazione));
							// aFilters.aFilters.push(new Filter("fipex", sap.ui.model.FilterOperator.EQ, cepacruma));
						}
						
						var speseDir = this.getView().byId("idSpeseDirette").getSelected();
						if (speseDir) {
							aFilters.aFilters.push(new Filter("spese_dir",sap.ui.model.FilterOperator.EQ, "X"));
						}
						
						var speseTrasf = this.getView().byId("idSpeseTrasf").getSelected();
						if (speseTrasf) {
							aFilters.aFilters.push(new Filter("SpeTrasferite", sap.ui.model.FilterOperator.EQ, "X"));
						}
						
						var speseCorr = this.getView().byId("idSpeseCorrenti").getSelected();
						if (speseCorr) {
							aFilters.aFilters.push(new Filter("SpeCorrenti", sap.ui.model.FilterOperator.EQ, "X"));
						}
						
						var speseConCap = this.getView().byId("idSpeseContoCap").getSelected();
						if (speseConCap) {
							aFilters.aFilters.push(new Filter("SpeCcap", sap.ui.model.FilterOperator.EQ, "X"));
						}

						var sRicercaDescr = this.getView().byId("idRicercaDescr").getValue();
						if (sRicercaDescr) {
							aFilters.aFilters.push(new Filter("TextSearch", sap.ui.model.FilterOperator.EQ, sRicercaDescr));
						}
						
						this.openBusyDialog();
						var aResult = await this._readFromDb("5","/ZES_AVVIOSet",aFilters.aFilters,[]);
						this.closeBusyDialog();

						this._setCustomFields(aResult, "ecobilancio");

						this.getView().setModel(new JSONModel(aResult), "modelEcobilancio");
						this.onTabBarSelect(null, "keyEcobilancio");
						this.getView().byId("idTabBar").setSelectedKey("keyEcobilancio");
						this.getView().getModel("modelEcobilancio").refresh();

						if (aResult.length) {
	 						this.getView().setModel(new JSONModel({
								enabled: true
							}), "listaButtonEnabled");
						}

						// if (aResult.length) {
						// 	// disattivo i checkbox criteri
						// 	this.getView().setModel(new JSONModel({
						// 		Cdr			: false,
						// 		Missione 	: false,
						// 		Programma 	: false,
						// 		Azione 		: false,
						// 		DenCap 		: false,
						// 		DenPg 		: false
						// 	}), "criteriEnabledModel");
						// }
					}
				},

				_setCustomFields: function (aData, sType) {
					aData.forEach(row => {
						row.ENABLED = false;

						if (sType === "ecobilancio") {

							row.esito_eco_previous = row.esito_eco;
							row.SpeseInt_previous = row.SpeseInt;

							if (row.esito_eco === "SPA") {
								row.ENABLED_ESITOPERC = true;
							} else {
								row.ENABLED_ESITOPERC = false;
							}

							if (row.esito_eco_perc === "0" || parseFloat(row.esito_eco_perc) === 0 || row.esito_eco_perc === "") {
								row.ENABLED_LIVELLO = false;
							} else {
								row.ENABLED_LIVELLO = true;
							}
						}

						if (sType === "analisi") {

							row.EsitoEco_previous = row.EsitoEco;
							row.Speseint_previous = row.Speseint;

							if (row.EsitoEco === "SPA") {
								row.ENABLED_ESITOPERC = true;
							} else {
								row.ENABLED_ESITOPERC = false;
							}

							if (row.EsitoEcoPerc === "0"  || parseFloat(row.EsitoEcoPerc) === 0  || row.EsitoEcoPerc === "") {
								row.ENABLED_LIVELLO = false;
							} else {
								row.ENABLED_LIVELLO = true;
							}
						}
					});
				},

				_setFlagFilters: function (oFilter, selectedIndex) {
					let oCriteri = this.getView().getModel("criteriModel").getData();
									
					for (const [key, value] of Object.entries(oCriteri)) {
						if (key === "Cdr" && value) {
							oFilter.aFilters.push(new Filter("FlagCdr", sap.ui.model.FilterOperator.EQ, "X"));
						}
						if (key === "Missione" && value) {
							oFilter.aFilters.push(new Filter("FlagMissione", sap.ui.model.FilterOperator.EQ, "X"));
						}
						if (key === "Programma" && value) {
							oFilter.aFilters.push(new Filter("FlagProgramma", sap.ui.model.FilterOperator.EQ, "X"));
						}
						if (key === "Azione" && value) {
							oFilter.aFilters.push(new Filter("FlagAzione", sap.ui.model.FilterOperator.EQ, "X"));
						}
						if (key === "DenCap" && value) {
							oFilter.aFilters.push(new Filter("FlagCapitolo", sap.ui.model.FilterOperator.EQ, "X"));
						}
						if (key === "DenPg" && value) {
							oFilter.aFilters.push(new Filter("FlagPg", sap.ui.model.FilterOperator.EQ, "X"));
						}
					}
					
					return oFilter;
				},
				_setFlagFiltersNew: function (oFilter, selectedIndex) {
					let oCriteri = this.getView().getModel("criteriModel").getData();

					var filtroOr = [];

					if(selectedIndex && selectedIndex === 1){
						for (const [key, value] of Object.entries(oCriteri)) {
							if (key === "Cdr" && value) {
								filtroOr.push(new Filter("FlagCdr", sap.ui.model.FilterOperator.EQ, "X"));
							}
							if (key === "Missione" && value) {
								filtroOr.push(new Filter("FlagMissione", sap.ui.model.FilterOperator.EQ, "X"));
							}
							if (key === "Programma" && value) {
								filtroOr.push(new Filter("FlagProgramma", sap.ui.model.FilterOperator.EQ, "X"));
							}
							if (key === "Azione" && value) {
								filtroOr.push(new Filter("FlagAzione", sap.ui.model.FilterOperator.EQ, "X"));
							}
							if (key === "DenCap" && value) {
								filtroOr.push(new Filter("FlagCapitolo", sap.ui.model.FilterOperator.EQ, "X"));
							}
							if (key === "DenPg" && value) {
								filtroOr.push(new Filter("FlagPg", sap.ui.model.FilterOperator.EQ, "X"));
							}
						}
					}else{
						for (const [key, value] of Object.entries(oCriteri)) {
							if (key === "Cdr" && value) {
								oFilter.aFilters.push(new Filter("FlagCdr", sap.ui.model.FilterOperator.EQ, "X"));
							}
							if (key === "Missione" && value) {
								oFilter.aFilters.push(new Filter("FlagMissione", sap.ui.model.FilterOperator.EQ, "X"));
							}
							if (key === "Programma" && value) {
								oFilter.aFilters.push(new Filter("FlagProgramma", sap.ui.model.FilterOperator.EQ, "X"));
							}
							if (key === "Azione" && value) {
								oFilter.aFilters.push(new Filter("FlagAzione", sap.ui.model.FilterOperator.EQ, "X"));
							}
							if (key === "DenCap" && value) {
								oFilter.aFilters.push(new Filter("FlagCapitolo", sap.ui.model.FilterOperator.EQ, "X"));
							}
							if (key === "DenPg" && value) {
								oFilter.aFilters.push(new Filter("FlagPg", sap.ui.model.FilterOperator.EQ, "X"));
							}
						}
					
					}	
					 if(selectedIndex && selectedIndex === 1){
						oFilter.aFilters = [new Filter({
							filters: filtroOr,
							and: false,
						  })];
					}

					return oFilter;
				},
				
				onSalva: async function () {

					//lt verifico che tabella é selezionata
					var tableEcobilancio =this.byId("tableEcobilancio");
					var tableAnalisi =this.byId("tableAnalisi");
					//tableAnalisi
					
					var tableEcobilancioVis = tableEcobilancio.getVisible();
					//var tableAnalisiVis = tableAnalisi.getVisible();
					
					var model,table;
					if(tableEcobilancioVis){
						model = "modelEcobilancio";
						table = tableEcobilancio;
					}else{
						model = "modelAnalisi";
						table = tableAnalisi;
					}

					var oTable = this.getView().getModel(model).getData();
					var index = 1; //serve?
					var aSelectedRows = table.getSelectedItems();
					if (aSelectedRows.length > 0) {
						for (var i = 0; i < aSelectedRows.length; i++) {
							var indexSel = i + 1;
							var oRow = aSelectedRows[i].getBindingContext(model).getObject();
							if (model === "modelEcobilancio") {
								var obj = {
									Fikrs: oRow.fikrs,
									Fase: oRow.fase,
									Fipex: oRow.fipex,
									Esito_perc: oRow.esito_eco_perc,
									Esito: oRow.esito_eco,
									Nota: oRow.Nota,
									Speseint: oRow.SpeseInt,
									Livello1: oRow.livello1,
									Livello2: oRow.livello2,
									Livello3: oRow.livello3,
									Livello4: oRow.livello4,
									Livello5: oRow.livello5,
									Livello6: oRow.livello6,
									Livello7: oRow.livello7,
									Livello8: oRow.livello8,
									Livello9: oRow.livello9,
									Livello10: oRow.livello10,
									Livello11: oRow.livello11,
									Livello12: oRow.livello12,
									Livello13: oRow.livello13,
									Livello14: oRow.livello14,
									Livello15: oRow.livello15,
									Livello16: oRow.livello16,
								}
								var sLivelli = this.checkLivelli(oRow.livello1) + this.checkLivelli(oRow.livello2) + this.checkLivelli(oRow.livello3) + this.checkLivelli(
									oRow.livello4) + this.checkLivelli(oRow.livello5) +
								this.checkLivelli(oRow.livello6) + this.checkLivelli(oRow.livello7) + this.checkLivelli(oRow.livello8) + this.checkLivelli(oRow.livello9) +
								this.checkLivelli(oRow.livello10) + this.checkLivelli(oRow.livello11) +
								this.checkLivelli(oRow.livello12) + this.checkLivelli(oRow.livello13) + this.checkLivelli(oRow.livello14) + this.checkLivelli(
									oRow.livello15) + this.checkLivelli(oRow.livello16);
								var sEsitoPerc = this.checkLivelli(oRow.esito_eco_perc);
								var sEsito = oRow.esito_eco;
							} else {
								var obj = {
									Fikrs: oRow.Fikrs,
									Fase: oRow.Fase,
									Fipex: oRow.Fipex,
									Esito_perc: oRow.EsitoEcoPerc,
									Esito: oRow.EsitoEco,
									Nota: oRow.Nota,
									Speseint: oRow.Speseint,
									Livello1: oRow.Livello1,
									Livello2: oRow.Livello2,
									Livello3: oRow.Livello3,
									Livello4: oRow.Livello4,
									Livello5: oRow.Livello5,
									Livello6: oRow.Livello6,
									Livello7: oRow.Livello7,
									Livello8: oRow.Livello8,
									Livello9: oRow.Livello9,
									Livello10: oRow.Livello10,
									Livello11: oRow.Livello11,
									Livello12: oRow.Livello12,
									Livello13: oRow.Livello13,
									Livello14: oRow.Livello14,
									Livello15: oRow.Livello15,
									Livello16: oRow.Livello16,
								}
								var sLivelli = this.checkLivelli(oRow.Livello1) + this.checkLivelli(oRow.Livello2) + this.checkLivelli(oRow.Livello3) + this.checkLivelli(
									oRow.Livello4) + this.checkLivelli(oRow.Livello5) +
								this.checkLivelli(oRow.Livello6) + this.checkLivelli(oRow.Livello7) + this.checkLivelli(oRow.Livello8) + this.checkLivelli(oRow.Livello9) +
								this.checkLivelli(oRow.Livello10) + this.checkLivelli(oRow.Livello11) +
								this.checkLivelli(oRow.Livello12) + this.checkLivelli(oRow.Livello13) + this.checkLivelli(oRow.Livello14) + this.checkLivelli(
									oRow.Livello15) + this.checkLivelli(oRow.Livello16);
								var sEsitoPerc = this.checkLivelli(oRow.EsitoEcoPerc);
								var sEsito = oRow.EsitoEco;
							}
							
							var results = {};
							if (sEsito === "SPA" && !(sEsitoPerc > 0 && sEsitoPerc < 100)) {
								this.messageChangeStato("messEsito", "checkLivelli", "warning2");
								continue;
							}

							// input livelli abilitati
							if (oRow.ENABLED_LIVELLO) {
								if (sLivelli === 100) {
									this.getView().setBusy(true);
									results = await this._insertRecord("5", "/ZET_ECOBILANCIOSet", obj);
									this.getView().setBusy(false);
								} else {
									this.messageChangeStato("messLivelli", "checkLivelli", "warning2");
								}
							} else {
								// input livelli disabilitati
								// la somma delle percentuali può anche essere diversa da 100 
								this.getView().setBusy(true);
								results = await this._insertRecord("5", "/ZET_ECOBILANCIOSet", obj);
								this.getView().setBusy(false);
							}
							
						}
						if (indexSel === aSelectedRows.length && results.returnStatus) {
							MessageBox.success(
								'Salvataggio effettuato con successo!'
							);
						}

						//this.onAggiorna();
					} else {
						this.messageChangeStato("noSelezione", "noSelezione", "warning2");
					}

				},

				onAggiorna: async function() {
					var aFilters = new Filter({
						filters: [],
						and: true
					});
					// var sAmm = "A020";
					// aFilters.aFilters.push(new Filter("codice_ammin", sap.ui.model.FilterOperator.EQ, sAmm));
					var posfin = this.getView().byId("idPosFin").getValue();
					if (posfin) {
						aFilters.aFilters.push(new Filter("Fipex", sap.ui.model.FilterOperator.EQ, posfin));
					}
					// var esito = this.getView().byId("idEsito").getValue();
					// if (esito !== undefined && esito.length !== 0) {
					// 	aFilters.aFilters.push(new Filter("esito_eco", sap.ui.model.FilterOperator.EQ, esito));
					// }
					// var multiambito = this.getView().byId("idMultiambito").getSelectedKey();
					// if (multiambito !== undefined && multiambito.length !== 0) {
					// 	aFilters.aFilters.push(new Filter("multiambito", sap.ui.model.FilterOperator.EQ, multiambito));
					// }
					aFilters = this._getAllFilter(aFilters);
					for (var i = 0; i < aFilters.aFilters.length; i++) {
						if (aFilters.aFilters[i].sPath === "CodiceAmmin") {
							aFilters.aFilters[i].sPath = "codice_ammin";
						} else if (aFilters.aFilters[i].sPath === "Esito") {
							aFilters.aFilters[i].sPath = "esito_eco";
						} else if (aFilters.aFilters[i].sPath === "Multiambito") {
							aFilters.aFilters[i].sPath = "multiambito";
						}
					}
					//this.openBusyDialog(); 	
					this.getView().setBusy(true);
					try {
						var aResult = await this._readFromDb("2", "/ZES_AVVIOSet", aFilters.aFilters, []);
						this.getView().setBusy(false);
					} catch (error) {
						var aResult = [];
					}
		
					var oCheckModel = this.getView().getModel("checkModel");
					if (aResult[0].Iter === "03") {
						oCheckModel.setProperty('/chiudiEnabled', false);
						oCheckModel.setProperty('/chiudiValida', false);
						oCheckModel.setProperty('/chiudiText', false);
						this.byId("Salva").setProperty("visible", false);
					} else if (aResult[0].Iter === "02") {
						oCheckModel.setProperty('/chiudiEnabled', false);
						oCheckModel.setProperty('/chiudiValida', true);
						oCheckModel.setProperty('/chiudiText', true);
						this.byId("Salva").setProperty("visible", false);
					} else {
						oCheckModel.setProperty('/chiudiEnabled', true);
						oCheckModel.setProperty('/chiudiText', false);
						oCheckModel.setProperty('/chiudiValida', false);
						this.byId("Salva").setProperty("visible", true);
					}
		
					//this.closeBusyDialog();
					// console.log(aResult);
					// this.getView().setModel(new JSONModel(this.getJsonModel("0")), "modelHome");
					this.getView().setModel(new JSONModel(aResult), "modelHome");
					this.getView().getModel("modelCepaCruma").setProperty("/visible", true);
					// genero le colonne della tabella per i valori cepa/cruma
					// var oTable = this.getView().byId("tableEcobilancio");
					// var oTableItems = this.getView().byId("tableItems").bindAggregation(aResult);
					// for(var i=1; i<17; i++){
					// 	// var sColName = i.toString();
					// 	var sValueName = `livello${i}`;
					// 	var oColumn = new sap.m.Column({
					// 		header: new sap.m.Label({
					// 			text: i.toString()
					// 		}) 
					// 	});
					// 	oColumn.setWidth("auto");
					// 	oColumn.setVisible(this.getView().getModel("modelTableExpansion").getData().isExpanded);
					// 	// oColumn.bindAggregation("columns", oColumn);
					// 	var oContext = oTable.getBindingContext("modelTableExpansion");
					// 	var sPath = oContext.getPath();
					// 	oProductDetailPanel.bindElement({ path: sPath, model: this.getView().getModel("modelTableExpansion") });
					// 	oTable.addColumn(oColumn);
					// }
					//await this.getWorkflow();
				},

				checkLivelli: function(value) {
					if (value === "") {
						value = 0;
					} else {
						value = parseFloat(value);
					}
					return value;
				},

				// --------------------- CONTROLLI INTEGRITÀ ESITO E CEPACRUMA

				checkEsito: function (oRow) {
					var returnValue;
					switch (oRow.esito_eco) {
						case "SNA":
							if (oRow.esito_eco_perc === "0") {
								returnValue = 0;
							} else {
								returnValue = "errorEsitoZero";
							}
							break;
						case "SFI":
							if (oRow.esito_eco_perc === "0") {
								returnValue = 0;
							} else {
								returnValue = "errorEsitoZero";
							}
							break;
						case "SEA":
							if (oRow.esito_eco_perc === "100") {
								returnValue = 0;
							} else {
								returnValue = "errorEsitoCento";
							}
							break;
						case "SCA":
							if (oRow.esito_eco_perc === "100" && oRow.esito_eco_perc !== "") {
								returnValue = 0;
							} else {
								returnValue = "errorEsitoCento";
							}
							break;
						case "SPA":
							if (oRow.esito_eco_perc === "100") {
								returnValue = 0;
							} else {
								returnValue = "errorEsitoSPA";
							}
							break;
					}
					return returnValue;
				},

				checkCepacruma: function (oRow) {
					var selected = 0,
						totalValue = 0,
						returnValue;

					// Questo ciclo deve variare a seconda della tabella sulla quale si salvano le modifiche
					for (var i = 1; i < 17; i++) {
						var sColumn = `livello${i}`;
						if (oRow[sColumn] > 0) {
							selected++;
							totalValue += parseInt(oRow[sColumn]);
						}
					}
					switch (oRow.esito_eco) {
						case "SNA":
							if (selected === 0) {
								returnValue = 0;
							} else {
								returnValue = "errorNoCC";
							}
							break;
						case "SFI":
							if (selected === 0) {
								returnValue = 0;
							} else {
								returnValue = "errorNoCC";
							}
							break;
						case "SEA":
							if (selected === 1 && totalValue === 100) {
								returnValue = 0;
							} else {
								returnValue = "errorSEA";
							}
							break;
						case "SCA":
							if (selected === 2 && totalValue === 100) {
								returnValue = 0;
							} else {
								returnValue = "errorSCA";
							}
							break;
						case "SPA":
							if (selected > 0 && totalValue === 100) {
								returnValue = 0;
							} else {
								returnValue = "errorSPA";
							}
							break;
					}
					return returnValue;
				},

				// --------------------- matchcode per posizione finanziaria
				onCloseHVPosFin: function (oEvent) {
					oEvent.getSource().getParent().close();
				},

				onClose: function (oEvent) {
					oEvent.getSource().getParent().close();
				},

				onPosFin: function () {
					if (!this.oDialogPosFin) {
						Fragment.load({
							name: "zsap.com.r3.cobi.s4.ecobilancioigb.view.fragment.PosFinHelp",
							controller: this,
						}).then((oDialog) => {
							this.oDialogPosFin = oDialog;
							this.getView().addDependent(oDialog);
							this.oDialogPosFin.open();
						});
					} else {
						this.oDialogPosFin.open();
					}
				},

				__setBusyHelp: function (model, state) {
					model.setProperty("/busyHelp", state);
				},

				onHVAdattaFiltri: function (oEvent, sHomeFilter) {
					let { key, value } = oEvent.getSource().getCustomData()[0].mProperties;
					let modelPosFin = this.getView().getModel("modelPosFin");
					modelPosFin.setProperty("/action_filtri", key);
					this.__setBusyHelp(modelPosFin, true);
					
					this.__getDataForHV(value, key, sHomeFilter); //estrae i dati filtrati nel caso ci siano selezioni di attributi padre
					Fragment.load({
						name:
							"zsap.com.r3.cobi.s4.ecobilancioigb.view.fragment.HVPosFin." +
							value,
						controller: this,
					}).then((oDialog) => {
						this[value] = oDialog;
						this.getView().addDependent(oDialog);
						this[value].open();
					});
				},

				__getDataForHV: function (sHV, sProperty, sHomeFilter) {
					let that = this;
					let modelPosFin = this.getView().getModel("modelPosFin");
					let modelHana = this.getView().getModel("sapHanaS2");
					let aFilters = [
						new Filter("Fikrs", FilterOperator.EQ, "S001"),
						new Filter("Fase", FilterOperator.EQ, "DLB"),
						new Filter("Anno",FilterOperator.EQ,modelPosFin.getProperty("/infoSottoStrumento/AnnoSstr")),
						new Filter("Reale",FilterOperator.EQ,modelPosFin.getProperty("/infoSottoStrumento/Reale")),
						new Filter("Datbis", FilterOperator.GE, new Date()),
					];
					switch (sHV) {
						case "HVCapitolo":
							aFilters.push(new Filter("Eos", FilterOperator.EQ, "S"));
							if (modelPosFin.getProperty("/" + sProperty + "/Prctr")) {
								aFilters.push(
									new Filter("Prctr",FilterOperator.EQ,modelPosFin.getProperty("/" + sProperty + "/Prctr"))
								);
							} else {
								if (
									modelPosFin.getProperty("/infoSottoStrumento/DomAmministrazione/results") &&
									modelPosFin.getProperty("/infoSottoStrumento/DomAmministrazione/results").length > 0
								)
									aFilters.push(this.__getFiltersOR(modelPosFin.getProperty("/infoSottoStrumento/DomAmministrazione/results"),"Prctr")
									);
							}
							
							modelHana.read("/TipCapitoloSet", {
								filters: aFilters,
								success: (oData) => {
									modelPosFin.setProperty(
										"/formPosFin/capitoli",
										(function () {
											let aCapitoli = [];

											for (let i = 0; i < oData.results.length; i++) {
												if (
													!aCapitoli.find(
														(item) =>
															item.Prctr === oData.results[i].Prctr &&
															item.Capitolo === oData.results[i].Capitolo
													)
												)
													aCapitoli.push(oData.results[i]);
											}

											// recupero descrizione estesa
											let oAmminModel = that.getView().getModel("amministrazioniModel");;
											aCapitoli.forEach(c => {
												c.DescPrctr = that.formatter.formatterDescrAmmin(oAmminModel, c.Prctr);
											});

											return aCapitoli;
										})()
									);
									// modelPosFin.refresh();
									this.__setBusyHelp(modelPosFin, false);
								},
								error: function () {
									this.__setBusyHelp(modelPosFin, false);
								}
							});
							break;
						case "HVPgChoice":
							aFilters.push(new Filter("Eos", FilterOperator.EQ, "S"));
							if (modelPosFin.getProperty("/" + sProperty + "/Capitolo")) {
								aFilters.push(
									new Filter(
										"Capitolo",
										FilterOperator.EQ,
										modelPosFin.getProperty("/" + sProperty + "/Capitolo")
									)
								);
							}
							if (modelPosFin.getProperty("/" + sProperty + "/Prctr")) {
								aFilters.push(
									new Filter(
										"Prctr",
										FilterOperator.EQ,
										modelPosFin.getProperty("/" + sProperty + "/Prctr")
									)
								);
							} else {
								if (
									modelPosFin.getProperty(
										"/infoSottoStrumento/DomAmministrazione/results"
									).length > 0
								)
									aFilters.push(
										this.__getFiltersOR(
											modelPosFin.getProperty(
												"/infoSottoStrumento/DomAmministrazione/results"
											),
											"Prctr"
										)
									);
							}
							modelHana.read("/TipCapitoloSet", {
								filters: aFilters,
								success: (oData) => {
									modelPosFin.setProperty("/formPosFin/pg", oData.results);
									this.__setBusyHelp(modelPosFin, false);
								},
							});
							break;
						case "HVCdr":
							if (modelPosFin.getProperty("/" + sProperty + "/Prctr")) {
								aFilters.push(
									new Filter(
										"Prctr",
										FilterOperator.EQ,
										modelPosFin.getProperty("/" + sProperty + "/Prctr")
									)
								);
							} else {
								if (
									modelPosFin.getProperty(
										"/infoSottoStrumento/DomAmministrazione/results"
									).length > 0
								)
									aFilters.push(
										this.__getFiltersOR(
											modelPosFin.getProperty(
												"/infoSottoStrumento/DomAmministrazione/results"
											),
											"Prctr"
										)
									);
							}
							modelHana.read("/TipAmministrazioneSet", {
								filters: aFilters,
								urlParameters: {
									$expand: "TipCdr",
								},
								success: (oData) => {
									modelPosFin.setProperty(
										"/formPosFin/cdr",
										(function () {
											let aCdr = [];
											if (oData.results.length === 1) {
												for (let i = 0; i < oData.results.length; i++) {
													aCdr.push(...oData.results[i].TipCdr.results);
												}
											} else {
												for (let i = 0; i < oData.results.length; i++) {
													aCdr.push(...oData.results[i].TipCdr.results);
												}
											}
											return aCdr;
										})()
									);
									this.__setBusyHelp(modelPosFin, false);
								},
								error: (err) => {
									this.__setBusyHelp(modelPosFin, false);
								},
							});
							break;
						case "HVRagioneria":
							if (modelPosFin.getProperty("/" + sProperty + "/Prctr")) {
								aFilters.push(
									new Filter(
										"Prctr",
										FilterOperator.EQ,
										modelPosFin.getProperty("/" + sProperty + "/Prctr")
									)
								);
							} else {
								if (
									modelPosFin.getProperty(
										"/infoSottoStrumento/DomAmministrazione/results"
									).length > 0
								)
									aFilters.push(
										this.__getFiltersOR(
											modelPosFin.getProperty(
												"/infoSottoStrumento/DomAmministrazione/results"
											),
											"Prctr"
										)
									);
							}
							modelHana.read("/RelazioneAmminRagioneriaSet", {
								filters: aFilters,
								success: (oData) => {
									modelPosFin.setProperty(
										"/formPosFin/ragionerie",
										oData.results
									);
									this.__setBusyHelp(modelPosFin, false);
								},
							});
							break;
						case "HVMissione":
							if (
								modelPosFin.getProperty(
									"/infoSottoStrumento/DomMissione/results"
								).length > 0
							) {
								aFilters.push(
									this.__setMultiFiltersMissione(
										modelPosFin.getProperty(
											"/infoSottoStrumento/DomMissione/results"
										),
										["Missione", "Programma", "Azione", "Prctr"]
									)
								);
							}
							if (
								modelPosFin.getProperty(
									"/infoSottoStrumento/DomAmministrazione/results"
								).length > 0
							)
								aFilters.push(
									this.__getFiltersOR(
										modelPosFin.getProperty(
											"/infoSottoStrumento/DomAmministrazione/results"
										),
										"Prctr"
									)
								);
							modelHana.read("/TipMissioneSet", {
								filters: aFilters,
								success: (oData) => {
									modelPosFin.setProperty(
										"/formPosFin/missioni",
										(function () {
											let aMissioni = [];
											for (let i = 0; i < oData.results.length; i++) {
												if (
													!aMissioni.find(
														(item) =>
															item.Missione === oData.results[i].Missione
													)
												)
													aMissioni.push(oData.results[i]);
											}
											return aMissioni;
										})()
									);
									this.__setBusyHelp(modelPosFin, false);
								},
							});
							break;
						case "HVProgramma":
							if (modelPosFin.getProperty("/" + sProperty + "/Prctr")) {
								aFilters.push(
									new Filter(
										"Prctr",
										FilterOperator.EQ,
										modelPosFin.getProperty("/" + sProperty + "/Prctr")
									)
								);
							} else {
								if (
									modelPosFin.getProperty(
										"/infoSottoStrumento/DomAmministrazione/results"
									).length > 0
								) {
									//filtra per amministrazioni del dominio, se non è stata selezionata un'amministrazione
									aFilters.push(
										this.__getFiltersOR(
											modelPosFin.getProperty(
												"/infoSottoStrumento/DomAmministrazione/results"
											),
											"Prctr"
										)
									);
								}
							}
							if (modelPosFin.getProperty("/" + sProperty + "/Missione")) {
								aFilters.push(
									new Filter(
										"Missione",
										FilterOperator.EQ,
										modelPosFin.getProperty("/" + sProperty + "/Missione")
									)
								);
							} else {
								if (
									modelPosFin.getProperty(
										"/infoSottoStrumento/DomMissione/results"
									).length > 0
								) {
									aFilters.push(
										this.__setMultiFiltersMissione(
											modelPosFin.getProperty(
												"/infoSottoStrumento/DomMissione/results"
											),
											["Missione", "Programma", "Prctr"]
										)
									);
								}
							}
							modelHana.read("/TipMissioneSet", {
								filters: aFilters,
								success: (oData) => {
									modelPosFin.setProperty(
										"/formPosFin/programmi",
										(function () {
											let aProgrammi = [];
											for (let i = 0; i < oData.results.length; i++) {
												if (
													aProgrammi.filter(
														(item) =>
															item.Missione === oData.results[i].Missione &&
															item.Programma === oData.results[i].Programma
													).length === 0
												)
													aProgrammi.push(oData.results[i]);
											}
											return aProgrammi;
										})()
									);
									this.__setBusyHelp(modelPosFin, false);
								},
							});
							break;
						case "HVAzione":
							//se si apre help value di Programma, controllare che sia stato valorizzata Missione e filtrare per tale valore
							if (modelPosFin.getProperty("/" + sProperty + "/Prctr")) {
								// Filtro amministrazione se è stato già selezionato
								aFilters.push(
									new Filter(
										"Prctr",
										FilterOperator.EQ,
										modelPosFin.getProperty("/" + sProperty + "/Prctr")
									)
								);
							} else {
								if (
									modelPosFin.getProperty(
										"/infoSottoStrumento/DomAmministrazione/results"
									).length > 0
								) {
									//filtra per amministrazioni del dominio, se non è stata selezionata un'amministrazione
									aFilters.push(
										this.__getFiltersOR(
											modelPosFin.getProperty(
												"/infoSottoStrumento/DomAmministrazione/results"
											),
											"Prctr"
										)
									);
								}
							}
							if (modelPosFin.getProperty("/" + sProperty + "/Programma")) {
								aFilters.push(
									new Filter(
										"Programma",
										FilterOperator.EQ,
										modelPosFin.getProperty("/" + sProperty + "/Programma")
									)
								);
							}
							if (modelPosFin.getProperty("/" + sProperty + "/Missione")) {
								aFilters.push(
									new Filter(
										"Missione",
										FilterOperator.EQ,
										modelPosFin.getProperty("/" + sProperty + "/Missione")
									)
								);
							} else {
								if (
									modelPosFin.getProperty(
										"/infoSottoStrumento/DomMissione/results"
									).length > 0
								) {
									aFilters.push(
										this.__setMultiFiltersMissione(
											modelPosFin.getProperty(
												"/infoSottoStrumento/DomMissione/results"
											),
											["Missione", "Programma", "Azione"]
										)
									);
								}
							}
							modelHana.read("/TipMissioneSet", {
								filters: aFilters,
								success: (oData) => {
									modelPosFin.setProperty("/formPosFin/azioni", oData.results);
									this.__setBusyHelp(modelPosFin, false);
								},
								error: (err) => {
									this.__setBusyHelp(modelPosFin, false);
								},
							});
							break;
						case "HVTitolo":
							aFilters.push(new Filter("Eos", FilterOperator.EQ, "S"));
							if (
								modelPosFin.getProperty("/infoSottoStrumento/DomTitolo/results")
									.length > 0
							) {
								aFilters.push(
									this.__setMultiFiltersMissione(
										modelPosFin.getProperty(
											"/infoSottoStrumento/DomTitolo/results"
										),
										["Titolo", "Categoria", "Ce2", "Ce3"]
									)
								);
							}
							modelHana.read("/TipTitoloSet", {
								filters: aFilters,
								success: (oData, res) => {
									oData.results = oData.results.filter(
										(tit) =>
											!(
												tit.VersioneCategoria == "" ||
												tit.VersioneCe2 == "" ||
												tit.VersioneCe3 == "" ||
												tit.VersioneTitolo == ""
											)
									);
									modelPosFin.setProperty(
										"/formPosFin/titoli",
										(function () {
											let aTitoli = [];
											for (let i = 0; i < oData.results.length; i++)
												if (
													!aTitoli.find(
														(item) => item.Titolo === oData.results[i].Titolo
													)
												)
													aTitoli.push(oData.results[i]);

											return aTitoli;
										})()
									);
									this.__setBusyHelp(modelPosFin, false);
								},
							});
							break;
						case "HVCategoria":
							aFilters.push(new Filter("Eos", FilterOperator.EQ, "S"));
							if (modelPosFin.getProperty("/" + sProperty + "/Titolo")) {
								aFilters.push(
									new Filter(
										"Titolo",
										FilterOperator.EQ,
										modelPosFin.getProperty("/" + sProperty + "/Titolo")
									)
								);
							} else {
								if (
									modelPosFin.getProperty(
										"/infoSottoStrumento/DomTitolo/results"
									).length > 0
								)
									aFilters.push(
										this.__setMultiFiltersMissione(
											modelPosFin.getProperty(
												"/infoSottoStrumento/DomTitolo/results"
											),
											["Titolo", "Categoria", "Ce2", "Ce3"]
										)
									);
							}
							modelHana.read("/TipTitoloSet", {
								filters: aFilters,
								success: (oData) => {
									oData.results = oData.results.filter(
										(tit) =>
											!(
												tit.VersioneCategoria == "" ||
												tit.VersioneCe2 == "" ||
												tit.VersioneCe3 == "" ||
												tit.VersioneTitolo == ""
											)
									);
									modelPosFin.setProperty(
										"/formPosFin/categorie",
										(function () {
											let aCategoria = [];
											for (let i = 0; i < oData.results.length; i++)
												if (
													aCategoria.filter(
														(item) =>
															item.Titolo === oData.results[i].Titolo &&
															item.Categoria === oData.results[i].Categoria
													).length === 0
												)
													aCategoria.push(oData.results[i]);

											return aCategoria;
										})()
									);
									this.__setBusyHelp(modelPosFin, false);
								},
							});
							break;
						case "HVCe2":
							aFilters.push(new Filter("Eos", FilterOperator.EQ, "S"));
							if (modelPosFin.getProperty("/" + sProperty + "/Titolo")) {
								aFilters.push(
									new Filter(
										"Titolo",
										FilterOperator.EQ,
										modelPosFin.getProperty("/" + sProperty + "/Titolo")
									)
								);
							}
							if (modelPosFin.getProperty("/" + sProperty + "/Categoria")) {
								aFilters.push(
									new Filter(
										"Categoria",
										FilterOperator.EQ,
										modelPosFin.getProperty("/" + sProperty + "/Categoria")
									)
								);
							}
							if (
								!(
									modelPosFin.getProperty("/" + sProperty + "/Categoria") &&
									modelPosFin.getProperty("/" + sProperty + "/Titolo")
								)
							) {
								if (
									modelPosFin.getProperty(
										"/infoSottoStrumento/DomTitolo/results"
									).length > 0
								)
									aFilters.push(
										this.__setMultiFiltersMissione(
											modelPosFin.getProperty(
												"/infoSottoStrumento/DomTitolo/results"
											),
											["Titolo", "Categoria", "Ce2", "Ce3"]
										)
									);
							}
							modelHana.read("/TipTitoloSet", {
								filters: aFilters,
								success: (oData) => {
									oData.results = oData.results.filter(
										(tit) =>
											!(
												tit.VersioneCategoria == "" ||
												tit.VersioneCe2 == "" ||
												tit.VersioneCe3 == "" ||
												tit.VersioneTitolo == ""
											)
									);
									modelPosFin.setProperty(
										"/formPosFin/ce2",
										(function () {
											let aCe2 = [];
											for (let i = 0; i < oData.results.length; i++)
												if (
													aCe2.filter(
														(item) =>
															item.Titolo === oData.results[i].Titolo &&
															item.Categoria === oData.results[i].Categoria &&
															item.Ce2 === oData.results[i].Ce2
													).length === 0
												)
													aCe2.push(oData.results[i]);

											return aCe2;
										})()
									);
									this.__setBusyHelp(modelPosFin, false);
								},
								error: (err) => {
									this.__setBusyHelp(modelPosFin, false);
								},
							});
							break;
						case "HVCe3":
							aFilters.push(new Filter("Eos", FilterOperator.EQ, "S"));
							if (modelPosFin.getProperty("/" + sProperty + "/Titolo")) {
								aFilters.push(
									new Filter(
										"Titolo",
										FilterOperator.EQ,
										modelPosFin.getProperty("/" + sProperty + "/Titolo")
									)
								);
							}
							if (modelPosFin.getProperty("/" + sProperty + "/Categoria")) {
								aFilters.push(
									new Filter(
										"Categoria",
										FilterOperator.EQ,
										modelPosFin.getProperty("/" + sProperty + "/Categoria")
									)
								);
							}
							if (modelPosFin.getProperty("/" + sProperty + "/Ce2")) {
								aFilters.push(
									new Filter(
										"Ce2",
										FilterOperator.EQ,
										modelPosFin.getProperty("/" + sProperty + "/Ce2")
									)
								);
							}
							if (
								!(
									modelPosFin.getProperty("/" + sProperty + "/Categoria") &&
									modelPosFin.getProperty("/" + sProperty + "/Titolo") &&
									modelPosFin.getProperty("/" + sProperty + "/Ce2")
								)
							) {
								if (
									modelPosFin.getProperty(
										"/infoSottoStrumento/DomTitolo/results"
									).length > 0
								)
									aFilters.push(
										this.__setMultiFiltersMissione(
											modelPosFin.getProperty(
												"/infoSottoStrumento/DomTitolo/results"
											),
											["Titolo", "Categoria", "Ce2", "Ce3"]
										)
									);
							}
							modelHana.read("/TipTitoloSet", {
								filters: aFilters,
								success: (oData) => {
									oData.results = oData.results.filter(
										(tit) =>
											!(
												tit.VersioneCategoria == "" ||
												tit.VersioneCe2 == "" ||
												tit.VersioneCe3 == "" ||
												tit.VersioneTitolo == ""
											)
									);
									modelPosFin.setProperty("/formPosFin/ce3", oData.results);
									this.__setBusyHelp(modelPosFin, false);
								},
							});
							break;
						default:
							break;
					}
				},

				onExpandPopOverSottostrumento: function (oEvent) {
					var oButton = oEvent.getSource(),
						oView = this.getView();

					// create popover
					if (!this._pPopoverSottoStr) {
						this._pPopoverSottoStr = Fragment.load({
							id: oView.getId(),
							name: "zsap.com.r3.cobi.s4.ecobilancioigb.view.fragment.PopOverSottostrumento",
							controller: this,
						}).then(function (oPopover) {
							oView.addDependent(oPopover);
							return oPopover;
						});
					}
					this._pPopoverSottoStr.then(function (oPopover) {
						oPopover.openBy(oButton);
					});
				},

				onPressConfPosFin: function (oEvent) {
					let modelHana = this.getOwnerComponent().getModel("sapHanaS2");
					let modelPosFin = this.getView().getModel("modelPosFin");
					modelPosFin.setProperty("/tablePosFinBusy", true);
					let oFormPosf = modelPosFin.getProperty("/posFinHelp/");
					let aFilters = [
						new Filter("Fikrs", FilterOperator.EQ, "S001"),
						new Filter("Fase", FilterOperator.EQ, "DLB"),
						new Filter(
							"Anno",
							FilterOperator.EQ,
							modelPosFin.getProperty("/infoSottoStrumento/AnnoSstr")
						),
						new Filter(
							"Reale",
							FilterOperator.EQ,
							modelPosFin.getProperty("/infoSottoStrumento/Reale")
						),
						new Filter("Datbis", FilterOperator.GE, new Date()),
						new Filter("Eos", FilterOperator.EQ, "S"),
						new Filter({
							filters: [
								new Filter("Versione", FilterOperator.EQ, "P"),
								new Filter("Versione", FilterOperator.EQ, "D"),
							],
							and: false,
						}),
					];
					aFilters.push(...this.__setFiltersHVPosFin(oFormPosf));
					aFilters.push(...this.__setDomSStrFilters(aFilters));

					if (!this.oDialogTablePosFin) {
						Fragment.load({
							name: "zsap.com.r3.cobi.s4.ecobilancioigb.view.fragment.TablePosizioneFinanziaria",
							controller: this,
						}).then((oDialog) => {
							this.oDialogTablePosFin = oDialog;
							this.getView().addDependent(oDialog);
							this.oDialogTablePosFin.open();
						});
					} else {
						this.oDialogTablePosFin.open();
					}
					modelHana.read("/PosizioneFinanziariaSet", {
						filters: aFilters,
						success: (oData, res) => {
							modelPosFin.setProperty("/elencoPosFin", oData.results);
							modelPosFin.setProperty("/tablePosFinBusy", false);
						},
						error: (err) => {
							modelPosFin.setProperty("/tablePosFinBusy", false);
							modelPosFin.setProperty("/elencoPosFin", []);
						},
					});
				},

				onConfirmSelectionPosFin: function (oEvent) {
					let { _, value } = oEvent.getSource().getCustomData()[0].mProperties;
					let modelPosFin = this.getView().getModel("modelPosFin");
					let sAction = modelPosFin.getProperty("/action_filtri");

					let sPath, aAmministrazioni;
					switch (value) {
						case "Amministrazione":
							sPath = oEvent
								.getSource()
								.getParent()
								.getContent()[0]
								.getSelectedContextPaths();
							//check se sono stati selezionati figli; in caso di amministrazione non combaciante, resettare input
							if (
								modelPosFin.getProperty(sPath + "/Prctr") !==
								modelPosFin.getProperty("/" + sAction + "/Prctr")
							) {
								modelPosFin.setProperty("/" + sAction + "/CapitoloDesc", null);
								modelPosFin.setProperty("/" + sAction + "/Capitolo", null);
								modelPosFin.setProperty("/" + sAction + "/PgDesc", null);
								modelPosFin.setProperty("/" + sAction + "/Pg", null);
								modelPosFin.setProperty("/" + sAction + "/CdrDesc", null);
								modelPosFin.setProperty("/" + sAction + "/Cdr", null);
							}
							if (sAction === "adatta_filtri")
								modelPosFin.setProperty(
									"/" + sAction + "/AmministrazioneDesc",
									modelPosFin.getProperty(sPath + "/Prctr") +
									"-" +
									modelPosFin.getProperty(sPath + "/DescEstesa")
								);
							else
								modelPosFin.setProperty(
									"/" + sAction + "/AmministrazioneDesc",
									modelPosFin.getProperty(sPath + "/DescEstesa")
								);
							modelPosFin.setProperty(
								"/" + sAction + "/Prctr",
								modelPosFin.getProperty(sPath + "/Prctr")
							);

							break;
						case "Capitolo":
							sPath = oEvent
								.getSource()
								.getParent()
								.getContent()[0]
								.getSelectedContextPaths();
							//check se sono stati selezionati figli; in caso di capitolo non combaciante, resettare input
							if (
								modelPosFin.getProperty(sPath[0] + "/Capitolo") !==
								modelPosFin.getProperty("/" + sAction + "/Capitolo")
							) {
								modelPosFin.setProperty("/" + sAction + "/PgDesc", null);
								modelPosFin.setProperty("/" + sAction + "/Pg", null);
							}
							aAmministrazioni = modelPosFin.getProperty(
								"/formPosFin/amministrazioni"
							);
							let oCapitolo = modelPosFin.getProperty(sPath[0]);
							if (sAction === "adatta_filtri") {
								modelPosFin.setProperty(
									"/" + sAction + "/CapitoloDesc",
									modelPosFin.getProperty(sPath[0] + "/Capitolo") +
									"-" +
									modelPosFin.getProperty(sPath[0] + "/DescEstesaCapitolo")
								);
								modelPosFin.setProperty(
									"/" + sAction + "/AmministrazioneDesc",
									aAmministrazioni.filter(
										(amm) => amm.Prctr === oCapitolo.Prctr
									)[0].Prctr +
									"-" +
									aAmministrazioni.filter(
										(amm) => amm.Prctr === oCapitolo.Prctr
									)[0].DescEstesa
								);
							} else {
								modelPosFin.setProperty(
									"/" + sAction + "/CapitoloDesc",
									modelPosFin.getProperty(sPath[0] + "/DescEstesaCapitolo")
								);
								modelPosFin.setProperty(
									"/" + sAction + "/AmministrazioneDesc",
									aAmministrazioni.filter(
										(amm) => amm.Prctr === oCapitolo.Prctr
									)[0].DescEstesa
								);
							}
							modelPosFin.setProperty(
								"/" + sAction + "/Capitolo",
								modelPosFin.getProperty(sPath[0] + "/Capitolo")
							);
							modelPosFin.setProperty(
								"/" + sAction + "/Prctr",
								aAmministrazioni.filter(
									(amm) => amm.Prctr === oCapitolo.Prctr
								)[0].Prctr
							);
							break;
						case "Pg":
							sPath = oEvent
								.getSource()
								.getParent()
								.getContent()[0]
								.getSelectedContextPaths();
							aAmministrazioni = modelPosFin.getProperty(
								"/formPosFin/amministrazioni"
							);
							let oPg = modelPosFin.getProperty(sPath[0]);
							if (sAction === "adatta_filtri") {
								modelPosFin.setProperty(
									"/" + sAction + "/PgDesc",
									modelPosFin.getProperty(sPath[0] + "/Pg") +
									"-" +
									modelPosFin.getProperty(sPath[0] + "/DescEstesaPg")
								);
								modelPosFin.setProperty(
									"/" + sAction + "/CapitoloDesc",
									modelPosFin.getProperty(sPath[0] + "/Capitolo") +
									"-" +
									modelPosFin.getProperty(sPath[0] + "/DescEstesaCapitolo")
								);
								modelPosFin.setProperty(
									"/" + sAction + "/AmministrazioneDesc",
									aAmministrazioni.filter((amm) => amm.Prctr === oPg.Prctr)[0]
										.Prctr +
									"-" +
									aAmministrazioni.filter((amm) => amm.Prctr === oPg.Prctr)[0]
										.DescEstesa
								);
							} else {
								modelPosFin.setProperty(
									"/" + sAction + "/PgDesc",
									modelPosFin.getProperty(sPath[0] + "/DescEstesaPg")
								);
								modelPosFin.setProperty(
									"/" + sAction + "/CapitoloDesc",
									modelPosFin.getProperty(sPath[0] + "/DescEstesaCapitolo")
								);
								modelPosFin.setProperty(
									"/" + sAction + "/AmministrazioneDesc",
									aAmministrazioni.filter((amm) => amm.Prctr === oPg.Prctr)[0]
										.DescEstesa
								);
							}
							modelPosFin.setProperty(
								"/" + sAction + "/Pg",
								modelPosFin.getProperty(sPath[0] + "/Pg")
							);
							modelPosFin.setProperty(
								"/" + sAction + "/Capitolo",
								modelPosFin.getProperty(sPath[0] + "/Capitolo")
							);
							modelPosFin.setProperty(
								"/" + sAction + "/Prctr",
								aAmministrazioni.filter((amm) => amm.Prctr === oPg.Prctr)[0]
									.Prctr
							);
							break;
						case "Cdr":
							sPath = oEvent
								.getSource()
								.getParent()
								.getContent()[0]
								.getSelectedContextPaths();
							//aAmministrazioni = modelPosFin.getProperty("/formPosFin/amministrazioni")
							let oCdr = modelPosFin.getProperty(sPath[0]);
							if (sAction === "adatta_filtri") {
								modelPosFin.setProperty(
									"/" + sAction + "/CdrDesc",
									modelPosFin.getProperty(sPath[0] + "/Cdr") +
									"-" +
									modelPosFin.getProperty(sPath[0] + "/DescEstesaCdr")
								);
								modelPosFin.setProperty(
									"/" + sAction + "/AmministrazioneDesc",
									modelPosFin.getProperty(sPath[0] + "/Prctr") +
									"-" +
									modelPosFin.getProperty(sPath[0] + "/DescrEstesaAmmin")
								);
								//modelPosFin.setProperty("/" + sAction + "/AmministrazioneDesc", aAmministrazioni.filter(amm => amm.Prctr === oCdr.Prctr)[0].Prctr + "-" + aAmministrazioni.filter(amm => amm.Prctr === oCdr.Prctr)[0].DescEstesa)
							} else {
								modelPosFin.setProperty(
									"/" + sAction + "/CdrDesc",
									modelPosFin.getProperty(sPath[0] + "/DescEstesaCdr")
								);
								modelPosFin.setProperty(
									"/" + sAction + "/AmministrazioneDesc",
									modelPosFin.getProperty(sPath[0] + "/DescrEstesaAmmin")
								);
								//modelPosFin.setProperty("/" + sAction + "/AmministrazioneDesc", aAmministrazioni.filter(amm => amm.Prctr === oCdr.Prctr)[0].DescEstesa)
							}
							modelPosFin.setProperty(
								"/" + sAction + "/Cdr",
								modelPosFin.getProperty(sPath[0] + "/Cdr")
							);
							//modelPosFin.setProperty("/" + sAction + "/Prctr", aAmministrazioni.filter(amm => amm.Prctr === oCdr.Prctr)[0].Prctr)
							modelPosFin.setProperty(
								"/" + sAction + "/Prctr",
								modelPosFin.getProperty(sPath[0] + "/Prctr")
							);
							break;
						case "Ragioneria":
							sPath = oEvent
								.getSource()
								.getParent()
								.getContent()[0]
								.getSelectedContextPaths();

							if (sAction === "adatta_filtri") {
								modelPosFin.setProperty(
									"/" + sAction + "/RagioneriaDesc",
									modelPosFin.getProperty(sPath[0] + "/Ragioneria") +
									"-" +
									modelPosFin.getProperty(sPath[0] + "/DescrEstesaRagioneria")
								);
								modelPosFin.setProperty(
									"/" + sAction + "/AmministrazioneDesc",
									modelPosFin.getProperty(sPath[0] + "/Prctr") +
									"-" +
									modelPosFin.getProperty(sPath[0] + "/DescrEstesaAmmin")
								);
							} else {
								modelPosFin.setProperty(
									"/" + sAction + "/RagioneriaDesc",
									modelPosFin.getProperty(sPath[0] + "/DescrEstesaRagioneria")
								);
								modelPosFin.setProperty(
									"/" + sAction + "/AmministrazioneDesc",
									modelPosFin.getProperty(sPath[0] + "/DescrEstesaAmmin")
								);
							}
							modelPosFin.setProperty(
								"/" + sAction + "/Ragioneria",
								modelPosFin.getProperty(sPath[0] + "/Ragioneria")
							);
							modelPosFin.setProperty(
								"/" + sAction + "/Prctr",
								modelPosFin.getProperty(sPath[0] + "/Prctr")
							);
							break;
						case "Missione":
							sPath = oEvent
								.getSource()
								.getParent()
								.getContent()[0]
								.getSelectedContextPaths();
							//check se sono stati selezionati figli; in caso di Missione non combaciante, resettare input
							if (
								modelPosFin.getProperty(sPath + "/Missione") !==
								modelPosFin.getProperty("/" + sAction + "/Missione")
							) {
								modelPosFin.setProperty("/" + sAction + "/ProgrammaDesc", null);
								modelPosFin.setProperty("/" + sAction + "/Programma", null);
								modelPosFin.setProperty("/" + sAction + "/Azione", null);
								modelPosFin.setProperty("/" + sAction + "/AzioneDesc", null);
							}
							if (sAction === "adatta_filtri") {
								modelPosFin.setProperty(
									"/" + sAction + "/MissioneDesc",
									modelPosFin.getProperty(sPath + "/Missione") +
									"-" +
									modelPosFin.getProperty(sPath + "/DescEstesaMissione")
								);
							} else {
								modelPosFin.setProperty(
									"/" + sAction + "/MissioneDesc",
									modelPosFin.getProperty(sPath + "/DescEstesaMissione")
								);
							}
							modelPosFin.setProperty(
								"/" + sAction + "/Missione",
								modelPosFin.getProperty(sPath + "/Missione")
							);

							break;
						case "Programma":
							sPath = oEvent
								.getSource()
								.getParent()
								.getContent()[0]
								.getSelectedContextPaths();
							//check se sono stati selezionati figli; in caso di amministrazione non combaciante, resettare input
							if (
								modelPosFin.getProperty(sPath + "/Programma") !==
								modelPosFin.getProperty("/" + sAction + "/Programma")
							) {
								modelPosFin.setProperty("/" + sAction + "/AzioneDesc", null);
								modelPosFin.setProperty("/" + sAction + "/Azione", null);
							}
							if (sAction === "adatta_filtri") {
								modelPosFin.setProperty(
									"/" + sAction + "/MissioneDesc",
									modelPosFin.getProperty(sPath[0] + "/Missione") +
									"-" +
									modelPosFin.getProperty(sPath[0] + "/DescEstesaMissione")
								);
								modelPosFin.setProperty(
									"/" + sAction + "/ProgrammaDesc",
									modelPosFin.getProperty(sPath[0] + "/Programma") +
									"-" +
									modelPosFin.getProperty(sPath[0] + "/DescEstesaProgramma")
								);
							} else {
								modelPosFin.setProperty(
									"/" + sAction + "/MissioneDesc",
									modelPosFin.getProperty(sPath[0] + "/DescEstesaMissione")
								);
								modelPosFin.setProperty(
									"/" + sAction + "/ProgrammaDesc",
									modelPosFin.getProperty(sPath[0] + "/DescEstesaProgramma")
								);
							}
							modelPosFin.setProperty(
								"/" + sAction + "/Missione",
								modelPosFin.getProperty(sPath[0] + "/Missione")
							);
							modelPosFin.setProperty(
								"/" + sAction + "/Programma",
								modelPosFin.getProperty(sPath[0] + "/Programma")
							);
							break;
						case "Azione":
							sPath = oEvent
								.getSource()
								.getParent()
								.getContent()[0]
								.getSelectedContextPaths();
							if (sAction === "adatta_filtri") {
								modelPosFin.setProperty(
									"/" + sAction + "/AmministrazioneDesc",
									modelPosFin.getProperty(sPath[0] + "/Prctr") +
									"-" +
									modelPosFin.getProperty(sPath[0] + "/DescEstesaPrctr")
								);
								modelPosFin.setProperty(
									"/" + sAction + "/MissioneDesc",
									modelPosFin.getProperty(sPath[0] + "/Missione") +
									"-" +
									modelPosFin.getProperty(sPath[0] + "/DescEstesaMissione")
								);
								modelPosFin.setProperty(
									"/" + sAction + "/ProgrammaDesc",
									modelPosFin.getProperty(sPath[0] + "/Programma") +
									"-" +
									modelPosFin.getProperty(sPath[0] + "/DescEstesaProgramma")
								);
								modelPosFin.setProperty(
									"/" + sAction + "/AzioneDesc",
									modelPosFin.getProperty(sPath[0] + "/Azione") +
									"-" +
									modelPosFin.getProperty(sPath[0] + "/DescEstesaAzione")
								);
							} else {
								modelPosFin.setProperty(
									"/" + sAction + "/AmministrazioneDesc",
									modelPosFin.getProperty(sPath[0] + "/DescEstesaPrctr")
								);
								modelPosFin.setProperty(
									"/" + sAction + "/MissioneDesc",
									modelPosFin.getProperty(sPath[0] + "/DescEstesaMissione")
								);
								modelPosFin.setProperty(
									"/" + sAction + "/ProgrammaDesc",
									modelPosFin.getProperty(sPath[0] + "/DescEstesaProgramma")
								);
								modelPosFin.setProperty(
									"/" + sAction + "/AzioneDesc",
									modelPosFin.getProperty(sPath[0] + "/DescEstesaAzione")
								);
							}
							modelPosFin.setProperty(
								"/" + sAction + "/Prctr",
								modelPosFin.getProperty(sPath[0] + "/Prctr")
							);
							modelPosFin.setProperty(
								"/" + sAction + "/Missione",
								modelPosFin.getProperty(sPath[0] + "/Missione")
							);
							modelPosFin.setProperty(
								"/" + sAction + "/Programma",
								modelPosFin.getProperty(sPath[0] + "/Programma")
							);
							modelPosFin.setProperty(
								"/" + sAction + "/Azione",
								modelPosFin.getProperty(sPath[0] + "/Azione")
							);

							break;
						case "Titolo":
							sPath = oEvent
								.getSource()
								.getParent()
								.getContent()[0]
								.getSelectedContextPaths();
							//check se sono stati selezionati figli; in caso di Missione non combaciante, resettare input
							if (
								modelPosFin.getProperty(sPath + "/Titolo") !==
								modelPosFin.getProperty("/" + sAction + "/Titolo")
							) {
								modelPosFin.setProperty("/" + sAction + "/Categoria", null);
								modelPosFin.setProperty("/" + sAction + "/CategoriaDesc", null);
								modelPosFin.setProperty("/" + sAction + "/Ce2", null);
								modelPosFin.setProperty("/" + sAction + "/Ce2Desc", null);
								modelPosFin.setProperty("/" + sAction + "/Ce3", null);
								modelPosFin.setProperty("/" + sAction + "/Ce3Desc", null);
							}
							if (sAction === "adatta_filtri") {
								modelPosFin.setProperty(
									"/" + sAction + "/TitoloDesc",
									modelPosFin.getProperty(sPath + "/Titolo") +
									"-" +
									modelPosFin.getProperty(sPath + "/DescEstesaTitolo")
								);
							} else {
								modelPosFin.setProperty(
									"/" + sAction + "/TitoloDesc",
									modelPosFin.getProperty(sPath + "/DescEstesaTitolo")
								);
							}
							modelPosFin.setProperty(
								"/" + sAction + "/Titolo",
								modelPosFin.getProperty(sPath + "/Titolo")
							);

							break;
						case "Categoria":
							sPath = oEvent
								.getSource()
								.getParent()
								.getContent()[0]
								.getSelectedContextPaths();
							//check se sono stati selezionati figli; in caso di Missione non combaciante, resettare input
							if (
								modelPosFin.getProperty(sPath[0] + "/Categoria") !==
								modelPosFin.getProperty("/" + sAction + "/Categoria")
							) {
								modelPosFin.setProperty("/" + sAction + "/Ce2", null);
								modelPosFin.setProperty("/" + sAction + "/Ce2Desc", null);
								modelPosFin.setProperty("/" + sAction + "/Ce3", null);
								modelPosFin.setProperty("/" + sAction + "/Ce3Desc", null);
							}
							if (sAction === "adatta_filtri") {
								modelPosFin.setProperty(
									"/" + sAction + "/TitoloDesc",
									modelPosFin.getProperty(sPath[0] + "/Titolo") +
									"-" +
									modelPosFin.getProperty(sPath[0] + "/DescEstesaTitolo")
								);
								modelPosFin.setProperty(
									"/" + sAction + "/CategoriaDesc",
									modelPosFin.getProperty(sPath[0] + "/Categoria") +
									"-" +
									modelPosFin.getProperty(sPath[0] + "/DescEstesaCategoria")
								);
							} else {
								modelPosFin.setProperty(
									"/" + sAction + "/TitoloDesc",
									modelPosFin.getProperty(sPath[0] + "/DescEstesaTitolo")
								);
								modelPosFin.setProperty(
									"/" + sAction + "/CategoriaDesc",
									modelPosFin.getProperty(sPath[0] + "/DescEstesaCategoria")
								);
							}
							modelPosFin.setProperty(
								"/" + sAction + "/Titolo",
								modelPosFin.getProperty(sPath[0] + "/Titolo")
							);
							modelPosFin.setProperty(
								"/" + sAction + "/Categoria",
								modelPosFin.getProperty(sPath[0] + "/Categoria")
							);

							break;
						case "Ce2":
							sPath = oEvent
								.getSource()
								.getParent()
								.getContent()[0]
								.getSelectedContextPaths();
							//check se sono stati selezionati figli; in caso di Missione non combaciante, resettare input
							if (
								modelPosFin.getProperty(sPath[0] + "/Ce2") !==
								modelPosFin.getProperty("/" + sAction + "/Ce2")
							) {
								modelPosFin.setProperty("/" + sAction + "/Ce3", null);
								modelPosFin.setProperty("/" + sAction + "/Ce3Desc", null);
							}
							if (sAction === "adatta_filtri") {
								modelPosFin.setProperty(
									"/" + sAction + "/TitoloDesc",
									modelPosFin.getProperty(sPath[0] + "/Titolo") +
									"-" +
									modelPosFin.getProperty(sPath[0] + "/DescEstesaTitolo")
								);
								modelPosFin.setProperty(
									"/" + sAction + "/CategoriaDesc",
									modelPosFin.getProperty(sPath[0] + "/Categoria") +
									"-" +
									modelPosFin.getProperty(sPath[0] + "/DescEstesaCategoria")
								);
								modelPosFin.setProperty(
									"/" + sAction + "/Ce2Desc",
									modelPosFin.getProperty(sPath[0] + "/Ce2") +
									"-" +
									modelPosFin.getProperty(sPath[0] + "/DescEstesaCe2")
								);
							} else {
								modelPosFin.setProperty(
									"/" + sAction + "/TitoloDesc",
									modelPosFin.getProperty(sPath[0] + "/DescEstesaTitolo")
								);
								modelPosFin.setProperty(
									"/" + sAction + "/CategoriaDesc",
									modelPosFin.getProperty(sPath[0] + "/DescEstesaCategoria")
								);
								modelPosFin.setProperty(
									"/" + sAction + "/Ce2Desc",
									modelPosFin.getProperty(sPath[0] + "/DescEstesaCe2")
								);
							}
							modelPosFin.setProperty(
								"/" + sAction + "/Titolo",
								modelPosFin.getProperty(sPath[0] + "/Titolo")
							);
							modelPosFin.setProperty(
								"/" + sAction + "/Categoria",
								modelPosFin.getProperty(sPath[0] + "/Categoria")
							);
							modelPosFin.setProperty(
								"/" + sAction + "/Ce2",
								modelPosFin.getProperty(sPath[0] + "/Ce2")
							);

							break;
						case "Ce3":
							sPath = oEvent
								.getSource()
								.getParent()
								.getContent()[0]
								.getSelectedContextPaths();
							if (sAction === "adatta_filtri") {
								modelPosFin.setProperty(
									"/" + sAction + "/TitoloDesc",
									modelPosFin.getProperty(sPath[0] + "/Titolo") +
									"-" +
									modelPosFin.getProperty(sPath[0] + "/DescEstesaTitolo")
								);
								modelPosFin.setProperty(
									"/" + sAction + "/CategoriaDesc",
									modelPosFin.getProperty(sPath[0] + "/Categoria") +
									"-" +
									modelPosFin.getProperty(sPath[0] + "/DescEstesaCategoria")
								);
								modelPosFin.setProperty(
									"/" + sAction + "/Ce2Desc",
									modelPosFin.getProperty(sPath[0] + "/Ce2") +
									"-" +
									modelPosFin.getProperty(sPath[0] + "/DescEstesaCe2")
								);
								modelPosFin.setProperty(
									"/" + sAction + "/Ce3Desc",
									modelPosFin.getProperty(sPath[0] + "/Ce3") +
									"-" +
									modelPosFin.getProperty(sPath[0] + "/DescEstesaCe3")
								);
							} else {
								modelPosFin.setProperty(
									"/" + sAction + "/TitoloDesc",
									modelPosFin.getProperty(sPath[0] + "/DescEstesaTitolo")
								);
								modelPosFin.setProperty(
									"/" + sAction + "/CategoriaDesc",
									modelPosFin.getProperty(sPath[0] + "/DescEstesaCategoria")
								);
								modelPosFin.setProperty(
									"/" + sAction + "/Ce2Desc",
									modelPosFin.getProperty(sPath[0] + "/DescEstesaCe2")
								);
								modelPosFin.setProperty(
									"/" + sAction + "/Ce3Desc",
									modelPosFin.getProperty(sPath[0] + "/DescEstesaCe3")
								);
							}
							modelPosFin.setProperty(
								"/" + sAction + "/Titolo",
								modelPosFin.getProperty(sPath[0] + "/Titolo")
							);
							modelPosFin.setProperty(
								"/" + sAction + "/Categoria",
								modelPosFin.getProperty(sPath[0] + "/Categoria")
							);
							modelPosFin.setProperty(
								"/" + sAction + "/Ce2",
								modelPosFin.getProperty(sPath[0] + "/Ce2")
							);
							modelPosFin.setProperty(
								"/" + sAction + "/Ce3",
								modelPosFin.getProperty(sPath[0] + "/Ce3")
							);

							break;
						default:
							break;
					}
					oEvent.getSource().getParent().close();
				},

				onResetPosFinHelp: function (oEvent) {
					const modelPosFin = this.getView().getModel("modelPosFin");
					modelPosFin.setProperty("/posFinHelp", {});
					modelPosFin.setProperty("/elencoPosFin", []);
				},

				__setFiltersHVPosFin: function (oFormPosf) {
					let modelPosFin = this.getView().getModel("modelPosFin");
					let aFilters = [
						new Filter("Fikrs", FilterOperator.EQ, "S001"),
						new Filter("Fase", FilterOperator.EQ, "DLB"),
						new Filter(
							"Anno",
							FilterOperator.EQ,
							modelPosFin.getProperty("/infoSottoStrumento/AnnoSstr")
						),
						new Filter(
							"Reale",
							FilterOperator.EQ,
							modelPosFin.getProperty("/infoSottoStrumento/Reale")
						),
						new Filter("Eos", FilterOperator.EQ, "S"),
						new Filter({
							filters: [
								new Filter("Versione", FilterOperator.EQ, "P"),
								new Filter("Versione", FilterOperator.EQ, "D"),
							],
							and: false,
						}),
					];
					if (oFormPosf.Prctr)
						aFilters.push(
							new Filter("Prctr", FilterOperator.EQ, oFormPosf.Prctr)
						);
					if (oFormPosf.Cdr)
						aFilters.push(new Filter("Cdr", FilterOperator.EQ, oFormPosf.Cdr));
					if (oFormPosf.Ragioneria)
						aFilters.push(
							new Filter("Ragioneria", FilterOperator.EQ, oFormPosf.Ragioneria)
						);
					if (oFormPosf.Missione)
						aFilters.push(
							new Filter("Missione", FilterOperator.EQ, oFormPosf.Missione)
						);
					if (oFormPosf.Programma)
						aFilters.push(
							new Filter("Programma", FilterOperator.EQ, oFormPosf.Programma)
						);
					if (oFormPosf.Azione)
						aFilters.push(
							new Filter("Azione", FilterOperator.EQ, oFormPosf.Azione)
						);
					if (oFormPosf.Capitolo)
						aFilters.push(
							new Filter("Capitolo", FilterOperator.EQ, oFormPosf.Capitolo)
						);
					if (oFormPosf.Pg)
						aFilters.push(new Filter("Pg", FilterOperator.EQ, oFormPosf.Pg));
					if (oFormPosf.Titolo)
						aFilters.push(
							new Filter("Titolo", FilterOperator.EQ, oFormPosf.Titolo)
						);
					if (oFormPosf.Categoria)
						aFilters.push(
							new Filter("Categoria", FilterOperator.EQ, oFormPosf.Categoria)
						);
					if (oFormPosf.Ce2)
						aFilters.push(new Filter("Ce2", FilterOperator.EQ, oFormPosf.Ce2));
					if (oFormPosf.Ce3)
						aFilters.push(new Filter("Ce3", FilterOperator.EQ, oFormPosf.Ce3));
					if (oFormPosf.fipex)
						aFilters.push(
							new Filter("Fipex", FilterOperator.EQ, oFormPosf.fipex)
						);
					return aFilters;
				},

				__setDomSStrFilters: function (aFilters) {
					const modelPosFin = this.getView().getModel("modelPosFin");
					if (
						modelPosFin.getProperty(
							"/infoSottoStrumento/DomAmministrazione/results"
						).length > 0
					)
						aFilters.push(
							this.__setMultiFiltersMissione(
								modelPosFin.getProperty(
									"/infoSottoStrumento/DomAmministrazione/results"
								),
								["Prctr"]
							)
						);

					if (
						modelPosFin.getProperty("/infoSottoStrumento/DomTitolo/results")
							.length > 0
					)
						aFilters.push(
							this.__setMultiFiltersMissione(
								modelPosFin.getProperty(
									"/infoSottoStrumento/DomTitolo/results"
								),
								["Titolo", "Categoria", "Ce2", "Ce3"]
							)
						);

					if (
						modelPosFin.getProperty("/infoSottoStrumento/DomMissione/results")
							.length > 0
					)
						aFilters.push(
							this.__setMultiFiltersMissione(
								modelPosFin.getProperty(
									"/infoSottoStrumento/DomMissione/results"
								),
								["Missione", "Programma", "Azione", "Prctr"]
							)
						);

					return aFilters;
				},

				onConfirmTablePosFin: function (oEvent) {
					const modelPosFin = this.getView().getModel("modelPosFin");
					const oSelectedPosFin = modelPosFin.getProperty(
						oEvent.getParameter("selectedItem").getBindingContextPath()
					);
					modelPosFin.setProperty("/posFinHelp/posFin", oSelectedPosFin);
					modelPosFin.setProperty("/elencoPosFin", []);
					this.oDialogPosFin.close();
				},

				// --------------------- per le note
				getDialogNote: function (oRigaButton) {
					if (this._oDialog) {
						this._oDialog.destroy();
						this._oDialog = null;
					}
					if (!this._oDialog) {
						this._oDialog = sap.ui.xmlfragment(
							"zsap.com.r3.cobi.s4.ecobilancioigb.view.fragment.PopoverNote",
							this
						);
						var oRiga = oRigaButton;
						var notaModel = new JSONModel();
						notaModel.setData(oRiga);
						// this.getView().setModel(notaModel, "notaModel");
						//this._oDialog.bindElement('modelTable>/');
						this._oDialog.setModel(notaModel, "notaModel");
						this.getView().addDependent(this._oDialog);
					}
					return this._oDialog;
				},

				onOpenPopOverNote: function (oEvent, sTable) {
					if(sTable === 'analisi'){
						var oButton = oEvent.getSource();
						var oRigaButton = oEvent
						.getSource()
						.getParent()
						.getBindingContext("modelAnalisi")
						.getObject();
						oRigaButton.selected = true;
						this.getDialogNote(oRigaButton).openBy(oButton);
					}
					if(sTable === 'ecobilancio'){
						var oButton = oEvent.getSource();
						var oRigaButton = oEvent
						.getSource()
						.getParent()
						.getBindingContext("modelEcobilancio")
						.getObject();
						oRigaButton.selected = true;
						this.getDialogNote(oRigaButton).openBy(oButton);
					}
					var oButton = oEvent.getSource();
					var oRigaButton = oEvent
						.getSource()
						.getParent()
						.getBindingContext("modelAnalisi")
						.getObject();
					oRigaButton.selected = true;
					this.getDialogNote(oRigaButton).openBy(oButton);
				},

				onClosePopOverNote: function (oEvent) {
					var oButton = oEvent.getSource();
					this._oDialog.close();
				},

				//formatter per la posizione finanziaria
				formatterPosFin: function (sValue) {
					if (!sValue) {
						return "";
					} else {
						return sValue.replaceAll(".", "");
					}
				},

				onPressExport: function () {
					let oTableBilancio = this.getView().byId("tableEcobilancio");
					let sModel;
					let sFileName;
					let sTableExport;

					if (oTableBilancio.getVisible()) {
						sModel = "modelEcobilancio";
						sFileName = "Ecobilancio";
						sTableExport = "Ecobilancio";
					} else {
						sModel = "modelAnalisi";
						sFileName = "AnalisiClassificatoria"
						sTableExport = "AnalisiClassificatoria";
					}


					if (this.getView().getModel(sModel)) {
						this.downloadExcel(sFileName, sModel, sTableExport);
					}
				},

				onPressInfoCol: function (oEvent) {
					var sId = oEvent.getSource().getId();
					var oMessage;

					if (sId.includes("livello1") && !sId.includes("livello10") && !sId.includes("livello11") && !sId.includes("livello12")
						&& !sId.includes("livello13") && !sId.includes("livello14") && !sId.includes("livello15")&& !sId.includes("livello16")
					) {
						oMessage = "Cepa 1 - Protezione dell’aria e del clima";
					} else if (sId.includes("livello2")) {
						oMessage = "Cepa 2 - Gestione delle acque reflue";
					} else if (sId.includes("livello3")) {
						oMessage = "Cepa 3 - Gestione dei rifiuti";
					} else if (sId.includes("livello4")) {
						oMessage = "Cepa 4 - Protezione e risanamento del suolo, delle acque del sottosuolo e delle acque di superficie";
					} else if (sId.includes("livello5")) {
						oMessage =
							"Cepa 5 - Abbattimento del rumore e delle vibrazioni (esclusa la protezione degli ambienti di lavoro)";
					} else if (sId.includes("livello6")) {
						oMessage = "Cepa 6 - Protezione della biodiversità e del paesaggio";
					} else if (sId.includes("livello7")) {
						oMessage =
							"Cepa 7 - Protezione dalle radiazioni (ad esclusione della protezione degli ambienti di lavoro e del rischio tecnologico e di incidente nucleare)";
					} else if (sId.includes("livello8")) {
						oMessage = "Cepa 8 - Ricerca e sviluppo";
					} else if (sId.includes("livello9")) {
						oMessage =
							"Cepa 9 - Altre attività di protezione dell’ambiente";
					} else if (sId.includes("livello10")) {
						oMessage = "Cruma 10 - Uso e gestione delle acque interne";
					} else if (sId.includes("livello11")) {
						oMessage =
							"Cruma 11 - Uso e gestione delle foreste";
					} else if (sId.includes("livello12")) {
						oMessage = "Cruma 12 - Uso e gestione della flora e della fauna selvatiche";
					} else if (sId.includes("livello13")) {
						oMessage =
							"Cruma 13 - Uso e gestione delle materie prime energetiche non rinnovabili (combustibili fossili)";
					} else if (sId.includes("livello14")) {
						oMessage = "Cruma 14 - Uso e gestione delle materie prime non energetiche";
					} else if (sId.includes("livello15")) {
						oMessage =
							"Cruma 15 - Ricerca e sviluppo per l’uso e la gestione delle risorse naturali";
					} else if (sId.includes("livello16")) {
						oMessage =
							"Cruma 16 - Altre attività di uso e gestione delle risorse naturali";
					}
	
					this.getDialogInfoCol(oMessage).openBy(oEvent.getSource());
				},

				getDialogInfoCol: function (oMessage) {
					if (this._oDialog) {
						this._oDialog.destroy();
						this._oDialog = null;
					}
					if (!this._oDialog) {
						this._oDialog = sap.ui.xmlfragment(
							"zsap.com.r3.cobi.s4.ecobilancioigb.view.fragment.PopoverInfoColonna",
							this
						);
						var oInfo = {
							Message: oMessage
						}
	
						var infoModel = new JSONModel();
						infoModel.setData(oInfo);
						this.getView().setModel(infoModel, "infoModel");
						//this._oDialog.bindElement('modelTable>/');
						this._oDialog.setModel("infoModel");
						this.getView().addDependent(this._oDialog);
					}
					return this._oDialog;
				},
	
				onCloseInfoCol: function (oEvent) {
					var oButton = oEvent.getSource();
					this.getDialogInfoCol().close(oButton);
				},

				onselectTableItems: function(oEvent, sId, oModelTab) {
					var oModel = this.getView().getModel(oModelTab).getData();
					for (var x = 0; x < oModel.length; x++) {
						oModel[x].ENABLED = false;
					}
					for (var i = 0; i < this.getView().byId(sId).getSelectedContextPaths().length; i++) {
						var sSelectedPaths = this.getView().byId(sId).getSelectedContextPaths()[i].split("/")[1];
						if (oModel[sSelectedPaths].ENABLED === false || oModel[sSelectedPaths].ENABLED === undefined) {
							oModel[sSelectedPaths].ENABLED = true;
						} /*else { oModel[sSelectedPaths].ENABLED = false; }*/
					}
					this.getView().getModel(oModelTab).updateBindings(true);
				},

				handleValueHelpTable: async function() {
					this.openBusyDialog();
					var aFilter = [];

					var sAmmin = this.getView().byId("AmmFA").getValue();
					if (sAmmin) {
						aFilter.push(new Filter("Prctr", sap.ui.model.FilterOperator.EQ, sAmmin));
					}
					aFilter.push(new Filter("Fikrs", sap.ui.model.FilterOperator.EQ, "S001"));
					aFilter.push(new Filter("Reale", sap.ui.model.FilterOperator.EQ, "R"));
					aFilter.push(new Filter("Fase", sap.ui.model.FilterOperator.EQ, "DLB"));
					aFilter.push(new Filter("Eos", sap.ui.model.FilterOperator.EQ, "S"));
					aFilter.push(new Filter("Anno", sap.ui.model.FilterOperator.EQ, "2024"));
					// aFilter.push(new Filter("Pg", sap.ui.model.FilterOperator.EQ, "01"));
					aFilter.push(new Filter("Datbis", sap.ui.model.FilterOperator.GE, new Date()));
					try {
						var aCapitoli = await this._readFromDb("4", "/TipCapitoloSet", aFilter, []);

						// recupero descrizione estesa
						let oAmminModel = this.getView().getModel("amministrazioniModel");;
						aCapitoli.forEach(c => {
							c.DescPrctr = this.formatter.formatterDescrAmmin(oAmminModel, c.Prctr);
						});
						aCapitoli.sort((a,b) => (a.Capitolo > b.Capitolo) ? 1 : ((b.Capitolo > a.Capitolo) ? -1 : 0));
						// rimozione doppioni
						aCapitoli = aCapitoli.reduce((accumulator, current) => {
							if (!accumulator.find((item) => item.Prctr === current.Prctr && item.Capitolo === current.Capitolo)) {
								accumulator.push(current);
							}
							return accumulator;
						}, []);

					} catch (error) {
						var aCapitoli = [];
						this.closeBusyDialog();
					}
					this._oDialogElencoCap = sap.ui.xmlfragment('zsap.com.r3.cobi.s4.ecobilancioigb.view.fragment.MatchcodeCapitoli', this);
					this.getView().addDependent(this._oDialogElencoCap);
					this._oDialogElencoCap.setModel(new JSONModel(aCapitoli), "modelElencoCap");
					this._oDialogElencoCap.open();
					this.closeBusyDialog();
				},

				onCloseElencoCap: function () {
					this._oDialogElencoCap.close();
				},

				onPressItemElencoCap: function (oEvent) {
					let sContextPath = oEvent.getSource().getSelectedItem().getBindingContext("modelElencoCap").getPath();
					let sCapitolo = this._oDialogElencoCap.getModel("modelElencoCap").getProperty(sContextPath + "/Capitolo");

					this.getView().byId("idCapitolo").setValue(sCapitolo);
					this._oDialogElencoCap.close();
				},

				onPressSearchCapitoli: function (oEvent, sTableId) {
					let sValue = oEvent.getSource().getValue();

					if (sValue) {
						let aFilters = [
							new Filter({
								filters: [
									new Filter("Prctr", sap.ui.model.FilterOperator.Contains, sValue),
									new Filter("DescPrctr", sap.ui.model.FilterOperator.Contains, sValue),
									new Filter("Capitolo", sap.ui.model.FilterOperator.Contains, sValue),
									new Filter("DescEstesaCapitolo", sap.ui.model.FilterOperator.Contains, sValue)
								],
								and: false
							})
						];
						sap.ui.getCore().byId(sTableId).getBinding("items").filter(aFilters);
					}
				}
			}
		);
	}
);
