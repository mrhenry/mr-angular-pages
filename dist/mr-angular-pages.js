(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.MrAngularPages = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.fetchSummaries = fetchSummaries;

var _fdAngularCore = require('fd-angular-core');

var summariesPromise = undefined;

(0, _fdAngularCore.beforeBoot)(fetchSummaries());

function fetchSummaries() {
  if (summariesPromise) return summariesPromise;
  summariesPromise = fetch('/api/pages.json').then(status).then(json).then(makeTree);
  return summariesPromise;
}

function status(resp) {
  if (!resp.status === 200) {
    throw Error('Unexpected response status: ' + resp.status);
  }
  return resp;
}

function json(resp) {
  return resp.json();
}

function makeTree(data) {
  var pages = data.pages || [];
  var pagesById = {};
  var pagesByPath = {};
  var roots = [];

  if (navigator.language) {
    var locale = navigator.language.split('-')[0];
    if (!data.i18n.locales.indexOf(locale)) {
      locale = data.i18n['default'];
    }
    data.i18n.current = locale;
  }

  // localize
  var lpages = [];
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = data.i18n.locales[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var locale = _step.value;
      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {
        for (var _iterator6 = pages[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          var page = _step6.value;

          _page = Object.create(page, {});
          _page.translations = undefined;
          _page.id = locale + '/' + page.id;

          var translations = undefined;
          var _iteratorNormalCompletion7 = true;
          var _didIteratorError7 = false;
          var _iteratorError7 = undefined;

          try {
            for (var _iterator7 = page.translations[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
              var t = _step7.value;

              if (t.locale == locale) {
                translations = t;
                break;
              }
              if (t.locale == data.i18n['default']) {
                translations = t;
              }
            }
          } catch (err) {
            _didIteratorError7 = true;
            _iteratorError7 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion7 && _iterator7['return']) {
                _iterator7['return']();
              }
            } finally {
              if (_didIteratorError7) {
                throw _iteratorError7;
              }
            }
          }

          var _iteratorNormalCompletion8 = true;
          var _didIteratorError8 = false;
          var _iteratorError8 = undefined;

          try {
            for (var _iterator8 = Object.keys(translations)[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
              var key = _step8.value;

              _page[key] = translations[key];
            }
          } catch (err) {
            _didIteratorError8 = true;
            _iteratorError8 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion8 && _iterator8['return']) {
                _iterator8['return']();
              }
            } finally {
              if (_didIteratorError8) {
                throw _iteratorError8;
              }
            }
          }

          _page.locale = locale;

          if (page.parent_id) {
            _page.parent_id = locale + '/' + page.parent_id;
          }

          pagesById[_page.id] = _page;
          lpages.push(_page);
        }
      } catch (err) {
        _didIteratorError6 = true;
        _iteratorError6 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion6 && _iterator6['return']) {
            _iterator6['return']();
          }
        } finally {
          if (_didIteratorError6) {
            throw _iteratorError6;
          }
        }
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator['return']) {
        _iterator['return']();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  pages = lpages;

  // resolve parent pages
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = pages[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var page = _step2.value;

      if (page.parent_id) {
        var _parent = pagesById[page.parent_id];
        if (!_parent.child_ids) _parent.child_ids = [];
        _parent.child_ids.push(page.id);
        page.parent = _parent;
      } else {
        roots.push(page);
      }
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2['return']) {
        _iterator2['return']();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  roots.sort(positionSort);

  // resolve child pages
  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = pages[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var page = _step3.value;

      if (page.child_ids) {
        var children = [];
        var _iteratorNormalCompletion9 = true;
        var _didIteratorError9 = false;
        var _iteratorError9 = undefined;

        try {
          for (var _iterator9 = page.child_ids[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
            var id = _step9.value;

            var child = pagesById[id];
            if (child) children.push(child);
          }
        } catch (err) {
          _didIteratorError9 = true;
          _iteratorError9 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion9 && _iterator9['return']) {
              _iterator9['return']();
            }
          } finally {
            if (_didIteratorError9) {
              throw _iteratorError9;
            }
          }
        }

        children.sort(positionSort);
        page.children = children;
      } else {
        page.children = [];
      }
    }
  } catch (err) {
    _didIteratorError3 = true;
    _iteratorError3 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion3 && _iterator3['return']) {
        _iterator3['return']();
      }
    } finally {
      if (_didIteratorError3) {
        throw _iteratorError3;
      }
    }
  }

  // map by path
  var _iteratorNormalCompletion4 = true;
  var _didIteratorError4 = false;
  var _iteratorError4 = undefined;

  try {
    for (var _iterator4 = roots[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
      var page = _step4.value;

      makePath(page, '/' + page.locale, pagesByPath);
      if (page.locale === data.i18n.current) {
        makePath(page, '/', pagesByPath);
      }
    }
  } catch (err) {
    _didIteratorError4 = true;
    _iteratorError4 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion4 && _iterator4['return']) {
        _iterator4['return']();
      }
    } finally {
      if (_didIteratorError4) {
        throw _iteratorError4;
      }
    }
  }

  return {
    types: data.types,
    i18n: data.i18n,
    pages: pagesByPath
  };

  function makePath(page, prefix, acc) {
    var path = page.path_component == '' ? prefix : prefix == '/' ? '/' + page.path_component : prefix + '/' + page.path_component;

    acc[path] = page;

    var _iteratorNormalCompletion5 = true;
    var _didIteratorError5 = false;
    var _iteratorError5 = undefined;

    try {
      for (var _iterator5 = page.children[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
        var child = _step5.value;

        makePath(child, path, acc);
      }
    } catch (err) {
      _didIteratorError5 = true;
      _iteratorError5 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion5 && _iterator5['return']) {
          _iterator5['return']();
        }
      } finally {
        if (_didIteratorError5) {
          throw _iteratorError5;
        }
      }
    }
  }

  function positionSort(a, b) {
    var posa = a.position || 0;
    var posb = b.position || 0;
    return posa - posb;
  }
}

},{"fd-angular-core":undefined}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.mountPage = mountPage;
exports.Page = Page;

