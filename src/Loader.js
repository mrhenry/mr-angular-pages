
export class Loader {

	summaries() {
		return this.fetch("/api/pages.json");
	}

	details(pageId) {
		return this.fetch(`/api/pages/${pageId}.json`);
	}

	fetch(path) {
		return fetch(path)
			.then(status)
			.then(json);
	}

}

function status(resp) {
	if (!resp.status === 200) {
		throw Error(`Unexpected response status: ${resp.status}`);
	}
	return resp;
}

function json(resp) {
	return resp.json();
}
