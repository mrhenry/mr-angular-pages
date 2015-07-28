

/**
@param {Function} func - func is called with each page in the tree
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
 * @param {Object} query
 * @param {Integer} query.limit
 * @param {String} query.type
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
 * @param {Object} query
 * @param {String} query.type
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
