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
	var opts = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
	var name = opts.name;

	return {
		state: _fdAngularCore.mountAt.call(this, url, { name: name || url }),
		page: page,
		children: [],
		buildUiRouterState: builder
	};

	function builder(options) {
		var _this = this;

		var state = (0, _fdAngularCore.buildUiRouterState)(this.state, options);

		state.absoluteName = true;
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

/**
@function Page
@param {Object}  opts - The options
@param {string}  [opts.name] - The name of the controller.
@param {string}  [opts.bindTo] - Bind the controller to the provided name.
@param {Boolean} [opts.abstract] - True for abstract states.
@param {Boolean} [opts.embed] - Embed this page as a child state in it's parent page.
@param {Boolean} [opts.embedChildren] - Embed the child pages of this pages as child states.
@param {string}  [opts.template] - An angular template.
@param {string}  [opts.templateUrl] - A URL to an angular template.
@param {State[]} [opts.children] - List of child states.
@param {string}  [opts.controllerName] - The name of the controller as seen by angular.
@param {Object}  [opts.views] - State views

@example
[@]Page({
	template: `<h1>Hello World</h1>`,
})
class HomePage {
}
*/

function Page() {
	var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

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
//# sourceMappingURL=Page.js.map