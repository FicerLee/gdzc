define(function (require, exports, module) {
    var
        $container,
        getFilter,
        company,
        category,
        auditstatus,
        login,
        view,
        tag,
        showDeviceInfoByAuditId,
        showAuditInfo,
        doPass,
        doReject,
        doReSubmit,
        doRemove,
        getDataById,
        reloadGrid,
        policy,
        init;
    tag='#auditdeviceproperty';
    login = require('app/app.login');
    policy = require('app/app.policy');
    company = require('app/app.company');
    category = require('app/app.devicecategory');
    auditstatus = require('app/app.auditstatus');
    view=require('app/app.device.view');
    getDataById = function (id) {
        var data = Utility.getData({
            path: 'auditeditdevice/get',
            data: {
                id: id
            }
        });
        return !data ? null : data.rows;
    };
    reloadGrid = function () {
        if ($container) {
            $container.datagrid('load', getFilter());
        }
    };
    showDeviceInfoByAuditId = function (auditid) {
        var auditdata = getDataById(auditid);
        if (!auditdata) return false;
        view.showInfo({
            deviceids:[auditdata.deviceid]
        });
    };
    showAuditInfo = function (id) {
        var data = getDataById(id);
        if (!data) return false;
        var _data = {
            creatorname: data.creatorname,
            createddate: Utility.formatDate(data.createddate),
            values: data.propertychanges
        };
        var tpl=require('tpl/auditdeviceproperty/auditdeviceproperty-form.html');
        var output = Mustache.render(tpl, _data);
        var formContainer = '#auditdeviceproperty-form';
        $(output).dialog({
            modal: true,
            title: '设备属性变更审核明细',
            width: 800,
            height: 400,
            onOpen: function () {
                $.parser.parse(formContainer);
            },
            onClose: function () {
                $(formContainer).dialog('destroy', true);
            }
        });
        //绑定事件
        $('#auditdeviceproperty-form-btnsubmit').on('click', function (e) {
            e.preventDefault();
            doPass(data.id);
        });
        $('#auditdeviceproperty-form-btnreject').on('click', function (e) {
            e.preventDefault();
            doReject(data.id);
        });
        $('#auditdeviceproperty-form-btnremove').on('click', function (e) {
            e.preventDefault();
            doRemove(data.id);
        });
        $('#auditdeviceproperty-form-btnresubmit').on('click', function (e) {
            e.preventDefault();
            doReSubmit(data.id);
        });

    };
    getFilter = function () {
        return {
            key: $('#auditdeviceproperty-key').val(),
            companyid: $('#auditdeviceproperty-company').combotree('getValue') || null,
            categoryid: $('#auditdeviceproperty-category').combotree('getValue') || null,
            auditstatusid: $('#auditdeviceproperty-auditstatus').combobox('getValue') || null
        }
    };
    init = function (container) {
        $container = $(container);
        $(tag+'-startdate').datebox();
        $(tag+'-enddate').datebox({
            value:new Date().toString('yyyy-MM-dd')
        });
        //显示单位信息
        company.showComboTree('#auditdeviceproperty-company');
        //显示设备类型
        category.showComboTree('#auditdeviceproperty-category');
        //显示审核状态
        auditstatus.showCombo('#auditdeviceproperty-auditstatus');
        //显示主数据信息
        $container.datagrid({
            columns: [[{
                field: 'id',
                checkbox: true
            }, {
                field: 'statusname',
                title: '审核状态',
                width: 80,
                align:'right',
                styler:function(value){
                    return Utility.auditstatusStyle(value);
                }
            }, {
                field: 'assetno',
                title: '资产编码',
                width: 140,
                sortable: true,
            }, {
                field: 'deviceno',
                title: '设备型号',
                sortable: true
            }, {
                field: 'categoryname',
                title: '设备类型',
                width: 120
            }, {
                field: 'assetcategoryname',
                title: '资产类型',
                width: 60
            }, {
                field: 'companyname',
                title: '部门单位',
                width: 250
            }, {
                field: 'assetbelongname',
                title: '资产归属',
                width: 140
            }, {
                field: 'createddate',
                title: '审核提交时间',
                width: 130,
                formatter: function (value, row, index) {
                    if (value)
                        return Utility.formatDate(value);
                }
            }, {
                field: 'completeddate',
                title: '审核完成时间',
                width: 130,
                formatter: function (value, row, index) {
                    if (value)
                        return Utility.formatDate(value);
                }
            }]],
            idField: 'id',
            rownumbers: true,
            singleSelect: true,
            fitColumns: false,
            border: false,
            pagination: true,
            toolbar: '#auditdeviceproperty-toolbar',
            fit: true,
            striped: true,
            rowStyler: function (index, row) {
                if (row.statusname == '审核退回') {
                    return {
                        class: 'text-red text-del'
                    };
                }
            },
            onRowContextMenu: function (e, rowIndex, rowData) {
                $container.datagrid('selectRow', rowIndex);
                $('#auditdeviceproperty-grid-contextmenu').menu('show', {
                    left: e.pageX,
                    top: e.pageY,
                    onClick: function (item) {
                        switch (item.name) {
                            case 'auditdeviceproperty-showAuditInfo':
                                showAuditInfo(rowData.id);
                                break;
                            case 'auditdeviceproperty-showDeviceInfo':
                                showDeviceInfoByAuditId(rowData.id);
                                break;
                            case 'auditdeviceproperty-doPass':
                                doPass(rowData.id);
                                break;
                            case 'auditdeviceproperty-doReject':
                                doReject(rowData.id);
                                break;
                            case 'auditdeviceproperty-doRemove':
                                $.messager.confirm('警告','是否确认删除此设备审核记录？',function(r){
                                   if(r){
                                       doRemove(rowData.id);
                                   }
                                });
                                break;
                            case 'auditdeviceproperty-doReSubmit':
                                doReSubmit(rowData.id);
                                break;
                            default:
                                break;
                        }
                    }
                });
                e.preventDefault();
            },
            url: Utility.serverUrl + 'auditeditdevice/getlist',
            queryParams: getFilter()
        });
        //绑定事件
        $('#auditdeviceproperty-btnsearch').on('click', function (e) {
            e.preventDefault();
            reloadGrid();
        });
        $('#auditdeviceproperty-btnexport').linkbutton({
            disabled: !policy.checkpolicy({
                policyno: 'auditdeviceproperty-allowexport',
                policyname: '导出设备属性修改审核记录',
                groupname: '设备属性修改审核'
            }),
            onClick: function () {

            }
        });
        /*检查菜单权限*/
        var menu = '#auditdeviceproperty-grid-contextmenu';
        if (!policy.checkpolicy({
            policyno: 'device-allowedit',
            policyname: '设备属性修改',
            groupname: '设备资料维护'
        })) {
            var item = $(menu).menu('findItem', '再次提交审核');
            if (item && item.target)
                $(menu).menu('disableItem', item.target);
        }
        if(!policy.checkpolicy({
            policyno: 'auditdeviceproperty-allowaudit',
                policyname: '允许审核设备属性修改',
            groupname:'设备属性修改审核'
        })) {
            var item = $(menu).menu('findItem', '审核通过');
            if (item && item.target)
                $(menu).menu('disableItem', item.target);
            var item1 = $(menu).menu('findItem', '审核退回');
            if (item1 && item1.target)
                $(menu).menu('disableItem', item1.target);
            var item2 = $(menu).menu('findItem', '审核删除');
            if (item2 && item2.target)
                $(menu).menu('disableItem', item2.target);
        }
    };
    doPass = function (id) {
        Utility.saveData({
            path: 'auditeditdevice/pass',
            params: {
                id: id,
                completerid: login.getLocalUser().usercode
            },
            success: function (res) {
                $.messager.alert('成功', '该设备修改属性审核已通过', 'info');
                $('#auditdeviceproperty-form').dialog('close');
                reloadGrid();
            },
            error: function (message) {
                $.messager.alert('失败', message, 'error');
            }
        })
    };
    doReject = function (id) {
        Utility.saveData({
            path: 'auditeditdevice/reject',
            params: {
                id: id,
                completerid: login.getLocalUser().usercode
            },
            success: function (res) {
                $.messager.alert('成功', '该设备修改属性审核已退回', 'info');
                $('#auditdeviceproperty-form').dialog('close');
                reloadGrid();
            },
            error: function (message) {
                $.messager.alert('失败', message, 'error');
            }
        })
    };
    doReSubmit = function (id) {
        Utility.saveData({
            path: 'auditeditdevice/resubmit',
            params: {
                id: id,
                creatorid: login.getLocalUser().usercode
            },
            success: function (res) {
                $.messager.alert('成功', '该设备修改属性已再次提交审核', 'info');
                $('#auditdeviceproperty-form').dialog('close');
                reloadGrid();
            },
            error: function (message) {
                $.messager.alert('失败', message, 'error');
            }
        })
    };
    doRemove = function (id) {
        Utility.saveData({
            path: 'auditeditdevice/remove',
            params: {
                id: id,
                completerid: login.getLocalUser().usercode
            },
            success: function () {
                $.messager.alert('成功', '该设备修改属性审核已删除', 'info');
                $('#auditdeviceproperty-form').dialog('close');
                reloadGrid();
            },
            error: function (message) {
                $.messager.alert('失败', message, 'error');
            }
        })
    };
    exports.init = init;
});