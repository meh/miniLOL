/*
 * This is just a faggy module, it colors NIGGER.
 */

miniLOL.module.create("colorify", {
    onLoad: function () {
        miniLOL.event.add('window.ongo', this.execute);
    },

    execute: function () {
        miniLOL.content.set(miniLOL.content.get().replace(/NIGGER/gi, "<span class='nigguz'>NIGGER</span>"));
    }
});
