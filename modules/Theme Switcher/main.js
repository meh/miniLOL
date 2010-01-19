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
    version: "0.2",

    type: "passive",

    initialize: function () {
        miniLOL.resource.load(miniLOL.resources.config, this.root+"/resources/config.xml");

        this.Themes = miniLOL.utils.require(this.root+"/system/Themes.js");
        this.themes = new this.Themes("template", this.root+"/resources");
        
        if (!this.themes.load(this.root+"/resources/themes.xml")) {
            return false;
        }

        var theme = new CookieJar().get("theme");
        if (this.themes.exists(theme) < 0) {
            this.theme = miniLOL.config["Theme Switcher"].defaultTheme;
        }
        else {
            this.theme = theme;
        }

        Event.observe(document, ":module.loaded", function (event) {
            if (event.memo == "Theme Switcher") {
                miniLOL.module.execute("Theme Switcher", { theme: miniLOL.module.get("Theme Switcher").theme });
            }
        })
    },

    execute: function (args) {
        args["theme"] = args["theme"] || miniLOL.config["Theme Switcher"].defaultTheme;

        if (args["choose"]) {
            this.theme = args["theme"];

            new CookieJar({ expires: 60 * 60 * 24 * 365 }).set("theme", args["theme"]);
        }
        else if (args["chooser"]) {
            miniLOL.content.set(this.parse(null, this.themes.toArray()));
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
            return this.themes.template().global.interpolate({
                data: data
            });
        }
        else if (type == "theme") {
            return this.themes.template().theme.interpolate({
                name: data,
                SELECTED: (data == this.theme) ? "SELECTED" : ""
            });
        }
    }
});
