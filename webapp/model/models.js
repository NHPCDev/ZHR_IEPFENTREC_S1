sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device"
],
    function (JSONModel, Device) {
        "use strict";

        return {
            /**
             * Provides runtime information for the device the UI5 app is running on as a JSONModel.
             * @returns {sap.ui.model.json.JSONModel} The device model.
             */
            createDeviceModel: function () {
                var oModel = new JSONModel(Device);
                oModel.setDefaultBindingMode("OneWay");
                return oModel;
            },

            createViewModel: function () {
                var oViewModel = new JSONModel({
                    DPID: "",
                    ClientID: "",
                    filterData: {

                    },
                    valueState: {
                        DPID: "None",
                        ClientID: "None"
                    },
                    valueStateText: {
                        DPID: null,
                        ClientID: null
                    }
                });
                oViewModel.setDefaultBindingMode("TwoWay");
                return oViewModel;
            }
        };

    });