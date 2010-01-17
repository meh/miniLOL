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

miniLOL.module.create("Theme Switcher", {
    version: "0.1",

    type: "passive",

    initialize: function () {
        miniLOL.resource.load(miniLOL.resources.config, this.root+"/resources/config.xml");

        this.Template = miniLOL.utils.require(this.root+"/system/Template.js");

        var This = this;
        this.resource = {
            name: "themes",

            load: function (themes) {
                if (!this.res) {
                    this.res = {
                        themes: [],
                        template: {}
                    }
                } var res = this.res;

                This.themes   = res.themes;
                This.template = res.template;

                new Ajax.Request(themes, {
                    method: "get",
                    asynchronous: false,

                    onSuccess: function (http) {
                        var dom = miniLOL.utils.fixDOM(http.responseXML);

                        var themes = dom.getElementsByTagName("theme");
                        for (var i = 0; i < themes.length; i++) {
                            res.themes.push(themes[i].getAttribute("name"));
                        }
                    }
                });

                var template = miniLOL.theme.template.load("Theme Switcher/template")
                            || miniLOL.theme.template.load("template", This.root+"/resources");

                if (!template) {
                    throw new Error("Template was not found.");
                }
                    
                This.template.global = template.getElementsByTagName("global")[0].firstChild.nodeValue;
                This.template.theme  = template.getElementsByTagName("theme")[0].firstChild.nodeValue;

                return true;
            }
        }

        if (!miniLOL.resource.load(this.resource, this.root+"/resources/themes.xml")) {
            return false;
        }

        var theme = this.theme = new CookieJar().get("theme");

        Event.observe(document, ":initialized", function (event) {
            miniLOL.module.execute("Theme Switcher", { theme: theme });
        })
    },

    execute: function (args) {
        args["theme"] = args["theme"] || miniLOL.config["Theme Switcher"].defaultTheme;

        if (args["choose"]) {
            this.theme = args["theme"];

            new CookieJar({ expires: 60 * 60 * 24 * 365 }).set("theme", args["theme"]);
        }
        else if (args["chooser"]) {
            miniLOL.content.set(this.parse(null, this.themes));
        }
        else {
            miniLOL.theme.load(args["theme"], true);
        }
    },

    parse: function (type, data) {
        if (!type) {
            var themes = '';
            for (var i = 0; i < data.length; i++) {
                themes += this.parse("theme", data[i]);
            }

            return this.parse("global", themes);
        }
        else if (type == "global") {
            return this.template.global.interpolate({
                data: data
            });
        }
        else if (type == "theme") {
            return this.template.theme.interpolate({
                name: data,
                SELECTED: (data == this.theme) ? "SELECTED" : ""
            });
        }
    }
});
