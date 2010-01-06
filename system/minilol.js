/****************************************************************************
 * Copyleft meh. [http://meh.doesntexist.org | meh.ffff@gmail.com]          *
 *                                                                          *
 * This program is free software: you can redistribute it and/or modify     *
 * it under the terms of the GNU General Public License as published by     *
 * the Free Software Foundation, either version 3 of the License, or        *
 * (at your option) any later version.                                      *
 *                                                                          *
 * This program is distributed in the hope that it will be useful,          *
 * but WITHOUT ANY WARRANTY; without even the implied warranty of           *
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the            *
 * GNU General Public License for more details.                             *
 *                                                                          *
 * You should have received a copy of the GNU General Public License        *
 * along with miniLOL program.  If not, see <http://www.gnu.org/licenses/>. *
 ****************************************************************************/

/*
 * miniLOL is a Javascript/XML based CMS, thus, being in the XXI century,
 * I pretend those two standards to be respected.
 *
 * Get a real browser, get Firefox.
 */

// Previous inizializations and improvements

unFocus.History.addEventListener('historyChange', function (historyHash) {
    if (historyHash) {
        miniLOL.go('#' + historyHash);
    }
    else {
        miniLOL.go('#' + miniLOL.config['core'].homePage);
    }
    
    $(miniLOL.config['core'].contentNode).scrollTop = 0;
});

