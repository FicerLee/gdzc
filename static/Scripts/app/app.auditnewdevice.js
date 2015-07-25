define(function (require, exports, module) {
    var
        $container,
        tag,
        company,
        device,
        category,
        formContainer,
        auditstatus,
        login,
        getFilter,
        showAuditInfo,
        doPass,
        doReject,
        doRemove,
        doReSubmit,
        getDataById,
        reloadGrid,
        policy,
        init;
    tag='#auditnewdevice';
    login = require('app/app.login');
    company = require('app/app.company');
    category = require('app/app.devicecategory');
    auditstatus = require('app/app.auditstatus');
    device = require('app/app.device');
    policy = require('app/app.policy');
    getDataById = function (id) {
        var data = Utility.getData({
            path: 'auditnewdevice/get',
            data: {
                id: id
            }
        });
        return !data ? null : data.rows;
    };
    reloadGrid = function () {
        $container.datagrid('load', getFilter());
    };
    /*显示审核信息*/
    showAuditInfo = function (id) {
        var data = getDataById(id);
        if (!data) return false;
        var tpl = require('tpl/auditnewdevice/auditnewdevice-form.html');
        require('tpl/auditnewdevice/auditnewdevice-form.css');
        data.enabledate = Utility.formatDate(data.enabledate);
        data.createddate = Utility.formatDate(data.createddate);
        var output = Mustache.render(tpl, data);
        formContainer = '#auditnewdevice-form';
        $(output).dialog({
            title: '新增设备审核明细',
            modal: true,
            width: 600,
            height: 300,
            onOpen: function () {
                $.parser.parse(formContainer);
            },
            onClose: function () {
                $(formContainer).dialog('destroy', true);
            }
        });
        /*绑定事件*/
        $('#auditnewdevice-form-btnpass').on('click', function (e) {
            e.preventDefault();
            doPass(data.id);
        });
        $('#auditnewdevice-form-btnreject').on('click', function (e) {
            e.preventDefault();
            doReject(data.id);
        });
        $('#auditnewdevice-form-btnremove').on('click', function (e) {
            e.preventDefault();
            doRemove(data.id);
        });
    };
    /*审核通过*/
    doPass = function (id) {
        Utility.saveData({
            path: 'auditnewdevice/pass',
            params: {
                id: id,
                completerid: login.getLocalUser().usercode
            },
            success: function (res) {
                $.messager.alert('成功', '该设备已审核成功', 'info');
                $(formContainer).dialog('close');
                reloadGrid();
            },
            error: function (message) {
                $.messager.alert('失败', message, 'error');
            }
        });
    };
    doReject = function (id) {
        Utility.saveData({
            path: 'auditnewdevice/reject',
            params: {
                id: id,
                completerid: login.getLocalUser().usercode
            },
            success: function (res) {
                $.messager.alert('成功', '该设备审核已退回', 'info');
                $(formContainer).dialog('close');
                reloadGrid();
            },
            error: function (message) {
                $.messager.alert('失败', message, 'error');
            }
        });
    };
    doRemove = function (id) {
        Utility.saveData({
            path: 'auditnewdevice/remove',
            params: {
                id: id,
                completerid: login.getLocalUser().usercode
            },
            success: function (res) {
                $.messager.alert('成功', '该设备审核记录已删除', 'info');
                $(formContainer).dialog('close');
                reloadGrid();
            },
            error: function (message) {
                $.messager.alert('失败', message, 'error');
            }
        });
    };
    doReSubmit = function (id) {
        Utility.saveData({
            path: 'auditnewdevice/resubmit',
            params: {
                id: id,
                completerid: login.getLocalUser().usercode
            },
            success: function (res) {
                $.messager.alert('成功', '该设备审核记录已再次提交', 'info');
                $(formContainer).dialog('close');
                reloadGrid();
            },
            error: function (message) {
                $.messager.alert('失败', message, 'error');
            }
        });
    };
    getFilter = function () {
        return {
            key: $('#auditnewdevice-key').val(),
            categoryid: $('#auditnewdevice-category').combotree('getValue') || null,
            companyid: $('#auditnewdevice-company').combotree('getValue') || null,
            statusid: $('#auditnewdevice-auditstatus').combobox('getValue') || null,
            createdstartdate: $('#auditnewdevice-startdate').datebox('getValue') || null,
            createdenddate:$('#auditnewdevice-enddate').datebox('getValue')||null
        };
    };
    init = function (container) {
        $container = $(container);
        $(tag+'-startdate').datebox();
        $(tag+'-enddate').datebox({
            value:new Date().toString('yyyy-MM-dd')
        });
        //显示单位信息
        company.showComboTree('#auditnewdevice-company');
        //显示设备类型
        category.showComboTree('#auditnewdevice-category');
        //显示审核状态
        auditstatus.showCombo('#auditnewdevice-auditstatus');
        //显示主数据信息
        $container.datagrid({
            columns: [[{
                field: 'id',
                checkbox: true
            }, {
                field: 'statusname',
                title: '审核状态',
                width: 80,
                align:'right',
                styler:function(value){
                    return Utility.auditstatusStyle(value);
                }
            },{
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
                width: 120,
                formatter: function (value, row, index) {
                    if (value)
                        return Utility.formatDate(value);
                }
            }, {
                field: 'completeddate',
                title: '审核完成时间',
                width: 120,
                formatter: function (value, row, index) {
                    if (value)
                        return Utility.formatDate(value);
                }
            }]],
            idField: 'id',
            rownumbers: true,
            singleSelect: false,
            fitColumns: false,
            border: false,
            pagination: true,
            toolbar: '#auditnewdevice-toolbar',
            fit: true,
            striped: true,
            rowStyler: function (index, row) {
                if (row.statusname == '审核退回')
                    return {
                        class: 'text-del text-red'
                    };
            },
            onRowContextMenu: function (e, rowIndex, rowData) {
                $container.datagrid('selectRow', rowIndex);
                $('#auditnewdevice-grid-contextmenu').menu('show', {
                    left: e.pageX,
                    top: e.pageY,
                    onClick: function (item) {
                        switch (item.name) {
                            case 'auditnewdevice-showAuditInfo':
                                showAuditInfo(rowData.id);
                                break;
                            case 'auditnewdevice-doPass':
                                doPass(rowData.id);
                                break;
                            case 'auditnewdevice-doReject':
                                doReject(rowData.id);
                                break;
                            case 'auditnewdevice-doRemove':
                                doRemove(rowData.id);
                                break;
                            case 'auditnewdevice-doReSubmit':
                                doReSubmit(rowData.id);
                                break;
                            default:
                                break;
                        }
                    }
                });
                e.preventDefault();
            },
            url: Utility.serverUrl + 'auditnewdevice/getlist',
            queryParams:getFilter()
        });
        //绑定事件
        /*搜索*/
        $('#auditnewdevice-btnsearch').on('click', function (e) {
            e.preventDefault();
            reloadGrid($container, getFilter());
        });
        /*新增设备审核申请*/
        $('#auditnewdevice-btnadd').linkbutton({
            disabled: !policy.checkpolicy({
                policyno: 'device-allowaddnew',
                policyname: '新增设备申请',
                groupname:'设备资料维护'
            }),
            onClick: function () {
                device.showUpdate({
                    action: 'addnew'
                });
            }
        });
        /*导出设备审核记录*/
        $('#auditnewdevice-btnexport').linkbutton({
            disabled: !policy.checkpolicy({
                policyno: 'auditnewdevice-allowexport',
                policyname: '导出新增设备审核历史记录',
                groupname: '设备审核'
            }),
            onClick: function () {

            }
        });
        /*检查菜单权限*/
        var menuContainer = '#auditnewdevice-grid-contextmenu';
        if (!policy.checkpolicy({
            policyno: 'device-allowaddnew',
            policyname: '新增设备申请',
            groupname: '设备资料维护'
        })) {
            var item = $(menuContainer).menu('findItem', '再次提交审核');
            if (item && item.target)
                $(menuContainer).menu('disableItem', item.target);
        };
        if (!policy.checkpolicy({
            policyno: 'auditnewdevice-allowaudit',
            policyname: '允许新增设备审核',
            groupname: '设备审核'
        })) {
            $.each([
                '审核通过','审核退回','审核删除'
            ],function(index,value){
                var item = $(menuContainer).menu('findItem',value);
                if (item && item.target)
                    $(menuContainer).menu('disableItem', item.target);
            });
        };
    };
    exports.init = init;
});