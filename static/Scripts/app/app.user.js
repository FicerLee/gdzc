define(function (require, exports, module) {
    var
        init,
        $container,
        getDataByUserCode,
        showChangepassword,
        doChangepassword,
        showModifyprofile,
        refreshUserInfo,
        login;
    login = require('app/app.login');
    /*刷新用户面板数据*/
    refreshUserInfo = function () {
        var userdata = login.getLocalUser();
        var tpl = require('tpl/userinfo/userinfo.html');
        var output = Mustache.render(tpl, userdata);
        $('#home-userinfo').html(output);
        //绑定事件
        /*登陆*/
        $('#user-login').on('click', function (e) {
            e.preventDefault();
            login.showDialog();
        });
        /*退出登陆*/
        $('#user-logout').on('click', function (e) {
            e.preventDefault();
            login.logOut();
        });
    }
    getDataByUsercode = function () {
        var userdata = login.getLocalUser();
        var data = {};
        $.ajax({
            async:false,
            beforeSend: function (xhr) {
                $.messager.progress({
                    text: '正从服务器获取用户信息,请稍候...'
                });
            },
            type: 'post',
            dataType:'json',
            url: Utility.serverUrl + 'users/get',
            data: {
                usercode:userdata.usercode
            },
            success: function (res ,ts, jqXHR) {
                data = res.rows;
            },
            complete: function (xhr, ts) {
                $.messager.progress('close');
            }
        });
        return data;
    }
    init = function (container) {
        $container = $(container);
        refreshUserInfo();

    };
    /*修改密码*/
    showChangepassword = function (container) {
        var $container = $(container);
        $.parser.parse(container);
        $container.panel({
            width: 500,
            height:220,
            title: '修改密码',
            closable: false,
            method: 'get',
            cls: 'changepasswordpanel'
        });
        /*修改密码*/
        $('#btnchangepassword').on('click', function (e) {
            e.preventDefault();
            var password = $('#originalpwd').val();
            var newpassword = $('#newpwd').val();
            var confirmpassword = $('#confirmpwd').val();
            try {
                if (!password || password.length <= 0)
                    throw new Error('请输入原始密码');
                if(!newpassword || newpassword.length <= 0)
                    throw new Error('请输入原始密码');
                if(!newpassword || newpassword.length <= 0)
                    throw new Error('请输入新密码');
                if(newpassword !== confirmpassword)
                    throw new Error('新密码和确认密码不一致，请重新输入');
            } catch (ex) {
                $.messager.alert('错误', ex.message, 'warning');
                return false;
            }
            var data = {
                oldpassword: Utility.crypto(password),
                newpassword: Utility.crypto(newpassword),
                usercode:login.getLocalUser().usercode
            }
           
            Utility.saveData({
                path: 'users/changepassword',
                params: data,
                success: function (res) {
                    $.messager.alert('成功', '密码已成功更新，请在下次登陆时输入新密码', 'info');
                    $('#btnchangepassword').linkbutton('disable');
                },
                error: function (message) {
                    $.messager.alert('错误', message, 'error');
                }
            })
        });
    }
    showModifyprofile = function (container) {
        var tpl = require('tpl/profile/profile-form.html');
        require('tpl/profile/profile-form.css');
        //获取用户个人信息
        var data = getDataByUsercode();
        var output = Mustache.render(tpl, data);
        $(container).panel({
            width: 500,
            height: 220,
            title: '修改用户资料',
            content: output,
            cls:'profile-panel'
        });
        /*绑定修改用户个人信息*/
        $('#profile-btnsave').on('click', function (e) {
            e.preventDefault();
            var data = {
                usercode:login.getLocalUser().usercode,
                userpass: $('#profile-pwd').val(),
                username: $('#profile-username').val(),
                contactphone: $('#profile-contact').val(),
                action: 'edit',
                companyid: login.getLocalUser().companyid,
                statusid: login.getLocalUser().statusid,
                roleid:login.getLocalUser().roleid
            };
            Utility.saveData({
                path: 'users/update',
                params: data,
                success: function (res) {
                    $.messager.alert('成功', '用户信息已成功更新', 'info');
                    $('#profile_btnsave').linkbutton('disable');
                },
                error: function (message) {
                    $.messager.alert('失败', message, 'error');
                }
            })
        });
    }
    //绑定事件

    
    exports.showChangepassword = showChangepassword;
    exports.showModifyprofile = showModifyprofile;
    exports.init = init;
    exports.refreshUserInfo = refreshUserInfo;
});