define(function (require, exports, module) {
    var
        $container,
        device,
        login,
        workproperty,
        postproperty,
        company,
        devicestatus,
        showUpdate,
        doUpdate,
        getDataById,
        reloadGrid,
        getFilter,
        closeForm,
        showComboGrid,
        getSelectedIdFromComboGrid,
        showUserInfo,
        policy,
        fileexport,
        init;
    login = require('app/app.login');
    policy = require('app/app.policy');
    device = require('app/app.device');
    fileexport = require('app/app.export');
    workproperty = require('app/app.workproperty');
    postproperty = require('app/app.postproperty');
    company = require('app/app.company');
    devicestatus = require('app/app.deviceuserstatus');
    getFilter = function () {
        return {
            key: $('#deviceuser-key').val(),
            companyid:company.getSelectedIdFromTree('#deviceuser-company')||login.getLocalUser().companyid
        };
    }
    /*获取使用人基本信息*/
    showUserInfo = function (id) {
        var data = getDataById(id);
        var tpl = require('tpl/deviceuser/deviceuser-view.html');
        require('tpl/deviceuser/deviceuser-view.css');
        var output = Mustache.render(tpl, data);
        var viewContainer = '#deviceuser-view';
        $(output).dialog({
            title: '查看设备使用人',
            modal: true,
            width: 600,
            height: 150,
            onOpen: function () {
                $.parser.parse(viewContainer);
                workproperty.showCombo('#deviceuser-view-workproperty');
                postproperty.showComboTree('#deviceuser-view-postproperty');
                company.showComboTree('#deviceuser-view-company');
                company.showComboTree('#deviceuser-view-department');
            },
            onClose: function () {
                $(viewContainer).dialog('destroy', true);
            }
        })
    }
    getSelectedIdFromComboGrid = function (container) {
        return $(container).combogrid('getValue') || 0;
    }
    closeForm = function () {
        $('#deviceuser-form').dialog('close', true);
    }
    showUpdate = function (opts) {
        data = {};
        if (opts.action == 'addnew') {
            data = {
                id: null,
                action: opts.action,
                departmentid: null,
                postname: '',
                postpropertyid: null,
                workpropertyid: null,
                username: '',
                createddate: new Date().toString('yyyy-MM-dd HH:mm:ss'),
                statusid: null
            }
        } else {
            data = getDataById(opts.id);
            data.action = opts.action;
        };
        var tpl = require('tpl/deviceuser/deviceuser-form.html');
        require('tpl/deviceuser/deviceuser-form.css');
        var output = Mustache.render(tpl, data);
        $(output).dialog({
            width: 500,
            height: 200,
            modal: true,
            title: data.action === 'addnew' ? '新增' : '修改',
            onOpen: function () {
                $.parser.parse('#deviceuser-form');
                company.showComboTree('#deviceuser-form-company');
                postproperty.showComboTree('#deviceuser-form-postproperty');
                workproperty.showCombo('#deviceuser-form-workproperty');
                devicestatus.showCombo('#deviceuser-form-status');
            },
            onClose: function () {
                $('#deviceuser-form').dialog('destroy', true);
            }
        })
        //绑定事件
        /*保存*/
        $('#deviceuser-form-btnsubmit').on('click', function (e) {
            e.preventDefault();
            data = {
                userid: opts.id,
                action: opts.action,
                creatorid:login.getLocalUser().usercode,
                username: $('#deviceuser-form-username').val(),
                departmentid: $('#deviceuser-form-company').combotree('getValue') || 0,
                postname: $('#deviceuser-form-postname').val(),
                postpropertyid: $('#deviceuser-form-postproperty').combotree('getValue') || 0,
                workpropertyid: $('#deviceuser-form-workproperty').combo('getValue') || 0,
                statusid: $('#deviceuser-form-status').combo('getValue') || 0
            }
            try {
                if (!data.username)
                    throw new Error('设备使用人姓名不能为空!');
                if (!data.departmentid)
                    throw new Error('使用人所在部门不能为空!');
                if (!data.postname)
                    throw new Error('岗位名称不能为空!');
                if (!data.postpropertyid)
                    throw new Error('岗位性质不能为空');
                if (!data.workpropertyid)
                    throw new Error('员工性质不能为空');
                if (!data.statusid)
                    throw new Error('员工状态不能为空');
            } catch (ex) {
                $.messager.alert('错误', ex.message, 'warning');
                return false;
            }
            doUpdate(data);
        });

    }
    doUpdate = function (data) {
        Utility.saveData({
            path: 'auditdeviceuser/submit',
            success: function (res) {
                $.messager.alert('成功', '该设备使用人信息已成功申请审核', 'info');
                closeForm();
                reloadGrid();
            },
            error: function (message) {
                $.messager.alert('错误', message, 'error');
            },
            params:data
        });
    }
    getDataById = function (id) {
        var data = Utility.getData({
            path: 'deviceuser/get',
            data: {
                id: id
            }
        });
        return !data ? null : data.rows;
    }
    reloadGrid = function () {
        if($('#deviceuser-grid'))
            $('#deviceuser-grid').datagrid('reload',getFilter());
    }
    /*初始化*/
    init = function (container) {
        //显示左边的公司分类
        company.showTree('#deviceuser-company');
        //显示数据信息
        $(container).datagrid({
            columns: [[{
                field: 'id',
                checkbox: true,
                rowspan: 2
            }, {
                title: '公司及部门',
                sortable: true,
                colspan: 2
            }, {
                field: 'postname',
                title: '岗位名称',
                rowspan: 2
            }, {
                field: 'postpropertyname',
                title: '岗位性质',
                rowspan: 2
            }, {
                field: 'workpropertyname',
                title: '用工性质',
                rowspan: 2
            }, {
                field: 'username',
                title: '使用人',
                rowspan: 2
            }, {
                field: 'createddate',
                title: '登记时间',
                formatter: function (value, row, index) {
                    if (value) {
                        return Utility.formatDate(value);
                    }
                },
                rowspan: 2
            }, {
                field: 'status',
                title: '当前状态',
                rowspan: 2
            }], [
                 {
                     field: 'companyname',
                     title: '公司名称',
                 },
                  {
                      field: 'departmentname',
                      title: '科室名称',
                  }
            ]],
            idField: 'id',
            rownumbers: true,
            singleSelect: true,
            rowStyler: function (index, row) {
                if (row.status != '正常') {
                    return {
                        class: 'text-del text-red'
                    };
                }
            },
            fit: true,
            border: false,
            pagination: true,
            toolbar: '#deviceuser-toolbar',
            striped: true,
            queryParams: getFilter(),
            url: Utility.serverUrl + 'deviceuser/getlist',
            method: 'post',
            onRowContextMenu: function (e, index, row) {
                e.preventDefault();
                $container.datagrid('selectRow', index);
                $('#deviceuser-contextmenu').menu('show', {
                    left: e.pageX,
                    top: e.pageY,
                    onClick: function (item) {
                        switch (item.name) {
                            case 'deviceuser-showDeviceInfo':
                                device.showDeviceInfoByUser(row.id);
                                break;
                            case 'deviceuser-showUserInfo':
                                showUserInfo(row.id);
                                break;
                            default:
                                break;
                        }
                    }
                })
            }
        });
        //绑定事件
        /*双击左边的company搜索*/
        $('#deviceuser-company').tree({
            onDblClick: function (node) {
                $(container).datagrid('load', getFilter());
            }
        })
        /*搜索事件*/
        $('#deviceuser-btnsearch').on('click', function (e) {
            e.preventDefault();
            $(container).datagrid('load', {
                key: $('#deviceuser-key').val() || '',
                companyid: company.getSelectedIdFromTree('#deviceuser-company')
            });
        });
        /*新增事件*/
        $('#deviceuser-btnadd').linkbutton({
            disabled: !policy.checkpolicy({
                policyname: '新增设备使用人',
                policyno: 'deviceuser-allowadd',
                groupname: '设备使用人维护'
            }),
            onClick: function () {
                showUpdate({
                    action: 'addnew'
                });
            }
        });
        /*修改事件*/
        $('#deviceuser-btnedit').linkbutton({
            disabled: !policy.checkpolicy({
                policyname: '修改设备使用人',
                policyno: 'deviceuser-allowedit',
                groupname:'设备使用人维护'
            }),
            onClick: function () {
                var row = $(container).datagrid('getSelected');
                if (!row) return false;
                showUpdate({
                    id: row.id,
                    action: 'edit'
                });
            }
        });
        /*删除*/
        $('#deviceuser-btnremove').linkbutton({
            disabled: !policy.checkpolicy({
                policyno: 'deviceuser-allowremove',
                policyname: '删除设备使用人',
                groupname:'设备使用人维护'
            }),
            onClick: function () {
                var row = $(container).datagrid('getSelected');
                if (!row) return false;
                $.messager.confirm('警告', '是否确认删除此设备使用人?', function (r) {
                    if (r) {
                        doUpdate({
                            action: 'remove',
                            id: row.id
                        })
                    }
                });
            }
        });
        /*导出*/
        $('#deviceuser-btnexport').linkbutton({
            disabled: !policy.checkpolicy({
                policyno: 'deviceuser-allowexport',
                policyname: '导出设备使用人清单',
                groupname:'设备使用人维护'
            }),
            onClick: function () {
                var fields = $(container).datagrid('getColumnFields');
                var columns = {};
                $.each(fields, function (index, value) {
                    var opt = $(container).datagrid('getColumnOption', value);
                    columns[opt.field] = opt.title;
                });
                Utility.saveData({
                    path: 'deviceuser/exportfile',
                    params: $.extend(getFilter(), {
                        columns:columns
                    }),
                    success: function (res) {
                        fileexport.showDialog({
                            rows: res.rows,
                            title: '导出设备使用人清单'
                        });
                    },
                    error: function (message) {
                        $.messager.alert('警告', message, 'warning');
                    }
                })
            }
        });
    }
    //显示带表格的下拉列表框
    showComboGrid = function (container) {
        var $container = $(container);
        $container.combogrid({
            idField: 'id',
            valueField: 'id',
            textField: 'username',
            url: Utility.serverUrl + 'deviceuser/getlist',
            mode: 'remote',
            method: 'post',
            queryParams: {
                companyid: (function () {
                    login = require('app/app.login');
                    return login.getLocalUser().companyid;
                }()),
                key: ''
            },
            panelMinWidth: 520,
            panelWidth: 'auto',
            panelMinHeight: 100,
            panelHeight: 'auto',
            panelMaxHeight:200,
            columns: [[
                {
                    field: 'username',
                    title: '使用人',
                    width: 80
                }, {
                    field: 'postname',
                    title: '岗位名称',
                    width: 120
                }, {
                    field: 'postpropertyname',
                    title: '岗位性质',
                    width: 140
                }, {
                    field: 'departmentname',
                    title: '科室名称',
                    width: 120
                }, {
                    field: 'workpropertyname',
                    title: '用工性质',
                    width: 80
                }
            ]]
        });
    }

    exports.showComboGrid = showComboGrid;
    exports.showUpdate = showUpdate;
    exports.init = init;
    exports.showUserInfo = showUserInfo;
});