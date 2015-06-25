import {beforeBoot} from 'fd-angular-core';

let summariesPromise;

beforeBoot(fetchSummaries());

export function fetchSummaries() {
  if (summariesPromise) return summariesPromise;
  summariesPromise = fetch("/api/pages.json")
    .then(status)
    .then(json)
    .then(makeTree);
  return summariesPromise;
}

function status(resp) {
  if (!resp.status === 200) {
    throw Error(`Unexpected response status: ${resp.status}`);
  }
  return resp;
}

function json(resp) {
  return resp.json();
}

function makeTree(data) {
  let pages = (data.pages || []);
  let pagesById = {};
  let pagesByPath = {};
  let roots = [];

  if (navigator.language) {
    let locale = navigator.language.split('-')[0];
    if (!data.i18n.locales.indexOf(locale)) {
      locale = data.i18n.default;
    }
    data.i18n.current = locale;
  }

  // localize
  let lpages = [];
  for (let locale of data.i18n.locales) {
    for (let page of pages) {
      _page = Object.create(page, {});
      _page.translations = undefined;
      _page.id = `${locale}/${page.id}`;

      let translations;
      for (let t of page.translations) {
        if (t.locale == locale) {
          translations = t;
          break;
        }
        if (t.locale == data.i18n.default) {
          translations = t;
        }
      }
      for (let key of Object.keys(translations)) {
        _page[key] = translations[key];
      }
      _page.locale = locale;

      if (page.parent_id) {
        _page.parent_id = `${locale}/${page.parent_id}`;
      }

      pagesById[_page.id] = _page;
      lpages.push(_page);
    }
  }
  pages = lpages;

  // resolve parent pages
  for (let page of pages) {
    if (page.parent_id) {
      let parent = pagesById[page.parent_id];
      if (!parent.child_ids) parent.child_ids = [];
      parent.child_ids.push(page.id);
      page.parent = parent;
    } else {
      roots.push(page);
    }
  }
  roots.sort(positionSort);

  // resolve child pages
  for (let page of pages) {
    if (page.child_ids) {
      let children = [];
      for (let id of page.child_ids) {
        let child = pagesById[id];
        if (child) children.push(child);
      }
      children.sort(positionSort);
      page.children = children;
    } else {
      page.children = [];
    }
  }

  // map by path
  for (let page of roots) {
    makePath(page, `/${page.locale}`, pagesByPath);
    if (page.locale === data.i18n.current) {
      makePath(page, `/`, pagesByPath);
    }
  }

  return {
    types: data.types,
    i18n:  data.i18n,
    pages: pagesByPath,
  };

  function makePath(page, prefix, acc, root) {
    let path = page.path_component == '' ? prefix :
               prefix == '/'             ? `/${page.path_component}` :
               `${prefix}/${page.path_component}`;

    if (!root) root = page;

    page.root = root;
    page.path = path;
    acc[path] = page;

    for (let child of page.children) {
      makePath(child, path, acc, root);
    }
  }

  function positionSort(a, b) {
    let posa = (a.position || 0);
    let posb = (b.position || 0);
    return posa - posb;
  }
}
