define(function (require, exports, module) {
    var
        $container,
        policy,
        company,
        category,
        auditstatus,
        login,
        reloadGrid,
        getFilter,
        init;
    company = require('app/app.company');
    category = require('app/app.devicecategory');
    auditstatus = require('app/app.auditstatus');
    login = require('app/app.login');
    policy = require('app/app.policy');
    init = function (container) {
        $container = $(container);
        //显示单位信息
        company.showComboTree('#auditdevicescrap-company');
        //显示设备类型
        category.showComboTree('#auditdevicescrap-category');
        //显示审核状态
        auditstatus.showCombo('#auditdevicescrap-auditstatus');
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
            idField: 'id',
            rownumbers: true,
            singleSelect: false,
            fitColumns: false,
            border: false,
            pagination: true,
            toolbar: '#auditdevicescrap-toolbar',
            fit: true,
            striped: true,
            rowStyler: function (index, row) {
                if (row.status == "提交审核") {
                    return 'background:#6293BB;color:#fff;';
                }
            },
            onRowContextMenu: function (e, rowIndex, rowData) {
                $('#auditdevicescrap-grid-contextmenu').menu('show', {
                    left: e.pageX,
                    top: e.pageY
                });
                e.preventDefault();
            },
            method: 'get',
            url: 'data/auditdevicescrap.html'
        });
        /*检查申请记录*/
        $('#auditdevicescrap-btnexport').linkbutton({
            disabled: !policy.checkpolicy({
                policyno: 'auditdevicescrap-allowexport',
                policyname: '导出报废申请审核历史记录',
                groupname:'审核设备报废'
            }),
            onClick: function () {

            }
        })
        var menu = '#auditdevicescrap-grid-contextmenu';
        if(!policy.checkpolicy({
            policyno: 'device-allowscrap',
            policyname: '新增设备报废申请',
            groupname: '设备资料维护'
        })) {
            var item = $(menu).menu('findItem', '再次提交审核');
            if (item && item.target)
                $(menu).menu('disableItem', item.target);
        }
        if(!policy.checkpolicy({
            policyno:'auditdevicescrap-allowaudit',
                policyname:'允许审核设备报废申请',
            groupname:'审核设备报废'
        })) {
            ['审核通过', '审核退回', '审核删除'].forEach(function (value, index) {
                var item = $(menu).menu('findItem', value);
                if (item && item.target)
                    $(menu).menu('disableItem', item.target);
            });
        }
        /*搜索*/
        $('auditdevicescrap-btnsearch').linkbutton({
            onClick: function () {
                reloadGrid();
            }
        })
    }
    /*获取筛选*/
    getFilter = function () {
        return {
            key: $('#auditdevicescrap-key').val(),
            category: $('#auditdevicescrap-category').combotree('getValue'),
            auditstatusid: $('#auditdevicescrap-auditstatus').combobox('getValue')
        };
    }
    /*刷新数据*/
    reloadGrid = function () {
        if ($('#auditdevicescrap-grid'))
            $('#auditdevicescrap-grid').datagrid('reload', getFilter());
    }
    exports.init = init;
});