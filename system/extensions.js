/****************************************************************************
 * Copyleft meh. [http://meh.doesntexist.org | meh.ffff@gmail.com]          *
 *                                                                          *
 * This file is part of miniLOL.                                            *
 *                                                                          *
 * miniLOL is free software: you can redistribute it and/or modify          *
 * it under the terms of the GNU Affero General Public License as           *
 * published by the Free Software Foundation, either version 3 of the       *
 * License, or (at your option) any later version.                          *
 *                                                                          *
 * miniLOL is distributed in the hope that it will be useful,               *
 * but WITHOUT ANY WARRANTY; without even the implied warranty of           *
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the            *
 * GNU Affero General Public License for more details.                      *
 *                                                                          *
 * You should have received a copy of the GNU Affero General Public License *
 * along with miniLOL.  If not, see <http://www.gnu.org/licenses/>.         *
 ****************************************************************************/

Object.extend(Function, {
    parse: function (string) {
        matches = string.match(/^function\s*\((.*?)\)[\s\n]*\{([\s\S]*)\}[\s\n]*/m);

        if (!matches) {
            return null;
        }

        var signature = matches[1].split(/\s*,\s*/);
        var body      = matches[2];

        return new Function(signature, body);
    }
});

Object.extend(Function.prototype, {
    clone: function () {
        return Function.parse(this.toString());
    }
});

Object.extend(Object, {
    isBoolean: function (val) {
        return val.constructor === Boolean;
    },

    isXML: function (val) {
        if (typeof val !== 'object') {
            return false;
        }

        val = val.ownerDocument || val;

        if (!val.documentElement) {
            return false;
        }

        return val.documentElement.nodeName != "HTML";
    },

    fromAttributes: function (attributes) {
        var result = {};

        for (var i = 0; i < attributes.length; i++) {
            result[attributes.item(i).nodeName] = attributes.item(i).nodeName;
        }

        return result;
    },

    toQueryString: function (query) {
        var result = '';

        for (var name in query) {
            result += '#{name}=#{value}&'.interpolate({
                name: name,
                value: query[name]
            });
        }

        return result.substr(0, result.length - 1);
    }
});

if (!Object.isFunction(Object.defineProperty)) {
    // Descriptor has 5 possible variables: value, get, set, writable, configurable, enumerable
    Object.defineProperty = function (object, property, descriptor) {
        if (Object.isFunction(descriptor.get) && Object.isFunction(object.__defineGetter__)) {
            object.__defineGetter__(property, descriptor.get);
        }

        if (Object.isFunction(descriptor.set) && Object.isFunction(object.__defineSetter__)) {
            object.__defineSetter__(property, descriptor.set);
        }
    };
}

if (!Object.isFunction(Object.defineProperties)) {
    Object.defineProperties = function (object, properties) {
        for (var property in properties) {
            Object.defineProperty(object, property, properties[property]);
        }
    };
}

if (!Object.isFunction(Object.create)) {
    Object.create = function (proto, properties) {
        var obj = new Object(proto);

        Object.defineProperties(obj, properties);

        return obj;
    };
}

Object.extend(String, {
    fromAttributes: function (attributes) {
        var result = '';

        for (var i = 0; i < attributes.length; i++) {
            result += '#{name}="#{value}" '.interpolate({
                name: attributes.item(i).nodeName,
                value: attributes.item(i).nodeValue
            });
        }

        return result;
    },
    
    fromXML: function (node) {
        if (!Object.isXML(node)) {
            return false;
        }

        return new XMLSerializer().serializeToString(node);
    }
});

Object.extend(String.prototype, {
    toQueryParams: function () {
        var result  = {};
        var matches = this.match(/[?#](.*)$/);

        if (!matches) {
            return result;
        }

        var blocks = matches[1].split(/&/);
        for (var i = 0; i < blocks.length; i++) {
            var parts = blocks[i].split(/=/);
            var name  = decodeURIComponent(parts[0]);

            if (parts[1]) {
                result[name] = decodeURIComponent(parts[1]);
            }
            else {
                result[name] = true;
            }
        }

        return result;
    },

    toXML: function () {
        return new DOMParser().parseFromString(this, 'text/xml');
    },

    isEmpty: function () {
        return this == 0;
    },

    isURL: function () {
        var match = this.match(/^mailto:([\w.%+-]+@[\w.]+\.[A-Za-z]{2,4})$/);
        if (match) {
            return {
                protocol: 'mailto',
                uri:      match[1]
            };
        }

        match = this.match(/^(\w+):(\/\/.+?(:\d)?)(\/)?/);

        if (!match) {
            return false;
        }

        return {
            protocol: match[1],
            uri:      match[2]
        };
    },

    getHashFragment: function () {
        var matches = this.match(/(#.*)$/);

        return (matches) ? matches[1] : '';
    }
});

Element.addMethods({
    load: function (path, options) {
        if (options && !Object.isUndefined(options.frequency)) {
            new Ajax.PeriodicalUpdater(this, path, options);
        }
        else {
            new Ajax.Updater(this, path, options);
        }
    },

    xpath: function (element, query) {
        element = (Object.isElement(element)) ? element : this;
        query   = (Object.isElement(element)) ? query : element;

        return miniLOL.utils.XML.xpath.call(element, query);
    },

    select: function (element, query) {
        element = (Object.isElement(element)) ? element : this;
        query   = (Object.isElement(element)) ? query : element;

        return miniLOL.utils.XML.select.call(element, query);
    },

    getTextDescendants: function (element) {
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
    },

    toObject: function (element) {
        element = element || this;

        var result = {};

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

                    if (text.nodeValue.isEmpty()) {
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
});
