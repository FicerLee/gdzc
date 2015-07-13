define(function (require, exports, module) {
    var
        showCombo,
        showDoAuditCombo,
        showViewAuditCombo,
        init;
    init = function (container) {

    }
    /*显示可查看的审核状态
     * 
     */
    showViewAuditCombo = function (container) {
        var $container = $(container);
        $container.combobox({
            url: Utility.serverUrl + 'auditstatus/getlist',
            valueField: 'id',
            textField: 'text',
            editable: false,
            panelMinWidth: 80,
            panelWidth: 'auto',
            panelHeight: 'auto',
            prompt: '审核状态',
            loadFilter: function (data) {
                var rows = data.slice(0);
                for (var i = 0; i < data.length; i++) {
                    if (data[i].text == '待提交') {
                        var pos = jQuery.inArray(data[i], rows);
                        rows.splice(pos, 1);
                    }
                }
                return rows;
            }
        });
    }
    /*显示操作审核状态信息
     * 把待提交和提交审核删除
     */
    showDoAuditCombo = function (container) {
        var $container = $(container);
        $container.combobox({
            url: Utility.serverUrl + 'auditstatus/getlist',
            valueField: 'id',
            textField: 'text',
            editable: false,
            panelMinWidth: 80,
            panelWidth: 'auto',
            panelHeight: 'auto',
            prompt: '审核状态',
            loadFilter: function (data) {
                var rows = data.slice(0);
                for (var i = 0; i < data.length; i++) {
                    if (data[i].text == '待提交' || data[i].text == '提交审核') {
                        var pos = jQuery.inArray(data[i], rows);
                        rows.splice(pos, 1);
                    }
                }
                return rows;
            }
        });
    }
    showCombo = function (container) {
        var $container = $(container);
        $container.combobox({
            url:Utility.serverUrl+'auditstatus/getlist',
            valueField: 'id',
            textField: 'text',
            editable: false,
            panelMinWidth: 80,
            panelWidth: 'auto',
            panelHeight: 'auto',
            prompt:'审核状态'
        });
    }
    exports.init = init;
    exports.showCombo = showCombo;
    exports.showDoAuditCombo = showDoAuditCombo;
    exports.showViewAuditCombo = showViewAuditCombo;
});