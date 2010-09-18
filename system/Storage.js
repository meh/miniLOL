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

miniLOL.Storage = Class.create({
    initialize: function (name, backend) {
        this.name    = name;
        this.backend = new (backend || miniLOL.Storage.Backends.available())(name);
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

miniLOL.Storage.serializeSpecial = function (obj) {
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
            obj[key] = miniLOL.Storage.serializeSpecial(obj[key]);
        }
    }

    return obj;
};

miniLOL.Storage.unserializeSpecial = function (obj) {
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
            obj[key] = miniLOL.Storage.unserializeSpecial(obj[key]);
        }
    }

    return obj;
};

miniLOL.Storage.serialize = function (obj) {
    return Object.toJSON(miniLOL.Storage.serializeSpecial(obj));
};

miniLOL.Storage.unserialize = function (string) {
    if (!Object.isString(string)) {
        return;
    }

    return miniLOL.Storage.unserializeSpecial(string.evalJSON());
};

miniLOL.Storage.Backend = Class.create({
    initialize: function (name) {
        this.name = name.replace(/ /g, '');
        this.size = 0;
        this.data = {};
    },

    get: function (key) {
        return this.data[key];
    },

    set: function (key, value, noSave) {
        this.data[key] = value;

        if (!noSave) {
            this.save();
        }

        return value;
    },

    remove: function (key, noSave) {
        var tmp = this.data[key];

        delete this.data[key];

        if (!noSave) {
            this.save();
        }

        return tmp;
    },

    clear: function (noSave) {
        var tmp   = this.data;
        this.data = {};

        if (!noSave) {
            this.save();
        }

        return tmp;
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
            
            var raw = window.localStorage['__miniLOL.storage.' + this.name] || '{}'

            this.data = miniLOL.Storage.unserialize(raw);
            this.size = raw.length;
        },

        save: function () {
            var raw = miniLOL.Storage.serialize(this.data) || '{}';

            this.size = raw.length;

            window.localStorage['__miniLOL.storage.' + this.name] = raw;
        }
    }),

    GlobalStorage: Class.create(miniLOL.Storage.Backend, {
        initialize: function ($super, name) {
            $super(name);

            var raw = window.globalStorage[window.location.hostname]['__miniLOL.storage.' + this.name] || '{}'

            this.data = miniLOL.Storage.unserialize(raw);
            this.size = raw.length;
        },

        save: function () {
            var raw = miniLOL.Storage.serialize(this.data) || '{}';

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

            this.element.load('__miniLOL.storage.' + this.name);

            var raw = this.element.getAttribute('__miniLOL.storage.' + this.name) || '{}';

            this.data = miniLOL.Storage.unserialize(raw);
            this.size = raw.length;
        },

        save: function () {
            var raw = miniLOL.Storage.serialize(this.data) || '{}';

            this.size = raw.length;

            this.element.setAttribute('__miniLOL.storage.' + this.name, raw);
            this.element.save('__miniLOL.storage.' + this.name);
        }
    }),

    Cookie: Class.create(miniLOL.Storage.Backend, {
        initialize: function ($super, name) {
            $super(name);

            this.jar = new CookieJar({ expires: 60 * 60 * 24 * 365 });

            var raw = this.jar.get('__miniLOL.storage.' + this.name) || '{}';

            this.data = miniLOL.Storage.unserialize(raw);
            this.size = raw.length;
        },

        save: function () {
            var raw = miniLOL.Storage.serialize(this.data) || '{}';

            this.size = raw.length;

            this.jar.set('__miniLOL.storage.' + this.name, raw);
        }
    }),

    Null: Class.create(miniLOL.Storage.Backend, {
        save: Prototype.emptyFunction
    })
};
