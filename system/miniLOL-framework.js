/*
 Copyleft meh. [http://meh.doesntexist.org | meh.ffff@gmail.com]

 This file is part of miniLOL.

 miniLOL is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as
 published by the Free Software Foundation, either version 3 of the
 License, or (at your option) any later version.

 miniLOL is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with miniLOL.  If not, see <http://www.gnu.org/licenses/>.
*/


/* Cross-Browser faggotree */
(function () {

if (Prototype.Browser.IE) {
    Prototype.Browser.InternetExplorer = true;
}

if (Prototype.Browser.Gecko) {
    Prototype.Browser.Mozilla = true;
}

if (navigator.userAgent.match(/Chrome/)) {
    Prototype.Browser.Chrome = true;
}

if (navigator.userAgent.match(/Safari/) && !Prototype.Browser.Chrome) {
    Prototype.Browser.Safari = true;
}

if (Prototype.Browser.Mozilla || Prototype.Browser.Opera) {
    Prototype.Browser.Good = true;
}
else {
    Prototype.Browser.Bad = true;
}

Prototype.Browser.Name = window.navigator.appName;

var version = window.navigator.appVersion;

try {
    if (Prototype.Browser.IE) {
        Prototype.Browser.Version = parseFloat(version.match(/MSIE ([^;]*)/)[1]);
    }
    else if (Prototype.Browser.Mozilla || Prototype.Browser.Opera) {
        Prototype.Browser.Version = parseFloat(version);
    }
    else {
        throw null;
    }
}
catch (e) {
    Prototype.Browser.Version = 0;
}

if (Prototype.Browser.IE) {
    Error.prototype.toString = function () {
        return '#{name}: #{description}<br/><br/>#{stack}'.interpolate({
            name:        this.name,
            description: this.description,
            stack:       (this.stack || '').replace(/\n/g, '<br/>')
        });
    };
}
else if (Prototype.Browser.Opera) {
    Error.prototype.toString = function () {
        return '#{name}: #{message}'.interpolate(this);
    };
}
else if (Prototype.Browser.Gecko) {
    Error.prototype.toString = function () {
        return '#{name}: #{message}<br/><br/>#{stack}'.interpolate({
            name:       this.name,
            message:    this.message,
            stack:      this.stack.replace(/\n/g, '<br/>')
        });
    };
}
else if (Prototype.Browser.Chrome || Prototype.Browser.Safari) {
    Error.prototype.toString = function () {
        return '#{name}: #{message}<br/><br/>#{stack}'.interpolate({
            name:    this.name,
            message: this.message,
            stack:   this.stack.replace(/\n/g, '<br/>')
        });
    };
}

/* TODO: This shit doesn't work properly, it crashed IE 8 and doesn't do anything on IE 6
if (Prototype.Browser.IE) {
    (function () {
        function addBehaviors (style) {
            $A(style.rules).each(function (rule) {
                if (rule.style['border-radius']) {
                    rule.style['behavior'] = 'url(system/PIE.htc)';
                }
            });
        }

        Event.observe(document, ':initialized', function (event) {
            $A(document.styleSheets).each(function (style) {
                addBehaviors(style);
            });
        });

        Event.observe(document, ':css.create', function (event) {
            addBehaviors(event.memo);
        });
    })();
}
*/

if (Prototype.Browser.IE) {
    if (!window.DOMParser) {
        window.DOMParser = Class.create({
            parseFromString: function (string) {
                var xml = new AciveXObject('Microsoft.XMLDOM');

                xml.async = 'false';
                xml.loadXML(string);

                return xml;
            }
        });
    }

    if (!window.XMLSerializer) {
        window.XMLSerializer = Class.create({
            serializeToString: function (node) {
                return node.xml
            }
        });
    }
}

})();



Object.extend(Function, (function () {
    function parse (string) {
        matches = string.match(/^function\s*\((.*?)\)[\s\n]*\{([\s\S]*)\}[\s\n]*/m);

        if (!matches) {
            return null;
        }

        var signature = matches[1].split(/\s*,\s*/);
        var body      = matches[2];

        return new Function(signature, body);
    }

    return {
        parse: parse
    };
})());

