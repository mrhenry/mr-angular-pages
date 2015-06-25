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
//# sourceMappingURL=Page.js.map