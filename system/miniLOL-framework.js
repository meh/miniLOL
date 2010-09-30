/* Copyleft meh. [http://meh.doesntexist.org | meh@paranoici.org]
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

/* Copyleft meh. [http://meh.doesntexist.org | meh@paranoici.org]
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

/* Copyleft meh. [http://meh.doesntexist.org | meh@paranoici.org]
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

/* Copyleft meh. [http://meh.doesntexist.org | meh@paranoici.org]
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
/* Copyleft meh. [http://meh.doesntexist.org | meh@paranoici.org]
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
    function isObject (val) {
        return typeof val == 'object';
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

    function extend (destination, source, overwrite) {
        overwrite = (Object.isUndefined(overwrite)) ? true : Boolean(overwrite);

        for (var property in source) {
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
        isObject:   isObject,
        isBoolean:  isBoolean,
        isRegExp:   isRegExp,
        isClass:    isClass,
        isDocument: isDocument,
        isXML:      isXML,

        fromAttributes: fromAttributes,
        toQueryString:  toQueryString,

        extend:           extend,
        extendAttributes: extendAttributes,
        without:          without,

        defineProperty:   defineProperty,
        defineProperties: defineProperties,
        create:           create
    };
})());

/* Copyleft meh. [http://meh.doesntexist.org | meh@paranoici.org]
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

    function toNumber (integer) {
        return (integer) ? parseInt(this) : parseFloat(this);
    };

    function toBase (base) {
        return this.toNumber().toBase(base);
    };

    function fromBase (base) {
        return parseInt(this, base);
    };

    function toCode () {
        return this.charCodeAt(0);
    };

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

        toNumber: toNumber,
        toBase:   toBase,
        fromBase: fromBase,
        toCode:   toCode,

        encodeURI:          encodeURI,
        decodeURI:          decodeURI,
        encodeURIComponent: encodeURIComponent,
        decodeURIComponent: decodeURIComponent
    };
})());
/* Copyleft meh. [http://meh.doesntexist.org | meh@paranoici.org]
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
/* Copyleft meh. [http://meh.doesntexist.org | meh@paranoici.org]
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

var _parse = {
    '%': /(%)/,
    'd': /(\d\d)/
}

var _format = {
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
        return date.getFullYear().substr(0, 2);
    },

    'd': function (date) {
        return date.getDate().toPaddedString(2);
    },

    'D': function (date) {
        return date.format('%m/%d/%y');
    },

    'd': function (date) {
        return (date.getMonth() + 1).toPaddedString(2);
    },

    'j': function (date) {
        return date.getDate();
    },

    'N': function (date) {
        return (date.getDay() == 0) ? 7 : date.getDay();
    },

    'S': function (date) {
        return date.getDate().ordinalized();
    },

    'w': function (date) {
        return date.getDay();
    },

    'z': function (date) {
        var tmp = new Date();
        tmp.setFullYear(date.getFullYear());
        tmp.setDate(1);
        tmp.setMonth(0);

        return ((date.getTime() - tmp.getTime()) / 1000 / 60 / 60 / 24).ceil();
    },

    'W': function (date) {
        var tmp = new Date();
        tmp.setFullYear(date.getFullYear());
        tmp.setDate(1);
        tmp.setMonth(0);

        return ((date.getTime() - tmp.getTime()) / 1000 / 60 / 60 / 24 / 7).ceil();
    },

    'n': function (date) {
        return date.getMonth() + 1;
    },

    't': function (date) {
        if (date.getMonth() % 2 == 0) {
            return 31;
        }

        if (date.getMonth() == 1) {
            return (date.getFullYear() % 4 == 0) ? 29 : 28;
        }

        return 30;
    },

    'L': function (date) {
        return (date.getFullYear() % 4) ? 0 : 1;
    },

    'o': function (date) {
        return date.getFullYear();
    },

    'Y': function (date) {
        return date.getFullYear();
    },

    'y': function (date) {
        return date.getFullYear().toString().substr(2, 2);
    },

    'a': function (date) {
        return (date.getHours() > 12) ? 'pm' : 'am';
    },

    'A': function (date) {
        return (date.getHours() > 12) ? 'PM' : 'AM';
    },

    'B': function (date) {
        var tmp = new Date(date);
        tmp.setHours(0);
        tmp.setSeconds(0);
        tmp.setMinutes(0);

        return ((date.getTime() - tmp.getTime()) / 1000 / 86.4).toFixed(2);
    },

    'g': function (date) {
        return (date.getHours() + 1 > 12) ? (date.getHours() + 1) / 2 : date.getHours() + 1;
    },

    'g': function (date) {
        return date.getHours();
    },

    'h': function (date) {
        return ((date.getHours() + 1 > 12) ? (date.getHours() + 1) / 2 : date.getHours() + 1).toPaddedString(2);
    },

    'H': function (date) {
        return date.getHours().toPaddedString(2);
    },

    'i': function (date) {
        return date.getMinutes().toPaddedString(2);
    },

    's': function (date) {
        return date.getSeconds().toPaddedString(2);
    },

    'u': function (date) {
        return date.getMilliseconds() * 1000;
    },

    'r': function (date) {
        return date.toUTCString();
    },

    'U': function (date) {
        return date.getTime();
    }
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

Object.extend(Date.prototype, (function () {
    function format (format) {
        var date = this;

        return format.gsub(/%([\-_0^#])?(.)/, function (match) {
            return (_format[match[1]]) ? _format[match[1]](date) : match[1];
        });
    }

    return {
        format: format
    };
})());

})();
/* Copyleft meh. [http://meh.doesntexist.org | meh@paranoici.org]
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
        error: Function.empty,

        Framework: {
            Version: '0.1'
        }
    };
}

/* Copyleft meh. [http://meh.doesntexist.org | meh@paranoici.org]
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

Class = {
    Normal:   0x01,
    Abstract: 0x02,

    create: function () {
        var args       = $A(arguments);
        var parent     = (args.length > 1) ? args.shift() : null;
        var properties = args.shift();

        if (!Object.isObject(properties)) {
            throw new Error('You have to pass the class description.');
        }

        var klass = function () {
            switch (this.__type__) {
                case Class.Abstract:
                throw new Error('You cannot instantiate an abstract class.');
                break;

                case Class.Normal:
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
                parent.__type__ = Class.Normal;
            }

            if (!parent.subclasses) {
                parent.subclasses = [];
            }

            var subclass       = Function.empty.clone();
            subclass.prototype = parent.prototype
            klass.prototype    = new subclass;
            parent.subclasses.push(klass);
        }

        klass.__type__ = klass.prototype.__type__ = properties.type || Class.Normal;

        klass.addMethods({ initialize: properties.initialize || properties.constructor || Function.empty.clone() });
        klass.addMethods(Object.without(properties, ['constructor', 'initialize', 'Methods', 'Static', 'Attributes']));

        klass.addMethods(properties.Methods || {});
        klass.addStatic(properties.Static || {});
        klass.addAttributes(properties.Attributes || {});

        klass.prototype.constructor = klass;

        return klass;
    },

    Methods: {
        addMethods: function (source) {
            var ancestor = (this.superclass)
                ? this.superclass && this.superclass.prototype
                : undefined;

            for (var name in source) {
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
        },

        addStatic: function (source) {
            for (var property in source) {
                this[property] = source[property];
            }
        },

        addAttributes: function (source) {
            Object.extendAttributes(this.prototype, source);

            if (this.__type__ == Class.Abstract) {
                Object.extendAttributes(this, source);
            }
        }
    }
};


/* Copyleft meh. [http://meh.doesntexist.org | meh@paranoici.org]
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

/* Copyleft meh. [http://meh.doesntexist.org | meh@paranoici.org]
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
            miniLOL.History.current = (Object.isString(event.memo)) ? event.memo : '';
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
                    ? window.location.hash
                    : decodeURIComponent(window.location.hash)
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

                        doc.location.hash = encodeURIComponent(hash);
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
                ? window.location.hash
                : decodeURIComponent(window.location.hash)
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
/* Copyleft meh. [http://meh.doesntexist.org | meh@paranoici.org]
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
/* Copyleft meh. [http://meh.doesntexist.org | meh@paranoici.org]
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
    },

    Static: {
        parse: function (raw) {
            return new miniLOL.JSON(raw);
        },

        serializeSpecial: function (obj) {
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
        },

        unserializeSpecial: function (obj) {
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
        },

        serialize: function (obj) {
            try {
                return Object.toJSON(miniLOL.JSON.serializeSpecial(obj));
            }
            catch (e) {
                return false;
            }
        },

        unserialize: function (string) {
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
    }
});
/* Copyleft meh. [http://meh.doesntexist.org | meh@paranoici.org]
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

    return {
        encode: encode,
        keys:   keys,
        get:    get,
        set:    set,
        remove: remove,
        clear:  clear
    };
})();
/* Copyleft meh. [http://meh.doesntexist.org | meh@paranoici.org]
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
        save: Function.empty
    })
};

/* Copyleft meh. [http://meh.doesntexist.org | meh@paranoici.org]
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
/* Copyleft meh. [http://meh.doesntexist.org | meh@paranoici.org]
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
