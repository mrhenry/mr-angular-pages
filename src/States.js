import {fetchSummaries} from './Api';
import {registeredPageTypes, mountPage} from './Page';
import {beforeBoot, State} from 'fd-angular-core';

beforeBoot(awaitStates());

let states = [];

@State({
  abstract: true,
  children: states,
  template: `<ui-view></ui-view>`
})
export class PagesController {

  constructor () {
    console.log('[PagesController]', 'Constructor');
  }

  activate () {
    console.log('[PagesController]', 'Activate', true);
  }

  attach () {
    console.log('[PagesController]', 'Attach');
  }

  detach () {
    console.log('[PagesController]', 'Detach');
  }

}

function awaitStates() {
  return fetchSummaries()
    .then(buildStates)
    .then(exportData);
}

function buildStates(data) {
  let keys = Object.keys(data.pages);
  let stateIndex = {};
  keys.sort();

  for (let path of keys) {
    let page = data.pages[path];
    let type = data::lookupPageType(page.type);

    if (type.$$state.opts.asChild) {
      let idx = path.lastIndexOf('/');

      let parentPath = path.slice(0, idx);
      let childPath  = path.slice(idx);

      let state = type::mountPage(page, childPath);
      stateIndex[path] = state;

      let parent = stateIndex[parentPath];
      parent.$$state.state.childStates.push(state);

    } else {
      let state = type::mountPage(page, path);
      stateIndex[path] = state;
      states.push(state);
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
