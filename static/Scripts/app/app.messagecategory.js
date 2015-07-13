define(function (require, exports, module) {
    var
        showCombo;
    showCombo = function (container) {
        var $container = $(container);
        $container.combobox({
            url: 'data/messagecategory.html',
            method: 'get',
            editable: false,
            valueField: 'id',
            textField: 'text',
            width: 100,
            panelHeight:'auto'
        });
    }
    exports.showCombo = showCombo;
});