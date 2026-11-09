sap.ui.define([
    "sap/ui/core/UIComponent",
    "com/nhpc/zhriepfentrecs1/model/models",
    "com/nhpc/zhriepfentrecs1/utils/messenger"
], (UIComponent, models,messenger) => {
    "use strict";

    return UIComponent.extend("com.nhpc.zhriepfentrecs1.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init() {
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // set the device model
            this.setModel(models.createDeviceModel(), "device");
            this.setModel(models.createViewModel(), "viewModel");
            // enable routing
            this.getRouter().initialize();
            messenger.init(this);
        }
    });
});