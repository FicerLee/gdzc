define(function (require, exports, module) {
    var
        init,
        login,
        policy,
        showSelectPolicy,
        showCombo;
    login = require('app/app.login');
    policy = require('app/app.policy');
    showCombo = function (container) {
        $container = $(container);
        $container.combobox({
            url:Utility.serverUrl+'userrole/getlist',
            valueField: 'roleid',
            textField: 'rolename',
            editable: false,
            panelHeight: 'auto',
            loader: function (params, success, error) {
                var opt = $(this).combobox('options');
                $.ajax({
                    url: opt.url,
                    type: opt.method,
                    dataType: 'json',
                    data: opt.params,
                    success: function (res) {
                        if (res.rows)
                            success(res.rows);
                        else
                            success(res);
                    },
                    error: function () {
                        error.apply(this, arguments);
                    }
                });
            }
        });
    }
    init = function (container) {
        $(container).datagrid({
            columns: [[
               {
                   field: 'rolename',
                   title:'角色名称'
               }
            ]],
            border: false,
            fit: true,
            rownumbers: true,
            singleSelect: true,
            url: Utility.serverUrl + 'userrole/getlist',
            toolbar: '#role-toolbar',
            onRowContextMenu: function (e, index, row) {
                e.preventDefault();
                $(container).datagrid('selectRow', index);
                $('#role-contextmenu').menu('show', {
                    left: e.pageX,
                    top: e.pageY,
                    onClick: function (item) {
                        if (item.name == 'role-doModifyPolicy') {
                            showSelectPolicy({
                                roleid:row.roleid
                            }, function (selected) {
                                //将勾选的权限清单保存到数据库中
                                selected = selected || [];
                                var policies = [];
                                selected.forEach(function (value, index) {
                                    policies.push(value.policyno);
                                });
                                Utility.saveData({
                                    path: 'userrole/update',
                                    params: {
                                        action:'edit',
                                        roleid: row.roleid,
                                        rolename: row.rolename,
                                        policies: policies
                                    },
                                    success: function (res) {
                                        $.messager.alert('成功',res.message, 'info');
                                    },
                                    error: function (message) {
                                        $.messager.alert('错误', message, 'error');
                                    }
                                });
                            });
                        }
                    }
                });
            }
        });
        /*绑定事件*/
        $('#role-btnadd').linkbutton({
            disabled: !policy.checkpolicy({
                policyno: 'role-allowaddnew',
                policyname: '新增角色',
                groupname: '权限维护'
            }),
            onClick: function () {

            }
        });
        //修改角色
        $('#role-btnedit').linkbutton({
            disabled: !policy.checkpolicy({
                policyno: 'role-allowedit',
                policyname: '修改角色',
                groupname: '权限维护'
            }),
            onClick: function () {

            }
        });
        //删除角色
        $('#role-btnremove').linkbutton({
            disabled: !policy.checkpolicy({
                policyno: 'role-allowremove',
                policyname: '删除角色',
                groupname: '权限维护'
            }),
            onClick: function () {

            }
        });
        var menu = '#role-contextmenu';
        if(login.getLocalUser().usercode!='admin'&&!policy.checkpolicy({
            policyno:'role-allowpolicy',
                policyname:'允许修改角色权限',
            groupname:'权限维护'
        })) {
            var item = $(menu).menu('findItem', '更新组权限...');
            if (item && item.target)
                $(menu).menu('disableItem', item.target);
        }
    }
    /*根据角色选择权限
     * options:
     *  roleid:角色Id
     *  callback:回调函数
     */
    showSelectPolicy = function (options,callback) {
        /*获取所有权限*/
        var total = Utility.getData({
            path: 'userrolepolicy/getlist',
        });
        var selected = Utility.getData({
            path: 'userrole/get',
            data: {
                roleid: options.roleid
            }
        });
        selected = !selected ? null : selected.rows;
        selected = !selected ? null : selected.policies;
        selected = !selected ? [] : selected;
        var tpl = require('tpl/policy/list.html');
        var container = '#policy-list';
        var grid = container + '-grid';
        $(tpl).dialog({
            modal: true,
            title: '选择权限',
            width: 400,
            height: 350,
            onOpen: function () {
                $.parser.parse(container);
                $(grid).datalist({
                    lines: true,
                    checkbox: true,
                    idField:'policyno',
                    border: false,
                    rownumbers: true,
                    singleSelect:false,
                    valueField: 'policyno',
                    textField: 'policyname',
                    groupField: 'groupname',
                    toolbar: [
                        {
                            iconCls: 'icon-selectall',
                            text: '全部选择',
                            handler: function () {
                                $(grid).datalist('checkAll');
                            }
                        },{
                            iconCls:'icon-unselectall',
                            text:'全部取消',
                            handler:function(){
                                $(grid).datalist('uncheckAll');
                            }
                        },
                        {
                            iconCls: 'icon-save',
                            text: '应用勾选的权限',
                            handler: function () {
                                var rows = $(grid).datalist('getChecked');
                                $(container).dialog('close');
                                if (callback)
                                    callback(rows);
                            }
                        }
                    ]
                });
                $(grid).datalist('loadData', total);
                selected.forEach(function (value, index) {
                    var rowIndex = $(grid).datalist('getRowIndex',value);
                    if (rowIndex > -1)
                        $(grid).datalist('checkRow', rowIndex);
                });
            },
            onClose: function () {
                $(container).dialog('destroy', true);
            }
        })
    }
    exports.showCombo = showCombo;
    exports.init = init;

});