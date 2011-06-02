/* Copyleft meh. [http://meh.paranoid.pk | meh@paranoici.org]
 *
 * This file is part of miniLOL.
 *
 * miniLOL is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * miniLOL is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with miniLOL. If not, see <http://www.gnu.org/licenses/>.
 ****************************************************************************/

/* Copyleft meh. [http://meh.paranoid.pk | meh@paranoici.org]
 *
 * This file is part of miniLOL.
 *
 * miniLOL is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * miniLOL is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with miniLOL. If not, see <http://www.gnu.org/licenses/>.
 ****************************************************************************/

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

/* Copyleft meh. [http://meh.paranoid.pk | meh@paranoici.org]
 *
 * This file is part of miniLOL.
 *
 * miniLOL is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * miniLOL is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with miniLOL. If not, see <http://www.gnu.org/licenses/>.
 ****************************************************************************/


/* Copyleft meh. [http://meh.paranoid.pk | meh@paranoici.org]
 *
 * This file is part of miniLOL.
 *
 * miniLOL is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * miniLOL is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with miniLOL. If not, see <http://www.gnu.org/licenses/>.
 ****************************************************************************/

Function.empty = function () { };

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
/* Copyleft meh. [http://meh.paranoid.pk | meh@paranoici.org]
 *
 * This file is part of miniLOL.
 *
 * miniLOL is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * miniLOL is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with miniLOL. If not, see <http://www.gnu.org/licenses/>.
 ****************************************************************************/


