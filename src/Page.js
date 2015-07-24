import {State, mountAt, Metadata, buildUiRouterState} from 'fd-angular-core';

export var registeredPageTypes = {};

const DEFAULT_SUFFIX = 'Page';

export function mountPage(page, url, opts={}) {
  let {name} = opts;

  return {
    state:              this::mountAt(url, { name: (name || url) }),
    page:               page,
    children:           [],
    buildUiRouterState: builder,
  };

  function builder() {
    let state = buildUiRouterState(this.state);

    state.resolve.pageSummary = () => { return this.page; };
    state.resolve.pageId = () => { return this.page.id; };

    for (let child of this.children) {
      state.children.push(buildUiRouterState(child));
    }

    console.log("Page[%s] %o", state.name, state);
    return state;
  }
}

export function Page(opts={}) {
  if (opts.url) { throw "@Page({ url }) is not supported"; }
  if (opts.resolve) { throw "@Page({ resolve }) is not supported"; }

  if (opts.asChild !== undefined) {
    console.warn("@Page({ asChild }) is depricated use @Page({ embed }) instead.");
    opts.embed = opts.asChild;
  }

  function register(constructor) {
    let meta = Metadata(constructor);

    let name = opts.name;
    if (!name) {
      name = meta.name;
      name = name[0].toLowerCase() + name.substr(1, name.length - DEFAULT_SUFFIX.length - 1);
      opts.name = name;
    }

    constructor = State(opts)(constructor) || constructor;

    function pageConstructor(pageSummary, pageDetails, ...rest) {
      this::applyPageSummary(pageSummary);
      this::applyPageDetails(pageDetails);
      constructor.apply(this, rest);
    }
    pageConstructor = meta.wrap(pageConstructor);
    pageConstructor.$inject = ['pageSummary', 'pageDetails'].concat(constructor.$inject || []);

    let superMeta = Metadata(meta.superClass) || { state: {} };

    if (opts.embed === true || opts.embed === false) {
      meta.state.embed = opts.embed;
    } else {
      meta.state.embed = (superMeta.state.embed || false);
    }

    if (opts.embedChildren === true || opts.embedChildren === false) {
      meta.state.embedChildren = opts.embedChildren;
    } else {
      meta.state.embedChildren = (superMeta.state.embedChildren || false);
    }

    meta.state.resolve.pageDetails = loadPageDetails;
    meta.state.resolve.pageSummary = () => {};
    meta.state.resolve.pageId = () => {};

    registeredPageTypes[meta.name] = pageConstructor;
    return constructor;
  }

  function loadPageDetails($http, pageId) {
    return $http.get(`/api/pages/${pageId}.json`).then(x => x.data);
  }
  loadPageDetails.$inject = ['$http', 'pageId']

  function applyPageSummary(data) {
    this.$pageSummary = data;
    Object.assign(this, data);
    this.type = data.type;
  }

  function applyPageDetails(data) {
    this.$pageDetails = data;
    Object.assign(this, data);
  }

  return register;
}
