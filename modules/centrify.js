/*
 * This module does near nothing, it just puts the box in the center
 * of the page, as you can see it's really easy writing a module.
 */

function centrify () {
    var container = $('container');

    container.style.top  = ((document.viewport.getHeight() - container.getHeight())/2)-10 + 'px';
    container.style.left = ((document.viewport.getWidth()  - container.getWidth()) /2) + 'px';
}

window.onresize = centrify;
setTimeout('centrify()', 1);
