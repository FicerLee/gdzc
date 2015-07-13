define(function (require, exports, module) {
    var
        showDialog;
    /*显示下载对话框
     * options:
     *   rows:'下载的文件路径',
     *   title:'下载提示'
     */
    showDialog = function (options) {
        var tpl = require('tpl/export/view.html');
        var container = '#export-view';
        var output = Mustache.render(tpl, options);
        $(output).dialog({
            title: '下载',
            modal: true,
            width: 400,
            height: 180,
            onOpen: function () {
                $.parser.parse(container);
            },
            onClose: function () {
                $(container).dialog('destroy', true);
            }
        });
    }
    exports.showDialog = showDialog;
});