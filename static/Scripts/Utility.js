var Utility = (function () {
    var
        serverUrl,
        getData,
        formatDate,
        getUrlParam,
        getUserCode,
        pageList,
        crypto,
        auditstatusStyle,
        saveData;
    serverUrl = 'http://lgps.dfac.com/GdzcService/api/';
    pageList = [30, 40, 50];
    formatDate = function (value) {
        if (!value) return '';
        var date = Date.parse(value);
        if (date == null) {
            //去掉.
            value = value.substr(0, value.indexOf('.'));
            date = Date.parse(value);
        }
        return date.toString('yyyy-MM-dd HH:mm:ss');
    }
    auditstatusStyle = function (value) {
        if (value == '审核通过') {
            return {
                class: 'text-pass'
            };
        } else if (value == '审核退回') {
            return {
                class: 'text-reject'
            };
        } else if (value == '提交审核') {
            return {
                class: 'text-new'
            };
        };
    }
    getUrlParam = function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]); return null;
    };
    getData = function (args) {
        var data = null;
        $.ajax({
            url: serverUrl + args.path,
            data: args.data,
            type: 'POST',
            dataType: 'json',
            async: false,
            beforeSend: function (xhr) {
                $.messager.progress({
                    msg: '正从服务器获取数据，请稍候...'
                });
            },
            success: function (res, ts, jqXHR) {
                data = res;
            },
            statusCode:{
                401:function(){
                    $.messager.alert('权限错误','此操作未经授权','error');
                }
            },
            complete: function (xhr, ts) {
                $.messager.progress('close');
            }
        });
        return data;
    }
    saveData = function (data) {
        $.ajax({
            async: false,
            url: serverUrl + data.path,
            data: data.params,
            type: 'post',
            dataType: 'json',
            beforeSend: function () {
                $.messager.progress({
                    msg: '正在更新服务器，请稍候...'
                });
            },
            complete: function () {
                $.messager.progress('close');
            },
            success: function (res) {
                if (res.success && data.success) {
                    data.success(res);
                } else {
                    if (data.error)
                        data.error(res.message);
                }
            },
            statusCode: {
                401: function () {
                    $.messager.alert('权限错误', '此操作未经授权', 'error');
                }
            },
            error: function () {
                $.messager.alert('错误', '数据更新出错', 'error');
            }
        });
    }
    crypto = function (value) {
        return faultylabs.MD5(value);
    }
    return {
        getUrlParam: getUrlParam,
        serverUrl: serverUrl,
        getData: getData,
        formatDate: formatDate,
        saveData: saveData,
        pageList: pageList,
        crypto: crypto,
        auditstatusStyle:auditstatusStyle
    }
})();