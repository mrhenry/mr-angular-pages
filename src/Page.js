import {State, mountAt} from 'fd-angular-core';

export var registeredPageTypes = {};

const DEFAULT_SUFFIX = 'Page';

export function mountPage(page, url) {
  return {
    state:              this::mountAt(url),
    page:               page,
    name:               name,
    buildUiRouterState: builder,
  };

  function builder() {
    let state = buildUiRouterState(this.state);

    state.name = url;
    state.resolve.pageSummary = () => { return this.page; }
    state.resolve.pageId = () => { return this.page.id; }

    return state;
  }
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

    function wrappedConstructor(pageSummary, pageDetails, ...rest) {
      this::applyPageSummary(pageSummary);
      this::applyPageDetails(pageDetails);
      constructor.apply(this, rest);
    }
    wrappedConstructor = funcRename(funcName(constructor), wrappedConstructor);
    wrappedConstructor.$inject = ['pageSummary', 'pageDetails'].concat(constructor.$inject || []);
    wrappedConstructor.prototype = constructor.prototype;

    opts.resolve = { pageDetails: loadPageDetails };

    State(opts)(wrappedConstructor);
    registeredPageTypes[funcName(wrappedConstructor)] = wrappedConstructor;
  }

  function loadPageDetails($http, pageId) {
    return $http.get(`/api/pages/${pageId}.json`).then(x => x.data);
  }
  loadPageDetails.$inject = ['$http', 'pageId']

  function applyPageSummary(data) {
    this.$pageSummary = data;
    Object.assign(this, data);
  }

  function applyPageDetails(data) {
    this.$pageDetails = data;
    Object.assign(this, data);
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
