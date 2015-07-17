define(function (require, exports, module) {
    var
        showModifyImportData,
        showImport;
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
                            width: 220,
                            align: 'right',
                            styler: function (value, row, index) {
                                if (value == '可以导入')
                                    return {
                                        class: 'text-ok'
                                    };
                                else if (value == '修改导入') {
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
                    border: true,
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
                value = $.extend(value, {
                    createduserid: login.getLocalUser().usercode
                });
            });
            Utility.saveData({
                path: 'device/saveimport',
                params: {
                    values: data
                },
                success: function (res) {
                    var messages = $.parseJSON(res.message) || [];
                    if (messages.length <= 0) {
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
                            message: '修改导入'
                        };
                        $(container).dialog('close');
                        if (callback)
                            return callback(data);
                    }
                }
            ]
        });

    }

    exports.showImport = showImport;
});