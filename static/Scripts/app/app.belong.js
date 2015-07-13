define(function (require, exports, module) {
    var
        showCombo;
    showCombo = function (container) {
        $(container).combobox({
            url: Utility.serverUrl + 'company/getbelonglist',
            method: 'post',
            editable: false,
            valueField: 'id',
            textField: 'belongname',
            panelMinWidth: 120,
            panelWidth: 'auto',
            panelHeight: 'auto',
            prompt: '选择资产归属'
        });
    }
    exports.showCombo = showCombo;
});