sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "com/nhpc/zhriepfentrecs1/utils/messenger",
    "sap/ui/core/BusyIndicator",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/ValueState",
    "sap/ui/core/format/DateFormat",
    "sap/ui/core/Fragment",
    "sap/m/SearchField",
    "sap/m/SelectDialog",
    "sap/m/StandardListItem",
    "sap/ui/table/Column",
    "sap/m/Column",
    "sap/m/ColumnListItem",
    "sap/m/Label",
    "sap/m/Text",
    "sap/m/MessageBox",
    "sap/ui/core/format/NumberFormat",
],
    /**
       * @param {typeof sap.ui.core.mvc.Controller} Controller
       */
    function (
        Controller,
        messenger,
        BusyIndicator,
        Filter,
        FilterOperator,
        ValueState,
        DateFormat,
        Fragment,
        SearchField,
        SelectDialog,
        StandardListItem,
        Column,
        MColumn,
        ColumnListItem,
        Label,
        Text,
        MessageBox,
        NumberFormat
    ) {
        "use strict";

        return Controller.extend("com.nhpc.zhriepfentrecs1.controller.BaseController", {

            /**
             * Convenience method for accessing the router.
             * @public
             * @returns {sap.ui.core.routing.Router} the router for this component
             */
            getRouter: function () {
                return this.getOwnerComponent().getRouter();
            },

            /* =========================================================== */
            /* Model Methods                                              */
            /* =========================================================== */

            /**
             * Convenience method for getting the view model by name.
             * @public
             * @param {string} [sName] the model name
             * @returns {sap.ui.model.Model} the model instance
             */
            getModel: function (sName) {

                if (this.getView()) {
                    var oModel = this.getView().getModel(sName);
                    if (oModel) {
                        return oModel;
                    }
                }

                return this.getOwnerComponent().getModel(sName);
            },

            /**
             * Convenience method for setting the view model.
             * @public
             * @param {sap.ui.model.Model} oModel the model instance
             * @param {string} sName the model name
             * @returns {sap.ui.mvc.View} the view instance
             */
            setModel: function (oModel, sName) {
                return this.getView().setModel(oModel, sName);
            },

            /**
             * Clears model and specific property if provided
             * @param {string} sModelName Model name
             * @param {string} sProperty Property
             * @public
             */
            clearModel: function (sModelName, sProperty) { },

            /**
             * Getter for the resource bundle.
             * @public
             * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
             */
            getResourceBundle: function () {
                return this.getOwnerComponent().getModel("i18n").getResourceBundle();
            },

            fileNameLengthExceeded: function () {
                var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
                messenger.error(oResourceBundle.getText("FileLengthExceededErrMsg"), () => { });
            },

            onFileSizeExceed: function (oEvent) {
                var oResourceBundle = this.getResourceBundle();
                messenger.error(oResourceBundle.getText("fileSizeExceedErrorMsg"), () => { });
            },
            getText: function (sKey, aArgs) {
                return this.getResourceBundle().getText(sKey, aArgs);
            },
            navTo: function (sRoute, oParameters) {
                this.getRouter().navTo(sRoute, oParameters);
            },
            onFileTypeMismatch: function (oEvent) {
                var oResourceBundle = this.getResourceBundle();
                messenger.error(oResourceBundle.getText("fileTypeMisMatchErrorMsg"), () => { });
            },

            formatDate: function (oDate) {
                var oDateFormat = DateFormat.getDateInstance({
                    pattern: "dd.MM.yyyyy"
                });
                return oDateFormat.format(oDate);
            },

            showSuccess: function (oResp) {
                var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
                var sSuccessTxt = oResourceBundle.getText("SuccessTxt", [oResp.REQ_NO]);
                BusyIndicator.hide();
                messenger.success(sSuccessTxt, function () {
                    this.getRouter().navTo("RouteDashboard");
                    // this.setDefaults();
                }.bind(this));
            },

            showError: function (oError, navBack) {
                const sErrorMsg = JSON.parse(oError.responseText).error.message.value;
                BusyIndicator.hide();
                messenger.error(sErrorMsg, function () {
                    if (navBack) {
                        this.getRouter().navTo("RouteDashboard");
                        // this.setDefaults();
                    }
                }.bind(this));
            },
            onStatusChange: function (oEvent) {

                var oCombo = oEvent.getSource();
                var sKey = oCombo.getSelectedKey();
                var sValue = oCombo.getValue();

                if (sValue && !sKey) {

                    oCombo.setValue("");

                    this.getModel("filterModel").setProperty(
                        "/Status",
                        ""
                    );

                    this.getModel("filterModel").setProperty(
                        "/valueState/Status",
                        "Error"
                    );

                    this.getModel("filterModel").setProperty(
                        "/valueStateText/Status",
                        "Please select a valid status."
                    );

                    return;
                }

                this.getModel("filterModel").setProperty(
                    "/valueState/Status",
                    "None"
                );

                this.getModel("filterModel").setProperty(
                    "/valueStateText/Status",
                    ""
                );
            }, onDateChange: function (oEvent) {
                let oViewModel = this.getModel("viewModel");
                let oSource = oEvent.getSource();
                let sValue = oEvent.getParameter("value");
                let oResourceBundle = this.getResourceBundle();

                oSource.setValueState("None");
                oSource.setValueStateText("");

                if (!sValue) {
                    oViewModel.setProperty("/filterData/PaymentDateFrom", "");
                    oViewModel.setProperty("/filterData/PaymentDateTo", "");
                    return;
                }

                // Expected format:
                // dd.MM.yyyy - dd.MM.yyyy
                let oRangePattern =
                    /^(\d{2}\.\d{2}\.\d{4}) - (\d{2}\.\d{2}\.\d{4})$/;

                let aMatch = sValue.match(oRangePattern);

                if (!aMatch) {
                    oSource.setValue("");
                    oSource.setValueState("Error");
                    oSource.setValueStateText(oResourceBundle.getText("invalidDateFormat"));
                    MessageBox.error(oResourceBundle.getText("invalidDateFormat"));
                    oViewModel.setProperty("/filterData/PaymentDateFrom", "");
                    oViewModel.setProperty("/filterData/PaymentDateTo", "");
                    return;
                }

                let sFromDate = aMatch[1];
                let sToDate = aMatch[2];

                function isValidDate(sDate) {
                    let aParts = sDate.split(".");
                    let iDay = Number(aParts[0]);
                    let iMonth = Number(aParts[1]);
                    let iYear = Number(aParts[2]);
                    let oDate = new Date(
                        iYear,
                        iMonth - 1,
                        iDay
                    );
                    return (
                        oDate.getFullYear() === iYear &&
                        oDate.getMonth() === iMonth - 1 &&
                        oDate.getDate() === iDay
                    );
                }
                // Validate actual calendar dates
                if (!isValidDate(sFromDate) || !isValidDate(sToDate)) {
                    oSource.setValue("");
                    oSource.setValueState("Error");
                    oSource.setValueStateText(oResourceBundle.getText("invalidDateFormat"));
                    MessageBox.error(oResourceBundle.getText("invalidDateFormat"));
                    oViewModel.setProperty("/filterData/PaymentDateFrom", "");
                    oViewModel.setProperty("/filterData/PaymentDateTo", "");
                    return;
                }

                // Make sure From <= To
                let aFrom = sFromDate.split(".");
                let aTo = sToDate.split(".");

                let oFromDate = new Date(
                    Number(aFrom[2]),
                    Number(aFrom[1]) - 1,
                    Number(aFrom[0])
                );

                let oToDate = new Date(
                    Number(aTo[2]),
                    Number(aTo[1]) - 1,
                    Number(aTo[0])
                );

                if (oFromDate > oToDate) {
                    oSource.setValue("");
                    oSource.setValueState("Error");
                    oSource.setValueStateText(oResourceBundle.getText("fromDateGreaterError"));
                    MessageBox.error(oResourceBundle.getText("fromDateGreaterError"));
                    oViewModel.setProperty("/filterData/PaymentDateFrom", "");
                    oViewModel.setProperty("/filterData/PaymentDateTo", "");
                    return;
                }

                // Valid range
                function formatDate(sDate, sTime) {
                    let aParts = sDate.split(".");
                    return aParts[2] + "-" +
                        aParts[1] + "-" +
                        aParts[0] + " " +
                        sTime;
                }

                oViewModel.setProperty(
                    "/filterData/PaymentDateFrom",
                    formatDate(sFromDate, "00:00:00")
                );

                oViewModel.setProperty(
                    "/filterData/PaymentDateTo",
                    formatDate(sToDate, "23:59:59")
                );
            },
            onFinancialYearValueHelp: function () {

                console.log(
                    "FinancialyearF4HSet :",
                    this.getModel().getProperty("/FinancialyearF4HSet")
                );

                if (!this._pFinancialYearVH) {

                    this._pFinancialYearVH = Fragment.load({
                        id: this.getView().getId(),
                        name: "com.nhpc.zhriepfentrecs1.fragments.FinancialYearVH",
                        controller: this
                    }).then(function (oDialog) {

                        this.getView().addDependent(oDialog);
                        return oDialog;

                    }.bind(this));
                }

                this._pFinancialYearVH.then(function (oDialog) {
                    oDialog.open();
                });
            },
            onFinancialYearSearch: function (oEvent) {

                var sValue =
                    oEvent.getParameter("value") ||
                    oEvent.getParameter("newValue");

                var oBinding =
                    oEvent.getSource().getBinding("items");

                if (!oBinding) {
                    return;
                }

                if (!sValue) {
                    oBinding.filter([]);
                    return;
                }

                var aFilters = [
                    new Filter(
                        "Year",
                        FilterOperator.Contains,
                        sValue
                    )
                ];

                oBinding.filter(aFilters, "Application");
            },
            onFinancialYearConfirm: function (oEvent) {

                var oItem = oEvent.getParameter("selectedItem");

                if (oItem) {

                    this.getModel("filterModel")
                        .setProperty("/Year", oItem.getTitle());

                    var oInput = this.byId("idFinancialYearInput");

                    oInput.setValueState(ValueState.None);
                    oInput.setValueStateText("");
                }
            },
            onFinancialYearCancel: function () {

                this._pFinancialYearVH.then(function (oDialog) {
                    oDialog.close();
                });
            },
            onFinancialYearChange: function (oEvent) {

                var oInput = oEvent.getSource();
                var sValue = oInput.getValue();

                var aData = this.getModel()
                    .getProperty("/FinancialyearF4HSet") || [];

                var bFound = aData.some(function (oItem) {
                    return oItem.Year === sValue;
                });

                if (sValue && !bFound) {

                    oInput.setValue("");
                    this.getModel("filterModel")
                        .setProperty("/Year", "");

                    oInput.setValueState(ValueState.Error);
                    oInput.setValueStateText(
                        this.getResourceBundle()
                            .getText("financialYearValueStateText")
                    );
                } else {
                    oInput.setValueState(ValueState.None);
                    oInput.setValueStateText("");
                }
            },
            onFilterClear: function () {

                this.getModel("filterModel").setData({
                    Year: "",


                    valueState: {
                        Year: ValueState.None,

                    },

                    valueStateText: {
                        Year: "",

                    }
                });
            },
            _getEmployeeDetails: function () {
                var oModel = this.getOwnerComponent().getModel();
                var oVM = this.getModel("viewModel");

                var aFilters = [
                    new Filter(
                        "DFLT",
                        FilterOperator.EQ,
                        "X"
                    )
                ];

                oModel.read("/ZFI_GH_USER_F4", {
                    filters: aFilters,
                    success: function (oData) {

                        if (oData.results.length > 0) {

                            var oEmp = oData.results[0];

                            oVM.setProperty("/EmpDetails", oEmp);

                            var oPreClear =
                                oVM.getProperty("/PreClearDetails") || {};

                            oPreClear.EmployeeName =
                                oPreClear.EmployeeName || oEmp.ENAME;

                            oPreClear.Pernr =
                                oPreClear.Pernr || oEmp.PERNR;

                            oPreClear.Designation =
                                oPreClear.Designation || oEmp.DESIG;

                            oPreClear.DateOfJoiningDP =
                                oPreClear.DateOfJoiningDP ||
                                oEmp.DateOfJoining;

                            oVM.setProperty(
                                "/PreClearDetails",
                                oPreClear
                            );
                        }
                    }.bind(this),

                    error: function (oError) {
                        console.log("Employee Details Error", oError);
                    }
                });
            },
            _validateInput: function (
                oEvent,
                sProperty,
                sModelPath
            ) {
                var sValue = oEvent.getParameter("value");
                var oInput = oEvent.getSource();
                var oModel = this.getOwnerComponent().getModel();
                var oFilterModel = this.getModel("filterModel");

                if (!sValue) {
                    oFilterModel.setProperty(sModelPath, "");
                    return;
                }

                var aFilters = [
                    new Filter(
                        sProperty,
                        FilterOperator.EQ,
                        sValue
                    )
                ];

                oModel.read("/PreClearSet", {
                    filters: aFilters,

                    success: function (oData) {

                        if (oData.results.length === 0) {
                            oInput.setValue("");
                            oFilterModel.setProperty(
                                sModelPath,
                                ""
                            );
                        }

                    }.bind(this),

                    error: function () {
                        oInput.setValue("");
                        oFilterModel.setProperty(
                            sModelPath,
                            ""
                        );
                    }.bind(this)
                });
            },
            onDateOfJoiningChange: function (oEvent) {

                var oDatePicker = oEvent.getSource();

                if (oEvent.getParameter("valid")) {

                    oDatePicker.setValueState(ValueState.None);
                    oDatePicker.setValueStateText("");

                } else {

                    oDatePicker.setValue("");

                    oDatePicker.setValueState(ValueState.Error);
                    oDatePicker.setValueStateText(
                        this.getResourceBundle().getText("invalidDate")
                    );
                }

            },
            _validatePreClearDialog: function () {

                var bValid = true;
                var oBundle = this.getResourceBundle();

                var aControls = [
                    {
                        id: "idNoOfSecurities",
                        label: oBundle.getText("noOfSecurities")
                    },
                    {
                        id: "idFolioNo",
                        label: oBundle.getText("folioNo")
                    },
                    {
                        id: "idNatureOfApproval",
                        label: oBundle.getText("natureOfApproval")
                    },
                    {
                        id: "idEstimatedNo",
                        label: oBundle.getText("estimatedNo")
                    },
                    {
                        id: "idEstimatedValue",
                        label: oBundle.getText("estimatedValue")
                    },
                    {
                        id: "idWhetherProposed",
                        label: oBundle.getText("whetherProposed")
                    },
                    {
                        id: "idImmediateRelativeName",
                        label: oBundle.getText("nameOfImmediateRelatives")
                    },
                    {
                        id: "idDateOfPurchase",
                        label: oBundle.getText("dateOfPurchase")
                    },
                    {
                        id: "idPreviousApprovalDate",
                        label: oBundle.getText("previousApproval")
                    },
                    {
                        id: "idOfficialAddress",
                        label: oBundle.getText("officialAddress")
                    },
                    {
                        id: "idTelephone",
                        label: oBundle.getText("telephone")
                    },
                    {
                        id: "idEmail",
                        label: oBundle.getText("email")
                    },
                    {
                        id: "idInterCom",
                        label: oBundle.getText("interCom")
                    },
                    {
                        id: "idMobile",
                        label: oBundle.getText("mobile")
                    }
                ];

                aControls.forEach(function (oItem) {

                    var oControl = this.byId(oItem.id);

                    if (!oControl) {
                        return;
                    }

                    var vValue;

                    if (oControl.isA("sap.m.DatePicker")) {
                        vValue = oControl.getDateValue();
                    } else if (oControl.isA("sap.m.ComboBox")) {
                        vValue = oControl.getSelectedKey();
                    } else {
                        vValue = oControl.getValue();
                    }

                    if (!vValue) {

                        oControl.setValueState("Error");
                        oControl.setValueStateText(
                            oBundle.getText(
                                "mandatoryField",
                                [oItem.label]
                            )
                        );

                        bValid = false;

                    } else {
                        oControl.setValueState("None");
                    }

                }.bind(this));

                return bValid;
            },
            onComboboxChange: function (oEvent) {
                let oViewModel = this.getModel("viewModel");
                var oSrc = oEvent.getSource(),
                    sValue = oSrc.getSelectedKey();
                if (!sValue) {
                    oSrc.setValue(null);
                } else {
                    oSrc.setValueState(ValueState.None);
                    oSrc.setValueStateText(null);
                }
            },
            onMandatoryChange: function (oEvent) {
                var oControl = oEvent.getSource();
                var vValue;

                if (oControl.isA("sap.m.DatePicker")) {
                    vValue = oControl.getDateValue();
                } else if (oControl.isA("sap.m.ComboBox")) {
                    vValue = oControl.getSelectedKey();
                } else {
                    vValue = oControl.getValue();
                }

                if (!vValue) {
                    // oControl.setValueState("Error");
                    // oControl.setValueStateText(
                    //     this.getResourceBundle().getText("mandatoryField")
                    // );
                } else {
                    oControl.setValueState("None");
                    oControl.setValueStateText("");
                }
            },

        });
    });