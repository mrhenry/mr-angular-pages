import {beforeBoot, State, Metadata, buildUiRouterState} from 'fd-angular-core';
import {I18n} from 'mr-angular-i18n';
import 'mr-util';
import {fetchSummaries} from './Api';
import {registeredPageTypes, mountPage} from './Page';
import {runPreprocessors} from './preprocess';

beforeBoot(awaitStates());

/**
PagesController holds all the Lalala pages. Include this state
to mount all the child pages.

@class PagesController
*/
@State({
	name:     'pages',
	abstract: true,
	hidden:   true,
	template: `<ui-view></ui-view>`,
})
class PagesContainerController {
}

let pages = {};

export function PagesController() {
	return {
		buildUiRouterState: builder,
	};

	function builder(options) {
		let state = buildUiRouterState(PagesContainerController, options);

		let children = [];
		if (options.locale === null) {
			children = pages.$current;
		} else {
			children = pages[options.locale];
		}

		state.children = children;
		return state;
	}
}

function awaitStates() {
	return fetchSummaries()
		.then(preprocess)
		.then(buildStates)
		.then(exportData);
}

function preprocess(data) {
	let q = [
		runPreprocessors(data.pages["/"]),
	];

	for (let locale of I18n.locales) {
		q.push(runPreprocessors(data.pages["/" + locale]));
	}

	return Promise.all(q).then(() => data);
}

function buildStates(data) {
	let keys = Object.keys(data.pages);
	let stateIndex = {}, metaIndex = {}, closestParentIndex = {};
	keys.sort();

	console.groupCollapsed("Pages");

	for (let path of keys) {
		let page = data.pages[path];
		let type = data::lookupPageType(page.type);
		let meta = Metadata(type);

		// find parent
		let idx = path.lastIndexOf('/');
		let parentPath = path.slice(0, idx);
		let childPath = path.slice(idx);
		if (parentPath === '') { parentPath = '/'; }

		let parentState = stateIndex[parentPath];
		let parentMeta = metaIndex[parentPath];

		if (parentState && (meta.state.embed || parentMeta.state.embedChildren)) {
			let state = type::mountPage(page, childPath, { name: path });
			stateIndex[path] = state;
			metaIndex[path] = meta;
			closestParentIndex[path] = parentPath;
			console.log("Page[%s] %o", path, page);
			parentState.children.push(state);

		} else if (closestParentIndex[parentPath]) {
			let closestParentPath = closestParentIndex[parentPath];
			parentState = stateIndex[closestParentPath];
			childPath = path.slice(closestParentPath.length);

			let state = type::mountPage(page, childPath, { name: path });
			stateIndex[path] = state;
			metaIndex[path] = meta;

			closestParentIndex[path] = closestParentPath;
			console.log("Page[%s] %o", path, page);
			parentState.children.push(state);

		} else {
			let state = type::mountPage(page, path, { name: path });
			stateIndex[path] = state;
			metaIndex[path] = meta;
			console.log("Page[%s] %o", path, page);

			if (page.inDefaultLocale) {
				if (!pages.$current) { pages.$current = []; }
				pages.$current.push(state);
			} else {
				if (!pages[page.locale]) { pages[page.locale] = []; }
				pages[page.locale].push(state);
			}
		}

	}

	console.groupEnd();

	return data;
}

/**
Roots is a map of all the root pages by their locale.

@member Roots
*/
export var Roots = null;

/**
Root is the root pages according to the current locale.

@member Root
*/
export var Root = null;


function exportData(data) {
	Root = data.pages["/"];
	Roots = {};

	for (let locale of I18n.locales) {
		Roots[locale] = data.pages["/" + locale];
	}

	return data;
}

function lookupPageType(name) {
	let missing = [];
	let type = registeredPageTypes[name];

	while (!type) {
		missing.push(name);

		name = this.types[name];
		if (!name) {
			throw Error("Unknown page types: " + missing.join(', '));
		}

		type = registeredPageTypes[name];
	}

	return type;
}