Object.extend(Function.prototype, (function () {
    function clone () {
        return Function.parse(this.toString());
    }

    return {
        clone: clone
    };
})());

Object.extend(Object, (function () {
    function isBoolean (val) {
        return typeof val == 'boolean' || val.constructor === Boolean;
    }

    function isObject (val) {
        return typeof val == 'object';
    }

    function isDocument (val) {
        return val.toString().include('Document');
    }

    function isXML (val) {
        if (typeof val !== 'object') {
            return false;
        }

        val = val.ownerDocument || val;

        if (!val.documentElement) {
            return false;
        }

        return val.documentElement.nodeName != "HTML";
    }

    function fromAttributes (attributes) {
        var result = {};

        for (var i = 0; i < attributes.length; i++) {
            result[attributes.item(i).nodeName] = attributes.item(i).nodeName;
        }

        return result;
    }

    function toQueryString (query) {
        var result = '';

        for (var name in query) {
            result += '#{name}=#{value}&'.interpolate({
                name: name,
                value: query[name]
            });
        }

        return result.substr(0, result.length - 1);
    }

    if (!Object.isFunction(Object.defineProperty)) {
        function defineProperty (object, property, descriptor) {
            if (Object.isFunction(descriptor.get) && Object.isFunction(object.__defineGetter__)) {
                object.__defineGetter__(property, descriptor.get);
            }

            if (Object.isFunction(descriptor.set) && Object.isFunction(object.__defineSetter__)) {
                object.__defineSetter__(property, descriptor.set);
            }
        }
    }
    else {
        var defineProperty = Object.defineProperty;
    }

    if (!Object.isFunction(Object.defineProperties)) {
        Object.defineProperties = function (object, properties) {
            for (var property in properties) {
                Object.defineProperty(object, property, properties[property]);
            }
        };
    }
    else {
        var defineProperties = Object.defineProperties;
    }

    if (!Object.isFunction(Object.create)) {
        Object.create = function (proto, properties) {
            var obj = new Object(proto);

            Object.defineProperties(obj, properties);

            return obj;
        };
    }
    else {
        var create = Object.create;
    }

    return {
        isBoolean:  isBoolean,
        isObject:   isObject,
        isDocument: isDocument,
        isXML:      isXML,

        fromAttributes: fromAttributes,
        toQueryString:  toQueryString,

        defineProperty:   defineProperty,
        defineProperties: defineProperties,
        create:           create
    };
})());


Object.extend(String, (function () {
    function fromAttributes (attributes) {
        var result = '';

        for (var i = 0; i < attributes.length; i++) {
            result += '#{name}="#{value}" '.interpolate({
                name: attributes.item(i).nodeName,
                value: attributes.item(i).nodeValue
            });
        }

        return result;
    }

    function fromXML (node) {
        if (!Object.isXML(node)) {
            return false;
        }

        return new XMLSerializer().serializeToString(node);
    }

    return {
        fromAttributes: fromAttributes,
        fromXML:        fromXML
    };
})());

