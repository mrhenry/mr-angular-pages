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
    .then(buildStates);
}

function buildStates(data) {
  for (let path of Object.keys(data.pages)) {
    let page = data.pages[path];
    let type = data::lookupPageType(page.type);
    let state = type::mountPage(page.id, path);
    states.push(state);
  }
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
