define(function (require, exports, module) {
    var
        device,
        showComboGrid,
        showInfo;
    device = require('app/app.device');
    //#region显示设备信息
    showInfo = function (options) {
        var data = {
            rows: []
        };
        var deferred = $.Deferred(function () {
            $.each(options.deviceids, function (index, value) {
                device.getDataById(value).done(function (_data) {
                    data.rows.push(_data);
                });
            });
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
                    deferred.resolve();
                },
                onClose: function () {
                    $(container).dialog('destroy', true);
                }
            })
        };
        return deferred.promise();
    }
    //#endregion

    //#region选择设备信息
    showComboGrid = function (container, options) {
        var deferred = $.Deferred();
        var options = options || {};
        var queryParams = options.queryParams || {};
        $(container).combogrid({
            url: Utility.serverUrl + 'device/getlist',
            delay: 500,
            mode: 'remote',
            idField: 'id',
            valueField: 'id',
            textField: 'deviceno',
            columns: [[
                {
                    field: 'assetno',
                    title: '资产编码',
                    width: 80
                }, {
                    field: 'deviceno',
                    title: '设备型号',
                    width: 160,
                }, {
                    field: 'username',
                    title: '设备使用人',
                    width: 80
                }, {
                    field: 'assetpropertyname',
                    title: '资产属性',
                    width: 70
                }, {
                    field: 'assetcategoryname',
                    title: '资产类别',
                    width: 70
                }, {
                    field: 'categoryname',
                    title: '设备类型',
                    width: 80
                }, {
                    field: 'useaddress',
                    title: '使用地点',
                    width: 120
                }
            ]],
            panelMinWidth: 500,
            panelWidth: 'auto',
            panelMinHeight: 80,
            panelHeight: 'auto',
            panelMaxHeight:200,
            queryParams: $.extend({
                belongid: login.getLocalUser().companyid,
            }, queryParams)
        });
        return deferred.promise();
    }
    //#endregion



    exports.showInfo = showInfo;
    exports.showComboGrid = showComboGrid;
});