Object.extend(String.prototype, (function () {
    function toQueryParams () {
        var result  = {};
        var matches = this.match(/[?#](.*)$/);

        if (!matches) {
            return result;
        }

        var blocks = matches[1].split(/&/);
        for (var i = 0; i < blocks.length; i++) {
            var parts = blocks[i].split(/=/);
            var name  = parts[0].decodeURIComponent();

            if (parts[1]) {
                result[name] = parts[1].decodeURIComponent();
            }
            else {
                result[name] = true;
            }
        }

        return result;
    }

    function toXML () {
        return new DOMParser().parseFromString(this, 'text/xml');
    }

    function isURL () {
        return /^(\w+):(\/\/.+?(:\d)?)(\/)?/.test(this) || /^mailto:([\w.%+-]+@[\w.]+\.[A-Za-z]{2,4})$/.test(this);
    }

    function parseURL () {
        var match;

        if (match = this.match(/^mailto:(([\w.%+-]+)@([\w.]+\.[A-Za-z]{2,4}))$/)) {
            return {
                protocol: 'mailto',
                uri:      match[1],
                user:     match[2],
                host:     match[3]
            };
        }

        if (match = this.match(/^((\w+):\/\/(((.+?)(:(\d+))?)(\/.*)?))$/)) {
            return {
                full:     match[1],
                protocol: match[2],
                uri:      match[3],
                host:     match[4],
                hostname: match[5],
                port:     match[7],
                path:     match[8]
            };
        }

        return false;
    }

    function blank () {
        return this == 0;
    }

    function getHashFragment () {
        var matches = this.match(/(#.*)$/);

        return (matches) ? matches[1] : '';
    }

    var _encodeURI          = window.encodeURI;
    var _decodeURI          = window.decodeURI;
    var _encodeURIComponent = window.encodeURIComponent;
    var _decodeURIComponent = window.decodeURIComponent;

    function encodeURI () {
        return _encodeURI(this);
    }

    function decodeURI () {
        return _decodeURI(this);
    }

    function encodeURIComponent () {
        return _encodeURIComponent(this);
    }

    function decodeURIComponent () {
        return _decodeURIComponent(this);
    }

    return {
        toQueryParams: toQueryParams,
        toXML:         toXML,

        isURL:    isURL,
        parseURL: parseURL,

        blank: blank,

        getHashFragment: getHashFragment,

        encodeURI:          encodeURI,
        decodeURI:          decodeURI,
        encodeURIComponent: encodeURIComponent,
        decodeURIComponent: decodeURIComponent
    };
})());

window.Element.addMethods((function () {
    function load (path, options) {
        if (options && !Object.isUndefined(options.frequency)) {
            new Ajax.PeriodicalUpdater(this, path, options);
        }
        else {
            new Ajax.Updater(this, path, options);
        }
    }

    var xpath;

    if (Prototype.Browser.IE) {
        xpath = function (element, query) {
            if (Object.isUndefined(query)) {
                query   = element;
                element = this;
            }

            var result = [];
            var tmp    = element.selectNodes(query);

            for (var i = 0; i < tmp.length; i++) {
                result.push(tmp.item(i));
            }

            return result;
        }
    }
    else {
        xpath = function (element, query) {
            if (Object.isUndefined(query)) {
                query   = element;
                element = this;
            }

            var result = [];
            var tmp    = (element.ownerDocument || element).evaluate(query, element, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

            for (var i = 0; i < tmp.snapshotLength; i++) {
                result.push(tmp.snapshotItem(i));
            }

            return result;
        }
    }

    function select (element, query) {
        if (Object.isUndefined(query)) {
            query   = element;
            element = this;
        }

        return Prototype.Selector.select(query, element);
    }

    function getTextDescendants (element) {
        element = element || this;

        var result = [];

        function accumulateTextChildren (parent) {
            var child = parent.firstChild;

            while (child) {
                if (Node.TEXT_NODE == child.nodeType) {
                    result.push(child);
                }

                if (Object.isElement(child)) {
                    accumulateTextChildren(child);
                }

                child = child.nextSibling;
            }
        }

        accumulateTextChildren(element);

        return result;
    }

    function getFirstText (elements) {
        elements = elements || this;

        var result = '';

        if (Object.isElement(elements)) {
            elements = $A(elements.childNodes);
        }
        else if (!Object.isArray(elements)) {
            elements = $A(elements);
        }


        elements.each(function (element) {
            switch (element.nodeType) {
                case Node.ELEMENT_NODE:
                throw $break;
                break;

                case Node.CDATA_SECTION_NODE:
                case Node.TEXT_NODE:
                if (!element.nodeValue.blank()) {
                    result = element.nodeValue.strip();
                    throw $break;
                }
                break;
            }
        });

        return result;
    }

    function toObject (element) {
        element = element || this;

        var result = {};

        if (!Object.isElement(element) && !Object.isDocument(element)) {
            return result;
        }

        $A(element.childNodes).each(function (node) {
            if (node.nodeType != Node.ELEMENT_NODE) {
                return;
            }

            if (node.getElementsByTagName('*').length == 0) {
                var content = '';

                $A(node.childNodes).each(function (text) {
                    if (text.nodeType != Node.CDATA_SECTION_NODE && text.nodeType != Node.TEXT_NODE) {
                        return;
                    }

                    if (text.nodeValue.blank()) {
                        return;
                    }

                    content += text.nodeValue;
                });

                result[node.nodeName] = content;
            }
            else {
                result[node.nodeName] = Element.toObject(node);
            }
        });

        return result;
    }

    return {
        load:               load,
        xpath:              xpath,
        select:             select,
        getTextDescendants: getTextDescendants,
        getFirstText:       getFirstText,
        toObject:           toObject
    };
})());

if (!Object.isObject(window.miniLOL)) {
    window.miniLOL = {
        error: Prototype.emptyFunction
    };
}


miniLOL.utils = {
    exists: function (path) {
        var result = false;

        new Ajax.Request(path, {
            method: 'head',
            asynchronous: false,

            onSuccess: function () {
                result = true;
            }
        });

        return result;
    },

    execute: function (path) {
        var result;
        var error;

        new Ajax.Request(path, {
            method: 'get',
            asynchronous: false,
            evalJS: false,

            onSuccess: function (http) {
                try {
                    result = window.eval(http.responseText);
                }
                catch (e) {
                    error             = e;
                    error.fileName    = path;
                    error.lineNumber -= 5;
                }
            },

            onFailure: function (http) {
                error = new Error('Failed to retrieve `#{file}` (#{status} - #{statusText}).'.interpolate({
                    file:       path,
                    status:     http.status,
                    statusText: http.statusText
                }));

                error.fileName   = path;
                error.lineNumber = 0;
            }
        });

        if (error) {
            throw error;
        }

        return result;
    },

    include: function (path) {
        var result = false;

        new Ajax.Request(path, {
            method: 'get',
            asynchronous: false,
            evalJS: false,

            onSuccess: function (http) {
                try {
                    window.eval(http.responseText);
                    result = true;
                } catch (e) {
                    result = false;
                }
            }
        });

        return result;
    },

    require: function (path) {
        var error = false;

        new Ajax.Request(path, {
            method: 'get',
            asynchronous: false,
            evalJS: false,

            onSuccess: function (http) {
                try {
                    window.eval(http.responseText);
                } catch (e) {
                    error             = e;
                    error.fileName    = path;
                    error.lineNumber -= 5;
                }
            },

            onFailure: function (http) {
                error = new Error('Failed to retrieve `#{file}` (#{status} - #{statusText}).'.interpolate({
                    file:       path,
                    status:     http.status,
                    statusText: http.statusText
                }));

                error.fileName   = path;
                error.lineNumber = 0;

                error.http = {
                    status: http.status,
                    text:   http.statusText
                };
            }
        });

        if (error) {
            throw error;
        }

        return true;
    }
};


miniLOL.History = {
    interval: 0.15,

    initialize: function () {
        miniLOL.History.current = window.location.hash;

        if (Prototype.Browser.Opera && history.navigationMode) {
            history.navigationMode = 'compatible';
        }

        Event.observe(document, ':url.change', function (event) {
            miniLOL.History.current = event.memo;
        });

        miniLOL.History.Initializers.get().call()
    },

    reset: function (interval, callback) {
        if (Object.isNumber(interval)) {
            miniLOL.History.interval = interval;
        }

        if (!Object.isUndefined(miniLOL.History.timer)) {
            clearInterval(miniLOL.History.timer);
        }

        miniLOL.History.timer = setInterval(callback, miniLOL.History.interval * 1000);
    },

    Initializers: {
        get: function () {
            if ('onhashchange' in window && !(Prototype.Browser.InternetExplorer && Prototype.Browser.Version == 7)) {
                return miniLOL.History.Initializers.Default;
            }
            else if (Prototype.Browser.InternetExplorer) {
                return miniLOL.History.Initializers.InternetExplorer;
            }
            else {
                return miniLOL.History.Initializers.Unsupported;
            }
        },

        Default: function () {
            Event.observe(window, 'hashchange', function (event) {
                 Event.fire(document, ':url.change', (Prototype.Browser.Mozilla)
                    ? window.location.hash.substring(1)
                    : decodeURIComponent(window.location.hash.substring(1))
                );
            });
        },

        Unsupported: function () {
            document.observe('dom:loaded', function () {
                miniLOL.History.reset(miniLOL.History.interval, miniLOL.History.Checkers.Default);
            });
        },

        InternetExplorer: function () {
            document.observe('dom:loaded', function () {
                miniLOL.History.IE = {
                    check: function () {
                        if (!miniLOL.History.IE.element.parentNode || miniLOL.History.IE.element.parentNode.nodeName == '#document-fragment') {
                            $(document.body).insert({ top: miniLOL.History.IE.element });
                        }
                    },

                    put: function (hash) {
                        miniLOL.History.IE.check();

                        var doc = miniLOL.History.IE.element.contentWindow.document;

                        doc.open();
                        doc.close();

                        doc.location.hash = encodeURIComponent(hash.substring(1));
                    },

                    get: function () {
                        miniLOL.History.IE.check();

                        return miniLOL.History.IE.element.contentWindow.document.location.hash;
                    },

                    element: new Element('iframe', { id: '__miniLOL.History', style: 'display: none !important; z-index: -9001 !important;', src: 'javascript:false;' })
                };

                var first = miniLOL.History.current;

                $(document.body).insert({ top: miniLOL.History.IE.element });
                miniLOL.History.IE.put(first);
                miniLOL.History.reset(miniLOL.History.interval, miniLOL.History.Checkers.InternetExplorer);
            });
        }
    },

    Checkers: {
        Default: function () {
            if (miniLOL.History.current == window.location.hash) {
                return;
            }

            Event.fire(document, ':url.change', (Prototype.Browser.Mozilla)
                ? window.location.hash.substring(1)
                : decodeURIComponent(window.location.hash.substring(1))
            );
        },

        InternetExplorer: function () {
            var hashes = {
                iframe: miniLOL.History.IE.get(),
                actual: window.location.hash,
                current: miniLOL.History.current
            };

            if (hashes.actual != hashes.iframe) {
                if (hashes.actual && hashes.actual == hashes.current) { // The user is moving in the History
                    window.location.hash = miniLOL.History.current = hashes.iframe;
                }
                else { // The user went to the actual URL
                    miniLOL.History.IE.put(miniLOL.History.current = hashes.actual);
                }

                Event.fire(document, ':url.change', miniLOL.History.current);
            }
        }
    }
}

miniLOL.History.initialize();

miniLOL.Resource = Class.create({
    initialize: function (name, wrapper) {
        if (!wrapper) {
            throw new Error('No wrapper has been passed.');
        }

        this.name    = name;
        this.wrapper = wrapper;

        if (!this.wrapper.clear) {
            this.wrapper.clear = function () {
                this.data = {};
            }
        }

        for (var func in this.wrapper) {
            if (Object.isFunction(this.wrapper[func])) {
                if (this.wrapper[func].parent == this.wrapper) {
                    break;
                }

                this.wrapper[func]        = this.wrapper[func].bind(this.wrapper);
                this.wrapper[func].parent = this.wrapper;
            }

            if (Object.isUndefined(this[func])) {
                this[func] = this.wrapper[func];
            }
        }

        this.clear();
        this.flush();

        if (this.wrapper.initialize) {
            this.wrapper.initialize();
        }
    },

    load: function () {
        var result;
        var args = $A(arguments);

        Event.fire(document, ':resource.load', { resource: this, arguments: args });

        this.calls.push(args);

        try {
            result = this.wrapper.load.apply(this.wrapper, args);
        }
        catch (e) {
            miniLOL.error('Error while loading `#{name}` resource.\n#{error}'.interpolate({
                name: this.name,
                error: e.toString()
            }));

            return false;
        }

        Event.fire(document, ':resource.loaded', { resource: this, arguments: args });

        return result;
    },

    reload: function () {
        Event.fire(document, ':resource.reload', { resource: this });

        this.wrapper.clear();

        var calls = this.flush();

        calls.each(function (call) {
            this.load.apply(this, call);
        }, this);

        Event.fire(document, ':resource.reloaded', { resource: this });
    },

    clear: function () {
        Event.fire(document, ':resource.clear', { resource: this });
        this.wrapper.clear();
    },

    flush: function (call) {
        Event.fire(document, ':resource.flush', { resource: this, call: call });

        var result;

        if (Object.isArray(call)) {
            result = this.calls.find(function (current) {
                if (current.length != call.length) {
                    return false;
                }

                var equal = false;

                for (var i = 0; i < current.length; i++) {
                    if (call[i] == current[i]) {
                        equal = true;
                    }

                    if (!equal) {
                        break;
                    }
                }

                return equal;
            });

            if (result) {
                this.calls = this.calls.filter(function (current) {
                    return current != result;
                });
            }
        }
        else {
            result     = this.calls;
            this.calls = [];
        }

        return result;
    },

    data: function () {
        return this.wrapper.data;
    }
});

miniLOL.JSON = Class.create({
    initialize: function (data) {
        this.replace(data);
    },

    get: function (key) {
        return this.data[key];
    },

    set: function (key, value) {
        return this.data[key] = value;
    },

    remove: function (key) {
        var tmp = this.data[key];

        delete this.data[key];

        return tmp;
    },

    clear: function () {
        var tmp   = this.data;
        this.data = {};

        return tmp;
    },

    replace: function (data) {
        var tmp = this.data;

        if (Object.isString(data)) {
            this.data = miniLOL.JSON.unserialize(data);
        }
        else {
            this.data = Object.extend({}, data);
        }

        return tmp;
    },

    toString: function () {
        return miniLOL.JSON.serialize(this.data) || '{}';
    }
});

miniLOL.JSON.parse = function (raw) {
    return new miniLOL.JSON(raw);
}

miniLOL.JSON.serializeSpecial = function (obj) {
    if (typeof obj !== 'object') {
        return obj;
    }

    obj = Object.clone(obj);

    for (var key in obj) {
        if (Object.isXML(obj[key])) {
            obj[key] = { __miniLOL_is_xml: true, value: String.fromXML(obj[key]) };
        }
        else if (Object.isFunction(obj[key])) {
            obj[key] = { __miniLOL_is_function: true, value: obj[key].toString() };
        }
        else {
            obj[key] = miniLOL.JSON.serializeSpecial(obj[key]);
        }
    }

    return obj;
};

miniLOL.JSON.unserializeSpecial = function (obj) {
    if (typeof obj !== 'object') {
        return obj;
    }

    obj = Object.clone(obj);

    for (var key in obj) {
        if (obj[key].__miniLOL_is_xml) {
            obj[key] = obj[key].value.toXML();
        }
        else if (obj[key].__miniLOL_is_function) {
            obj[key] = Function.parse(obj[key].value);
        }
        else {
            obj[key] = miniLOL.JSON.unserializeSpecial(obj[key]);
        }
    }

    return obj;
};

miniLOL.JSON.serialize = function (obj) {
    try {
        return Object.toJSON(miniLOL.JSON.serializeSpecial(obj));
    }
    catch (e) {
        return false;
    }
};

miniLOL.JSON.unserialize = function (string) {
    if (!Object.isString(string)) {
        return null;
    }

    try {
        return miniLOL.JSON.unserializeSpecial(string.evalJSON());
    }
    catch (e) {
        return null;
    }
};

miniLOL.Cookie = {
    get: function (key, options) {
        var options = miniLOL.Cookie.options(options);
        var matches = window.document.cookie.match(RegExp.escape(key.encodeURIComponent()) + '=([^;]*)', 'g');

        if (!matches) {
            return;
        }

        var result = [];

        $A(matches).each(function (cookie) {
            cookie = cookie.match(/^.*?=(.*)$/)[1].decodeURIComponent();

            result.push((options.raw) ? cookie : miniLOL.JSON.unserialize(cookie) || cookie);
        });

        if (result.length == 1) {
            result = result[0];
        }

        return result;
    },

    set: function (key, value, options) {
        var options = miniLOL.Cookie.options(options);

        if (!options.raw) {
            value = miniLOL.JSON.serialize(value) || value;
        }

        window.document.cookie = miniLOL.Cookie.encode(key, value, options);
    },

    remove: function (key, options) {
        window.document.cookie = miniLOL.Cookie.encode(key, '', Object.extend(miniLOL.Cookie.options(options), {
            expires: new Date(0)
        }));
    },

    clear: function () {
        miniLOL.Cookie.keys().each(function (cookie) {
            miniLOL.Cookie.remove(cookie);
        });
    },

    keys: function () {
        var result = [];

        $A(window.document.cookie.split(/; /)).each(function (cookie) {
            cookie = cookie.split(/=/);

            if (cookie[1]) {
                result.push(cookie[0]);
            }
        });

        return result.uniq();
    },

    encode: function (key, value, options) {
        return "#{key}=#{value}; #{maxAge}#{expires}#{path}#{domain}#{secure}".interpolate({
            key:   key.encodeURIComponent(),
            value: value.encodeURIComponent(),

            maxAge:  (!Object.isUndefined(options.maxAge))  ? 'max-age=#{0}; '.interpolate([options.maxAge]) : '',
            expires: (!Object.isUndefined(options.expires)) ? 'expires=#{0}; '.interpolate([options.expires.toUTCString()]) : '',
            path:    (!Object.isUndefined(options.path))    ? 'path=#{0}; '.interpolate([options.path]) : '',
            domain:  (!Object.isUndefined(options.domain))  ? 'domain=#{0}; '.interpolate([options.domain]) : '',

            secure: (options.secure) ? 'secure' : ''
        });
    },

    options: function (options) {
        return Object.extend({
            expires: new Date(new Date().getTime() + 3600 * 1000),
            path:    '',
            domain:  '',
            secure:  '',

            raw: false
        }, options || {});
    }
};

miniLOL.Storage = Class.create({
    initialize: function (name, backend) {
        this.name    = name;

        this.backend = (miniLOL.Storage.Instances[name])
            ? miniLOL.Storage.Instances[name]
            : new (backend || miniLOL.Storage.Backends.available())(name);

        miniLOL.Storage.Instances[name] = this.backend;
    },

    get: function (key) {
        return this.backend.get(key.toString());
    },

    set: function (key, value, noSave) {
        return this.backend.set(key.toString(), value, noSave);
    },

    remove: function (key, noSave) {
        return this.backend.remove(key.toString(), noSave);
    },

    clear: function (noSave) {
        return this.backend.clear(noSave);
    },

    size: function () {
        return this.backend.size;
    },

    save: function () {
        this.backend.save();
    }
});

miniLOL.Storage.Instances = {};

miniLOL.Storage.Backend = Class.create(miniLOL.JSON, {
    initialize: function ($super, name, data) {
        $super(data);

        this.name = miniLOL.Storage.Backend.filter(name);

        if (Object.isString(data)) {
            this.size = data.size;
        }
    },

    get: function ($super, key) {
        return $super(key);
    },

    set: function ($super, key, value, noSave) {
        var result = $super(key, value);

        if (!noSave) {
            this.save();
        }

        return result;
    },

    remove: function ($super, key, noSave) {
        var result = $super(key);

        if (!noSave) {
            this.save();
        }

        return result;
    },

    clear: function ($super, noSave) {
        var result = $super();

        if (!noSave) {
            this.save();
        }

        return result;
    },

    replace: function ($super, data) {
        if (Object.isString(data)) {
            this.size = data.length;
        }
        else {
            this.size = 0;
        }

        return $super(data);
    }
});

Object.extend(miniLOL.Storage.Backend, {
    filter: function (value) {
        return value.replace(/\s/g, '');
    }
});

miniLOL.Storage.Backends = {
    available: function () {
        try {
            if (window.localStorage) {
                return miniLOL.Storage.Backends.LocalStorage;
            }
            else if (window.globalStorage) {
                return miniLOL.Storage.Backends.GlobalStorage;
            }
            else if (document.body.addBehavior) {
                return miniLOL.Storage.Backends.UserDataBehavior;
            }
            else {
                return miniLOL.Storage.Backends.Cookie;
            }
        }
        catch (e) {
            return miniLOL.Storage.Backends.Null;
        }
    },

    LocalStorage: Class.create(miniLOL.Storage.Backend, {
        initialize: function ($super, name) {
            $super(name);

            this.replace(window.localStorage['__miniLOL.storage.' + this.name] || '{}');
        },

        save: function () {
            var raw = this.toString();

            this.size = raw.length;

            window.localStorage['__miniLOL.storage.' + this.name] = raw;
        }
    }),

    GlobalStorage: Class.create(miniLOL.Storage.Backend, {
        initialize: function ($super, name) {
            $super(name);

            this.replace(window.globalStorage[window.location.hostname]['__miniLOL.storage.' + this.name] || '{}');
        },

        save: function () {
            var raw = this.toString();

            this.size = raw.length;

            window.globalStorage[window.location.hostname]['__miniLOL.storage.' + this.name] = raw;
        }
    }),

    UserDataBehavior: Class.create(miniLOL.Storage.Backend, {
        initialize: function ($super, name) {
            $super(name);

            this.element = document.createElement('link');
            this.element.addBehavior('#default#userData');
            $$('head')[0].appendChild(this.element);
            this.element.load('__miniLOL.storage.' + name);

            var raw   = this.element.getAttribute('__miniLOL.storage.' + this.name) || '{}';
            this.size = raw.length;
            this.replace(raw);
        },

        save: function () {
            var raw = this.toString();

            this.size = raw.length;

            this.element.setAttribute('__miniLOL.storage.' + this.name, raw);
            this.element.save('__miniLOL.storage.' + this.name);
        }
    }),

    Cookie: Class.create(miniLOL.Storage.Backend, {
        initialize: function ($super, name) {
            $super(name);

            this.replace(miniLOL.Cookie.get('__miniLOL.storage.' + this.name, { raw: true }) || '{}');
        },

        save: function () {
            var raw = this.toString();

            this.size = raw.length;

            miniLOL.Cookie.set('__miniLOL.storage.' + this.name, raw, { expires: 60 * 60 * 24 * 365, raw: true });
        }
    }),

    Null: Class.create(miniLOL.Storage.Backend, {
        save: Prototype.emptyFunction
    })
};


miniLOL.Document = (function () {
    var fix;

    if (Prototype.Browser.IE) {
        fix = function (obj) {
            if (!obj) {
                return;
            }

            obj = { real: obj };

            obj.documentElement = obj.real.documentElement;

            obj.getElementsByTagName = function (name) {
                return this.real.getElementsByTagName(name);
            };

            obj.getElementById = (function (id) {
                return Element.xpath(this, "//*[@id='#{0}']".interpolate([id])).first();
            }).bind(obj.real);

            obj.real.setProperty('SelectionLanguage', 'XPath');

            obj.xpath  = Element.xpath.bind(obj.real);
            obj.select = Element.select.bind(obj.real);

            return obj;
        }
    }
    else if (!Prototype.Browser.Good) {
        fix = function (obj) {
            if (!obj) {
                return;
            }

            obj.getElementById = function (id) {
                return this.xpath("//*[@id='#{0}']".interpolate([id])).first();
            };

            obj.xpath  = Element.xpath;
            obj.select = Element.select;

            return obj;
        }
    }
    else {
        fix = function (obj) {
            if (!obj) {
                return;
            }

            obj.xpath  = Element.xpath;
            obj.select = Element.select;

            return obj;
        }
    }

    function check (xml, path) {
        var error = false;

        if (!xml) {
            error = 'There is a syntax error.';
        }

        if (xml.documentElement.nodeName == 'parsererror') {
            error = xml.documentElement.textContent;
        }

        if (path && error) {
            miniLOL.error('Error while parsing #{path}\n\n#{error}'.interpolate({
                path:  path,
                error: error
            }), true);

            return error;
        }

        return error;
    }

    return {
        fix:   fix,
        check: check
    };
})();

miniLOL.CSS = (function () {
    function include (path) {
        var style = false;

        if (!(style = $$('link').find(function (css) { return css.getAttribute('href') == path })) && miniLOL.utils.exists(path)) {
            style = new Element('link', {
                rel: 'stylesheet',
                href: path,
                type: 'text/css'
            });

            $$('head')[0].insert(style);

            Event.fire(document, ':css.included', style);
        }

        return style;
    }

    function create (style, id) {
        var css = new Element('style', { type: 'text/css' });

        if (Prototype.Browser.IE) {
            css.styleSheet.cssText = style;
        }
        else {
            css.update(style);
        }

        if (id) {
            css.setAttribute('id', id);
        }

        $$('head').first().appendChild(css);

        Event.fire(document, ':css.created', css);

        return css;
    }

    return {
        include: include,
        create:  create
    };
})();
