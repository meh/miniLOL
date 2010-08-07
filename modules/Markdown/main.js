/****************************************************************************
 * Copyleft meh. [http://meh.doesntexist.org | meh.ffff@gmail.com]          *
 *                                                                          *
 * This file is part of miniLOL. A blog module.                             *
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

miniLOL.module.create("Markdown", {
    version: "0.1",

    initialize: function () {
        miniLOL.utils.require(this.root+"/system/showdown.min.js");
        
        this.converter = new Showdown.converter;

        miniLOL.resource.get("miniLOL.config").load(this.root+"/resources/config.xml");
        miniLOL.resource.get("miniLOL.functions").load(this.root+"/resources/functions.xml");

        Event.observe(document, ":go", function () {
            this.execute()
        }.bind(this));
    },

    execute: function (elements) {
        if (Object.isString(elements)) {
            return this.converter.makeHtml(elements);
        }
        else if (Object.isElement(elements)) {
            elements = [elements];
        }
        else {
            elements = $$(".#{0}".interpolate([miniLOL.config["Markdown"]["class"]]));
        }

        elements.each(function (element) {
            element.innerHTML = this.converter.makeHtml(element.innerHTML);
        }, this);
    }
});
