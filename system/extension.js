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

if (Prototype.Browser.IE) {
    Function.prototype.clone = function () {
        var func = this.toString();
        return new Function(func.substring(func.indexOf('{') + 1, func.lastIndexOf('}')));
    }
}
else {
    Function.prototype.clone = function () {
        return eval('(' + this.toString().replace(/^function .*?\(/, "function (") + ')');
    }
}

Object.extend(Object, {
    isBoolean: function (val) {
        return val.constructor === Boolean;
    },

    fromAttributes: function (attributes) {
        var result = {};

        for (var i = 0; i < attributes.length; i++) {
            result[attributes.item(i).nodeName] = attributes.item(i).nodeName;
        }

        return result;
    },

    toQuery: function (query) {
        var result = '';
    
        for (var name in query) {
            result += "#{name}=#{value}&".interpolate({
                name: name,
                value: query[name]
            });
        }
    
        return result.substr(0, result.length - 1);
    }
});

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
    }
})

Object.extend(String.prototype, {
    parseQuery: function () {
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

    isURL: function () {
        var match = this.match(/^mailto:([\w.%+-]+@[\w.]+\.[A-Za-z]{2,4})$/);
        if (match) {
            return {
                protocol: "mailto",
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

    getTextDescendants: function (element) {
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
});
