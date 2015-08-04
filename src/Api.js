import {beforeBoot} from 'fd-angular-core';
import {I18n} from 'mr-angular-i18n';

let summariesPromise;

beforeBoot(fetchSummaries());

export function fetchSummaries() {
	if (summariesPromise) {
		return summariesPromise;
	}
	summariesPromise = Promise.all([
			fetch("/api/pages.json"),
			I18n.ready(),
		])
		.then(a => a[0])
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

	// localize
	let lpages = [];
	for (let locale of I18n.locales.concat(['$current'])) {
		let localeName = locale, inDefaultLocale = false;
		if (locale === '$current') {
			locale = I18n.current;
			inDefaultLocale = true;
		}

		for (let page of pages) {
			let clone = {};
			Object.assign(clone, page);
			clone.translations = undefined;
			clone.id = `${localeName}/${page.id}`;

			let localeTranslations, defaultTranslations;
			for (let t of page.translations) {
				if (t.locale === locale) {
					localeTranslations = t;
				}
				if (t.locale === I18n.default) {
					defaultTranslations = t;
				}
			}

			Object.assign(clone, defaultTranslations);
			for (let key of Object.keys(localeTranslations)) {
				let val = localeTranslations[key];
				if (!isBlank(val)) {
					clone[key] = val;
				}
			}

			clone.locale = locale;
			clone.inDefaultLocale = inDefaultLocale;
			if (isBlank(clone.long_title)) {
				/* eslint camelcase:0 */
				clone.long_title = clone.title;
			}

			if (page.parent_id) {
				clone.parent_id = `${localeName}/${page.parent_id}`;
			}

			pagesById[clone.id] = clone;
			lpages.push(clone);
		}
	}
	pages = lpages;

	// resolve parent pages
	for (let page of pages) {
		if (page.parent_id) {
			let parent = pagesById[page.parent_id];
			if (!parent.child_ids) {
				parent.child_ids = [];
			}
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
				if (child) {
					children.push(child);
				}
			}
			children.sort(positionSort);
			page.children = children;
		} else {
			page.children = [];
		}
	}

	// map by path
	let pagesByUnlocalisedPath = {};
	for (let page of roots) {
		let locale = page.locale,
				lprefix;

		if (page.inDefaultLocale) {
			locale = '$current';
			lprefix = '/';
		} else {
			lprefix = `${locale}`;
		}

		if (!pagesByUnlocalisedPath[locale]) {
			pagesByUnlocalisedPath[locale] = {};
		}

		makePath(page, `/`, lprefix, pagesByUnlocalisedPath[locale], pagesByPath);
	}

	return {
		types: data.types,
		pages: pagesByPath,
		lpages: pagesByUnlocalisedPath,
	};

	function makePath(page, prefix, lprefix, acc, lacc, root) {

		let slug = pageSlug(page);
		let path = pathJoin(prefix, slug);
		let lpath = pathJoin(lprefix, slug);

		if (!root) {
			root = page;
		}

		page.root = root;
		page.path = path;
		acc[path] = page;
		lacc[lpath] = page;

		for (let child of page.children) {
			makePath(child, path, lpath, acc, lacc, root);
		}
	}

	function positionSort(a, b) {
		let posa = (a.position || 0);
		let posb = (b.position || 0);
		return posa - posb;
	}

	function pageSlug(page) {
		if (typeof page.path_component === 'string') {
			return page.path_component;
		}
		if (typeof page.static_uuid === 'string') {
			return page.static_uuid;
		}
		return "";
	}

	function pathJoin(prefix, suffix) {
		if (suffix === '') {
			return prefix;
		}
		if (prefix === '/') {
			return `/${suffix}`;
		}
		return `${prefix}/${suffix}`;
	}

	function isBlank(val) {
		return val === undefined || val === null && val === '';
	}
}
