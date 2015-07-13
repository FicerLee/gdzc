define(function (require, exports, module) {
    var
        $container,
        showCombo,
        getSelectedIdFromCombo,
        showUpdate,
        doUpdate,
        policy,
        login,
        init;
    login = require('app/app.login');
    policy = require('app/app.policy');
    getSelectedIdFromCombo = function (container) {
        var id = $(container).combobox('getValue');
        return id || 0;
    }
    init = function (container) {
        var menu = '#workproperty-contextmenu';
        $(container).datagrid({
            url: Utility.serverUrl + 'workproperty/getlist',
            columns: [[
                {
                    field: 'id',
                    checkbox: true,
                }, {
                    field: 'text',
                    title:'属性名称'
                }]],
            toolbar:'#workproperty-toolbar',
            fit: true,
            border: false,
            singleSelect: true,
            rownumbers: true,
            onRowContextMenu: function (e, index, row) {
                e.preventDefault();
                $(container).datagrid('selectRow', index);
                $(menu).menu('show', {
                    left: e.pageX,
                    top: e.pageY,
                    onClick: function (item) {
                        if (item.name == 'workproperty-doAdd') {
                            showUpdate({
                                action: 'addnew',
                            }, doUpdate(data));
                        } else if (item.name == 'workproperty-doEdit') {
                            showUpdate({
                                action: 'edit',
                                id: row.id
                            }, doUpdate(data));
                        } else if (item.name == 'workproperty-doRemove') {
                            $.messager.alert('警告', '是否确认删除此属性?', function (r) {
                                if (r)
                                    doUpdate({
                                        action: 'remove',
                                        id: row.id
                                    });
                            });
                        }
                    }
                });
            }
        });
        var allowCRUD = policy.checkpolicy({
            policyno: 'workproperty-allowCRUD',
            policyname: '允许增删改员工性质',
            groupname: '基础资料'
        });
        /*绑定事件*/
        $('#workproperty-btnadd').linkbutton({
            disabled: !allowCRUD,
            onClick: function () {
                showUpdate({
                    action: 'addnew'
                }, doUpdate(data));
            }
        });
        if (!allowCRUD) {
            $.each(
                [
                    '新增员工性质...',
                    '修改员工性质...',
                    '删除员工性质'
                ], function (index, value) {
                    var item = $(menu).menu('findItem', value);
                    if (item && item.target)
                        $(menu).menu('disableItem', item.target);
                }
                );
        }
    }
    showCombo = function (container) {
        $container = $(container);
        $container.combobox({
            url:Utility.serverUrl+'workproperty/getlist',
            valueField: 'id',
            textField: 'text',
            panelMinWidth: 80,
            panelWidth:'auto',
            editable: false,
            panelHeight: 'auto',
            prompt:'选择员工类型'
        });
    }
    exports.init = init;
    exports.showCombo = showCombo;
    exports.getSelectedIdFromCombo = getSelectedIdFromCombo;
});