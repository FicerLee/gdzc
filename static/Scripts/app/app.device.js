define(function (require, exports, module) {
    var
        deferred,
        $container,
        category,
        company,
        belong,
        deviceimport,
        devicestop,
        view,
        deviceuser,
        assetproperty,
        assetcategory,
        workproperty,
        status,
        postproperty,
        preHandlerDeviceInfo,
        showDeviceUseRecord,
        showDeviceRepairRecord,
        showDeviceUserInfo,
        showDeviceAuditRecord,
        showDeviceAssetPropertyRecord,
        showDeviceAssetTransfer,
        showDeviceNewuser,
        showDeviceInfoByUser,
        showImport,
        showModifyImportData,
        showExport,
        showUpdate,
        closeForm,
        login,
        policy,
        fileexport,
        getDataById,
        reloadGrid,
        getFilter,
        init;
    deferred = $.Deferred();
    login = require('app/app.login');
    policy = require('app/app.policy');
    category = require('app/app.devicecategory');
    company = require('app/app.company');
    assetproperty = require('app/app.assetproperty');
    assetcategory = require('app/app.assetcategory');
    status = require('app/app.devicestatus');
    belong = require('app/app.belong');
    workproperty = require('app/app.workproperty');
    postproperty = require('app/app.postproperty');
    deviceimport = require('app/app.device.import');
    fileexport = require('app/app.export');
    view = require('app/app.device.view');
    devicestop = require('app/app.devicestop');
    deviceuser = require('app/app.deviceuser');

    /*通过设备使用人Id获取设备Id*/
    showDeviceInfoByUser = function (userid) {
        //获取设备信息
        var data = getDataByQueryParams({
            userid: userid,
            key: ''
        });
        if (!data || data.length == 0) return false;
        for (var i = 0; i < data.length; i++) {
            data[0] = preHandlerDeviceInfo(data[0]);
        }
        var tpl = require('tpl/device/device-views.html');
        require('tpl/device/device-views.css');
        var output = Mustache.render(tpl, {
            rows: data
        });
        $(output).dialog({
            title: '查看设备明细',
            modal: true,
            width: 800,
            height: 350,
            onOpen: function () {
                $.parser.parse('#device-views');
            },
            onClose: function () {
                $('#device-views').dialog('destroy', true);
            }
        })

    }
    /*查看设备使用记录*/
    showDeviceUseRecord = function (id) {

    }
    /*查看设备修理记录*/
    showDeviceRepairRecord = function (id) {
        require.async('app/app.devicerepair', function (repair) {
            repair.showRepairInfo(id);
        });
    }
    /*查看设备使用人信息*/
    showDeviceUserInfo = function (id) {
        require.async('app/app.deviceuser', function (user) {
            user.showUserInfo(id);
        })
    }
    /*查看设备审核记录*/
    showDeviceAuditRecord = function (id) {
        require.async('app/app.deviceaudit', function (audit) {
            audit.showDeviceAuditRecord(id);
        });
    }
    /*查看设备资产属性变更记录*/
    showDeviceAssetChangeRecord = function (id) {

    }
    /*设备资产转移*/
    showDeviceAssetTransfer = function (id) {

    }
    /*新增设备使用人*/
    showDeviceNewuser = function (id) {
        var data = getDataById(id);
        if (!data) return false;
        var tpl = require('tpl/device/device-newuser.html');
        require('tpl/device/device-newuser.css');
        if (data.statusname != '闲置可用') {
            $.messager.alert('错误', '该设备当前使用状态为[' + data.statusname + '],必须为闲置可用才可赋予使用人', 'error');
            return false;
        }
        var _data = {
            deviceno: data.deviceno,
            assetno: data.assetno,
            assetcategoryname: data.assetcategoryname,
            productno: data.productno,
            leasecontractno: data.leasecontractno,
            assetpropertyname: data.assetpropertyname,
            assetbelongname: data.assetbelongname
        };
        var output = Mustache.render(tpl, _data);
        $(output).dialog({
            modal: true,
            title: '领用设备',
            width: 600,
            height: 240,
            onOpen: function () {
                $.parser.parse('#device-newuser');
                require.async([
                    'app/app.deviceuser'
                ], function (deviceuser) {
                    deviceuser.showComboGrid('#device-newuser-user');
                });
            },
            onClose: function () {
                $('#device-newuser').dialog('destroy', true);
            }
        });
        //绑定事件
        /*提交新增设备使用人*/
        $('#device-newuser-btnsave').on('click', function (e) {
            e.preventDefault();
            var data = {
                id: id,
                deviceuserid: $('#device-newuser-user').combogrid('getValue') || null,
                action: 'edit',
                useaddress: $('#device-newuser-useaddress').val()
            };
            $.ajax({
                url: Utility.serverUrl + 'device/update',
                type: 'post',
                dataType: 'json',
                async: false,
                data: {
                    id: data.id,
                    deviceuserid: data.deviceuserid,
                    action: data.action,
                    useaddress: data.useaddress
                },
                beforeSend: function () {
                    $.messager.progress({
                        text: '正在提交数据库，请稍候...'
                    });
                },
                complete: function () {
                    $.messager.progress('close');
                },
                success: function (res) {
                    if (res.success) {
                        $.messager.alert('成功', '数据已经提交到数据库中', 'info');
                        $('#device-newuser').dialog('close');
                        reloadGrid();

                    } else {
                        $.messager.alert('失败', res.message, 'error');
                    }
                }
            })
        });
    }


    reloadGrid = function () {
        $container.datagrid('reload');
    }

    //#region 根据Id获取设备数据
    getDataById = function (id) {
        var data = Utility.getData({
            path: 'device/get',
            data: {
                id: id
            }
        });
        if (data)
            deferred.resolve(data.rows);
        return deferred.promise();
    }
    //#endregion
    /*显示导出*/
    showExport = function () {
        var data = {};
        var fields = $('#device-grid').datagrid('getColumnFields');
        for (var i = 0; i < fields.length; i++) {
            var field = fields[i];
            var option = $('#device-grid').datagrid('getColumnOption', field);
            var f = option.field;
            var t = option.title;
            if (f == 'id')
                t = '设备编号';
            data[f] = t;
        }
        require.async([
            'tpl/device/device-export.html',
            'tpl/device/device-export.css',
        ], function (tpl) {
            Utility.saveData({
                path: 'device/exportfile',
                params: {
                    columns: data
                },
                success: function (res) {
                    var output = Mustache.render(tpl, res);
                    $(output).dialog({
                        title: '导出设备明细',
                        modal: true,
                        width: 300,
                        height: 100,
                        onOpen: function () {
                            $.parser.parse('#device-export');
                        },
                        onClose: function () {
                            $('#device-export').dialog('destroy', true);
                        }
                    });
                },
                error: function (message) {
                    $.messager.alert('错误', message, 'info');
                }
            })
        });
    }


    //#region 设置设备属性
    showUpdate = function (data) {
        var deferred = $.Deferred();
        var tpl = require('tpl/device/device-form.html');
        var output = Mustache.render(tpl, data);
        var container = '#device-form';
        $(output).dialog({
            width: 680,
            height: 420,
            title: data.action === 'addnew' ? '新增设备' : '修改设备',
            modal: true,
            onOpen: function () {
                /*初始化组件*/
                $.parser.parse(container);
                var deviceusercontainer = container + '-deviceuser';
                var categorycontainer = container + '-category';
                var assetpropertycontainer = container + '-assetproperty';
                var devicestatuscontainer = container + '-status';
                var assetcategorycontainer = container + '-assetcategory';
                var assetbelongcontainer = container + '-assetbelong';
                deviceuser.showComboGrid(deviceusercontainer);
                category.showComboTree(categorycontainer);
                assetproperty.showComboTree(assetpropertycontainer);
                status.showCombo(devicestatuscontainer);
                assetcategory.showCombo(assetcategorycontainer);
                belong.showCombo(assetbelongcontainer);
            },
            onClose: function () {
                $('#device-form').dialog('destroy', true);
            },
            buttons: [
                {
                    iconCls: 'icon-save',
                    text: '提交审核',
                    handler: function () {
                        var _data = {
                            id: data.id,
                            productno: $(container + '-productno').val(),
                            leasecontractno: $(container + '-leasecontractno').val(),
                            useaddress: $(container + '-useaddress').val(),
                            statusid: $(container + '-status').combobox('getValue') || null,
                            assetno: $(container + '-assetno').val(),
                            deviceno: $(container + '-deviceno').val(),
                            categoryid: $(container + '-category').combotree('getValue') || null,
                            categoryname: $(container + '-category').combotree('getText') || null,
                            assetcategoryid: $(container + '-assetcategory').combobox('getValue') || null,
                            assetcategoryname: $(container + '-assetcategory').combobox('getText') || null,
                            assetpropertyid: $(container + '-assetproperty').combotree('getValue') || null,
                            assetpropertyname: $(container + '-assetproperty').combotree('getText') || null,
                            assetbelongid: $(container + '-assetbelong').combobox('getValue') || null,
                            assetbelongname: $(container + '-assetbelong').combobox('getText') || null,
                            deviceuserid: $(container + '-deviceuser').combogrid('getValue') || null,
                            deviceusername: $(container + '-deviceuser').combogrid('getText') || null,
                            createddate: data.createddate,
                            isrepaired: $(container + '-isrepaired').is(':checked'),
                            enabledate: $(container + '-enabledate').datebox('getValue') || null,
                            limityears: $(container + '-limityears').numberbox('getValue') || 5,
                            protectyears: $(container + '-protectyears').numberbox('getValue') || 1,
                            assetoriginalvalue: $(container + '-assetoriginalvalue').numberbox('getValue') || 0,
                            cpu: $(container + '-cpu').val(),
                            memory: $(container + '-memory').val(),
                            harddisk: $(container + '-harddisk').val(),
                            memo: $(container + '-memo').val(),
                            ispublic:$(container+'-ispublic').is(':checked'),
                            action: data.action,
                            creatorid:login.getLocalUser().usercode
                        };
                        try {
                            if (!_data.deviceno)
                                throw new Error('设备型号不能为空');
                            if (!_data.statusid)
                                throw new Error('设备状态不能为空');
                            if (!_data.categoryid)
                                throw new Error('设备类型不能为空');
                            if (!_data.assetcategoryid)
                                throw new Error('资产类型不能为空');
                            if (!_data.enabledate)
                                throw new Error('启用日期不能为空');
                            if (!_data.assetbelongid)
                                throw new Error('资产归属不能为空');
                            var path = _data.action === 'addnew' ? 'auditnewdevice/submit' : 'auditeditdevice/submit';
                            if (_data.action == 'addnew') {
                                Utility.saveData({
                                    path: 'auditnewdevice/submit',
                                    params: _data,
                                    success: function (res) {
                                        $.messager.alert('成功', '该设备信息已成功提交审核', 'info');
                                        $(container).dialog('close');
                                        deferred.resolve();
                                    },
                                    error: function (message) {
                                        $.messager.alert('错误', message, 'error');
                                    }
                                });
                            } else if (_data.action == 'edit') {
                                Utility.saveData({
                                    path: 'auditeditdevice/submit',
                                    params:{
                                        deviceid: data.id,
                                        values: _data,
                                        creatorid:login.getLocalUser().usercode
                                    },
                                    success: function (res) {
                                        $.messager.alert('成功', '该设备信息已成功提交审核', 'info');
                                        $(container).dialog('close');
                                        deferred.resolve();
                                    },
                                    error: function (message) {
                                        $.messager.alert('错误', message, 'error');
                                    }
                                });
                            }

                        } catch (e) {
                            $.messager.alert('警告', e.message, 'warning');
                        }
                    }
                }
            ]
        });

        return deferred.promise();
    }
    //#endregion

    //#region界面初始化
    init = function (container) {
        $container = $(container);
        belong.showCombo('#device-belong');
        category.showComboTree('#device-category');
        assetcategory.showCombo('#device-assetcategory');
        status.showCombo('#device-status');
        //显示数据信息
        $container.datagrid({
            columns: [[{
                field: 'id',
                checkbox: true
            }, {
                field: 'assetno',
                title: '资产编码',
                sortable: true
            }, {
                field: 'deviceno',
                title: '设备型号',
                sortable: true
            }, {
                field: 'categoryname',
                title: '设备类别',
                sortable: true
            }, {
                field: 'assetcategoryname',
                title: '资产类型',
                sortable: true
            }, {
                title: '使用状态',
                field: 'statusname',
                sortable: true
            }, {
                field: 'assetpropertyname',
                title: '资产属性',
                sortable: true
            }, {
                field: 'assetbelongname',
                title: '资产归属',
                sortable: true
            }, {
                field: 'postname',
                title: '岗位名称',
            }, {
                field: 'postpropertyname',
                title: '岗位性质',
            }, {
                field: 'username',
                title: '使用人',
            }, {
                field: 'enabledate',
                title: '启用时间',
                width: 130
            }, {
                field: 'workpropertyname',
                title: '用工性质',
            }, {
                field: 'useaddress',
                title: '使用地点',
            }]],
            idField: 'id',
            rownumbers: true,
            singleSelect: true,
            border: false,
            pageSize: Utility.pageList[0],
            pageList: Utility.pageList,
            pagination: true,
            toolbar: '#device-toolbar',
            fit: true,
            striped: true,
            onRowContextMenu: function (e, rowIndex, rowData) {
                $container.datagrid('selectRow', rowIndex);
                $('#device-grid-contextmenu').menu('show', {
                    left: e.pageX,
                    top: e.pageY,
                    onClick: function (item) {
                        e.preventDefault();
                        if (item.name === 'device-showDeviceinfo') {
                            view.showInfo({
                                deviceids: [rowData.id]
                            }).fail(function (message) {
                                $.messager.alert('警告', message, 'warning');
                            });
                        };
                        if (item.name === 'device-showDeiveUserecord')
                            showDeviceUseRecord(rowData.id);
                        if (item.name === 'device-showRepairrecord')
                            showDeviceRepairRecord(rowData.id);
                        if (item.name === 'device-showUserinfo')
                            showDeviceUserInfo(rowData.id);
                        if (item.name === 'device-showAuditrecord')
                            showDeviceAuditRecord(rowData.id);
                        if (item.name === 'device-showAssetpropertyrecord')
                            showDeviceAssetChangeRecord(rowData.id);
                        if (item.name === 'device-showStopdevice') {
                            devicestop.showUpdate({
                                deviceid: rowData.id
                            });
                        }
                        if (item.name === 'device-showAssettransfer')
                            showDeviceAssetTransfer(rowData.id);
                        if (item.name === 'device-showNewuse')
                            showDeviceNewuser(rowData.id);
                    }
                });

            },
            url: Utility.serverUrl + 'device/getlist',
            queryParams: getFilter()
        });
        //绑定事件
        /*新增设备*/
        $('#device-btnadd').linkbutton({
            disabled: !policy.checkpolicy({
                policyno: 'device-allowaddnew',
                policyname: '新增设备申请',
                groupname: '设备资料维护'
            }),
            onClick: function () {
                showUpdate({
                    action: 'addnew',
                    limityears: 6,
                    protectyears: 1,
                    assetbelongid: login.getLocalUser().companyid,
                    createddate: new Date().toString('yyyy-MM-dd')
                });
            }
        });
        /*修改设备*/
        $('#device-btnedit').linkbutton({
            disabled: !policy.checkpolicy({
                policyno: 'device-allowedit',
                policyname: '修改设备属性申请',
                groupname: '设备资料维护'
            }),
            onClick: function () {
                var row = $container.datagrid('getSelected');
                if (!row) return false;
                getDataById(row.id).done(function (data) {
                    showUpdate($.extend(data, {
                        action: 'edit'
                    }));
                });
            }
        });
        /*删除设备*/
        $('#device-btnremove').linkbutton({
            disabled: !policy.checkpolicy({
                policyno: 'device-allowremove',
                policyname: '删除设备申请',
                groupname: '设备资料维护'
            }),
            onClick: function () {
                var row = $container.datagrid('getSelected');
                if (!row) return false;
                $.messager.confirm('警告', '是否确认删除此设备信息?!', function (r) {
                    if (r) {
                        Utility.saveData({
                            path: 'auditremovedevice/submit',
                            params: {
                                deviceid: row.id,
                                creatorid: login.getLocalUser().usercode,
                            },
                            success: function (res) {
                                $.messager.alert('成功', '该设备已成功提交设备删除申请', 'info');
                            }
                        });
                    }
                });
            }
        });
        /*导入设备*/
        $('#device-btnimport').linkbutton({
            disabled: !policy.checkpolicy({
                policyno: 'device-allowimportfile',
                policyname: '批量导入设备清单',
                groupname: '设备资料维护'
            }),
            onClick: function () {
                deviceimport.showImport();
            }
        });
        /*导出设备*/
        $('#device-btnexport').linkbutton({
            disabled: !policy.checkpolicy({
                policyno: 'device-allowexportfile',
                policyname: '批量导出设备清单',
                groupname: '设备资料维护'
            }),
            onClick: function () {
                var data = {};
                var fields = $('#device-grid').datagrid('getColumnFields');
                for (var i = 0; i < fields.length; i++) {
                    var field = fields[i];
                    var option = $('#device-grid').datagrid('getColumnOption', field);
                    var f = option.field;
                    var t = option.title;
                    if (f == 'id')
                        t = '设备编号';
                    data[f] = t;
                };
                Utility.saveData({
                    path: 'device/exportfile',
                    params: $.extend(getFilter(), {
                        columns: data
                    })
                }).done(function (res) {
                    if (res.success) {
                        fileexport.showDialog({
                            title: '设备资料维护',
                            rows: res.rows
                        });
                    } else {
                        $.messager.alert('警告', res.message, 'warning');
                    }
                });
            }
        });
        /*搜索*/
        $('#device-btnsearch').on('click', function (e) {
            e.preventDefault();
            $container.datagrid('reload');
        });

        //#region检查菜单权限
        if (!policy.checkpolicy({
            policyno: 'device-allowusedevice',
            policyname: '设备领用',
            groupname: '设备资料维护'
        })) {
            var item = $('#device-grid-contextmenu').menu('findItem', '设备领用...');
            if (item && item.target)
                $('#device-grid-contextmenu').menu('disableItem', item.target);
        }
        if (!policy.checkpolicy({
            policyno: 'device-allowassettransfer',
            policyname: '设备资产转移',
            groupname: '设备资料维护'
        })) {
            var item = $('#device-grid-contextmenu').menu('findItem', '设备资产转移...');
            if (item && item.target)
                $('#device-grid-contextmenu').menu('disableItem', item.target);
        }
        if (!policy.checkpolicy({
            policyno: 'device-allowdevicestop',
            policyname: '设备停用',
            groupname: '设备资料维护'
        })) {
            var item = $('#device-grid-contextmenu').menu('findItem', '设备停用...');
            if (item && item.target)
                $('#device-grid-contextmenu').menu('disableItem', item.target);
        }
        //#endregion
    }
    //#endregion

    //#region获取筛选参数
    getFilter = function () {
        return {
            key: $('#device-key').val(),
            assetbelongid: $('#device-belong').combobox('getValue'),
            categoryid: $('#device-category').combotree('getValue'),
            assetcategoryid: $('#device-assetcategory').combobox('getValue'),
            statusid: $('#device-status').combobox('getValue')
        };
    }
    //#endregion

    exports.init = init;
    exports.showDeviceInfoByUser = showDeviceInfoByUser;
    exports.showUpdate = showUpdate;
    exports.getDataById = getDataById;
});