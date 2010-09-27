/*********************************************************************
*           DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE              *
*                   Version 2, December 2004                         *
*                                                                    *
*  Copyleft meh. [http://meh.doesntexist.org | meh@paranoici.org]    *
*                                                                    *
*           DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE              *
*  TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION   *
*                                                                    *
*  0. You just DO WHAT THE FUCK YOU WANT TO.                         *
*********************************************************************/

miniLOL.module.create("Markdown", {
    version: "0.1",

    initialize: function () {
        miniLOL.utils.require(this.root+"/system/showdown.min.js");
        
        this.converter = new Showdown.converter;

        miniLOL.resource.get("miniLOL.config").load(this.root+"/resources/config.xml");
        miniLOL.resource.get("miniLOL.functions").load(this.root+"/resources/functions.xml");

        Event.observe(document, ":resource.loaded", function (event) {
            if (event.memo.resource.name != "miniLOL.config") {
                return;
            }

            if (!miniLOL.config["Markdown"]["class"]) {
                miniLOL.config["Markdown"]["class"] = "markdown";
            }
        });

        Event.observe(document, ":go", function () {
            this.execute()
        }.bind(this));
    },

    execute: function (elements) {
        if (Object.isString(elements)) {
            return this.converter.makeHtml(elements);
        }
        else if (Object.isElement(elements)) {
            elements = [elements];
        }
        else {
            elements = $$(".#{0}".interpolate([miniLOL.config["Markdown"]["class"]]));
        }

        elements.each(function (element) {
            element.innerHTML = this.converter.makeHtml(element.innerHTML);
        }, this);
    }
});
