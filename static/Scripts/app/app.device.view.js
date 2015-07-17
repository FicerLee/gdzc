define(function (require, exports, module) {
    var
        deferred,
        device,
        showInfo;
    device = require('app/app.device');
    deferred = $.Deferred();
    /*显示设备信息
     * options
     *   deviceids:[]
     */
    showInfo = function (options) {
        var data = {
            rows: []
        };
        $.each(options.deviceids, function (index, value) {
            var _data = device.getDataById(value);
            if (!_data)
                data.rows.push(_data);
        });
        if (data.rows.length <= 0)
        {
            deferred.reject('该设备在数据库中并不存在');
        } else {
            var tpl = require('tpl/device/device-views.html');
            var output = Mustache.render(tpl, data);
            var container = '#device-views';
            $(output).dialog({
                title: '查看所选设备详细信息',
                modal: true,
                width: 800,
                height: 350,
                onOpen: function () {
                    $.parser.parse(container);
                },
                onClose: function () {
                    $(container).dialog('destroy', true);
                }
            })
        }
        return deferred.promise();
    }

    exports.showInfo = showInfo;
});