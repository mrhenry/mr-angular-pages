import {State, mountAt, Metadata, buildUiRouterState} from 'fd-angular-core';
import {currentLoader} from './index';

export var registeredPageTypes = {};

const DEFAULT_SUFFIX = 'Page';

export function mountPage(page, url, opts={}) {
	let {name} = opts;

	return {
		state:              this::mountAt(url, { name: (name || url) }),
		page:               page,
		children:           [],
		buildUiRouterState: builder,
	};

	function builder() {
		let state = buildUiRouterState(this.state);

		state.resolve.pageSummary = () => { return this.page; };
		state.resolve.pageId = () => { return this.page.id; };

		for (let child of this.children) {
			state.children.push(buildUiRouterState(child));
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
export function Page(opts={}) {
	if (opts.url) { throw "@Page({ url }) is not supported"; }
	if (opts.resolve) { throw "@Page({ resolve }) is not supported"; }

	if (opts.asChild !== undefined) {
		console.warn("@Page({ asChild }) is depricated use @Page({ embed }) instead.");
		opts.embed = opts.asChild;
	}

	function register(constructor) {
		let meta = Metadata(constructor);

		let name = opts.name;
		if (!name) {
			name = meta.name;
			name = name[0].toLowerCase() + name.substr(1, name.length - DEFAULT_SUFFIX.length - 1);
			opts.name = name;
		}

		constructor = State(opts)(constructor) || constructor;

		var pageConstructor = function pageConstructor(pageSummary, pageDetails, ...rest) {
			this::applyPageSummary(pageSummary);
			this::applyPageDetails(pageDetails);
			constructor.apply(this, rest);
		};
		pageConstructor = meta.wrap(pageConstructor);
		pageConstructor.$inject = ['pageSummary', 'pageDetails'].concat(constructor.$inject || []);

		let superMeta = Metadata(meta.superClass) || { state: {} };

		if (opts.embed === true || opts.embed === false) {
			meta.state.embed = opts.embed;
		} else {
			meta.state.embed = (superMeta.state.embed || false);
		}

		if (opts.embedChildren === true || opts.embedChildren === false) {
			meta.state.embedChildren = opts.embedChildren;
		} else {
			meta.state.embedChildren = (superMeta.state.embedChildren || false);
		}

		meta.state.resolve.pageDetails = loadPageDetails;
		meta.state.resolve.pageSummary = () => {};
		meta.state.resolve.pageId = () => {};

		registeredPageTypes[meta.name] = pageConstructor;
		return constructor;
	}

	function loadPageDetails($q, pageId) {
		return $q.when(currentLoader.details(pageId));
	}
	loadPageDetails.$inject = ['$q', 'pageId'];

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
