import 'mr-util';
import {fetchSummaries} from './Api';
import {registeredPageTypes, mountPage} from './Page';
import {beforeBoot, State, Metadata} from 'fd-angular-core';
import {runPreprocessors} from './preprocess';

beforeBoot(awaitStates);

/**
PagesController holds all the Lalala pages. Include this state
to mount all the child pages.

@class PagesController
*/
@State({
	abstract: true,
	template: `<ui-view></ui-view>`,
})
export class PagesController {}

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

	for (let locale of data.i18n.locales) {
		q.push(runPreprocessors(data.pages["/" + locale]));
	}

	return Promise.all(q).then(() => data);
}

function buildStates(data) {
	let keys = Object.keys(data.pages);
	let stateIndex = {}, metaIndex = {}, closestParentIndex = {};
	let ctrlMeta = Metadata(PagesController);
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
			let state = type::mountPage(page, childPath);
			stateIndex[path] = state;
			metaIndex[path] = meta;
			closestParentIndex[path] = parentPath;
			console.log("Page[%s] %o", path, page);
			parentState.children.push(state);

		} else if (closestParentIndex[parentPath]) {
			let closestParentPath = closestParentIndex[parentPath];
			parentState = stateIndex[closestParentPath];
			childPath = path.slice(closestParentPath.length);

			let state = type::mountPage(page, childPath);
			stateIndex[path] = state;
			metaIndex[path] = meta;

			closestParentIndex[path] = closestParentPath;
			console.log("Page[%s] %o", path, page);
			parentState.children.push(state);

		} else {
			let state = type::mountPage(page, path);
			stateIndex[path] = state;
			metaIndex[path] = meta;
			console.log("Page[%s] %o", path, page);
			ctrlMeta.state.children.push(state);
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

/**
I18n holds information about the available locales.

@namespace I18n
*/
/**
@var {string} current
@memberof I18n
*/
/**
@var {string} default
@memberof I18n
*/
/**
@var {string[]} locales
@memberof I18n
*/
export var I18n = null;

function exportData(data) {
	I18n = data.i18n;
	Root = data.pages["/"];
	Roots = {};

	for (let locale of data.i18n.locales) {
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
