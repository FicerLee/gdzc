define(function (require, exports, module) {
    var
        $container,
        policy,
        company,
        category,
        auditstatus,
        init;
    policy = require('app/app.policy');
    company = require('app/app.company');
    category = require('app/app.devicecategory');
    auditstatus = require('app/app.auditstatus');
    init = function (container) {
        $container = $(container);
        //显示单位信息
        company.showComboTree('#auditassettransfer-company-combo');
        //显示设备类型
        category.showComboTree('#auditassettransfer-category-combo');
        //显示审核状态
        auditstatus.showCombo('#auditassettransfer-auditstatus-combo');
        //显示主数据信息
        $container.datagrid({
            columns: [[{
                field: 'id',
                checkbox: true
            }, {
                field: 'status',
                title: '审核状态',
                width: 80
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
                field: 'fromcompanyname',
                title: '转出单位',
                width: 220
            },{
                field: 'tocompanyname',
                title: '转入单位',
                width: 220
            }, {
                field: 'assetbelong',
                title: '资产归属',
                width: 220
            }, {
                field: 'createddate',
                title: '审核提交时间',
                width: 120
            }, {
                field: 'completeddate',
                title: '审核完成时间',
                width: 120
            }]],
            idField: 'id',
            rownumbers: true,
            singleSelect: false,
            fitColumns: false,
            border: false,
            pagination: true,
            toolbar: '#auditassettransfer-toolbar',
            fit: true,
            striped: true,
            rowStyler: function (index, row) {
                if (row.status == "提交审核") {
                    return 'background:#6293BB;color:#fff;';
                }
            },
            onRowContextMenu: function (e, rowIndex, rowData) {
                $('#auditassettransfer-grid-contextmenu').menu('show', {
                    left: e.pageX,
                    top: e.pageY
                });
                e.preventDefault();
            },
            method: 'get',
            url: 'data/auditassettransfer.html'
        });
        /*检查权限*/
        $('#auditassettransfer-btnexport').linkbutton({
            disabled: !policy.checkpolicy({
                policyno: 'auditassettransfer-allowexport',
                policyname: '导出资产转移审核清单',
                groupname: '设备资产转移审核'
            }),
            onClick: function () {

            }
        });
        var menu = '#auditassettransfer-grid-contextmenu';
        if (!policy.checkpolicy({
            policyno: 'assettransfer-allowaddnew',
            policyname: '新增资产转移',
            groupanem: '设备资产转移'
        })) {
            var item = $(menu).menu('findItem', '再次提交转移审核...');
            if (item && item.target)
                $(menu).menu('disableItem', item.target);
        }
        if (!policy.checkpolicy({
            policyno: 'auditassettransfer-allowaudit',
            policyname: '允许审核资产转移申请',
            groupname: '设备资产转移审核'
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