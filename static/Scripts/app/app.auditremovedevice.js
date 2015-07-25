define(function (require, exports, module) {
    var
        $container,
        company,
        category,
        tag,
        view,
        getFilter,
        auditstatus,
        policy,
        init;
    tag = '#auditremovedevice';
    company = require('app/app.company');
    category = require('app/app.devicecategory');
    auditstatus = require('app/app.auditstatus');
    policy = require('app/app.policy');
    view = require('app/app.device.view');
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
                field: 'status',
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
            isField: 'id',
            rownumbers: true,
            singleSelect: false,
            fitColumns: false,
            border: false,
            pagination: true,
            toolbar: '#auditremovedevice-toolbar',
            fit: true,
            striped: true,
            rowStyler: function (index, row) {
                if (row.status == "提交审核") {
                    return 'background:#6293BB;color:#fff;';
                }
            },
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
//TODO:未完成
                        } else if (item.name == 'doPass') {
//TODO:未完成
                        } else if (item.name == 'doReject') {
//TODO:未完成
                        } else if (item.name == 'doRemove') {
//TODO:未完成
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
//TODO:未完成
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
    exports.init = init;
});