define(function (require, exports, module) {
    var
        $container,
        showTree,
        showComboTree,
        showUpdate,
        doUpdate,
        getDataById,
        reloadGrid,
        getSelectedIdFromTree,
        getSelectedIdFromComboTree,
        closeForm,
        policy,
        login,
        init;
    login = require('app/app.login');
    policy = require('app/app.policy');
    getSelectedIdFromComboTree = function (container) {
        var id = $(container).combotree('getValue');
        return id || 0;
    }
    getSelectedIdFromTree = function (container) {
        var node = $(container).tree('getSelected');
        var id = 0;
        if (node != null)
            id = node.id || 0;
        return id;
    }
    closeForm = function () {
        $('#devicecategory-form').dialog('close');
    }
    getTreeDataBySelected = function (container) {
        return $(container).tree('getSelected');
    }
    reloadGrid = function () {
        $('#devicecategory-grid').treegrid('reload');
    }
    /*根据类别Id获取
     * id
     */
    getDataById = function (id) {
        var data = Utility.getData({
            path: 'devicecategory/get',
            data: {
                id: id
            }
        });
        return !data ? null : data.rows;
    }
    doUpdate = function (data) {
        $.ajax({
            url: Utility.serverUrl + 'devicecategory/update',
            type: 'POST',
            dataType: 'json',
            data: data,
            beforeSend: function (xhr) {
                $.messager.progress({
                    text: '正在更新,请稍候...'
                });
            },
            success: function (response) {
                if (!response.success) {
                    $.messager.alert('错误', response.message, 'error');
                } else {
                    reloadGrid();
                    closeForm();
                }
            },
            complete: function () {
                $.messager.progress('close');
            }
        });
    }
    showUpdate = function (opts) {
        var data = {};
        if (opts.action == 'addnew') {
            data = $.extend(opts,
                {
                    categoryname: '',
                    planreferenceprice: 0,
                    planpriceupdateddate: new Date().toString('yyyy-MM-dd HH:mm:ss')
                }
            );
        } else {
            data = getDataById(opts.id);
            if (!data) return false;
            data = $.extend(opts, data);
        }
        var tpl = require('tpl/devicecategory/devicecategory-form.html');
        require('tpl/devicecategory/devicecategory-form.css');
        var output = Mustache.render(tpl, data);
        $(output).dialog({
            title: opts.action == 'addnew' ? '新增' : '修改',
            width: 400,
            height: 160,
            modal: true,
            onOpen: function () {
                $.parser.parse('#devicecategory-form');
            },
            onClose: function () {
                $('#devicecategory-form').dialog('destroy', true);
            }
        });
        $('#devicecategory-form-btnsave').on('click', function (e) {
            e.preventDefault();
            data = {
                id: data.id,
                parentid: data.parentid,
                categoryname: $('#devicecategory-form-categoryname').val(),
                planreferenceprice: $('#devicecategory-form-planreferenceprice').val(),
                planpriceupdateddate: new Date().toString('yyyy-MM-dd HH:mm:ss'),
                action: data.action
            };
            try {
                if (!data.categoryname)
                    throw new Error('设备类别不能为空');
            } catch (ex) {
                $.messager.alert('错误', ex.message, 'warning');
                return false;
            }
            doUpdate(data);
        });
    }

    init = function (container) {
        $container = $(container);
        //显示树形表格
        $container.treegrid({
            url: Utility.serverUrl + 'devicecategory/gettreegrid',
            idField: 'id',
            treeField: 'categoryname',
            rownumbers: true,
            fit: true,
            singleSelect: true,
            toolbar: '#devicecategory-toolbar',
            columns: [[
                {
                    field: 'categoryname',
                    title: '类别名称'
                }, {
                    field: 'planreferenceprice',
                    title: '计划参考价（单位：万元）',
                    align: 'right'
                }, {
                    field: 'planpriceupdateddate',
                    title: '价格更新日期'
                }]],
            onContextMenu: function (e, row) {
                $container.treegrid('select', row.id);
                $('#devicecategory-grid-contextmenu').menu('show', {
                    left: e.pageX,
                    top: e.pageY,
                    onClick: function (item) {
                        $.messager.alert('警告', item.name + ':' + item.text);
                    }
                });
                e.preventDefault();
            }
        });
        //绑定事件
        /*新增*/
        $('#devicecategory-btnadd').linkbutton({
            disabled: !policy.checkpolicy({
                policyno: 'category-allowaddnew',
                policyname: '新增设备类别',
                groupname: '基础资料'
            }),
            onClick: function () {
                var row = $container.datagrid('getSelected');
                var parentid = !row ? null : row.id;
                showUpdate({
                    parentid: parentid,
                    action: 'addnew'
                });
            }
        });
        $('#devicecategory-btnedit').linkbutton({
            disabled: !policy.checkpolicy({
                policyno: 'category-allowedit',
                policyname: '修改设备类别',
                groupname: '基础资料'
            }),
            onClick: function () {
                var row = $container.treegrid('getSelected');
                if (!row) return false;
                showUpdate({
                    id: row.id,
                    action: 'edit'
                });
            }
        });
        $('#devicecategory-btnremove').linkbutton({
            disabled: !policy.checkpolicy({
                policyno: 'category-allowremove',
                policyname: '删除设备类别',
                groupname: '基础资料'
            }),
            onClick: function () {
                var row = $container.treegrid('getSelected');
                if (!row) return false;
                $.messager.confirm('警告', '是否确认删除此设备类型?', function (r) {
                    if (r) {
                        doUpdate({
                            id: row.id,
                            action: 'remove'
                        })
                    }
                });
            }
        });
    }
    showTree = function (container) {
        $container = $(container);
        $container.tree({
            lines: true,
            url: Utility.serverUrl + 'devicecategory/gettree',
            method: 'post'
        });
        var node = $container.tree('find', 0);
        if (!node) return false;
        $container.tree('select', node.target);
    }
    showComboTree = function (container) {
        $container = $(container);
        $container.combotree({
            lines: true,
            url: Utility.serverUrl + 'devicecategory/gettree',
            method: 'post',
            width: 120,
            panelHeight: 'auto',
            prompt: '选择设备类型'
        });
    }
    exports.init = init;
    exports.showTree = showTree;
    exports.showComboTree = showComboTree;
    exports.getSelectedIdFromTree = getSelectedIdFromTree;
    exports.getSelectedIdFromComboTree = getSelectedIdFromComboTree;
});