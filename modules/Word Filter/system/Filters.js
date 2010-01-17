/*********************************************************************
*           DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE              *
*                   Version 2, December 2004                         *
*                                                                    *
*  Copyleft meh.                                                     *
*                                                                    *
*           DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE              *
*  TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION   *
*                                                                    *
*  0. You just DO WHAT THE FUCK YOU WANT TO.                         *
*********************************************************************/

(function () {

var Filters = {};

Filters._filters = [];

Filters.Filter = Class.create({
    initialize: function (node, censor) {
        this._type = node.getAttribute("type") || "censor";

        if (node.getAttribute("regexp")) {
            this._regexp = eval(node.getAttribute("regexp"));
        }
        else if (node.getAttribute("raw")) {
            this._regexp = new RegExp(node.getAttribute("raw"), "gi");
        }

        if (this._type == "censor") {
            this._to = censor || "@#!%$";
        }
        else if (this._type == "replace") {
            this._to = node.getAttribute("to") || "$1";
        }
        else {
            this._to = "$1";
        }
    },

    apply: function (text) {
        return text.replace(this._regexp, this._to);
    }
});

Filters.apply = function (text) {
    for (var i = 0; i < this._filters.length; i++) {
        text = this._filters[i].apply(text);
    }

    return text;
}

Filters.load = function (path) {
    new Ajax.Request(path, {
        method: "get",
        asynchronous: false,

        onSuccess: function (http) {
            var error = miniLOL.utils.checkXML(http.responseXML);
            if (error) {
                miniLOL.error("Error while parsing `#{filter}`<br/><br/>#{error}".interpolate({
                    filter: filters[i],
                    error: error.replace(/\n/g, "<br/>").replace(/ /g, "&nbsp;")
                }));

                return;
            }

            var dom     = miniLOL.utils.fixDOM(http.responseXML);
            var filters = dom.getElementsByTagName("filter");
            
            for (var i = 0; i < filters.length; i++) {
                Filters._filters.push(new Filter(filters[i], dom.documentElement.getAttribute("censor")));
            }

            Filters._paths.push(path);
        }
    });
}

Filters.reload = function () {
    this._filters = [];

    for (var i = 0; i < this._paths.length; i++) {
        Filters.load(this._paths[i]);
    }
}

return Filters;

})();
