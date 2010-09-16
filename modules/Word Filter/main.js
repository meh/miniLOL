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

miniLOL.module.create('Word Filter', {
    version: '0.1',

    initialize: function () {
        this.filters = miniLOL.utils.execute(this.root + '/system/Filters.min.js');
        this.filters.load(this.root + '/resources/words.xml');

        Event.observe(document, ':go', this.execute);

        Event.observe(document, ':refresh', function () {
            miniLOL.module.get('Word Filter').filters.reload();
        });
    },

    execute: function () {
        var filters = this.filters
        
        miniLOL.theme.content().getTextDescendants().each(function (text) {
            text.nodeValue = filters.apply(text.nodeValue).replace(/</g, '\x01<\x01').replace(/>/g, '\x01>\x01').replace(/&/g, '\x01&\x01');
        });

        miniLOL.theme.content().innerHTML = miniLOL.theme.content().innerHTML.replace(/\x01&lt;\x01/g, '<').replace(/\x01&gt;\x01/g, '>').replace(/\x01&amp;\x01/g, '&');
    }
});
