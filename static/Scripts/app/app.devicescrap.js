define(function (require, exports, module) {
    var
        $container,
        company,
        view,
        category,
        getFilter,
        reloadGrid,
        showUpdate,
        doUpdate,
        login,
        policy,
        init;
    view = require('app/app.device.view');
    login = require('app/app.login');
    company = require('app/app.company');
    category = require('app/app.devicecategory');
    policy = require('app/app.policy');
    reloadGrid = function () {
        $container.datagrid('load', getFilter());
    }
    showUpdate = function () {
        var tpl = require('tpl/devicescrap/devicescrap-form.html');
        var container = '#devicescrap-form';
        $(tpl).dialog({
            title: '设备报废申请',
            modal: true,
            width: 600,
            height: 200,
            onOpen: function () {
                $.parser.parse(container);
                view.showComboGrid(container + '-device', {
                    queryParams: {
                        //资产属性为'备件'
                        assetpropertyid: 2,
                        assetbelongid: login.getLocalUser().companyid
                    }
                });
            },
            onClose: function () {
                $(container).dialog('destroy', true);
            }
        })
        /*绑定事件*/
        $(container + '-btnsubmit').on('click', function (e) {
            e.preventDefault();
            var data = {
                deviceid: $(container + '-device').combogrid('getValue') || null,
                creatorid: login.getLocalUser().usercode,
                memo: $(container + '-memo').val()
            };
            try {
                if (!data.deviceid)
                    throw new Error('必须选择设备');
                if (!data.memo)
                    throw new Error('必须填写报废原因');
            } catch (ex) {
                $.messager.alert('错误', ex.mesage, 'warning');
                return false;
            }
            doUpdate(data).done(function () {
                $(container).dialog('close');
            });
        });
    }
    doUpdate = function (data) {
        return Utility.saveData({
            path: 'auditremovedevice/submit',
            params: data,
            success: function (res) {
                $.messager.alert('成功', '该设备报废申请已成功提交', 'info');
                reloadGrid();
            },
            error: function (message) {
                $.messager.alert('失败', message, 'error');
            }
        });
    }
    getFilter = function () {
        return {
            key: $('#devicescrap-key').val(),
            categoryid: $('#devicescrap-category').combotree('getValue') || null,
            companyid: $('#devicescrap-company').combotree('getValue') || null,
            startdate: $('#devicescrap-startdate').datebox('getValue'),
            enddate: $('#devicescrap-enddate').datebox('getValue')
        };
    }
    init = function (container) {
        $container = $(container);
        //显示单位信息
        company.showComboTree('#devicescrap-company');
        //显示设备类型
        category.showComboTree('#devicescrap-category');
        //显示主数据信息
        $container.datagrid({
            columns: [[{
                field: 'statusname',
                title: '审核状态',
                align: 'right',
                width: 80,
                styler: function (value) {
                    return Utility.auditstatusStyle(value);
                }
            }, {
                field: 'assetno',
                title: '资产编码',
                sortable: true,
            }, {
                field: 'deviceno',
                title: '设备型号',
                sortable: true
            }, {
                field: 'categoryname',
                title: '设备类型',
            }, {
                field: 'deviceusername',
                title: '原设备使用人',
            }, {
                field: 'assetcategoryname',
                title: '资产类型',
            }, {
                field: 'companyname',
                title: '部门单位',
            }, {
                field: 'assetbelongname',
                title: '资产归属',
            }, {
                field: 'createddate',
                title: '申请报废时间',
            }, {
                field: 'completeddate',
                title: '审核完成时间',
                width: 130
            }]],
            idField: 'id',
            rownumbers: true,
            singleSelect: false,
            fitColumns: false,
            border: false,
            pagination: true,
            toolbar: '#devicescrap-toolbar',
            fit: true,
            striped: true,
            onRowContextMenu: function (e, rowIndex, rowData) {
                $container.datagrid('selectRow', rowIndex);
                $('#devicescrap-grid-contextmenu').menu('show', {
                    left: e.pageX,
                    top: e.pageY,
                    onClick: function (item) {
                        if (item.name == 'showDeviceInfo') {
                            view.showInfo({
                                deviceids: [rowData.deviceid]
                            });
                        }
                    }
                });
                e.preventDefault();
            },
            url: Utility.serverUrl + 'auditremovedevice/getlist',
            queryParams: getFilter()
        });
        /*绑定事件*/
        $('#devicescrap-btnadd').linkbutton({
            disabled: !policy.checkpolicy({
                policyno: 'device-allowscrap',
                policyname: '新增设备报废申请',
                groupname: '设备资料维护'
            }),
            onClick: function () {
                showUpdate();
            }
        });
        $('#devicescrap-btnexport').linkbutton({
            disabled: !policy.checkpolicy({
                policyno: 'device-allowscrapexport',
                policyname: '导出设备报废记录',
                groupname: '设备资料维护'
            }),
            onClick: function () {

            }
        });
        $('#devicescrap-btnsearch').linkbutton({
            onClick: function () {
                $(container).datagrid('reload', getFilter());
            }
        });

    }

    exports.init = init;
});