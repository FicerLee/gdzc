define(function (require, exports, module) {
    var
        login,
        belong,
        category,
        devicetype,
        state,
        getFilter,
        reloadGrid,
        showSelectTypeDialog,
        device,
        getDataById,
        doSelectDeviceType,
        doExport,
        policy,
        init;
    login = require('app/app.login');
    belong = require('app/app.belong');
    state = require('app/app.auditstatus');
    device = require('app/app.device');
    category = require('app/app.devicecategory');
    devicetype = require('app/app.devicetype');
    policy = require('app/app.policy');
    /*根据审核明细获取审核信息*/
    getDataById = function (id) {
        var data = Utility.getData({
            path: 'investplan/get',
            data: {
                id: id
            }
        });
        return !data ? null : data.rows;
    }
    reloadGrid = function () {
        if ($('#auditinvestplan-grid'))
            $('#auditinvestplan-grid').datagrid('reload', getFilter());
    }
    getFilter = function () {
        return {
            year: $('#auditinvestplan-year').numberspinner('getValue'),
            key: $('#auditinvestplan-key').val(),
            belongid: $('#auditinvestplan-belong').combobox('getValue'),
            stateid: $('#auditinvestplan-state').combobox('getValue'),
            categoryid: $('#auditinvestplan-category').combotree('getValue')
        };
    }
    init = function (container) {
        $('#auditinvestplan-year').numberspinner({
            min: 2007,
            max: 2020,
            value: new Date().getFullYear()
        });
        belong.showCombo('#auditinvestplan-belong');
        category.showComboTree('#auditinvestplan-category');
        state.showViewAuditCombo('#auditinvestplan-state');
        /*加入菜单信息*/
        var typeItem = $('#auditinvestplan-grid-contextmenu').menu('findItem', '设备选型');
        if (typeItem) {
            /*获取选型类型*/
            var types = devicetype.getTreeData();
            for (var i = 0; i < types.length; i++) {
                var type = types[i];
                var option = {
                    parent: typeItem.target,
                    text: type.text
                };
                //加入子菜单
                $('#auditinvestplan-grid-contextmenu').menu('appendItem', option);
                var categoryItem = $('#auditinvestplan-grid-contextmenu').menu('findItem', type.text);
                var children = type.children;
                for (var j = 0; j < children.length; j++) {
                    var child = children[j];
                    $('#auditinvestplan-grid-contextmenu').menu('appendItem', {
                        text: child.text,
                        parent: categoryItem.target,
                        id: child.id,
                        name: 'auditinvestplan-type'
                    });
                }
            }

        }

        var $container = $(container);
        $container.datagrid({
            columns: [[{
                field: 'planproperty',
                title: '计划属性',
                width: 60,
                align: 'right',
                styler: function (value, row, index) {
                    if (value == '新增') {
                        return {
                            class: 'text-new'
                        };
                    }
                    if (value == '更新')
                        return {
                            class: 'text-update'
                        }
                }
            }, {
                field: 'statusname',
                title: '审核状态'
            }, {
                field: 'submitdate',
                title: '提交审核日期',
                formatter: function (value) {
                    if (value)
                        return Utility.formatDate(value);
                }
            }, {
                field: 'companyname',
                title: '公司部门'
            }, {
                field: 'departmentname',
                title: '科室岗位'
            }, {
                field: 'postpropertyname',
                title: '岗位性质',
            }, {
                field: 'usename',
                title: '使用人'
            }, {
                field: 'categoryname',
                title: '设备类型'
            }, {
                field: 'deviceno',
                title: '设备型号'
            }, {
                field: 'devicetypename',
                title: '设备选型'
            }, {
                field: 'devicecount',
                title: '设备数量'
            }, {
                field: 'completeddate',
                title: '审核时间',
                formatter: function (value) {
                    if (value)
                        return Utility.formatDate(value);
                }
            }]],
            fit: true,
            idField: 'id',
            rownumbers: true,
            singleSelect: true,
            border: false,
            pagination: true,
            toolbar: '#auditinvestplan-toolbar',
            url: Utility.serverUrl + 'investplan/getlist',
            onRowContextMenu: function (e, index, row) {
                $(this).datagrid('selectRow', index);
                $('#auditinvestplan-grid-contextmenu').menu('show', {
                    left: e.pageX,
                    top: e.pageY,
                    onClick: function (item) {
                        if (item.name == 'auditinvestplan-showDeviceInfo') {
                            //查看设备信息
                            console.log(row);
                            if (!row.deviceid) return false;
                            device.showDeviceInfo(row.deviceid);
                        } else if (item.name == 'auditinvestplan-selectTypeOption') {
                            //选择高级选型
                            showSelectTypeDialog({
                                id: row.id
                            });
                        } else if (item.name == 'auditinvestplan-type') {
                            var typeid = item.id;
                            doSelectDeviceType({
                                id: row.id,
                                devicetypeid: typeid,
                                action: 'pass',
                                completerid: login.getLocalUser().usercode
                            });
                        } else if (item.name == 'auditinvestplan-doAuditdelete') {
                            //审核删除
                            $.messager.confirm('警告', '是否确认删除此投资计划信息?', function (r) {
                                if (r) {
                                    Utility.saveData({
                                        path: 'investplan/remove',
                                        params: {
                                            id: row.id,
                                            completerid: login.getLocalUser().usercode
                                        },
                                        success: function (res) {
                                            $.messager.alert('成功', res.mesage, 'info');
                                            reloadGrid();
                                        },
                                        error: function (message) {
                                            $.mesager.alert('失败', message, 'warning');
                                        }
                                    });
                                }
                            })

                        } else if (item.name == 'auditinvestplan-doAuditreject') {
                            //审核退回
                            doSelectDeviceType({
                                id: row.id,
                                action: 'reject',
                                completerid: login.getLocalUser().usercode
                            });
                        }
                    }
                });
                e.preventDefault();
            },
            rowStyler: function (index, row) {
                if (row.statusname === '审核退回')
                    return {
                        class: 'text-del text-red'
                    };
            },
            queryParams: getFilter()
        });
        /*事件绑定*/
        $('#auditinvestplan-btnsearch').on('click', function (e) {
            e.preventDefault();
            reloadGrid();
        });
        $('#auditinvestplan-btnexport').linkbutton({
            disabled: !policy.checkpolicy({
                policyno: 'auditinvestplan-allowexport',
                policyname: '导出年度投资计划审核明细',
                groupname: '审核年度投资计划'
            }),
            onClick: function () {
                doExport(getFilter());
            }
        });
        /*菜单权限*/
        var menu = '#auditinvestplan-grid-contextmenu';
        if(!policy.checkpolicy({
            policyno: 'auditinvestplan-allowaudit',
                policyname: '允许年度投资计划审核',
            groupname:'审核年度投资计划'
        })) {
            ['设备选型', '高级选型...', '审核删除', '审核退回'].forEach(function (value, index) {
                var item = $(menu).menu('findItem', value);
                if (item && item.target)
                    $(menu).menu('disableItem', item.target);
            });
        }
    }
    /*打开高级选型对话框
     * options:
     *   id:投资计划审核明细Id
     */
    showSelectTypeDialog = function (options) {
        var tpl = require('tpl/auditinvestplan/auditinvestplan-selecttype.html');
        var data = getDataById(options.id);
        data = data || {};
        var output = Mustache.render(tpl, data);
        var selectContainer = '#auditinvestplan-selecttype';
        $(output).dialog({
            modal: true,
            title: '审核',
            width: 500,
            height: 200,
            onOpen: function () {
                $.parser.parse(selectContainer);
                devicetype.showComboTree('#auditinvestplan-selecttype-type');
                state.showDoAuditCombo('#auditinvestplan-selecttype-state');
            },
            onClose: function () {
                $(selectContainer).dialog('destroy', true);
            }
        });
        /*保存提交*/
        $('#auditinvestplan-selecttype-btnsave').on('click', function (e) {
            e.preventDefault();
            var auditstatustext = $('#auditinvestplan-selecttype-state').combobox('getText') || null;
            var action;
            if (auditstatustext == '审核通过')
                action = 'pass';
            else if (auditstatustext == '审核退回')
                action = 'reject';
            var data = {
                id: options.id,
                action: action,
                devicetypeid: $('#auditinvestplan-selecttype-type').combotree('getValue') || null,
                auditcontent: $('#auditinvestplan-selecttype-content').val(),
                auditmemo: $('#auditinvestplan-selecttype-memo').val()
            };

            try {
                if (!data.action)
                    throw new Error('审核结论不能为空!');
                if (!data.devicetypeid)
                    throw new Error('设备选型不能为空!');
            } catch (ex) {
                $.messager.alert('错误', ex.message, 'warning');
                return false;
            }

            doSelectDeviceType(data);
        });
    }
    /*保存设备选型
     * options:
     *   action:审核状态:pass,reject,
     *   devicetypeid:设备选型Id
     *   auditcontent:审核内容,
     *   auditmemo:审核备注
     *   completerid:审核人,
     *   id:审核清单明细
     */
    doSelectDeviceType = function (options) {
        var opt = {
            completerid: login.getLocalUser().usercode,
        };
        options = jQuery.extend(opt, options);
        var path = {};
        if (options.action == 'pass')
            path = 'investplan/pass';
        if (options.action == 'reject')
            path = 'investplan/reject';
        Utility.saveData({
            path: path,
            params: opt,
            success: function (res) {
                $.messager.alert('成功', res.message, 'info');
                reloadGrid();
            },
            error: function (message) {
                $.messager.alert('错误', message, 'error');
            }
        });
    }
    /*导出数据
     * options:
     *   year,
     *   belongid,
     *   key,
     *   categoryid,
     *   statusid
     */
    doExport = function (options) {
        data = {};
        var tpl = require('tpl/auditinvestplan/auditinvestplan-export.html');
        var container = '#auditinvestplan-export';
        var fields = $('#auditinvestplan-grid').datagrid('getColumnFields');
        for (var i = 0; i < fields.length; i++) {
            var field = fields[i];
            var option = $('#auditinvestplan-grid').datagrid('getColumnOption', field);
            var f = option.field;
            var t = option.title;
            if (f == 'id')
                t = '内部编号';
            data[f] = t;
        };
        Utility.saveData({
            path: 'investplan/exportfile',
            params: jQuery.extend({
                columns: data
            }, options),
            success: function (res) {
                var output = Mustache.render(tpl, res);
                $(output).dialog({
                    title: '下载导出数据',
                    modal: true,
                    width: 500,
                    height: 200,
                    onOpen: function () {
                        $.parser.parse('#auditinvestplan-export');
                    },
                    onClose: function () {
                        $('#auditinvestplan-export').dialog('destroy', true);
                    }
                });
            },
            error: function (message) {
                $.messager.alert('错误', message, 'warning');
            }
        });

    }
    exports.init = init;
});