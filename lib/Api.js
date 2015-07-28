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
//# sourceMappingURL=Api.js.map