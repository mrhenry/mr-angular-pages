(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.MrAngularPages = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
exports.fetchSummaries = fetchSummaries;

var _fdAngularCore = require('fd-angular-core');

var summariesPromise = undefined;

(0, _fdAngularCore.beforeBoot)(fetchSummaries());

function fetchSummaries() {
	if (summariesPromise) {
		return summariesPromise;
	}
	summariesPromise = fetch('/api/pages.json').then(status).then(json).then(makeTree);
	return summariesPromise;
}

function status(resp) {
	if (!resp.status === 200) {
		throw Error('Unexpected response status: ' + resp.status);
	}
	return resp;
}

function json(resp) {
	return resp.json();
}

function makeTree(data) {
	var pages = data.pages || [];
	var pagesById = {};
	var pagesByPath = {};
	var roots = [];

	if (navigator.language) {
		var locale = navigator.language.split('-')[0];
		if (!data.i18n.locales.indexOf(locale)) {
			locale = data.i18n['default'];
		}
		data.i18n.current = locale;
	}

	// localize
	var lpages = [];
	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;

	try {
		for (var _iterator = data.i18n.locales[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
			var locale = _step.value;
			var _iteratorNormalCompletion6 = true;
			var _didIteratorError6 = false;
			var _iteratorError6 = undefined;

			try {
				for (var _iterator6 = pages[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
					var page = _step6.value;

					var clone = {};
					Object.assign(clone, page);
					clone.translations = undefined;
					clone.id = locale + '/' + page.id;

					var localeTranslations = undefined,
					    defaultTranslations = undefined;
					var _iteratorNormalCompletion7 = true;
					var _didIteratorError7 = false;
					var _iteratorError7 = undefined;

					try {
						for (var _iterator7 = page.translations[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
							var t = _step7.value;

							if (t.locale === locale) {
								localeTranslations = t;
							}
							if (t.locale === data.i18n['default']) {
								defaultTranslations = t;
							}
						}
					} catch (err) {
						_didIteratorError7 = true;
						_iteratorError7 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion7 && _iterator7['return']) {
								_iterator7['return']();
							}
						} finally {
							if (_didIteratorError7) {
								throw _iteratorError7;
							}
						}
					}

					Object.assign(clone, defaultTranslations);
					var _iteratorNormalCompletion8 = true;
					var _didIteratorError8 = false;
					var _iteratorError8 = undefined;

					try {
						for (var _iterator8 = Object.keys(localeTranslations)[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
							var key = _step8.value;

							var val = localeTranslations[key];
							if (!isBlank(val)) {
								clone[key] = val;
							}
						}
					} catch (err) {
						_didIteratorError8 = true;
						_iteratorError8 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion8 && _iterator8['return']) {
								_iterator8['return']();
							}
						} finally {
							if (_didIteratorError8) {
								throw _iteratorError8;
							}
						}
					}

					clone.locale = locale;
					if (isBlank(clone.long_title)) {
						/* eslint camelcase:0 */
						clone.long_title = clone.title;
					}

					if (page.parent_id) {
						clone.parent_id = locale + '/' + page.parent_id;
					}

					pagesById[clone.id] = clone;
					lpages.push(clone);
				}
			} catch (err) {
				_didIteratorError6 = true;
				_iteratorError6 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion6 && _iterator6['return']) {
						_iterator6['return']();
					}
				} finally {
					if (_didIteratorError6) {
						throw _iteratorError6;
					}
				}
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

	pages = lpages;

	// resolve parent pages
	var _iteratorNormalCompletion2 = true;
	var _didIteratorError2 = false;
	var _iteratorError2 = undefined;

	try {
		for (var _iterator2 = pages[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
			var page = _step2.value;

			if (page.parent_id) {
				var _parent = pagesById[page.parent_id];
				if (!_parent.child_ids) {
					_parent.child_ids = [];
				}
				_parent.child_ids.push(page.id);
				page.parent = _parent;
			} else {
				roots.push(page);
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

	roots.sort(positionSort);

	// resolve child pages
	var _iteratorNormalCompletion3 = true;
	var _didIteratorError3 = false;
	var _iteratorError3 = undefined;

	try {
		for (var _iterator3 = pages[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
			var page = _step3.value;

			if (page.child_ids) {
				var children = [];
				var _iteratorNormalCompletion9 = true;
				var _didIteratorError9 = false;
				var _iteratorError9 = undefined;

				try {
					for (var _iterator9 = page.child_ids[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
						var id = _step9.value;

						var child = pagesById[id];
						if (child) {
							children.push(child);
						}
					}
				} catch (err) {
					_didIteratorError9 = true;
					_iteratorError9 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion9 && _iterator9['return']) {
							_iterator9['return']();
						}
					} finally {
						if (_didIteratorError9) {
							throw _iteratorError9;
						}
					}
				}

				children.sort(positionSort);
				page.children = children;
			} else {
				page.children = [];
			}
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

	// map by path
	var _iteratorNormalCompletion4 = true;
	var _didIteratorError4 = false;
	var _iteratorError4 = undefined;

	try {
		for (var _iterator4 = roots[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
			var page = _step4.value;

			makePath(page, '/' + page.locale, pagesByPath);
			if (page.locale === data.i18n.current) {
				makePath(page, '/', pagesByPath);
			}
		}
	} catch (err) {
		_didIteratorError4 = true;
		_iteratorError4 = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion4 && _iterator4['return']) {
				_iterator4['return']();
			}
		} finally {
			if (_didIteratorError4) {
				throw _iteratorError4;
			}
		}
	}

	return {
		types: data.types,
		i18n: data.i18n,
		pages: pagesByPath
	};

	function makePath(page, prefix, acc, root) {

		var slug = pageSlug(page);
		var path = pathJoin(prefix, slug);

		if (!root) {
			root = page;
		}

		page.root = root;
		page.path = path;
		acc[path] = page;

		var _iteratorNormalCompletion5 = true;
		var _didIteratorError5 = false;
		var _iteratorError5 = undefined;

		try {
			for (var _iterator5 = page.children[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
				var child = _step5.value;

				makePath(child, path, acc, root);
			}
		} catch (err) {
			_didIteratorError5 = true;
			_iteratorError5 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion5 && _iterator5['return']) {
					_iterator5['return']();
				}
			} finally {
				if (_didIteratorError5) {
					throw _iteratorError5;
				}
			}
		}
	}

	function positionSort(a, b) {
		var posa = a.position || 0;
		var posb = b.position || 0;
		return posa - posb;
	}

	function pageSlug(page) {
		if (typeof page.path_component === 'string') {
			return page.path_component;
		}
		if (typeof page.static_uuid === 'string') {
			return page.static_uuid;
		}
		return '';
	}

	function pathJoin(prefix, suffix) {
		if (suffix === '') {
			return prefix;
		}
		if (prefix === '/') {
			return '/' + suffix;
		}
		return prefix + '/' + suffix;
	}

	function isBlank(val) {
		return val === undefined || val === null && val === '';
	}
}

},{"fd-angular-core":undefined}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
exports.mountPage = mountPage;
exports.Page = Page;

var _fdAngularCore = require('fd-angular-core');

var registeredPageTypes = {};

exports.registeredPageTypes = registeredPageTypes;
var DEFAULT_SUFFIX = 'Page';

function mountPage(page, url) {
	var opts = arguments[2] === undefined ? {} : arguments[2];
	var name = opts.name;

	return {
		state: _fdAngularCore.mountAt.call(this, url, { name: name || url }),
		page: page,
		children: [],
		buildUiRouterState: builder
	};

	function builder() {
		var _this = this;

		var state = (0, _fdAngularCore.buildUiRouterState)(this.state);

		state.resolve.pageSummary = function () {
			return _this.page;
		};
		state.resolve.pageId = function () {
			return _this.page.id;
		};

		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = this.children[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var child = _step.value;

				state.children.push((0, _fdAngularCore.buildUiRouterState)(child));
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

		return state;
	}
}

function Page() {
	var opts = arguments[0] === undefined ? {} : arguments[0];

	if (opts.url) {
		throw '@Page({ url }) is not supported';
	}
	if (opts.resolve) {
		throw '@Page({ resolve }) is not supported';
	}

	if (opts.asChild !== undefined) {
		console.warn('@Page({ asChild }) is depricated use @Page({ embed }) instead.');
		opts.embed = opts.asChild;
	}

	function register(constructor) {
		var meta = (0, _fdAngularCore.Metadata)(constructor);

		var name = opts.name;
		if (!name) {
			name = meta.name;
			name = name[0].toLowerCase() + name.substr(1, name.length - DEFAULT_SUFFIX.length - 1);
			opts.name = name;
		}

		constructor = (0, _fdAngularCore.State)(opts)(constructor) || constructor;

		var pageConstructor = function pageConstructor(pageSummary, pageDetails) {
			applyPageSummary.call(this, pageSummary);
			applyPageDetails.call(this, pageDetails);

			for (var _len = arguments.length, rest = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
				rest[_key - 2] = arguments[_key];
			}

			constructor.apply(this, rest);
		};
		pageConstructor = meta.wrap(pageConstructor);
		pageConstructor.$inject = ['pageSummary', 'pageDetails'].concat(constructor.$inject || []);

		var superMeta = (0, _fdAngularCore.Metadata)(meta.superClass) || { state: {} };

		if (opts.embed === true || opts.embed === false) {
			meta.state.embed = opts.embed;
		} else {
			meta.state.embed = superMeta.state.embed || false;
		}

		if (opts.embedChildren === true || opts.embedChildren === false) {
			meta.state.embedChildren = opts.embedChildren;
		} else {
			meta.state.embedChildren = superMeta.state.embedChildren || false;
		}

		meta.state.resolve.pageDetails = loadPageDetails;
		meta.state.resolve.pageSummary = function () {};
		meta.state.resolve.pageId = function () {};

		registeredPageTypes[meta.name] = pageConstructor;
		return constructor;
	}

	function loadPageDetails($http, pageId) {
		return $http.get('/api/pages/' + pageId + '.json').then(function (x) {
			return x.data;
		});
	}
	loadPageDetails.$inject = ['$http', 'pageId'];

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

},{"fd-angular-core":undefined}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _Api = require('./Api');

var _Page = require('./Page');

var _fdAngularCore = require('fd-angular-core');

var _preprocess = require('./preprocess');

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

},{"./Api":1,"./Page":2,"./preprocess":5,"fd-angular-core":undefined}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

require('./Api');

var _States = require('./States');

Object.defineProperty(exports, 'PagesController', {
  enumerable: true,
  get: function get() {
    return _States.PagesController;
  }
});
Object.defineProperty(exports, 'Roots', {
  enumerable: true,
  get: function get() {
    return _States.Roots;
  }
});
Object.defineProperty(exports, 'Root', {
  enumerable: true,
  get: function get() {
    return _States.Root;
  }
});
Object.defineProperty(exports, 'I18n', {
  enumerable: true,
  get: function get() {
    return _States.I18n;
  }
});

var _Page = require('./Page');

Object.defineProperty(exports, 'Page', {
  enumerable: true,
  get: function get() {
    return _Page.Page;
  }
});

var _query = require('./query');

var _pq = _interopRequireWildcard(_query);

exports.pq = _pq;

var _preprocess = require('./preprocess');

Object.defineProperty(exports, 'preprocess', {
  enumerable: true,
  get: function get() {
    return _preprocess.preprocess;
  }
});

},{"./Api":1,"./Page":2,"./States":3,"./preprocess":5,"./query":6}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
exports.preprocess = preprocess;
exports.runPreprocessors = runPreprocessors;

var _query = require('./query');

var preprocessors = [];

function preprocess(func) {
	preprocessors.push(func);
}

function runPreprocessors(root) {
	return seq.call(root, preprocessors);
}

// Run functions returning promises sequentialy
function seq(funcs) {
	var idx = arguments[1] === undefined ? 0 : arguments[1];

	var target = this;
	if (!target.then) {
		target = Promise.resolve(target);
	}

	if (idx < funcs.length) {
		var _context;

		return (_context = target.then(funcs[idx]), seq).call(_context, funcs, idx + 1);
	}

	return target;
}

preprocess(function addDepthToPages(root) {
	return _query.visit.call(root, function (page) {
		if (page.parent) {
			page.depth = page.parent.depth + 1;
		} else {
			page.depth = 0;
		}
	});
});

},{"./query":6}],6:[function(require,module,exports){


/**
@param {Function} func - func is called with each page in the tree
*/
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.visit = visit;
exports.find = find;
exports.findFirst = findFirst;

function visit(func) {
	var _this = this;

	var p = new Promise(function (resolve, reject) {
		try {
			resolve(func(_this));
		} catch (e) {
			reject(e);
		}
	});

	p = p.then(function (r) {
		if (r === false) {
			return r;
		}
		if (!_this.children) {
			return r;
		}

		var all = [];

		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = _this.children[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var child = _step.value;

				all.push(visit.call(child, func));
			}
		} catch (err) {
			_didIteratorError = true;
			_iteratorError = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion && _iterator["return"]) {
					_iterator["return"]();
				}
			} finally {
				if (_didIteratorError) {
					throw _iteratorError;
				}
			}
		}

		return Promise.all(all);
	});

	return p.then(function () {
		return _this;
	});
}

/**
 * @param {Object} query
 * @param {Integer} query.limit
 * @param {String} query.type
 */

function find(query) {
	var acc = arguments[1] === undefined ? [] : arguments[1];

	if (this.$pageSummary) {
		var _context;

		return (_context = this.$pageSummary, find).call(_context, query, acc);
	}

	if (!query) {
		return acc;
	}

	if (query.limit && acc.length >= query.limit) {
		return acc;
	}

	if (query.type && query.type !== this.type) {
		return findInChildren.call(this, query, acc);
	}

	acc.push(this);
	return findInChildren.call(this, query, acc);
}

/**
 * @param {Object} query
 * @param {String} query.type
 */

function findFirst(query) {

	if (!query) {
		return null;
	}

	query.limit = 1;
	var res = find.call(this, query);

	return res[0] || null;
}

function findInChildren(query, acc) {
	if (!this.children) {
		return acc;
	}

	var _iteratorNormalCompletion2 = true;
	var _didIteratorError2 = false;
	var _iteratorError2 = undefined;

	try {
		for (var _iterator2 = this.children[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
			var child = _step2.value;

			acc = find.call(child, query, acc);
		}
	} catch (err) {
		_didIteratorError2 = true;
		_iteratorError2 = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion2 && _iterator2["return"]) {
				_iterator2["return"]();
			}
		} finally {
			if (_didIteratorError2) {
				throw _iteratorError2;
			}
		}
	}

	return acc;
}

},{}]},{},[4])(4)
});
//# sourceMappingURL=mr-angular-pages.js.map
