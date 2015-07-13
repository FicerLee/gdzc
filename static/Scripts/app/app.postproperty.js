define(function (require, exports, module) {
    var
        $container,
        showComboTree,
        getSelectedIdFromComboTree,
        showUpdate,
        doUpdate,
        policy,
        login,
        init;
    login = require('app/app.login');
    policy = require('app/app.policy');
    getSelectedIdFromComboTree = function (container) {
        var node = $(container).combotree('getSelected');
        return node != null ? node.id : 0;
    }
    init = function (container) {
        var menu = '#postproperty-contextmenu';
        $(container).treegrid({
            url: Utility.serverUrl + 'postproperty/gettreegrid',
            columns: [[
                {
                    field: 'id',
                    checkbox: true
                }, {
                    field: 'propertyname',
                    title: '属性名称'
                }
            ]],
            fit: true,
            toolbar: '#postproperty-toolbar',
            border: false,
            idField: 'id',
            treeField: 'propertyname',
            rownumbers: true,
            singleSelect: true,
            onContextMenu: function (e, row) {
                e.preventDefault();
                $(container).treegrid('select', row.id);
                $(menu).menu('show', {
                    left: e.pageX,
                    top: e.pageY,
                    onClick: function (item) {
                        if (item.name == 'postproperty-doAdd') {
                            showUpdate({
                                action: 'addnew',
                                parentid: row.id
                            })
                        } else if (item.name == 'postproperty-doEdit') {
                            showUpdate({
                                action: 'edit',
                                id: row.id
                            });
                        } else if (item.name == 'postproperty-doRemove') {
                            $.messager.alert('警告', '确认是否删除此节点?', function (r) {
                                if (r)
                                    doUpdate({
                                        action: 'addnew',
                                        id: row.id
                                    });
                            });
                        };
                    }
                });
            }
        });
        /*绑定事件*/
        var isallowed=policy.checkpolicy(
                {
                    policyno: 'postproperty-allowCRUD',
                    policyname: '允许对岗位属性进行编辑',
                    groupname: '基础资料'
                }
            );
        $('#postproperty-btnadd').linkbutton({
            disabled: !isallowed,
            onClick: function () {

            }
        });
        if(!isallowed){
            $.each([
                '新增岗位属性...',
                '修改岗位属性...',
                '删除岗位属性'
            ], function (index, value) {
                var item = $(menu).menu('findItem', value);
                if (item && item.target)
                    $(menu).menu('disableItem', item.target);
            });
        }
    }
    showComboTree = function (container) {
        $container = $(container);
        $container.combotree({
            url: Utility.serverUrl + 'postproperty/gettree',
            method: 'post',
            valueField: 'id',
            textField: 'text',
            panelMinWidth: 150,
            panelWidth: 'auto',
            panelHeight: 'auto',
            editable: false,
            lines: true,
            prompt: '选择岗位性质'
        });
    }
    exports.init = init;
    exports.showComboTree = showComboTree;
    exports.getSelectedIdFromComboTree = getSelectedIdFromComboTree;
});