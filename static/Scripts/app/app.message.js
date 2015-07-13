define(function (require, exports, module) {
    var
        showContent,
        getDataById,
        doUpdate,
        init;
    doUpdate = function (data) {
        $.ajax({
            type: "POST",
            url: Utility.serverUrl+"message/update",
            data:data,
            dataType: "json",
            success: function (response) {
            }
        });
    }
    showContent = function (id) {
        var data = getDataById(id);
        if (!data) return false;
        var tpl = require('tpl/message/message-view.html');
        require('tpl/message/message-view.css');
        var output = Mustache.render(tpl, data);
        $(output).dialog({
            title: '查看',
            modal: true,
            width: 400,
            height: 300,
            onOpen: function () {
                $.parser.parse('#message-view');
            },
            onClose: function () {
                //更新查看时间
                data.viewdate = Date.today().toString('yyyy-MM-dd HH:mm:ss');
                data.action = 'edit';
                doUpdate(data);
                $('#message-view').dialog('destroy', true);
            }
        });
    }
    getDataById = function (id) {
        $.ajax({
            beforeSend:function(xhr){
                $.messager.progress({
                    text:'正在获取数据，请稍候...'
                });
            },
            type: "POST",
            url:Utility.serverUrl+"message/getbyid",
            data:{
                id:id
            },
            dataType: "json",
            success: function (data) {
                return data;
            },
            complete: function (xhr, ts) {
                $.messager.progress('close');
            }
        });
        return false;
    }
    init = function (container) {
        $container = $(container);
        $.parser.parse();
        var category = require('app/app.messagecategory');
        category.showCombo('#message-messagecategory');
        $('#message-startdate').datebox('setValue', Date.today().toString('yyyy-MM-dd'));
        $('#message-enddate').datebox('setValue', Date.today().toString('yyyy-MM-dd'));
        var args = {
            key: $('#message-key').val(),
            category: $('#message-messagecategory').combobox('getValue'),
            startdate: $('#message-startdate').datebox('getValue'),
            enddate:$('#message-enddate').datebox('getValue')
        };
        $container.datagrid({
            columns: [[{
                field: 'categoryname',
                title: '消息类型',
                width: 100,
                sortable:true
            }, {
                field: 'contentcompact',
                title: '消息内容',
                width: 220
            }, {
                field: 'startdate',
                title: '发送时间',
                width:120
            }, {
                field: 'vieweddate',
                title: '查看时间',
                width:120
            }]],
            fit: true,
            pagination: true,
            rownumbers: true,
            toolbar:'#message-toolbar',
            onDblClickRow:function(index,row){
                showContent(row.id);
            },
            singleSelect: true,
            border: false,
            idField: 'id',
            url: Utility.serverUrl+'api/message/get',
            queryParams:args
        });
        //绑定事件
        $('#message-btnsearch').on('click', function (e) {
            e.preventDefault();
        });
    }
    exports.init = init;
});