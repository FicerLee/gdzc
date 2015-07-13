define(function (require, exports, module) {
    var
        $container,
        company,
        category,
        auditstatus,
        getFilter,
        getDataById,
        reloadGrid,
        login,
        doPass,
        doReject,
        doRemove,
        doReSubmit,
        showAuditInfo,
        showNewAudit,
        policy,
        init;
    login = require('app/app.login');
    policy = require('app/app.policy');
    company = require('app/app.company');
    category = require('app/app.devicecategory');
    auditstatus = require('app/app.auditstatus');
    getDataById = function (id) {
        var data = Utility.getData({
            path: 'auditrepairdevice/get',
            data: {
                id: id
            }
        });
        return !data ? null : data.rows;
    }
    getFilter = function () {
        return {
            key: $('#auditdevicerepair-key').val(),
            categoryid: $('#auditdevicerepair-category').combotree('getValue') || null,
            companyid: $('#auditdevicerepair-company').combotree('getValue') || null,
            auditstatusid: $('#auditdevicerepair-auditstatus').combobox('getValue') || null
        };
    }
    reloadGrid = function () {
        if ($container)
            $container.datagrid('load', getFilter());
    }
    doPass = function (id) {
        Utility.saveData({
            path: 'auditrepairdevice/pass',
            params: {
                id: id,
                completerid: login.getLocalUser().usercode
            },
            success: function (res) {
                $.messager.alert('成功', '设备修理申请已通过', 'info');
                $('#auditdevicerepair-form').dialog('close');
                reloadGrid();
            },
            error: function (message) {
                $.messager.alert('错误', message, 'error');
            }
        })
    }
    doReject = function (id) {
        Utility.saveData({
            path: 'auditrepairdevice/reject',
            params: {
                id: id,
                completerid: login.getLocalUser().usercode
            },
            success: function (res) {
                $.messager.alert('成功', '设备修理申请已成功退回', 'info');
                $('#auditdevicerepair-form').dialog('close');
                reloadGrid();
            },
            error: function (message) {
                $.messager.alert('错误', message, 'error');
            }
        })
    }
    doRemove = function (id) {
        Utility.saveData({
            path: 'auditrepairdevice/remove',
            params: {
                id: id,
                completerid:login.getLocalUser().usercode
            },
            success: function (res) {
                $.messager.alert('成功', '设备修理申请已删除', 'info');
                $('#auditdevicerepair-form').dialog('close');
                reloadGrid();
            },
            error: function (message) {
                $.messager.alert('错误', message, 'error');
            }
        })
    }
    doReSubmit = function (id) {
        Utility.saveData({
            path: 'auditrepairdevice/resubmit',
            params: {
                id: id,
                creatorid: login.getLocalUser().usercode
            },
            success: function (res) {
                $.messager.alert('成功', '设备修理申请已重新提交', 'info');
                $('#auditdevicerepair-form').dialog('close');
                reloadGrid();
            },
            error: function (message) {
                $.messager.alert('错误', message, 'error');
            }
        })
    }
    showAuditInfo = function (id) {
        var data = getDataById(id);
        if (!data) return false;
        require.async([
            'tpl/auditdevicerepair/auditdevicerepair-form.html',
            'tpl/auditdevicerepair/auditdevicerepair-form.css',
        ], function (tpl, css) {
            data.createddate = Utility.formatDate(data.createddate);
            data.repairstartdate = Utility.formatDate(data.repairstartdate);
            data.repairenddate = Utility.formatDate(data.repairenddate);
            var output = Mustache.render(tpl, data);
            formContainer = '#auditdevicerepair-form';
            $(output).dialog({
                title: '设备修理申请审核明细',
                modal: true,
                width: 600,
                height: 200,
                onOpen: function () {
                    $.parser.parse(formContainer);
                },
                onClose: function () {
                    $(formContainer).dialog('destroy', true);
                }
            })
            /*绑定事件*/
            /*审核通过*/
            $('#auditdevicerepair-form-btnsubmit').on('click', function (e) {
                e.preventDefault();
                doPass(data.id);
            });
            /*审核退回*/
            $('#auditdevicerepair-form-btnreject').on('click', function (e) {
                e.preventDefault();
                doReject(data.id);
            });
            /*审核删除*/
            $('#auditdevicerepair-form-btnremove').on('click', function (e) {
                e.preventDefault();
                doRemove(data.id);
            });
            /*再次提交*/
            $('#auditdevicerepair-form-btnresubmit').on('click', function (e) {
                e.preventDefault();
                doReSubmit(data.id);
            })
        });

    }
    showNewAudit = function () {
        require.async('app/app.devicerepair', function (devicerepair) {
            devicerepair.showUpdate({
                action:'addnew'
            });
            reloadGrid();
        });
    }
    init = function (container) {
        $container = $(container);
        //显示单位信息
        company.showComboTree('#auditdevicerepair-company');
        //显示设备类型
        category.showComboTree('#auditdevicerepair-category');
        //显示审核状态
        auditstatus.showCombo('#auditdevicerepair-auditstatus');
        //显示主数据信息
        $container.datagrid({
            columns: [[{
                field: 'id',
                checkbox: true
            }, {
                field: 'statusname',
                title: '审核状态',
                width: 120
            }, {
                field: 'assetno',
                title: '资产编码',
                width: 140,
                sortable: true,
            }, {
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
            }, {
                field: 'companyname',
                title: '部门单位',
                width: 250
            }, {
                field: 'assetbelong',
                title: '资产归属',
                width: 140
            }, {
                field: 'createddate',
                title: '审核提交时间',
                width: 120,
                formatter: function (value, row, index) {
                    if (value) {
                        return Utility.formatDate(value);
                    }
                }
            }, {
                field: 'completeddate',
                title: '审核完成时间',
                width: 120,
                formatter: function (value, row, index) {
                    if (value)
                        return Utility.formatDate(value);
                }
            }]],
            idField: 'id',
            rownumbers: true,
            singleSelect:true,
            fitColumns: false,
            border: false,
            pagination: true,
            toolbar: '#auditdevicerepair-toolbar',
            fit: true,
            striped: true,
            rowStyler: function (index, row) {
                if (row.statusname == "审核退回") {
                    return {
                        class: 'text-red text-del'
                    };
                }
            },
            onRowContextMenu: function (e, rowIndex, rowData) {
                $container.datagrid('selectRow', rowIndex);
                $('#auditdevicerepair-grid-contextmenu').menu('show', {
                    left: e.pageX,
                    top: e.pageY,
                    onClick: function (item) {
                        switch (item.name) {
                            case 'auditdevicerepair-showAuditInfo':
                                showAuditInfo(rowData.id);
                                break;
                            case 'auditdevicerepair-doPass':
                                doPass(rowData.id);
                                break;
                            case 'auditdevicerepair-doReject':
                                doReject(rowData.id);
                                break;
                            case 'auditdevicerepair-doReSubmit':
                                doReSubmit(rowData.id);
                                break;
                            case 'auditdevicerepair-doRemove':
                                doRemove(rowData.id);
                                break;
                            default:
                                break;
                        }
                    }
                });
                e.preventDefault();
            },
            url: Utility.serverUrl + 'auditrepairdevice/getlist',
            queryParams: getFilter()
        });
        /*绑定事件*/
        //搜索
        $('#auditdevicerepair-btnsearch').on('click', function (e) {
            e.preventDefault();
            reloadGrid();
        });
        //导出维修记录
        $('#auditdevicerepair-btnexport').linkbutton({
            disabled: !policy.checkpolicy({
                policyno: 'auditdevicerepair-allowexport',
                policyname: '导出设备维修申请记录',
                groupname: '审核设备维修'
            }),
            onClick: function () {

            }
        });
        var menu = '#auditdevicerepair-grid-contextmenu';
        if (!policy.checkpolicy({
            policyno: 'auditdevicerepair-allowaudit',
            policyname: '允许审核设备维修',
            groupname: '审核设备维修'
        })) {
            var texts = [
                '审核通过',
                '审核删除',
                '审核退回'
            ];
            texts.forEach(function (value, index) {
                var item = $(menu).menu('findItem', value);
                if (item && item.target)
                    $(menu).menu('disableItem', item.target);
            });
        };
        if(!policy.checkpolicy({
            policyno:'repair-allowaddnew',
                policyname:'新增设备维修',
            groupname:'设备维修管理'
        })) {
            var item = $(menu).menu('findItem', '再次提交审核');
            if (item && item.target)
                $(menu).menu('disableItem', item.target);
        }
    }
    exports.init = init;
});