define(function (require, exports, module) {
    var
        $container,
        checkpolicy,
        company,
        category,
        login,
        init;
    login = require('app/app.login');
    company = require('app/app.company');
    category = require('app/app.devicecategory');
    init = function (container) {
        $container = $(container);
        //显示单位信息
        company.showComboTree('#resourcetransfer-company-combo');
        //显示设备类型
        category.showComboTree('#resourcetransfer-category-combo');
        //显示主数据信息
        $container.datagrid({
            columns: [[{
                field: 'id',
                checkbox: true
            }, {
                field: 'assetno',
                title: '资产编码',
                width: 140,
                sortable: true,
            }, {
                field: 'deviceno',
                title: '设备型号',
                width: 140,
                sortable: true
            }, {
                field: 'categoryname',
                title: '设备类型',
                width: 120
            }, {
                field: 'assetcategoryname',
                title: '资产类型',
                width: 60
            }, {
                field: 'companyname',
                title: '部门单位',
                width: 250
            }, {
                field: 'assetbelong',
                title: '资产归属',
                width: 140
            }, {
                field: 'createddate',
                title: '申请转移时间',
                width: 120
            }, {
                field: 'originalassetproperty',
                title: '原资源属性',
                width:100
            },{
                field: 'newassetproperty',
                title: '申请资源属性',
                width:100
            },{
                field: 'completeddate',
                title: '审核完成时间',
                width: 120
            }, {
                field: 'status',
                title: '当前状态',
                width: 120
            }]],
            isField: 'id',
            rownumbers: true,
            singleSelect: false,
            fitColumns: false,
            border: false,
            pagination: true,
            toolbar: '#resourcetransfer-toolbar',
            fit: true,
            striped: true,
            rowStyler:function(index,row){
                if (row.status == "提交审核") {
                    return 'background:#6293BB;color:#fff;';
                }
            },
            onRowContextMenu: function (e, rowIndex, rowData) {
                $('#resourcetransfer-grid-contextmenu').menu('show', {
                    left: e.pageX,
                    top: e.pageY
                });
                e.preventDefault();
            },
            method: 'get',
            url: 'data/resourcetransfer.html'
        });
        /*绑定事件*/
        $('#resourcetransfer-btnadd').linkbutton({
            disabled: !checkpolicy({
                policyno: 'resourcetransfer-allowaddnew',
                policyname: '新增资源转移申请',
                groupname: '设备资源池维护'
            }),
            onClick: function () {

            }
        });
        $('#resourcetransfer-btnedit').linkbutton({
            disabled: !checkpolicy({
                policyno: 'resourcetransfer-allowedit',
                policyname: '修改资源转移申请',
                groupname: '设备资源池维护'
            }),
            onClick: function () {

            }
        });
        $('#resourcetransfer-btnexport').linkbutton({
            disabled: !checkpolicy({
                policyno: 'resourcetransfer-allowexport',
                policyname: '导出资源转移申请记录',
                groupname: '设备资源池维护'
            }),
            onClick: function () {

            }
        });

    }
    /*检查确认权限*/
    checkpolicy = function (options) {
        login.checkpolicy(options, function (r) {
            return r;
        });
        return false;
    }
    exports.init = init;
});