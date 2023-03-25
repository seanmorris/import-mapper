require.register("ImportMapper.js", function(exports, require, module) {
"use strict";

var _globalThis$IMPORTS;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var globalImports = globalThis['##IMPORTS##'] = (_globalThis$IMPORTS = globalThis['##IMPORTS##']) !== null && _globalThis$IMPORTS !== void 0 ? _globalThis$IMPORTS : {};
var schema = 'data:application/javascript;charset=utf-8,';
var processIterable = Symbol('processRequires');

var _forceDefault = Symbol('forceDefault');

var wrapRequire = function wrapRequire(names, path) {
  return schema + encodeURIComponent("export const { ".concat(names.join(','), " } = globalThis.require(").concat(JSON.stringify(path), ");"));
};

var wrapScalar = function wrapScalar(scalar) {
  return schema + encodeURIComponent("export default ".concat(JSON.stringify(scalar), ";"));
};

var wrapSomething = function wrapSomething(names, something) {
  var type = _typeof(something);

  if (names[0] === _forceDefault) {
    type = 'default-object';
  }

  var uuid = crypto.randomUUID();

  if (type === 'object') {
    globalImports[uuid] = something;
    return schema + encodeURIComponent("export const { ".concat(names.join(','), " } = globalThis['##IMPORTS##']['").concat(uuid, "'];"));
  }

  globalImports[uuid] = something;
  return schema + encodeURIComponent("export default globalThis['##IMPORTS##']['".concat(uuid, "'];"));
};

module.exports.ImportMapper = /*#__PURE__*/function () {
  function ImportMapper(imports, options) {
    _classCallCheck(this, ImportMapper);

    if (imports) {
      if (typeof imports[Symbol.iterator] !== 'function') {
        imports = Object.entries(imports);
      }

      Object.assign(this.imports = {}, this[processIterable](imports));
    }
  }

  _createClass(ImportMapper, [{
    key: "add",
    value: function add(name, module) {
      this.imports[name] = module;
    }
  }, {
    key: "generate",
    value: function generate() {
      var script = document.createElement('script');
      var imports = this.imports;
      script.setAttribute('type', 'importmap');
      script.innerHTML = JSON.stringify({
        imports: imports
      }, null, 4);
      return script;
    }
  }, {
    key: "register",
    value: function register() {
      var importMap = this.generate();
      document.head.append(importMap);
      importMap.remove();
    }
  }, {
    key: processIterable,
    value: function value(list) {
      var pairs = _toConsumableArray(list).map(function (path) {
        if (Array.isArray(path) && path.length === 2) {
          var _names = Object.keys(path[1]);

          if (_typeof(path[1]) === 'object' && path[1][_forceDefault]) {
            path[1] = path[1][_forceDefault];
            _names = [_forceDefault];
          }

          return [path[0], wrapSomething(_names, path[1])];
        }

        var stuff = globalThis.require(path);

        var names = Object.keys(stuff);

        if (!names.length) {
          return;
        }

        if (_typeof(stuff) === 'object' || typeof stuff === 'function') {
          return [path, wrapRequire(names, path)];
        } else {
          return [path, wrapScalar(stuff)];
        }
      });

      return Object.fromEntries(pairs.filter(function (x) {
        return x;
      }));
    }
  }], [{
    key: "forceDefault",
    value: function forceDefault(object) {
      return _defineProperty({}, _forceDefault, object);
    }
  }]);

  return ImportMapper;
}();

});