Function.prototype.clone = function () {
    return eval("("+this.toString().replace(/^function .*?\(/, 'function (')+")");
};

if (Prototype.Browser.IE) {
    Error.prototype.toString = function () {
        return "#{name}: #{description}".interpolate(this);
    };

    Function.prototype.clone = function () {
        var func = this.toString();

        return new Function(func.substring(func.indexOf("{") + 1, func.lastIndexOf("}")));
    };
}
else if (Prototype.Browser.Opera) {
    Error.prototype.toString = function () {
        return "#{name}: #{message}".interpolate(this);
    }
}

miniLOL = {
    version: '1.0',

    initialize: function () {
        ['miniLOL.resource.load(miniLOL.resources.config, "resources/config.xml");',
         'document.title = miniLOL.config["core"].siteTitle;',
         'document.body.innerHTML = miniLOL.config["core"].loadingMessage;',
         'miniLOL.resource.load(miniLOL.resources.menus, "resources/menus.xml");',
         'miniLOL.resource.load(miniLOL.resources.pages, "resources/pages.xml");',
         'miniLOL.resource.load(miniLOL.resources.functions, "resources/functions.xml");',
         'var path = miniLOL.config["core"].theme.match(/^(.+?):(.*)$/); if (path) { miniLOL.theme.path = path[1]; miniLOL.config["core"].theme = path[2]; } else { miniLOL.theme.path = "themes"; }',
         'miniLOL._error = !miniLOL.theme.load(miniLOL.config["core"].theme);',
        ].each(function (cmd) {
            try {
                eval(cmd);
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

        if (miniLOL.menu.exists && !miniLOL.config["core"].menuNode) {
            miniLOL.menu.exists = false
        }

        new PeriodicalExecuter(miniLOL.refresh, miniLOL.config['core'].refreshEvery || 360)

        if (miniLOL.menu.exists) {
            miniLOL.content.set('Loading...');
        }

        miniLOL.content.set('Loading modules...');
        miniLOL.resource.load(miniLOL.resources.modules, "resources/modules.xml", true);

        if (miniLOL.error()) {
            if (!document.body.innerHTML) {
                miniLOL.error("Something went wrong, but nobody told me what :(");
            }

            return false;
        }

        miniLOL.content.set('Checking dependencies...');
        try {
            miniLOL.module.dependencies.check();
        }
        catch (e) {
            miniLOL.error("`#{module}` requires `#{require}`".interpolate(e), $(miniLOL.config['core'].contentNode));
        }

        if (miniLOL.config["core"].init) {
            eval(miniLOL.config["core"].init);
        }

        if (!miniLOL.error()) {
            miniLOL.go(/\/[#?].+/.test(location.href) ? location.href.replace(/^.*[#?]/, '#') : "#"+miniLOL.config['core'].homePage);
        }

        Event.fire(document, ':initialized');
    },

    error: function (text, element) {
        if (!text) {
            return miniLOL._error;
        }

        if (text === true || text === false) {
            return miniLOL._error = text;
        }

        element = element || document.body;

        element.innerHTML = text;
        miniLOL._error    = true;
    },

    content: {
        set: function (data, evaluate) {
            if (evaluate === undefined) {
                evaluate = true;
            }

            $(miniLOL.config['core'].contentNode).innerHTML = data;

            if (evaluate) {
                data.evalScripts();
            }
        },

        get: function () {
            return $(miniLOL.config['core'].contentNode).innerHTML;
        }
    },

    resource: {
        load: function (wrapper) {
            if (!wrapper) {
                miniLOL.content.set('What wrapper should be loaded?');
                return false;
            }

            for (var func in wrapper) {
                if (typeof wrapper[func] == 'function') {
                    if (wrapper[func]._parent == wrapper) {
                        break;
                    }

                    wrapper[func]         = wrapper[func].bind(wrapper)
                    wrapper[func]._parent = wrapper;
                }
            }

            var args = $A(arguments).slice(1);

            if (!wrapper._calls) {
                wrapper._calls = new Array;
            }

            wrapper._calls.push(args);
            wrapper.load.apply(wrapper, args);
        },

        reload: function (wrapper) {
            if (!wrapper) {
                miniLOL.content.set('What wrapper should be reloaded?');
                return false;
            }

            wrapper.res = null;

            var calls      = wrapper._calls;
            wrapper._calls = new Array;

            for (var i = 0; i < calls.length; i++) {
                miniLOL.resource.load.apply(window, [wrapper].concat(calls[i]));
            }
        },

        check: function (xml) {
            if (!xml) {
                return "There's a syntax error.";
            }

            if (xml.documentElement.nodeName == "parsererror") {
                return xml.documentElement.textContent;
            }

            return false;
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
            name: 'config',
            res: null,

            parse: function (obj, text) {
                if (text) {
                    var result = "";

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

                var result = new Object;

                for (var i = 0; i < obj.childNodes.length; i++) {
                    var node = obj.childNodes[i];

                    if (node.nodeType != Node.ELEMENT_NODE) {
                        continue;
                    }

                    if (node.getElementsByTagName("*").length == 0) {
                        result[node.nodeName] = this.parse(node, true);
                    }
                    else {
                        result[node.nodeName] = this.parse(node);
                    }
                }

                return result;
            },

            load: function () {
                if (this.res == null) {
                    this.res = {};
                } var res = this.res;

                miniLOL.config = this.res;

                var paths = $A(arguments);

                var This = this;
                
                for (var i = 0; i < paths.length; i++) {
                    new Ajax.Request(paths[i], {
                        method: 'get',
                        asynchronous: false,
        
                        onSuccess: function (http) {
                            var error = miniLOL.resource.check(miniLOL.utils.fixDOM(http.responseXML));
                            if (error) {
                                miniLOL.error("Error while parsing config.xml<br/><br/>#{error}".interpolate({
                                    error: error.replace(/\n/g, '<br/>').replace(/ /g, '&nbsp;')
                                }));

                                return;
                            }

                            var domain = http.responseXML.documentElement.getAttribute('domain');
                            var config = miniLOL.config[domain] || new Object;

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
            name: 'menus',
            res: null,

            load: function (path) {
                if (this.res == null) {
                    this.res = {};
                } var res = this.res;

                miniLOL.menus = miniLOL.resources.menus.res;

                new Ajax.Request(path, {
                    method: 'get',
                    asynchronous: false,

                    onSuccess: function (http) {
                        var error = miniLOL.resource.check(http.responseXML);
                        if (error) {
                            miniLOL.error("Error while parsing menus.xml<br/><br/>#{error}".interpolate({
                                error: error.replace(/\n/g, '<br/>').replace(/ /g, '&nbsp;')
                            }));

                            return;
                        }

                        var response = miniLOL.utils.fixDOM(http.responseXML);
                        if (response.getElementById('default')) {
                            miniLOL.menus       = response;
                            miniLOL.menu.exists = true;
                        }
                        else {
                            miniLOL.menu.exists = false;
                        }
                    },

                    onFailure: function (http) {
                        miniLOL.menu.exists = false;
                    }
                });
            }
        },
    
        pages: {
            name: 'pages',
            res: null,
            
            load: function (path) {
                if (this.res == null) {
                    this.res = {
                        dom: null,
                        cache: {}
                    };
                } var res = this.res;

                miniLOL.pages = this.res;

                new Ajax.Request(path, {
                    method: 'get',
                    asynchronous: false,
    
                    onSuccess: function (http) {
                        var error = miniLOL.resource.check(http.responseXML);
                        if (error) {
                            miniLOL.error("Error while parsing pages.xml<br/><br/>#{error}".interpolate({
                                error: error.replace(/\n/g, '<br/>').replace(/ /g, '&nbsp;')
                            }));

                            return;
                        }

                        miniLOL.pages.dom = miniLOL.utils.fixDOM(http.responseXML);

                        var pages = http.responseXML.documentElement.getElementsByTagName('page');
                        for (var i = 0; i < pages.length; i++) {
                            delete miniLOL.pages.cache[pages[i].getAttribute('id')];
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
            name: 'functions',
            res: null,

            load: function (path) {
                if (this.res == null) {
                    this.res = {};
                }
                miniLOL.functions = this.res;

                new Ajax.Request(path, {
                    method: 'get',
                    asynchronous: false,
        
                    onSuccess: function (http) {
                        var error = miniLOL.resource.check(http.responseXML);
                        if (error) {
                            miniLOL.error("Error while parsing functions.xml<br/><br/>#{error}".interpolate({
                                error: error.replace(/\n/g, '<br/>').replace(/ /g, '&nbsp;')
                            }));

                            return;
                        }

                        var functions = http.responseXML.documentElement.getElementsByTagName('function');
        
                        for (var i = 0; i < functions.length; i++) {
                            try {
                                miniLOL.functions[functions[i].getAttribute('name')]
                                    = new Function("var text = arguments[0]; var args = arguments[1]; #{code}; return text;".interpolate({
                                        code: functions[i].firstChild.nodeValue
                                    }));
                            }
                            catch (e) {
                                miniLOL.error("Error while creating `#{name}` wrapper from #{path}:<br/><br/>#{error}".interpolate({
                                    name: functions[i].getAttribute("name"),
                                    path: path,
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
            }
        },
    
        modules: {
            name: 'modules',
            res: {
                loading: {},
                list: {}
            },

            load: function (path, output) {
                if (this.res == null) {
                    this.res = {
                        loading: {},
                        list: {}
                    };
                } var res = this.res;

                miniLOL.modules = this.res.list;

                new Ajax.Request(path, {
                    method: 'get',
                    asynchronous: false,
        
                    onSuccess: function (http) { 
                        var error = miniLOL.resource.check(http.responseXML);
                        if (error) {
                            miniLOL.error("Error while parsing modules.xml<br/><br/>#{error}".interpolate({
                                error: error.replace(/\n/g, '<br/>').replace(/ /g, '&nbsp;')
                            }), $(miniLOL.config['core'].contentNode));

                            return;
                        }

                        miniLOL.module.path = http.responseXML.documentElement.getAttribute("path");

                        var modules = http.responseXML.documentElement.getElementsByTagName('module');
                        for (var i = 0; i < modules.length; i++) {
                            if (output) {
                                miniLOL.content.set("Loading `#{name}`... [#{n}/#{total}]".interpolate({
                                    name:  modules[i].getAttribute("name"),
                                    n:     i+1,
                                    total: modules.length
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
                        }), $(miniLOL.config['core'].contentNode));
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

                if (miniLOL.theme.style.exists(name, path)) {
                    if (overload) {
                        miniLOL.theme.style.unload(miniLOL.theme.style.list[name], path);
                    }
                    else {
                        return true;
                    }
                }

                var link = document.createElement('link');
                link.setAttribute('rel', 'stylesheet');
                link.setAttribute('href', "#{path}/#{style}.css".interpolate({ path: path, style: name }));
                link.setAttribute('type','text/css');

                document.getElementsByTagName('head')[0].appendChild(link);

                miniLOL.theme.style.list["#{path}/#{style}.css".interpolate({ path: path, style: name })] = link;
            },

            unload: function (name, path) {
                path = path || "#{path}/#{theme}".interpolate({ path: miniLOL.theme.path, theme: miniLOL.theme.name });

                var name = "#{path}/#{style}.css".interpolate({ path: path, style: name });
                if (miniLOL.theme.style.list[name]) {
                    miniLOL.theme.style.list[name].parentNode.removeChild(miniLOL.theme.style.list[name]);
                    delete miniLOL.theme.style.list[name];
                }
            },

            exists: function (name, path) {
                path = path || "#{path}/#{theme}".interpolate({ path: miniLOL.theme.path, theme: miniLOL.theme.name });

                return Boolean(miniLOL.theme.style.list["#{path}/#{style}.css".interpolate({ path: path, style: name })]);
            }
        },

        template: {
            load: function (name, path) {
                var result;

                path = path || "#{path}/#{theme}".interpolate({
                    path: miniLOL.theme.path,
                    theme: miniLOL.theme.name
                });

                new Ajax.Request("#{path}/#{name}.xml".interpolate({ path: path, name: name }), {
                    method: 'get',
                    asynchronous: false,
                
                    onSuccess: function (http) {
                        result = miniLOL.utils.fixDOM(http.responseXML);
                    },

                    onFailure: function () {
                        result = false;
                    }
                });

                return result;
            },

            exists: function (name) {
                return miniLOL.theme.informations.templates.indexOf(name) >= 0;
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

        load: function (name) {
            miniLOL.theme.unload();

            var result         = true;
            miniLOL.theme.name = name;

            // get the informations about the theme and parse the needed data
            new Ajax.Request("#{path}/#{theme}/theme.xml".interpolate({ path: miniLOL.theme.path, theme: name }), {
                method: 'get',
                asynchronous: false,
                
                onSuccess: function (http) {
                    var info = miniLOL.theme.informations = {};
                    var doc  = miniLOL.utils.fixDOM(http.responseXML);

                    info.name   = doc.documentElement.getAttribute("name")   || "Unknown";
                    info.author = doc.documentElement.getAttribute("author") || "Anonymous";

                    var initialize = doc.getElementsByTagName("initialize");
                    if (initialize.length) {
                        miniLOL.theme.initialize = new Function(initialize[0].firstChild.nodeValue);
                    }
                    else {
                        miniLOL.theme.initialize = new Function;
                    }

                    var finalize = doc.getElementsByTagName("finalize");
                    if (finalize.length) {
                        miniLOL.theme.finalize = new Function(initialize[0].firstChild.nodeValue);
                    }
                    else {
                        miniLOL.theme.finalize = new Function;
                    }

                    info.styles = new Array;
                    var  styles = doc.getElementsByTagName("style");
                    for (var i = 0; i < styles.length; i++) {
                        info.styles.push(styles[i].getAttribute("name"));
                    }

                    info.templates = new Array;
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
            new Ajax.Request("#{path}/#{theme}/template.html".interpolate({ path: miniLOL.theme.path, theme: name }), {
                method: 'get',
                asynchronous: false,
                
                onSuccess: function (http) {
                    document.body.innerHTML = miniLOL.template = http.responseText;
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
                miniLOL.theme.style.load(miniLOL.theme.informations.styles[i], false, true);
            }

            miniLOL.theme.initialize();

            return true;
        },

        unload: function () {
            miniLOL.theme.template.list = miniLOL.theme.template.defaultList();

            if (!miniLOL.theme.name) {
                return;
            }

            miniLOL.theme.finalize();

            for (var style in miniLOL.theme.style.list) {
                miniLOL.theme.style.unload(style);
            }

            delete miniLOL.theme.name;

            delete miniLOL.theme.initialize;
            delete miniLOL.theme.finalize;

            delete miniLOL.theme.informations;
        }
    },

    menu: {
        set: function (data) {
            if (miniLOL.menu.exists) {
                $(miniLOL.config['core'].menuNode).innerHTML = data;
            }
        },

        get: function (name) {
            if (miniLOL.menu.exists) {
                name = name || 'default';
                var menu = miniLOL.menus.getElementById(name);

                if (!menu) {
                    miniLOL.error("The menu `#{name}` doesn't exist.".interpolate({
                        name: name
                    }));
                }

                return menu.firstChild.nodeValue;
            }

            return null;
        },

        change: function (name) {
            if (miniLOL.menu.exists) {
                this.eleName = 'default';
                if (name == 'default') {
                    this.eleName = miniLOL.menu.current;
                }

                var element  = miniLOL.menus.getElementById(name);
                var template = miniLOL.menus.documentElement.getAttribute('template') || "#{menu}";

                var template = (element) ? element.getAttribute('template') || template : template;
                
                miniLOL.menu.set(template.interpolate({
                    name: this.eleName,
                    menu: miniLOL.menu.get(name)
                }));
            }
        },

        check: function (menu) {
            if (miniLOL.menu.exists) {
                miniLOL.menu.current = menu || 'default';

                if (miniLOL.menu.current == 'default') {
                    miniLOL.menu.set(miniLOL.menu.get('default'));
                }
                else {
                    miniLOL.menu.change(miniLOL.menu.current);
                }
            }
        }
    },

    page: {
        parse: function (page, data) {
            var output   = "";
            var contents = page.childNodes;

            for (var i = 0; i < contents.length; i++) {
                switch (contents[i].nodeType) {
                    case Node.ELEMENT_NODE:
                    if (contents[i].nodeName != 'list') {
                        continue;
                    }

                    var ele = contents[i].cloneNode(false);

                    if (!data) {
                        data = [ele];
                    }
                    
                    var list       = contents[i].childNodes;
                    var listBefore = ele.getAttribute('before') || data[0].getAttribute('before'); ele.removeAttribute('before');
                    var listAfter  = ele.getAttribute('after') || data[0].getAttribute('after'); ele.removeAttribute('after');
                    var listArgs   = ele.getAttribute('arguments') || data[0].getAttribute('arguments'); ele.removeAttribute('arguments');
                    var listType   = ele.getAttribute('type') || data[0].getAttribute('type'); ele.removeAttribute('type');
                    var listMenu   = ele.getAttribute('menu') || data[0].getAttribute('menu') || miniLOL.menu.current; ele.removeAttribute('menu');
        
                    var listOutput = "";
                    for (var h = 0; h < list.length; h++) {
                        if (list[h].nodeType == Node.ELEMENT_NODE) {
                            if (list[h].nodeName == 'link') {
                                var link = list[h].cloneNode(true);
                
                                var src     = link.getAttribute('src'); link.removeAttribute('src');
                                var target  = link.getAttribute('target'); link.removeAttribute('target');
                                var text    = link.getAttribute('text'); link.removeAttribute('text');
                                var before  = link.getAttribute('before') || listBefore || ''; link.removeAttribute('before');
                                var after   = link.getAttribute('after') || listAfter || ''; link.removeAttribute('after');
                                var domain  = link.getAttribute('domain') || ''; link.removeAttribute('domain');
                                var args    = link.getAttribute('arguments') || listArgs; link.removeAttribute('arguments');
                                var menu    = link.getAttribute('menu') || listMenu; link.removeAttribute('menu');
                
                                var out = src.match(/^(\w+:\/\/|mailto:)/);
                
                                var linkClass = link.getAttribute('class'); link.removeAttribute('class');
                                var linkId    = link.getAttribute('id'); link.removeAttribute('id');

                                if (target || out) {
                                    src    = (!out) ? 'data/'+src : src;
                                    target = target || '_blank';
                                    text   = text || src;
                                }
                                else {
                                    var ltype = link.getAttribute('type') || listType; link.removeAttribute('type');
                
                                    if (domain == 'in' || src[0] == '#') {
                                        src = (src[0] == '#') ? src : '#' + src;
                                    }
                                    else {
                                        src = '#page=' + src;
                                    }

                                    text = text || src;
        
                                    args   = args ? '&'+args.replace(/[ ,]+/g, '&amp;') : '';
                                    ltype  = ltype ? '&type='+ltype : '';
                                    menu   = miniLOL.menu.exists && menu ? '&amp;menu='+menu : '';
                                    src    = src + args + ltype + menu;
                                    target = "";
                                }

                                listOutput += miniLOL.theme.template.list.link.interpolate({
                                    "class":    linkClass,
                                    id:         linkId,
                                    attributes: miniLOL.utils.attributes(link.attributes),
                                    before:     miniLOL.theme.template.list.before.interpolate({ data: before }),
                                    after:      miniLOL.theme.template.list.after.interpolate({ data: after }),
                                    url:        src,
                                    target:     target,
                                    text:       text
                                });
                            }
                            else if (list[h].nodeName == 'list') {
                                listOutput += miniLOL.page.parse({ childNodes: [list[h]] }, [contents[i]]);
                            }
                            else if (list[h].nodeName == 'nest') {
                                toParse = list[h].cloneNode(true);

                                listOutput += miniLOL.theme.template.list.nest.interpolate({
                                    "class": list[h].getAttribute("class"),
                                    style:   list[h].getAttribute("style"),
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
            miniLOL.content.set(miniLOL.config['core'].loadingMessage);

            var page = miniLOL.pages.dom.getElementById(name);
            var type = queries.type;
        
            if (page == null) {
                miniLOL.content.set("404 - Not Found");
                return false;
            }

            if (page.getAttribute("alias")) {
                if (typeof queries[name] != 'string') {
                    delete queries[name];
                }
                delete queries.page;

                var queries = miniLOL.utils.toQuery(queries);
                return miniLOL.go(page.getAttribute("alias")+(queries ? "&"+queries : ''));
            }

            if (type == null) {
                type = page.getAttribute('type');
            }
        
            if (miniLOL.menu.exists) {
                miniLOL.menu.current = queries.menu || page.getAttribute('menu');

                if (miniLOL.menu.current == 'default' || !miniLOL.menu.current) {
                    miniLOL.menu.set(miniLOL.menu.get(miniLOL.menu.current));
                }
                else {
                    miniLOL.menu.change(miniLOL.menu.current);
                }
            }
        
            if (miniLOL.pages.cache[name]) {
                if (miniLOL.functions[type]) {
                    miniLOL.content.set(miniLOL.functions[type](miniLOL.pages.cache[name], queries));
                    
                }
                else {
                    miniLOL.content.set(miniLOL.pages.cache[name]);
                }

                Event.fire(document, ':go', url);
                return true;
            }

            var pageArguments = page.getAttribute('arguments').replace(/[ ,]+/g, '&amp;').toQueryParams();
            for (var key in pageArguments) {
                if (queries[key] == null) {
                    queries[key] = pageArguments[key];
                }
            }
        
            var output = miniLOL.page.parse(page);

            miniLOL.pages.cache[name] = output;

            if (miniLOL.functions[type]) {
                output = miniLOL.functions[type](output, queries);
            }

            miniLOL.content.set(output);
            Event.fire(document, ':go', url);

            return true;
        },

        load: function (path, queries, url) {
            miniLOL.content.set(miniLOL.config['core'].loadingMessage);

            new Ajax.Request('data/'+path+'?'+miniLOL.utils.toQuery(queries), {
                method: 'get',
        
                onSuccess: function (http) {
                    if (miniLOL.functions[queries.type]) {
                        miniLOL.content.set(miniLOL.functions[queries.type](http.responseText, queries));
                    }
                    else {
                        miniLOL.content.set(http.responseText);
                    }

                    Event.fire(document, ':go', url);
                },
        
                onFailure: function (http) {
                    miniLOL.content.set("#{code} - #{text}".interpolate({
                        code: http.status,
                        text: http.statusText
                    }));
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
                obj.type = 'active';
            }

            if (!obj.execute) {
                obj.execute = new Function;
            }

            for (var func in obj) {
                if (typeof obj[func] == 'function') {
                    obj[func] = obj[func].bind(obj)
                }
            }

            if (obj.initialize) {
                try {
                    if (obj.initialize() === false) {
                        throw new Error("An error occurred while initializing the module.");
                    }
                }
                catch (e) {
                    e.fileName = "#{path}/#{module}/main.js".interpolate({
                        path: miniLOL.module.path,
                        module: name
                    });

                    throw e;
                }
            }

            miniLOL.modules[name] = obj;

            if (obj.onGo) {
                Event.observe(document, ':go', obj.onGo);
            }
        },

        execute: function (name, vars, url) {
            if (!name) {
                if (url) {
                    miniLOL.content.set("What module should be executed?");
                }

                miniLOL._error = true;
                return false;
            }

            if (url) {
                miniLOL.content.set(miniLOL.config['core'].loadingMessage);
            }

            if (!miniLOL.modules[name]) {
                if (url) {
                    miniLOL.content.set("The module isn't loaded.");
                    miniLOL.error = true;
                }

                return false;
            }

            vars = (vars instanceof Array) ? vars : [vars];

            var result;
            try {
                result = miniLOL.modules[name].execute.apply(miniLOL.modules[name], vars);
            }
            catch (e) {
                e.fileName = "#{path}/#{module}/main.js".interpolate({
                    path: miniLOL.module.path,
                    module: name
                });

                miniLOL.error("An error occurred while executing the module `#{name}`<br/><br/>#{file} @ #{line}:<br/>#{error}".interpolate({
                    name:  name,
                    file:  e.fileName,
                    line:  e.lineNumber,
                    error: e.toString()
                }), $(miniLOL.config['core'].contentNode));

                return false;
            }

            if (url) {
                Event.fire(document, ':go', url);
            }

            return result;
        },

        load: function (name) {
            try {
                miniLOL.utils.require("#{path}/#{module}/main.js".interpolate({
                    path: miniLOL.module.path,
                    module: name
                }));

                if (!miniLOL.modules[name]) {
                    throw new Error("Something went wrong while loading the module `#{name}`.".interpolate({
                        name: name
                    }));
                }

                return true;
            }
            catch (e) {
                miniLOL.error("An error occurred while loading the module `#{name}`<br/><br/>#{file} @ #{line}:<br/>#{error}".interpolate({
                    name:  name,
                    file:  e.fileName,
                    line:  e.lineNumber,
                    error: e.toString()
                }), $(miniLOL.config['core'].contentNode));

                return false;
            }
        },

        exists: function (name) {
            return new Boolean(miniLOL.modules[name]);
        },

        dependencies: {
            check: function () {
                for (var module in miniLOL.modules) {
                    var dependencies = miniLOL.modules[module].dependencies;
                    if (dependencies) {
                        for (var i = 0; i < dependencies.length; i++) {
                            if (!miniLOL.modules[dependencies[i]]) {
                                throw { module: module, require: dependencies[i] };
                            }
                        }
                    }
                }

                return true;
            },

            needs: function (name, callback, context, wait) {
                if (miniLOL.modules[name]) {
                    callback.call(context || window);
                }
                else {
                    setTimeout((function () { miniLOL.module.dependencies.needs(name, callback, context); }), wait || 10);
                }
            }
        }
    },

    go: function (url) {
        var queries = miniLOL.utils.parseQuery(url.sub(/#/, '?'))
        var matches = /#(([^=&]*)&|([^=&]*)$)/.exec(url); // hate WebKit so much.

        if (matches) {
            queries.page = matches[1];
            return miniLOL.page.get(queries.page, queries, url);
        }
        else if (queries.module) {
            miniLOL.menu.check(queries.menu);
            return miniLOL.module.execute(queries.module, queries, url);
        }
        else if (queries.page) {
            miniLOL.menu.check(queries.menu);
            return miniLOL.page.load(queries.page, queries, url);
        } 
        else {
            miniLOL.menu.check(queries.menu);
            miniLOL.content.set('wat');
            return false;
        }
    },

    utils: {
        attributes: function (attributes) {
            var text = "";
            
            for (var i = 0; i < attributes.length; i++) {
                text += '#{name}="#{value}" '.interpolate({
                    name: attributes.item(i).nodeName,
                    value: attributes.item(i).nodeValue
                });
            }
            
            return text;
        },

        getElementById: function (id) {
            var e = this.getElementsByTagName('*');
            
            for (var i = 0; i < e.length; i++) {
                if (e[i].getAttribute('id') == id) {
                    return e[i];
                }
            }

            return undefined;
        },

        fixDOM: function (obj) {
            if (!obj || (Prototype.Browser.Gecko || Prototype.Browser.Opera)) {
                return obj;
            }

            if (Prototype.Browser.IE) {
                var tmp = obj;

                obj                 = {};
                obj._real           = tmp;
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

        parseQuery: function (url) {
            var result  = new Object;
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

        include: function (path, context) {
            context = context || window;
            
            var result;
            
            new Ajax.Request(path, {
                method: 'get',
                asynchronous: false,
                evalJS: false,
                
                onSuccess: function (http) {
                    try {
                        window.eval.call(context, http.responseText);
                        result = context;
                    }
                    catch (e) {
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
                method: 'get',
                asynchronous: false,
                evalJS: false,
                
                onSuccess: function (http) {
                    try {
                        window.eval.call(context, http.responseText);
                        result = context;
                    }
                    catch (e) {
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
