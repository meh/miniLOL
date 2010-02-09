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

/*
 * miniLOL is a Javascript/XML based CMS, thus, being in the XXI century,
 * I pretend those two standards to be respected.
 *
 * Get a real browser, get Firefox.
 */

miniLOL = {
    version: "1.2",

    initialize: function () {
        if (miniLOL.initialized) {
            throw new Error("miniLOL has already been initialized.");
        }

        miniLOL.initialized = false;
        miniLOL.path        = location.href.match(/^(.*?)\/[^\/]*?(#|$)/)[1];
        miniLOL.resources   = {};

        [function () {
            function prepareConfigurations (event) {
                if (event.memo.name != "miniLOL.config" || event.memo.arguments[0] != "resources/config.xml") {
                    return;
                }

                if (!miniLOL.config["core"]) {
                    miniLOL.config["core"] = {};
                }

                if (!miniLOL.config["core"].siteTitle) {
                     miniLOL.config["core"].siteTitle = "miniLOL #{version}".interpolate(miniLOL);
                }

                if (!miniLOL.config["core"].loadingMessage) {
                    miniLOL.config["core"].loadingMessage = "Loading...";
                }

                if (!miniLOL.config["core"].homePage) {
                    miniLOL.config["core"].homePage = "#home";
                }
                else {
                    if (miniLOL.config["core"].homePage.charAt(0) != '#' && !miniLOL.config["core"].homePage.isURL()) {
                        miniLOL.config["core"].homePage = '#'+miniLOL.config["core"].homePage;
                    }
                }
                 
                if (!document.title) {
                    document.title = miniLOL.config["core"].siteTitle;
                }
            }

            Event.observe(document, ":resource.loaded", prepareConfigurations);

            miniLOL.resources.config = new miniLOL.Resource("miniLOL.config", {
                initialize: function () {
                    miniLOL.config = this._data;
                },
 
                load: function (path) {
                    var This = this;
                    new Ajax.Request(path, {
                        method: "get",
                        asynchronous: false,
        
                        onSuccess: function (http) {
                            if (miniLOL.utils.checkXML(http.responseXML, path)) {
                                return;
                            }
    
                            http.responseXML = miniLOL.utils.fixDOM(http.responseXML);
    
                            var domain = http.responseXML.documentElement.getAttribute("domain") || "core";
                            var config = miniLOL.config[domain] || {};
    
                            miniLOL.config[domain] = Object.extend(config, This.parse(http.responseXML.documentElement));
                        },
        
                        onFailure: function (http) {
                            miniLOL.error("Error while loading config.xml (#{error})".interpolate({
                                error: http.status
                            }));
                        }
                    });
    
                    if (miniLOL.error()) {
                        return false;
                    }
    
                    return true;
                },

                clear: function () {
                    this._data = miniLOL.config = {};
                },

                parse: function (obj, text) {
                    if (text) {
                        var result = '';
    
                        for (var i = 0; i < obj.childNodes.length; i++) {
                            var text = obj.childNodes[i];
    
                            if (text.nodeType != Node.CDATA_SECTION_NODE && text.nodeType != Node.TEXT_NODE) {
                                continue;
                            }
    
                            text = text.nodeValue;
    
                            if (text.match(/^[\s\n]*$/m)) {
                                continue;
                            }
                            
                            result += text;
                        }
    
                        return result;
                    }
    
                    if (obj.nodeType != Node.ELEMENT_NODE) {
                        return null;
                    }
    
                    var result = {};
    
                    for (var i = 0; i < obj.childNodes.length; i++) {
                        var node = obj.childNodes[i];
    
                        if (node.nodeType != Node.ELEMENT_NODE) {
                            continue;
                        }
    
                        if (node.getElementsByTagName('*').length == 0) {
                            result[node.nodeName] = this.parse(node, true);
                        }
                        else {
                            result[node.nodeName] = this.parse(node);
                        }
                    }
    
                    return result;
                }
            });

            miniLOL.resources.config.load("resources/config.xml");

            $(document.body).update(miniLOL.config["core"].loadingMessage);
        },

        function () {
            miniLOL.resources.menus = new miniLOL.Resource("miniLOL.menus", {
                load: function (path) {
                    new Ajax.Request(path, {
                        method: "get",
                        asynchronous: false,
    
                        onSuccess: function (http) {
                            if (miniLOL.utils.checkXML(http.responseXML, path)) {
                                return;
                            }
    
                            var response = miniLOL.utils.fixDOM(http.responseXML);
    
                            miniLOL.menus["default"] = response.getElementById("default");
    
                            var menus = response.documentElement.childNodes;
                            for (var i = 0; i < menus.length; i++) {
                                if (menus[i].nodeType != Node.ELEMENT_NODE) {
                                    continue;
                                }
    
                                var id = menus[i].getAttribute("id");
    
                                if (!id && !miniLOL.menus["default"]) {
                                    miniLOL.menus["default"] = menus[i];
                                }
                                else {
                                    miniLOL.menus[id] = menus[i];
                                }
                            }
    
                            if (!miniLOL.menus["default"]) {
                                miniLOL.error("Error while analyzing menus.xml<br/><br/>No default menu was found.");
                                return;
                            }
                        }
                    });
    
                    if (miniLOL.error()) {
                        return false;
                    }
    
                    return true;
                },

                clear: function () {
                    this._data = miniLOL.menus = {};
                }
            });

            miniLOL.resources.menus.load("resources/menus.xml");
        },

        function () {
            miniLOL.resources.pages = new miniLOL.Resource("miniLOL.pages", {
                load: function (path) {
                    new Ajax.Request(path, {
                        method: "get",
                        asynchronous: false,
        
                        onSuccess: function (http) {
                            if (miniLOL.utils.checkXML(http.responseXML, path)) {
                                return;
                            }
    
                            var dom = miniLOL.utils.fixDOM(http.responseXML);
    
                            var pages = http.responseXML.documentElement.getElementsByTagName("page");
                            for (var i = 0; i < pages.length; i++) {
                                var id = pages[i].getAttribute("id");

                                delete miniLOL.pages.cache[id];
                                miniLOL.pages.data[id] = pages[i];
                            }
                        },
        
                        onFailure: function (http) {
                            miniLOL.error("Error while loading pages.xml (#{error})".interpolate({
                                error: http.status
                            }));
                        }
                    });
    
                    if (miniLOL.error()) {
                        return false;
                    }
    
                    return true;
                },

                clear: function () {
                    miniLOL.pages = this._data = {
                        data: {},
                        cache: {}
                    };
                }
            });

            if (miniLOL.utils.fileExists("resources/pages.xml")) {
                miniLOL.resources.pages.load("resources/pages.xml");
            }
        },

        function () {
            miniLOL.resources.functions = new miniLOL.Resource("miniLOL.functions", {
                load: function (path) {
                    new Ajax.Request(path, {
                        method: "get",
                        asynchronous: false,
            
                        onSuccess: function (http) {
                            if (miniLOL.utils.checkXML(http.responseXML, path)) {
                                return;
                            }
    
                            var functions = http.responseXML.documentElement.getElementsByTagName("function");
    
                            for (var i = 0; i < functions.length; i++) {
                                try {
                                    miniLOL.functions[functions[i].getAttribute("name")]
                                        = new Function("var text = arguments[0]; var args = arguments[1]; #{code}; return text;".interpolate({
                                            code: functions[i].firstChild.nodeValue
                                        }));
                                }
                                catch (e) {
                                    miniLOL.error("Error while creating `#{name}` wrapper from #{path}:<br/><br/>#{error}".interpolate({
                                        name:  functions[i].getAttribute("name"),
                                        path:  path,
                                        error: e.toString()
                                    }));
    
                                    return;
                                }
                            }
                        },
            
                        onFailure: function (http) {
                            miniLOL.error("Error while loading functions.xml (#{error})".interpolate({
                                error: http.status
                            }));
                        }
                    });
    
                    if (miniLOL.error()) {
                        return false;
                    }
    
                    return true;
                },

                clear: function () {
                    miniLOL.functions = this._data = {};
                }
            });

            miniLOL.resources.functions.load("resources/functions.xml");
        },
        
        function () {
            if (miniLOL.config["core"].theme) {
                miniLOL.error(!miniLOL.theme.load(miniLOL.config["core"].theme));
                miniLOL.theme.template.menu();
            }
            else {
                miniLOL.error(!miniLOL.theme.deprecated());
            }
        },
        
        function () {
            if (!miniLOL.theme.menu()) {
                miniLOL.menus = null;
            }

            if (miniLOL.menu.enabled()) {
                miniLOL.menu.set(miniLOL.config["core"].loadingMessage);
            }
        },

        function () {
            miniLOL.content.set("Loading modules...");

            miniLOL.resources.modules = new miniLOL.Resource("miniLOL.modules", {
                load: function (path, output) {
                    new Ajax.Request(path, {
                        method: "get",
                        asynchronous: false,
            
                        onSuccess: function (http) { 
                            if (miniLOL.utils.checkXML(http.responseXML, path)) {
                                return;
                            }
    
                            miniLOL.module.path = http.responseXML.documentElement.getAttribute("path") || 'modules';
    
                            var modules = http.responseXML.documentElement.getElementsByTagName("module");
                            for (var i = 0; i < modules.length; i++) {
                                if (output) {
                                    miniLOL.content.set("Loading `#{name}`... [#{number}/#{total}]".interpolate({
                                        name:   modules[i].getAttribute("name"),
                                        number: i + 1,
                                        total:  modules.length
                                    }));
                                }
    
                                if (!miniLOL.module.load(modules[i].getAttribute("name"))) {
                                    miniLOL.error(true);
                                }
    
                                if (miniLOL.error()) {
                                    break;
                                }
                            }
                        },
            
                        onFailure: function (http) {
                            miniLOL.error("Error while loading modules.xml (#{error})".interpolate({
                                error: http.status
                            }), miniLOL.theme.content());
                        }
                    });
    
                    if (miniLOL.error()) {
                        return false;
                    }
    
                    return true;
                },

                clear: function () {
                    miniLOL.modules = this._data = {};
                }
            });

            miniLOL.resources.modules.load("resources/modules.xml", true);
        },

        function () {
            if (miniLOL.menu.enabled()) {
                miniLOL.menu.change("default");
            }
        },
        
        function () {
            miniLOL.content.set("Checking dependencies...");
            try {
                miniLOL.module.dependencies.check();
            }
            catch (e) {
                miniLOL.error("`#{module}` requires `#{require}`".interpolate(e), miniLOL.theme.content());
            }
        }].each(function (callback) {
            try {
                callback();
            }
            catch (e) {
                miniLOL.error(e.toString());
            }

            if (miniLOL.error()) {
                throw $break;
            }
        });

        if (miniLOL.error()) {
            if (!document.body.innerHTML) {
               miniLOL.error("Something went wrong, but nobody told me what :(");
            }

            return false;
        }

        miniLOL.go(/[#?]./.test(location.href) ? location.href.replace(/^.*[#?]/, '#') : miniLOL.config["core"].homePage);

        if (miniLOL.config["core"].initialization) {
            eval(miniLOL.config["core"].initialization);
        }

        Event.observe(document, ":refresh", miniLOL.refresh);

        new PeriodicalExecuter(function () {
            Event.fire(document, ":refresh");
        }, miniLOL.config["core"].refreshEvery || 360)

        Event.fire(document, ":initialized");
        Event.stopObserving(document, ":initialized");

        miniLOL.initialized = true;
    },

    error: function (text, element, minor) {
        if (Object.isUndefined(text)) {
            return Boolean(miniLOL.error._value);
        }

        if (Object.isBoolean(text)) {
            return miniLOL.error._value = text;
        }

        element = element || document.body;

        $(element).update(text);

        if (!minor) {
            miniLOL.error._value = true;
        }

        Event.fire(document, ":error", { text: text, element: element, minor: minor });
    },

    content: {
        set: function (data) {
            miniLOL.theme.content().update(data);
        },

        get: function () {
            return miniLOL.theme.content().innerHTML;
        }
    },

    refresh: function () {
        miniLOL.resources.config.reload();
        miniLOL.resources.menus.reload();
        miniLOL.resources.pages.reload();
        miniLOL.resources.functions.reload();
    },

    theme: {
        style: {
            list: {},

            load: function (name, path, overload) {
                path = path || "#{path}/#{theme}".interpolate({ path: miniLOL.theme.path, theme: miniLOL.theme.name });

                Event.fire(document, ":theme.style.load", { name: name, path: path, overload: Boolean(overload) });

                if (miniLOL.theme.style.exists(name, path)) {
                    if (overload) {
                        miniLOL.theme.style.unload(miniLOL.theme.style.list[name], path);
                    }
                    else {
                        return true;
                    }
                }

                var file  = "#{path}/#{style}.css".interpolate({ path: path, style: name });
                var style = miniLOL.utils.includeCSS(file);

                if (!style) {
                    return false;
                }

                miniLOL.theme.style.list[file] = style;

                return true;
            },

            unload: function (name, path) {
                path = path || "#{path}/#{theme}".interpolate({ path: miniLOL.theme.path, theme: miniLOL.theme.name });

                Event.fire(document, ":theme.style.unload", { name: name, path: path });

                var file = "#{path}/#{style}.css".interpolate({ path: path, style: name });

                if (miniLOL.theme.style.list[file]) {
                    miniLOL.theme.style.list[file].remove();
                    delete miniLOL.theme.style.list[file];
                }
            },

            exists: function (name, path) {
                path = path || "#{path}/#{theme}".interpolate({ path: miniLOL.theme.path, theme: miniLOL.theme.name });

                return Boolean(miniLOL.theme.style.list["#{path}/#{style}.css".interpolate({ path: path, style: name })]);
            }
        },

        template: {
            load: function (name, path) {
                if (!path && !miniLOL.theme.name) {
                    return 0;
                }

                path = path || "#{path}/#{theme}".interpolate({
                    path: miniLOL.theme.path,
                    theme: miniLOL.theme.name
                });

                Event.fire(document, ":theme.template.load", { name: name, path: path });

                var file = "#{path}/#{name}.xml".interpolate({ path: path, name: name });

                if (!Object.isUndefined(miniLOL.theme.template._cache[file])) {
                    return miniLOL.theme.template._cache[file];
                }

                new Ajax.Request(file, {
                    method: "get",
                    asynchronous: false,
                
                    onSuccess: function (http) {
                        if (miniLOL.utils.checkXML(http.responseXML, file)) {
                            return;
                        }

                        miniLOL.theme.template._cache[file] = miniLOL.utils.fixDOM(http.responseXML);
                    },

                    onFailure: function () {
                        miniLOL.theme.template._cache[file] = false;
                    }
                });

                if (miniLOL.error()) {
                    return false;
                }

                return miniLOL.theme.template._cache[file];
            },

            menu: function () {
                return miniLOL.theme.template.load("menu");
            },

            exists: function (name, path) {
                return Boolean(miniLOL.theme.template.load(name, path));
            },

            defaultList: function () {
                return {
                    global: "<div #{attributes}>#{data}</div>",

                    before: "#{data}",
                    after:  "#{data}",

                    link: "<div class='#{class}' id='#{id}'>#{before}<a href='#{url}' target='#{target}' #{attributes}>#{text}</a>#{after}</div>",
                    item: "<div class='#{class}' id='#{id}'>#{before}<span #{attributes}>#{text}</span>#{after}</div>",
                    nest: "<div class='#{class}' style='#{style}'>#{data}</div>",
                    data: "<div class='data'>#{before}#{data}#{after}</div>"
                };
            },

            clearCache: function () {
                miniLOL.theme.template._cache = {};
            }
        },

        load: function (name, runtime, noInitialization) {
            miniLOL.theme.unload();

            var oldPath = miniLOL.theme.path;
            var oldName = miniLOL.theme.name;

            // The syntax to change the theme path is path:theme
            var path = name.match(/^(.+?):(.+)$/);
            if (path) {
                miniLOL.theme.path = path[1];
                miniLOL.theme.name = path[2];
            }
            else {
                miniLOL.theme.path = "themes";
                miniLOL.theme.name = name;
            }

            if (miniLOL.theme.name == oldName && miniLOL.theme.path == oldPath) {
                return true;
            }

            var path = "#{path}/#{theme}".interpolate({ path: miniLOL.theme.path, theme: name });

            Event.fire(document, ":theme.load", { name: name, runtime: Boolean(runtime) });

            var result = true;
            // Get the informations about the theme and parse the needed data
            new Ajax.Request("#{path}/theme.xml".interpolate({ path: path, theme: name }), {
                method: "get",
                asynchronous: false,
                
                onSuccess: function (http) {
                    var info = miniLOL.theme.informations = {};
                    var doc  = miniLOL.utils.fixDOM(http.responseXML);

                    info.name     = doc.documentElement.getAttribute("name")     || "Unknown";
                    info.author   = doc.documentElement.getAttribute("author")   || "Anonymous";
                    info.homepage = doc.documentElement.getAttribute("homepage") || '';
                    
                    miniLOL.theme.menu._node    = doc.documentElement.getAttribute("menu") || "menu";
                    miniLOL.theme.content._node = doc.documentElement.getAttribute("content") || "body";

                    var initialize = doc.getElementsByTagName("initialize");
                    if (initialize.length) {
                        miniLOL.theme.initialize = new Function(initialize[0].firstChild.nodeValue);
                    }
                    else {
                        miniLOL.theme.initialize = new Function;
                    }

                    var finalize = doc.getElementsByTagName("finalize");
                    if (finalize.length) {
                        miniLOL.theme.finalize = new Function(finalize[0].firstChild.nodeValue);
                    }
                    else {
                        miniLOL.theme.finalize = new Function;
                    }

                    info.styles = [];
                    var  styles = doc.getElementsByTagName("style");
                    for (var i = 0; i < styles.length; i++) {
                        info.styles.push(styles[i].getAttribute("name"));
                    }

                    info.templates = [];
                    var  templates = doc.getElementsByTagName("template");
                    for (var i = 0; i < templates.length; i++) {
                        info.templates.push(templates[i].getAttribute("name"));
                    }

                    var list = doc.getElementsByTagName("list");
                    if (list.length) {
                        list = list[0];

                        var current;
                        if ((current = list.getElementsByTagName("global")).length) {
                            miniLOL.theme.template.list.global = current[0].firstChild.nodeValue;
                        }

                        if ((current = list.getElementsByTagName("before")).length) {
                            miniLOL.theme.template.list.before = current[0].firstChild.nodeValue;
                        }

                        if ((current = list.getElementsByTagName("after")).length) {
                            miniLOL.theme.template.list.after = current[0].firstChild.nodeValue;
                        }

                        if ((current = list.getElementsByTagName("link")).length) {
                            miniLOL.theme.template.list.link = current[0].firstChild.nodeValue;
                        }

                        if ((current = list.getElementsByTagName("item")).length) {
                            miniLOL.theme.template.list.item = current[0].firstChild.nodeValue;
                        }

                        if ((current = list.getElementsByTagName("nest")).length) {
                            miniLOL.theme.template.list.nest = current[0].firstChild.nodeValue;
                        }

                        if ((current = list.getElementsByTagName("data")).length) {
                            miniLOL.theme.template.list.data = current[0].firstChild.nodeValue;
                        }
                    }
                },

                onFailure: function () {
                    result = false;
                }
            });

            if (result == false) {
                miniLOL.error("Error while loading theme's informations.");
                return false;
            }

            // Get the html layout and set it
            new Ajax.Request("#{path}/template.html".interpolate({ path: path, theme: name }), {
                method: "get",
                asynchronous: false,
                
                onSuccess: function (http) {
                    $(document.body).update(http.responseText);
                },

                onFailure: function () {
                    result = false;
                }
            });

            if (result == false) {
                miniLOL.error("Error while loading the layout.");
                return false;
            }

            for (var i = 0; i < miniLOL.theme.informations.styles.length; i++) {
                if (!miniLOL.theme.style.load(miniLOL.theme.informations.styles[i], false, true)) {
                    miniLOL.error("Couldn't load `#{style}` style.".interpolate({
                        style: miniLOL.theme.informations.styles[i]
                    }));

                    return false;
                }
            }

            miniLOL.theme.template.clearCache();

            if (runtime && miniLOL.initialized) {
                miniLOL.menu.change(miniLOL.menu.current);
                miniLOL.go(location.href);
            }

            // Sadly this has some problems.
            // I didn't find a way to know if the CSSs have already been applied and the initialize
            // may get wrong informations from stuff that uses sizes set by the CSS.
            //
            // So it's the designer's work to hack that shit and get it working, you can see an example
            // in the original theme initialize.
            //
            // If someone knows a way to fix this, please contact me.
            // (Already tried XHR and create <style>, but url() would get borked and it only worked in Firefox and Opera)
            if (!noInitialization && miniLOL.theme.initialize) {
                miniLOL.theme.initialize();
            }

            Event.fire(document, ":theme.loaded", { name: name, runtime: Boolean(runtime) });

            return true;
        },

        unload: function (noFinalization) {
            miniLOL.theme.template.list = miniLOL.theme.template.defaultList();

            if (!miniLOL.theme.name) {
                return;
            }

            Event.fire(document, ":theme.unload", { name: miniLOL.theme.name });

            if (!noFinalization && miniLOL.theme.finalize) {
                miniLOL.theme.finalize();
            }

            for (var i = 0; i < miniLOL.theme.informations.styles.length; i++) {
                miniLOL.theme.style.unload(miniLOL.theme.informations.styles[i]);
            }

            delete miniLOL.theme.name;

            delete miniLOL.theme.initialize;
            delete miniLOL.theme.finalize;

            delete miniLOL.theme.informations;
        },

        content: function () {
            return $(miniLOL.theme.content._node);
        },

        menu: function () {
            return $(miniLOL.theme.menu._node);
        },

        deprecated: function () {
            miniLOL.theme.path          = "themes";
            miniLOL.theme.content._node = miniLOL.config["core"].contentNode || "body";
            miniLOL.theme.menu._node    = miniLOL.config["core"].menuNode || "menu";
            miniLOL.theme.template.list = miniLOL.theme.template.defaultList();

            new Ajax.Request("resources/template.html", {
                method: "get",
                asynchronous: false,

                onSuccess: function (http) {
                    $(document.body).update(http.responseText);
                },

                onFailure: function () {
                    $(document.body).update("<div id='menu'></div><div id='body'></div>");
                }
            });

            miniLOL.utils.includeCSS("resources/style.css");

            miniLOL.theme.template._cache = {};

            return true;
        }
    },

    menu: {
        set: function (data) {
            if (!miniLOL.menu.enabled()) {
                return;
            }

            miniLOL.theme.menu().update(data);
        },

        get: function (name) {
            if (!miniLOL.menu.enabled()) {
                return "";
            }

            name = name || "default";

            if (!miniLOL.menu.exists(name)) {
                var error = "The menu `#{name}` doesn't exist.".interpolate({
                    name: name
                });

                miniLOL.error(error);

                return error;
            }

            return miniLOL.menu.parse(miniLOL.menus[name]);
        },

        change: function (name) {
            var content = miniLOL.menu.get(name);

            if (!miniLOL.error()) {
                miniLOL.menu.set(content);
                miniLOL.menu.current = name;
            }

            Event.fire(document, ":menu.change", miniLOL.menus[name]);
        },

        enabled: function () {
            return Boolean(miniLOL.menus["default"]);
        },

        exists: function (name) {
            return Boolean(miniLOL.menus[name]);
        },

        layer: function (template, layer) {
            var result = {};

            if (template) {
                var dom = template.getElementById(layer) || template.getElementById('*');

                if (dom) {
                    if (dom.getElementsByTagName("menu").length) {
                        result.menu = dom.getElementsByTagName("menu")[0].firstChild.nodeValue;
                    }

                    if (dom.getElementsByTagName("item").length) {
                        result.item = dom.getElementsByTagName("item")[0].firstChild.nodeValue;
                    }
                }
            }

            if (!result.menu) {
                result.menu = "#{data}";
            }

            if (!result.item) {
                result.item = "<a href='#{href}' #{attributes}>#{text}</a> ";
            }

            return result;
        },

        parse: function (menu, layer) {
            layer = layer || 0;

            var template = miniLOL.theme.template.menu();

            if (!template || !menu) {
                if (miniLOL.error()) {
                    return false;
                }
            }

            var first    = true;
            var output   = '';
            var contents = menu.childNodes;
            
            for (var i = 0; i < contents.length; i++) {
                switch (contents[i].nodeType) {
                    case Node.ELEMENT_NODE:
                    if (contents[i].nodeName == "menu") {
                        output += miniLOL.menu.layer(template, layer + 1).menu.interpolate({
                            data: miniLOL.menu.parse(contents[i], layer + 1)
                        });
                    }
                    else if (contents[i].nodeName == "item") {
                        var item = contents[i].cloneNode(true);
    
                        var text = miniLOL.utils.getFirstText(contents[i].childNodes);
                        var data = miniLOL.menu.parse(contents[i]);
    
                        var itemClass = item.getAttribute("class") || ''; item.removeAttribute("class");
                        var itemId    = item.getAttribute("id") || ''; item.removeAttribute("id");
                        var itemSrc   = item.getAttribute("src")
                                     || item.getAttribute("href")
                                     || item.getAttribute("url")
                                     || '';
                        
                        item.removeAttribute("src");
                        item.removeAttribute("href");
                        item.removeAttribute("url");
                        
                        output += miniLOL.menu.layer(template, layer).item.interpolate(Object.extend(Object.fromAttributes(item.attributes), {
                            "class":    itemClass,
                            id:         itemId,
                            url:        itemSrc,
                            src:        itemSrc,
                            href:       itemSrc,
                            attributes: String.fromAttributes(item.attributes),
                            text:       text,
                            data:       data
                        }));
                    }
                    else {
                        output += miniLOL.menu.parseOther(contents[i], template);
                    }
                    break;

                    case Node.CDATA_SECTION_NODE:
                    case Node.TEXT_NODE:
                    if (!first) {
                        output += contents[i].nodeValue;
                    }

                    first = false;
                    break;
                }
            }

            if (output.replace(/[\s\n]*/g, '')) {
                if (layer == 0) {
                    return miniLOL.menu.layer(template, layer).menu.interpolate({
                        data: output
                    });
                }
                else {
                    return output;
                }
            }
            else {
                return '';
            }
        },

        parseOther: function (data, template) {
            var output  = '';
            var outputs = {};

            if (!data || !template) {
                return output;
            }

            template = template.getElementsByTagName(data.nodeName);
            if (template.length == 0) {
                return output;
            }
            else {
                template = template[0]
            }

            var text = miniLOL.utils.getFirstText(template.childNodes);

            var objects = data.childNodes;
            for (var i = 0; i < objects.length; i++) {
                if (objects[i].nodeType == Node.ELEMENT_NODE) {
                    outputs[objects[i].nodeName] = miniLOL.menu.parseOther(objects[i], template);
                }
            }

            outputs["text"] = miniLOL.utils.getFirstText(data.childNodes);

            return text.interpolate(Object.extend(outputs, Object.fromAttributes(data.attributes)));
        }
    },

    page: {
        get: function (name, queries, url) {
            miniLOL.content.set(miniLOL.config["core"].loadingMessage);

            Event.fire(document, ":page.get", { name: name, queries: queries });

            var page = miniLOL.pages.data[name];
            var type = queries.type;
        
            if (!page) {
                miniLOL.content.set("404 - Not Found");
                return false;
            }

            if (page.getAttribute("alias")) {
                if (typeof queries[name] != "string") {
                    delete queries[name];
                }
                delete queries.page;

                if (!queries.title && page.getAttribute("title")) {
                    queries.title = encodeURIComponent(page.getAttribute("title"));
                }

                var queries = Object.toQuery(queries);
                if (queries) {
                    queries = '&'+queries;
                }

                page = page.getAttribute("alias");
                if (!page.isURL() && page.charAt(0) != '#') {
                    page = '#'+page;
                }

                return miniLOL.go(page+queries);
            }

            if (type == null) {
                type = page.getAttribute("type");
            }
        
            if (miniLOL.menu.enabled()) {
                miniLOL.menu.change(miniLOL.menu.current);
            }

            if (url) {
                var data = {};
                Object.extend(data, miniLOL.config["core"]);
                Object.extend(data, queries);

                document.title = (
                       queries.title
                    || page.getAttribute("title")
                    || miniLOL.config["core"].siteTitle
                ).interpolate(data);
            }
        
            if (miniLOL.pages.cache[name]) {
                if (miniLOL.functions[type]) {
                    miniLOL.content.set(miniLOL.functions[type](miniLOL.pages.cache[name], queries));
                }
                else {
                    miniLOL.content.set(miniLOL.pages.cache[name]);
                }

                return true;
            }

            var pageArguments = page.getAttribute("arguments");
            if (pageArguments) {
                pageArguments = pageArguments.replace(/[ ,]+/g, "&amp;").parseQuery();

                for (var key in pageArguments) {
                    if (queries[key] == null) {
                        queries[key] = pageArguments[key];
                    }
                }
            }
        
            var output = miniLOL.page.parse(page);

            miniLOL.pages.cache[name] = output;

            if (miniLOL.functions[type]) {
                output = miniLOL.functions[type](output, queries);
            }

            miniLOL.content.set(output);

            return true;
        },

        parse: function (page, data) {
            var output   = '';
            var contents = page.childNodes;

            for (var i = 0; i < contents.length; i++) {
                switch (contents[i].nodeType) {
                    case Node.ELEMENT_NODE:
                    if (contents[i].nodeName != "list") {
                        continue;
                    }

                    var ele = contents[i].cloneNode(false);

                    if (!data) {
                        data = [ele];
                    }
                    
                    var list       = contents[i].childNodes;
                    var listBefore = ele.getAttribute("before") || data[0].getAttribute("before") || ''; ele.removeAttribute("before");
                    var listAfter  = ele.getAttribute("after") || data[0].getAttribute("after") || ''; ele.removeAttribute("after");
                    var listArgs   = ele.getAttribute("arguments") || data[0].getAttribute("arguments") || ''; ele.removeAttribute("arguments");
                    var listType   = ele.getAttribute("type") || data[0].getAttribute("type") || ''; ele.removeAttribute("type");
                    var listMenu   = ele.getAttribute("menu") || data[0].getAttribute("menu"); ele.removeAttribute("menu");
        
                    var listOutput = '';
                    for (var h = 0; h < list.length; h++) {
                        if (list[h].nodeType == Node.ELEMENT_NODE) {
                            if (list[h].nodeName == "link") {
                                var link = list[h].cloneNode(true);
                
                                var src = link.getAttribute("src")
                                       || link.getAttribute("href")
                                       || link.getAttribute("url")
                                       || '';
                                       
                                link.removeAttribute("src");
                                link.removeAttribute("href");
                                link.removeAttribute("url");

                                var target = link.getAttribute("target"); link.removeAttribute("target");
                                var text   = link.getAttribute("text") || ''; link.removeAttribute("text");
                                var before = link.getAttribute("before") || listBefore || ''; link.removeAttribute("before");
                                var after  = link.getAttribute("after") || listAfter || ''; link.removeAttribute("after");
                                var domain = link.getAttribute("domain") || ''; link.removeAttribute("domain");
                                var args   = link.getAttribute("arguments") || listArgs; link.removeAttribute("arguments");
                                var menu   = link.getAttribute("menu") || listMenu; link.removeAttribute("menu");
                                var title  = link.getAttribute("title") || ""; link.removeAttribute("title");

                                var out = src.isURL();
                
                                var linkClass = link.getAttribute("class") || ''; link.removeAttribute("class");
                                var linkId    = link.getAttribute("id") || ''; link.removeAttribute("id");

                                if (target || out) {
                                    src    = (!out) ? "data/"+src : src;
                                    target = target || "_blank";
                                    text   = text || src;
                                }
                                else {
                                    var ltype = link.getAttribute("type") || listType || ''; link.removeAttribute("type");
                
                                    if (domain == "in" || src.charAt(0) == '#') {
                                        src = (src.charAt(0) == '#') ? src : '#' + src;
                                    }
                                    else {
                                        src = "#page=" + src;
                                    }

                                    text   = text || src;
                                    args   = args ? '&'+args.replace(/[ ,]+/g, "&amp;") : '';
                                    ltype  = ltype ? "&type="+ltype : '';
                                    menu   = miniLOL.menu.enabled() && menu ? "&amp;menu="+menu : '';
                                    target = '';

                                    if (title) {
                                        title = title.interpolate({
                                            text: text,
                                            url:  src,
                                            href: src,
                                            src:  src
                                        });
                                    }

                                    title = title ? "&title="+encodeURIComponent(title) : '';

                                    src = src + args + ltype + menu + title;
                                }

                                listOutput += miniLOL.theme.template.list.link.interpolate(Object.extend(Object.fromAttributes(link.attributes), {
                                    "class":    linkClass,
                                    id:         linkId,
                                    attributes: String.fromAttributes(link.attributes),
                                    before:     miniLOL.theme.template.list.before.interpolate({ data: before }),
                                    after:      miniLOL.theme.template.list.after.interpolate({ data: after }),
                                    url:        src,
                                    src:        src,
                                    href:       src,
                                    target:     target,
                                    text:       text,
                                    title:      title
                                }));
                            }
                            else if (list[h].nodeName == "item") {
                                var item = list[h].cloneNode(true);
                
                                var text   = item.getAttribute("text") || ''; item.removeAttribute("text");
                                var before = item.getAttribute("before") || listBefore || ''; item.removeAttribute("before");
                                var after  = item.getAttribute("after") || listAfter || ''; item.removeAttribute("after");
                
                                var itemClass = item.getAttribute("class") || ''; item.removeAttribute("class");
                                var itemId    = item.getAttribute("id") || ''; item.removeAttribute("id");

                                listOutput += miniLOL.theme.template.list.item.interpolate(Object.extend(Object.fromAttributes(item.attributes), {
                                    "class":    itemClass,
                                    id:         itemId,
                                    attributes: String.fromAttributes(item.attributes),
                                    before:     miniLOL.theme.template.list.before.interpolate({ data: before }),
                                    after:      miniLOL.theme.template.list.after.interpolate({ data: after }),
                                    text:       text
                                }));
                            }
                            else if (list[h].nodeName == "list") {
                                listOutput += miniLOL.page.parse({ childNodes: [list[h]] }, [contents[i]]);
                            }
                            else if (list[h].nodeName == "nest") {
                                toParse = list[h].cloneNode(true);

                                listOutput += miniLOL.theme.template.list.nest.interpolate({
                                    "class": list[h].getAttribute("class") || '',
                                    style:   list[h].getAttribute("style") || '',
                                    before:  miniLOL.theme.template.list.before.interpolate({ data: before }),
                                    after:   miniLOL.theme.template.list.after.interpolate({ data: after }),
                                    data:    miniLOL.page.parse(toParse, [contents[i]])
                                });
                            }
                        }
                        else if (list[h].nodeType == Node.CDATA_SECTION_NODE || list[h].nodeType == Node.TEXT_NODE) {
                            if (list[h].nodeValue.replace(/[\s\n]+/g, '')) {
                                listOutput += miniLOL.theme.template.list.data.interpolate({
                                    before: miniLOL.theme.template.list.before.interpolate({ data: before }),
                                    after:  miniLOL.theme.template.list.after.interpolate({ data: after }),
                                    data:  list[h].nodeValue
                                });
                            }
                        }
                    }

                    output += miniLOL.theme.template.list.global.interpolate(Object.extend(Object.fromAttributes(ele.attributes), {
                        attributes: String.fromAttributes(ele.attributes),
                        data: listOutput
                    }));
                    break;
        
                    case Node.CDATA_SECTION_NODE:
                    case Node.TEXT_NODE:
                    output += contents[i].nodeValue;
                    break;
                }
            }

            return output;
        },

        load: function (path, queries, url) {
            miniLOL.content.set(miniLOL.config["core"].loadingMessage);

            Event.fire(document, ":page.load", { path: path, queries: queries });

            if (url) {
                var data = {};
                Object.extend(data, miniLOL.config["core"]);
                Object.extend(data, queries);

                document.title = (
                       queries.title
                    || miniLOL.config["core"].siteTitle
                ).interpolate(data);
            }

            new Ajax.Request("data/#{path}?#{queries}".interpolate({ path: path, queries: Object.toQuery(queries) }), {
                method: "get",
        
                onSuccess: function (http) {
                    if (miniLOL.functions[queries.type]) {
                        miniLOL.content.set(miniLOL.functions[queries.type](http.responseText, queries));
                    }
                    else {
                        miniLOL.content.set(http.responseText);
                    }

                    Event.fire(document, ":page.loaded", http);

                    Event.fire(document, ":go", url);
                },
        
                onFailure: function (http) {
                    miniLOL.content.set("#{code} - #{text}".interpolate({
                        code: http.status,
                        text: http.statusText
                    }));

                    Event.fire(document, ":page.loaded", http);
                }
            });
        }
    },

    module: {
        create: function (name, obj) {
            if (!obj) {
                miniLOL.error("Like, do I know how this module is done?");
                return false;
            }

            obj.name = name;
            obj.root = "#{path}/#{module}".interpolate({
                path: miniLOL.module.path,
                module: name
            });

            if (!obj.type) {
                obj.type = "active";
            }

            if (!obj.execute) {
                obj.execute = new Function;
            }

            for (var func in obj) {
                if (Object.isFunction(obj[func])) {
                    obj[func] = obj[func].bind(obj)
                }
            }

            if (obj.initialize) {
                try {
                    if (obj.initialize() === false) {
                        if (miniLOL.error()) {
                            return false;
                        }

                        throw new Error("An error occurred while initializing the module.");
                    }
                }
                catch (e) {
                    e.fileName = "#{root}/#{path}/#{module}/main.js".interpolate({
                        root: miniLOL.path,
                        path: miniLOL.module.path,
                        module: name
                    });

                    throw e;
                }
            }

            miniLOL.modules[name] = obj;

            if (obj.aliases) {
                for (var i = 0; i < obj.aliases.length; i++) {
                    miniLOL.modules[obj.aliases[i]] = obj;
                }
            }

            if (obj.onGo) {
                Event.observe(document, ":go", obj.onGo);
            }

            Event.fire(document, ":module.create", obj);
        },

        execute: function (name, vars, output) {
            if (!name) {
                miniLOL.error("What module should be executed?");
                return false;
            }

            if (!miniLOL.module.exists(name)) {
                if (output) {
                    miniLOL.error("The module `#{name}` isn't loaded.".interpolate({ name: name }), miniLOL.theme.content(), true);
                }

                return false;
            }

            if (output) {
                miniLOL.content.set(miniLOL.config['core'].loadingMessage);

                var data = {};
                Object.extend(data, miniLOL.config["core"]);
                Object.extend(data, vars);

                document.title = (
                       vars.title
                    || miniLOL.module.get(name).title
                    || miniLOL.config["core"].siteTitle
                ).interpolate(data);
            }

            vars = (Object.isArray(vars)) ? vars : [vars];

            Event.fire(document, ":module.execute", { name: name, arguments: vars });

            var result;
            try {
                result = miniLOL.module.get(name).execute.apply(miniLOL.module.get(name), vars);
            }
            catch (e) {
                e.fileName = "#{root}/#{path}/#{module}/main.js".interpolate({
                    root: miniLOL.path,
                    path: miniLOL.module.path,
                    module: name
                });

                miniLOL.error("An error occurred while executing the module `#{name}`<br/><br/>#{file} @ #{line}:<br/>#{error}".interpolate({
                    name:  name,
                    file:  e.fileName,
                    line:  e.lineNumber,
                    error: e.toString()
                }), miniLOL.theme.content());

                return false;
            }

            Event.fire(document, ":module.executed", { name: name, arguments: vars, result: result });

            return result;
        },

        load: function (name) {
            Event.fire(document, ":module.load", name);

            try {
                miniLOL.utils.require("#{path}/#{module}/main.js".interpolate({
                    path: miniLOL.module.path,
                    module: name
                }));

                if (miniLOL.error()) {
                    return false;
                }

                if (!miniLOL.module.exists(name)) {
                    throw new Error("Something went wrong while loading the module `#{name}`.".interpolate({
                        name: name
                    }));
                }

                Event.fire(document, ":module.loaded", name);

                return true;
            }
            catch (e) {
                miniLOL.error("An error occurred while loading the module `#{name}`<br/><br/>#{root}/#{file} @ #{line}:<br/>#{error}".interpolate({
                    name:  name,
                    root:  miniLOL.path,
                    file:  e.fileName,
                    line:  e.lineNumber,
                    error: e.toString()
                }), miniLOL.theme.content());

                return false;
            }
        },

        get: function (name) {
            return miniLOL.modules[name];
        },

        exists: function (name) {
            return Boolean(miniLOL.module.get(name));
        },

        dependencies: {
            check: function () {
                for (var module in miniLOL.modules) {
                    var dependencies = miniLOL.module.get(module).dependencies;

                    if (dependencies) {
                        for (var i = 0; i < dependencies.length; i++) {
                            if (!miniLOL.module.get(dependencies[i])) {
                                throw { module: module, require: dependencies[i] };
                            }
                        }
                    }
                }

                return true;
            },

            needs: function (name, callback, context, wait) {
                if (miniLOL.module.get(name)) {
                    callback.call(context || window);
                }
                else {
                    setTimeout(function () {
                        miniLOL.module.dependencies.needs(name, callback, context);
                    }, wait || 10);
                }
            }
        }
    },

    go: function (url) {
        if (!url.startsWith(miniLOL.path) && url.isURL()) {
            location.href = url;
            return true;
        }

        var queries = url.parseQuery();
        var matches = /#(([^=&]*)&|([^=&]*)$)/.exec(url); // hate WebKit so much.
        var result  = false;

        if (queries.menu && miniLOL.menu.current != queries.menu) {
            miniLOL.menu.change(queries.menu);
        }

        if (matches) {
            queries.page = matches[2] || matches[1];

            if (queries.page && queries.page != '&') {
                result = miniLOL.page.get(queries.page, queries, url);
            }
            else {
                result = miniLOL.go("#{page}&#{queries}".interpolate({
                    page:    miniLOL.config["core"].homePage,
                    queries: Object.toQuery(queries)
                }));
            }
        }
        else if (queries.module) {
            result = miniLOL.module.execute(queries.module, queries, true);
        }
        else if (queries.page) {
            var page = queries.page; delete queries.page;
            result   = miniLOL.page.load(page, queries, url);
        } 
        else {
            result = miniLOL.go(miniLOL.config["core"].homePage);
        }

        if (result) {
            Event.fire(document, ":go", url);
        }

        return result;
    },

    utils: {
        getElementById: function (id) {
            var elements = this.getElementsByTagName('*');
            
            for (var i = 0; i < elements.length; i++) {
                if (elements[i].getAttribute("id") == id) {
                    return elements[i];
                }
            }

            return undefined;
        },

        fixDOM: function (obj) {
            if (!obj || Prototype.Browser.Good) {
                return obj;
            }

            if (Prototype.Browser.IE) {
                var tmp = obj;

                obj       = {};
                obj._real = tmp;

                obj.documentElement = tmp.documentElement;
                
                obj.getElementsByTagName = function (name) {
                    return this._real.getElementsByTagName(name);
                };

                obj.getElementById = function (id) {
                    return miniLOL.utils.getElementById.call(this._real, id);
                }
            }
            else {
                obj.getElementById = miniLOL.utils.getElementById;
            }

            return obj;
        },

        checkXML: function (xml, path) {
            var error = false;

            if (!xml) {
                error = "There's a syntax error.";
            }

            if (xml.documentElement.nodeName == "parsererror") {
                error = xml.documentElement.textContent;
            }

            if (path && error) {
                miniLOL.error("Error while parsing #{path}<br/><br/>#{error}".interpolate({
                    path:  path,
                    error: error.replace(/\n/g, "<br/>").replace(/ /g, "&nbsp;")
                }));

                return error;
            }

            return error;
        },

        getFirstText: function (elements) {
            for (var i = 0; i < elements.length; i++) {
                switch (elements[i].nodeType) {
                    case Node.ELEMENT_NODE:
                    return '';
                    break;

                    case Node.CDATA_SECTION_NODE:
                    case Node.TEXT_NODE:
                    if (elements[i].nodeValue.replace(/[\s\n]/g, '')) {
                        return elements[i].nodeValue;
                    }
                    break;
                }
            }

            return '';
        },

        fileExists: function (path) {
            var result = false;

            new Ajax.Request(path, {
                method: "head",
                asynchronous: false,

                onSuccess: function () {
                    result = true;
                }
            });

            return result;
        },

        includeCSS: function (path) {
            var style = miniLOL.utils.fileExists(path);

            if (style) {
                style = new Element("link", {
                    rel: "stylesheet",
                    href: path,
                    type: "text/css"
                });

                $$("head")[0].insert(style);
            }

            return style;
        },

        include: function (path) {
            var result = null;
            
            new Ajax.Request(path, {
                method: "get",
                asynchronous: false,
                evalJS: false,
                
                onSuccess: function (http) {
                    try {
                        result = window.eval(http.responseText);
                    } catch (e) { }
                }
            });
            
            return result;
        },

        require: function (path) {
            var result;
            var error;
            
            new Ajax.Request(path, {
                method: "get",
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
                    error            = new Error("Failed to retrieve the file (#{status} - #{statusText}).".interpolate(http));
                    error.fileName   = path;
                    error.lineNumber = 0;
                }
            });

            if (error) {
                throw error;
            }
            
            return result;
        }
    }
}

miniLOL.Resource = Class.create({
    initialize: function (name, wrapper) {
        if (!wrapper) {
            throw new Error("No wrapper has been passed.");
        }

        this._name    = name;
        this._wrapper = wrapper;

        if (!this._wrapper.clear) {
            this._wrapper.clear = function () {
                this._data = {};
            }
        }

        for (var func in this._wrapper) {
            if (Object.isFunction(this._wrapper[func])) {
                if (this._wrapper[func]._parent == this._wrapper) {
                    break;
                }

                this._wrapper[func]         = this._wrapper[func].bind(this._wrapper)
                this._wrapper[func]._parent = this._wrapper;
            }
        }

        this.clear();
        this.flush();

        if (this._wrapper.initialize) {
            this._wrapper.initialize();
        }
    },

    load: function () {
        var result;
        var args = $A(arguments);

        Event.fire(document, ":resource.load", { name: this._name, arguments: args });

        this._calls.push(args);

        try {
            result = this._wrapper.load.apply(this._wrapper, args);
        }
        catch (e) {
            miniLOL.error("Error while loading `#{name}` resource.<br/>#{error}".interpolate({
                name: this._name,
                error: e.toString()
            }), miniLOL.theme.content());

            return false;
        }

        Event.fire(document, ":resource.loaded", { name: this._name, arguments: args });

        return result;
    },

    reload: function () {
        Event.fire(document, ":resource.reload", { name: this._name });

        this._wrapper.clear();

        var calls = this.flush();

        for (var i = 0; i < calls.length; i++) {
            this.load.apply(this, calls[i]);
        }

        Event.fire(document, ":resource.reloaded", { name: this._name });
    },

    clear: function () {
        Event.fire(document, ":resource.clear", { name: this._name });
        this._wrapper.clear();
    },

    flush: function (call) {
        Event.fire(document, ":resource.flush", { name: this._name, call: call });

        var result;

        if (Object.isArray(call)) {
            result = this._calls.find(function (current) {
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
                this._calls = this._calls.filter(function (current) {
                    return current != result;
                });
            }
        }
        else {
            result      = this._calls;
            this._calls = [];
        }

        return result;
    }
});

miniLOL.utils.require("system/preparation.js");
