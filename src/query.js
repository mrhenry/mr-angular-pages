

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
export function visit(func) {
	let p = new Promise((resolve, reject) => {
		try {
			resolve(func(this));
		} catch (e) {
			reject(e);
		}
	});

	p = p.then(r => {
		if (r === false) {
			return r;
		}
		if (!this.children) {
			return r;
		}

		let all = [];

		for (let child of this.children) {
			all.push(child::visit(func));
		}

		return Promise.all(all);
	});

	return p.then(() => this);
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
export function find(query, acc=[]) {

	if (this.$pageSummary) {
		return this.$pageSummary::find(query, acc);
	}

	if (!query) {
		return acc;
	}

	if (query.limit && acc.length >= query.limit) {
		return acc;
	}

	if (query.type && query.type !== this.type) {
		return this::findInChildren(query, acc);
	}

	acc.push(this);
	return this::findInChildren(query, acc);

}


/**
Find the first page matching a query.

@function findFirst
@memberof pq

@param {Object} query
@param {String} query.type
@returns {Object}
*/
export function findFirst(query) {

	if (!query) {
		return null;
	}

	query.limit = 1;
	let res = this::find(query);

	return (res[0] || null);
}


function findInChildren(query, acc) {
	if (!this.children) {
		return acc;
	}

	for (let child of this.children) {
		acc = child::find(query, acc);
	}

	return acc;
}
