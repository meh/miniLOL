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
