define(function (require, exports, module) {
    var
        $container,
        policy,
        login,
        company,
        category,
        auditstatus,
        init;
    policy = require('app/app.policy');
    login = require('app/app.login');
    company = require('app/app.company');
    category = require('app/app.devicecategory');
    auditstatus = require('app/app.auditstatus');
    init = function (container) {
        $container = $(container);
        company.showComboTree('#auditresourcetransfer-company-combo');
        category.showComboTree('#auditresourcetransfer-category-combo');
        auditstatus.showCombo('#auditresourcetransfer-auditstatus-combo');
        //显示主数据信息
        $container.datagrid({
            columns: [[{
                field: 'id',
                checkbox: true
            }, {
                field: 'status',
                title: '审核状态',
                width: 120
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
                field: 'assetproperty',
                title: '资产属性',
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
                title: '审核提交时间',
                width: 120
            }, {
                field: 'completeddate',
                title: '审核完成时间',
                width: 120
            }]],
            isField: 'id',
            rownumbers: true,
            singleSelect: false,
            fitColumns: false,
            border: false,
            pagination: true,
            toolbar: '#auditresourcetransfer-toolbar',
            fit: true,
            striped: true,
            rowStyler: function (index, row) {
                if (row.status == "提交审核") {
                    return 'background:#6293BB;color:#fff;';
                }
            },
            onRowContextMenu: function (e, rowIndex, rowData) {
                $('#auditresourcetransfer-grid-contextmenu').menu('show', {
                    left: e.pageX,
                    top: e.pageY
                });
                e.preventDefault();
            },
            method: 'get',
            url: 'data/auditresourcetransfer.html'
        });
        /*检查权限*/
        $('#auditresourcetransfer-btnexport').linkbutton({
            disabled: !policy.checkpolicy({
                policyno: 'auditresourcetransfer-allowexport',
                policyname: '导出设备资源转移申请记录',
                groupname: '审核设备资源转移'
            }),
            onClick: function () {

            }
        })
        var menu = '#auditresourcetransfer-grid-contextmenu';
        if (!policy.checkpolicy({
            policyno: 'resourcetransfer-allowaddnew',
            policyname: '新增资源转移申请',
            groupname: '设备资源池维护'
        })) {
            var item = $(menu).menu('findItem', '再次提交审核');
            if (item && item.target)
                $(menu).menu('disableItem', item.target);
        }
        if (!policy.checkpolicy({
            policyno: 'auditresourcetransfer-allowaudit',
            policyname: '允许审核设备资源转移',
            groupname: '审核设备资源转移'
        })) {
            ['审核通过', '审核退回', '审核删除'].forEach(function (value, index) {
                var item = $(menu).menu('findItem', value);
                if (item && item.target)
                    $(menu).menu('disableItem', item.target);
            });
        }
    }
    
    exports.init = init;
});