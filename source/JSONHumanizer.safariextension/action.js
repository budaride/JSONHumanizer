//credits : https://github.com/caldwell/

$(document).ready(function () {
    (function () {
        if (!$('body').children('pre').length) {
            return ;
        }

        var json, string = $('body').children('pre').text().trim();

        if (string.indexOf('{') == 0 || string.indexOf('[') == 0 ) {
            json = JSON.parse(string);
        } else {
            json = null;
        }

        if (!json) {
            return ;
        }


        var settings;

        // launch init after retrieving settings from global.html
        var init = function () {

            var pre = ''
            $('head').append('<link rel="stylesheet" href="'+safari.extension.baseURI+'style.css">')
            $('body').append('<div class="beautified" id="beautified"></div>')
            exports = {};
            exports.beautifyJson = beautifyJson = (function () {
                var textcss = function ( /* [class, text]+ */ ) {
                    var spans = [];
                    while (arguments.length)
                        spans.push(append(span(Array.prototype.shift.call(arguments)),
                            text(Array.prototype.shift.call(arguments))));
                    return spans;
                };
                var append = function ( /* el, ... */ ) {
                    var el = Array.prototype.shift.call(arguments);
                    for (var a = 0; a < arguments.length; a++)
                        if (arguments[a].constructor == Array) {
                            append.apply(this, [el].concat(arguments[a]));
                        } else {
                            if ($(arguments[a]).text().replace(/\"/g, '').indexOf('http') == 0) {
                                $(arguments[a]).html('<a href="' + $(arguments[a]).text().replace(/\"/g, '') + '">' + $(arguments[a]).text() + '</a>')
                            }
                            el.appendChild(arguments[a]);
                        }
                    return el;
                };
                var prepend = function (el, child) {
                    el.insertBefore(child, el.firstChild);
                    return el;
                }
                var isempty = function (obj) {
                    for (var k in obj)
                        if (obj.hasOwnProperty(k)) return false;
                    return true;
                }
                var text = function (txt) {
                    return document.createTextNode(txt)
                };
                var div = function () {
                    return document.createElement("div")
                };
                var span = function (classname) {
                    var s = document.createElement("span");
                    if (classname) s.className = classname;
                    return s;
                };
                var A = function A(txt, classname, callback) {
                    var a = document.createElement("a");
                    if (classname) a.className = classname;
                    a.appendChild(text(txt));
                    a.href = '#';
                    a.onclick = function () {
                        callback();
                        return false;
                    };
                    return a;
                };

                function _beautifyJson(json, indent, dont_indent, show_level) {
                    var my_indent = dont_indent ? "" : indent;

                    if (json === null) return textcss(null, my_indent, "keyword", "null");
                    if (json === void 0) return textcss(null, my_indent, "keyword", "undefined");
                    if (typeof (json) != "object") // Strings, numbers and bools
                        return textcss(null, my_indent, typeof (json), JSON.stringify(json));

                    var expandableSection = function (open, close, type, builder) {
                        var content;
                        var empty = span(type);
                        var show = function () {
                            if (!content) append(empty.parentNode,
                                content = prepend(builder(),
                                    A(beautifyJson.hide, "expandableSection",
                                        function () {
                                            content.style.display = "none";
                                            empty.style.display = "inline";
                                        })));
                            content.style.display = "inline";
                            empty.style.display = "none";
                        };
                        append(empty,
                            A(beautifyJson.show, "expandableSection", show),
                            textcss(type + " separator", open),
                            A("..", null, show),
                            textcss(type + " separator", close));
                        var el = append(span(), text(my_indent.slice(0, -1)), empty);
                        if (show_level > 0)
                            show();
                        return el;
                    };

                    if (json.constructor == Array) {
                        if (json.length == 0) return textcss(null, my_indent, "array separator", "[]");

                        return expandableSection("[", "]", "array", function () {
                            var as = append(span("array"), textcss("array separator", "[", null, "\n"));
                            for (var i = 0; i < json.length; i++)
                                append(as,
                                    _beautifyJson(json[i], indent + "    ", false, show_level - 1),
                                    i != json.length - 1 ? textcss("separator", ",") : [],
                                    text("\n"));
                            append(as, textcss(null, indent, "array separator", "]"));
                            return as;
                        });
                    }

                    // object
                    if (isempty(json))
                        return textcss(null, my_indent, "object separator", "{}");

                    return expandableSection("{", "}", "object", function () {
                        var os = append(span("object"), textcss("object separator", "{", null, "\n"));
                        for (var k in json) var last = k;
                        for (var k in json)
                            append(os, textcss(null, indent + "    ", "key", '"' + k + '"', "object separator", ': '),
                                _beautifyJson(json[k], indent + "    ", true, show_level - 1),
                                k != last ? textcss("separator", ",") : [],
                                text("\n"));
                        append(os, textcss(null, indent, "object separator", "}"));
                        return os;
                    });
                }

                var beautifyJson = function beautifyJson(json) {
                    pre = append(document.createElement("pre"), _beautifyJson(json, "", false, beautifyJson.show_to_level));
                    pre.className = "beautifyJson";
                    return pre;
                }
                beautifyJson.set_icons = function (show, hide) {
                    beautifyJson.show = show;
                    beautifyJson.hide = hide;
                    return beautifyJson;
                };
                beautifyJson.set_show_to_level = function (level) {
                    beautifyJson.show_to_level = typeof level == "string" &&
                        level.toLowerCase() === "all" ? Number.MAX_VALUE : level;
                    return beautifyJson;
                };
                // Backwards compatiblity. Use set_show_to_level() for new code.
                beautifyJson.set_show_by_default = function (show) {
                    beautifyJson.show_to_level = show ? Number.MAX_VALUE : 0;
                    return beautifyJson;
                };
                beautifyJson.set_icons('+', '-');
                beautifyJson.set_show_by_default(true);
                return beautifyJson;
            })();

            beautifyJson(json)
            $('pre').addClass('source')
            $(".beautified").html(pre);
            $('body').append('<header class="top_bar"><button class="view-source">View Source</button><button class="view-beautified">Ok, I regret this.</button></header>')
            var theme = settings.theme ? 'theme-' + settings.theme : 'theme-white;'
            $('body').addClass('JSONH humanize ' + theme)

            $('.view-source').bind('click', function () {
                $('.JSONH').removeClass('humanize')
            })
            $('.view-beautified').bind('click', function () {
                $('.JSONH').addClass('humanize')
            })


            /* Top bar will hide on scroll */
            var topBar = function () {
                var header = $('.top_bar');
                var headerHeight = header.height() + 20;
                var prevScrollTop = $(window).scrollTop(50);

                $(window).on('scroll', function (e) {
                    var scrollTop = $(window).scrollTop();
                    if (scrollTop <= 0 || prevScrollTop > scrollTop) {
                        header.css('-webkit-transform', 'translate3d(0, 0, 0)')
                    } else if (scrollTop > headerHeight && prevScrollTop < scrollTop) {
                        header.css('-webkit-transform', 'translate3d(0, -' + headerHeight + 'px, 0)')
                    }

                    prevScrollTop = scrollTop;
                })
            }()
        };

        // listen for an incoming setSettings message
        safari.self.addEventListener("message", function (e) {
            if (e.name === "setSettings") {
                settings = e.message;
                init();
            }
        }, false);

        // ask proxy.html for settings
        safari.self.tab.dispatchMessage("getSettings");
    }())
});