define(function (require, exports, module) {
    var
        $gridContainer,
        device,
        login,
        deviceuser,
        company,
        category,
        getFilter,
        assetproperty,
        repairstatus,
        showUpdate,
        doUpdate,
        getDataById,
        policy,
        fileexport,
        init;
    login = require('app/app.login');
    policy = require('app/app.policy');
    company = require('app/app.company');
    category = require('app/app.devicecategory');
    assetproperty = require('app/app.assetproperty');
    repairstatus = require('app/app.repairstatus');
    device = require('app/app.device');
    deviceuser = require('app/app.deviceuser');
    fileexport = require('app/app.export');
    /*根据维修id获取维修记录*/
    getDataById = function (id) {
        return Utility.getData({
            path: 'devicerepair/get',
            data: {
                id: id
            }
        });
    }
    /*显示维修处理
     * options:
     *  id:'设备维修id'
     *  deviceid:可选
     *  action:'addnew'
     */
    showUpdate = function (options) {
        var data = {};
        if (options.action == 'edit') {
            var _data = getDataById(options.id);
            data = $.extend(data, _data);
        }
        var tpl = require('tpl/devicerepair/devicerepair-form.html');
        require('tpl/devicerepair/devicerepair-form.css');
        var output = Mustache.render(tpl, data);
        var formContainer = '#devicerepair-form';
        $(output).dialog({
            modal: true,
            title: options.action == 'addnew' ? '新增维修信息' : '修改维修信息',
            width: 500,
            height: 230,
            onOpen: function () {
                $.parser.parse(formContainer);
                device.showComboGrid('#devicerepair-form-device', {
                    queryParams: {
                        statusname: '故障停用'
                    }
                });
            },
            onClose: function () {
                $(formContainer).dialog('destroy', true);
            }
        })
        //绑定事件对象
        /*提交审核*/
        $('#devicerepair-form-btnsubmit').on('click', function (e) {
            e.preventDefault();
            var data = {
                action:options.action,
                deviceid: $('#devicerepair-form-device').combogrid('getValue') || null,
                repairreason: $('#devicerepair-form-memo').val(),
                creatorid: login.getLocalUser().usercode,
                repairplace: $('#devicerepair-form-repairplace').val()
            };
            try {
                if (!data.deviceid)
                    throw new Error('必须选择待修理的设备型号');
                if (!data.repairreason)
                    throw new Error('必须写明故障停用原因');
            } catch (ex) {
                $.messager.alert('警告', ex.message, 'warning');
                return false;
            }
            doUpdate(data);
        });

    }
    /*提交设备维修信息
     * options:
     *   action:'addnew','edit','remove',
     *   deviceid:
     *   repairreson,
     *   repairplace
     */
    doUpdate = function (options) {
        Utility.saveData({
            path: 'auditrepairdevice/submit',
            params: options,
            success: function (res) {
                $.messager.alert('成功',res.message, 'info');
                $('#devicerepair-form').dialog('close');
                if ($gridContainer)
                    $gridContainer.datagrid('load', getFilter());
            },
            error: function (message) {
                $.messager.alert('错误', message, 'error');
            }
        });
    }
    //获取筛选值
    getFilter = function () {
        return {
            key: $('#devicerepair-key').val(),
            companyid: company.getSelectedIdFromTree('#devicerepair-company'),
            categoryid: category.getSelectedIdFromTree('#devicerepair-category'),
            assetpropertyid: assetproperty.getSelectedIdFromTree('#devicerepair-assetproperty'),
            statusid: repairstatus.getSelectedIdFromCombo('#devicerepair-status')
        }
    }
    /*表格初始化*/
    init = function (container) {
        $gridContainer = $(container);
        company.showTree('#devicerepair-company');
        //显示设备类别信息
        category.showTree('#devicerepair-category');
        //显示资产属性
        assetproperty.showTree('#devicerepair-assetproperty');
        //显示维修状态
        repairstatus.showCombo('#devicerepair-status');
        //显示数据信息
        $gridContainer.datagrid({
            columns: [[{
                title: '审核状态',
                field: 'statusname',
                width: 80,
                align: 'right',
                styler: function (value, row, index) {
                    return Utility.auditstatusStyle(value);
                }
            }, {
                field: 'assetno',
                title: '资产编码',
                sortable: true
            }, {
                field: 'deviceno',
                title: '设备型号',
                sortable: true
            }, {
                field: 'categoryname',
                title: '设备类别',
                sortable: true
            }, {
                field: 'assetcategoryname',
                title: '资产类型',
                sortable: true
            }, {
                title: '维修状态',
                field: 'repairstatusname',
                sortable: true
            }, {
                field: 'assetcategoryname',
                title: '资产类别',
                sortable: true
            }, {
                field: 'assetbelongname',
                title: '资产归属',
                sortable: true
            }, {
                field: 'postname',
                title: '岗位名称',
            }, {
                field: 'postproperty',
                title: '岗位性质',
            }, {
                field: 'username',
                title: '使用人',
            }, {
                field: 'createddate',
                title: '提交时间',
                formatter: function (value, row, index) {
                    if (value)
                        return Utility.formatDate(value);
                }
            }, {
                field: 'repairreason',
                title: '维修原因',
            }, {
                field: 'completeddate',
                title: '维修结束',
                formatter: function (value, row, index) {
                    if (value) {
                        return Utility.formatDate(value);
                    }
                }
            }, {
                field: 'workproperty',
                title: '用工性质',
                width: 60

            }, {
                field: 'useaddress',
                title: '使用地点',
                width: 100
            }, {
                field: 'repairplace',
                title: '维修单位',
                width: 160
            }]],
            idField: 'id',
            rownumbers: true,
            singleSelect: true,
            border: false,
            pagination: true,
            toolbar: '#devicerepair-toolbar',
            fit: true,
            striped: true,
            onRowContextMenu: function (e, rowIndex, rowData) {
                $gridContainer.datagrid('selectRow', rowIndex);
                $('#devicerepair-grid-contextmenu').menu('show', {
                    left: e.pageX,
                    top: e.pageY,
                    onClick: function (item) {
                        switch (item.name) {
                            case 'devicerepair-showDeviceInfo':
                                device.showDeviceInfo(rowdata.deviceid);
                                break;
                            case 'devicerepair-showUserInfo':
                                if (!rowData.deviceuserid) {
                                    $.messager.alert('错误', '该维修记录里未包含使用人记录', 'error');
                                    return false;
                                }
                                deviceuser.showUserInfo(rowdata.deviceuserid);
                                break;
                            case 'devicerepair-showAuditRepairDeviceConfirm':
                                //维修结果确认
                            default:
                        }
                    }
                });
                e.preventDefault();
            },
            queryParams: getFilter(),
            url: Utility.serverUrl + 'auditrepairdevice/getlist'
        });
        /*绑定事件*/
        $('#devicerepair-btnsearch').on('click', function (e) {
            e.preventDefault();
            if ($gridContainer)
                $gridContainer.datagrid('reload', getFilter());
        });
        /*新增修理*/
        $('#devicerepair-btnadd').linkbutton({
            disabled: !policy.checkpolicy({
                policyno: 'repair-allowaddnew',
                policyname: '新增设备维修',
                groupname: '设备维修管理'
            }),
            onClick: function () {
                showUpdate({
                    action: 'addnew'
                });
            }
        });
        /*双击事件*/
        $('#devicerepair-company').tree({
            onDblClick: function (node) {
                $gridContainer.datagrid('load', getFilter());
            }
        });
        $('#devicerepair-category').tree({
            onDblClick: function (node) {
                $gridContainer.datagrid('load', getFilter());
            }
        });
        $('#devicerepair-assetproperty').tree({
            onDblClick: function (node) {
                $gridContainer.datagrid('load', getFilter());
            }
        })
        /*导出*/
        $('#devicerepair-btnexport').linkbutton({
            disabled: !policy.checkpolicy({
                policyno: 'repair-allowexport',
                policyname: '导出设备维修清单',
                groupname: '设备维修管理'
            }),
            onClick: function () {
                var fields = $gridContainer.datagrid('getColumnFields');
                var columns = {};
                $.each(fields, function (index, value) {
                    var option = $gridContainer.datagrid('getColumnOption', value);
                    columns[option.field] = option.title;
                });
                Utility.saveData({
                    path: 'auditrepairdevice/exportfile',
                    params: $.extend(getFilter(), {
                        columns:columns
                    }),
                    success: function (res) {
                        fileexport.showDialog({
                            title: '设备维修清单',
                            rows: res.rows
                        });
                    },
                    error: function (message) {
                        $.messager.alert('警告', message, 'warning');
                    }
                })
            }
        })
        /*右键菜单*/
        if (!policy.checkpolicy({
            policyno: 'repair-allowconfirm',
            policyname: '维修结果确认',
            groupname: '设备维修管理'
        })) {
            var item = $('#devicerepair-grid-contextmenu').menu('findItem', '设备维修结果确认...');
            if (item && item.target)
                $('#devicerepair-grid-contextmenu').menu('disableItem', item.target);
        }
    }

    exports.init = init;
    exports.showUpdate = showUpdate;
});