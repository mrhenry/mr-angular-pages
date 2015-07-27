'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _Api = require('./Api');

var _Page = require('./Page');

var _fdAngularCore = require('fd-angular-core');

(0, _fdAngularCore.beforeBoot)(awaitStates());

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
	return (0, _Api.fetchSummaries)().then(buildStates).then(exportData);
}

function buildStates(data) {
	var keys = Object.keys(data.pages);
	var stateIndex = {},
	    metaIndex = {},
	    closestParentIndex = {};
	var ctrlMeta = (0, _fdAngularCore.Metadata)(PagesController);
	keys.sort();

	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;

	try {
		for (var _iterator = keys[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
			var path = _step.value;

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
				console.log('Page[%s] %o', path, state);
				parentState.children.push(state);
			} else if (closestParentIndex[parentPath]) {
				var closestParentPath = closestParentIndex[parentPath];
				parentState = stateIndex[closestParentPath];
				childPath = path.slice(closestParentPath.length);

				var state = _Page.mountPage.call(type, page, childPath);
				stateIndex[path] = state;
				metaIndex[path] = meta;

				closestParentIndex[path] = closestParentPath;
				console.log('Page[%s] %o', path, state);
				parentState.children.push(state);
			} else {
				var state = _Page.mountPage.call(type, page, path);
				stateIndex[path] = state;
				metaIndex[path] = meta;
				console.log('Page[%s] %o', path, state);
				ctrlMeta.state.children.push(state);
			}
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

	return data;
}

var Roots = null;
exports.Roots = Roots;
var Root = null;
exports.Root = Root;
var I18n = null;

exports.I18n = I18n;
function exportData(data) {
	exports.I18n = I18n = data.i18n;
	exports.Root = Root = data.pages['/'];
	exports.Roots = Roots = {};

	var _iteratorNormalCompletion2 = true;
	var _didIteratorError2 = false;
	var _iteratorError2 = undefined;

	try {
		for (var _iterator2 = data.i18n.locales[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
			var locale = _step2.value;

			Roots[locale] = data.pages['/' + locale];
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

	return data;
}

function lookupPageType(name) {
	var missing = [];

	while (true) {
		var type = _Page.registeredPageTypes[name];
		if (type) {
			return type;
		}

		missing.push(name);

		name = this.types[name];
		if (!name) {
			throw Error('Unknown page types: ' + missing.join(', '));
		}
	}
}
//# sourceMappingURL=States.js.map