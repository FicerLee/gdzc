define(function (require, exports, module) {
    var
        belong,
        state,
        devicetype,
        login,
        reloadGrid,
        getFilter,
        doUpdate,
        getDataById,
        showAdvancedSelectionType,
        policy,
        init;
    login = require('app/app.login');
    policy = require('app/app.policy');
    belong = require('app/app.belong');
    state = require('app/app.auditstatus');
    devicetype = require('app/app.devicetype');
    /*初始化*/
    init = function (container) {
        belong.showCombo('#auditpurchaseplan-belong');
        state.showViewAuditCombo('#auditpurchaseplan-state');
        $('#auditpurchaseplan-year').numberspinner({
            value: new Date().getFullYear()
        });
        $(container).datagrid({
            columns: [[
                {
                    field: 'planproperty',
                    title: '计划属性',
                    width: 60,
                    align: 'right',
                    styler: function (value, row, index) {
                        if (value == '新增')
                            return {
                                class: 'text-new'
                            };
                        else if (value == '更新')
                            return {
                                class: 'text-update'
                            };
                    }
                }, {
                    field: 'createddate',
                    title: '提交时间',
                    formatter: function (value) {
                        if (value)
                            return Utility.formatDate(value);
                    }
                }, {
                    field: 'statusname',
                    title:'审核状态'
                },{
                    field: 'companyname',
                    title: '所属公司'
                }, {
                    field: 'departmentname',
                    title:'部门科室'
                }, {
                    field: 'categoryname',
                    title:'设备类型'
                },{
                    field: 'deviceno',
                    title: '设备型号'
                }, {
                    field: 'devicetypename',
                    title:'设备选型'
                },{
                    field: 'postpropertyname',
                    title: '岗位性质'
                }, {
                    field: 'devicecount',
                    title: '设备数量'
                }, {
                    field: 'completeddate',
                    title: '审核时间'
                }
            ]],
            rownumbers: true,
            fit: true,
            pagination: true,
            singleSelect: true,
            idField:'id',
            toolbar: '#auditpurchaseplan-toolbar',
            queryParams: getFilter(),
            url: Utility.serverUrl + 'investplan2/getlist',
            onRowContextMenu: function (e, index, row) {
                e.preventDefault();
                $(container).datagrid('selectRow', index);
                /*显示菜单*/
                $('#auditpurchaseplan-contextmenu').menu('show', {
                    left: e.pageX,
                    top: e.pageY,
                    onClick: function (item) {
                        if (item.name == 'auditpurchaseplan-doPass') {
                            //审核通过
                            doUpdate({
                                path: 'investplan2/pass',
                                id: row.id,
                                devicetypeid:row.devicetypeid,
                                completerid:login.getLocalUser().usercode
                            });
                        } else if (item.name == 'auditpurchaseplan-doReject') {
                            //审核退回
                            doUpdate({
                                path: 'investplan2/reject',
                                id: row.id,
                                completerid: login.getLocalUser().usercode
                            });
                        } else if (item.name == 'auditpurchaseplan-doRemove') {
                            //审核删除
                            doUpdate({
                                path: 'investplan2/remove',
                                id: row.id
                            });
                        } else if (item.name == 'auditpurchaseplan-doType') {
                            //高级选型,弹出高级选型菜单
                            showAdvancedSelectionType({
                                id: row.id
                            }, function (data) {
                                jQuery.extend(data, {
                                    path: 'investplan2/pass'
                                });
                                doUpdate(data);
                            });
                        }
                    }
                });
            }
        });
        /*绑定事件*/
        $('#auditpurchaseplan-btnsearch').on('click', function (e) {
            e.preventDefault();
            reloadGrid();
        });
        /*导出*/
        $('#auditpurchaseplan-btnexport').linkbutton({
            disabled: !policy.checkpolicy({
                policyno: 'auditpurchaseplan-allowexport',
                policyname: '导出年度采购计划审核明细',
                groupname: '审核年度采购计划'
            }),
            onClick: function () {

            }
        });
        /*审核权限*/
        var menu = '#auditpurchaseplan-contextmenu';
        if(!policy.checkpolicy({
            policyno:'auditpurchaseplan-allowaudit',
                policyname:'允许审核年度采购计划',
            groupname:'审核年度采购计划'
        })) {
            ['审核通过', '审核退回', '审核删除', '设备高级选型...'].forEach(function (value, index) {
                var item = $(menu).menu('findItem', value);
                if (item && item.target)
                    $(menu).menu('disableItem', item.target);
            });
        }
    }
    /*刷新数据*/
    reloadGrid = function () {
        if ($('#auditpurchaseplan-grid'))
            $('#auditpurchaseplan-grid').datagrid('reload', getFilter());
    }
    /*筛选数据*/
    getFilter = function () {
        return {
            year: $('#auditpurchaseplan-year').numberspinner('getValue'),
            belongid: $('#auditpurchaseplan-belong').combobox('getValue') || login.getLocalUser().companyid,
            statusid: $('#auditpurchaseplan-state').combobox('getValue')
        };
    }
    /*更新数据到服务器
     * options:
     *   path:提交路径,
     *   id:明细id
     *   completerid
     *   devicetypeid
     *   memo
     *   auditcontent
     */
    doUpdate = function (options) {
        Utility.saveData({
            path: options.path,
            params: options,
            success: function (res) {
                $.messager.alert('成功', res.message, 'info');
                reloadGrid();
            },
            error: function (message) {
                $.messager.alert('错误', message, 'warning');
            }
        });
    }
    /*高级选型
     * options:
     *   id
     */
    showAdvancedSelectionType = function (options, callback) {
        try {
            var data = getDataById(options.id);
            if (!data)
                throw new Error('年度采购计划明细并不存在!');
            jQuery.extend(options, data);
            var tpl = require('tpl/auditpurchaseplan/type.html');
            var output = Mustache.render(tpl, options);
            var container = '#auditpurchaseplan-type';
            $(output).dialog({
                title: '高级选型',
                modal: true,
                width: 500,
                height: 200,
                onOpen: function () {
                    $.parser.parse(container);
                    devicetype.showComboTree(container + '-devicetype');
                },
                onClose: function () {
                    $(container).dialog('destroy', true);
                }
            });
            $(container + '-btnsave').on('click', function (e) {
                e.preventDefault();
                var data = {
                    id: options.id,
                    devicetypeid: $(container + '-devicetype').combotree('getValue'),
                    memo: $(container + '-memo').val(),
                    auditcontent: $(container + '-auditcontent').val()
                };
                jQuery.extend(data, {
                    completerid: login.getLocalUser().usercode
                });
                $(container).dialog('close');
                if (callback)
                    callback(data);
            });

        } catch (ex) {
            $.messager.alert('错误', ex.message, 'warning');
            return false;
        }
    }
    /*根据id获取二级审核明细*/
    getDataById = function (id) {
        var data = Utility.getData({
            path: 'investplan2/get',
            data: {
                id: id
            }
        });
        return !data ? null : data.rows;
    }
    exports.init = init;
});