define(function (require, exports, module) {
    var
        showCombo,
        getSelectedIdFromCombo,
        init;
    getSelectedIdFromCombo = function (container) {
        var $container = $(container);
        return $container.combobox('getValue') || null;
    }
    init = function (container) {

    }
    showCombo = function (container) {
        var $container = $(container);
        $container.combobox({
            url:Utility.serverUrl+'auditrepairdevice/getrepairstatus',
            valueField: 'id',
            textField: 'text',
            editable: false,
            panelMinWidth: 120,
            panelWidth: 'auto',
            panelMinHeight: 80,
            panelHeight: 'auto',
            prompt:'选择维修状态'
        });
    }
    exports.init = init;
    exports.showCombo = showCombo;
    exports.getSelectedIdFromCombo = getSelectedIdFromCombo;
});