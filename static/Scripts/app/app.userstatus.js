define(function (require, exports, module) {
    var
        showCombo;
    showCombo = function (container) {
        $(container).combobox({
            url: Utility.serverUrl + 'userstatus/getlist',
            valueField: 'id',
            textField: 'text',
            prompt: '选择用户状态',
            panelMinWidth: 80,
            panelWidth: 'auto',
            panelHeight: 'auto',
            editable: false
        });
    }
    exports.showCombo = showCombo;
});