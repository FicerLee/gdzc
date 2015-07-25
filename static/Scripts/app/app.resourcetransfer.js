define(function (require, exports, module) {
    var
        $container,
        policy,
        company,
        view,
        category,
        getFilter,
        showUpdate,
        reloadGrid,
        login,
        assetproperty,
        init;
    login = require('app/app.login');
    company = require('app/app.company');
    category = require('app/app.devicecategory');
    policy = require('app/app.policy');
    view = require('app/app.device.view');
    assetproperty = require('app/app.assetproperty');
    init = function (container) {
        $container = $(container);
        //显示单位信息
        company.showComboTree('#resourcetransfer-company');
        //显示设备类型
        category.showComboTree('#resourcetransfer-category');
        //显示主数据信息
        $container.datagrid({
            columns: [[{
                field: 'statusname',
                title: '当前状态',
                width: 80,
                align: 'right',
                styler: function (value) {
                    return Utility.auditstatusStyle(value);
                }
            },
                {
                    field: 'assetno',
                    title: '资产编码',
                    sortable: true
                }, {
                    field: 'deviceno',
                    title: '设备型号',
                    sortable: true
                }, {
                    field: 'categoryname',
                    title: '设备类型'
                }, {
                    field: 'assetcategoryname',
                    title: '资产类型'
                }, {
                    field: 'companyname',
                    title: '部门单位'
                }, {
                    field: 'assetbelong',
                    title: '资产归属'
                }, {
                    field: 'createddate',
                    title: '申请转移时间',
                    width:130
                }, {
                    field: 'originalassetproperty',
                    title: '原资源属性'
                }, {
                    field: 'newassetproperty',
                    title: '申请资源属性'
                }, {
                    field: 'completeddate',
                    title: '审核完成时间',
                    width:130
                }]],
            idField: 'id',
            rownumbers: true,
            singleSelect: false,
            fitColumns: false,
            border: false,
            pagination: true,
            toolbar: '#resourcetransfer-toolbar',
            fit: true,
            striped: true,
            rowStyler: function (index, row) {
                if (row.status == "提交审核") {
                    return 'background:#6293BB;color:#fff;';
                }
            },
            onRowContextMenu: function (e, rowIndex, rowData) {
                $('#resourcetransfer-grid-contextmenu').menu('show', {
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
            url: Utility.serverUrl + 'auditresourcetransfer/getlist'
        });
        /*绑定事件*/
        $('#resourcetransfer-btnadd').linkbutton({
            disabled: !policy.checkpolicy({
                policyno: 'resourcetransfer-allowaddnew',
                policyname: '新增资源转移申请',
                groupname: '设备资源池维护'
            }),
            onClick: function () {
                showUpdate().done(reloadGrid);
            }
        });
        $('#resourcetransfer-btnexport').linkbutton({
            disabled: !policy.checkpolicy({
                policyno: 'resourcetransfer-allowexport',
                policyname: '导出资源转移申请记录',
                groupname: '设备资源池维护'
            }),
            onClick: function () {

            }
        });
        $('#resourcetransfer-btnsearch').linkbutton({
            onClick: function () {
                $(container).datagrid('reload', getFilter());
            }
        })
    };
    //#region获取筛选
    getFilter = function () {
        return {
            key: $('#resourcetransfer-key').val(),
            categoryid: $('#resourcetransfer-category').combotree('getValue'),
            companyid: $('#resourcetransfer-company').combotree('getValue')
        };
    };
    //#endregion

    //#region设置资产转移
    showUpdate = function () {
        var deferred= $.Deferred();
        var tpl = require('tpl/resourcetransfer/form.html');
        var container = '#resourcetransfer-form';
        $(tpl).dialog({
            modal: true,
            width: 500,
            heght: 200,
            title:'新增资源变更申请',
            onOpen: function () {
                $.parser.parse(container);
                assetproperty.showComboTree(container + '-assetproperty');
                $(container + '-device').removeData('device');
                $(container+'-original-assetproperty').removeData('oldproperty');
                $(container + '-btnselect').linkbutton({
                    onClick: function () {
                        view.select({
                            assetbelongid: login.getLocalUser().companyid
                        }).done(function (rows) {
                            var row = rows[0];
                            $(container + '-device').html(row.deviceno);
                            $(container + '-original-assetproperty').html(row.assetpropertyname);
                            $(container + '-device').data('device', row.id);
                            $(container+'-original-assetproperty').data('oldproperty',row.assetpropertyid);
                        });
                    }
                });
            },
            onClose: function () {
                $(container).dialog('destroy', true);
            },
            buttons: [
                {
                    iconCls: 'icon-save',
                    text: '提交申请',
                    handler: function () {
                        var _data = {
                            deviceid: $(container + '-device').data('device'),
                            newpropertyid: $(container + '-assetproperty').combotree('getValue'),
                            oldpropertyid:$(container+'-original-assetproperty').data('oldproperty')
                        };
                        try {
                            if (!_data.deviceid)
                                throw new Error('设备不能为空');
                            if (!_data.assetpropertyid)
                                throw new Error('设备资产属性不能为空');
                            if(!_data.assetpropertyid!==_data.oldpropertyid)
                                throw new Error('更改的资产属性不能相同');
                        } catch (e) {
                            $.messager.alert('错误', e.message, 'warning');
                            return false;
                        }
                        Utility.saveData({
                            path: 'auditresourcetransfer/submit',
                            params: $.extend(_data, {
                                creatorid:login.getLocalUser().usercode
                            }),
                            success: function (res) {
                                $.messager.alert('成功', '该设备资产属性变更已成功提交审核', 'info');
                                $(container).dialog('close');
                                deferred.resolve();
                            },
                            error: function (message) {
                                $.messager.alert('错误', message, 'warning');
                            }
                        })
                    }
                }
            ]
        });
        return deferred.promise();
    };
    //#endregion

    //#region刷新数据表
    reloadGrid=function(){
        if($('#resourcetransfer-grid'))
          $('#resourcetransfer-grid').datagrid('reload',getFilter());
    };
    //#endregion
    exports.init = init;
});