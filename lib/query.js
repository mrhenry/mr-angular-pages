

/**
PQ is a simple library for dealing with a page tree.

@namespace pq
*/

/**
Visit all the child pages.

@function visit
@memberof pq
@param {visitCallback} func - func is called with each page in the tree
@returns {Promise}
*/
/**
@callback visitCallback
@param {Object} page
@returns {(Promise|false|undefined)}
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
Find all pages matching a query.

@function find
@memberof pq

@param {Object} query
@param {Integer} query.limit
@param {String} query.type
@returns {Object[]}
*/

function find(query) {
	var acc = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

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
Find the first page matching a query.

@function findFirst
@memberof pq

@param {Object} query
@param {String} query.type
@returns {Object}
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
//# sourceMappingURL=query.js.map