Object.extend(Object, (function () {
    function is (klass, val) {
        return !Object.isUndefined(val) && (val instanceof klass || val == klass);
    }

    function isObject (val) {
        return typeof val == 'object' && val.constructor === Object;
    }

    function isBoolean (val) {
        return typeof val == 'boolean' || val.constructor === Boolean;
    }

    function isRegExp (val) {
        return !Object.isUndefined(val) && val.constructor == window.RegExp;
    }

    function isClass (val) {
        return Boolean(val['__miniLOL.Class__']);
    }

    function isDocument(element) {
        return element.nodeType === Node.DOCUMENT_NODE;
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

    var buggy = (function () {
        for (var property in { toString: 1 }) {
            if (property === 'toString') {
                return false;
            }
        }

        return true;
    })();

    var keys;
    var values;

    if (buggy) {
        var _keys   = Object.keys;
        var _values = Object.values;

        var fix = ['toString', 'valueOf'];

        keys = function (object) {
            var result = _keys(object);

            fix.each(function (fix) {
                if (object[fix] != Object.prototype[fix]) {
                    result.push(fix);
                }
            });

            return result;
        }

        values = function (object) {
            var result = _values(object);

            fix.each(function (fix) {
                if (object[fix] != Object.prototype[fix]) {
                    result.push(object[fix]);
                }
            });

            return result;
        }
    }
    else {
        keys   = Object.keys;
        values = Object.values;
    }

    function extend (destination, source, overwrite) {
        var overwrite  = (Object.isUndefined(overwrite)) ? true : Boolean(overwrite);
        var properties = Object.keys(source || {});

        for (var i = 0, length = properties.length; i < length; i++) {
            var property = properties[i];

            if (!overwrite && !Object.isUndefined(destionation[property])) {
                continue;
            }

            destination[property] = source[property];
        }

        return destination;
    }

    function extendAttributes (destination, source, overwrite) {
        overwrite = (Object.isUndefined(overwrite)) ? true : Boolean(overwrite);

        for (var property in source) {
            if (!overwrite && !Object.isUndefined(destionation[property])) {
                continue;
            }

            (function () {
                var _saved;

                destination[property] = function (value, force) {
                    if (Object.isUndefined(value) && !force) {
                        if (Object.isFunction(source[property].get)) {
                            return source[property].get(_saved);
                        }
                        else {
                            return _saved;
                        }
                    }
                    else {
                        if (Object.isFunction(source[property].set)) {
                            return _saved = source[property].set(_saved, value);
                        }
                        else {
                            return _saved = value;
                        }
                    }
                };
            })();
        }

        return destination;
    }

    function without (object, exceptions) {
        var result = Object.extend({}, object);

        if (Object.isArray(exceptions)) {
            exceptions.each(function (exception) {
                delete result[exception];
            });
        }
        else {
            delete result[exceptions];
        }

        return result;
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
        is:         is,
        isObject:   isObject,
        isBoolean:  isBoolean,
        isRegExp:   isRegExp,
        isClass:    isClass,
        isDocument: isDocument,
        isXML:      isXML,

        fromAttributes: fromAttributes,
        toQueryString:  toQueryString,

        keys:   keys,
        values: values,

        extend:           extend,
        extendAttributes: extendAttributes,
        without:          without,

        defineProperty:   defineProperty,
        defineProperties: defineProperties,
        create:           create
    };
})());

/* Copyleft meh. [http://meh.paranoid.pk | meh@paranoici.org]
 *
 * This file is part of miniLOL.
 *
 * miniLOL is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * miniLOL is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with miniLOL. If not, see <http://www.gnu.org/licenses/>.
 ****************************************************************************/

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

    function toQueryParams (separator) {
        if (!Object.isRegExp(separator)) {
            separator = /&/;
        }

        var result  = {};
        var matches = this.match(/[?#](.*?)([#?]|$)/);

        if (!matches) {
            return result;
        }

        var blocks = matches[1].split(separator);
        for (var i = 0; i < blocks.length; i++) {
            var parts = blocks[i].split(/=/);
            var name  = parts[0].decodeURIComponent();
            var value = parts[1]

            if (value) {
                if (!Object.isUndefined(result[name])) {
                    if (!Object.isArray(result[name])) {
                        result[name] = [result[name], value];
                    }
                    else {
                        result[name].push(value)
                    }
                }
                else {
                    result[name] = value.decodeURIComponent();
                }
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

    function splitEvery (num) {
        var result = new Array;

        for (var i = 0; i < this.length; i += num) {
            result.push(this.substr(i, num));
        }

        return result;
    }

    function test (pattern) {
        return pattern.test(this);
    }

    function commonChars (string) {
        return this.toArray().intersect(string.toArray());
    }

    function format (template) {
        var formatted = this;

        for (var i in template) {
            formatted = formatted.replace(new RegExp('\\{' + i + '\\}', 'g'), template[i].toString());
        }

        return formatted;
    }

    function reverse () {
        return this.toArray().reverse().join('');
    }

    function translate (table, second) {
        var result = this;

        if (second) {
            Object.keys(table).each(function (key) {
                if (!second[key]) {
                    throw new Error('The second table value is missing.');
                }

                if (table[key].is(RegExp)) {
                    result = result.replace(eval(table[key].global ? table[key].toString() : table[key].toString() + 'g'));
                }
                else {
                    result = result.replace(new RegExp(table[key], 'g'), second[key]);
                }
            });
        }
        else {
            Object.values(table).each(function (match) {
                if (match.length != 2) {
                    throw new Error('The array has to be [regex, translation].');
                }

                if (match[0].is(RegExp)) {
                    result = result.replace(eval(match[0].global ? match[0].toString() : match[0].toString() + 'g'), match[1]);
                }
                else {
                    result = result.replace(new RegExp(match[0], 'g'), match[1]);
                }
            });
        }

        return result;
    }

    function interpolate (object, pattern) {
        if (Object.isRegExp(pattern)) {
            return new Template(this, pattern).evaluate(object);
        }
        else {
            return new miniLOL.Template(this, pattern).evaluate(object)
        }
    }

    function toNumber (integer) {
        return (integer) ? parseInt(this) : parseFloat(this);
    }

    function toBase (base) {
        return this.toNumber().toBase(base);
    }

    function fromBase (base) {
        return parseInt(this, base);
    }

    function toCode () {
        return this.charCodeAt(0);
    }

    function toPaddedString (length, pad, pad2) {
        var pad = (Object.isUndefined(pad2 || pad)) ? '0' : (pad2 || pad).toString();

        return pad.times(length - this.length) + this;
    }

    function toInvertedCase () {
        var result = '';

        for (var i = 0, length = this.length; i < length; i++) {
            var chr  = this.charAt(i);
            var down = chr.toLowerCase();
            var up   = chr.toUpperCase();

            if (up == down) {
                result += down;
            }
            else {
                if (chr == down) {
                    result += up;
                }
                else {
                    result += down;
                }
            }
        }

        return result;
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
        parseQuery:    toQueryParams,
        toXML:         toXML,

        isURL:    isURL,
        parseURL: parseURL,

        blank: blank,

        getHashFragment: getHashFragment,

        splitEvery:  splitEvery,
        test:        test,
        commonChars: commonChars,
        format:      format,
        reverse:     reverse,
        translate:   translate,
        interpolate: interpolate,

        toNumber:       toNumber,
        toBase:         toBase,
        fromBase:       fromBase,
        toCode:         toCode,
        toPaddedString: toPaddedString,
        toInvertedCase: toInvertedCase,

        encodeURI:          encodeURI,
        decodeURI:          decodeURI,
        encodeURIComponent: encodeURIComponent,
        decodeURIComponent: decodeURIComponent
    };
})());
/* Copyleft meh. [http://meh.paranoid.pk | meh@paranoici.org]
 *
 * This file is part of miniLOL.
 *
 * miniLOL is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * miniLOL is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with miniLOL. If not, see <http://www.gnu.org/licenses/>.
 ****************************************************************************/

Object.extend(Number.prototype, (function () {
    function milliseconds () {
        return this * 1000;
    }

    function seconds () {
        return this;
    }

    function minutes () {
        return this * 60;
    }

    function hours () {
        return this * 60 * 60;
    }

    function days () {
        return this * 60 * 60 * 24;
    }

    function weeks () {
        return this * 60 * 60 * 24 * 7;
    }

    function years () {
        return this * 60 * 60 * 24 * 375;
    }

    function upTo (num, iterator, context) {
        $R(this, num+1, true).each(iterator, context);
        return this;
    }

    function isEven () {
        return this % 2 == 0;
    }

    function isOdd () {
        return this % 2 != 0;
    }

    function abs () {
        return Math.abs(this);
    }

    function round () {
        return Math.round(this);
    }

    function ceil () {
        return Math.ceil(this);
    }

    function floor () {
        return Math.floor(this);
    }

    function log () {
        return Math.log(this);
    }

    function pow (exp) {
        return Math.pow(this, exp);
    }

    function sqrt () {
        return Math.sqrt(this);
    }

    function sin () {
        return Math.sin(this);
    }

    function cos () {
        return Math.cos(this);
    }

    function tan () {
        return Math.tan(this);
    }

    function asin () {
        return Math.asin(this);
    }

    function acos () {
        return Math.acos(this);
    }

    function atan () {
        return Math.atan(this);
    }

    function toBase (base) {
        return this.toString(base).toUpperCase();
    }

    function toChar () {
        return String.fromCharCode(this);
    }

    function digits () {
        var matches = this.toString().match(/e(.*)$/);

        if (matches) {
            return (matches[1].toNumber() > 0)
                ? 1+matches[1].toNumber()
                : 0;
        }
        else {
            return this.toString().length;
        }
    }

    function toPaddedString (length, radix, pad) {
        var pad    = (Object.isUndefined(pad)) ? '0' : pad.toString();
        var string = this.toString(radix || 10);

        return pad.times(length - string.length) + string;
    }

    function ordinalized () {
        switch (parseInt(this)) {
            case 1:  return 'st';
            case 2:  return 'nd';
            case 3:  return 'rd';
            default: return 'th';
        }
    }

    return {
        milliseconds: milliseconds,
        ms:           milliseconds,

        seconds: seconds,
        second:  seconds,
        minutes: minutes,
        minute:  minutes,
        hours:   hours,
        hour:    hours,
        days:    days,
        day:     days,
        weeks:   weeks,
        week:    weeks,
        years:   years,
        year:    years,

        upTo: upTo,

        isEven: isEven,
        isOdd:  isOdd,

        abs:   abs,
        round: round,
        ceil:  ceil,
        floor: floor,
        log:   log,
        pow:   pow,
        sqrt:  sqrt,
        sin:   sin,
        cos:   cos,
        tan:   tan,
        asin:  asin,
        acos:  acos,
        atan:  atan,

        toPaddedString: toPaddedString,
        toBase:         toBase,
        toChar:         toChar,

        digits:      digits,
        ordinalized: ordinalized
    };
})());
/* Copyleft meh. [http://meh.paranoid.pk | meh@paranoici.org]
 *
 * This file is part of miniLOL.
 *
 * miniLOL is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * miniLOL is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with miniLOL. If not, see <http://www.gnu.org/licenses/>.
 ****************************************************************************/

Object.extend(Enumerable, (function () {
    function empty () {
        return this.length == 0;
    }

    return {
        empty: empty
    };
})());

Object.extend(Array.prototype, Enumerable);
/* Copyleft meh. [http://meh.paranoid.pk | meh@paranoici.org]
 *
 * This file is part of miniLOL.
 *
 * miniLOL is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * miniLOL is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with miniLOL. If not, see <http://www.gnu.org/licenses/>.
 ****************************************************************************/

Hash.addMethods((function () {
    function clear () {
        var tmp      = this._object;
        this._object = {};

        return tmp;
    }

    function replace (data) {
        var tmp = this._object;

        if (Object.isString(data)) {
            this._object = miniLOL.JSON.unserialize(data);
        }
        else {
            this._object = Object.extend({}, data);
        }

        return tmp;
    }

    var _toJSON = Hash.prototype.toJSON

    function toJSON (improved) {
        if (improved) {
            return miniLOL.JSON.serialize(this._object) || '{}';
        }
        else {
            return _toJSON.call(this);
        }
    }

    return {
        remove: Hash.prototype.unset,

        clear:   clear,
        replace: replace,

        toJSON: toJSON
    };
})());
/* Copyleft meh. [http://meh.paranoid.pk | meh@paranoici.org]
 *
 * This file is part of miniLOL.
 *
 * miniLOL is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * miniLOL is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with miniLOL. If not, see <http://www.gnu.org/licenses/>.
 ****************************************************************************/


(function () {

Date.weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
Date.months   = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

var _width = {
    'd': 2,
    'H': 2,
    'I': 2,
    'j': 3,
    'k': 2,
    'l': 2,
    'm': 2,
    'M': 2,
    'N': 9,
    'S': 2,
    'U': 2,
    'V': 2,
    'W': 2,
    'y': 2,

    'i': 3
};

var _parse = {
    '%': /(%)/,
    'd': /(\d\d)/
};

Object.extend(Date, (function () {
    var _parse = Date.parse

    function parse (format, string) {
        if (!format.include('%')) {
            return _parse(format);
        }
    }

    return {
        parse: parse
    };
})());

var _format = {
    flag: {
        '-': function (value, width) {
            return value;
        },

        '_': function (value, width) {
            return value.toPaddedString(width, 10, ' ');
        },

        '0': function (value, width) {
            return value.toPaddedString(width, 10, '0');
        },

        '^': function (value, width) {
            return value.toString().toUpperCase().toPaddedString(width, ' ')
        },

        '#': function (value, width) {
            return value.toString().toInvertedCase().toPaddedString(width, ' ');
        }
    },

    '%': function (date) {
        return '%';
    },

    'a': function (date) {
        return Date.weekDays[date.getDay()].substr(0, 3);
    },

    'A': function (date) {
        return Date.weekDays[date.getDay()];
    },

    'b': function (date) {
        return Date.months[date.getMonth()].substr(0, 3);
    },

    'B': function (date) {
        return Date.months[date.getMonth()];
    },

    'c': function (date) {
        return date.format('%a %b %_d %X %Y');
    },

    'C': function (date) {
        return date.getFullYear().toString().substr(0, 2);
    },

    'd': function (date) {
        return date.getDate();
    },

    'D': function (date) {
        return date.format('%m/%d/%y');
    },

    'e': function (date) {
        return date.format('%_d');
    },

    'F': function (date) {
        return date.format('%Y-%m-%d');
    },

    'g': function (date) {
        return date.format('%y');
    },

    'G': function (date) {
        return date.format('%Y');
    },

    'h': function (date) {
        return date.format('%b');
    },

    'H': function (date) {
        return date.getHours();
    },

    'I': function (date) {
        var hours = date.getHours();

        return ((hours + 1 > 12) ? (hours + 1) / 2 : hours + 1);
    },

    'j': function (date) {
        var tmp = new Date();
        tmp.setFullYear(date.getFullYear());
        tmp.setDate(1);
        tmp.setMonth(0);

        return ((date.getTime() - tmp.getTime()) / 1000 / 60 / 60 / 24).ceil();
    },

    'k': function (date) {
        return date.format('%_H');
    },

    'l': function (date) {
        return date.format('%_l');
    },

    'm': function (date) {
        return (date.getMonth() + 1);
    },

    'M': function (date) {
        return date.getMinutes();
    },

    'n': function (date) {
        return "\n";
    },

    'N': function (date) {
        return date.getMilliseconds() * 1000000;
    },

    'p': function (date) {
        return (date.getHours() > 12) ? 'PM' : 'AM';
    },

    'P': function (date) {
        return date.format('%#p');
    },

    'r': function (date) {
        return date.format('%I:%M:%S %p');
    },

    'R': function (date) {
        return date.format('%H:%M');
    },

    's': function (date) {
        return date.getDate();
    },

    'S': function (date) {
        return date.getSeconds();
    },

    't': function (date) {
        return "\t";
    },

    'T': function (date) {
        return date.format('%H:%M:%S');
    },

    'u': function (date) {
        return (date.getDay() == 0) ? 7 : date.getDay();
    },

    'U': function (date) {
        var tmp = new Date();
        tmp.setFullYear(date.getFullYear());
        tmp.setDate(1);
        tmp.setMonth(0);

        return ((date.getTime() - tmp.getTime()) / 1000 / 60 / 60 / 24 / 7).ceil();
    },

    'V': function (date) {
        return date.format('%U');
    },

    'w': function (date) {
        return date.getDay();
    },

    'W': function (date) {
        return date.format('%U');
    },

    'x': function (date) {
        return date.format('%m/%d/%y');
    },

    'X': function (date) {
        return date.format('%T');
    },

    'y': function (date) {
        return date.getFullYear().toString().substr(2, 2)
    },

    'Y': function (date) {
        return date.getFullYear();
    },


    'E': function (date) {
        if (date.getMonth() % 2 == 0) {
            return 31;
        }

        if (date.getMonth() == 1) {
            return (date.getFullYear() % 4 == 0) ? 29 : 28;
        }

        return 30;
    },

    'o': function (date) {
        return date.getDate().ordinalized();
    },

    'O': function (date) {
        return (date.getFullYear() % 4) ? 0 : 1;
    },

    'i': function (date) {
        var tmp = new Date(date);
        tmp.setHours(0);
        tmp.setSeconds(0);
        tmp.setMinutes(0);

        return ((date.getTime() - tmp.getTime()) / 1000 / 86.4).toFixed(2);
    }
};

Object.extend(Date.prototype, (function () {
    function format (format) {
        var date = this;

        return format.gsub(/%([\-_0^#])?(\d+)?(.)/, function (match) {
            var flag  = match[1] || '0';
            var width = parseInt(match[2] || _width[type] || '0');
            var type  = match[3];

            if (!_format[type]) {
                return match[0];
            }

            return _format.flag[flag](_format[type](date), width);
        });
    }

    return {
        format: format
    };
})());

})();
/* Copyleft meh. [http://meh.paranoid.pk | meh@paranoici.org]
 *
 * This file is part of miniLOL.
 *
 * miniLOL is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * miniLOL is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with miniLOL. If not, see <http://www.gnu.org/licenses/>.
 ****************************************************************************/


Element.addMethods((function () {
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
/*  Prototype JavaScript framework, version 1.7_rc2
 *  (c) 2005-2010 Sam Stephenson
 *
 *  Prototype is freely distributable under the terms of an MIT-style license.
 *  For details, see the Prototype web site: http://www.prototypejs.org/
 *
 *--------------------------------------------------------------------------*/

/*
 * Little modifications by meh. [http://meh.paranoid.pk | meh@paranoici.org]
 * to adapt the code to miniLOL.
 */

Ajax.Request.addMethods({
    request: function (url) {
        this.url    = url;
        this.method = this.options.method;

        if (Object.isString(this.options.parameters)) {
            this.options.parameters = this.options.parameters.toQueryParams();
        }

        if (this.options.minified) {
            var minified = this.url.replace(/\.([^.]+)$/, '.min.$1');

            if (miniLOL.utils.exists(minified)) {
                this.url = minified;
            }
        }

        if (this.options.cached === false) {
            this.url += ((this.url.include('?')) ? '&' : '?') + Math.random();

            this.options.requestHeaders = Object.extend(this.options.requestHeaders || {}, {
                'Cache-Control': 'must-revalidate',
                'Pragma':        'no-cache'
            });
        }

        var params = Object.toQueryString(this.options.parameters);

        if (!['get', 'post', 'head'].include(this.method)) {
            params      += (params ? '&' : '') + '_method=' + this.method;
            this.method  = 'post';
        }

        if (params) {
            if (this.method == 'get' || this.method == 'head') {
                this.url += (this.url.include('?') ? '&' : '?') + params;
            }
            else if (/Konqueror|Safari|KHTML/.test(navigator.userAgent)) {
                params += '&_=';
            }
        }

        this.parameters = params.toQueryParams();

        try {
            var response = new Ajax.Response(this);

            if (this.options.onCreate) {
                this.options.onCreate(response);
            }

            Ajax.Responders.dispatch('onCreate', this, response);

            this.transport.open(this.method.toUpperCase(), this.url, this.options.asynchronous);

            if (this.options.asynchronous) {
                this.respondToReadyState.bind(this).defer(1);
            }

            this.transport.onreadystatechange = this.onStateChange.bind(this);
            this.setRequestHeaders();

            this.body = this.method == 'post' ? (this.options.postBody || params) : null;
            this.transport.send(this.body);

            /* Force Firefox to handle ready state 4 for synchronous requests */
            if (!this.options.asynchronous && this.transport.overrideMimeType) {
                this.onStateChange();
            }
        }
        catch (e) {
            this.dispatchException(e);
        }
    }
});


if (!Object.isObject(window.miniLOL)) {
    window.miniLOL = {
        error: Function.empty,

        Framework: {
            Version: '0.1'
        }
    };
}

/* Copyleft meh. [http://meh.paranoid.pk | meh@paranoici.org]
 *
 * This file is part of miniLOL.
 *
 * miniLOL is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * miniLOL is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with miniLOL. If not, see <http://www.gnu.org/licenses/>.
 ****************************************************************************/


Class = (function () {
    var Type = {
        Normal:   0x01,
        Abstract: 0x02
    };

    var Methods = (function () {
        function addMethods (source) {
            var ancestor   = this.superclass && this.superclass.prototype; // if superclass is defined get its prototype
            var properties = Object.keys(source);

            for (var i = 0, length = properties.length; i < length; i++) {
                var name  = properties[i];
                var value = source[name];

                if (ancestor && Object.isFunction(value) && value.argumentNames().first() == '$super') {
                    var method = value;

                    value = (function (m) {
                        return function () {
                            return ancestor[m].apply(this, arguments);
                        };
                    })(name).wrap(method);

                    value.valueOf  = method.valueOf.bind(method);
                    value.toString = method.toString.bind(method);
                }

                this.prototype[name] = value;

                if (this.__type__ == Class.Abstract) {
                    this[name] = value;
                }
            }
        }

        function addStatic (source) {
            var properties = Object.keys(source);

            for (var i = 0, length = properties.length; i < length; i++) {
                var name   = properties[i];
                this[name] = source[name];
            }
        }

        function addAttributes (source) {
            Object.extendAttributes(this.prototype, source);

            if (this.__type__ == Class.Abstract) {
                Object.extendAttributes(this, source);
            }
        }

        return {
            addMethods:    addMethods,
            addStatic:     addStatic,
            addAttributes: addAttributes
        };
    })();

    function create () {
        var properties = $A(arguments);
        var parent     = (Object.isFunction(properties.first())) ? properties.shift() : null;

        var klass = function () {
            switch (this.__type__) {
                case Type.Abstract:
                throw new Error('You cannot instantiate an abstract class.');
                break;

                default:
                if (Object.isFunction(this.initialize)) {
                    return this.initialize.apply(this, arguments);
                }
                break;
            }

            return null;
        }

        klass['__miniLOL.Class__'] = true;

        Object.extend(klass, Class.Methods);
        klass.superclass = parent
        klass.subclasses = [];

        if (parent) {
            if (!parent.__type__) {
                parent.__type__ = Type.Normal;
            }

            if (!parent.subclasses) {
                parent.subclasses = [];
            }

            var subclass       = Function.empty.clone();
            subclass.prototype = parent.prototype
            klass.prototype    = new subclass;
            parent.subclasses.push(klass);
        }

        klass.__type__ = klass.prototype.__type__ = properties.first().type || Class.Normal;

        properties.each(function (properties) {
            klass.addMethods({ initialize: properties.initialize || properties.constructor || Function.empty.clone() });
            klass.addMethods(Object.without(properties, ['constructor', 'initialize', 'Methods', 'Static', 'Attributes']));

            klass.addMethods(properties.Methods || {});
            klass.addStatic(properties.Static || {});
            klass.addAttributes(properties.Attributes || {});
        });

        klass.prototype.constructor = klass;

        return klass;
    }

    return {
        create: create,

        Type:    Type,
        Methods: Methods
    };
})();


/* Copyleft meh. [http://meh.paranoid.pk | meh@paranoici.org]
 *
 * This file is part of miniLOL.
 *
 * miniLOL is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * miniLOL is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with miniLOL. If not, see <http://www.gnu.org/licenses/>.
 ****************************************************************************/

miniLOL.utils = (function () {
    function exists (path) {
        var result = false;

        new Ajax.Request(path, {
            method:       'head',
            asynchronous: false,
            evalJS:       false,

            onSuccess: function () {
                result = true;
            }
        });

        return result;
    }

    function get (path, options) {
        options = Object.extend({
            raw: true
        }, options || {});

        var result;

        new Ajax.Request(path, Object.extend(options || {}, {
            method:       'get',
            asynchronous: false,
            evalJS:       false,

            onSuccess: function (http) {
                if (options.raw) {
                    result = http.responseText;
                }
                else {
                    try {
                        result = JSON.unserialize(http.responseText);
                    }
                    catch (e) {
                        result = http.responseXML || http.responseText;
                    }
                }
            }
        }));

        return result;
    }

    function execute (path, options) {
        var result;
        var error;

        new Ajax.Request(path, Object.extend(options || {}, {
            method:       'get',
            asynchronous: false,
            evalJS:       false,

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
        }));

        if (error) {
            throw error;
        }

        return result;
    }

    function include (path, options) {
        options = options || {};

        if (path.startsWith('http')) {
          $(document.head).insert(new Element('script', { type: 'text/javascript', src: path, id: options['id'] }));

          return true;
        }

        var result = false;

        new Ajax.Request(path, Object.extend(options || {}, {
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
        }));

        return result;
    }

    function require (path, options) {
        options = options || {};

        if (path.startsWith('http')) {
          $(document.head).insert(new Element('script', { type: 'text/javascript', src: path, id: options['id'] }));

          return true;
        }

        var error = false;

        new Ajax.Request(path, Object.extend(options || {}, {
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
        }));

        if (error) {
            throw error;
        }

        return true;
    }

    return {
        exists: exists,
        get:    get,

        execute: execute,
        include: include,
        require: require
    };
})();

/* Copyleft meh. [http://meh.paranoid.pk | meh@paranoici.org]
 *
 * This file is part of miniLOL.
 *
 * miniLOL is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * miniLOL is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with miniLOL. If not, see <http://www.gnu.org/licenses/>.
 ****************************************************************************/

miniLOL.File = Class.create({
    initialize: function (path, options) {
        this.options = Object.extend({
            method:       'get',
            asynchronous: false,
            evalJS:       false,
            minified:     false,
            cached:       true,

            onSuccess: function (http) {
                this.content = http.responseText;
                this.special = http.responseXML;
                this.loaded  = true;

                if (Object.isFunction(this.options.onLoaded)) {
                    this.options.onLoaded(this);
                }
            }.bind(this),

            onFailure: function (http) {
                this.error = Object.clone(http);
            }.bind(this)
        }, options || {});

        this.loaded = false;

        this.path      = path;
        this.extension = miniLOL.File.extension(path);

        new Ajax.Request(this.path, this.options);
    },

    reload: function () {
        this.loaded = false;

        new Ajax.Request(this.path, this.options);
    },

    interpolate: function (data, engine) {
        if (engine) {
            return this.content.interpolate(data, engine);
        }
        else {
            return new miniLOL.Template(this).evaluate(data);
        }
    },

    Static: {
        extension: function (path) {
            var matches = path.match(/\.([^.]+)$/)

            if (matches) {
                return matches[1];
            }
            else {
                return '';
            }
        }
    }
});
/* Copyleft meh. [http://meh.paranoid.pk | meh@paranoici.org]
 *
 * This file is part of miniLOL.
 *
 * miniLOL is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * miniLOL is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with miniLOL. If not, see <http://www.gnu.org/licenses/>.
 ****************************************************************************/

miniLOL.Template = Class.create({
    initialize: function (template, engine) {
        if (Object.is(miniLOL.File, template)) {
            if (!template.loaded || !template.extension) {
                throw 'The File has to be loaded and have an extension.';
            }

            this.engine = miniLOL.Template.Engine.get(template.extension);

            if (!this.engine) {
                throw 'Engine not available for the given file.';
            }

            this.template = new this.engine(template.content);
        }
        else {
            this.engine = miniLOL.Template.Engine.get(engine) || Template;

            if (!this.engine) {
                 throw 'Engine not available for the given file.';
            }

            this.template = new this.engine(template);
        }
    },

    evaluate: function (data, context) {
        return this.template.evaluate(data, context);
    }
});

miniLOL.Template.Engine = (function () {
    var _engines = {};
    var _loaded  = {};

    function get (extension) {
        return _engines[(extension || '').toLowerCase()];
    }

    function add (extension, engine) {
        if (!_engines[extension.toLowerCase()]) {
            _engines[extension.toLowerCase()] = engine;
        }
    }

    function load (path, options) {
        if (_loaded[path]) {
            return;
        }

        miniLOL.utils.execute(path, options);

        _loaded[path] = true;
    }

    return {
        get:  get,
        add:  add,
        load: load
    };
})();

/* Copyleft meh. [http://meh.paranoid.pk | meh@paranoici.org]
 *
 * This file is part of miniLOL.
 *
 * miniLOL is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * miniLOL is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with miniLOL. If not, see <http://www.gnu.org/licenses/>.
 ****************************************************************************/

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
/* Copyleft meh. [http://meh.paranoid.pk | meh@paranoici.org]
 *
 * This file is part of miniLOL.
 *
 * miniLOL is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * miniLOL is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with miniLOL. If not, see <http://www.gnu.org/licenses/>.
 ****************************************************************************/

miniLOL.CSS = (function () {
    function include (path, minified) {
        if (minified) {
            minified = path.replace(/\.css$/, '.min.css');
        }

        var style = $$('link').find(function (css) {
            return css.getAttribute('href') == path || css.getAttribute('href') === minified;
        });

        if (!style) {
            if (minified && miniLOL.utils.exists(minified)) {
                path = minified;
            }
            else {
                if (!miniLOL.utils.exists(path)) {
                    return false;
                }
            }

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

/* Copyleft meh. [http://meh.paranoid.pk | meh@paranoici.org]
 *
 * This file is part of miniLOL.
 *
 * miniLOL is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * miniLOL is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with miniLOL. If not, see <http://www.gnu.org/licenses/>.
 ****************************************************************************/

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
/* Copyleft meh. [http://meh.paranoid.pk | meh@paranoici.org]
 *
 * This file is part of miniLOL.
 *
 * miniLOL is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * miniLOL is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with miniLOL. If not, see <http://www.gnu.org/licenses/>.
 ****************************************************************************/

miniLOL.JSON = (function () {
    function convert (data) {
        if (Object.isObject(data)) {
            if (data.__miniLOL_is_xml) {
                return data.value.toXML();
            }
            else if (data.__miniLOL_is_function) {
                return Function.parse(data.value);
            }
            else {
                return miniLOL.JSON.unserializeSpecial(data);
            }
        }
        else {
            if (Object.isXML(data)) {
                return { __miniLOL_is_xml: true, value: String.fromXML(data) };
            }
            else if (Object.isFunction(data)) {
                return { __miniLOL_is_function: true, value: data.toString() };
            }
            else {
                return miniLOL.JSON.serializeSpecial(data);
            }
        }
    }

    function special (obj) {
        var result;

        if (Object.isObject(obj)) {
            result = Object.clone(obj);

            for (var key in obj) {
                result[key] = convert(obj[key]);
            }
        }
        else if (Object.isArray(obj)) {
            result = [];

            obj.each(function (data) {
                result.push(convert(data));
            });
        }
        else {
            result = obj;
        }

        return result;
    }

    function serialize (obj) {
        try {
            return Object.toJSON(miniLOL.JSON.serializeSpecial(obj));
        }
        catch (e) {
            return false;
        }
    }

    function unserialize (string) {
        if (!Object.isString(string)) {
            return null;
        }

        try {
            return miniLOL.JSON.unserializeSpecial(string.evalJSON());
        }
        catch (e) {
            return null;
        }
    }

    return {
        special:            special,
        serializeSpecial:   special,
        unserializeSpecial: special,

        serialize:   serialize,
        unserialize: unserialize,

        convert: convert
    };
})();
/* Copyleft meh. [http://meh.paranoid.pk | meh@paranoici.org]
 *
 * This file is part of miniLOL.
 *
 * miniLOL is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * miniLOL is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with miniLOL. If not, see <http://www.gnu.org/licenses/>.
 ****************************************************************************/

miniLOL.Cookie = (function () {
    function _options (options) {
        return Object.extend({
            expires: new Date(Date.now() + (1).day().ms()),
            path:    '',
            domain:  '',
            secure:  '',

            raw: false
        }, options || {});
    }

    function encode (key, value, options) {
        if (Object.isUndefined(options)) {
            options = {};
        }

        return "#{key}=#{value}; #{maxAge}#{expires}#{path}#{domain}#{secure}".interpolate({
            key:   key.encodeURIComponent(),
            value: value.encodeURIComponent(),

            maxAge:  (!Object.isUndefined(options.maxAge))  ? 'max-age=#{0}; '.interpolate([options.maxAge]) : '',
            expires: (!Object.isUndefined(options.expires)) ? 'expires=#{0}; '.interpolate([options.expires.toUTCString()]) : '',
            path:    (!Object.isUndefined(options.path))    ? 'path=#{0}; '.interpolate([options.path]) : '',
            domain:  (!Object.isUndefined(options.domain))  ? 'domain=#{0}; '.interpolate([options.domain]) : '',

            secure: (options.secure) ? 'secure' : ''
        });
    }

    function keys () {
        var result = [];

        window.document.cookie.split(/; /).each(function (cookie) {
            cookie = cookie.split(/=/);

            result.push(cookie[0]);
        });

        return result.uniq();
    }

    function get (key, options) {
        var options = _options(options);
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
    }

    function set (key, value, options) {
        var options = _options(options);

        if (!options.raw) {
            value = miniLOL.JSON.serialize(value) || value;
        }

        window.document.cookie = encode(key, value, options);
    }

    function remove (key, options) {
        window.document.cookie = encode(key, '', Object.extend(_options(options), {
            expires: new Date(0)
        }));
    }

    function clear () {
        keys().each(function (cookie) {
            remove(cookie);
        });
    }

    function _each (iterator) {
        keys().each(function (key) {
            var value = get(key);
            var pair  = [key, value];

            pair.name  = key;
            pair.key   = key;
            pair.value = value;

            iterator(pair);
        });
    }

    return Object.extend(Enumerable, {
        _each: _each,

        encode: encode,
        keys:   keys,
        get:    get,
        set:    set,
        remove: remove,
        unset:  remove,
        clear:  clear
    });
})();
/* Copyleft meh. [http://meh.paranoid.pk | meh@paranoici.org]
 *
 * This file is part of miniLOL.
 *
 * miniLOL is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * miniLOL is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with miniLOL. If not, see <http://www.gnu.org/licenses/>.
 ****************************************************************************/

miniLOL.Storage = Class.create({
    initialize: function (name, backend) {
        this.name = name;

        if (miniLOL.Storage.Instances[name]) {
            this.backend = miniLOL.Storage.Instances[name];
        }
        else {
            this.backend = miniLOL.Storage.Instances[name] =
                new (backend || miniLOL.Storage.Backends.available())(name);
        }
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

miniLOL.Storage.Backend = Class.create(Hash, {
    initialize: function ($super, name, data) {
        $super(((Object.isString(data)) ? miniLOL.JSON.unserialize(data) : data) || {});

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
    },

    Static: {
        filter: function (value) {
            return value.replace(/\s/g, '');
        }
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
            var raw = this.toJSON(true);

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
            var raw = this.toJSON(true);

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
            var raw = this.toJSON(true);

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
            var raw = this.toJSON(true);

            this.size = raw.length;

            miniLOL.Cookie.set('__miniLOL.storage.' + this.name, raw, { expires: 60 * 60 * 24 * 365, raw: true });
        }
    }),

    Null: Class.create(miniLOL.Storage.Backend, {
        save: Function.empty
    })
};

/* Copyleft meh. [http://meh.paranoid.pk | meh@paranoici.org]
 *
 * This file is part of miniLOL.
 *
 * miniLOL is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * miniLOL is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with miniLOL. If not, see <http://www.gnu.org/licenses/>.
 ****************************************************************************/

miniLOL.History = {
    interval: 0.15,

    initialize: function () {
        miniLOL.History.current = window.location.hash || '#';

        if (Prototype.Browser.Opera && history.navigationMode) {
            history.navigationMode = 'compatible';
        }

        Event.observe(document, ':url.change', function (event) {
            miniLOL.History.current = event.memo.toString() || '#';
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
                    ? window.location.hash || '#'
                    : decodeURIComponent(window.location.hash || '#')
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

                $(document.body).insert({ top: miniLOL.History.IE.element });
                miniLOL.History.IE.put(miniLOL.History.current);
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
                ? window.location.hash || '#'
                : decodeURIComponent(window.location.hash || '#')
            );
        },

        InternetExplorer: function () {
            var hashes = {
                iframe: miniLOL.History.IE.get(),
                actual: window.location.hash || '#',
                current: miniLOL.History.current
            };

            if (hashes.actual != hashes.iframe) {
                if (hashes.actual && hashes.actual == hashes.current) { // The user is moving in the History
                    window.location.hash = (miniLOL.History.current = hashes.iframe).substring(1);
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
