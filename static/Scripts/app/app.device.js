define(function (require, exports, module) {
    var
        $container,
        category,
        company,
        belong,
        assetproperty,
        assetcategory,
        workproperty,
        status,
        postproperty,
        preHandlerDeviceInfo,
        showDeviceInfo,
        showDeviceUseRecord,
        showDeviceRepairRecord,
        showDeviceUserInfo,
        showDeviceAuditRecord,
        showDeviceAssetPropertyRecord,
        showDeviceStop,
        showDeviceAssetTransfer,
        showDeviceNewuser,
        showDeviceInfoByUser,
        showImport,
        showModifyImportData,
        showExport,
        showUpdate,
        showComboGrid,
        closeForm,
        login,
        policy,
        doUpdate,
        getDataById,
        getDataByQueryParams,
        reloadGrid,
        init;
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
    /*显示选择设备的下拉表格
     * options:
     *   queryParams:额外的查询对象
     */
    showComboGrid = function (container, options) {
        var queryParams = {};
        if (options)
            queryParams = options.queryParams;
        $(container).combogrid({
            url: Utility.serverUrl + 'device/getlist',
            delay:500,
            mode: 'remote',
            idField: 'id',
            valueField: 'id',
            textField: 'deviceno',
            columns: [[
                {
                    field: 'assetno',
                    title: '资产编码',
                    width: 80
                }, {
                    field: 'deviceno',
                    title: '设备型号',
                    width: 160,
                }, {
                    field: 'username',
                    title: '设备使用人',
                    width: 80
                }, {
                    field: 'assetpropertyname',
                    title: '资产属性',
                    width: 70
                }, {
                    field: 'assetcategoryname',
                    title: '资产类别',
                    width: 70
                }, {
                    field: 'categoryname',
                    title: '设备类型',
                    width: 80
                }, {
                    field: 'useaddress',
                    title: '使用地点',
                    width: 120
                }
            ]],
            panelMinWidth: 400,
            panelWidth: 'auto',
            panelMinHeight: 80,
            panelHeight: 'auto',
            queryParams: $.extend({
                belongid: login.getLocalUser().companyid,
            },queryParams)
        })
    }
    //对从服务器获取的数据进行预先处理
    preHandlerDeviceInfo = function (data) {
        var _data = {
            //资产型号
            assetno: data.assetno,
            //设备使用人
            username: data.username,
            //所在公司
            companyname: data.companyname,
            //所在部门
            departmentname: data.departmentname,
            //岗位性质
            postpropertyname: data.postpropertyname,
            //员工性质
            workpropertyname: data.workpropertyname,
            //设备类别
            categoryname: data.categoryname,
            //设备型号
            deviceno: data.deviceno,
            //出厂编号
            productno: data.productno,
            //资产类别
            assetcategoryname: data.assetcategoryname,
            //设备状态
            status: data.status,
            //启用日期
            enabledate: Utility.formatDate(data.enabledate),
            //使用年限
            limityears: data.limityears,
            //保期
            protectyears: data.protectyears,
            //租赁合同
            leasecontractno: data.leasecontractno,
            //使用地点
            useaddress: data.useaddress,
            //资产原值
            assetoriginalvalue: data.assetoriginalvalue,
            //资产属性
            assetpropertyname: data.assetpropertyname,
            //资产归属
            assetbelongname: data.assetbelongname,
            //创建人
            createdusername: data.createdusername,
            //创建日期
            createddate: Utility.formatDate(data.createddate),
            cpu: data.cpu,
            memory: data.memory,
            harddisk: data.harddisk,
            //备注
            memo: data.memo
        };
        return _data;
    }
    getDataByQueryParams = function (args) {
        var data = {};
        $.ajax({
            url: Utility.serverUrl + 'device/getlist',
            type: 'post',
            data: args,
            async: false,
            dataType: 'json',
            beforeSend: function () {
                $.messager.progress({
                    text: '正在查询数据，请稍候...'
                });
            },
            complete: function () {
                $.messager.progress('close');
            },
            success: function (res) {
                if (res.success)
                    data = res.rows;
            }
        });
        return data;
    }
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
    /*查看设备信息记录*/
    showDeviceInfo = function (id) {
        var data = getDataById(id);
        if (!data) return false;
        var _data = preHandlerDeviceInfo(data);
        var tpl = require('tpl/device/device-view.html');
        require('tpl/device/device-view.css');
        var output = Mustache.render(tpl, _data);
        $(output).dialog({
            title: '查看设备信息',
            width: 800,
            height: 300,
            modal: true,
            onOpen: function () {
                $.parser.parse('#device-view');
            },
            onClose: function () {
                $('#device-view').dialog('destroy', true);
            }
        });

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
    /*设备停用*/
    showDeviceStop = function (id) {
        var data = getDataById(id);
        if (!data) return false;
        var tpl = require('tpl/device/device-stop.html');
        require('tpl/device/device-stop.css');
        data.auditmemo = '';
        var output = Mustache.render(tpl, data);
        $(output).dialog({
            title: '停用设备',
            modal: true,
            width: 600,
            height: 300,
            onOpen: function () {
                $.parser.parse('#device-stop');
                require.async([
                    'app/app.devicestatus'
                ], function (status) {
                    status.showComboByDeviceStop('#device-stop-status');
                });
            },
            onClose: function () {
                $('#device-stop').dialog('destroy', true);
            }
        })
        //绑定事件
        /*提交停用审核*/
        $('#device-stop-btnsave').on('click', function (e) {
            e.preventDefault();
            $.ajax({
                url: Utility.serverUrl + 'AuditDeviceStop/Update',
                type: 'post',
                dataType: 'json',
                data: {
                    deviceid: data.id,
                    statusid: $('#device-stop-status').combobox('getValue') || 0,
                    memo: $('#device-stop-memo').val(),
                    action: 'addnew',
                    creatorid: (function () {
                        var login = require('app/app.login');
                        return login.getLocalUser().usercode;
                    }())
                },
                beforeSend: function () {
                    $.messager.progress({
                        text: '正在更新数据，请稍候...'
                    });
                },
                success: function (res, ts, jqXHR) {
                    if (res.success) {
                        $.messager.alert('成功', '该设备已提交停用审核', 'info');
                        $('#device-stop').dialog('close');
                        reloadGrid();
                    } else {
                        $.messager.alert('失败', res.message, 'error');
                    }
                },
                complete: function (xhr) {
                    $.messager.progress('close');
                }
            })
        });
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
        if (data.status != '闲置可用') {
            $.messager.alert('错误', '该设备当前使用状态为[' + data.status + '],必须为闲置可用才可赋予使用人', 'error');
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
    getDataById = function (id) {
        var data = {};
        $.ajax({
            async: false,
            type: 'post',
            dataType: 'json',
            url: Utility.serverUrl + 'device/get',
            data: {
                id: id
            },
            beforeSend: function () {
                $.messager.progress({
                    text: '正在查询数据，请稍候...'
                });
            },
            complete: function () {
                $.messager.progress('close');
            },
            success: function (res) {
                if (res.success)
                    data = res.rows;
                else
                    data = null;
            }
        });
        return data;
    }
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
    /*显示更新*/
    showUpdate = function (args) {
        var data = {};
        if (args.action == 'addnew') {
            data = {
                assetno: '',
                deviceno: '',
                categoryid: null,
                assetcategoryid: null,
                statusid: null,
                assetpropertyid: null,
                assetbelongid: null,
                deviceuserid: null,
                createddate: new Date().toString('yyyy-MM-dd HH:mm:ss'),
                productno: '',
                isrepaired: false,
                enabledate: new Date().toString('yyyy-MM-dd'),
                limityears: 5,
                protectyears: 1,
                leasecontractno: '',
                useaddress: '',
                assetoriginalvalue: null,
                cpu: '',
                memory: '',
                harddisk: '',
                memo: '',
                action: 'addnew'
            };
        } else {
            data = getDataById(args.id);
            if (!data || data == null) return false;
            data.action = args.action;
        }
        var tpl = require('tpl/device/device-form.html');
        require('tpl/device/device-form.css');
        var output = Mustache.render(tpl, data);
        $(output).dialog({
            width: 680,
            height: 420,
            title: args.action === 'addnew' ? '新增设备' : '修改设备',
            modal: true,
            onOpen: function () {
                /*初始化组件*/
                $.parser.parse('#device-form');
                var deviceusercontainer = '#device-form-deviceuser';
                var companycontainer = '#device-form-company';
                var categorycontainer = '#device-form-category';
                var assetpropertycontainer = '#device-form-assetproperty';
                var devicestatuscontainer = '#device-form-status';
                var assetcategorycontainer = '#device-form-assetcategory';
                var assetbelongcontainer = '#device-form-assetbelong';
                require.async([
                    'app/app.deviceuser',
                    'app/app.company',
                    'app/app.devicecategory',
                    'app/app.assetproperty',
                    'app/app.devicestatus',
                    'app/app.assetcategory'
                ], function (deviceuser, company, category, assetproperty, status, assetcategory) {
                    deviceuser.showComboGrid(deviceusercontainer);
                    company.showComboTree(companycontainer);
                    category.showComboTree(categorycontainer);
                    assetproperty.showComboTree(assetpropertycontainer);
                    status.showCombo(devicestatuscontainer);
                    assetcategory.showCombo(assetcategorycontainer);
                    company.showComboTree(assetbelongcontainer);
                });
            },
            onClose: function () {
                $('#device-form').dialog('destroy', true);
            }
        })
        //绑定保存
        $('#device-form-btnsave').on('click', function (e) {
            e.preventDefault();
            data = {
                id: args.id,
                productno: $('#device-form-productno').val(),
                leasecontractno: $('#device-form-leasecontractno').val(),
                useaddress: $('#device-form-useaddress').val(),
                statusid: $('#device-form-status').combobox('getValue') || null,
                assetno: $('#device-form-assetno').val(),
                deviceno: $('#device-form-deviceno').val(),
                categoryid: $('#device-form-category').combotree('getValue') || null,
                categoryname: $('#device-form-category').combotree('getText') || null,
                assetcategoryid: $('#device-form-assetcategory').combobox('getValue') || null,
                assetcategoryname: $('#device-form-assetcategory').combobox('getText') || null,
                assetpropertyid: $('#device-form-assetproperty').combotree('getValue') || null,
                assetpropertyname: $('#device-form-assetproperty').combotree('getText') || null,
                assetbelongid: $('#device-form-assetbelong').combotree('getValue') || null,
                assetbelongname: $('#device-form-assetbelong').combotree('getText') || null,
                deviceuserid: $('#device-form-deviceuser').combogrid('getValue') || null,
                deviceusername: $('#device-form-deviceuser').combogrid('getText') || null,
                //createddate: new Date().toString('yyyy-MM-dd HH:mm:ss'),
                isrepaired: $('#device-form-isrepaired').is(':checked'),
                enabledate: $('#device-form-enabledate').datebox('getValue') || null,
                limityears: $('#device-form-limityears').numberbox('getValue') || 5,
                protectyears: $('#device-form-protectyears').numberbox('getValue') || 1,
                assetoriginalvalue: $('#device-form-assetoriginalvalue').numberbox('getValue') || 0,
                cpu: $('#device-form-cpu').val(),
                memory: $('#device-form-memory').val(),
                harddisk: $('#device-form-harddisk').val(),
                memo: $('#device-form-memo').val(),
                action: args.action
            };
            doUpdate(data);
        });
        /*绑定关闭*/
        $('#device-form-btnclose').on('click', function (e) {
            e.preventDefault();
            closeForm();
        });
    }
    /*关闭表单*/
    closeForm = function () {
        $('#device-form').dialog('close');
    }
    /*执行更新*/
    doUpdate = function (data) {
        var path = '';
        var _data = {};
        if (data.action == 'addnew') {
            path = 'auditnewdevice/submit';
            _data = data;
            _data.creatorid = login.getLocalUser().usercode;
        }
        else if (data.action == 'edit') {
            path = 'auditeditdevice/submit';
            _data = {
                deviceid: data.id,
                values: data,
                creatorid: login.getLocalUser().usercode
            };
        }
        else if (data.action == 'remove')
            path = 'auditremovedevice/remove';
        Utility.saveData({
            path: path,
            params: _data,
            success: function (res) {
                $.messager.alert('成功', '该设备信息已成功提交审核', 'info');
                closeForm();
                if ($container)
                    reloadGrid();
            },
            error: function (res) {
                $.messager.alert('失败', res, 'error');
            }
        })
    }
    init = function (container) {
        $container = $(container);
        require.async([
            'app/app.company',
            'app/app.devicecategory',
            'app/app.assetproperty',
            'app/app.workproperty',
            'app/app.postproperty'
        ], function (company, category, assetproperty, workproperty, postproperty) {
            company.showTree('#device-company');
            category.showTree('#device-devicecategory');
            assetproperty.showTree('#device-assetproperty');
            workproperty.showCombo('#device-workproperty');
            postproperty.showComboTree('#device-postproperty');
            //显示数据信息
            $container.datagrid({
                columns: [[{
                    field: 'id',
                    checkbox: true
                }, {
                    field: 'assetno',
                    title: '资产编码',
                    width: 60,
                    sortable: true
                }, {
                    field: 'deviceno',
                    title: '设备型号',
                    width: 60,
                    sortable: true
                }, {
                    field: 'categoryname',
                    title: '设备类别',
                    width: 60,
                    sortable: true
                }, {
                    field: 'assetcategoryname',
                    title: '资产类型',
                    width: 60,
                    sortable: true
                }, {
                    title: '使用状态',
                    field: 'statusname',
                    width: 60,
                    sortable: true
                }, {
                    field: 'assetpropertyname',
                    title: '资产属性',
                    width: 60,
                    sortable: true
                }, {
                    field: 'assetbelongname',
                    title: '资产归属',
                    width: 60,
                    sortable: true
                }, {
                    field: 'postname',
                    title: '岗位名称',
                    width: 100
                }, {
                    field: 'postpropertyname',
                    title: '岗位性质',
                    width: 100
                }, {
                    field: 'username',
                    title: '使用人',
                    width: 100
                }, {
                    field: 'createddate',
                    title: '登记时间',
                    width: 130
                }, {
                    field: 'workpropertyname',
                    title: '用工性质',
                    width: 60
                }, {
                    field: 'useaddress',
                    title: '使用地点',
                    width: 100
                }]],
                idField: 'id',
                rownumbers: true,
                singleSelect: true,
                border: false,
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
                                showDeviceInfo(rowData.id);
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
                            if (item.name === 'device-showStopdevice')
                                showDeviceStop(rowData.id);
                            if (item.name === 'device-showAssettransfer')
                                showDeviceAssetTransfer(rowData.id);
                            if (item.name === 'device-showNewuse')
                                showDeviceNewuser(rowData.id);
                        }
                    });

                },
                url: Utility.serverUrl + 'device/getlist',
                queryParams: {
                    key: $('#device-key').val(),
                    companyid: company.getSelectedIdFromTree('#device-company'),
                    categoryid: category.getSelectedIdFromTree('#device-devicecategory'),
                    assetpropertyid: assetproperty.getSelectedIdFromTree('#device-assetproperty'),
                    workpropertyid: workproperty.getSelectedIdFromCombo('#device-workproperty'),
                    postpropertyid: $('#device-postproperty').combotree('getValue') || 0
                }
            });
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
                    action: 'addnew'
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
                showUpdate({
                    action: 'edit',
                    id: row.id
                })
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
                        doUpdate({
                            id: row.id,
                            action: 'remove'
                        })
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
                showImport();
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
                showExport();
            }
        });
        /*搜索*/
        $('#device-btnsearch').on('click', function (e) {
            e.preventDefault();
            $container.datagrid('load', {
                key: $('#device-key').val(),
                companyid: function () {
                    var node = $('#device-company').tree('getSelected');
                    return node != null ? node.id : 0;
                },
                categoryid: function () {
                    var node = $('#device-devicecategory').tree('getSelected');
                    return node != null ? node.id : 0;
                },
                assetpropertyid: function () {
                    var node = $('#device-assetproperty').tree('getSelected');
                    return node != null ? node.id : 0;
                },
                workpropertyid: $('#device-workproperty').combobox('getValue') || 0,
                postpropertyid: $('#device-postproperty').combotree('getValue') || 0
            });
        });

        /*检查菜单权限*/
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
    }
    /*导入设备信息*/
    showImport = function () {
        var tpl = require('tpl/device/device-import.html');
        require('tpl/device/device-import.css');
        var grid = '#device-import-preview';
        $(tpl).dialog({
            modal: true,
            title: '导入设备明细',
            width: 700,
            height: 400,
            onOpen: function () {
                $.parser.parse('#device-import');
                $(grid).datagrid({
                    columns: [[
                        {
                            field: 'message',
                            title: '导入结果',
                            width:220,
                            align: 'right',
                            styler: function (value, row, index) {
                                if (value == '可以导入')
                                    return {
                                        class: 'text-ok'
                                    };
                                else if(value=='修改导入') {
                                    return {
                                        class: 'text-modify'
                                    };
                                } else {
                                    return {
                                        class: 'text-err'
                                    };
                                }
                            }
                        },
                        {
                            field: 'assetno',
                            title: '资产编码'
                        }, {
                            field: 'deviceno',
                            title: '设备型号'
                        }, {
                            field: 'categoryname',
                            title: '设备类别'
                        }, {
                            field: 'assetcategoryname',
                            title: '资产类型'
                        }, {
                            field: 'assetpropertyname',
                            title: '资产属性'
                        }, {
                            field: 'statusname',
                            title: '使用状态'
                        }, {
                            field: 'assetbelongname',
                            title: '资产归属'
                        }, {
                            field: 'ispublic',
                            title: '公用设备？'
                        }, {
                            field: 'deviceusername',
                            title: '使用人'
                        }, {
                            field: 'companyname',
                            title: '所在公司'
                        }, {
                            field: 'departmentname',
                            title: '所在科室'
                        }, {
                            field: 'postname',
                            title: '岗位名称'
                        }, {
                            field: 'postpropertyname',
                            title: '岗位性质'
                        }, {
                            field: 'workpropertyname',
                            title: '用工性质'
                        }, {
                            field: 'productno',
                            title: '出厂编号'
                        }, {
                            field: 'isrepaired',
                            title: '是否维修？',
                            formatter: function (value) {
                                return value ? '是' : '否';
                            }
                        }, {
                            field: 'enabledate',
                            title: '设备启用日期'
                        }, {
                            field: 'limityears',
                            title: '使用年限'
                        }, {
                            field: 'protectyears',
                            title: '保期'
                        }, {
                            field: 'leasecontractno',
                            title: '租赁合同'
                        }, {
                            field: 'useaddress',
                            title: '使用地点'
                        }
                    ]],
                    singleSelect: true,
                    rownumbers: true,
                    striped: true,
                    border:true,
                    fit: true,
                    onDblClickRow: function (index, row) {
                        //弹出修改对话框
                        showModifyImportData(row, function (data) {
                            $(grid).datagrid('updateRow', {
                                index: index,
                                row: data
                            });
                        })
                    }
                });
            },
            onClose: function () {
                $('#device-import').dialog('destroy', true);
            }
        });
        /*显示绑定*/
        /*点击上传*/
        $('#device-import-file').filebox({
            onChange: function (newValue, oldValue) {
                $('#device-import-form').ajaxSubmit({
                    url: Utility.serverUrl + 'device/importfile',
                    type: 'post',
                    dataType: 'json',
                    beforeSubmit: function () {
                        $.messager.progress({
                            text: '正在解析数据，请稍候...'
                        });
                    },
                    complete: function () {
                        $.messager.progress('close');
                    },
                    success: function (res) {
                        if (res.success) {
                            $('#device-import-preview').datagrid('loadData', res);
                            /*将message传入到message字段中*/
                            var messages = $.parseJSON(res.message) || [];
                            $.each(messages, function (index, value) {
                                $(grid).datagrid('updateRow', {
                                    index: index,
                                    row: {
                                        message: value.message
                                    }
                                });
                            });
                        } else {
                            $.messager.alert('错误', res.message, 'warning');
                        }
                    }
                });
            }
        })
        /*点击保存*/
        $('#device-import-btnsave').on('click', function (e) {
            e.preventDefault();
            var data = $(grid).datagrid('getRows');
            data = data || [];
            try {
                if (data.length <= 0)
                    throw new Error('导入数据为空');
            } catch (ex) {
                $.messager.alert('警告', ex.message, 'warning');
                return false;
            }
            $.each(data, function (index, value) {
                value=$.extend(value,{
                    createduserid:login.getLocalUser().usercode
                });
            });
            Utility.saveData({
                path: 'device/saveimport',
                params: {
                    values:data
                },
                success: function (res) {
                    var messages = $.parseJSON(res.message) || [];
                    if (messages.length <= 0)
                    {
                        $.messager.alert('成功', '数据全部导入成功', 'info');
                        /*关掉导入框*/
                        $('#device-import').dialog('close');
                    } else {
                        $.messager.alert('警告', '存在未导入成功的数据,请修正后再次导入', 'info');
                    }
                    $(grid).datagrid('loadData', res);
                    $.each(messages, function (index, value) {
                        console.log(value);
                        $(grid).datagrid('updateRow', {
                            index: index,
                            row: {
                                message: value.message
                            }
                        });
                    });
                },
                error: function (message) {
                    $.messager.alert('错误', message, 'warning');
                    return false;
                }
            });
        });
    }
    /*对导入的数据做修改
     * row:导入的数据行
     * callback:回调
     */
    showModifyImportData = function (row, callback) {
        var tpl = require('tpl/device/import-edit.html');
        var container = '#import-edit';
        console.log(row);
        var output = Mustache.render(tpl, row);
        $(output).dialog({
            title: '修改导入信息',
            modal: true,
            width: 600,
            height: 400,
            onOpen: function () {
                $.parser.parse(container);
                category.showComboTree(container + '-category');
                belong.showCombo(container + '-company');
                belong.showCombo(container + '-belong');
                assetcategory.showCombo(container + '-assetcategory');
                assetproperty.showComboTree(container + '-assetproperty');
                status.showCombo(container + '-status');
                company.showComboTree(container + '-department', {
                    queryParams: {
                        companyid: login.getLocalUser().companyid
                    }
                });
                workproperty.showCombo(container + '-workproperty');
                postproperty.showComboTree(container + '-postproperty');
            },
            onClose: function () {
                $(container).dialog('destroy', true);
            },
            buttons: [
                {
                    iconCls: 'icon-save',
                    text: '保存结果',
                    handler: function () {
                        var data = {
                            assetno: $(container + '-assetno').val(),
                            deviceno: $(container + '-deviceno').val(),
                            categoryid: $(container + '-category').combotree('getValue'),
                            categoryname: $(container + '-category').combotree('getText'),
                            assetcategoryid: $(container + '-assetcategory').combobox('getValue'),
                            assetcategoryname: $(container + '-assetcategory').combobox('getText'),
                            assetpropertyid: $(container + '-assetproperty').combotree('getValue'),
                            assetpropertyname: $(container + '-assetproperty').combotree('getText'),
                            statusid: $(container + '-status').combobox('getValue'),
                            statusname: $(container + '-status').combobox('getText'),
                            assetbelongid: $(container + '-belong').combobox('getValue'),
                            assetbelongname: $(container + '-belong').combobox('getText'),
                            ispublic: $(container + '-ispublic').is('checked'),
                            isrepaired: $(container + '-isrepaired').is('checked'),
                            deviceusername: $(container + '-deviceuser').val(),
                            companyid: $(container + '-company').combobox('getValue'),
                            companyname: $(container + '-company').combobox('getText'),
                            departmentid: $(container + '-department').combotree('getValue'),
                            departmentname: $(container + '-department').combotree('getText'),
                            enabledate: $(container + '-enabledate').datebox('getValue'),
                            limityears: $(container + '-limityears').numberbox('getValue'),
                            protectyears: $(container + '-protectyears').numberbox('getValue'),
                            leasecontractno: $(container + '-leasecontractno').val(),
                            useaddress: $(container + '-useaddress').val(),
                            originalvalue: $(container + '-originalvalue').val(),
                            cpu: $(container + '-cpu').val(),
                            memory: $(container + '-memory').val(),
                            harddisk: $(container + '-harddisk').val(),
                            productno: $(container + '-productno').val(),
                            memo: $(container + '-memo').val(),
                            message:'修改导入'
                        };
                        $(container).dialog('close');
                        if (callback)
                            return callback(data);
                    }
                }
            ]
        });

    }

    exports.init = init;
    exports.showDeviceInfo = showDeviceInfo;
    exports.showComboGrid = showComboGrid;
    exports.showDeviceInfoByUser = showDeviceInfoByUser;
    exports.showUpdate = showUpdate;
    exports.getDataById = getDataById;
});