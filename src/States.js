import {fetchSummaries} from './Api';
import {registeredPageTypes, mountPage} from './Page';
import {beforeBoot, State, Metadata} from 'fd-angular-core';

beforeBoot(awaitStates());

@State({
  abstract: true,
  template: `<ui-view></ui-view>`
})
export class PagesController {}

function awaitStates() {
  return fetchSummaries()
    .then(buildStates)
    .then(exportData);
}

function buildStates(data) {
  let keys = Object.keys(data.pages);
  let stateIndex = {}, metaIndex = {};
  let ctrlMeta = Metadata(PagesController);
  keys.sort();

  for (let path of keys) {
    let page = data.pages[path];
    let type = data::lookupPageType(page.type);
    let meta = Metadata(type);

    // find parent
    let idx = path.lastIndexOf('/');
    let parentPath  = path.slice(0, idx);
    let childPath   = path.slice(idx);
    if (parentPath === '') parentPath = '/';
    let parentState = stateIndex[parentPath];
    let parentMeta  = metaIndex[parentPath];

    if (parentState && (meta.state.embed || parentMeta.state.embedChildren)) {
      let state = type::mountPage(page, childPath);
      stateIndex[path] = state;
      metaIndex[path] = meta;
      parentState.children.push(state);

    } else {
      let state = type::mountPage(page, path);
      stateIndex[path] = state;
      metaIndex[path] = meta;
      ctrlMeta.state.children.push(state);
    }

  }

  return data;
}

export var Roots = null;
export var Root  = null;
export var I18n  = null;

function exportData(data) {
  I18n  = data.i18n;
  Root  = data.pages["/"];
  Roots = {};

  for (let locale of data.i18n.locales) {
    Roots[locale] = data.pages["/"+locale];
  }

  return data;
}

function lookupPageType(name) {
  let missing = [];

  while (true) {
    let type = registeredPageTypes[name];
    if (type) return type;

    missing.push(name);

    name = this.types[name];
    if (!name) {
      throw Error("Unknown page types: "+missing.join(', '));
    }
  }
}
