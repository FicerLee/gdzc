define(function (require, exports, module) {
    var
        login,
        company,
        belong,
        postproperty,
        category,
        tag,
        fileexport,
        auditstatus,
        getFilter,
        getPlan,
        getOlds,
        showAddDevice,
        showUpdate,
        reloadGrid,
        doSubmit,
        showPlanInfo,
        showUpdate,
        showUnselectedOldDevice,
        init;
    login = require('app/app.login');
    company = require('app/app.company');
    belong = require('app/app.belong');
    category = require('app/app.devicecategory');
    auditstatus = require('app/app.auditstatus');
    postproperty = require('app/app.postproperty');
    fileexport = require('app/app.export');
    tag='#investplan';
    /*获取折旧清单
     * year,
     * belongid
     */
    getOlds = function (options) {
        return Utility.getData({
            path: 'device/getoldlist',
            data: {
                year: options.year,
                belongid: options.belongid
            }
        });
    }
    /*投资计划更新
     * year
     * belongid
     */
    showUpdate= function (options) {
        //获取所有的投资清单
        var data = getPlan({
            belongid: options.belongid,
            year: options.year
        });
        data.year = options.year;
        var tpl = require('tpl/investplan/investplan-edit.html');
        require('tpl/investplan/investplan-edit.css');
        var output = Mustache.render(tpl, data);
        var container = '#investplan-edit';
        var gridContainer = container + '-grid';
        $(output).dialog({
            title: options.year+'年投资计划明细',
            modal: true,
            width: 700,
            height: 300,
            onOpen: function () {
                $.parser.parse(container);
                $(gridContainer).datagrid({
                    columns: [[
                                {
                                    field: 'planproperty',
                                    title: '计划属性',
                                    width: 60,
                                    align: 'center',
                                    styler: function (value, row, index) {
                                        if (value == '新增') {
                                            return {
                                                class: 'text-addnew'
                                            };
                                        } else (value == '更新')
                                        {
                                            return {
                                                class: 'text-update'
                                            };
                                        }
                                    }
                                }, {
                                    field: 'statusname',
                                    title: '审核状态',
                                    align: 'right',
                                    width: 80,
                                    styler: function (value, row, index) {
                                        if (value == '临时新增')
                                            return {
                                                class: 'text-new'
                                            };
                                    }
                                }, {
                                    field: 'deviceno',
                                    title: '设备型号'
                                }, {
                                    field: 'companyname',
                                    title: '公司部门'
                                }, {
                                    field: 'departmentname',
                                    title: '科室岗位'
                                }, {
                                    field: 'postpropertyname',
                                    title: '岗位性质'
                                }, {
                                    field: 'categoryname',
                                    title: '设备类型'
                                }, {
                                    field: 'devicecount',
                                    title: '设备数量'
                                }, {
                                    field: 'memo',
                                    title: '备注说明',
                                }, {
                                    field: 'createddate',
                                    title: '创建时间',
                                    formatter: function (value, row, index) {
                                        if (value)
                                            return Utility.formatDate(value);
                                    }
                                }, {
                                    field: 'submitdate',
                                    title: '提交时间',
                                    formatter: function (value, row, index) {
                                        if (value)
                                            return Utility.formatDate(value);
                                    }
                                }, {
                                    field: 'completeddate',
                                    title: '审核时间',
                                    formatter: function (value, row, index) {
                                        if (value)
                                            return Utility.formatDate(value);
                                    }
                                }]],

                    rownumbers: true,
                    singleSelect: true,
                    border: true,
                    fit: true,
                    toolbar: [
                        {
                            iconCls: 'icon-newadd',
                            text: '新增折旧',
                            handler: function () {
                                /*获取已选择的折旧清单*/
                                var selected = $(gridContainer).datagrid('getRows');
                                selected = Enumerable.From(selected).Where('$.deviceid').Select('$.deviceid').ToArray();
                                /*获取所有的折旧设备*/
                                var totalOlds = getOlds({
                                    year: options.year,
                                    belongid: options.belongid
                                });
                                /*得到剩余的折旧设备*/
                                var remainOlds = jQuery.extend({}, totalOlds);
                                for (var i = 0; i < selected.length; i++) {
                                    var selectedid = selected[i];
                                    var s = Enumerable.From(totalOlds.rows).Where('$.id=='+selectedid).ToArray();
                                    if (s.length == 1) {
                                        s = s[0];
                                        var pos = jQuery.inArray(s, remainOlds.rows);
                                        if (pos > -1) {
                                            remainOlds.rows.splice(pos, 1);
                                            remainOlds.total -= 1;
                                        }
                                    }
                                }
                                /*选择折旧设备*/
                                showUnselectedOldDevice(remainOlds, function (selectedRowOlds) {
                                    for (var i = 0; i < selectedRowOlds.length; i++) {
                                        var row = selectedRowOlds[i];
                                        row.planproperty = '更新';
                                        row.statusname = '临时新增';
                                        row.deviceid = row.id;
                                        row.id = null;
                                        row.devicecount = 1;
                                        $(gridContainer).datagrid('insertRow', {
                                            index: 0,
                                            row: row
                                        });
                                        /*将选择的设备从未选择的设备中删除*/
                                        var pos = jQuery.inArray(row, remainOlds);
                                        if (pos > -1) {
                                            remainOlds.rows.splice(pos, 1);
                                            remainOlds.total -= 1;
                                        }
                                    }
                                });
                            }
                        }, {
                            iconCls: 'icon-newremove',
                            text: '删除折旧',
                            handler: function () {
                                var row = $(gridContainer).datagrid('getSelected');
                                try {
                                    if (!row)
                                        throw new Error('你还未选择需要删除的行');
                                    if (row.planproperty != '更新')
                                        throw new Error('你选择的并非折旧设备');
                                    if (row.statusname != '待提交'
                                        && row.statusname != '临时新增'
                                        && row.statusname != '审核退回')
                                        throw new Error('你选择的设备当前已提交审核');
                                } catch (ex) {
                                    $.messager.alert('错误', ex.message, 'error');
                                    return false;
                                }
                                /*删除折旧清单*/
                                var selectedIndex = $(gridContainer).datagrid('getRowIndex', row);
                                $(gridContainer).datagrid('deleteRow', selectedIndex);
                            }
                        }, {
                            iconCls: 'icon-newadd',
                            text: '新增设备',
                            handler: function () {
                                showAddDevice({
                                    action: 'addnew'
                                }, function (data) {
                                    console.log(data);
                                    data.planproperty = '新增';
                                    data.statusname = '临时新增';
                                    //更新到数据表中
                                    $(gridContainer).datagrid('insertRow', {
                                        index: 0,
                                        row: data
                                    });
                                });
                            }
                        }, {
                            iconCls: 'icon-newremove',
                            text: '删除设备',
                            handler: function () {
                                var row = $(gridContainer).datagrid('getSelected');
                                try {
                                    if (!row)
                                        throw new Error('你还未选择任何需要删除的设备');
                                    if (row.planproperty != '新增')
                                        throw new Error('你选择的并非新增设备');
                                    if (row.statusname != '临时新增'
                                        && row.statusname != '待提交'
                                        && row.statusname != '审核退回')
                                        throw new Error('你选择的设备当前已提交');
                                } catch (ex) {
                                    $.messager.alert('警告', ex.message, 'warning');
                                    return false;
                                }
                                var rowindex = $(gridContainer).datagrid('getRowIndex', row);
                                $(gridContainer).datagrid('deleteRow', rowindex);
                            }
                        }
                    ]
                });
                /*加载数据*/
                $(gridContainer).datagrid('loadData', data);

            },
            onClose: function () {
                $(container).dialog('destroy', true);
            }
        });
        /*绑定修改投资计划事件*/
        /*保存但不提交*/
        $(container + '-btnpresubmit').on('click', function (e) {
            e.preventDefault();
            var rows = $(gridContainer).datagrid('getRows');
            var data = {
                saveasdraft:true,
                year: options.year,
                usercode: login.getLocalUser().usercode,
                belongid: options.belongid,
                values:rows
            };
            doSubmit(data);
        });
        /*直接提交*/
        $(container + '-btnsubmit').on('click', function (e) {
            e.preventDefault();
            var rows = $(gridContainer).datagrid('getRows');
            var data = {
                saveasdraft:false,
                year: options.year,
                usercode: login.getLocalUser().usercode,
                belongid: options.belongid,
                values: rows
            };
            doSubmit(data);
        });
        /*导出数据*/
        $(container + '-btnexport').on('click', function (e) {
            e.preventDefault();
        });
    }
    /*显示投资计划明细
     * action:'submit','view'
     * belongid:设备归属
     * year:投资年份
     */
    showPlanInfo = function (options) {
        var data = getPlan({
            year: options.year,
            belongid: options.belongid
        });
        data.enablesubmit = options.action == 'submit';
        data.year = options.year;
        var tpl = require('tpl/investplan/investplan-view.html');
        require('tpl/investplan/investplan-view.css');
        var output = Mustache.render(tpl, data);
        var viewContainer = '#investplan-view';
        var gridContainer = viewContainer + '-grid';
        $(output).dialog({
            width: 700,
            height: 300,
            title: '查看投资计划明细',
            onOpen: function () {
                $.parser.parse(viewContainer);
                /*显示更新计划明细*/
                $(gridContainer).datagrid({
                    columns: [[
                                {
                                    field: 'planproperty',
                                    title: '计划属性',
                                    width: 60,
                                    align: 'center',
                                    styler: function (value, row, index) {
                                        if (value == '新增') {
                                            return {
                                                class: 'text-addnew'
                                            };
                                        } else (value == '更新')
                                        {
                                            return {
                                                class: 'text-update'
                                            };
                                        }
                                    }
                                }, {
                                    field: 'statusname',
                                    title: '审核状态'
                                }, {
                                    field: 'companyname',
                                    title: '公司部门'
                                }, {
                                    field: 'departmentname',
                                    title: '科室岗位'
                                }, {
                                    field: 'postpropertyname',
                                    title: '岗位性质'
                                }, {
                                    field: 'categoryname',
                                    title: '设备类型'
                                }, {
                                    field: 'devicecount',
                                    title: '设备数量'
                                }, {
                                    field: 'memo',
                                    title: '备注说明',
                                }, {
                                    field: 'createddate',
                                    title: '创建时间',
                                    formatter: function (value, row, index) {
                                        if (value)
                                            return Utility.formatDate(value);
                                    }
                                }, {
                                    field: 'submitdate',
                                    title: '提交时间',
                                    formatter: function (value, row, index) {
                                        if (value)
                                            return Utility.formatDate(value);
                                    }
                                }, {
                                    field: 'completeddate',
                                    title: '审核时间',
                                    formatter: function (value, row, index) {
                                        if (value)
                                            return Utility.formatDate(value);
                                    }
                                }]],
                    fit: true,
                    idField: 'id',
                    rownumbers: true,
                    singleSelect: false,
                    border: true,
                    url: Utility.serverUrl + 'investplan/getlist',
                    onRowContextMenu: function (e, index, row) {
                        $container.datagrid('selectRow', index);
                        e.preventDefault();
                    },
                    rowStyler: function (index, row) {
                        if (row.statusname == '审核退回') {
                            return {
                                class: 'text-red text-del'
                            };
                        }
                    }
                });
            },
            onClose: function () {
                $(viewContainer).dialog('destroy', true);

            }
        })
    }
    /*获取投资计划明细
     * belongid,
     * year
     */
    getPlan = function (options) {
        var data = Utility.getData({
            path: 'investplan/getlist',
            data: options
        });
        return data;
    }
    /*选择未被选择的折旧清单*/
    showUnselectedOldDevice = function (data, callback) {
        var tpl = require('tpl/investplan/investplan-select.html');
        require('tpl/investplan/investplan-select.css');
        var selectionContainer = '#investplan-select';
        var selectionGridContainer = selectionContainer + '-grid';
        $(tpl).dialog({
            modal: true,
            title: '选择剩余的折旧设备清单',
            width: 600,
            height: 400,
            onOpen: function () {
                $.parser.parse(selectionContainer);
                $(selectionGridContainer).datagrid({
                    columns: [[
                    {
                        field: 'id',
                        checkbox: true
                    }, {
                        field: 'deviceno',
                        title: '设备型号'
                    }, {
                        field: 'assetno',
                        title: '资产编码'
                    }, {
                        field: 'categoryname',
                        title: '设备类别'
                    }, {
                        field: 'deviceusername',
                        title: '使用人'
                    }, {
                        field: 'postpropertyname',
                        title: '岗位性质'
                    }, {
                        field: 'workpropertyname',
                        title: '用工性质'
                    }]],
                    rownumbers: true,
                    fit: true,
                    idField: 'id',
                    border: false
                });
                //填充数据
                $(selectionGridContainer).datagrid('loadData', data);
            },
            onClose: function () {
                $(selectionContainer).dialog('destroy', true);
            },
            buttons: [
                        {
                            text: '选择勾选清单',
                            iconCls: 'icon-ok',
                            handler: function () {
                                var rows = $(selectionGridContainer).datagrid('getSelections');
                                if (rows.length <= 0) {
                                    $.messager.alert('警告', '你还没有选择任何设备', 'warning');
                                    return false;
                                }
                                $(selectionContainer).dialog('close');
                                if (callback)
                                    callback(rows);
                            }
                        }
            ]
        });
    }
    reloadGrid = function () {
        if ($('#investplan-grid'))
            $('#investplan-grid').datagrid('reload');
    }
    /*保存投资计划提交*/
    doSubmit = function (data) {
        Utility.saveData({
            path: 'investplan/submit',
            params: data,
            success: function (res) {
                $.messager.alert('成功', '该投资计划当前已经保存,尚未提交，如需提交，请在主界面提交', 'info');
                $('#investplan-edit').dialog('close');
                reloadGrid();
            },
            error: function (message) {
                $.messager.alert('错误', message, 'error');
            }
        });
    }
    getFilter = function () {
        return {
            key: $('#investplan-key').val(),
            year: $('#investplan-year').numberspinner('getValue') || new Date().getFullYear(),
            categoryid: $('#investplan-category').combotree('getValue') || null,
            belongid: $('#investplan-belong').combobox('getValue') || null,
            statusid: $('#investplan-auditstatus').combobox('getValue') || null,
        };
    }
    //显示新增设备
    showAddDevice = function (options,callback) {
        var tpl = require('tpl/investplan/investplan-form.html');
        require('tpl/investplan/investplan-form.css');
        var data = {};
        var output = Mustache.render(tpl, data);
        var formContainer = '#investplan-form';
        $(output).dialog({
            title: '新增设备数量',
            modal: true,
            width: 400,
            height: 200,
            onOpen: function () {
                $.parser.parse(formContainer);
                category.showComboTree('#investplan-form-category');
                company.showComboTree('#investplan-form-department');
                postproperty.showComboTree('#investplan-form-postproperty');
            },
            onClose: function () {
                $(formContainer).dialog('destroy', true);
            }
        });
        /*绑定事件*/
        $('#investplan-form-btnsave').on('click', function (e) {
            e.preventDefault();
            var data = {
                categoryid: $('#investplan-form-category').combotree('getValue') || null,
                categoryname: $('#investplan-form-category').combotree('getText') || null,
                departmentname: $('#investplan-form-department').combotree('getText') || null,
                departmentid: $('#investplan-form-department').combotree('getValue') || null,
                postpropertyid: $('#investplan-form-postproperty').combotree('getValue') || null,
                postpropertyname: $('#investplan-form-postproperty').combotree('getText') || null,
                devicecount: $('#investplan-form-devicecount').numberbox('getValue') || 0,
                companyid: login.getLocalUser().companyid,
                companyname:login.getLocalUser().companyname,
                memo: $('#investplan-form-memo').val()
            };
            try {
                if (!data.categoryid)
                    throw new Error('设备类型不能为空!');
                if (!data.departmentid)
                    throw new Error('使用部门不能为空!');
                if (!data.postpropertyid)
                    throw new Error('岗位性质不能为空!');
                if (data.devicecount <= 0)
                    throw new Error('设备数量不能为空!');
            } catch (e) {
                $.messager.alert('错误', e.message, 'error');
                return false;
            };
            if (callback)
                callback(data);
            //关闭对话框
            $('#investplan-form').dialog('close');
        });
    }

    //#region初始化
    init = function (container) {
        $('#investplan-year').numberspinner({
            min: 2007,
            max: 2020,
            value:new Date().getFullYear()+1
        })
        company.showComboTree('#investplan-company');
        belong.showCombo('#investplan-belong');
        category.showComboTree('#investplan-category');
        auditstatus.showCombo('#investplan-auditstatus');
        //设定默认的资产归属
        $('#investplan-belong').combobox('setValue', login.getLocalUser().companyid);
        var $container = $(container);
        $container.datagrid({
            columns: [[
            {
                field: 'planproperty',
                title: '计划属性',
                width: 60,
                align: 'center',
                styler: function (value, row, index) {
                    if (value == '新增') {
                        return {
                            class: 'text-addnew'
                        };
                    } else (value == '更新')
                    {
                        return {
                            class: 'text-update'
                        };
                    }
                }
            }, {
                field: 'statusname',
                title: '审核状态',
                width: 80,
                align: 'right',
                styler: function (value) {
                    return Utility.auditstatusStyle(value);
                }
            }, {
                field: 'companyname',
                title: '公司部门'
            }, {
                field: 'departmentname',
                title: '科室岗位'
            }, {
                field: 'postpropertyname',
                title: '岗位性质'
            }, {
                field: 'categoryname',
                title: '设备类型'
            }, {
                field: 'devicecount',
                title: '设备数量'
            }, {
                field: 'memo',
                title: '备注说明',
            }, {
                field: 'createddate',
                title: '创建时间',
                formatter: function (value, row, index) {
                    if (value)
                        return Utility.formatDate(value);
                }
            }, {
                field: 'submitdate',
                title: '提交时间',
                formatter: function (value, row, index) {
                    if (value)
                        return Utility.formatDate(value);
                }
            }, {
                field: 'completeddate',
                title: '审核时间',
                formatter: function (value, row, index) {
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
            toolbar: '#investplan-toolbar',
            url: Utility.serverUrl + 'investplan/getlist',
            onRowContextMenu: function (e, index, row) {
                $container.datagrid('selectRow', index);
                $('#investplan-grid-contextmenu').menu('show', {
                    left: e.pageX,
                    top: e.pageY,
                    onClick: function (item) {
                        if (item.name == 'investplan-showPlanInfo') {
                            showPlanInfo({
                                action: 'view',
                                belong: row.assetbelongid,
                                year: row.year
                            });
                        } else if (item.name == 'investplan-showSubmit') {
                            showPlanInfo({
                                action: 'submit',
                                belong: row.assetbelongid,
                                year: row.year
                            });
                        }
                    }
                });
                e.preventDefault();
            },
            queryParams: getFilter()
        });
        /*绑定事件*/
        //投资计划处理
        $('#investplan-btnedit').linkbutton({
            disabled: !login.getLocalUser().enablesubmitinvestplan,
            onClick: function () {
                var belongid = $('#investplan-belong').combobox('getValue') || null;
                var year = $('#investplan-year').numberspinner('getValue') || 0;
                try {
                    if (!belongid)
                        throw new Error('请先选择设备归属公司');
                    if (!year)
                        throw new Error('请先选择投资年份');
                } catch (err) {
                    $.messager.alert('警告', err.message, 'warning');
                    return false;
                }
                var options = {
                    year: year,
                    belongid: belongid
                };
                showUpdate({
                    year: year,
                    belongid: belongid
                });
            }
        });
        /*导出投资计划*/
        $('#investplan-btnexport').linkbutton({
            disabled: !login.getLocalUser().enablesubmitinvestplan,
            onClick: function () {
                var fields = $(tag + '-grid').datagrid('getColumnFields');
                var columns = {};
                $.each(fields, function (inde, value) {
                    var o = $(tag + '-grid').datagrid('getColumnOption', value);
                    columns[o.field] = o.title;
                });
                Utility.saveData({
                    path: 'investplan/exportfile',
                    params: {
                        columns:columns
                    },
                    success: function (res) {
                        fileexport.showDialog({
                            title: '年度投资计划提交明细',
                            rows: res.rows
                        });
                    }
                })
            }
        });
        /*提交投资计划*/
        $('#investplan-btnsearch').on('click', function (e) {
            e.preventDefault();
            reloadGrid();
        });
        /*检查菜单权限*/

    }
    //#endregion
    exports.init = init;
});