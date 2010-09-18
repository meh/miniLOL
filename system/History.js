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

miniLOL.History = {
    interval: 0.2,

    initialize: function () {
        Event.observe(document, ':url.change', function (event) {
            miniLOL.History.current = event.memo;
        });

        if ('onhashchange' in window) {
            Event.observe(window, 'hashchange', miniLOL.History.check);
        }
        else {
            miniLOL.History.reset();
        }
    },

    check: function () {
        var hash = miniLOL.History.hash();

        if (miniLOL.History.current == hash) {
            return;
        }

        Event.fire(document, ':url.change', hash);
    },

    reset: function (interval) {
        if (Object.isNumber(interval)) {
            miniLOL.History.interval = interval;
        }

        if (!Object.isUndefined(miniLOL.History.timer)) {
            clearInterval(miniLOL.History.timer);
        }

        miniLOL.History.timer = setInterval(miniLOL.History.check, miniLOL.History.timer * 1000);
    },

    hash: function () {
        return window.location.hash.replace(/^#/, '');
    }
}

miniLOL.History.initialize();
