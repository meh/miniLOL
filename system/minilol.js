/****************************************************************************
 * Copyleft meh. [http://meh.doesntexist.org | meh.ffff@gmail.com]          *
 *                                                                          *
 * This file is part of miniLOL.                                            *
 *                                                                          *
 * miniLOL is free software: you can redistribute it and/or modify          *
 * it under the terms of the GNU General Public License as published by     *
 * the Free Software Foundation, either version 3 of the License, or        *
 * (at your option) any later version.                                      *
 *                                                                          *
 * miniLOL is distributed in the hope that it will be useful,               *
 * but WITHOUT ANY WARRANTY; without even the implied warranty of           *
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the            *
 * GNU General Public License for more details.                             *
 *                                                                          *
 * You should have received a copy of the GNU General Public License        *
 * along with miniLOL.  If not, see <http://www.gnu.org/licenses/>.         *
 ****************************************************************************/

/*
 * miniLOL is a Javascript/XML based CMS, thus, being in the XXI century,
 * I pretend those two standards to be respected.
 *
 * Get a real browser, get Firefox.
 */

miniLOL = {
    version: "1.0.1",

    initialize: function () {
        [function () {
            miniLOL.resource.load(miniLOL.resources.config, "resources/config.xml");

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
                if (miniLOL.config["core"].homePage.charAt(0) != '#') {
                    miniLOL.config["core"].homePage = '#'+miniLOL.config["core"].homePage;
                }
            }
                 
            document.title = miniLOL.config["core"].siteTitle;
            $(document.body).update(miniLOL.config["core"].loadingMessage);
        },

        function () {
            miniLOL.resource.load(miniLOL.resources.menus, "resources/menus.xml");
        },

        function () {
            miniLOL.resource.load(miniLOL.resources.pages, "resources/pages.xml");
        },

        function () {
            miniLOL.resource.load(miniLOL.resources.functions, "resources/functions.xml");
        },
        
        function () {
            if (miniLOL.config["core"].theme) {
                miniLOL.error(!miniLOL.theme.load(miniLOL.config["core"].theme));
            }
            else {
                miniLOL.error(!miniLOL.theme.deprecated());
            }
        },
        
        function () {
            if (!miniLOL.theme.menu()) {
                miniLOL.menus.dom = null;
            }

            if (miniLOL.menu.enabled()) {
                miniLOL.menu.change("default");
            }
        },

        function () {
            miniLOL.content.set("Loading modules...");
            miniLOL.resource.load(miniLOL.resources.modules, "resources/modules.xml", true);
        },
        
        function () {
            miniLOL.content.set("Checking dependencies...");
            try {
                miniLOL.module.dependencies.check();
            }
            catch (error) {
                miniLOL.error("`#{module}` requires `#{require}`".interpolate(error), miniLOL.theme.content());
            }
        }].each(function (callback) {
            try {
                callback();
            }
            catch (error) {
                miniLOL.error(error.toString());
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
    },

    error: function (text, element) {
        if (Object.isUndefined(text)) {
            return Boolean(miniLOL.error._value);
        }

        if (Object.isBoolean(text)) {
            return miniLOL.error._value = text;
        }

        element = element || document.body;

        $(element).update(text);
        miniLOL.error._value = true;
    },

    content: {
        set: function (data) {
            miniLOL.theme.content().update(data);
        },

        get: function () {
            return miniLOL.theme.content().innerHTML;
        }
    },

    resource: {
        load: function (wrapper) {
            if (!wrapper) {
                miniLOL.content.set("What wrapper should be loaded?");
                return false;
            }

            Event.fire(document, ":resource.load", wrapper.name);

            for (var func in wrapper) {
                if (Object.isFunction(wrapper[func])) {
                    if (wrapper[func]._parent == wrapper) {
                        break;
                    }

                    wrapper[func]         = wrapper[func].bind(wrapper)
                    wrapper[func]._parent = wrapper;
                }
            }

            var args = $A(arguments).slice(1);

            if (!wrapper._calls) {
                wrapper._calls = [];
            }

            wrapper._calls.push(args);
            wrapper.load.apply(wrapper, args);
        },

        reload: function (wrapper) {
            if (!wrapper) {
                miniLOL.content.set("What wrapper should be reloaded?");
                return false;
            }

            Event.fire(document, ":resource.reload", wrapper.name);

            wrapper.res = null;

            var calls      = wrapper._calls;
            wrapper._calls = [];

            for (var i = 0; i < calls.length; i++) {
                miniLOL.resource.load.apply(window, [wrapper].concat(calls[i]));
            }
        }
    },

    refresh: function () {
        miniLOL.resource.reload(miniLOL.resources.config)
        miniLOL.resource.reload(miniLOL.resources.menus);
        miniLOL.resource.reload(miniLOL.resources.pages);
        miniLOL.resource.reload(miniLOL.resources.functions);
    },

    resources: {
        config: {
            name: "config",

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
            },

            load: function () {
                if (!this.res) {
                    this.res = {};
                } var res = this.res;

                miniLOL.config = this.res;

                var paths = $A(arguments);

                var This = this;
                for (var i = 0; i < paths.length; i++) {
                    new Ajax.Request(paths[i], {
                        method: "get",
                        asynchronous: false,
        
                        onSuccess: function (http) {
                            var error = miniLOL.utils.checkXML(miniLOL.utils.fixDOM(http.responseXML));
                            if (error) {
                                miniLOL.error("Error while parsing config.xml<br/><br/>#{error}".interpolate({
                                    error: error.replace(/\n/g, "<br/>").replace(/ /g, "&nbsp;")
                                }));

                                return;
                            }

                            var domain = http.responseXML.documentElement.getAttribute("domain") || "core";
                            var config = miniLOL.config[domain] || {};

                            miniLOL.config[domain]
                                = Object.extend(config, This.parse(http.responseXML.documentElement));
                        },
        
                        onFailure: function (http) {
                            miniLOL.error("Error while loading config.xml (#{error})".interpolate({
                                error: http.status
                            }));
                        }
                    });
                }
            }
        },

        menus: {
            name: "menus",

            load: function (path) {
                if (!this.res) {
                    this.res = {
                        dom: null    
                    };
                } var res = this.res;

                miniLOL.menus = res;

                new Ajax.Request(path, {
                    method: "get",
                    asynchronous: false,

                    onSuccess: function (http) {
                        var error = miniLOL.utils.checkXML(http.responseXML);
                        if (error) {
                            miniLOL.error("Error while parsing menus.xml<br/><br/>#{error}".interpolate({
                                error: error.replace(/\n/g, "<br/>").replace(/ /g, "&nbsp;")
                            }));

                            return;
                        }

                        var response = miniLOL.utils.fixDOM(http.responseXML);

                        miniLOL.menu._default = response.getElementById("default");
                        if (!miniLOL.menu._default) {
                            var menus = response.getElementsByTagName("menu");

                            for (var i = 0; i < menus.length; i++) {
                                if (!menus[i].getAttribute("id")) {
                                    miniLOL.menu._default = menus[i];
                                    break;
                                }
                            }

                            if (i >= menus.length) {
                                miniLOL.error("Error while analyzing menus.xml<br/><br/>No default menu was found.");
                                return;
                            }
                        }

                        miniLOL.menus.dom = response;
                    }
                });
            }
        },
    
        pages: {
            name: "pages",
            
            load: function (path) {
                if (!this.res) {
                    this.res = {
                        dom: null,
                        cache: {}
                    };
                } var res = this.res;

                miniLOL.pages = this.res;

                new Ajax.Request(path, {
                    method: "get",
                    asynchronous: false,
    
                    onSuccess: function (http) {
                        var error = miniLOL.utils.checkXML(http.responseXML);
                        if (error) {
                            miniLOL.error("Error while parsing pages.xml<br/><br/>#{error}".interpolate({
                                error: error.replace(/\n/g, "<br/>").replace(/ /g, "&nbsp;")
                            }));

                            return;
                        }

                        miniLOL.pages.dom = miniLOL.utils.fixDOM(http.responseXML);

                        var pages = http.responseXML.documentElement.getElementsByTagName("page");
                        for (var i = 0; i < pages.length; i++) {
                            delete miniLOL.pages.cache[pages[i].getAttribute("id")];
                        }
                    },
    
                    onFailure: function (http) {
                        miniLOL.error("Error while loading pages.xml (#{error})".interpolate({
                            error: http.status
                        }));
                    }
                });
            }
        },
    
        functions: {
            name: "functions",

            load: function (path) {
                if (!this.res) {
                    this.res = {};
                }

                miniLOL.functions = this.res;

                new Ajax.Request(path, {
                    method: "get",
                    asynchronous: false,
        
                    onSuccess: function (http) {
                        var error = miniLOL.utils.checkXML(http.responseXML);
                        if (error) {
                            miniLOL.error("Error while parsing functions.xml<br/><br/>#{error}".interpolate({
                                error: error.replace(/\n/g, "<br/>").replace(/ /g, "&nbsp;")
                            }));

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
                            catch (error) {
                                miniLOL.error("Error while creating `#{name}` wrapper from #{path}:<br/><br/>#{error}".interpolate({
                                    name: functions[i].getAttribute("name"),
                                    path: path,
                                    error: error.toString()
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
            }
        },
    
        modules: {
            name: "modules",

            load: function (path, output) {
                if (!this.res) {
                    this.res = {
                        loading: {},
                        list: {}
                    };
                } var res = this.res;

                miniLOL.modules = this.res.list;

                new Ajax.Request(path, {
                    method: "get",
                    asynchronous: false,
        
                    onSuccess: function (http) { 
                        var error = miniLOL.utils.checkXML(http.responseXML);
                        if (error) {
                            miniLOL.error("Error while parsing modules.xml<br/><br/>#{error}".interpolate({
                                error: error.replace(/\n/g, "<br/>").replace(/ /g, "&nbsp;")
                            }), miniLOL.theme.content());

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
            }
        }
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
                        var error = miniLOL.utils.checkXML(http.responseXML);
                        if (error) {
                            miniLOL.error("Error while parsing #{file}<br/><br/>#{error}".interpolate({
                                file:  file,
                                error: error.replace(/\n/g, "<br/>").replace(/ /g, "&nbsp;")
                            }));
                        }
                        else {
                            miniLOL.theme.template._cache[file] = miniLOL.utils.fixDOM(http.responseXML);
                        }
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
                    nest: "<div class='#{class}' style='#{1}'>#{data}</div>",
                    data: "<div class='data'>#{before}#{data}#{after}</div>"
                };
            }
        },

        load: function (name, runtime, noInitialization) {
            miniLOL.theme.unload();

            var path = name.match(/^(.+?):(.+)$/);
            if (path) {
                miniLOL.theme.path = path[1];
                name               = path[2];
            }
            else {
                miniLOL.theme.path = "themes";
            }

            if (miniLOL.theme.name == name) {
                return true;
            }

            miniLOL.theme.name = name;

            var path = "#{path}/#{theme}".interpolate({ path: miniLOL.theme.path, theme: name });

            Event.fire(document, ":theme.load", { name: name, runtime: Boolean(runtime) });

            var result = true;
            // get the informations about the theme and parse the needed data
            new Ajax.Request("#{path}/theme.xml".interpolate({ path: path, theme: name }), {
                method: "get",
                asynchronous: false,
                
                onSuccess: function (http) {
                    var info = miniLOL.theme.informations = {};
                    var doc  = miniLOL.utils.fixDOM(http.responseXML);

                    info.name   = doc.documentElement.getAttribute("name")   || "Unknown";
                    info.author = doc.documentElement.getAttribute("author") || "Anonymous";
                    
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

            // get the html layout and set it
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

            miniLOL.theme.template._cache = {};

            if (runtime) {
                if (miniLOL.menu.enabled()) {
                    miniLOL.menu.change(miniLOL.menu.current);
                }

                miniLOL.go(/[#?]./.test(location.href) ? location.href.replace(/^.*[#?]/, '#') : miniLOL.config["core"].homePage);
            }

            if (!noInitialization && miniLOL.theme.initialize) {
                miniLOL.utils.retarded(miniLOL.theme.initialize);
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

            delete miniLOL.theme.template._cache;
        },

        content: function () {
            return $(miniLOL.theme.content._node);
        },

        menu: function () {
            return $(miniLOL.theme.menu._node);
        },

        deprecated: function () {
            miniLOL.theme.content._node = miniLOL.config["core"].contentNode || "body";
            miniLOL.theme.menu._node    = miniLOL.config["core"].menuNode || "menu";
            miniLOL.theme.template.list = miniLOL.theme.template.defaultList();

            new Ajax.Request("resources/template.html", {
                method: "get",
                asynchronos: false,

                onSuccess: function (http) {
                    $(document.body).update(http.responseText);
                },
            });

            miniLOL.utils.includeCSS("resources/style.css");

            miniLOL.theme.template._cache = {};

            return true;
        }
    },

    menu: {
        parse: function (menu, layer) {
            layer = layer || 0;

            var template = miniLOL.theme.template.menu();

            // Checking if there's a menu template
            if (template) {
                template = template.getElementById(layer) || template.getElementById('*');
            }

            // If the menu has a template get the wanted layer
            if (template) {
                var tmp  = template;
                template = {};

                if (tmp.getElementsByTagName("menu").length) {
                    template.menu = tmp.getElementsByTagName("menu")[0].firstChild.nodeValue;
                }

                if (tmp.getElementsByTagName("item").length) {
                    template.item = tmp.getElementsByTagName("item")[0].firstChild.nodeValue;
                }
            }
            else {
                template = {};
            }

            if (!template.menu) {
                template.menu = '#{data}';
            }

            if (!template.item) {
                template.item = '<a href="#{href}">#{text}</a> ';
            }

            var output   = '';
            var contents = menu.childNodes;
            
            for (var i = 0; i < contents.length; i++) {
                switch (contents[i].nodeType) {
                    case Node.ELEMENT_NODE:
                    var item = contents[i].cloneNode(true);

                    var text = miniLOL.utils.getFirstText(contents[i].childNodes);
                    var data = miniLOL.menu.parse(contents[i], layer + 1);

                    var itemClass = item.getAttribute("class") || ''; item.removeAttribute("class");
                    var itemId    = item.getAttribute("id") || ''; item.removeAttribute("id");
                    var itemSrc   = item.getAttribute("src")
                                 || item.getAttribute("href")
                                 || item.getAttribute("url")
                                 || '';
                    
                    item.removeAttribute("src");
                    item.removeAttribute("href");
                    item.removeAttribute("url");
                    
                    output += template.item.interpolate({
                        "class":    itemClass,
                        id:         itemId,
                        url:        itemSrc,
                        src:        itemSrc,
                        href:       itemSrc,
                        attributes: miniLOL.utils.attributes(item.attributes),
                        text:       text,
                        data:       data
                    });
                    break;

                    case Node.CDATA_SECTION_NODE:
                    output += contents[i].nodeValue;
                    break;
                }
            }

            return template.menu.interpolate({
                data: output
            });
        },

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
                return "The menu `#{name}` doesn't exist.".interpolate({
                    name: name
                });
            }

            return miniLOL.menu.parse(miniLOL.menus.dom.getElementById(name) || miniLOL.menu._default)
        },

        change: function (name) {
            miniLOL.menu.current = name;
            miniLOL.menu.set(miniLOL.menu.get(name));
        },

        enabled: function () {
            return Boolean(miniLOL.menus.dom);
        },

        exists: function (name) {
            if (name == "default") {
                return true;
            }

            return Boolean(miniLOL.menus.dom.getElementById(name));
        }
    },

    page: {
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
                
                                var out = src.match(/^(\w+:\/\/|mailto:)/);
                
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

                                    text = text || src;
        
                                    args   = args ? '&'+args.replace(/[ ,]+/g, "&amp;") : '';
                                    ltype  = ltype ? "&type="+ltype : '';
                                    menu   = miniLOL.menu.enabled() && menu ? "&amp;menu="+menu : '';
                                    src    = src + args + ltype + menu;
                                    target = '';
                                }

                                listOutput += miniLOL.theme.template.list.link.interpolate({
                                    "class":    linkClass,
                                    id:         linkId,
                                    attributes: miniLOL.utils.attributes(link.attributes),
                                    before:     miniLOL.theme.template.list.before.interpolate({ data: before }),
                                    after:      miniLOL.theme.template.list.after.interpolate({ data: after }),
                                    url:        src,
                                    src:        src,
                                    href:       src,
                                    target:     target,
                                    text:       text
                                });
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
                        else if (list[h].nodeType == Node.CDATA_SECTION_NODE) {
                            listOutput += miniLOL.theme.template.list.data.interpolate({
                                before: miniLOL.theme.template.list.before.interpolate({ data: before }),
                                after:  miniLOL.theme.template.list.after.interpolate({ data: after }),
                                data:  list[h].nodeValue
                            });
                        }
                    }

                    output += miniLOL.theme.template.list.global.interpolate({
                        attributes: miniLOL.utils.attributes(ele.attributes),
                        data: listOutput
                    });
                    break;
        
                    case Node.CDATA_SECTION_NODE:
                    output += contents[i].nodeValue;
                    break;
                }
            }

            return output;
        },

        get: function (name, queries, url) {
            miniLOL.content.set(miniLOL.config["core"].loadingMessage);

            Event.fire(document, ":page.get", { name: name, queries: queries });

            var page = miniLOL.pages.dom.getElementById(name);
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

                var queries = miniLOL.utils.toQuery(queries);
                if (queries) {
                    queries = '&'+queries;
                }

                page = page.getAttribute("alias");
                if (page.charAt(0) != '#') {
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
                pageArguments = miniLOL.utils.parseQuery(pageArguments.replace(/[ ,]+/g, "&amp;"));

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

        load: function (path, queries) {
            miniLOL.content.set(miniLOL.config["core"].loadingMessage);

            Event.fire(document, ":page.load", { path: path, queries: queries });

            new Ajax.Request("data/#{path}?#{queries}".interpolate({ path: path, queries: miniLOL.utils.toQuery(queries) }), {
                method: "get",
        
                onSuccess: function (http) {
                    if (miniLOL.functions[queries.type]) {
                        miniLOL.content.set(miniLOL.functions[queries.type](http.responseText, queries));
                    }
                    else {
                        miniLOL.content.set(http.responseText);
                    }

                    Event.fire(document, ":page.loaded", http);
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
                        throw new Error("An error occurred while initializing the module.");
                    }
                }
                catch (error) {
                    error.fileName = "#{path}/#{module}/main.js".interpolate({
                        path: miniLOL.module.path,
                        module: name
                    });

                    throw error;
                }
            }

            miniLOL.modules[name] = obj;

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
                    miniLOL.error("The module isn't loaded.");
                }

                return false;
            }

            if (miniLOL.module.get(name).type == "active") {
                miniLOL.content.set(miniLOL.config['core'].loadingMessage);
            }

            vars = (vars instanceof Array) ? vars : [vars];

            Event.fire(document, ":module.execute", { name: name, arguments: vars });

            var result;
            try {
                result = miniLOL.module.get(name).execute.apply(miniLOL.module.get(name), vars);
            }
            catch (error) {
                error.fileName = "#{path}/#{module}/main.js".interpolate({
                    path: miniLOL.module.path,
                    module: name
                });

                miniLOL.error("An error occurred while executing the module `#{name}`<br/><br/>#{file} @ #{line}:<br/>#{error}".interpolate({
                    name:  name,
                    file:  error.fileName,
                    line:  error.lineNumber,
                    error: error.toString()
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

                if (!miniLOL.module.exists(name)) {
                    throw new Error("Something went wrong while loading the module `#{name}`.".interpolate({
                        name: name
                    }));
                }

                Event.fire(document, ":module.loaded", name);

                return true;
            }
            catch (error) {
                miniLOL.error("An error occurred while loading the module `#{name}`<br/><br/>#{file} @ #{line}:<br/>#{error}".interpolate({
                    name:  name,
                    file:  error.fileName,
                    line:  error.lineNumber,
                    error: error.toString()
                }), miniLOL.theme.content());

                return false;
            }
        },

        get: function (name) {
            return miniLOL.modules[name];
        },

        exists: function (name) {
            return new Boolean(miniLOL.module.get(name));
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
        var queries = miniLOL.utils.parseQuery(url.replace(/#/, '?'))
        var matches = /#(([^=&]*)&|([^=&]*)$)/.exec(url); // hate WebKit so much.
        var result  = false;

        miniLOL.menu.change(queries.menu);

        if (matches) {
            queries.page = matches[2] || matches[1];
            result       = miniLOL.page.get(queries.page, queries);
        }
        else if (queries.module) {
            result = miniLOL.module.execute(queries.module, queries, true);
        }
        else if (queries.page) {
            result = miniLOL.page.load(queries.page, queries);
        } 
        else {
            miniLOL.content.set("wat");
        }

        if (result) {
            Event.fire(document, ":go", url);
        }

        return result;
    },

    utils: {
        attributes: function (attributes) {
            var text = '';
            
            for (var i = 0; i < attributes.length; i++) {
                text += "#{name}='#{value}' ".interpolate({
                    name: attributes.item(i).nodeName,
                    value: attributes.item(i).nodeValue
                });
            }
            
            return text;
        },

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

        checkXML: function (xml) {
            if (!xml) {
                return "There's a syntax error.";
            }

            if (xml.documentElement.nodeName == "parsererror") {
                return xml.documentElement.textContent;
            }

            return false;
        },

        getFirstText: function (elements) {
            for (var i = 0; i < elements.length; i++) {
                switch (elements[i].nodeType) {
                    case Node.ELEMENT_NODE:
                    return '';
                    break;

                    case Node.TEXT_NODE:
                    case Node.CDATA_SECTION_NODE:
                    if (elements[i].nodeValue.replace(/[\s\n]/g, '')) {
                        return elements[i].nodeValue;
                    }
                    break;
                }
            }

            return '';
        },

        parseQuery: function (url) {
            var result  = {};
            var matches = url.match(/\?(.*)$/);
            
            if (!matches) {
                return result;
            }
            
            var blocks = matches[1].split(/&/);
            for (var i = 0; i < blocks.length; i++) {
                var parts = blocks[i].split(/=/);
                
                if (parts[1]) {
                    result[parts[0]] = parts[1];
                }
                else {
                    result[parts[0]] = true;
                }
            }
            
            return result;
        },

        toQuery: function (obj) {
            var result = '';
            
            for (var name in obj) {
                result += "#{name}=#{value}&".interpolate({
                    name: name,
                    value: obj[name]
                });
            }
            
            return result.substr(0, result.length - 1);
        },

        retarded: function (func) {
            if (!Object.isFunction(func)) {
                return;
            }

            if (Prototype.Browser.Webkit) {
                return func.defer();
            }
            else {
                return func();
            }
        },

        includeCSS: function (path) {
            var style = false;

            if (Prototype.Browser.Good) {
                new Ajax.Request(path, {
                    method: "get",
                    asynchronous: false,

                    onSuccess: function (http) {
                        style = new Element("style");
                        style.update(http.responseText);
                    }
                });
            }
            else {
                style = new Element("link", {
                    rel: "stylesheet",
                    href: path,
                    type: "text/css"
                });
            }

            if (style) {
                $$("head")[0].insert(style);
            }

            return style;
        },

        include: function (path, context) {
            context = context || window;
            
            var result = context;
            
            new Ajax.Request(path, {
                method: "get",
                asynchronous: false,
                evalJS: false,
                
                onSuccess: function (http) {
                    try {
                        window.eval.call(context, http.responseText);
                    }
                    catch (error) {
                        result = null;
                    }
                },
                
                onFailure: function () {
                    result = null;
                }
            });
            
            return result;
        },

        require: function (path, context) {
            context = context || window;
            
            var result;
            var error;
            
            new Ajax.Request(path, {
                method: "get",
                asynchronous: false,
                evalJS: false,
                
                onSuccess: function (http) {
                    try {
                        window.eval.call(context, http.responseText);
                        result = context;
                    }
                    catch (error) {
                        error             = e;
                        error.fileName    = path;
                        error.lineNumber -= 5;
                    }
                },
                
                onFailure: function () {
                    error            = new Error("Couldn't find the file.");
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

miniLOL.utils.require("system/preparation.js");
