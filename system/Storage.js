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
    initialize: function (name) {
        this.name    = name;
        this.backend = new (miniLOL.Storage.Backends.available())(name);
    },

    get: function (key) {
        return this.backend.get(key.toString());
    },

    set: function (key, value) {
        return this.backend.set(key.toString(), value);
    },

    remove: function (key) {
        return this.backend.remove(key.toString());
    },

    clear: function () {
        return this.backend.clear();
    },

    size: function () {
        return this.backend.size;
    }
});

miniLOL.Storage.serializeXML = function (obj) {
    if (typeof obj !== 'object') {
        return obj;
    }

    obj = Object.clone(obj);

    for (var key in obj) {
        if (Object.isXML(obj[key])) {
            obj[key] = { __miniLOL_is_xml: true, xml: String.fromXML(obj[key]) };
        }
        else {
            obj[key] = miniLOL.Storage.serializeXML(obj[key]);
        }
    }

    return obj;
};

miniLOL.Storage.unserializeXML = function (obj) {
    if (typeof obj !== 'object') {
        return obj;
    }
    
    obj = Object.clone(obj);

    for (var key in obj) {
        if (obj[key].__miniLOL_is_xml) {
            obj[key] = obj[key].xml.toXML();
        }
        else {
            obj[key] = miniLOL.Storage.unserializeXML(obj[key]);
        }
    }

    return obj;
};

miniLOL.Storage.serialize = function (obj) {
    return Object.toJSON(miniLOL.Storage.serializeXML(obj));
};

miniLOL.Storage.unserialize = function (string) {
    if (!Object.isString(string)) {
        return;
    }

    return miniLOL.Storage.unserializeXML(string.evalJSON());
};

miniLOL.Storage.Backend = Class.create({
    initialize: function (name) {
        this.name = name;
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

            this.data = miniLOL.Storage.unserialize(window.localStorage['__miniLOL.storage.' + name]) || {};
        },

        save: function () {
            var raw = miniLOL.Storage.serialize(this.data);

            this.size = raw.length;

            window.localStorage['__miniLOL.storage.' + this.name] = raw;
        }
    }),

    GlobalStorage: Class.create(miniLOL.Storage.Backend, {
        initialize: function ($super, name) {
            $super(name);

            this.data = miniLOL.Storage.unserialize(window.globalStorage[window.location.hostname]['__miniLOL.storage.' + name]) || {};
        },

        save: function () {
            var raw = miniLOL.Storage.serialize(this.data);

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

            var raw = this.element.getAttribute('__miniLOL.storage.' + name);

            this.data = miniLOL.Storage.unserialize(raw);
            this.size = raw.length;
        },

        save: function () {
            var raw = miniLOL.Storage.serialize(this.data);

            this.size = raw.length;

            this.element.setAttribute('__miniLOL.storage.' + this.name, raw);
            this.element.save('__miniLOL.storage.' + this.name);
        }
    }),

    Cookie: Class.create(miniLOL.Storage.Backend, {
        initialize: function ($super, name) {
            $super(name);

            this.jar = new CookieJar({ expires: 60 * 60 * 24 * 365 });

            var raw = this.jar.get('__miniLOL.storage.' + name);

            this.data = miniLOL.Storage.unserialize(raw);
            this.size = raw.length;
        },

        save: function () {
            var raw = miniLOL.Storage.serialize(this.data);

            this.size = raw.length;

            this.jar.set('__miniLOL.storage.' + this.name, raw);
        }
    }),

    Null: Class.create(miniLOL.Storage.Backend, {
        save: Prototype.emptyFunction
    })
};
