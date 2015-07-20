define(function (require, exports, module) {
    var
        tag,
        policy,
        login,
        fileexport,
        assetcategory,
        assetproperty,
        status,
        category,
        belong,
        getFilter,
        reloadGrid,
        showUpdate,
        init;
    tag = '#devicestop';
    assetcategory = require('app/app.assetcategory');
    assetproperty = require('app/app.assetproperty');
    belong = require('app/app.belong');
    category = require('app/app.devicecategory');
    policy = require('app/app.policy');
    login = require('app/app.login');
    fileexport = require('app/app.export');
    status = require('app/app.devicestatus');
    //#region 初始化
    init = function (container) {
        assetcategory.showCombo(tag + '-assetcategory');
        assetproperty.showComboTree(tag + '-assetproperty');
        belong.showCombo(tag + '-belong');
        console.log(login.getLocalUser().companyid);
        $(tag + '-belong').combobox('setValue', login.getLocalUser().companyid);
        category.showComboTree(tag + '-category');
        $(container).datagrid({
            columns: [[
                {
                    field: 'id',
                    checkbox:true
                }, {
                    field: 'statusname',
                    title:'审核状态'
                },{
                    field: 'assetno',
                    title:'资产编码'
                }, {
                    field: 'deviceno',
                    title:'设备型号'
                }, {
                    field: 'categoryname',
                    title:'设备类型'
                }, {
                    field: 'assetcategoryname',
                    title:'资产类型'
                }, {
                    field: 'stopdevicestatusname',
                    title:'停用设备状态'
                }, {
                    field: 'createddate',
                    title: '提交时间',
                    width:130
                }, {
                    field: 'completeddate',
                    title: '审核完成时间'
                }
            ]],
            view: scrollview,
            pageSize: Utility.pageList[0],
            rownumbers: true,
            fit: true,
            singleSelect: true,
            url: Utility.serverUrl + 'auditstopdevice/getlist',
            queryParams: getFilter(),
            toolbar:tag+'-toolbar'
        });
        //#region   绑定事件
        $(tag + '-btnsearch').linkbutton({
            onClick: function () {
                reloadGrid();
            }
        });
        $(tag + '-btnexport').linkbutton({
            onClick: function () {

            }
        })
        //#endregion
    };
    //#endregion

    //#region 获取筛选
    getFilter = function () {
        return {
            key: $(tag + '-key').val(),
            assetbelongid: $(tag + '-belong').combobox('getValue'),
            categoryid: $(tag + '-category').combotree('getValue'),
            assetcategoryid: $(tag + '-assetcategory').combobox('getValue'),
            assetpropertyid:$(tag+'-assetproperty').combotree('getValue')
        };
    }
    //#endregion

    //#region刷新数据
    reloadGrid = function () {
        if ($(tag + '-grid'))
            $(tag + '-grid').datagrid('reload');
    };
    //#endregion

    //#region设置设备停用
    showUpdate = function (data) {
        var tpl = require('tpl/device/device-stop.html');
        var output = Mustache.render(tpl, data);
        var container =tag+'-form';
        $(output).dialog({
            title: '停用设备',
            modal: true,
            width: 600,
            height: 300,
            onOpen: function () {
                $.parser.parse(container);
                status.showComboByDeviceStop(container + '-status');
            },
            onClose: function () {
                $(container).dialog('destroy', true);
            },
            buttons: [
                {
                    iconCls: 'icon-submit',
                    text: '提交审核',
                    handler: function () {
                        var _data = {
                            deviceid:data.id,
                            statusid: $(container + '-status').combobox('getValue'),
                            memo: $(container + '-memo').val(),
                            creatorid: login.getLocalUser().usercode
                        };
                        try {
                            if (!_data.statusid)
                                throw new Error('设备停用状态不能为空');
                            if (!_data.memo)
                                throw new Error('设备停用原因不能为空');
                            Utility.saveData({
                                path: 'auditstopdevice/submit',
                                params: _data,
                                success: function (res) {
                                    $.messager.alert('成功', '该设备已成功提交停用申请', 'info');
                                    $(container).dialog('close');
                                },
                                error: function (message) {
                                    $.messager.alert('错误', message, 'warning');
                                }
                            });
                        } catch (ex) {
                            $.messager.alert('警告', ex.message, 'warning');
                        };
                    }
                }
            ]
        });
    };
    //#endregion
    exports.init = init;
    exports.showUpdate = showUpdate;
});