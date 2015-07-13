define(function (require, exports, module) {
    var
        login,
        state,
        belong,
        getFilter,
        reloadGrid,
        showSelection2Pass,
        showAddOutPlanDevice,
        showModifyDeviceCount,
        policy,
        init;
    login = require('app/app.login');
    policy = require('app/app.policy');
    state = require('app/app.auditstatus');
    belong = require('app/app.belong');
    /*初始化*/
    init = function (container) {
        /**/
        $('#prepurchase-year').numberspinner({
            value: new Date().getFullYear(),
            required: true
        });
        state.showCombo('#prepurchase-state');
        belong.showCombo('#prepurchase-belong');
        $(container).datagrid({
            columns: [[
                {
                    field: 'planproperty',
                    title: '投资计划属性',
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
                },
                {
                    field: 'companyname',
                    title: '所属公司'
                }, {
                    field: 'departmentname',
                    title: '科室部门'
                }, {
                    field: 'deviceusername',
                    title: '设备使用人'
                }, {
                    field: 'postpropertyname',
                    title: '岗位性质'
                }, {
                    field: 'categoryname',
                    title: '设备类别'
                }, {
                    field: 'deviceno',
                    title: '设备型号'
                }, {
                    field: 'useaddress',
                    title: '使用地点'
                }, {
                    field: 'devicecount',
                    title: '设备数量'
                }
            ]],
            rownumbers: true,
            fit: true,
            idField:'id',
            border: false,
            pagination: true,
            pageList: Utility.pageList,
            pageSize: Utility.pageList[0],
            queryParams: getFilter(),
            toolbar: '#prepurchase-toolbar'

        });
        /*绑定事件对象*/
        $('#prepurchase-btnsearch').on('click', function (e) {
            e.preventDefault();
            reloadGrid();
        });
        /*新增*/
        $('#prepurchase-btnadd').linkbutton({
            disabled: !policy.checkpolicy({
                policyno: 'prepurchase-allowsubmit',
                policyname: '允许提交设备预采购申请',
                groupname:'设备预采购申请'
            }),
            onClick: function () {
                try {
                    var year = $('#prepurchase-year').numberspinner('getValue');
                    var belongid = $('#prepurchase-belong').combobox('getValue') || login.getLocalUser().companyid
                    if (!year)
                        throw new Error('请先选择申请年度');
                    if (year < new Date().getFullYear())
                        throw new Error('往年预申请设备无法提交');
                    if (!belongid)
                        throw new Error('请选择设备归属');
                } catch (ex) {
                    $.messager.alert('警告', ex.message, 'warning');
                    return false;
                }
                var tpl = require('tpl/prepurchase/form.html');
                var container = '#prepurchase-form';
                var grid = '#prepurchase-form-grid';
                $(tpl).dialog({
                    title: '新增预采购申请',
                    modal: true,
                    width: 700,
                    height: 300,
                    onOpen: function () {
                        $.parser.parse(container);
                        /*创建表单*/
                        $(grid).datagrid({
                            columns: [[
                                {
                                    field: 'id',
                                    checkbox: true
                                },
                                {
                                    field: 'planproperty',
                                    title: '投资计划属性',
                                    width: 80,
                                    align: 'center',
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
                                    field: 'deviceproperty',
                                    title: '设备属性',
                                    width: 80,
                                    align: 'right',
                                    styler: function (value, row, index) {
                                        if (value == '计划外新增')
                                            return {
                                                class: 'text-new'
                                            };
                                    }
                                }, {
                                    field: 'categoryname',
                                    title: '设备类别',
                                    width: 80
                                }, {
                                    field: 'devicetypename',
                                    title: '设备选型',
                                    width: 80
                                }, {
                                    field: 'devicecount',
                                    title: '设备数量',
                                    width: 60
                                }, {
                                    field: 'deviceno',
                                    title: '设备型号',
                                    width: 120
                                }, {
                                    field: 'departmentname',
                                    title: '科室岗位',
                                    width: 120
                                }, {
                                    field: 'postpropertyname',
                                    title: '岗位性质',
                                    width: 100
                                }
                            ]],
                            border: false,
                            fit: true,
                            rownumbers: true,
                            striped: true,
                            toolbar: [
                                {
                                    iconCls: 'icon-newadd',
                                    text: '新增设备申请',
                                    handler: function () {
                                        /*获取表格中存在的列表*/
                                        var gridrows = $(grid).datagrid('getRows');
                                        gridrows = Enumerable.From(gridrows).Where('$.investplan2id').ToArray();
                                        /*从二次审核通过的结果中提取*/
                                        var pass2list = Utility.getData({
                                            path: 'investplan2/getlist_enabletopurchase',
                                            data: {
                                                year: year,
                                                companyid: belongid,
                                                uivalues: gridrows
                                            }
                                        });
                                        try {
                                            if (!pass2list || !pass2list.rows || pass2list.rows.length <= 0)
                                                throw new Error('目前木有二次审核通过的清单!');

                                        } catch (e) {
                                            $.messager.alert('警告', e.message, 'warning');
                                            return false;
                                        }
                                        /*弹出选择二次审核的结果清单*/
                                        showSelection2Pass(pass2list, function (selected) {
                                            if (!selected || selected.length <= 0)
                                                return false;
                                            /*添加*/
                                            for (var i = 0; i < selected.length; i++) {
                                                var select = selected[i];
                                                var fields = $(grid).datagrid('getColumnFields');
                                                var row = jQuery.extend({}, select);
                                                row.devicecount = row.enablecount;
                                                row.investplan2id = row.id;
                                                row.id = null;
                                                row.deviceproperty = '计划内新增';
                                                console.log(row);
                                                $(grid).datagrid('insertRow', {
                                                    index: 0,
                                                    row: row
                                                });
                                            }
                                        });
                                    }
                                }, {
                                    iconCls: 'icon-newremove',
                                    text: '删除设备申请',
                                    handler: function () {
                                        var row = $(grid).datagrid('getSelected');
                                        try {
                                            if (!row)
                                                throw new Error('你还未选择需要删除的设备');
                                            var index = $(grid).datagrid('getRowIndex', row);
                                            $(grid).datagrid('deleteRow', index);
                                        } catch (ex) {
                                            $.messager.alert('警告', ex.message, 'warning');
                                            return false;
                                        }
                                    }
                                }, {
                                    iconCls: 'icon-newadd',
                                    text: '新增计划外设备申请',
                                    handler: function () {
                                        showAddOutPlanDevice(function (data) {

                                        });
                                    }
                                }, {
                                    iconCls: 'icon-save',
                                    text: '提交预采购申请',
                                    handler: function () {

                                    }
                                }
                            ],
                            onRowContextMenu: function (e, index, row) {
                                e.preventDefault();
                                $(grid).datagrid('selectRow', index);
                                $(container + '-contextmenu').menu('show', {
                                    left: e.pageX,
                                    top: e.pageY,
                                    onClick: function (item) {
                                        showModifyDeviceCount({

                                        }, function (data) {
                                        });
                                    }
                                });
                            }
                        });
                    },
                    onClose: function () {
                        $(container).dialog('destroy', true);
                    }
                });
            }
        });
        /*导出*/
        $('#prepurchase-btnexport').linkbutton({
            disabled: !policy.checkpolicy({
                policyno: 'prepurchase-allowexport',
                policyname: '导出设备预采购申请明细',
                groupname: '设备预采购申请'
            }),
            onClick: function () {

            }
        });
        /*检查菜单权限*/
    }
    /*筛选*/
    getFilter = function () {
        return {
            year: $('#prepurchase-year').numberspinner('getValue'),
            belongid: $('#prepurchase-belong').combobox('getValue'),
            statusid: $('#prepurchase-state').combobox('getValue')
        };
    }
    /*刷新*/
    reloadGrid = function () {
        if ($('#prepurchase-grid'))
            $('#prepurchase-grid').datagrid('reload', getFilter());
    }
    /*选择二级审核清单
     * data:通过二级审核的记录信息
     * callback:回调函数
     */
    showSelection2Pass = function (data, callback) {
        var tpl = require('tpl/prepurchase/pass2.html');
        var container = '#prepurchase-pass2';
        var grid = '#prepurchase-pass2-grid';
        $(tpl).dialog({
            title: '全年预采购计划清单',
            modal: true,
            width: 600,
            height: 250,
            onOpen: function () {
                $.parser.parse(container);
                /*创建清单*/
                $(grid).datagrid({
                    columns: [[
                        {
                            field: 'id',
                            checkbox: true
                        }, {
                            field: 'planproperty',
                            title: '投资计划属性',
                            align: 'center',
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
                            field: 'categoryname',
                            title: '设备类别'
                        }, {
                            field: 'devicetypename',
                            title: '设备选型'
                        }, {
                            field: 'deviceno',
                            title: '设备型号'
                        }, {
                            field: 'departmentname',
                            title: '使用部门'
                        }, {
                            field: 'deviceusername',
                            title: '使用人'
                        }, {
                            field: 'postpropertyname',
                            title: '岗位性质'
                        }, {
                            field: 'enablecount',
                            title: '设备数量'
                        }
                    ]],
                    border: false,
                    fit: true,
                    rownumbers: true,
                    toolbar: [
                        {
                            iconCls: 'icon-ok',
                            text: '选择勾选设备',
                            handler: function () {
                                var rows = $(grid).datagrid('getChecked');
                                try {
                                    if (!rows || rows.length <= 0)
                                        throw new Error('你还未勾选需要添加的设备');
                                } catch (e) {
                                    $.messager.alert('警告', e.message, 'warning');
                                    return false;
                                }
                                /*关闭选择框*/
                                $(container).dialog('close');
                                if (callback)
                                    callback(rows);
                            }
                        }
                    ]
                });
                /*加载数据*/
                $(grid).datagrid('loadData', data);
            },
            onClose: function () {
                $(container).dialog('destroy', true);
            }
        })
    }
    /*新增计划外设备*/
    showAddOutPlanDevice = function (callback) {
        var tpl = require('tpl/prepurchase/adddevice.html');
        var container = '#prepurchase-adddevice';
        $(tpl).dialog({
            title: '新增计划外设备',
            modal: true,
            width: 600,
            height: 200,
            onOpen: function () {
                $.parser.parse(container);
            },
            onClose: function () {
                $(container).dialog('destroy', true);
            }
        })
    }
    /*修改设备的数量
     * devicecount
     */
    showModifyDeviceCount = function (count, callback) {
        var tpl=require('tpl/prepurchase/modifycount.html');
        var output=Mustache.render(count,tpl);
        var container='#prepurchase-modifycount';
        $(output).dialog({
            title:'调整设备数量',
            modal:true,
            width:400,
            height:50,
            onOpen:function(){
                $.parser.parse(container);
            },
            onClose:function(){
                $(container).dialog('destroy',true);
            }
        });
        $(container+'-btnsave').on('click',function(e){
            e.preventDefault();
            count=$(container+'-count').numberbox('getValue')||0;
            try{
                if(count<=0)
                  throw new Error('设备数量不能为空');
            }catch(ex){
                $.messager.alert('警告',ex.message,'warning');
                return false;
            }
            if(callback)
              callback(count);
        });
    }
    exports.init = init;
});