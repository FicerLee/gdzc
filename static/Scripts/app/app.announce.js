define(function (require, exports, module) {
    var
        $container,
        login,
        init,
        ue,
        showForm,
        closeForm,
        getDataById,
        doUpdate,
        viewContent,
        getFilter,
        reloadGrid;
    login = require('app/app.login');
    closeForm = function () {
        $('#announce-form').dialog('close');
    }
    getFilter = function () {
        return {
            key: $('#announce-key').val(),
            startdate: $('#announce-startdate').datebox('getValue'),
            enddate: $('#announce-enddate').datebox('getValue')
        };
    }
    viewContent = function (id) {
        var data = getDataById(id);
        if (!data) return false;
        data.pubdate = Utility.formatDate(data.pubdate);
        var tpl = require('tpl/announce/announce-view.html');
        require('tpl/announce/announce-view.css');
        var output = Mustache.render(tpl, data);
        $(output).dialog({
            modal: true,
            width: 600,
            height: 400,
            title: '查看',
            onOpen: function () {
                $.parser.parse('#announce-view');
            },
            onClose: function () {
                $('#announce-view').dialog('destroy', true);
            }
        })
    }
    doUpdate = function (data) {
        Utility.saveData({
            path: 'announce/update',
            params: data,
            success: function (res) {
                $.messager.alert('成功', '通知已经成功更新', 'info');
                closeForm();
                reloadGrid();
            },
            error: function (message) {
                $.messager.alert('失败', message, 'error');
            }
        });
    }
    getDataById = function (id) {
        var data = Utility.getData({
            path: 'announce/get',
            data: {
                id: id
            }
        });
        return !data ? null : data.rows;
    }
    showForm = function (data) {
        var tpl = require('tpl/announce/announce-form.html');
        require('tpl/announce/announce-form.css');
        output = Mustache.render(tpl, data);
        $(output).dialog({
            modal: true,
            width: 600,
            height: 400,
            title: data.action === 'addnew' ? '新增' : '修改',
            onOpen: function () {
                $.parser.parse('#announce-form');
                ue = UE.getEditor('announce-form-content');
            },
            onClose: function () {
                $('#announce-form').dialog('destroy', true);
            },
        })
        //绑定事件
        $('#announce-form-save').on('click', function (e) {
            e.preventDefault();
            var data = {
                action: data.action,
                title: $('#announce-form-title').val(),
                pubcontent: ue.getContent(),
                id: data.id,
                usercode: login.getLocalUser().usercode
            }
            doUpdate(data);
        });
    }
    init = function (container) {
        $container = $(container);
        var startdate = Date.today().toString('yyyy-MM-dd');
        $('#announce-startdate').datebox('setValue', startdate);
        $container.datagrid({
            columns: [[{
                field: 'id',
                checkbox: true
            }, {
                field: 'title',
                title: '标题',
                width: 200,
                sortable: true
            }, {
                field: 'username',
                title: '发布人',
                width: 100
            }, {
                field: 'pubdate',
                title: '发布日期',
                width: 130,
                formatter: function (value, row, index) {
                    if (value) {
                        return Date.parse(value).toString('yyyy-MM-dd HH:mm:ss');
                    }
                }
            }]],
            idField: 'id',
            rownumbers: true,
            singleSelect: true,
            title: '浏览列表',
            fit: true,
            border: false,
            height: 500,
            pagination: true,
            toolbar: '#announce-toolbar',
            striped: true,
            onDblClickRow: function (index, row) {
                //双击鼠标显示通知明细
                viewContent(row.id);
            },
            onLoadError: function () {
                $.messager.alert('错误', '数据加载失败，请联系系统管理员', 'error');
            }
        });
        /*绑定数据*/
        var datas = Utility.getData({
            path: 'announce/getlist',
            data: getFilter()
        }
        );
        $container.datagrid('loadData', datas);
        //绑定事件
        $('#announce-btnsearch').on('click', function (e) {
            e.preventDefault();
            reloadGrid();
        });
        //绑定新增
        $('#announce-btnadd').on('click', function (e) {
            e.preventDefault();
            var data = {
                action: 'addnew',
                pubdate: new Date().tostring('yyyy-MM-dd HH:mm:ss')
            }
            showForm(data);
        });
        //绑定修改
        $('#announce-btnedit').on('click', function (e) {
            e.preventDefault();
            var row = $container.datagrid('getSelected');
            if (!row) return false;
            var data = getDataById(row.id);
            data.action = 'edit';
            showForm(data);
        });
        //绑定删除
        $('#announce-btnremove').on('click', function (e) {
            e.preventDefault();
            var row = $container.datagrid('getSelected');
            if (!row) return false;
            var data = {
                id: row.id,
                action: 'remove'
            };
            $.messager.confirm('警告', '是否确认删除此通知信息?!', function (r) {
                if (r) {
                    doUpdate(data);
                }
            });
        });
    };
    //刷新表格数据
    reloadGrid = function () {
        if ($container)
            $container.datagrid('reload', getFilter());
    }

    exports.init = init;
});