define(function (require, exports, module) {
    var
        $container,
        company,
        category,
        tag,
        view,
        getFilter,
        auditstatus,
        fileexport,
        doReSubmit,
        doPass,
        doReject,
        doRemove,
        policy,
        reloadGrid,
        init;
    tag = '#auditremovedevice';
    company = require('app/app.company');
    category = require('app/app.devicecategory');
    auditstatus = require('app/app.auditstatus');
    policy = require('app/app.policy');
    view = require('app/app.device.view');
    fileexport=require('app/app.export');
    init = function (container) {
        $container = $(container);
        //显示单位信息
        company.showComboTree('#auditremovedevice-company');
        //显示设备类型
        category.showComboTree('#auditremovedevice-category');
        //显示审核状态
        auditstatus.showCombo('#auditremovedevice-auditstatus');
        //日期
        $(tag + '-startdate').datebox();
        $(tag + '-enddate').datebox({
            value: new Date().toString('yyyy-MM-dd')
        });
        //显示主数据信息
        $container.datagrid({
            columns: [[{
                field: 'id',
                checkbox: true
            }, {
                field: 'statusname',
                title: '审核状态',
                width: 80,
                align: 'right',
                styler: function (value) {
                    return Utility.auditstatusStyle(value);
                }
            }, {
                field: 'assetno',
                title: '资产编码',
                width: 140,
                sortable: true
            }, {
                field: 'deviceno',
                title: '设备型号',
                width: 140,
                sortable: true
            }, {
                field: 'categoryname',
                title: '设备类型',
                width: 120
            },{
                field:'deviceusername',
                title:'设备使用人',
                width:100
            }, {
                field: 'assetcategoryname',
                title: '资产类型',
                width: 60
            }, {
                field: 'creatorcompanyname',
                title: '部门单位',
                width: 250
            }, {
                field: 'assetbelongname',
                title: '资产归属',
                width: 140
            }, {
                field: 'createddate',
                title: '审核提交时间',
                width: 120
            }, {
                field: 'completeddate',
                title: '审核完成时间',
                width: 120
            }]],
            rowStyler:function(index,row){
                if(row.statusname==='审核退回'){
                    return {
                        class:'text-red text-del'
                    };
                }
            },
            isField: 'id',
            rownumbers: true,
            singleSelect: false,
            fitColumns: false,
            border: false,
            pagination: true,
            toolbar: '#auditremovedevice-toolbar',
            fit: true,
            striped: true,
            onRowContextMenu: function (e, rowIndex, rowData) {
                $container.datagrid('selectRow', rowIndex);
                $('#auditremovedevice-grid-contextmenu').menu('show', {
                    left: e.pageX,
                    top: e.pageY,
                    onClick: function (item) {
                        if (item.name == 'showDeviceInfo') {
                            view.showInfo({
                                deviceids: [rowData.deviceid]
                            });
                        } else if (item.name == 'doReSubmit') {
                            //TODO:再次提交申请有一个BUG,可以反复提交申请
                            doReSubmit({
                                id:rowData.id,
                                deviceid:rowData.deviceid
                            }).done(reloadGrid);
                        } else if (item.name == 'doPass') {
                            doPass({
                                id:rowData.id
                            }).done(reloadGrid);
                        } else if (item.name == 'doReject') {
                            doReject({
                                id:rowData.id
                            }).done(reloadGrid);
                        } else if (item.name == 'doRemove') {
                            $.messager.confirm('警告','是否确认将删除此设备申请？',function(r){
                               if(r){
                                   doRemove({
                                       id:rowData.id
                                   }).done(reloadGrid);
                               }
                            });
                        }
                    }
                });
                e.preventDefault();
            },
            url: Utility.serverUrl + 'auditremovedevice/getlist',
            queryParams: getFilter()
        });
        var menu = '#auditremovedevice-grid-contextmenu';
        /*检查菜单权限*/
        $('#auditremovedevice-btnadd').linkbutton({
            disabled: !policy.checkpolicy({
                policyno: 'device-allowremove',
                policyname: '新增删除设备申请',
                groupname: '设备资料维护'
            }),
            onClick: function () {
//TODO:未完成
            }
        });
        /*导出历史记录*/
        $('#auditremovedevice-btnexport').linkbutton({
            disabled: !policy.checkpolicy({
                policyno: 'auditremovedevice-allowexport',
                policyname: '导出删除设备审核记录',
                groupname: '审核删除设备'
            }),
            onClick: function () {

                var fields=$(container).datagrid('getColumnFields');
                var columns={};
                $.each(fields,function(index,value){
                   var col=$(container).datagrid('getColumnOption',value);
                    columns[col.field]=col.title;
                });
                Utility.saveData({
                    path:'auditremovedevice/exportfile',
                    params:{
                        columns:columns
                    },
                    success:function(res){
                        fileexport.showDialog({
                            title:'删除设备审核明细清单',
                            rows:res.rows
                        });
                    },
                    error:function(message){
                        $.messager.alert('错误',message,'warning');
                    }
                })
            }
        });
        /*检查菜单*/
        if (!policy.checkpolicy({
                policyno: 'auditremovedevice-allowaudit',
                policyname: '允许审核设备删除申请',
                groupname: '审核删除设备'
            })) {
            var texts = [
                '审核通过',
                '审核退回',
                '审核删除'
            ];
            for (var i = 0; i < texts.length; i++) {
                var item = $(menu).menu('findItem', texts[i]);
                if (item && item.target)
                    $(menu).menu('disableItem', item.target);
            }
        }
        if (!policy.checkpolicy({
                policyno: 'device-allowremove',
                policyname: '新增删除设备申请',
                groupname: '设备资料维护'
            })) {
            var item = $(menu).menu('findItem', '再次提交设备删除申请...');
            if (item && item.target)
                $(menu).menu('disableItem', item.target);
        }
    };
    //筛选
    getFilter = function () {
        return {
            key: $(tag + '-key').val(),
            categoryid: $(tag + '-category').combotree('getValue'),
            companyid: $(tag + '-company').combotree('getValue'),
            statusid: $(tag + '-auditstatus').combobox('getValue'),
            startdate: $(tag + '-startdate').datebox('getValue'),
            enddate: $(tag + '-enddate').datebox('getValue')
        };
    };
    //再次提交审核
    doReSubmit=function(options){
        var deferred= $.Deferred();
        Utility.saveData({
            path:'auditremovedevice/submit',
            params:{
                id:options.id,
                deviceid:options.deviceid,
                creatorid:login.getLocalUser().usercode
            },
            success:function(res){
                $.messager.alert('成功','该设备申请已再次提交成功','info');
                deferred.resolve(res);
            },
            error:function(message){
                $.messager.alert('错误',message,'warning');
            }
        });
        return deferred.promise();
    };
    //审核删除
    doRemove=function(options){
        var deferred= $.Deferred();
        Utility.saveData({
            path:'auditremovedevice/remove',
            params:{
                id:options.id,
                completerid:login.getLocalUser().usercode
            },
            success:function(res){
                $.messager.alert('成功','该设备审核信息已成功删除','info');
                deferred.resolve(res);
            },
            error:function(message){
                $.messager.alert('错误',message,'warning');
            }
        });
        return deferred.promise();
    };
    //审核通过
    doPass=function(options){
        var deferred= $.Deferred();
        Utility.saveData({
            path:'auditremovedevice/pass',
            params:{
                id:options.id,
                completerid:login.getLocalUser().usercode
            },
            success:function(res){
                $.messager.alert('成功','该设备已成功通过审核','info');
                deferred.resolve(res);
            },
            error:function(message){
                $.messager.alert('错误',message,'warning');
            }
        });
        return deferred.promise();
    };
    //审核退回
    doReject=function(options){
        var deferred= $.Deferred();
        Utility.saveData({
            path:'auditremovedevice/reject',
            params:{
                id:options.id,
                completerid:login.getLocalUser().usercode
            },
            success:function(res){
                $.messager.alert('成功','该设备申请已经退回','info');
                deferred.resolve(res);
            },
            error:function(message){
                $.messager.alert('错误',message,'warning');
            }
        });
        return deferred.promise();
    };
    //刷新表格数据
    reloadGrid=function(){
      if($(tag+'-grid'))
      $(tag+'-grid').datagrid('reload',getFilter());
    };
    exports.init = init;
});