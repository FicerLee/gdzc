define(function (require, exports, module) {
    var
        getDataById,
        category,
        showUpdate,
        doUpdate,
        reloadGrid,
        closeForm,
        getTreeData,
        showComboTree,
        getFilter,
        policy,
        init;
    policy = require('app/app.policy');
    category = require('app/app.devicecategory');
    reloadGrid = function () {
        if ($('#devicetype-grid'))
            $('#devicetype-grid').datagrid('reload',getFilter());
    }
    closeForm = function () {
        $('devicetype-form').dialog('close');
    }
    getDataById = function (id) {
        var data = Utility.getData({
            path: 'devicetype/get',
            data: {
                id: id
            }
        });
        return !data ? null : data.rows;
    }
    showUpdate = function (opts) {
        var data = {};
        if (opts.action == 'addnew') {
            data = {
                id: 0,
                typename: '',
                categoryname: '',
                referenceprice: 0,
                action:opts.action
            }
        } else {
            data = getDataById(opts.id);
            if (!data) return false;
        }
        var tpl = require('tpl/devicetype/devicetype-form.html');
        require('tpl/devicetype/devicetype-form.css');
        var output = Mustache.render(tpl, data);
        $(output).dialog({
            title: data.action == 'addnew' ? '新增' : '修改',
            width: 400,
            height: 200,
            modal: true,
            onOpen: function () {
                var category = require('app/app.devicecategory');
                category.showComboTree('#devicetype-form-categoryname');
                $.parser.parse('#devicetype-form');
            },
            onClose: function () {
                $('#devicetype-form').dialog('destroy', true);
            }
        });
        //绑定保存
        $('#devicetype-form-btnsave').on('click', function (e) {
            e.preventDefault();
            var data = {
                typename: $('#devicetype-form-typename').val(),
                categoryid: $('#devicetype-form-categoryname').combotree('getValue') || 0,
                referenceprice: $('#devicetype-form-referenceprice').numberbox('getValue'),
                action: opts.action
            };
            try {
                if (!data.typename)
                    throw new Error('设备选型名称不能为空');
                if (!data.categoryid)
                    throw new Error('设备类别不能为空');
                if (!data.referenceprice || data.referenceprice <= 0)
                    throw new Error('设备选型参考价格不能为空');
            } catch (ex) {
                $.messager.alert('错误', ex.message, 'error');
                return false;
            }
            doUpdate(data);
        });
    }
    doUpdate = function (data) {
        Utility.saveData({
            path: 'devicetype/update',
            params: data,
            success: function (res) {
                $.messager.alert('成功', '设备选型信息已成功更新', 'info');
                closeForm();
                reloadGrid();
            },
            error: function (message) {
                $.messager.alert('失败', message, 'warning');
            }
        });
    }
    /*初始化显示选型清单*/
    init = function (container) {
        $container = $(container);
        //显示设备类型
        category.showComboTree('#devicetype-category');
        $('#devicetype-category').combotree({
            onChange: function (newvalue, oldvalue) {
                reloadGrid();
            }
        });
        //显示主数据信息
        $container.datagrid({
            columns: [[{
                field: 'id',
                checkbox: true
            }, {
                field: 'typename',
                title: '设备类型',
            }, {
                field: 'referenceprice',
                title: '参考价格（单位：万元）',
            }, {
                field: 'categoryname',
                title: '设备类型',
                sortable: true
            }]],
            idField: 'id',
            rownumbers: true,
            singleSelect: true,
            fitColumns: false,
            border: false,
            pagination:false,
            toolbar: '#devicetype-toolbar',
            fit: true,
            striped: true,
            queryParams:getFilter(),
            url: Utility.serverUrl + 'devicetype/getlist',
            toolbar: '#devicetype-toolbar'
        });
        /*绑定事件*/
        $('#devicetype-btnadd').linkbutton({
            disabled: !policy.checkpolicy({
                policyno: 'devicetype-allowaddnew',
                policyname: '新增设备选型',
                groupname: '基础资料'
            }),
            onClick: function () {
                showUpdate({
                    action: 'addnew'
                });
            }
        });

        $('#devicetype-btnedit').linkbutton({
            disabled: !policy.checkpolicy({
                policyno: 'devicetype-allowedit',
                policyname: '修改设备选型',
                groupname:'基础资料'
            }),
            onClick: function () {
                var row = $container.datagrid('getSelected');
                if (!row) return false;
                showUpdate({
                    action: 'edit',
                    id: row.id
                });
            }
        })
        $('#devicetype-btnremove').linkbutton({
            disabled: !policy.checkpolicy({
                policyno: 'devicetype-allowremove',
                policyname: '删除设备选型',
                groupname:'基础资料'
            }),
            onClick: function () {
                var row = $container.datagrid('getSelected');
                if (!row) return false;
                $.messager.confirm('警告', '是否确认删除此设备选型信息', function (r) {
                    if (r) {
                        doUpdate({
                            action: 'remove',
                            id: row.id
                        });
                    }
                });
            }
        })
    }
    getFilter = function () {
        return {
            categoryid: $('#devicetype-category').combotree('getValue') || null
        };
    }
    /*获取所有的选型结果*/
    getTreeData = function () {
        return Utility.getData({
            path: 'devicetype/gettree'
        });
    }
    showComboTree = function (container) {
        $(container).combotree({
            url: Utility.serverUrl + 'devicetype/gettree',
            valueField: 'id',
            textField: 'text',
            editable: false,
            panelHeight: 'auto',
            panelMinWidth:160,
            panelWidth: 'auto',
            prompt: '选择设备型号'
        });
    }
    exports.init = init;
    exports.getTreeData = getTreeData;
    exports.showComboTree = showComboTree;
});