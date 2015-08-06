if (typeof define === "function" && define.amd && define.amd.dust === true) {
    define(["require", "dust.core"], function(require, dust) {
        dust.onLoad = function(name, cb) {
            require([name], function(tmpl) {
                cb(null, tmpl);
            });
        };
        return dust;
    });
}
