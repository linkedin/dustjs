if (typeof define === "function" && define.amd && define.amd.dust === true) {
    define(["require", "dust.core", "dust.compile"], function(require, dust) {
        dust.onLoad = function(name, cb) {
            require([name], function() {
                cb();
            });
        };
        return dust;
    });
}
