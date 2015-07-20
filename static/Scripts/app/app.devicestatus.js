define(function (require, exports, module) {
    var
        showCombo,
        showComboByDeviceStop,
        getSelectedIdFromCombo;
    showComboByDeviceStop=function(container){
        $(container).combobox({
            url: Utility.serverUrl + 'AuditStopDevice/GetDeviceStopStatus',
            method: 'post',
            valueField: 'id',
            textField: 'text',
            panelMinWidth: 80,
            panelWidth:'auto',
            editable: false,
            panelHeight: 'auto',
            prompt: '设备停用状态'
        })
    }
    showCombo = function (container) {
        $(container).combobox({
            url:Utility.serverUrl+'DeviceStatus/GetList',
            valueField: 'id',
            textField: 'text',
            editable: false,
            panelHeight: 'auto',
            prompt:'设备状态'
        })
    }
    getSelectedIdFromCombo = function (container) {
        var id = $(container).combobox('getValue');
        return id || 0;
    }
    exports.showCombo = showCombo;
    exports.showComboByDeviceStop=showComboByDeviceStop;
    exports.getSelectedIdFromCombo = getSelectedIdFromCombo;
});