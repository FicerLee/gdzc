define(function (require, exports, module) {
    var
        $container,
        company,
        login,
        device,
        deviceuser,
        category,
        workproperty,
        getFilter,
        showUpdate,
        doSubmit,
        getDataById,
        doSearch,
        policy,
        fileexport,
        init;
    login = require('app/app.login');
    device = require('app/app.device');
    deviceuser = require('app/app.deviceuser');
    company = require('app/app.company');
    category = require('app/app.devicecategory');
    workproperty = require('app/app.workproperty');
    fileexport=require('app/app.export');
    policy=require('app/app.policy');
    getDataById=function(id){
        var data=Utility.getData({
            path:'AuditReceiveUser/get',
            params:{
                id:id
            }
        });
        return data!=null?null:data.rows;
    };
    doSearch = function () {
        $container.datagrid('reload', getFilter());
    };
    /*新增领用*/
    showUpdate = function () {
        var tpl = require('tpl/devicereceive/devicereceive-form.html');
        require('tpl/devicereceive/devicereceive-form.css');
        var formContainer = '#devicereceive-form';
        $(tpl).dialog({
            title: '新增设备领用',
            modal: true,
            width: 500,
            height: 200,
            onOpen: function () {
                $.parser.parse(formContainer);
                device.showComboGrid('#devicereceive-form-device',{
                    queryParams:{
                        statusname:'闲置可用'
                    }
                });
                deviceuser.showComboGrid('#devicereceive-form-user');
            },
            onClose: function () {
                $(formContainer).dialog('destroy', true);
            }
        });
        /*绑定事件*/
        //提交审核
        $('#devicereceive-form-btnsubmit').on('click', function (e) {
            e.preventDefault();
            var data = {
                deviceid: $('#devicereceive-form-device').combogrid('getValue') || null,
                deviceuserid: $('#devicereceive-form-user').combogrid('getValue') || null,
                useaddress: $('#devicereceive-form-useaddress').val()
            };
            if (!data.deviceid || !data.deviceuserid) {
                $.messager.alert('错误', '请选择设备和设备使用人', 'error');
                return false;
            }
            doSubmit(data);
        });
    };
    doSubmit = function (data) {
        Utility.saveData({
            path: 'auditreceiveuser/submit',
            params: data,
            success: function (res) {
                $.messager.alert('成功', '该设备领用信息已成功提交', 'info');
            },
            error: function (res) {
                $.messager.alert('失败', res.message, 'error');
            }
        })
    };
    getFilter = function () {
        return {
            key: $('#devicereceive-key').val(),
            categoryid: $('#devicereceive-category').combotree('getValue') || null,
            workpropertyid: $('#devicereceive-workproperty').combobox('getValue') || null,
            companyid: $('#devicereceive-company').combotree('getValue') || null
        };
    };
    /*界面初始化*/
    init = function (container) {
        $container = $(container);
        //显示单位信息
        company.showComboTree('#devicereceive-company');
        //显示设备类型
        category.showComboTree('#devicereceive-category');
        //显示用工性质
        workproperty.showCombo('#devicereceive-workproperty');
        //显示主数据信息
        $($container).datagrid({
            columns: [[{
                field: 'id',
                checkbox: true
            }, {
                field: 'usename',
                title: '领用人',
                width: 60,
                sortable: true
            }, {
                field: 'deviceno',
                title: '设备型号',
                width: 160,
                sortable: true
            }, {
                field: 'postproperty',
                title: '岗位属性',
                width: 120,
                sortable: true
            }, {
                field: 'workproperty',
                title: '用工性质',
                width: 60,
                sortable: true
            }, {
                field: 'companyname',
                title: '领用单位',
                width: 250
            }, {
                field: 'categoryname',
                title: '设备类型',
                width: 120
            }, {
                field: 'createddate',
                title: '领用时间',
                width: 120
            }, {
                field: 'status',
                title: '当前状态',
                width:120
            }]],
            idField: 'id',
            rownumbers: true,
            singleSelect:false,
            fitColumns:false,
            border: false,
            pagination: true,
            toolbar: '#devicereceive-toolbar',
            fit: true,
            striped: true,
            onRowContextMenu: function (e, rowIndex, rowData) {
                $container.datagrid('selectRow', rowIndex);
                $('#devicereceive-grid-contextmenu').menu('show', {
                    left: e.pageX,
                    top: e.pageY,
                    onClick: function (item) {
                        switch (item.name) {
                            case 'devicereceive-showDeviceInfo':
                                var deviceid = rowData.deviceid;
                                if (!deviceid) return false;
                                device.showDeviceInfo(deviceid);
                                break;
                            case 'devicereceive-showUserInfo':
                                var userid = rowData.deviceuserid;
                                if (!userid) return false;
                                deviceuser.showUserInfo(userid);
                                break;
                            default:
                                break;
                        }
                    }
                });
                e.preventDefault();
            },
            url: Utility.serverUrl + 'auditreceiveuser/getlist',
            queryParams:getFilter()
        });
        /*绑定事件*/
        /*新增领用*/
        $('#devicereceive-btnadd').linkbutton({
            disabled: !policy.checkpolicy({
                policyno: 'device-allowusedevice',
                policyname: '设备领用',
                groupname: '设备资料维护'
            }),
            onClick: function () {
                showUpdate();
            }
        });
        $('#devicereceive-btnexport').linkbutton({
            disabled: !policy.checkpolicy({
                policyno: 'device-allowreceiveexport',
                policyname: '设备领用记录导出',
                groupname: '设备资料维护'
            }),
            onClick: function () {
                var fields=$(container).datagrid('getColumnFields');
                var columns={};
                $.each(fields,function(index,value){
                    var option=$(container).datagrid('getColumnOption',value);
                    columns[option.field]=option.title;
                });
                Utility.saveData({
                    path:'auditreceiveuser/exportfile',
                    parmams: $.extend(getFilter(),{
                        columns:columns
                    }),
                    success:function(res){
                        fileexport.showDialog({
                            title:'设备领用记录导出',
                            rows:res.rows
                        });
                    },
                    error:function(message){
                        $.messager.alert('错误',message,'warning');
                    }
                })
            }
        });
        /*搜索*/
        $('#devicereceive-btnsearch').on('click', function (e) {
            e.preventDefault();
            doSearch();
        });
    };
    exports.init = init;
});