import {State, mountAt} from 'fd-angular-core';

export var registeredPageTypes = {};

const DEFAULT_SUFFIX = 'Page';

export function mountPage(pageId, url) {
  let _this = this::mountAt(url);

  let resolve = Object.assign({}, _this.$$state.state.resolve);
  _this.$$state.state.resolve = resolve;
  _this.$$state.state.name = url;

  resolve.pageId = function resolvePageId() { return pageId; };

  return _this;
}

export function Page(opts) {
  if (opts.url) { throw "@Page({ url }) is not supported"; }
  if (opts.abstract) { throw "@Page({ abstract }) is not supported"; }
  if (opts.resolve) { throw "@Page({ resolve }) is not supported"; }

  function register(constructor) {

    let name = opts.name;
    if (!name) {
      name = funcName(constructor);
      name = name[0].toLowerCase() + name.substr(1, name.length - DEFAULT_SUFFIX.length - 1);
      opts.name = name;
    }

    function wrappedConstructor(pageDetails, ...rest) {
      this::applyPageDetails(pageDetails);
      constructor.apply(this, rest);
    }
    wrappedConstructor = funcRename(funcName(constructor), wrappedConstructor);
    wrappedConstructor.$inject = ['pageDetails'].concat(constructor.$inject || []);
    wrappedConstructor.prototype = constructor.prototype;

    opts.resolve = { pageDetails: loadPageDetails };

    State(opts)(wrappedConstructor);
    registeredPageTypes[funcName(wrappedConstructor)] = wrappedConstructor;
  }

  function loadPageDetails($http, pageId) {
    return $http.get(`/api/pages/${pageId}.json`).then(x => x.data);
  }
  loadPageDetails.$inject = ['$http', 'pageId']

  function applyPageDetails(data) {
    for (let key of Object.keys(data)) {
      this[key] = data[key];
    }
  }

  return register;
}

function funcName(f) {
  let name = ((f && f.name) || null);

  if (name === null) {
    name = f.toString().match(/^function\s*([^\s(]+)/)[1];
  }

  return name;
}

function funcRename(name, fn) {
    return (new Function("return function (call) { return function " + name +
        " () { return call(this, arguments) }; };")())(Function.apply.bind(fn));
}
