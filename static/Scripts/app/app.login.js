define(function (require, exports, module) {
    var
        isLogined,
        showDialog,
        policy,
        user,
        logOut,
        closeDialog,
        container = '<div id="user-login"></div>',
        $container = $(container),
        doLogin,
        doReset,
        doLogout,
        getLocalUser,
        checkpolicy,
        rememberLoginInfo,
        init;
    policy = require('app/app.policy');
    user = require('app/app.user');
    logOut = function () {
        $.messager.confirm('确认', '是否确定要退出系统', function (r) {
            if (r) {
                doLogout(function () {
                    init();
                });
            }
        });
    }
    /*退出系统
     * callback:回调
     */
    doLogout = function (callback) {
        Cookies.remove('user');
        Cookies.remove('remember');
        if (callback)
            callback();
    }
    isLogined = Cookies.getJSON('user') && Cookies.getJSON('user').islogin;
    getLocalUser = function () {
        var data = Cookies.getJSON('user');
        return data;
    }
    init= function () {
        if ($($container).length <= 0) {
            $(body).append(container);
        }
        this.$container = $container;
        if (!isLogined) {
            /*判断Cookie中是否存有r*/
            var remember = Cookies.getJSON('remember');
            if (remember && remember.usercode && remember.userpass) {
                doLogin(remember, function (r) {
                    if (!r)
                        showDialog();
                });
            }else
                showDialog();
        }
        user.refreshUserInfo();
    };
    showDialog = function () {
        $($container).dialog({
            title: '系统登录',
            width: 400,
            height: 220,
            closed: false,
            closable:false,
            cache: false,
            href: 'htmls/userlogin.html',
            modal: true,
            buttons: [
                {
                    text: '登录',
                    iconCls: 'icon-login',
                    handler: function () {
                        var data = {
                            usercode: $('#login-usercode').val(),
                            userpass: $('#login-userpass').val(),
                            rememberusercode: $('#login-rememberusercode').is(':checked'),
                            rememberuserpass: $('#login-rememberuserpass').is(':checked')
                        };
                        try {
                            if (!data.usercode||!data.userpass)
                                throw new Error('用户名或者密码不能为空');
                            data.userpass = Utility.crypto(data.userpass);
                        } catch (e) {
                            $.messager.alert('错误', e.message, 'warning');
                            return false;
                        }
                        doLogin(data, function (r) {
                            user.refreshUserInfo();
                        });
                    }
                }, {
                    text: '重置',
                    iconCls: 'icon-reset',
                    handler: function () {
                        doReset()
                    }
                }
            ],
            onOpen: function () {
                $.parser.parse($container);
                /*判断*/
                var r = Cookies.set('remember');
                r = r || {};
                if (r.usercode) {
                    $('#login-rememberusercode').prop('checked', true);
                    $('#login-usercode').val(r.usercode);
                }
                if (r.userpass) {
                    $('#login-rememberuserpass').prop('checked', true);
                    //$('#login-userpass').val(r.userpass);
                }
            },
            onClose: function () {
                $($container).dialog('destroy', true);
            }
        });
    };
    closeDialog = function () {
        if($($container))
            $($container).dialog('close');
    };
    /*登陆
     * options
     *   usercode:用户名
     *   userpass:用户密码,
     *   rememberusercode:记住用户名
     *   rememberuserpass:记住密码
     * callback:
     *   success:成功或者失败
     */
    doLogin = function (options, callback) {
        $.ajax({
            async:false,
            beforeSend:function(xhr){
                $.messager.progress({
                    text: '正在登陆,请稍候...'
                });
            },
            url:Utility.serverUrl+'users/checkauth',
            dataType: 'json',
            data:options,
            type: 'post',
            success: function (res,ts) {
                if (res.success) {
                    Cookies.set('user',res.rows);
                    closeDialog();
                    if (options.rememberusercode)
                        rememberLoginInfo({
                            usercode:options.usercode
                        });
                    if (options.rememberuserpass)
                        rememberLoginInfo({
                            userpass:options.userpass
                        });
                    if (callback)
                        callback(true);
                } else {
                    $.messager.alert('失败', '登陆失败:'+res.message, 'error');
                }
            },
            error: function (xhr, ts) {
                $.messager.alert('失败', '登陆失败', 'error');
            },
            complete: function (xhr,ts) {
                $.messager.progress('close');
            }
        })
    };
    /*重置用户名和密码*/
    doReset = function () {
        $('#login-usercode').val('');
        $('#login-userpass').val('');
    };
    /*权限判断
     * options:权限属性,
     *   policyno:'权限标识符',
     *   policyname:'权限名称',
     *   groupname:'分组名称'
     * callback:回调函数
     */
    checkpolicy = function (options) {
        try {
            var isAuth = false;
           // console.log('权限'+options);
            var data = getLocalUser();
            if(!data)return isAuth;
            var policies = data.policies;
            policies = policies || [];
            /*检查是否含有此属性*/
            var policyno = options.policyno;
            $.each(policies, function (i, value) {
                if (value == policyno) {
                    isAuth = true;
                    return false;
                }
            });
            // console.log('isAuth=' + isAuth);
            if (!isAuth) {
                /*检查数据库中是否含有此权限*/
                var _data = policy.getDataByNo(options.policyno);
                if (!_data) {
                    policy.doUpdate(jQuery.extend({}, options, {
                        action: 'addnew'
                    }));
                }
            }
            return isAuth;
        } catch (e) {
            $.messager.alert('错误', e.message, 'warning');
        };
        
    }
    /*记住用户名或者密码保存到Cookie中
     * options
     *  usercode
     *  userpass
     */
    rememberLoginInfo = function (options) {
        if (!options) return false;
        var r = Cookies.getJSON('remember');
        r = r || {};
        if (options.usercode)
            r.usercode = options.usercode;
        if (options.userpass)
            r.userpass = options.userpass;
        Cookies.set('remember', $.extend(options, r), {
            expires:7
        });
    }
    exports.init = init;
    exports.isLogined = isLogined;
    exports.showDialog = showDialog;
    exports.closeDialog = closeDialog;
    exports.getLocalUser = getLocalUser;
    exports.logOut = logOut;
    exports.checkpolicy = checkpolicy;
});