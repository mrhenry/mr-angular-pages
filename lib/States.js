'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _Api = require('./Api');

var _Page = require('./Page');

var _fdAngularCore = require('fd-angular-core');

(0, _fdAngularCore.beforeBoot)(awaitStates());

var states = [];

var PagesController = (function () {
  function PagesController() {
    _classCallCheck(this, _PagesController);

    console.log('[PagesController]', 'Constructor');
  }

  var _PagesController = PagesController;

  _createClass(_PagesController, [{
    key: 'activate',
    value: function activate() {
      console.log('[PagesController]', 'Activate', true);
    }
  }, {
    key: 'attach',
    value: function attach() {
      console.log('[PagesController]', 'Attach');
    }
  }, {
    key: 'detach',
    value: function detach() {
      console.log('[PagesController]', 'Detach');
    }
  }]);

  PagesController = (0, _fdAngularCore.State)({
    abstract: true,
    children: states,
    template: '<ui-view></ui-view>'
  })(PagesController) || PagesController;
  return PagesController;
})();

exports.PagesController = PagesController;

function awaitStates() {
  return (0, _Api.fetchSummaries)().then(buildStates);
}

function buildStates(data) {
  var keys = Object.keys(data.pages);
  keys.sort();

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = keys[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var path = _step.value;

      var page = data.pages[path];
      var type = lookupPageType.call(data, page.type);

      if (type.$$state.opts.asChild) {
        var idx = path.lastIndexOf('/');

        var parentPath = path.slice(0, idx);
        var childPath = path.slice(idx);

        var state = _Page.mountPage.call(type, page.id, childPath);

        var _parent = data.pages[parentPath];
        _parent.$$state.state.childStates.push(state);
      } else {
        var state = _Page.mountPage.call(type, page.id, path);
        states.push(state);
      }
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
}

function lookupPageType(name) {
  var missing = [];

  while (true) {
    var type = _Page.registeredPageTypes[name];
    if (type) return type;

    missing.push(name);

    name = this.types[name];
    if (!name) {
      throw Error('Unknown page types: ' + missing.join(', '));
    }
  }
}
//# sourceMappingURL=States.js.map