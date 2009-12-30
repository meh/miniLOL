/*
 * This is just a faggy module, it does simple channis wordfiltering.
 */

miniLOL.module.create("wordfilter", {
    words: {
        "/NIGGER/gi": "<span style='color: white; font-weight: bold;'>NIGGER</span>",
        "/vagina/gi": "<span style='color: magenta; font-weight: bold;'>vagina</span>",
    },

    onLoad: function () {
        console.log(this);
        miniLOL.event.add('window.ongo', this.execute);
    },

    execute: function () {
        var content = miniLOL.content.get();

        console.log(this);

        for (var word in this.words) {
            content = content.replace(eval(word), this.words[word]);
        }

        miniLOL.content.set(content);
    }
});
