define(function (require, exports, module) {
    var
        getSelectedIdFromCombo,
        showCombo;
    showCombo = function (container) {
        $(container).combobox({
            url:Utility.serverUrl+'assetcategory/getlist',
            valueField: 'id',
            textField: 'categoryname',
            panelMinWidth:120,
            panelWidth:'auto',
            editable: false,
            panelHeight: 'auto',
            prompt:'选择资产类别',
            loader: function (params,success, error) {
                var opt = $(this).combobox('options');
                $.ajax({
                    url: opt.url,
                    type: opt.method,
                    dataType: 'json',
                    data: opt.params,
                    success: function (res) {
                        if (res.rows)
                            success(res.rows);
                        else
                            success(res);
                    },
                    error: function () {
                        error.apply(this, arguments);
                    }
                })
            }
        });
    }
    getSelectedIdFromCombo = function (container) {
        var id = $(container).combobox('getValue');
        return id || 0;
    }
    exports.showCombo = showCombo;
    exports.getSelectedIdFromCombo = getSelectedIdFromCombo;
});