define(function (require, exports, module) {
    var
        device,
        showInfo;
    device = require('app/app.device');
    //#region显示设备信息
    showInfo = function (options) {
        var data = {
            rows:[]
        };
        $.each(options.deviceids, function (index, value) {
            var _data = device.getDataById(value);
            if (_data)
                data.rows.push(_data);
        });
        if (data.rows.length <= 0) {
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
        };
    }
    //#endregion

    exports.showInfo = showInfo;
});