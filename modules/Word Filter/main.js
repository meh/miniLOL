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

miniLOL.module.create("Word Filter", {
    initialize: function () {
        this.filters = miniLOL.utils.require(this.root+"/system/Filters.js");
        this.filters.load(this.root+"/resources/words.xml");

        Event.observe(document, ":go", this.execute);

        Event.observe(document, ":refresh", function () {
            miniLOL.module.get("Word Filter").filters.reload();
        });
    },

    execute: function () {
        miniLOL.content.set(this.filters.apply(miniLOL.content.get()));
    }
});
