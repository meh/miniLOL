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

(function () {

var Filters = {};

Filters.paths   = [];
Filters.filters = [];

Filters.Filter = Class.create({
    initialize: function (node, censor) {
        this.type = node.getAttribute('type') || 'censor';

        if (node.getAttribute('regexp')) {
            this.regexp = eval(node.getAttribute('regexp'));
        }
        else if (node.getAttribute('raw')) {
            this.regexp = new RegExp(node.getAttribute('raw'), 'gi');
        }

        if (this.type == 'censor') {
            this.to = censor || '@#!%$';
        }
        else if (this.type == 'replace') {
            this.to = node.getAttribute('to') || '$1';
        }
        else {
            this.to = '$1';
        }
    },

    apply: function (text) {
        return text.replace(this.regexp, this.to);
    },

    toString: function () {
        return 's/#{regexp}/#{to}/gi'.interpolate(this);
    }
});

Filters.apply = function (text) {
    this.filters.each(function (filter) {
        text = filter.apply(text);
    });

    return text;
}

Filters.load = function (path) {
    new Ajax.Request(path, {
        method: 'get',
        asynchronous: false,

        onSuccess: function (http) {
            var error = miniLOL.Document.check(http.responseXML);
            if (error) {
                miniLOL.error('Error while parsing `#{filter}`\n\n#{error}'.interpolate({
                    filter: path,
                    error: error
                }));

                return;
            }

            var dom = miniLOL.Document.fix(http.responseXML);
            
            dom.xpath('/filters/filter').each(function (filter) {
                Filters.filters.push(new Filters.Filter(filter, dom.documentElement.getAttribute('censor')));
            });

            Filters.paths.push(path);
        }
    });
}

Filters.reload = function () {
    var paths = Filters.paths;

    Filters.filters = [];
    Filters.paths   = [];

    paths.each(function (path) {
        Filters.load(path);
    });
}

return Filters;

})();
