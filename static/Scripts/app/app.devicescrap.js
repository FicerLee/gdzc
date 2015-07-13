define(function (require, exports, module) {
    var
        $container,
        company,
        device,
        category,
        getFilter,
        reloadGrid,
        showUpdate,
        doUpdate,
        login,
        checkpolicy,
        init;
    device = require('app/app.device');
    login = require('app/app.login');
    company = require('app/app.company');
    category = require('app/app.devicecategory');
    reloadGrid = function () {
        $container.datagrid('load', getFilter());
    }
    showUpdate = function () {
        var tpl = require('tpl/devicescrap/devicescrap-form.html');
        require('tpl/devicescrap/devicescrap-form.css');
        var formContainer = '#devicescrap-form';
        $(tpl).dialog({
            title: '设备报废申请',
            modal: true,
            width: 600,
            height: 200,
            onOpen: function () {
                $.parser.parse(formContainer);
                device.showComboGrid('#devicescrap-form-device', {
                    queryParams: {
                        //资产属性为'备件'
                        assetpropertyid: 2,
                        companyid: (function () {
                            var login = require('app/app.login');
                            var userdata = login.getLocalUser();
                            return userdata.companyid;
                        })()
                    }
                });
            },
            onClose: function () {
                $(formContainer).dialog('destroy', true);
            }
        })
        /*绑定事件*/
        $('#devicescrap-form-btnsubmit').on('click', function (e) {
            e.preventDefault();
            var data = {
                deviceid: $('#devicescrap-form-device').combogrid('getValue') || null,
                creatorid: login.getLocalUser().usercode,
                memo: $('#devicescrap-form-memo').val()
            };
            if (!data.deviceid) {
                $.messager.alert('错误', '必须选择设备', 'error');
                return false;
            }
            doUpdate(data);
        });
    }
    doUpdate = function (data) {
        Utility.saveData({
            path: 'auditscrapdevice/submit',
            params: data,
            success: function (res) {
                $.messager.alert('成功', '该设备报废申请已成功提交', 'info');
                $('#devicescrap-form').dialog('close');
                reloadGrid();
            },
            error: function (message) {
                $.messager.alert('失败', message, 'error');
            }
        })
    }
    getFilter = function () {
        return {
            key: $('#devicescrap-key').val(),
            categoryid:$('#devicescrap-category').combotree('getValue')||null,
            companyid:$('#devicescrap-company').combotree('getValue')||null,
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
                field: 'id',
                checkbox: true
            }, {
                field: 'assetno',
                title:'资产编码',
                width: 140,
                sortable:true,
            },{
                field: 'deviceno',
                title: '设备型号',
                width: 140,
                sortable: true
            }, {
                field: 'categoryname',
                title: '设备类型',
                width: 120
            }, {
                field: 'assetcategoryname',
                title: '资产类型',
                width: 60
            },{
                field: 'companyname',
                title: '部门单位',
                width: 250
            }, {
                field: 'assetbelongname',
                title: '资产归属',
                width: 140
            }, {
                field: 'createddate',
                title: '申请报废时间',
                width: 120
            }, {
                field: 'completeddate',
                title: '审核完成时间',
                width: 120
            },{
                field: 'auditstatusname',
                title: '审核状态',
                width: 120
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

                    }
                });
                e.preventDefault();
            },
            url: Utility.serverUrl + 'auditscrapdevice/getlist',
            queryParams:getFilter()
        });
        /*绑定事件*/
        $('#devicescrap-btnadd').linkbutton({
            disabled: !checkpolicy({
                policyno: 'device-allowscrap',
                policyname: '新增设备报废申请',
                groupname: '设备资料维护'
            }),
            onClick: function () {
                showUpdate();
            }
        });
        $('#devicescrap-btnexport').linkbutton({
            disabled: !checkpolicy({
                policyno: 'device-allowscrapexport',
                policyname: '导出设备报废记录',
                groupname: '设备资料维护'
            }),
            onClick: function () {

            }
        });
        $('#devicescrap-btnsearch').linkbutton({
            onClick: function () {

            }
        });

    }
    /*检查确认权限信息*/
    checkpolicy = function (options) {
        login.checkpolicy(options, function (r) {
            return r;
        });
        return false;
    }
    exports.init = init;
});