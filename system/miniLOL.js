/* Copyleft meh. [http://meh.doesntexist.org | meh@paranoici.org]
 *
 * This file is part of miniLOL.
 *
 * miniLOL is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * miniLOL is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with miniLOL. If not, see <http://www.gnu.org/licenses/>.
 ****************************************************************************/

/*
 * miniLOL is a Javascript/XML based CMS, thus, being in the XXI century,
 * I pretend those two standards to be respected.
 *
 * Get a real browser, get Firefox.
 */

miniLOL = {
    version: '1.2',

    initialize: function () {
        if (miniLOL.initialized) {
            throw new Error('miniLOL has already been initialized.');
        }

        miniLOL.Template.Engine.load('system/templates/HAML.js', { minified: true });

        miniLOL.initialized = false;
        miniLOL.path        = location.href.match(/^\w+:\/\/.*?(\/.*?)(#|$)/)[1];
        miniLOL.storage     = new miniLOL.Storage('miniLOL.core');
        miniLOL.resources   = {};
        miniLOL.tmp         = {};

        // Brace for hugeness, this may look ugly but it's better than 20 copypasted ifs
        [function () {
            // Set some default values when the core config gets loaded (this also means on reload)
            Event.observe(document, ':resource.loaded', function (event) {
                if (event.memo.resource.name != 'miniLOL.config' || event.memo.arguments[0] != 'resources/config.xml') {
                    return;
                }

                if (!miniLOL.config['core']) {
                    miniLOL.config['core'] = {};
                }

                if (!miniLOL.config['core'].siteTitle) {
                     miniLOL.config['core'].siteTitle = 'miniLOL #{version}'.interpolate(miniLOL);
                }

                if (!miniLOL.config['core'].loadingMessage) {
                    miniLOL.config['core'].loadingMessage = 'Loading...';
                }

                if (!miniLOL.config['core'].homePage) {
                    miniLOL.config['core'].homePage = '#home';
                }
                else {
                    if (miniLOL.config['core'].homePage.charAt(0) != '#' && !miniLOL.config['core'].homePage.isURL()) {
                        miniLOL.config['core'].homePage = '#' + miniLOL.config['core'].homePage;
                    }
                }

                if (!document.title) {
                    document.title = miniLOL.config['core'].siteTitle;
                }
            });

            miniLOL.resource.set(new miniLOL.Resource('miniLOL.config', {
                initialize: function () {
                    miniLOL.config = this.data;
                },

                load: function (path) {
                    new Ajax.Request(path, {
                        method: 'get',
                        asynchronous: false,

                        onSuccess: function (http) {
                            if (miniLOL.Document.check(http.responseXML, path)) {
                                return;
                            }

                            var dom = miniLOL.Document.fix(http.responseXML).documentElement;

                            var domain = dom.getAttribute('domain') || 'core';
                            var config = miniLOL.config[domain] || {};

                            miniLOL.config[domain] = Object.extend(config, Element.toObject(dom));
                        },

                        onFailure: function (http) {
                            miniLOL.error('miniLOL.config: Error while loading #{path} (#{status} - #{statusText})'.interpolate({
                                path:       path,
                                status:     http.status,
                                statusText: http.statusText
                            }), true);
                        }
                    });

                    if (miniLOL.error()) {
                        return false;
                    }

                    return true;
                },

                clear: function () {
                    this.data = miniLOL.config = {};
                }
            }));

            miniLOL.resource.get('miniLOL.config').load('resources/config.xml');

            $(document.body).update(miniLOL.config['core'].loadingMessage);

            Event.fire(document, ':initialization');
            Event.stopObserving(document, ':initialization');
        },

        // miniLOL.menus resource creation and resources/menus.xml load
        function () {
            miniLOL.resource.set(new miniLOL.Resource('miniLOL.menus', {
                load: function (path) {
                    new Ajax.Request(path, {
                        method: 'get',
                        asynchronous: false,

                        onSuccess: function (http) {
                            if (miniLOL.Document.check(http.responseXML, path)) {
                                return;
                            }

                            var response = miniLOL.Document.fix(http.responseXML);

                            miniLOL.menus['default'] = response.getElementById('default');

                            $A(response.documentElement.childNodes).each(function (menu) {
                                if (menu.nodeType != Node.ELEMENT_NODE) {
                                    return;
                                }

                                var id = menu.getAttribute('id');

                                if (!id && !miniLOL.menus['default']) {
                                    miniLOL.menus['default'] = menu;
                                }
                                else {
                                    miniLOL.menus[id] = menu;
                                }
                            });

                            if (!miniLOL.menus['default']) {
                                miniLOL.error('Error while analyzing menus.xml\n\nNo default menu was found.', true);
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

            miniLOL.resource.get('miniLOL.menus').load('resources/menus.xml');
        },

        // miniLOL.pages resource creation and resource/pages.xml load
        function () {
            miniLOL.resource.set(new miniLOL.Resource('miniLOL.pages', {
                load: function (path, ignore) {
                    new Ajax.Request(path, {
                        method: 'get',
                        asynchronous: false,

                        onSuccess: function (http) {
                            if (miniLOL.Document.check(http.responseXML, path)) {
                                return;
                            }

                            miniLOL.Document.fix(http.responseXML).xpath('//page').each(function (page) {
                                var id = page.getAttribute('id');

                                delete miniLOL.pages.cache[id];
                                miniLOL.pages.data[id] = page;
                            });
                        },

                        onFailure: function (http) {
                            if (ignore) {
                                return;
                            }

                            miniLOL.error('miniLOL.pages: Error while loading #{path} (#{status} - #{statusText})'.interpolate({
                                path:       path,
                                status:     http.status,
                                statusText: http.statusText
                            }, true));
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

            miniLOL.resource.get('miniLOL.pages').load('resources/pages.xml', true);
        },

        // miniLOL.functions resource creation
        function () {
            miniLOL.resource.set(new miniLOL.Resource('miniLOL.functions', {
                load: function (path) {
                    new Ajax.Request(path, {
                        method: 'get',
                        asynchronous: false,

                        onSuccess: function (http) {
                            if (miniLOL.Document.check(http.responseXML, path)) {
                                return;
                            }

                            miniLOL.Document.fix(http.responseXML).xpath('//function').each(function (func) {
                                try {
                                    miniLOL.functions[func.getAttribute('name')] = new Function(
                                        'var text = arguments[0]; var args = arguments[1]; arguments = args; #{code}; return text;'.interpolate({
                                            code: func.firstChild.nodeValue
                                        })
                                    );
                                }
                                catch (e) {
                                    miniLOL.error('Error while creating `#{name}` wrapper from #{path}:\n\n#{error}'.interpolate({
                                        name:  func.getAttribute('name'),
                                        path:  path,
                                        error: e.toString()
                                    }), true);

                                    return;
                                }
                            });
                        },

                        onFailure: function (http) {
                            miniLOL.error('miniLOL.functions: Error while loading #{path} (#{status} - #{statusText})'.interpolate({
                                path:       path,
                                status:     http.status,
                                statusText: http.statusText
                            }), true);
                        }
                    });

                    if (miniLOL.error()) {
                        return false;
                    }

                    return true;
                },

                clear: function () {
                    miniLOL.functions = this.data = {};
                },

                render: function (types, content, args) {
                    types.split(/\s*,\s*/).each(function (type) {
                        if (Object.isFunction(this.data[type])) {
                            content = this.data[type](content, args);
                        }
                    }, this);

                    return content;
                }
            }));

            miniLOL.resource.get('miniLOL.functions').load('resources/functions.xml');
        },

        // Theme loading
        function () {
            if (miniLOL.config['core'].theme) {
                miniLOL.error(!miniLOL.theme.load(miniLOL.config['core'].theme));
            }
            else {
                miniLOL.error(!miniLOL.theme.deprecated());
            }
        },

        // Menu initialization
        function () {
            if (miniLOL.menu.enabled()) {
                miniLOL.menu.set(miniLOL.config['core'].loadingMessage);
            }
        },

        // miniLOL.modules resource creation and modules' initialization
        function () {
            miniLOL.content.set('Loading modules...');

            miniLOL.resource.set(new miniLOL.Resource('miniLOL.modules', {
                load: function (path, output) {
                    new Ajax.Request(path, {
                        method: 'get',
                        asynchronous: false,

                        onSuccess: function (http) {
                            if (miniLOL.Document.check(http.responseXML, path)) {
                                return;
                            }

                            miniLOL.module.path = http.responseXML.documentElement.getAttribute('path') || 'modules';

                            var modules = miniLOL.Document.fix(http.responseXML).xpath('//module').filter(function (module) {
                                return module.getAttribute('name');
                            });

                            modules.each(function (module, index) {
                                if (output) {
                                    miniLOL.content.set('Loading `#{name}`... [#{number}/#{total}]'.interpolate({
                                        name:   module.getAttribute('name'),
                                        number: index + 1,
                                        total:  modules.length
                                    }));
                                }

                                if (!miniLOL.module.load(module.getAttribute('name'))) {
                                    miniLOL.error(true);
                                }

                                if (miniLOL.error()) {
                                    throw $break;
                                }
                            }, this);
                        },

                        onFailure: function (http) {
                            miniLOL.error('Error while loading modules.xml (#{status} - #{statusText})'.interpolate(http), true);
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

            miniLOL.resource.get('miniLOL.modules').load('resources/modules.xml', true);
        },

        // Set the menu
        function () {
            if (miniLOL.menu.enabled()) {
                miniLOL.menu.change('default');
            }
        },

        // Check for modules dependencies
        function () {
            miniLOL.content.set('Checking dependencies...');

            try {
                miniLOL.module.dependencies.check();
            }
            catch (e) {
                miniLOL.error('`#{module}` requires `#{require}`'.interpolate(e), true);
            }
        }].each(function (callback) {
            try {
                callback();
            }
            catch (e) {
                miniLOL.error(e.toString(), true);
            }

            if (miniLOL.error()) {
                throw $break;
            }
        });

        if (miniLOL.error()) {
            return false;
        }

        Event.observe(document, 'unload', function (event) {
            Event.fire(document, ':finalization', event);
        });

        Event.observe(document, ':url.change', function (event) {
            if (event.stopped) {
                return;
            }

            if (event.memo) {
                miniLOL.go(event.memo);
            }
            else {
                miniLOL.go(miniLOL.config['core'].homePage);
            }
        });

        Event.observe(document, ':go', (miniLOL.tmp.fixScroll = function () {
            miniLOL.theme.content().scrollTo();
        }));

        if (miniLOL.config['core'].initialization) {
            eval(miniLOL.config['core'].initialization);
        }

        miniLOL.go(/[#?]./.test(location.href) ? location.href.replace(/^.*[#?]/, '#') : miniLOL.config['core'].homePage);

        Event.observe(document, ':refresh', function () {
            miniLOL.resource.reload('miniLOL.config', 'miniLOL.pages', 'miniLOL.menus');
        });

        new PeriodicalExecuter(function () {
            Event.fire(document, ':refresh');
        }, miniLOL.config['core'].refreshEvery || 360);

        Event.fire(document, ':initialized');
        Event.stopObserving(document, ':initialized');

        miniLOL.initialized = true;
    },

    error: function (text, major, element) {
        if (miniLOL.error.major) {
            return true;
        }

        if (Object.isUndefined(text)) {
            return Boolean(miniLOL.error.major);
        }

        if (Object.isBoolean(text)) {
            return miniLOL.error.major = text;
        }

        if (miniLOL.error.done) {
            return;
        }

        element = element || miniLOL.theme.content() || document.body;

        $(element).update('<pre>' + text.replace(/<br\/>/g, '\n').escapeHTML() + '</pre>');

        miniLOL.error.done = true;

        if (major) {
            miniLOL.error.major = true;
        }

        Event.fire(document, ':error', { text: text, element: element, major: major });
    },

    content: {
        set: function (data) {
            var wrap = { content: data };

            Event.fire(document, ':content.set', wrap);

            miniLOL.theme.content().update(wrap.content);
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
            if (arguments.length > 1) {
                what = $A(arguments);
            }

            if (Object.isArray(what)) {
                what.each(function (name) {
                    miniLOL.resource.get(name).reload();
                });
            }
            else if (Object.isString(what)) {
                miniLOL.resource.get(name).reload();
            }
            else {
                for (var resource in miniLOL.resources) {
                    miniLOL.resource.get(resource).reload();
                }
            }
        }
    },

    theme: {
        style: {
            list: {},

            load: function (name, path, overload) {
                path = path || '#{path}/#{theme}'.interpolate({ path: miniLOL.theme.path, theme: miniLOL.theme.name });

                Event.fire(document, ':theme.style.load', { name: name, path: path, overload: Boolean(overload) });

                if (miniLOL.theme.style.exists(name, path)) {
                    if (overload) {
                        miniLOL.theme.style.unload(miniLOL.theme.style.list[name], path);
                    }
                    else {
                        return true;
                    }
                }

                var file  = '#{path}/#{style}.css'.interpolate({ path: path, style: name });
                var style = miniLOL.CSS.include(file, true);

                if (!style) {
                    return false;
                }

                miniLOL.theme.style.list[file] = style;

                return true;
            },

            unload: function (name, path) {
                path = path || '#{path}/#{theme}'.interpolate({ path: miniLOL.theme.path, theme: miniLOL.theme.name });

                Event.fire(document, ':theme.style.unload', { name: name, path: path });

                var file = '#{path}/#{style}.css'.interpolate({ path: path, style: name });

                if (miniLOL.theme.style.list[file]) {
                    miniLOL.theme.style.list[file].remove();
                    delete miniLOL.theme.style.list[file];
                }
            },

            exists: function (name, path) {
                path = path || '#{path}/#{theme}'.interpolate({ path: miniLOL.theme.path, theme: miniLOL.theme.name });

                return Boolean(miniLOL.theme.style.list['#{path}/#{style}.css'.interpolate({ path: path, style: name })]);
            }
        },

        template: {
            initialize: function () {
                miniLOL.theme.templates = {};
            },

            setDefaults: function () {
                if (!miniLOL.theme.templates.list) {
                    miniLOL.theme.templates.list = {};
                }

                miniLOL.theme.templates.list['default'] = Object.extend({
                    global: '<div #{attributes}>#{data}</div>',

                    before: '#{data}',
                    after:  '#{data}',

                    link: '<div class="#{class}" id="#{id}">#{before}<a href="#{href}" target="#{target}" #{attributes}>#{text}</a>#{after}</div>',
                    item: '<div class="#{class}" id="#{id}">#{before}<span #{attributes}>#{text}</span>#{after}</div>',
                    nest: '<div class="#{class}" style="#{style}">#{data}</div>',
                    data: '<div class="data">#{before}#{data}#{after}</div>'
                }, miniLOL.theme.templates.list['default'] || {});

                miniLOL.theme.templates.list['table'] = Object.extend({
                    global: '<table #{attributes}>#{data}</table>',

                    before: '#{data}',
                    after:  '#{data}',

                    link: '<tr><td>#{before}</td><td><a href="#{href}" target="#{target}" #{attributes}>#{text}</a></td><td>#{after}</td></tr>',
                    item: '<tr><td>#{before}</td><td>#{text}</td><td>#{after}</td></tr>',
                    nest: '<div class="#{class}" style="#{style}">#{data}</div>',
                    data: '<div class="data">#{before}#{data}#{after}</div>'
                }, miniLOL.theme.templates.list['table'] || {});

                if (!miniLOL.theme.templates.menu) {
                    miniLOL.theme.templates.menu = {};
                }

                miniLOL.theme.templates.menu.layers = Object.extend({
                    '0': {
                        menu: '<div class="menu">#{data}</div>',
                        item: '<span class="item"><a href="#{href}">#{text}</a></span>'
                    }
                }, miniLOL.theme.templates.menu.layers || {});
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
                miniLOL.theme.path = 'themes';
                miniLOL.theme.name = name;
            }

            if (miniLOL.theme.name == oldName && miniLOL.theme.path == oldPath) {
                return true;
            }

            var path = '#{path}/#{theme}'.interpolate({ path: miniLOL.theme.path, theme: name });

            Event.fire(document, ':theme.load', { name: name, runtime: Boolean(runtime) });

            var error;
            // Get the information about the theme and parse the needed data
            new Ajax.Request('#{path}/theme.xml'.interpolate({ path: path, theme: name }), {
                method: 'get',
                asynchronous: false,

                onSuccess: function (http) {
                    var info = miniLOL.theme.information = {};
                    var doc  = miniLOL.Document.fix(http.responseXML);

                    info.name     = doc.documentElement.getAttribute('name')     || 'Unknown';
                    info.author   = doc.documentElement.getAttribute('author')   || 'Anonymous';
                    info.homepage = doc.documentElement.getAttribute('homepage') || '';

                    miniLOL.theme.menu.node    = doc.documentElement.getAttribute('menu') || 'menu';
                    miniLOL.theme.content.node = doc.documentElement.getAttribute('content') || 'body';

                    try {
                        var initialize = doc.getElementsByTagName('initialize');

                        if (initialize.length) {
                            miniLOL.theme.initialize = new Function(initialize[0].firstChild.nodeValue);
                        }
                        else {
                            miniLOL.theme.initialize = new Function;
                        }
                    }
                    catch (e) {
                        error = 'An error occurred on the theme#initialize function:\n\n' + e.toString();
                        return false;
                    }

                    try {
                        var finalize = doc.getElementsByTagName('finalize');

                        if (finalize.length) {
                            miniLOL.theme.finalize = new Function(finalize[0].firstChild.nodeValue);
                        }
                        else {
                            miniLOL.theme.finalize = new Function;
                        }
                    }
                    catch (e) {
                        error = 'An error occurred on the theme#finalize function:\n\n' + e.toString();
                        return false;
                    }

                    info.styles = [];

                    doc.xpath('/theme/styles/style').each(function (style) {
                        info.styles.push(style.getAttribute('name'));
                    });

                    doc.xpath('/theme/templates/*').each(function (node) {
                        miniLOL.theme.templates[node.nodeName] = Element.toObject(node);
                    }, this);

                    miniLOL.theme.template.setDefaults();
                },

                onFailure: function () {
                    error = 'Could not load theme#information.';
                }
            });

            if (error) {
                miniLOL.error(error, true);
                return false;
            }

            // Get the html layout and set it
            var template = miniLOL.utils.get('#{path}/template.html'.interpolate({ path: path, theme: name }), { minified: true });

            if (template) {
                $(document.body).update(template);
            }
            else {
                miniLOL.error('Could not load template.html.', true);
                return false;
            }

            miniLOL.theme.information.styles.each(function (style) {
                if (!miniLOL.theme.style.load(style, false, true)) {
                    miniLOL.error('Could not load `#{style}` style/'.interpolate({
                        style: style
                    }), true);

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

            miniLOL.theme.tmp = {};

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
                miniLOL.theme.initialize.call(miniLOL.theme.tmp);
            }

            Event.fire(document, ':theme.loaded', { name: name, runtime: Boolean(runtime) });

            return true;
        },

        unload: function (noFinalization) {
            miniLOL.theme.template.initialize();

            if (!miniLOL.theme.name) {
                return;
            }

            Event.fire(document, ':theme.unload', { name: miniLOL.theme.name });

            if (!noFinalization && miniLOL.theme.finalize) {
                miniLOL.theme.finalize.call(miniLOL.theme.tmp || {});
            }

            delete miniLOL.theme.tmp;

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
            miniLOL.theme.path         = 'themes';
            miniLOL.theme.content.node = miniLOL.config['core'].contentNode || 'body';
            miniLOL.theme.menu.node    = miniLOL.config['core'].menuNode || 'menu';
            miniLOL.theme.template.initialize();

            new Ajax.Request('resources/template.html', {
                method: 'get',
                asynchronous: false,

                onSuccess: function (http) {
                    $(document.body).update(http.responseText);
                },

                onFailure: function () {
                    $(document.body).update('<div id="menu"></div><div id="body"></div>');
                }
            });

            miniLOL.CSS.include('resources/style.css');

            miniLOL.theme.template.setDefaults();

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
                return '';
            }

            name = name || 'default';

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
                var error = 'The menu `#{name}` does not exist.'.interpolate({
                    name: name
                });

                miniLOL.error(error, true);
                return error;
            }

            Event.fire(document, ':menu.change', miniLOL.menus[name]);
        },

        enabled: function () {
            return Boolean(miniLOL.menus['default']);
        },

        exists: function (name) {
            return Boolean(miniLOL.menus[name]);
        },

        parse: function (menu, layer) {
            layer = layer || 0;

            var template = miniLOL.theme.templates.menu;

            if (!template || !menu) {
                if (miniLOL.error()) {
                    return false;
                }
            }

            var first  = true;
            var output = '';

            $A(menu.childNodes).each(function (e) {
                switch (e.nodeType) {
                    case Node.ELEMENT_NODE:
                    if (e.nodeName == 'menu') {
                        output += miniLOL.menu.parsers.layer(template, layer).menu.interpolate({
                            data: miniLOL.menu.parse(e, layer)
                        });
                    }
                    else if (e.nodeName == 'item') {
                        output += miniLOL.menu.parsers.item(e, template, layer);
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

            if (!output.blank()) {
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
                return '';
            }
        },

        parsers: {
            layer: function (template, layer) {
                var result = {
                    menu: '',
                    item: ''
                };

                if (template) {
                    result = Object.extend(result, template.layers['_' + layer] || template.layers['default'] || {});

                    if (!result.menu) {
                        result.menu = '#{data}';
                    }

                    if (!result.item) {
                        result.item = '<a href="#{href}" #{attributes}>#{text}</a> ';
                    }
                }

                return result;
            },

            item: function (element, template, layer) {
                var item = element.cloneNode(true);

                var itemClass = item.getAttribute('class') || ''; item.removeAttribute('class');
                var itemId    = item.getAttribute('id') || ''; item.removeAttribute('id');
                var itemHref  = item.getAttribute('href') || ''; item.removeAttribute('href');

                return miniLOL.menu.parsers.layer(template, layer).item.interpolate(Object.extend(Object.fromAttributes(item.attributes), {
                    'class':    itemClass,
                    id:         itemId,
                    href:       itemHref,
                    attributes: String.fromAttributes(item.attributes),
                    text:       Element.getFirstText(element),
                    data:       miniLOL.menu.parse(element, layer + 1)
                }));
            },

            other: function (data, template) {
                if (!data || !template) {
                    return '';
                }

                var text = template[data.nodeName];

                if (!text) {
                    return '';
                }

                var output  = '';
                var outputs = {};

                $A(data.childNodes).each(function (e) {
                    if (e.nodeType == Node.ELEMENT_NODE) {
                        outputs[e.nodeName] = miniLOL.menu.parsers.other(e, template);
                    }
                });

                outputs['text'] = Element.getFirstText(data);

                return text.interpolate(Object.extend(outputs, Object.fromAttributes(data.attributes)));
            }
        }
    },

    page: {
        get: function (name, queries, url) {
            miniLOL.content.set(miniLOL.config['core'].loadingMessage);

            Event.fire(document, ':page.get', { name: name, queries: queries });

            var page = miniLOL.pages.data[name];
            var type = queries.type;

            if (!page) {
                miniLOL.content.set('404 - Not Found');
                return false;
            }

            if (page.getAttribute('alias')) {
                if (typeof queries[name] != 'string') {
                    delete queries[name];
                }
                delete queries.page;

                if (!queries.title && page.getAttribute('title')) {
                    queries.title = page.getAttribute('title').encodeURIComponent();
                }

                var queries = Object.toQueryString(queries);
                if (queries) {
                    queries = '&' + queries;
                }

                page = page.getAttribute('alias');
                if (!page.isURL() && page.charAt(0) != '#') {
                    page = '#' + page;
                }

                return miniLOL.go(page + queries);
            }

            if (Object.isUndefined(type)) {
                type = page.getAttribute('type');
            }

            if (url) {
                var data = {};
                Object.extend(data, miniLOL.config['core']);
                Object.extend(data, queries);

                document.title = (
                       queries.title ||
                       page.getAttribute('title') ||
                       miniLOL.config['core'].siteTitle
                ).interpolate(data);
            }

            if (miniLOL.pages.cache[name]) {
                if (type) {
                    miniLOL.content.set(miniLOL.resource.get('miniLOL.functions').render(type, miniLOL.pages.cache[name], queries));
                }
                else {
                    miniLOL.content.set(miniLOL.pages.cache[name]);
                }

                return true;
            }

            var pageArguments = page.getAttribute('arguments');
            if (pageArguments) {
                pageArguments = pageArguments.replace(/[ ,]+/g, '&amp;').toQueryParams();

                for (var key in pageArguments) {
                    if (queries[key] == null) {
                        queries[key] = pageArguments[key];
                    }
                }
            }

            var output = miniLOL.page.parse(page);

            miniLOL.pages.cache[name] = output;

            if (type) {
                output = miniLOL.resource.get('miniLOL.functions').render(type, output, queries);
            }

            miniLOL.content.set(output);

            return true;
        },

        parse: function (page, data) {
            var output = '';

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
                var list = element.cloneNode(false);
                    data = data || [element];

                var listBefore   = list.getAttribute('before') || data[0].getAttribute('before') || ''; list.removeAttribute('before');
                var listAfter    = list.getAttribute('after') || data[0].getAttribute('after') || ''; list.removeAttribute('after');
                var listArgs     = list.getAttribute('arguments') || data[0].getAttribute('arguments') || ''; list.removeAttribute('arguments');
                var listType     = list.getAttribute('type') || data[0].getAttribute('type') || ''; list.removeAttribute('type');
                var listMenu     = list.getAttribute('menu') || data[0].getAttribute('menu'); list.removeAttribute('menu');
                var listTemplate = list.getAttribute('template'); list.removeAttribute('template');

                if (!miniLOL.theme.templates.list[listTemplate]) {
                    listTemplate = 'default';
                }

                var output = '';

                $A(element.childNodes).each(function (e) {
                    if (e.nodeType == Node.ELEMENT_NODE) {
                        if (e.nodeName == 'link') {
                            var link = e.cloneNode(true);

                            var href = link.getAttribute('href'); link.removeAttribute('href');

                            var target = link.getAttribute('target'); link.removeAttribute('target');
                            var text   = link.getAttribute('text') || (link.firstChild ? link.firstChild.nodeValue : href);
                            var before = link.getAttribute('before') || listBefore || ''; link.removeAttribute('before');
                            var after  = link.getAttribute('after') || listAfter || ''; link.removeAttribute('after');
                            var domain = link.getAttribute('domain') || ''; link.removeAttribute('domain');
                            var args   = link.getAttribute('arguments') || listArgs; link.removeAttribute('arguments');
                            var menu   = link.getAttribute('menu') || listMenu; link.removeAttribute('menu');
                            var title  = link.getAttribute('title') || ''; link.removeAttribute('title');

                            var out = href.isURL();

                            var linkClass = link.getAttribute('class') || ''; link.removeAttribute('class');
                            var linkId    = link.getAttribute('id') || ''; link.removeAttribute('id');

                            if (target || out) {
                                href   = (!out) ? 'data/' + href : href;
                                target = target || '_blank';
                            }
                            else {
                                var ltype = link.getAttribute('type') || listType || ''; link.removeAttribute('type');

                                if (domain == 'in' || href.charAt(0) == '#') {
                                    if (href.charAt(0) != '#') {
                                        href = '#' + href;
                                    }
                                }
                                else {
                                    href = '#page=' + href;
                                }

                                args   = args ? '&' + args.replace(/[ ,]+/g, '&amp;') : '';
                                ltype  = ltype ? '&type=' + ltype : '';
                                menu   = miniLOL.menu.enabled() && menu ? '&amp;menu=' + menu : '';
                                target = '';

                                if (title) {
                                    title = title.interpolate({
                                        text: text,
                                        href: href
                                    });

                                    title = '&title=' + title.encodeURIComponent();
                                }

                                href = href + args + ltype + menu + title;
                            }

                            output += miniLOL.theme.templates.list[listTemplate].link.interpolate(Object.extend(Object.fromAttributes(link.attributes), {
                                'class':    linkClass,
                                id:         linkId,
                                attributes: String.fromAttributes(link.attributes),
                                before:     miniLOL.theme.templates.list[listTemplate].before.interpolate({ data: before }),
                                after:      miniLOL.theme.templates.list[listTemplate].after.interpolate({ data: after }),
                                href:       href,
                                target:     target,
                                text:       text,
                                title:      title
                            }));
                        }
                        else if (e.nodeName == 'item') {
                            var item = e.cloneNode(true);

                            var text   = item.getAttribute('text') || (item.firstChild ? item.firstChild.nodeValue : '');
                            var before = item.getAttribute('before') || listBefore || ''; item.removeAttribute('before');
                            var after  = item.getAttribute('after') || listAfter || ''; item.removeAttribute('after');

                            var itemClass = item.getAttribute('class') || ''; item.removeAttribute('class');
                            var itemId    = item.getAttribute('id') || ''; item.removeAttribute('id');

                            output += miniLOL.theme.templates.list[listTemplate].item.interpolate(Object.extend(Object.fromAttributes(item.attributes), {
                                'class':    itemClass,
                                id:         itemId,
                                attributes: String.fromAttributes(item.attributes),
                                before:     miniLOL.theme.templates.list[listTemplate].before.interpolate({ data: before }),
                                after:      miniLOL.theme.templates.list[listTemplate].after.interpolate({ data: after }),
                                text:       text
                            }));
                        }
                        else if (e.nodeName == 'list') {
                            output += miniLOL.page.parsers.list(e, [element]);
                        }
                        else if (e.nodeName == 'nest') {
                            toParse = e.cloneNode(true);

                            var before = e.getAttribute('before') || listBefore || '';
                            var after  = e.getAttribute('after') || listAfter || '';

                            output += miniLOL.theme.templates.list[listTemplate].nest.interpolate({
                                'class': e.getAttribute('class') || '',
                                style:   e.getAttribute('style') || '',
                                before:  miniLOL.theme.templates.list[listTemplate].before.interpolate({ data: before }),
                                after:   miniLOL.theme.templates.list[listTemplate].after.interpolate({ data: after }),
                                data:    miniLOL.page.parse(toParse, [element])
                            });
                        }
                    }
                    else if (e.nodeType == Node.CDATA_SECTION_NODE || e.nodeType == Node.TEXT_NODE) {
                        if (e.nodeValue.blank()) {
                            return;
                        }

                        output += miniLOL.theme.templates.list[listTemplate].data.interpolate({
                            data: e.nodeValue
                        });
                    }
                });

                return miniLOL.theme.templates.list[listTemplate].global.interpolate(Object.extend(Object.fromAttributes(list.attributes), {
                    attributes: String.fromAttributes(list.attributes),
                    data: output
                }));
            },

            include: function (element, data) {
                var include = element.cloneNode(false);

                var href   = element.getAttribute('href'); element.removeAttribute('href');
                var update = element.getAttribute('update'); element.removeAttribute('update');

                var domain  = location.href.match(/^http(s)?:\/\/(.*?)([^\.]\.\w+)/)[3];
                var matches = href.match(/^http(s)?:\/\/(.*?)([^\.]\.\w+)/);

                var output = '';

                if (matches && matches[3] != domain) {
                    output = '<iframe src="#{href}" #{attributes}></iframe>'.interpolate({
                        href: href,
                        attributes: Object.fromAttributes(element.attributes)
                    });
                }
                else {
                    output = '<div ';
                }

                return '';
            }
        },

        load: function (path, queries, url) {
            miniLOL.content.set(miniLOL.config['core'].loadingMessage);

            Event.fire(document, ':page.load', { path: path, queries: queries });

            if (url) {
                document.title = (
                       queries.title ||
                       miniLOL.config['core'].siteTitle
                ).interpolate(Object.extend(Object.extend({}, miniLOL.config['core']), queries));
            }

            new Ajax.Request('data/#{path}?#{queries}'.interpolate({ path: path, queries: Object.toQueryString(queries) }), {
                method: 'get',

                onSuccess: function (http) {
                    if (queries.type) {
                        miniLOL.content.set(miniLOL.resource.get('miniLOL.functions').render(queries.type, http.responseText, queries));
                    }
                    else {
                        miniLOL.content.set(http.responseText);
                    }

                    Event.fire(document, ':page.loaded', http);

                    Event.fire(document, ':go', url.getHashFragment());
                },

                onFailure: function (http) {
                    miniLOL.content.set('#{status} - #{statusText}'.interpolate(http));

                    Event.fire(document, ':page.loaded', http);
                }
            });
        }
    },

    module: {
        create: function (name, obj) {
            if (!obj) {
                miniLOL.error('Like, do I know how this module is done?', true);
                return false;
            }

            Event.fire(document, ':module.create', { name: name, module: obj });

            obj.name = name;

            obj.root = '#{path}/#{module}'.interpolate({
                path: miniLOL.module.path,
                module: name
            });

            if (!Object.isArray(obj.dependencies)) {
                obj.dependencies = [];
            }

            if (!obj.type) {
                obj.type = 'active';
            }

            if (!obj.execute) {
                obj.execute = new Function;
            }

            for (var func in obj) {
                if (Object.isFunction(obj[func])) {
                    obj[func] = obj[func].bind(obj);
                }
            }

            obj.storage = new miniLOL.Storage('module.' + name);

            if (obj.initialize) {
                try {
                    if (obj.initialize() === false) {
                        if (miniLOL.error()) {
                            return false;
                        }

                        throw new Error('An error occurred while initializing the module.');
                    }
                }
                catch (e) {
                    e.fileName = '#{root}/#{path}/#{module}/main.js'.interpolate({
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

            document.fire(':module.created', obj);

            return obj;
        },

        execute: function (name, vars, output) {
            if (!name) {
                miniLOL.error('What module should be executed?');
                return false;
            }

            if (!miniLOL.module.exists(name)) {
                if (output) {
                    miniLOL.error('The module `#{name}` is not loaded.'.interpolate({ name: name }));
                }

                return false;
            }

            if (output) {
                miniLOL.content.set(miniLOL.config['core'].loadingMessage);

                var data = {};
                Object.extend(data, miniLOL.config['core']);
                Object.extend(data, vars);

                document.title = (
                       vars.title ||
                       miniLOL.module.get(name).title ||
                       miniLOL.config['core'].siteTitle
                ).interpolate(data);
            }

            vars = (Object.isArray(vars)) ? vars : [vars];

            Event.fire(document, ':module.execute', { name: name, arguments: vars });

            var result;

            try {
                result = miniLOL.module.get(name).execute.apply(miniLOL.module.get(name), vars);
            }
            catch (e) {
                e.fileName = '#{root}/#{path}/#{module}/main.js'.interpolate({
                    root: miniLOL.path,
                    path: miniLOL.module.path,
                    module: name
                });

                miniLOL.error('An error occurred while executing the module `#{name}`\n\n#{file} @ #{line}:\n#{error}'.interpolate({
                    name:  name,
                    file:  e.fileName,
                    line:  e.lineNumber,
                    error: e.toString()
                }), true);

                return false;
            }

            Event.fire(document, ':module.executed', { name: name, arguments: vars, result: result });

            if (Object.isUndefined(result)) {
                result = true;
            }

            return result;
        },

        load: function (name) {
            Event.fire(document, ':module.load', name);

            try {
                miniLOL.utils.require('#{path}/#{module}/main.js'.interpolate({
                    path: miniLOL.module.path,
                    module: name
                }), { minified: true });

                if (miniLOL.error()) {
                    return false;
                }

                if (!miniLOL.module.exists(name)) {
                    throw new Error('Something went wrong while loading the module `#{name}`.'.interpolate({
                        name: name
                    }));
                }

                Event.fire(document, ':module.loaded', name);

                return true;
            }
            catch (e) {
                miniLOL.error('An error occurred while loading the module `#{name}`\n\n#{root}/#{file} @ #{line}:\n\n#{error}'.interpolate({
                    name:  name,
                    root:  miniLOL.path,
                    file:  e.fileName,
                    line:  e.lineNumber,
                    error: e.toString()
                }), true);

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
        if (!Object.isString(url)) {
            return false;
        }

        if (url.isURL()) {
            url = url.parseURL();

            if (url.host != location.host || !url.path.startsWith(miniLOL.path)) {
                location.href = url.full;
            }
            else {
                url = url.full.replace(new RegExp('^.*' + miniLOL.path), '');
            }
        }
        else {
            if (url.charAt(0) != '#') {
                url = '#' + url;
            }
        }

        var queries = url.toQueryParams();
        var matches = url.match(/#(([^=&]*)&|([^=&]*)$)/); // hate WebKit so much.
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
                result = miniLOL.go('#{page}&#{queries}'.interpolate({
                    page:    miniLOL.config['core'].homePage,
                    queries: Object.toQueryString(queries)
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
            result = miniLOL.go(miniLOL.config['core'].homePage);
        }

        if (result) {
            Event.fire(document, ':go', url.getHashFragment());
        }

        return result;
    }
};
