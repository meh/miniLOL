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

unFocus.History.addEventListener('historyChange', function (query) {
    if (query) {
        miniLOL.go(query);
    }
    else {
        miniLOL.go(miniLOL.config['core'].homePage);
    }
});

/* Cross-Browser faggotree */

if (navigator.userAgent.match(/Chrome/)) {
    Prototype.Browser.Chrome = true;
}

if (navigator.userAgent.match(/Safari/) && !Prototype.Browser.Chrome) {
    Prototype.Browser.Safari = true;
}

if (Prototype.Browser.Gecko || Prototype.Browser.Opera) {
    Prototype.Browser.Good = true;
}
else {
    Prototype.Browser.Bad = true;
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

miniLOL.utils.require('system/extensions.js');
