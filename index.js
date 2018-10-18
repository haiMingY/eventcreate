(function (root, factory) {
  if (typeof exports === 'object' && typeof module === 'object')
    module.exports = factory();
  else if (typeof define === 'function' && define.amd) define([], factory);
  else if (typeof exports === 'object') exports['EventListener'] = factory();
  else root['EventListener'] = factory();
})(this, function () {
  'use strict';
  var toString = Object.prototype.toString;
  Array.isArray =
    Array.isArray ||
    function isArray(arg) {
      return toString.call(arg) === '[object Array]';
    };
  function isFunction(arg) {
    return toString.call(arg) === '[object Function]';
  }

  function checkType(type) {
    if (typeof type !== 'string' && typeof type !== 'symbol') {
      throw new Error(type + ' is not a string or a symbol variable');
    }
    return true;
  }

  function getParams(args) {
    var arr = [].slice.call(args);
    arr.splice(0, 1);
    return arr;
  }
  function ECache() {
    this.cache = {};
  }
  ECache.prototype = {
    /**
     * @description Check the type already exists
     * @param {String | Symbol} type
     * @returns Boolean
     */
    include: function (type) {
      return Array.isArray(this.cache[type]);
    },
    /**
     *  @description set cache data
     * @param {String | Symbol} type
     * @param {any} param
     */
    set: function (type, param) {
      if (this.include(type)) {
        this.cache[type].push(param);
        return false;
      } else {
        this.cache[type] = [param];
        return true;
      }
    },
    /**
     * @description remove a data
     * @param {String | Symbol} type
     * @param {any} param
     */
    remove: function (type, param) {
      if (this.include(type)) {
        var datas = this.cache[type];
        var index = datas.indexOf(param);
        if (index !== -1) {
          datas.splice(index, 0);
        }
      }
    },
    /**
     *
     * @param {String | Symbol} type
     */
    removeAll(type) {
      if (this.include(type)) {
        delete this.cache[type];
      }
    },
    get: function (type) {
      return this.cache[type];
    }
  };

  function listenerCache() {}
  listenerCache.prototype = new ECache();
  listenerCache.prototype.on = function (type, listener) {
    return this.set(type, listener);
  };
  listenerCache.prototype.emit = function (type /**,...args */) {
    if (this.include(type)) {
      var listeners = this.get(type);
      for (var index = 0; index < listeners.length; index++) {
        var listener = listeners[index];
        if (isFunction(listener)) {
          listener.apply(null, getParams(arguments));
        }
      }
    }
  };

  function dateCache() {}
  dateCache.prototype = new ECache()
  dateCache.prototype.on = function (type, data) {
    this.set(type, data);
  }
  dateCache.prototype.emit = function (type, listener) {
    if (this.include(type)) {
      var datas = this.get(type);
      if (Array.isArray(datas)) {
        for (let index = 0; index < datas.length; index++) {
          var data = datas[index];
          data && listener.apply(null, data);
        }
      }
    }
  }
  dateCache.prototype.delete = function (type) {
    this.removeAll(type);
  }
  // };
  var _listenerCache = new listenerCache();
  var _dateCache = new dateCache();
  var Event = {
    /**
     *
     * @param {String | Symbol} type
     * @param {Function} listener
     * @returns is the first time added
     */
    on: function (type, listener) {
      if (checkType(type)) {
        if (!isFunction(listener)) {
          throw new Error('listener nust be a function');
        }
        if (_listenerCache.on(type, listener)) {
          if (_dateCache.include(type)) {
            _dateCache.emit(type, listener);
            _dateCache.delete(type);
          }
        }
      }
    },
    emit: function (type /**,args */) {
      if (checkType(type)) {
        if (_listenerCache.include(type)) {
          _listenerCache.emit.apply(_listenerCache, arguments);
        } else {
          _dateCache.on(type, getParams(arguments));
        }
      }
    },
    remove: function (type, listener) {
      if (checkType(type) && isFunction(listener)) {
        _listenerCache.remove(type, listener);
        _dateCache.delete(type);
      }
    },
    removeAll: function (type) {
      if (checkType(type)) {
        _listenerCache.removeAll(type);
        _dateCache.delete(type);
      }
    },
    once: function (type, listener) {
      if (checkType(type) && isFunction(listener)) {
        var flags = false;
        var self = this;
        function t() {
          if (!flags) {
            flags = true;
            listener.apply(null, arguments);
            self.remove(type, t);
          }
        }
        this.on(type, t);
      }
    }
  };

  return Event;
});
