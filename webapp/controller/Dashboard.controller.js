sap.ui.define([
    "com/nhpc/zhriepfentrecs1/controller/BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/export/Spreadsheet",
    "sap/ui/core/Fragment",
    "sap/ui/core/ValueState",
    "com/nhpc/zhriepfentrecs1/utils/formatter",
    "com/nhpc/zhriepfentrecs1/utils/messenger",
    "sap/ui/export/library"
], (BaseController,Filter, FilterOperator, Spreadsheet, Fragment, ValueState, formatter, messenger,exportLibrary) => {
    "use strict";
    var EdmType = exportLibrary.EdmType;
    return BaseController.extend("com.nhpc.zhriepfentrecs1.controller.Dashboard", {
        formatter:formatter,
        onInit() {
        },
        onCreate: function(){
            let oViewModel = this.getModel("viewModel");
            oViewModel.setProperty("/DPID","");
            oViewModel.setProperty("/ClientID","");
            oViewModel.setProperty("/valueState/DPID","None");
            oViewModel.setProperty("/valueState/ClientID","None");
            oViewModel.setProperty("/valueStateText/DPID",null);
            oViewModel.setProperty("/valueStateText/ClientID",null);
            let oView = this.getView();
            if(!this.oCreateDialog){
                this.oCreateDialog = Fragment.load({
                    id:oView.getId(),
                    name: "com.nhpc.zhriepfentrecs1.fragments.Create",
                    controller:this
                }).then(function(oDialog){
                    oView.addDependent(oDialog);
                    oDialog.open();
                    return oDialog;
                });
            } else {
                this.oCreateDialog.then(function(oDialog){
                    oDialog.open();
                });
            }
        },
        onCloseDialog:function(){
            this.oCreateDialog.then(function(oDialog){
                oDialog.close();
            });
        },
        onIDSelect:function(){
            let sValid = this.checkValidation();
            let oViewModel = this.getModel("viewModel");
            if(!sValid){
                return;
            } else {
                this.getRouter().navTo("RouteDetail",{
                    DPID: oViewModel.getProperty("/DPID"),
                    ClientID: oViewModel.getProperty("/ClientID")
                })
            }
        },
        checkValidation: function(){
            let sValid = true;
            let oViewModel = this.getModel("viewModel");
            let oResourceBundle = this.getResourceBundle();
            let sDPID = oViewModel.getProperty("/DPID");
            let sClientID = oViewModel.getProperty("/ClientID");

            if(!sDPID){
                sValid = false;
                oViewModel.setProperty("/valueState/DPID","Error");
                oViewModel.setProperty("/valueStateText/DPID", oResourceBundle.getText("selectDPIDErrorMsg"));
            } 
            if(!sClientID){
                sValid = false;
                oViewModel.setProperty("/valueState/ClientID","Error");
                oViewModel.setProperty("/valueStateText/ClientID", oResourceBundle.getText("selectClientIDErrorMsg"));
            }
            return sValid;
        }
    });
});