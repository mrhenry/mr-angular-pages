'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

require('mr-util');

var _Api = require('./Api');

var _Page = require('./Page');

var _fdAngularCore = require('fd-angular-core');

var _preprocess = require('./preprocess');

(0, _fdAngularCore.beforeBoot)(awaitStates());

/**
PagesController holds all the Lalala pages. Include this state
to mount all the child pages.

@class PagesController
*/

var PagesController = (function () {
	function PagesController() {
		_classCallCheck(this, _PagesController);
	}

	var _PagesController = PagesController;
	PagesController = (0, _fdAngularCore.State)({
		abstract: true,
		template: '<ui-view></ui-view>'
	})(PagesController) || PagesController;
	return PagesController;
})();

exports.PagesController = PagesController;

function awaitStates() {
	return (0, _Api.fetchSummaries)().then(preprocess).then(buildStates).then(exportData);
}

function preprocess(data) {
	var q = [(0, _preprocess.runPreprocessors)(data.pages['/'])];

	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;

	try {
		for (var _iterator = data.i18n.locales[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
			var locale = _step.value;

			q.push((0, _preprocess.runPreprocessors)(data.pages['/' + locale]));
		}
	} catch (err) {
		_didIteratorError = true;
		_iteratorError = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion && _iterator['return']) {
				_iterator['return']();
			}
		} finally {
			if (_didIteratorError) {
				throw _iteratorError;
			}
		}
	}

	return Promise.all(q).then(function () {
		return data;
	});
}

function buildStates(data) {
	var keys = Object.keys(data.pages);
	var stateIndex = {},
	    metaIndex = {},
	    closestParentIndex = {};
	var ctrlMeta = (0, _fdAngularCore.Metadata)(PagesController);
	keys.sort();

	console.groupCollapsed('Pages');

	var _iteratorNormalCompletion2 = true;
	var _didIteratorError2 = false;
	var _iteratorError2 = undefined;

	try {
		for (var _iterator2 = keys[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
			var path = _step2.value;

			var page = data.pages[path];
			var type = lookupPageType.call(data, page.type);
			var meta = (0, _fdAngularCore.Metadata)(type);

			// find parent
			var idx = path.lastIndexOf('/');
			var parentPath = path.slice(0, idx);
			var childPath = path.slice(idx);
			if (parentPath === '') {
				parentPath = '/';
			}

			var parentState = stateIndex[parentPath];
			var parentMeta = metaIndex[parentPath];

			if (parentState && (meta.state.embed || parentMeta.state.embedChildren)) {
				var state = _Page.mountPage.call(type, page, childPath);
				stateIndex[path] = state;
				metaIndex[path] = meta;
				closestParentIndex[path] = parentPath;
				console.log('Page[%s] %o', path, page);
				parentState.children.push(state);
			} else if (closestParentIndex[parentPath]) {
				var closestParentPath = closestParentIndex[parentPath];
				parentState = stateIndex[closestParentPath];
				childPath = path.slice(closestParentPath.length);

				var state = _Page.mountPage.call(type, page, childPath);
				stateIndex[path] = state;
				metaIndex[path] = meta;

				closestParentIndex[path] = closestParentPath;
				console.log('Page[%s] %o', path, page);
				parentState.children.push(state);
			} else {
				var state = _Page.mountPage.call(type, page, path);
				stateIndex[path] = state;
				metaIndex[path] = meta;
				console.log('Page[%s] %o', path, page);
				ctrlMeta.state.children.push(state);
			}
		}
	} catch (err) {
		_didIteratorError2 = true;
		_iteratorError2 = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion2 && _iterator2['return']) {
				_iterator2['return']();
			}
		} finally {
			if (_didIteratorError2) {
				throw _iteratorError2;
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
var Roots = null;

exports.Roots = Roots;
/**
Root is the root pages according to the current locale.

@member Root
*/
var Root = null;

exports.Root = Root;
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
var I18n = null;

exports.I18n = I18n;
function exportData(data) {
	exports.I18n = I18n = data.i18n;
	exports.Root = Root = data.pages['/'];
	exports.Roots = Roots = {};

	var _iteratorNormalCompletion3 = true;
	var _didIteratorError3 = false;
	var _iteratorError3 = undefined;

	try {
		for (var _iterator3 = data.i18n.locales[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
			var locale = _step3.value;

			Roots[locale] = data.pages['/' + locale];
		}
	} catch (err) {
		_didIteratorError3 = true;
		_iteratorError3 = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion3 && _iterator3['return']) {
				_iterator3['return']();
			}
		} finally {
			if (_didIteratorError3) {
				throw _iteratorError3;
			}
		}
	}

	return data;
}

function lookupPageType(name) {
	var missing = [];
	var type = _Page.registeredPageTypes[name];

	while (!type) {
		missing.push(name);

		name = this.types[name];
		if (!name) {
			throw Error('Unknown page types: ' + missing.join(', '));
		}

		type = _Page.registeredPageTypes[name];
	}

	return type;
}
//# sourceMappingURL=States.js.map