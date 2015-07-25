define(function (require, exports, module) {
    var
        policy,
        belong,
        login,
        getFilter,
        showUpdate,
        doSubmit,
        showAddDevice,
        fileexport,
        view,
        init;
    belong = require('app/app.belong');
    fileexport = require('app/app.export');
    policy = require('app/app.policy');
    login = require('app/app.login');
    view= require('app/app.device.view');
    //#region/*初始化grid*/
    init = function (container) {
        //显示单位信息
        belong.showCombo('#assettransfer-from');
        if (!policy.checkpolicy({
            policyno: 'assettransfer-allowviewother',
            policyname: '允许查看其他公司资产转移明细',
            groupname: '设备资产转移'
        })) {
            $('#assettransfer-from').combobox('disable');
        }
        belong.showCombo('#assettransfer-to');
        //设置默认的公司
        $('#assettransfer-from').combobox('setValue', login.getLocalUser().companyid);
        //显示主数据信息
        $(container).datagrid({
            columns: [[{
                field: 'deviceno',
                title: '设备型号'
            }, {
                field: 'categoryname',
                title:'设备类别'
            }, {
                field: 'assetno',
                title:'资产编码'
            }, {
                field: 'deviceusername',
                title:'设备使用人'
            }, {
                field: 'statusname',
                title:'审核状态'
            },{
                field: 'fromcompanyname',
                title: '转出单位',
            }, {
                field: 'tocompanyname',
                title: '转入单位',
            }, {
                field: 'createddate',
                title: '提交时间',
            }, {
                field: 'status',
                title: '状态',
            }]],
            idField: 'id',
            rownumbers: true,
            singleSelect: true,
            border: false,
            pagination: true,
            toolbar: '#assettransfer-toolbar',
            fit: true,
            striped: true,
            onRowContextMenu: function (e, rowIndex, rowData) {
                $(container).datagrid('selectRow', rowIndex);
                $('#assettransfer-grid-contextmenu').menu("show", {
                    left: e.pageX,
                    top: e.pageY,
                    onClick: function (item) {
                        if (item.name == 'showDeviceInfo') {
                            view.showInfo({
                                deviceids: [rowData.deviceid]
                            });
                        }
                    }
                });
                e.preventDefault();
            },
            url: Utility.serverUrl + 'AuditAssetTransfer/getlist',
            queryParams: getFilter()
        });
        //#endregion
        /*绑定事件*/
        /*新增资产转移*/
        $('#assettransfer-btnadd').linkbutton({
            disabled: !policy.checkpolicy({
                policyno: 'assettransfer-allowaddnew',
                policyname: '新增资产转移申请',
                groupname: '设备资产转移'
            }),
            onClick: function () {
                showUpdate({
                    action: 'addnew'
                }, function (data) {
                    doSubmit(data);
                });
            }
        });
        /*导出*/
        $('#assettransfer-btnexport').linkbutton({
            onClick: function () {
                Utility.saveData({
                    path: 'auditassettransfer/exportfile',
                    params: getFilter(),
                    success: function (res) {
                        fileexport.showDialog({
                            title: '设备资产转移审核清单',
                            rows: res.rows
                        });
                    },
                    error: function (message) {
                        $.messager.alert('错误', message, 'warning');
                    }
                })
            }
        })
        /*搜索*/
        $('#assettransfer-btnsearch').linkbutton({
            onClick: function () {
                $(container).datagrid('reload');
            }
        });
    }
    /*获取筛选值*/
    getFilter = function () {
        return {
            key: $('#assettransfer-key').val(),
            fromcompanyid: $('#assettransfer-from').combobox('getValue'),
            tocompanyid: $('#assettransfer-to').combobox('getValue')
        };
    }
    /*资产转移设置
     * options:
     *  action:'addnew'
     *  callback:回调
     */
    showUpdate = function (options, callback) {
        var tpl = require('tpl/assettransfer/form.html');
        var container = '#assettransfer-form';
        var grid = container + '-grid';
        var output = Mustache.render(tpl, options);
        $(output).dialog({
            title: options.action == 'addnew' ? '新增资产转移申请' : '修改资产转移申请',
            modal: true,
            width: 600,
            height: 300,
            onOpen: function () {
                $.parser.parse(container);
                $(grid).datagrid({
                    columns: [[
                        {
                            field: 'deviceno',
                            title: '设备型号',
                            width:120
                        }, {
                            field: 'assetno',
                            title: '资产编码',
                            width:120
                        }, {
                            field: 'categoryname',
                            title: '设备类型',
                            width:120
                        }, {
                            field: 'username',
                            title: '设备使用人',
                            width:100
                        }, {
                            field: 'assetpropertyname',
                            title: '资产属性',
                            width:100
                        }, {
                            field: 'useaddress',
                            title: '使用地点',
                            width:180
                        }, {
                            field: 'tocompanyname',
                            title: '转移公司',
                            width:120
                        }
                    ]],
                    fit: true,
                    border: false,
                    singleSelect: true,
                    toolbar: [
                        {
                            iconCls: 'icon-newadd',
                            text: '新增转移设备',
                            handler: function () {
                                showAddDevice().done(function (row) {
                                    $(grid).datagrid('insertRow', {
                                        index: 0,
                                        row: row
                                    });
                                });
                            }
                        }, {
                            iconCls: 'icon-newremove',
                            text: '移除转移设备',
                            handler: function () {
                                var row = $(grid).datagrid('getSelected');
                                if (!row) return false;
                                var index = $(grid).datagrid('getRowIndex', row);
                                $(grid).datagrid('deleteRow', index);
                            }
                        }, {
                            iconCls: 'icon-submit',
                            text: '提交审核信息',
                            handler: function () {
                                var rows = $(grid).datagrid('getRows');
                                //try {
                                    if (rows.length <= 0)
                                        throw new Error('你还未提交任何数据');
                                    var deviceids = [];
                                    var tocompanyid = {};
                                    $.each(rows, function (index, row) {
                                        deviceids.push(row.deviceid);
                                        tocompanyid = row.tocompanyid;
                                    });
                                    doSubmit({
                                        deviceids: deviceids,
                                        creatorid: login.getLocalUser().usercode,
                                        fromcompanyid: login.getLocalUser().companyid,
                                        tocompanyid: tocompanyid
                                    }).done(function () {
                                        $(container).dialog('close');
                                    });
                                //} catch (e) {
                                //    $.messager.alert('警告', e.message, 'warning');
                                //}
                            }
                        }
                    ]
                })
            },
            onClose: function () {
                $(container).dialog('destroy', true);
            }
        })
    }
    /*新增转移设备
     * 
     */
    showAddDevice = function () {
        var deferred = $.Deferred();
        var tpl = require('tpl/assettransfer/add.html');
        var container = '#assettransfer-add';
        $(tpl).dialog({
            modal: true,
            title: '新增转移设备',
            width: 500,
            height: 200,
            onOpen: function () {
                $.parser.parse(container);
                view.showComboGrid(container + '-device');
                belong.showCombo(container + '-tocompany');
            },
            onClose: function () {
                $(container).dialog('destroy', true);
            }
        });
        $(container + '-btnadd').linkbutton({
            onClick: function () {
                var data = {
                    deviceid: $(container + '-device').combogrid('getValue'),
                    tocompanyid: $(container + '-tocompany').combobox('getValue'),
                    tocompanyname: $(container + '-tocompany').combobox('getText'),
                };
                try {
                    if (!data.deviceid)
                        throw new Error('必须选择设备');
                    var devicedata = view.getDataById(data.deviceid);
                    if (!devicedata)
                        throw new Error('该设备记录并不存在');
                    if (!data.tocompanyid)
                        throw new Error('必须选择设备转移公司');
                    if (data.tocompanyid == login.getLocalUser().companyid)
                        throw new Error('资产转移的公司不能为自己所属的公司');
                    data = $.extend(data, {
                        creatorid: login.getLocalUser().usercode,
                        fromcompanyid: login.getLocalUser().companyid
                    }, devicedata);
                    deferred.resolve(data);
                    $(container).dialog('close');
                } catch (e) {
                    $.messager.alert('警告', e.message, 'warning');
                    return false;
                }
               
            }
        });
        return deferred.promise();
    }
    /*提交审核
     * options:
     *  creatorid
     *  fromcompanyid
     *  tocompanyid
     *  deviceids:deviceid数组
     */
    doSubmit = function (options) {
        return Utility.saveData({
            path: 'auditassettransfer/submit',
            params: options,
            success: function (res) {
                $.messager.alert('成功', res.message, 'info');
                if (callback)
                    callbak();
            },
            error: function (message) {
                $.messager.alert('错误', message, 'warning');
            }
        });
    }
    exports.init = init;
});