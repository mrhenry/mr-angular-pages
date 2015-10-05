"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Loader = (function () {
	function Loader() {
		_classCallCheck(this, Loader);
	}

	_createClass(Loader, [{
		key: "summaries",
		value: function summaries() {
			return this.fetch("/api/pages.json");
		}
	}, {
		key: "details",
		value: function details(pageId) {
			return this.fetch("/api/pages/" + pageId + ".json");
		}
	}, {
		key: "fetch",
		value: (function (_fetch) {
			function fetch(_x) {
				return _fetch.apply(this, arguments);
			}

			fetch.toString = function () {
				return _fetch.toString();
			};

			return fetch;
		})(function (path) {
			return fetch(path).then(status).then(json);
		})
	}]);

	return Loader;
})();

exports.Loader = Loader;

function status(resp) {
	if (!resp.status === 200) {
		throw Error("Unexpected response status: " + resp.status);
	}
	return resp;
}

function json(resp) {
	return resp.json();
}
//# sourceMappingURL=Loader.js.map