define(function (require, exports, module) {
    var
        tabcontainer,
        menu,
        user,
        init;
    init = function (tabcontainer) {
        this.tabcontainer = tabcontainer;
        menu = require('app/app.menu');
        login = require('app/app.login');
        menu.init('#navmenu');
        login.init();
    }
    exports.init = init;
});