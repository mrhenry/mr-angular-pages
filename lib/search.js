
/*
 * @param {Object} query
 * @param {Integer} query.limit
 * @param {String} query.type
 */
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.find = find;
exports.findFirst = findFirst;

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

/*
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

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = this.children[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var child = _step.value;

      acc = find.call(child, query, acc);
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

  return acc;
}
//# sourceMappingURL=search.js.map