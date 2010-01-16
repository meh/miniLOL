/*
 * This is just a faggy module, it does simple channysh wordfiltering.
 */

(function () {

var Filter = Class.create({
    initialize: function (node, censor) {
        this._type   = node.getAttribute("type") || "censor";

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

miniLOL.module.create("WordFilter", {
    initialize: function () {
        var This = this;

        this.resource = {
            name: "WordFilter",

            load: function () {
                if (!this.res) {
                    this.res = [];
                } var res = this.res;

                This.filters = res;

                var filters = $A(arguments);
                for (var i = 0; i < filters.length; i++) {
                    new Ajax.Request(filters[i], {
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
                                This.filters.push(new Filter(filters[i], dom.documentElement.getAttribute("censor")));
                            }
                        },

                        onFailure: function (http) {
                            miniLOL.error("Error while loading config.xml (#{error})".interpolate({
                                error: http.status
                            }));
                        }
                    });

                    if (miniLOL.error()) {
                        return false;
                    }
                }
            }
        }

        miniLOL.resource.load(this.resource, this.root+"/resources/words.xml");

        Event.observe(document, ":go", this.execute);

        Event.observe(document, ":refresh", function () {
            miniLOL.resource.reload(miniLOL.module.get("WordFilter").resource);
        });
    },

    execute: function () {
        var content = miniLOL.content.get();

        this.filters.each(function (filter) {
            content = filter.apply(content);
        });

        miniLOL.content.set(content);
    }
});

})()