var _fdAngularCore = require('fd-angular-core');

var registeredPageTypes = {};

exports.registeredPageTypes = registeredPageTypes;
var DEFAULT_SUFFIX = 'Page';

function mountPage(pageId, url) {
  var _this = _fdAngularCore.mountAt.call(this, url);

  var resolve = Object.assign({}, _this.$$state.state.resolve);
  _this.$$state.state.resolve = resolve;
  _this.$$state.state.name = url;

  resolve.pageId = function resolvePageId() {
    return pageId;
  };

  return _this;
}

function Page(opts) {
  if (opts.url) {
    throw '@Page({ url }) is not supported';
  }
  if (opts.abstract) {
    throw '@Page({ abstract }) is not supported';
  }
  if (opts.resolve) {
    throw '@Page({ resolve }) is not supported';
  }

  function register(constructor) {

    var name = opts.name;
    if (!name) {
      name = funcName(constructor);
      name = name[0].toLowerCase() + name.substr(1, name.length - DEFAULT_SUFFIX.length - 1);
      opts.name = name;
    }

    function wrappedConstructor(pageDetails) {
      applyPageDetails.call(this, pageDetails);

      for (var _len = arguments.length, rest = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        rest[_key - 1] = arguments[_key];
      }

      constructor.apply(this, rest);
    }
    wrappedConstructor = funcRename(funcName(constructor), wrappedConstructor);
    wrappedConstructor.$inject = ['pageDetails'].concat(constructor.$inject || []);
    wrappedConstructor.prototype = constructor.prototype;

    opts.resolve = { pageDetails: loadPageDetails };

    (0, _fdAngularCore.State)(opts)(wrappedConstructor);
    registeredPageTypes[funcName(wrappedConstructor)] = wrappedConstructor;
  }

  function loadPageDetails($http, pageId) {
    return $http.get('/api/pages/' + pageId + '.json').then(function (x) {
      return x.data;
    });
  }
  loadPageDetails.$inject = ['$http', 'pageId'];

  function applyPageDetails(data) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = Object.keys(data)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var key = _step.value;

        this[key] = data[key];
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator['return']) {
          _iterator['return']();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  }

  return register;
}

function funcName(f) {
  var name = f && f.name || null;

  if (name === null) {
    name = f.toString().match(/^function\s*([^\s(]+)/)[1];
  }

  return name;
}

function funcRename(name, fn) {
  return new Function('return function (call) { return function ' + name + ' () { return call(this, arguments) }; };')()(Function.apply.bind(fn));
}

},{"fd-angular-core":undefined}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _Api = require('./Api');

var _Page = require('./Page');

var _fdAngularCore = require('fd-angular-core');

(0, _fdAngularCore.beforeBoot)(awaitStates());

var states = [];

var PagesController = (function () {
  function PagesController() {
    _classCallCheck(this, _PagesController);

    console.log('[PagesController]', 'Constructor');
  }

  var _PagesController = PagesController;

  _createClass(_PagesController, [{
    key: 'activate',
    value: function activate() {
      console.log('[PagesController]', 'Activate', true);
    }
  }, {
    key: 'attach',
    value: function attach() {
      console.log('[PagesController]', 'Attach');
    }
  }, {
    key: 'detach',
    value: function detach() {
      console.log('[PagesController]', 'Detach');
    }
  }]);

  PagesController = (0, _fdAngularCore.State)({
    abstract: true,
    children: states,
    template: '<ui-view></ui-view>'
  })(PagesController) || PagesController;
  return PagesController;
})();

exports.PagesController = PagesController;

function awaitStates() {
  return (0, _Api.fetchSummaries)().then(buildStates);
}

function buildStates(data) {
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = Object.keys(data.pages)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var path = _step.value;

      var page = data.pages[path];
      var type = lookupPageType.call(data, page.type);
      var state = _Page.mountPage.call(type, page.id, path);
      states.push(state);
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator['return']) {
        _iterator['return']();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
}

function lookupPageType(name) {
  var missing = [];

  while (true) {
    var type = _Page.registeredPageTypes[name];
    if (type) return type;

    missing.push(name);

    name = this.types[name];
    if (!name) {
      throw Error('Unknown page types: ' + missing.join(', '));
    }
  }
}

},{"./Api":1,"./Page":2,"fd-angular-core":undefined}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

require('./Api');

var _States = require('./States');

Object.defineProperty(exports, 'PagesController', {
  enumerable: true,
  get: function get() {
    return _States.PagesController;
  }
});

var _Page = require('./Page');

Object.defineProperty(exports, 'Page', {
  enumerable: true,
  get: function get() {
    return _Page.Page;
  }
});

},{"./Api":1,"./Page":2,"./States":3}]},{},[4])(4)
});
//# sourceMappingURL=mr-angular-pages.js.map
