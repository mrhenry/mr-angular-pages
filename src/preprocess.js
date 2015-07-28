import {visit} from './query';

let preprocessors = [];

export function preprocess(func) {
	preprocessors.push(func);
}

export function runPreprocessors(root) {
	return root::seq(preprocessors);
}

// Run functions returning promises sequentialy
function seq(funcs, idx=0) {
	let target = this;
	if (!target.then) {
		target = Promise.resolve(target);
	}

	if (idx < funcs.length) {
		return target.then(funcs[idx])::seq(funcs, idx + 1);
	}

	return target;
}

preprocess(function addDepthToPages(root) {
	return root::visit(page => {
		if (page.parent) {
			page.depth = page.parent.depth + 1;
		} else {
			page.depth = 0;
		}
	});
});
