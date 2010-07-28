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
            Event.observe(document, ":resource.loaded", function (event) {
                if (event.memo.resource.name != "miniLOL.config" || event.memo.arguments[0] != "resources/config.xml") {
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
                        miniLOL.config["core"].homePage = '#' + miniLOL.config["core"].homePage;
                    }
                }
                 
                if (!document.title) {
                    document.title = miniLOL.config["core"].siteTitle;
                }
            });

            miniLOL.resource.set(new miniLOL.Resource("miniLOL.config", {
                initialize: function () {
                    miniLOL.config = this.data;
                },
 
                load: function (path) {
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
    
                            miniLOL.config[domain] = Object.extend(config, this.parse(http.responseXML.documentElement));
                        }.bind(this),
        
                        onFailure: function (http) {
                            miniLOL.error("Error while loading config.xml (#{status} - #{statusText})".interpolate(http));
                        }
                    });
    
                    if (miniLOL.error()) {
                        return false;
                    }
    
                    return true;
                },

                clear: function () {
                    this.data = miniLOL.config = {};
                },

                parse: function (obj, text) {
                    var result;

                    if (text) {
                        result = "";

                        $A(obj.childNodes).each(function (text) {
                            if (text.nodeType != Node.CDATA_SECTION_NODE && text.nodeType != Node.TEXT_NODE) {
                                return;
                            }
    
                            if (text.nodeValue.match(/^[\s\n]*$/)) {
                                return;
                            }
                            
                            result += text.nodeValue;
                        });
                    }
                    else if (obj.nodeType == Node.ELEMENT_NODE) {
                        result = {};
        
                        $A(obj.childNodes).each(function (node) {
                            if (node.nodeType != Node.ELEMENT_NODE) {
                                return;
                            }
        
                            if (node.getElementsByTagName('*').length == 0) {
                                result[node.nodeName] = this.parse(node, true);
                            }
                            else {
                                result[node.nodeName] = this.parse(node);
                            }
                        }, this);
                    }
    
                    return result;
                }
            }));

            miniLOL.resource.get("miniLOL.config").load("resources/config.xml");

            $(document.body).update(miniLOL.config["core"].loadingMessage);
        },

        function () {
            miniLOL.resource.set(new miniLOL.Resource("miniLOL.menus", {
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
    
                            $A(response.documentElement.childNodes).each(function (menu) {
                                if (menu.nodeType != Node.ELEMENT_NODE) {
                                    return;
                                }
    
                                var id = menu.getAttribute("id");
    
                                if (!id && !miniLOL.menus["default"]) {
                                    miniLOL.menus["default"] = menu;
                                }
                                else {
                                    miniLOL.menus[id] = menu;
                                }
                            });
    
                            if (!miniLOL.menus["default"]) {
                                miniLOL.error("Error while analyzing menus.xml\n\nNo default menu was found.");
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
                    this.data = miniLOL.menus = {};
                }
            }));

            miniLOL.resource.get("miniLOL.menus").load("resources/menus.xml");
        },

        function () {
            miniLOL.resource.set(new miniLOL.Resource("miniLOL.pages", {
                load: function (path) {
                    new Ajax.Request(path, {
                        method: "get",
                        asynchronous: false,
        
                        onSuccess: function (http) {
                            if (miniLOL.utils.checkXML(http.responseXML, path)) {
                                return;
                            }
    
                            var dom = miniLOL.utils.fixDOM(http.responseXML);
    
                            $A(http.responseXML.documentElement.getElementsByTagName("page")).each(function (page) {
                                var id = page.getAttribute("id");

                                delete miniLOL.pages.cache[id];
                                miniLOL.pages.data[id] = page;
                            });
                        },
        
                        onFailure: function (http) {
                            miniLOL.error("Error while loading pages.xml (#{status} - #{statusText})".interpolate(http))
                        }
                    });
    
                    if (miniLOL.error()) {
                        return false;
                    }
    
                    return true;
                },

                clear: function () {
                    miniLOL.pages = this.data = {
                        data: {},
                        cache: {}
                    };
                }
            }));

            if (miniLOL.utils.exists("resources/pages.xml")) {
                miniLOL.resource.get("miniLOL.pages").load("resources/pages.xml");
            }
        },

        function () {
            miniLOL.resource.set(new miniLOL.Resource("miniLOL.functions", {
                load: function (path) {
                    new Ajax.Request(path, {
                        method: "get",
                        asynchronous: false,
            
                        onSuccess: function (http) {
                            if (miniLOL.utils.checkXML(http.responseXML, path)) {
                                return;
                            }
    
                            $A(http.responseXML.documentElement.getElementsByTagName("function")).each(function (func) {
                                try {
                                    miniLOL.functions[func.getAttribute("name")]
                                        = new Function("var text = arguments[0]; var args = arguments[1]; #{code}; return text;".interpolate({
                                            code: func.firstChild.nodeValue
                                        }));
                                }
                                catch (e) {
                                    miniLOL.error("Error while creating `#{name}` wrapper from #{path}:\n\n#{error}".interpolate({
                                        name:  func.getAttribute("name"),
                                        path:  path,
                                        error: e.toString()
                                    }));
    
                                    return;
                                }
                            });
                        },
            
                        onFailure: function (http) {
                            miniLOL.error("Error while loading functions.xml (#{status} - #{statusText}})".interpolate(http));
                        }
                    });
    
                    if (miniLOL.error()) {
                        return false;
                    }
    
                    return true;
                },

                clear: function () {
                    miniLOL.functions = this.data = {};
                }
            }));

            miniLOL.resource.get("miniLOL.functions").load("resources/functions.xml");
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
            if (miniLOL.menu.enabled()) {
                miniLOL.menu.set(miniLOL.config["core"].loadingMessage);
            }
        },

        function () {
            miniLOL.content.set("Loading modules...");

            miniLOL.resource.set(new miniLOL.Resource("miniLOL.modules", {
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

                            for (var i = 0, length = modules.length; i < length; i++) {
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
                            miniLOL.error("Error while loading modules.xml (#{status} - #{statusText})".interpolate(http));
                        }
                    });
    
                    if (miniLOL.error()) {
                        return false;
                    }
    
                    return true;
                },

                clear: function () {
                    miniLOL.modules = this.data = {};
                }
            }));

            miniLOL.resource.get("miniLOL.modules").load("resources/modules.xml", true);
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
                miniLOL.error("`#{module}` requires `#{require}`".interpolate(e));
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

        Event.observe(document, ":go", function () {
            miniLOL.theme.content().scrollTo();
        });

        miniLOL.go(/[#?]./.test(location.href) ? location.href.replace(/^.*[#?]/, '#') : miniLOL.config["core"].homePage);

        if (miniLOL.config["core"].initialization) {
            eval(miniLOL.config["core"].initialization);
        }

        Event.observe(document, ":refresh", function () {
            miniLOL.resource.reload();
        });

        new PeriodicalExecuter(function () {
            Event.fire(document, ":refresh");
        }, miniLOL.config["core"].refreshEvery || 360)

        Event.fire(document, ":initialized");
        Event.stopObserving(document, ":initialized");

        miniLOL.initialized = true;
    },

    error: function (text, minor, element) {
        if (Object.isUndefined(text)) {
            return Boolean(miniLOL.error.value);
        }

        if (Object.isBoolean(text)) {
            return miniLOL.error.value = text;
        }

        element = element || miniLOL.theme.content() || document.body;

        $(element).update("<pre>" + text.replace(/<br\/>/g, '\n').escapeHTML() + "</pre>");

        if (!minor) {
            miniLOL.error.value = true;
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

    resource: {
        set: function (name, resource) {
            if (Object.isString(name)) {
                miniLOL.resources[name] = resource;
            }
            else {
                miniLOL.resources[name.name] = name;
            }
        },

        get: function (name) {
            return miniLOL.resources[name];
        },

        reload: function (what) {
            if (Object.isArray(what)) {
                what.each(function (name) {
                    miniLOL.resource.get(name).reload();
                })
            }
            else if (Object.isString(what)) {
                miniLOL.resource.get(name).reload();
            }
            else {
                for (var resource in miniLOL.resources) {
                    resource.reload()
                }
            }
        }
    },

    refresh: function () {
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

                if (!Object.isUndefined(miniLOL.theme.template.cache[file])) {
                    return miniLOL.theme.template.cache[file];
                }

                new Ajax.Request(file, {
                    method: "get",
                    asynchronous: false,
                
                    onSuccess: function (http) {
                        if (miniLOL.utils.checkXML(http.responseXML, file)) {
                            return;
                        }

                        miniLOL.theme.template.cache[file] = miniLOL.utils.fixDOM(http.responseXML);
                    },

                    onFailure: function () {
                        miniLOL.theme.template.cache[file] = false;
                    }
                });

                if (miniLOL.error()) {
                    return false;
                }

                return miniLOL.theme.template.cache[file];
            },

            menu: function () {
                return miniLOL.theme.template.load("menu");
            },

            exists: function (name, path) {
                return Boolean(miniLOL.theme.template.load(name, path));
            },

            clearCache: function () {
                miniLOL.theme.template.cache = {};

                miniLOL.theme.template.list = {}

                miniLOL.theme.template.list["default"] = {
                    global: '<div #{attributes}>#{data}</div>',

                    before: '#{data}',
                    after:  '#{data}',

                    link: '<div class="#{class}" id="#{id}">#{before}<a href="#{url}" target="#{target}" #{attributes}>#{text}</a>#{after}</div>',
                    item: '<div class="#{class}" id="#{id}">#{before}<span #{attributes}>#{text}</span>#{after}</div>',
                    nest: '<div class="#{class}" style="#{style}">#{data}</div>',
                    data: '<div class="data">#{before}#{data}#{after}</div>'
                };

                miniLOL.theme.template.list["table"] = {
                    global: '<table #{attributes}>#{data}</table>',

                    before: '#{data}',
                    after:  '#{data}',

                    link: '<tr><td>#{before}</td><td><a href="#{url}" target="#{target}" #{attributes}>#{text}</a></td><td>#{after}</td></tr>',
                    item: '<tr><td>#{before}</td><td>#{text}</td><td>#{after}</td></tr>',
                    nest: '<div class="#{class}" style="#{style}">#{data}</div>',
                    data: '<div class="data">#{before}#{data}#{after}</div>'
                }
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

            var error;
            // Get the information about the theme and parse the needed data
            new Ajax.Request("#{path}/theme.xml".interpolate({ path: path, theme: name }), {
                method: "get",
                asynchronous: false,
                
                onSuccess: function (http) {
                    var info = miniLOL.theme.information = {};
                    var doc  = miniLOL.utils.fixDOM(http.responseXML);

                    info.name     = doc.documentElement.getAttribute("name")     || "Unknown";
                    info.author   = doc.documentElement.getAttribute("author")   || "Anonymous";
                    info.homepage = doc.documentElement.getAttribute("homepage") || '';
                    
                    miniLOL.theme.menu.node    = doc.documentElement.getAttribute("menu") || "menu";
                    miniLOL.theme.content.node = doc.documentElement.getAttribute("content") || "body";

                    try {
                        var initialize = doc.getElementsByTagName("initialize");

                        if (initialize.length) {
                            miniLOL.theme.initialize = new Function(initialize[0].firstChild.nodeValue);
                        }
                        else {
                            miniLOL.theme.initialize = new Function;
                        }
                    }
                    catch (e) {
                        error = "An error occurred on the theme's initialize function:\n\n"+e.toString();
                        return false;
                    }

                    try {
                        var finalize = doc.getElementsByTagName("finalize");

                        if (finalize.length) {
                            miniLOL.theme.finalize = new Function(finalize[0].firstChild.nodeValue);
                        }
                        else {
                            miniLOL.theme.finalize = new Function;
                        }
                    }
                    catch (e) {
                        error = "An error occurred on the theme's finalize function:\n\n"+e.toString();
                        return false;
                    }

                    info.styles = [];

                    $A(doc.getElementsByTagName("style")).each(function (style) {
                        info.styles.push(style.getAttribute("name"));
                    });

                    var templates = doc.getElementsByTagName("templates");
                    var tmp;

                    if (templates && (tmp = templates.getElementsByTagName("list"))) {
                        $A(tmp.getElementsByTagName("template")).each(function (template) {
                            var current;
                            var name = template.getAttribute("name") || "default";
    
                            miniLOL.theme.template.list[name] = {};
    
                            if ((current = template.getElementsByTagName("global")).length) {
                                miniLOL.theme.template.list[name].global = current[0].firstChild.nodeValue;
                            }
    
                            if ((current = template.getElementsByTagName("before")).length) {
                                miniLOL.theme.template.list[name].before = current[0].firstChild.nodeValue;
                            }
    
                            if ((current = template.getElementsByTagName("after")).length) {
                                miniLOL.theme.template.list[name].after = current[0].firstChild.nodeValue;
                            }
    
                            if ((current = template.getElementsByTagName("link")).length) {
                                miniLOL.theme.template.list[name].link = current[0].firstChild.nodeValue;
                            }
    
                            if ((current = template.getElementsByTagName("item")).length) {
                                miniLOL.theme.template.list[name].item = current[0].firstChild.nodeValue;
                            }
    
                            if ((current = template.getElementsByTagName("nest")).length) {
                                miniLOL.theme.template.list[name].nest = current[0].firstChild.nodeValue;
                            }
    
                            if ((current = template.getElementsByTagName("data")).length) {
                                miniLOL.theme.template.list[name].data = current[0].firstChild.nodeValue;
                            }
                        })
                    }
                },

                onFailure: function () {
                    error = "Could not load theme's information.";
                }
            });

            if (error) {
                miniLOL.error(error);
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
                    error = "Could not load template.html.";
                }
            });

            if (error) {
                miniLOL.error(error);
                return false;
            }

            miniLOL.theme.information.styles.each(function (style) {
                if (!miniLOL.theme.style.load(style, false, true)) {
                    miniLOL.error("Couldn't load `#{style}` style/".interpolate({
                        style: style
                    }));

                    throw $break;
                }
            });

            if (miniLOL.error()) {
                return false;
            }

            if (runtime && miniLOL.initialized) {
                miniLOL.menu.change(miniLOL.menu.current, true);
                miniLOL.go(location.href);
            }

            miniLOL.theme.data = {};

            // Sadly this has some problems.
            // I didn't find a way to know if the CSSs have already been applied and the initialize
            // may get wrong information from stuff that uses sizes set by the CSS.
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
            miniLOL.theme.template.clearCache();

            if (!miniLOL.theme.name) {
                return;
            }

            Event.fire(document, ":theme.unload", { name: miniLOL.theme.name });

            if (!noFinalization && miniLOL.theme.finalize) {
                miniLOL.theme.finalize();
            }

            delete miniLOL.theme.data;

            $A(miniLOL.theme.information.styles).each(function (style) {
                miniLOL.theme.style.unload(style);
            });

            delete miniLOL.theme.name;

            delete miniLOL.theme.initialize;
            delete miniLOL.theme.finalize;

            delete miniLOL.theme.information;
        },

        content: function () {
            return $(miniLOL.theme.content.node);
        },

        menu: function () {
            return $(miniLOL.theme.menu.node);
        },

        deprecated: function () {
            miniLOL.theme.path         = "themes";
            miniLOL.theme.content.node = miniLOL.config["core"].contentNode || "body";
            miniLOL.theme.menu.node    = miniLOL.config["core"].menuNode || "menu";
            miniLOL.theme.template.clearCache();

            new Ajax.Request("resources/template.html", {
                method: "get",
                asynchronous: false,

                onSuccess: function (http) {
                    $(document.body).update(http.responseText);
                },

                onFailure: function () {
                    $(document.body).update('<div id="menu"></div><div id="body"></div>');
                }
            });

            miniLOL.utils.includeCSS("resources/style.css");

            miniLOL.theme.template.clearCache();

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

        get: function (name, layer) {
            layer = layer || 0;

            if (!miniLOL.menu.enabled()) {
                return "";
            }

            name = name || "default";

            if (!miniLOL.menu.exists(name)) {
                return null;
            }

            return miniLOL.menu.parse(miniLOL.menus[name], layer);
        },

        change: function (name, force) {
            if (name == miniLOL.menu.current && !force) {
                return;
            }

            var content = miniLOL.menu.get(name);

            if (content) {
                miniLOL.menu.set(content);
                miniLOL.menu.current = name;
            }
            else {
                var error = "The menu `#{name}` doesn't exist.".interpolate({
                    name: name
                });
                
                miniLOL.error(error);
                return error;
            }

            Event.fire(document, ":menu.change", miniLOL.menus[name]);
        },

        enabled: function () {
            return Boolean(miniLOL.menus["default"]);
        },

        exists: function (name) {
            return Boolean(miniLOL.menus[name]);
        },

        parse: function (menu, layer) {
            layer = layer || 0;

            var template = miniLOL.theme.template.menu();

            if (!template || !menu) {
                if (miniLOL.error()) {
                    return false;
                }
            }

            var first  = true;
            var output = "";

            $A(menu.childNodes).each(function (e) {
                switch (e.nodeType) {
                    case Node.ELEMENT_NODE:
                    if (e.nodeName == "menu") {
                        output += miniLOL.menu.parsers.layer(template, layer).menu.interpolate({
                            data: miniLOL.menu.parse(e, layer)
                        });
                    }
                    else if (e.nodeName == "item") {
                        output += miniLOL.menu.parsers.item(e, template, layer)
                    }
                    else {
                        output += miniLOL.menu.parsers.other(e, template);
                    }
                    break;

                    case Node.CDATA_SECTION_NODE:
                    case Node.TEXT_NODE:
                    if (!first) {
                        output += e.nodeValue;
                    }

                    first = false;
                    break;
                }
            });

            if (output.replace(/[\s\n]*/g, '')) {
                if (layer == 0) {
                    return miniLOL.menu.parsers.layer(template, layer).menu.interpolate({
                        data: output
                    });
                }
                else {
                    return output;
                }
            }
            else {
                return "";
            }
        },

        parsers: {
            layer: function (template, layer) {
                var result = {
                    menu: "",
                    item: ""
                };

                if (template) {
                    var dom = template.getElementById(layer) || template.getElementById('default');

                    if (dom) {
                        if (dom.getElementsByTagName("menu").length) {
                            result.menu = dom.getElementsByTagName("menu")[0].firstChild.nodeValue;
                        }

                        if (dom.getElementsByTagName("item").length) {
                            result.item = dom.getElementsByTagName("item")[0].firstChild.nodeValue;
                        }

                        if (!result.menu) {
                            result.menu = "#{data}";
                        }

                        if (!result.item) {
                            result.item = '<a href="#{href}" #{attributes}>#{text}</a> ';
                        }
                    }
                }

                return result;
            },

            item: function (element, template, layer) {
                item = element.cloneNode(true);

                var itemClass = item.getAttribute("class") || ""; item.removeAttribute("class");
                var itemId    = item.getAttribute("id") || ""; item.removeAttribute("id");
                var itemSrc   = item.getAttribute("src")
                             || item.getAttribute("href")
                             || item.getAttribute("url")
                             || "";
                
                item.removeAttribute("src");
                item.removeAttribute("href");
                item.removeAttribute("url");
                
                return miniLOL.menu.parsers.layer(template, layer).item.interpolate(Object.extend(Object.fromAttributes(item.attributes), {
                    "class":    itemClass,
                    id:         itemId,
                    url:        itemSrc,
                    src:        itemSrc,
                    href:       itemSrc,
                    attributes: String.fromAttributes(item.attributes),
                    text:       miniLOL.utils.getFirstText(element.childNodes),
                    data:       miniLOL.menu.parse(element, layer + 1)
                }));
            },

            other: function (data, template) {
                var output  = "";
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
    
                $A(data.childNodes).each(function (e) {
                    if (e.nodeType == Node.ELEMENT_NODE) {
                        outputs[e.nodeName] = miniLOL.menu.parsers.other(e, template);
                    }
                });
    
                outputs["text"] = miniLOL.utils.getFirstText(data.childNodes);
    
                return text.interpolate(Object.extend(outputs, Object.fromAttributes(data.attributes)));
            }
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
            var output = "";

            $A(page.childNodes).each(function (e) {
                switch (e.nodeType) {
                    case Node.ELEMENT_NODE:
                    if (Object.isFunction(miniLOL.page.parsers[e.nodeName])) {
                        output += miniLOL.page.parsers[e.nodeName](e, data);
                    }
                    break;
        
                    case Node.CDATA_SECTION_NODE:
                    case Node.TEXT_NODE:
                    output += e.nodeValue;
                    break;
                }
            });

            return output;
        },

        parsers: {
            list: function (element, data) {
                list = element.cloneNode(false);
                data = data || [element];

                var listBefore   = list.getAttribute("before") || data[0].getAttribute("before") || ''; list.removeAttribute("before");
                var listAfter    = list.getAttribute("after") || data[0].getAttribute("after") || ''; list.removeAttribute("after");
                var listArgs     = list.getAttribute("arguments") || data[0].getAttribute("arguments") || ''; list.removeAttribute("arguments");
                var listType     = list.getAttribute("type") || data[0].getAttribute("type") || ''; list.removeAttribute("type");
                var listMenu     = list.getAttribute("menu") || data[0].getAttribute("menu"); list.removeAttribute("menu");
                var listTemplate = list.getAttribute("template"); list.removeAttribute("template");

                if (!miniLOL.theme.template.list[listTemplate]) {
                    listTemplate = "default";
                }
    
                var output = "";

                $A(element.childNodes).each(function (e) {
                    if (e.nodeType == Node.ELEMENT_NODE) {
                        if (e.nodeName == "link") {
                            var link = e.cloneNode(true);
            
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

                            output += miniLOL.theme.template.list[listTemplate].link.interpolate(Object.extend(Object.fromAttributes(link.attributes), {
                                "class":    linkClass,
                                id:         linkId,
                                attributes: String.fromAttributes(link.attributes),
                                before:     miniLOL.theme.template.list[listTemplate].before.interpolate({ data: before }),
                                after:      miniLOL.theme.template.list[listTemplate].after.interpolate({ data: after }),
                                url:        src,
                                src:        src,
                                href:       src,
                                target:     target,
                                text:       text,
                                title:      title
                            }));
                        }
                        else if (e.nodeName == "item") {
                            var item = e.cloneNode(true);
            
                            var text   = item.getAttribute("text") || ''; item.removeAttribute("text");
                            var before = item.getAttribute("before") || listBefore || ''; item.removeAttribute("before");
                            var after  = item.getAttribute("after") || listAfter || ''; item.removeAttribute("after");
            
                            var itemClass = item.getAttribute("class") || ''; item.removeAttribute("class");
                            var itemId    = item.getAttribute("id") || ''; item.removeAttribute("id");

                            output += miniLOL.theme.template.list[listTemplate].item.interpolate(Object.extend(Object.fromAttributes(item.attributes), {
                                "class":    itemClass,
                                id:         itemId,
                                attributes: String.fromAttributes(item.attributes),
                                before:     miniLOL.theme.template.list[listTemplate].before.interpolate({ data: before }),
                                after:      miniLOL.theme.template.list[listTemplate].after.interpolate({ data: after }),
                                text:       text
                            }));
                        }
                        else if (e.nodeName == "list") {
                            output += miniLOL.page.parse({ childNodes: [e] }, [element]);
                        }
                        else if (e.nodeName == "nest") {
                            toParse = e.cloneNode(true);

                            output += miniLOL.theme.template.list[listTemplate].nest.interpolate({
                                "class": e.getAttribute("class") || '',
                                style:   e.getAttribute("style") || '',
                                before:  miniLOL.theme.template.list[listTemplate].before.interpolate({ data: before }),
                                after:   miniLOL.theme.template.list[listTemplate].after.interpolate({ data: after }),
                                data:    miniLOL.page.parse(toParse, [element])
                            });
                        }
                    }
                    else if (e.nodeType == Node.CDATA_SECTION_NODE || e.nodeType == Node.TEXT_NODE) {
                        if (e.nodeValue.replace(/[\s\n]+/g, '')) {
                            output += miniLOL.theme.template.list[listTemplate].data.interpolate({
                                before: miniLOL.theme.template.list[listTemplate].before.interpolate({ data: before }),
                                after:  miniLOL.theme.template.list[listTemplate].after.interpolate({ data: after }),
                                data:  e.nodeValue
                            });
                        }
                    }
                });

                return miniLOL.theme.template.list[listTemplate].global.interpolate(Object.extend(Object.fromAttributes(list.attributes), {
                    attributes: String.fromAttributes(list.attributes),
                    data: output
                }));
            },

            include: function (element, data) {
                element = element.cloneNode(false);

                var href   = element.getAttribute("href"); element.removeAttribute("href");
                var update = element.getAttribute("update"); element.removeAttribute("update");

                var domain  = location.href.match(/^http(s)?:\/\/(.*?)([^\.]\.\w+)/)[3];
                var matches = href.match(/^http(s)?:\/\/(.*?)([^\.]\.\w+)/);

                var output = "";
                
                if (matches && matches[3] != domain) {
                    output = '<iframe src="#{href}" #{attributes}></iframe>'.interpolate({
                        href: href,
                        attributes: Object.fromAttributes(element.attributes)
                    });
                }
                else {
                    output = '<div ';
                }

                return "";
            }
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
                    miniLOL.content.set("#{status} - #{statusText}".interpolate(http));

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

            $A(obj.aliases).each(function (alias) {
                miniLOL.modules[alias] = obj;
            });

            Event.fire(document, ":module.create", obj);
        },

        execute: function (name, vars, output) {
            if (!name) {
                miniLOL.error("What module should be executed?");
                return false;
            }

            if (!miniLOL.module.exists(name)) {
                if (output) {
                    miniLOL.error("The module `#{name}` isn't loaded.".interpolate({ name: name }), true);
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

                miniLOL.error("An error occurred while executing the module `#{name}`\n\n#{file} @ #{line}:\n#{error}".interpolate({
                    name:  name,
                    file:  e.fileName,
                    line:  e.lineNumber,
                    error: e.toString()
                }));

                return false;
            }

            Event.fire(document, ":module.executed", { name: name, arguments: vars, result: result });

            if (Object.isUndefined(result)) {
                result = true;
            }

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
                miniLOL.error("An error occurred while loading the module `#{name}`\n\n#{root}/#{file} @ #{line}:\n\n#{error}".interpolate({
                    name:  name,
                    root:  miniLOL.path,
                    file:  e.fileName,
                    line:  e.lineNumber,
                    error: e.toString()
                }));

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

    go: function (url, again) {
        if (url.isURL()) {
            if (!url.startsWith(miniLOL.path)) {
                location.href = url;
            }
        }
        else {
            if (url.charAt(0) != '#') {
                url = '#' + url;
            }
        }

        var queries = url.parseQuery();
        var matches = /#(([^=&]*)&|([^=&]*)$)/.exec(url); // hate WebKit so much.
        var result  = false;

        if (queries.menu) {
            miniLOL.menu.change(queries.menu);
        }

        if (matches) {
            queries.page = matches[2] || matches[3];

            if (queries.page) {
                result = miniLOL.page.get(queries.page, queries, url);
            }
            else if (!again) {
                result = miniLOL.go("#{page}&#{queries}".interpolate({
                    page:    miniLOL.config["core"].homePage,
                    queries: Object.toQuery(queries)
                }), true);
            }
        }
        else if (queries.module) {
            result = miniLOL.module.execute(queries.module, queries, true);
        }
        else if (queries.page) {
            var page = queries.page; delete queries.page;
            miniLOL.page.load(page, queries, url);
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
            var result;

            $A(this.getElementsByTagName('*')).each(function (element) {
                if (element.getAttribute("id") == id) {
                    result = element;
                    throw $break;
                }
            });

            return result;
        },

        fixDOM: function (obj) {
            if (!obj || Prototype.Browser.Good) {
                return obj;
            }

            if (Prototype.Browser.IE) {
                var tmp = obj;

                obj      = {};
                obj.real = tmp;

                obj.documentElement = tmp.documentElement;
                
                obj.getElementsByTagName = function (name) {
                    return this.real.getElementsByTagName(name);
                };

                obj.getElementById = function (id) {
                    return miniLOL.utils.getElementById.call(this.real, id);
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
                miniLOL.error("Error while parsing #{path}\n\n#{error}".interpolate({
                    path:  path,
                    error: error
                }));

                return error;
            }

            return error;
        },

        getFirstText: function (elements) {
            var result = "";

            (Object.isArray(elements) ? elements : $A(elements)).each(function (element) {
                switch (element.nodeType) {
                    case Node.ELEMENT_NODE:
                    throw $break;
                    break;

                    case Node.CDATA_SECTION_NODE:
                    case Node.TEXT_NODE:
                    if (!element.nodeValue.match(/^[\s\n]*$/)) {
                        result = element.nodeValue.strip();
                        throw $break;
                    }
                    break;
                }
            });

            return result;
        },

        exists: function (path) {
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
            var style = miniLOL.utils.exists(path);

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

        execute: function (path) {
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
                    error = new Error("Failed to retrieve `#{file}` (#{status} - #{statusText}).".interpolate({
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
                method: "get",
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
                method: "get",
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
                    error = new Error("Failed to retrieve `#{file}` (#{status} - #{statusText}).".interpolate({
                        file:       path,
                        status:     http.status,
                        statusText: http.statusText
                    }));

                    error.fileName   = path;
                    error.lineNumber = 0;

                    error.http = {
                        status: http.status,
                        text:   http.statusText
                    }
                }
            });

            if (error) {
                throw error;
            }

            return true;
        }
    }
}

miniLOL.utils.require("system/Resource.js");
miniLOL.utils.require("system/preparation.js");
