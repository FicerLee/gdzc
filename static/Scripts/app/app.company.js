define(function (require, exports, module) {
    var
        $container,
        login,
        showTree,
        showComboTree,
        showUpdate,
        doUpdate,
        getDataById,
        getSelectedIdFromTree,
        reloadGrid,
        closeForm,
        policy,
        init;
    login = require('app/app.login');
    policy = require('app/app.policy');
    closeForm = function () {
        $('#company-form').dialog('close');
    }
    getSelectedIdFromTree = function (container) {
        var node = $(container).tree('getSelected');
        return node != null ? node.id : 0;
    }
    reloadGrid = function () {
        $('#company-grid').treegrid('reload');
    }
    getDataById = function (id) {
        var data = Utility.getData({
            path: 'company/get',
            data: {
                id: id
            }
        });
        return !data ? null : data.rows;
    };
    showUpdate = function (opts) {
        var data = {};
        if (opts.action == 'addnew') {
            data = {
                parentid: opts.id
            }
        } else {
            data = getDataById(opts.id);
            if (!data) return false;
        }
        var tpl = require('tpl/company/company-form.html');
        require('tpl/company/company-form.css');
        var output = Mustache.render(tpl, data);
        $(output).dialog({
            modal: true,
            title: opts.action == 'addnew' ? '新增' : '修改',
            width: 400,
            height: 220,
            onOpen: function () {
                $.parser.parse('#company-form');
            },
            onClose: function () {
                $('#company-form').dialog('destroy', true);
            }
        })
        $('#company-form-btnsave').on('click', function (e) {
            e.preventDefault();
            data = {
                parentid: opts.id,
                id: data.id,
                companyname: $('#company-form-companyname').val(),
                address: $('#company-form-address').val(),
                contactphone: $('#company-form-contactphone').val(),
                memo: $('#company-form-memo').val(),
                action: opts.action,
                iscompany: $('#company-form-iscompany').is(':checked')
            }
            doUpdate(data);
        });
    }
    doUpdate = function (data) {
        Utility.saveData({
            path: 'company/update',
            params: data,
            success: function (res) {
                //$.messager.alert('成功', '该公司节点已成功更新', 'info');
                closeForm();
                reloadGrid();
            },
            error: function (message) {
                $.messager.alert('错误', message, 'error');
            }
        })
    }
    /*初始化*/
    init = function (container) {
        $container = $(container);
        //显示树形表格
        $container.treegrid({
            url: Utility.serverUrl + 'company/gettreegrid',
            idField: 'id',
            treeField: 'companyname',
            rownumbers: true,
            fit: true,
            singleSelect: true,
            toolbar: '#company-toolbar',
            columns: [[
                {
                    field: 'companyname',
                    title: '公司及部门名称',
                    width: 160,
                    editor: 'text'
                }, {
                    field: 'address',
                    title: '公司地址',
                    width: 220,
                    editor: 'text'
                }, {
                    field: 'contactphone',
                    title: '联系电话',
                    width: 120,
                    editor: 'text'
                }, {
                    field: 'memo',
                    title: '备注',
                    width: 220,
                    editor: 'textarea'
                }]],
            onContextMenu: function (e, row) {
                e.preventDefault();
                $container.treegrid('select', row.id);
                $('#company-grid-contextmenu').menu('show', {
                    left: e.pageX,
                    top: e.pageY,
                    onClick: function (item) {
                        var action = '';
                        switch (item.name) {
                            case 'company-showAdd':
                                showUpdate({
                                    action: 'addnew',
                                    id: row.id
                                });
                                break;
                            case 'company-showEdit':
                                showUpdate({
                                    action: 'edit',
                                    id: row.id
                                })
                                break;
                            case 'company-showRemove':
                                $.messager.confirm('警告', '是否确认删除此节点？', function (r) {
                                    if (r) {
                                        $('#company-grid').treegrid('remove', row.id);
                                        var data = {
                                            action: 'remove',
                                            id: row.id
                                        };
                                        doUpdate(data);
                                    }
                                });
                                break;
                        }
                    }
                });
            }
        });
        /*检查权限*/
        var menu = '#company-grid-contextmenu';
        if (!policy.checkpolicy({
            policyno: 'company-allowaddnew',
            policyname: '新增公司或者部门',
            groupname: '基本资料'
        })) {
            $.each(['新增', '修改', '删除'], function (index, value) {
                var item = $(menu).menu('findItem', value);
                if (item && item.target)
                    $(menu).menu('disableItem', item.target);
            }
                );
        }
        $('#company-btnadd').linkbutton({
            disabled: !policy.checkpolicy({
                policyno: 'company-allowaddnew',
                policyname: '新增公司或者部门',
                groupname:'基本资料'
            }),
            onClick: function () {
                var row = $(container).datagrid('getSelected');
                id = !row ? null : row.id;
                showUpdate({
                    action: 'addnew',
                    id: id
                });
            }
        })


    }
    showTree = function (container) {
        $container = $(container);
        $container.tree({
            lines: true,
            url: Utility.serverUrl + 'company/gettree',
            method: 'post',
            onContextMenu: function (e, node) {
                e.preventDefault();
            },
            queryParams: {
                id: login.getLocalUser().companyid
            }
        });
    }
    /*显示下拉列表框
     * options:
     *   queryParams:额外的查询参数
     */
    showComboTree = function (container, options) {
        $container = $(container);
        $container.combotree({
            lines: true,
            method: 'post',
            url: Utility.serverUrl + 'company/gettree',
            editable: false,
            panelMinWidth: 180,
            panelWidth: 'auto',
            panelHeight: 'auto',
            valueField: 'id',
            textField: 'text',
            prompt: '选择公司部门',
            queryParams: options ? (options.queryParams || {}) : {}
        });
    }
    exports.showComboTree = showComboTree;
    exports.init = init;
    exports.showTree = showTree;
    exports.getSelectedIdFromTree = getSelectedIdFromTree;
});