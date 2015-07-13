define(function (require, exports, module) {
    var
        init,
        open,
        app = require('app/app');
    init = function ($container) {
        $($container).tree({
            lines: true,
            url: 'Data/menu.html',
            method:'get',
            onDblClick: function (node) {
                open(node);
            },
            onContextMenu: function (e, node) {
                e.preventDefault();
            }
        });

    };
    open = function (node) {
        var tabcontainer = app.tabcontainer;
        if ($(tabcontainer).tabs('exists', node.text)) {
            //激活选项卡
            $(tabcontainer).tabs('select', node.text);
            return false;
        };
        if (node.attributes) {
            $(tabcontainer).tabs('add', {
                title: node.text,
                href:node.attributes.url,
                closable: true,
            });
        }
    }
    exports.init = init;
});
