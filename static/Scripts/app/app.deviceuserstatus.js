define(function (require, exports, module) {
    var
        showCombo;
    showCombo = function (container) {
        var $container = $(container);
        $container.combobox({
            url: Utility.serverUrl+'userstatus/getlist',
            method: 'post',
            panelHeight: 'auto',
            editable: false,
            valueField: 'id',
            textField:'text'
        });
    }
    exports.showCombo = showCombo;
});