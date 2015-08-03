'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
exports.preprocess = preprocess;
exports.runPreprocessors = runPreprocessors;

var _query = require('./query');

var preprocessors = [];

/**
Callbacks passed to preprocess are executed before the page-state tree is build.
The callback is called with each root page.

@function preprocess
@param {preprocessCallback} func
@returns {Promise}
*/
/**
@callback preprocessCallback
@param {Object} page
@returns {?Promise}
*/

function preprocess(func) {
	preprocessors.push(func);
}

function runPreprocessors(root) {
	return seq.call(root, preprocessors);
}

// Run functions returning promises sequentialy
function seq(funcs) {
	var idx = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

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
//# sourceMappingURL=preprocess.js.map