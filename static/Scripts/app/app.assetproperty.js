define(function (require, exports, module) {
    var
        $container,
        showTree,
        showComboTree,
        getSelectedIdFromTree,
        getSelectedIdFromComboTree,
        policy,
        login,
        init;
    login = require('app/app.login');
    policy = require('app/app.policy');
    init = function (container) {
        $(container).treegrid({
            columns:[[
                {
                    field: 'id',
                    checkbox:true
                }, {
                    field: 'propertyname',
                    title:'属性名称'
                }
            ]],
            idField: 'id',
            treeField: 'propertyname',
            toolbar:'#assetproperty-toolbar',
            border: false,
            fit:true,
            url: Utility.serverUrl + 'getteegrid',
        })
        /*绑定事件*/
        $('#assetproperty-btnadd').linkbutton({
            disabled: !policy.checkpolicy({
                policyno: 'assetproperty-allowCRUD',
                policyname: '允许对资产属性编辑处理',
                groupname:'基础资料'
            }),
            onClick: function () {

            }
        });
    }
    getSelectedIdFromTree = function (container) {
        var node = $(container).tree('getSelected');
        return node != null ? node.id : 0;
    }
    showTree = function (container) {
        $container = $(container);
        $container.tree({
            lines: true,
            url:Utility.serverUrl+'assetproperty/gettree'
        });
    }
    showComboTree = function (container) {
        $container = $(container);
        $container.combotree({
            idField: 'id',
            valueField:'text',
            url:Utility.serverUrl+'assetproperty/gettree',
            editable: false,
            panelMinWidth:120,
            panelMinHeight: 100,
            panelWidth:'auto',
            panelHeight: 'auto',
            prompt: '选择资产属性'
        })
    }
    getSelectedIdFromComboTree = function (container) {
        var data = $(container).combotree('getValue');
        return data || 0;
    }
    exports.init = init;
    exports.showTree = showTree;
    exports.showComboTree = showComboTree;
    exports.getSelectedIdFromTree = getSelectedIdFromTree;
    exports.getSelectedIdFromComboTree = getSelectedIdFromComboTree;
});