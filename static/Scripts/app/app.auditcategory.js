define(function (require, exports, module) {
    var
        showCombo,
        init;
    init = function (container) {

    }
    showCombo = function (container) {
        $container = $(container);
        $container.combobox({
            url:Utility.serverUrl+'auditcategory/getlist',
            valueField: 'id',
            textField: 'categoryname',
            editable: false,
            loader: function (param, success, error) {
                var opt = $(this).combobox('options');
                $.ajax({
                    type: opt.method,
                    url: opt.url,
                    data:opt.param,
                    dataType: 'json',
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
    exports.init = init;
    exports.showCombo = showCombo;
});