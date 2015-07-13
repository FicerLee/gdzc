define(function (require, exports, module) {
    var
        $container,
        deviceuser,
        showAuditInfo,
        showUserInfoByAuditId,
        reloadGrid,
        doPass,
        doReject,
        doRemove,
        doReSubmit,
        getFilter,
        getDataById,
        closeForm,
        login,
        company,
        workproperty,
        postproperty,
        auditstatus,
        policy,
        fileexport,
        init;
    login = require('app/app.login');
    policy = require('app/app.policy');
    company = require('app/app.company');
    workproperty = require('app/app.workproperty');
    postproperty = require('app/app.postproperty');
    auditstatus = require('app/app.auditstatus');
    deviceuser = require('app/app.deviceuser');
    fileexport = require('app/app.export');
    closeForm = function () {
        $('#auditdeviceuser-form').dialog('close');
    }
    reloadGrid = function () {
        if ($container)
            $container.datagrid('load', getFilter());
    }
    getFilter = function () {
        return {
            key: $('#auditnewdeviceuser-key').val(),
            workpropertyid: $('#auditnewdeviceuser-workproperty').combobox('getValue') || null,
            postpropertyid: $('#auditnewdeviceuser-postproperty').combotree('getValue') || null,
            statusid: $('#auditnewdeviceuser-auditstatus').combobox('getValue') || null
        };
    };
    getDataById = function (id) {
        var data = Utility.getData({
            path: 'auditdeviceuser/get',
            data: {
                id: id
            }
        });
        return !data ? null : data.rows;
    }
    showAuditInfo = function (id) {
        var data = getDataById(id);
        if (!data) return false;
        var _data = {
            company: {
                oldvalue: data.oldvalues.companyname,
                newvalue: data.newvalues.compnayname
            },
            username: {
                oldvalue: data.oldvalues.username,
                newvalue: data.newvalues.username
            },
            postname: {
                oldvalue: data.oldvalues.postname,
                newvalue:data.newvalues.postname
            },
            postpropertyname:{
                oldvalue:data.oldvalues.postpropertyname,
                newvalue:data.newvalues.postpropertyname
            },
            departmentname: {
                oldvalue: data.oldvalues.departmentname,
                newvalue:data.newvalues.departmentname
            },
            workpropertyname: {
                oldvalue: data.oldvalues.workpropertyname,
                newvalue:data.newvalues.workpropertyname
            },
            createddate: Utility.formatDate(data.createddate),
            creatorname: data.creatorname,
            statusname:data.statusname
        }
        require.async([
            'tpl/auditdeviceuser/auditdeviceuser-form.html',
            'tpl/auditdeviceuser/auditdeviceuser-form.css'
        ], function (tpl, css) {
            var output = Mustache.render(tpl, _data);
            var formContainer = '#auditdeviceuser-form';
            $(output).dialog({
                title: '设备使用人审核明细',
                modal: true,
                width: 600,
                height: 300,
                onOpen: function () {
                    $.parser.parse(formContainer);
                },
                onClose: function () {
                    $(formContainer).dialog('destroy', true);
                }
            })
            var handlerdata = {
                id: data.id,
                action: data.action,
                completerid: login.getLocalUser().usercode
            }
            /*绑定事件*/
            $('#auditdeviceuser-form-btnsubmit').on('click', function (e) {
                e.preventDefault();
                doPass(handlerdata);
            });
            $('#auditdeviceuser-form-btnreject').on('click', function (e) {
                e.preventDefault();
                doReject(handlerdata);
            });
            $('#auditdeviceuser-form-btnremove').on('click', function (e) {
                e.preventDefault();
                doRemove(handlerdata);
            });
            $('#auditdeviceuser-form-btnresubmit').on('click', function (e) {
                e.preventDefault();
                doReSubmit(handlerdata);
            });
        });
    }
    showUserInfoByAuditId = function (auditid) {
        var data = getDataById(auditid);
        if (!data || data.deviceuserid) {
            $.messager.alert('错误', '该审核信息尚未包含该员工信息', 'error');
            return false;
        }
        deviceuser.showUserInfo(data.deviceuserid);
    }
    /*审核通过
     * options
     *  id:'待审核明细Id
     *  completerid:审核人id
     */
    doPass = function (options) {
        Utility.saveData({
            path: 'auditdeviceuser/pass',
            params:options,
            success: function (res) {
                $.messager.alert('成功', '该设备使用人信息已通过', 'info');
                closeForm();
                reloadGrid();
            },
            error: function (message) {
                $.messager.alert('失败', message, 'error');
            }
        })
    }
    /*审核退回*/
    doReject = function (options) {
        Utility.saveData({
            path: 'auditdeviceuser/reject',
            params:options,
            success: function (res) {
                $.messager.alert('成功', '该设备使用人信息已审核退回', 'info');
                closeForm();
                reloadGrid();
            },
            error: function (message) {
                $.messager.alert('失败', message, 'error');
            }
        })
    }
    /*审核删除
     * options:
     *  id:审核明细Id
     *  completerid:审核人id
     */
    doRemove = function (options) {
        Utility.saveData({
            path: 'auditdeviceuser/remove',
            params:options,
            success: function (res) {
                $.messager.alert('成功', '该设备使用人审核信息已删除', 'info');
                closeForm();
                reloadGrid();
            },
            error: function (message) {
                $.messager.alert('失败', message, 'error');
            }
        })
    }
    /*再次提交审核
     * options:
     *  id:审核id，
     *  creatorid:申请人id
     */
    doReSubmit = function (options) {
        Utility.saveData({
            path: 'auditdeviceuser/resubmit',
            params:options,
            success: function (res) {
                $.messager.alert('成功', '该设备使用人信息已重新提交', 'info');
                closeForm();
                reloadGrid();
            },
            error: function (message) {
                $.messager.alert('失败', message, 'error');
            }
        })
    }
    init = function (container) {
        $container = $(container);
        //显示单位信息
        company.showComboTree('#auditnewdeviceuser-company');
        //显示用工性质
        workproperty.showCombo('#auditnewdeviceuser-workproperty');
        //显示岗位性质
        postproperty.showComboTree('#auditnewdeviceuser-postproperty');
        //显示审核状态
        auditstatus.showCombo('#auditnewdeviceuser-auditstatus');
        //显示主数据信息
        $container.datagrid({
            columns: [
                [{
                    field: 'action',
                    title: '审核类型',
                    width: 60,
                    align:'right',
                    rowspan: 2,
                    formatter: function (value, row, index) {
                        if (value == 'addnew')
                            return '新增';
                        else if (value == 'edit')
                            return '修改';
                        else if (value == 'remove')
                            return '删除';
                    }
                }, {
                    field: 'statusname',
                    title: '审核状态',
                    width: 80,
                    align:'right',
                    styler:function(value,row,index){
                        return Utility.auditstatusStyle(value);
                    },
                    rowspan: 2
                }, {
                    field: 'username',
                    title: '使用人',
                    width: 80,
                    sortable: true,
                    rowspan: 2
                }, {
                    title: '公司部门',
                    width: 260,
                    sortable: true,
                    colspan: 2
                }, {
                    title: '岗位信息',
                    width: 280,
                    sortable: true,
                    colspan: 2
                }, {
                    field: 'workpropertyname',
                    title: '用工性质',
                    width: 60,
                    sortable: true,
                    rowspan: 2
                }, {
                    field: 'createddate',
                    title: '审核提交时间',
                    width: 130,
                    rowspan: 2,
                    formatter: function (value, row, index) {
                        if (value)
                            return Utility.formatDate(value);
                    }
                }, {
                    field: 'completeddate',
                    title: '审核完成时间',
                    width: 130,
                    rowspan: 2,
                    formatter: function (value, row, index) {
                        if (value)
                            return Utility.formatDate(value);
                    }
                }],
                [{
                    field: 'companyname',
                    title: '公司名称',
                    width: 180,
                    sortable:true
                }, {
                    field: 'departmentname',
                    title: '部门名称',
                    width: 160,
                    sortable:true
                }, {
                    field: 'postname',
                    title: '岗位名称',
                    width: 140,
                    sortable: true
                }, {
                    field: 'postpropertyname',
                    title: '岗位性质',
                    width: 100,
                    sortable: true
                }]
            ],
            idField: 'id',
            rownumbers: true,
            singleSelect:true,
            fitColumns: false,
            border: false,
            pagination: true,
            toolbar: '#auditnewdeviceuser-toolbar',
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
                $('#auditnewdeviceuser-grid-contextmenu').menu('show', {
                    left: e.pageX,
                    top: e.pageY,
                    onClick: function (item) {
                        switch (item.name) {
                            case 'auditnewdeviceuser-showAuditInfo':
                                showAuditInfo({
                                    id:rowData.id
                                });
                                break;
                            case 'auditnewdeviceuser-doPass':
                                doPass({
                                    id: rowData.id,
                                    completerid:login.getLocalUser().usercode
                                });
                                break;
                            case 'auditnewdeviceuser-doReject':
                                doReject({
                                    id: rowData.id,
                                    completerid: login.getLocalUser().usercode
                                });
                                break;
                            case 'auditnewdeviceuser-doRemove':
                                doRemove({
                                    id: rowData.id,
                                    completerid: login.getLocalUser().usercode
                                });
                                break;
                            case 'auditnewdeviceuser-doReSubmit':
                                doReSubmit({
                                    id: rowData.id,
                                    creatorid: login.getLocalUser().usercode
                                });
                                break;
                            default:
                                break;
                        }
                    }
                });
                e.preventDefault();
            },
            url: Utility.serverUrl + 'auditdeviceuser/getlist',
            queryParams: getFilter()
        });
        /*绑定事件*/
        $('#auditnewdeviceuser-btnsearch').on('click', function (e) {
            e.preventDefault();
            reloadGrid();
        });
        /*导出数据*/
        $('#auditnewdeviceuser-btnexport').linkbutton({
            disabled: !policy.checkpolicy({
                policyno: 'auditnewdeviceuser-allowexport',
                policyname: '导出设备使用人审核维护记录',
                groupname: '设备使用人审核'
            }),
            onClick: function () {
                var fields = $(container).datagrid('getColumnFields');
                var columns = {};
                $.each(fields, function (index, value) {
                    var options = $(container).datagrid('getColumnOption', value);
                    columns[options.field] = options.title;
                });
                Utility.saveData({
                    path: 'auditdeviceuser/exportfile',
                    params: $.extend(getFilter(), {
                        columns: columns
                    }),
                    success: function (res) {
                        fileexport.showDialog({
                            title: '设备使用人审核明细',
                            rows: res.rows
                        });
                    },
                    error: function (message) {
                        $.messager.alert('警告', message, 'warning');
                    }
                });
            }
        });
        var menu = '#auditnewdeviceuser-grid-contextmenu';
        if (!policy.checkpolicy({
            policyno: 'auditnewdeviceuser-allowaudit',
            policyname: '允许审核设备使用人信息',
            groupname: '设备使用人审核'
        })) {
            var texts = [
                '审核通过',
                '审核退回',
                '审核删除'
            ];
            for (var i = 0; i < texts.length; i++) {
                var item = $(menu).menu('findItem', texts[i]);
                if (item && item.target)
                    $(menu).menu('disableItem', item.target);
            }
        };
        if(!policy.checkpolicy({
            policyno:'deviceuser-allowadd',
                policyname:'新增设备使用人',
            groupname:'设备使用人维护'
        })) {
            var item = $(menu).menu('findItem', '再次提交审核');
            if (item && item.target)
                $(menu).menu('disableItem', item.target);
        }
    }
    exports.init = init;
});
