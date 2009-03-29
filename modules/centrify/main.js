/*
 * This module does near nothing, it just puts the box in the center
 * of the page, as you can see it's really easy writing a module.
 */

miniLOL.module.create("centrify", {
    onLoad: function () {
        this.execute();
        miniLOL.module.addEvent('window.onresize', this.execute);
    },

    execute: function () {
        $('container').setStyle({
            top : ((document.viewport.getHeight() - $('container').getHeight())/2)+'px',
            left: ((document.viewport.getWidth()  - $('container').getWidth() )/2)+'px'
        });
    }
});
