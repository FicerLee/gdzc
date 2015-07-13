define(function (require, exports, module) {
    var
        showUpdate,
        doUpdate,
        company,
        getDataByUserCode,
        reloadGrid,
        closeForm,
        role,
        state,
        getFilter,
        login,
        policy,
        init;
    login = require('app/app.login');
    policy = require('app/app.policy');
    company = require('app/app.company');
    role = require('app/app.role');
    state = require('app/app.userstatus');
    /*保存用户信息
     * 
     */
    doUpdate = function (data) {
        data.userpass = Utility.crypto(data.userpass);
        Utility.saveData({
            path: 'users/update',
            params: data,
            success: function (res) {
                $.messager.alert('成功', '用户信息已成功更新', 'info');
                reloadGrid();
            },
            error: function (message) {
                $.messager.alert('错误', message, 'error');
            }
        })
    }
    reloadGrid = function () {
        if ($('#users-grid'))
            $('#users-grid').datagrid('reload', getFilter());
    }
    closeForm = function () {
        if ($('#users-form'))
            $('#users-form').dialog('close');
    }
    /*新增，修改，删除用户
     * opts:
     *  action:'addnew','edit','remove'
     *  usercode:'用户账号'
     */
    showUpdate = function (opts,callback) {
        var data = {};
        if (opts.action == 'edit') {
            data = getDataByUserCode(opts.usercode);
            if (!data) return false;
        }
        var tpl = require('tpl/users/users-form.html');
        require('tpl/users/users-form.css');
        var output = Mustache.render(tpl, data);
        $(output).dialog({
            title: opts.action == 'addnew' ? '新增用户' : '修改用户',
            modal: true,
            width: 440,
            height: 400,
            onOpen: function () {
                /*重新渲染*/
                $.parser.parse('#users-form');
                company.showComboTree('#users-form-company');
                role.showCombo('#users-form-role');
                state.showCombo('#users-form-status');
            },
            onClose: function () {
                $('#users-form').dialog('destroy', true);
            }
        })
        //绑定保存事件
        $('#users-form-btnsave').on('click', function (e) {
            e.preventDefault();
            data = {
                action: opts.action,
                statusid:$('#users-form-status').combobox('getValue')||null,
                usercode: $('#users-form-usercode').val(),
                username: $('#users-form-username').val(),
                userpass: $('#users-form-userpass').val(),
                companyid: $('#users-form-company').combotree('getValue') || 0,
                contactphone: $('#users-form-contactphone').val(),
                roleid: $('#users-form-role').combobox('getValue'),
                enablesubmitinvestplan: $('#users-form-enablesubmitinvestplan').is(':checked'),
                enablesubmitdevicescrap: $('#users-form-enablesubmitdevicescrap').is(':checked'),
                enableviewpurchaselist: $('#users-form-enableviewpurchaselist').is(':checked'),
                enablebulkdataentry: $('#users-form-enablebulkdataentry').is(':checked')
            };
            try {
                if (!data.statusid)
                    throw new Error('用户状态不能为空');
                if (!data.usercode)
                    throw new Error('用户账号不能为空');
                if (!data.username)
                    throw new Error('用户姓名不能为空');
                if (!data.userpass)
                    throw new Error('用户密码不能为空');
                if (!data.companyid)
                    throw new Error('用户所属公司不能为空');
                if (!data.roleid)
                    throw new Error('用户所属角色不能为空');
            } catch (ex) {
                $.messager.alert('错误', ex.message, 'warning');
                return false;
            }
            $('#users-form').dialog('close');
            if (callback)
                callback(data);
        });
        /*生成默认的系统账号*/
        $('#users-form-btnchangepinyin').linkbutton({
            disabled: opts.action != 'addnew',
            onClick: function () {
                var username = $('#users-form-username').val();
                if (!username || username.length <= 0) return false;
                Utility.saveData({
                    path: 'users/pinyin',
                    params: {
                        username: username
                    },
                    success: function (res) {
                        $('#users-form-usercode').val(res.rows);
                    },
                    error: function (message) {
                        $.messager.alert('错误', message, 'warning');
                    }
                });
            }
        });
    }
    /*界面初始化*/
    init = function (container) {
        var $container = $(container);
        company.showComboTree('#users-company');
        $container.datagrid({
            columns: [[
                {
                    field: 'usercode',
                    title: '登录账号'
                }, {
                    field: 'username',
                    title: '用户姓名'
                }, {
                    field: 'companyname',
                    title: '公司及部门'
                }, {
                    field: 'contactphone',
                    title: '联系电话'
                }, {
                    field: 'rolename',
                    title: '角色'
                }
            ]],
            fit: true,
            rownumbers: true,
            singleSelect: true,
            border: false,
            toolbar: '#users-toolbar',
            idField: 'usercode',
            onRowContextMenu: function (e, index, row) {
                $(this).datagrid('selectRow', index);
                $('#users-grid-contextmenu').menu('show', {
                    left: e.pageX,
                    top: e.pageY,
                    onClick: function (item) {
                        showUpdate({
                            action: 'edit',
                            usercode: row.usercode
                        }, function (userdata) {
                            doUpdate(userdata);
                        });
                    }
                });
                e.preventDefault();
            },
            url: Utility.serverUrl + 'users/getlist',
            queryParams: getFilter()
        });
        //绑定事件
        /*新增用户*/
        $('#users-btnadd').linkbutton( {
            disabled:login.getLocalUser().usercode!='admin'&&!policy.checkpolicy({
                policyno: 'users-allowaddnew',
                policyname: '新增用户',
                groupname:'用户资料维护'
            }),
            onClick: function () {
                showUpdate({
                    action: 'addnew'
                }, function (data) {
                    doUpdate(data);
                });
            }
        });
        /*修改用户*/
        $('#users-btnedit').linkbutton({
            disabled: login.getLocalUser().usercode != 'admin' && !policy.checkpolicy({
                policyno: 'users-allowedit',
                policyname: '修改用户',
                groupname: '用户资料维护'
            }),
            onClick: function () {
                var row = $container.datagrid('getSelected');
                if (!row) return false;
                showUpdate({
                    action: 'edit',
                    usercode: row.usercode
                }, function (data) {
                    doUpdate(data);
                });
            }
        });
        /*删除用户*/
        $('#users-btnremove').linkbutton({
            disabled: login.getLocalUser().usercode != 'admin' && !policy.checkpolicy({
                policyno: 'users-allowremove',
                policyname: '删除用户',
                groupname:'用户资料维护'
            }),
            onClick: function () {
                var row = $container.datagrid('getSelected');
                if (!row) return false;
                $.messager.confirm('警告', '是否确认删除此用户信息?!', function (r) {
                    if (r) {
                        doUpdate({
                            action: 'remove',
                            usercode: row.usercode
                        })
                    }
                });
            }
        })
        /*搜索*/
        $('#users-btnsearch').on('click', function (e) {
            e.preventDefault();
            reloadGrid();
        });
    }
    /*获取筛选*/
    getFilter = function () {
        return {
            key: $('#users-key').val(),
            companyid: $('#users-company').combotree('getValue')
        };
    }
    /*根据用户usercode获取*/
    getDataByUserCode = function (usercode) {
        var data = Utility.getData({
            path: 'users/get',
            data: {
                usercode: usercode
            }
        });
        return !data ? null : data.rows;
    }
    exports.init = init;
});