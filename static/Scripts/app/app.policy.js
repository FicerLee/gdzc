define(function (require, exports, module) {
    var
        showSelectPolicy,
        getDataByNo,
        doUpdate,
        checkpolicy,
        getFilter,
        showUpdate,
        login,
        init;
    login = require('app/app.login');
    /*获取筛选*/
    getFilter = function () {
        return {
            key: $('#policy-key').val()
        };
    }
    /*初始化*/
    init = function (container) {
        $(container).datagrid({
            columns: [[
                {
                    field: 'policyno',
                    title: '权限识别码'
                }, {
                    field: 'policyname',
                    title: '权限'
                }, {
                    field: 'groupname',
                    title: '权限类别'
                }
            ]],
            border: false,
            fit: true,
            rownumbers: true,
            singleSelect: true,
            url: Utility.serverUrl + 'userrolepolicy/getlist',
            queryParams: getFilter(),
            toolbar: '#policy-toolbar'
        });
        /*绑定*/
        $('#policy-btnadd').linkbutton({
            disabled:login.getLocalUser().usercode!='admin'&&!checkpolicy({
                policyno: 'policy-allowaddnew',
                policyname: '新增权限',
                groupname: '权限管理'
            }),
            onClick: function () {
                showUpdate({
                    action:'addnew'
                }, function (data) {
                    doUpdate(data);
                })
            }
        });
        $('#policy-btnedit').linkbutton({
            disabled: login.getLocalUser().usercode != 'admin' && !checkpolicy({
                policyno: 'policy-allowedit',
                policyname: '修改权限',
                groupname: '权限管理'
            }),
            onClick: function () {
                var row = $(container).datagrid('getSelected');
                if (!row) return false;
                showUpdate({
                    action: 'edit',
                    policyno: row.policyno
                }, function (data) {
                    doUpdate(data);
                });
            }
        });
        $('#policy-btnremove').linkbutton({
            disabled: login.getLocalUser().usercode != 'admin' && !checkpolicy({
                policyno: 'policy-allowremove',
                policyname: '删除权限',
                groupname: '权限管理'
            }),
            onClick: function () {
                var row = $(container).datagrid('getSelected');
                if (!row) return false;
                $.messager.confirm('警告', '是否确认删除此权限?', function (r) {
                    if (r) {
                        doUpdata({
                            action: 'remove',
                            policyno: row.policyno
                        });
                    }
                });
            }
        });
    }
    /*根据权限no获取权限
     * policyno
     */
    getDataByNo = function (policyno) {
        var data = Utility.getData({
            path: 'userrolepolicy/get',
            data: {
                policyno: policyno
            }
        });
        return !data ? null : data.rows;
    }
    /*更新权限信息
     * options:
     *   action:'addnew','edit','remove',
     *   policyno:'权限标识符',
     *   policyname:'权限名称',
     *   groupname:'分组名称'
     */
    doUpdate = function (options) {
        Utility.saveData({
            path: 'userrolepolicy/update',
            params: options,
            success: function (res) {
                //正确不处理
            },
            error: function (message) {
                $.messager.alert('错误', message, 'error');
            }
        })
    }
    /*根据用户选择权限选择权限
     * selectedpolicies:已选择的权限,
     * callback:回调函数
     */
    showSelectPolicy = function (selectedpolicies,callback) {
        var tpl = require('tpl/policy/list.html');
        var container = '#policy-list';
        var grid = container + '-grid';
        $(tpl).dialog({
            modal: true,
            title: '选择权限',
            width: 500,
            height: 300,
            onOpen: function () {
                $.parser.parse(container);
                $(grid).datalist({
                    url: 'userrolepolicy/getlist',
                    checkbox: true,
                    lines: true,
                    groupField: 'groupname',
                    valueField: 'policyno',
                    textField: 'policyname'
                });
            },
            onClose: function () {
                $(container).dialog('destroy', true);
            }
        });
    }
    /*检查权限
     * 返回:true,false
     */
    checkpolicy = function (options) {
        return login.checkpolicy(options);
    }
    /*新增、修改、删除权限信息
     * options:
     *   action:'addnew','edit','remove'
     *   policyno:权限标志
     * callback:回调函数，返回data
     *   
     */
    showUpdate = function (options,callback) {
        var tpl = require('tpl/policy/form.html');
        var data=$.extend({},options);
        if(options.action=='edit')
        {
            var _data = getDataByNo(options.policyno);
            data = $.extend(options, _data);
        }
        var output = Mustache.render(tpl, data);
        var container = '#policy-form';
        $(output).dialog({
            modal: true,
            title: data.action == 'addnew' ? '新增权限信息' : '修改权限信息',
            width: 400,
            height: 180,
            onOpen: function () {
                $.parser.parse(container);
            },
            onClose: function () {
                $(container).dialog('destroy', true);
            }
        });
        $(container + '-btnsave').linkbutton({
            onClick: function () {
                var _data = {
                    action:data.action,
                    policyno: $(container + '-policyno').val(),
                    policyname: $(container + '-policyname').val(),
                    groupname: $(container + '-groupname').val()
                };
                try {
                    if (!_data.policyno)
                        throw new Error('权限代码不能为空');
                    if (!_data.policyname)
                        throw new Error('权限名称不能为空');
                    if (!_data.groupname)
                        throw new Error('组名称不能为空');
                } catch (e) {
                    $.messager.alert('错误', e.message, 'warning');
                    return false;
                }
                $(container).dialog('close');
                if (callback)
                    callback(_data);
            }
        })
    }
    exports.init = init;
    exports.showSelectPolicy = showSelectPolicy;
    exports.getDataByNo = getDataByNo;
    exports.doUpdate = doUpdate;
    exports.checkpolicy = checkpolicy;
});