
// Placeholder script for the theme packager. Must be present and empty, but can be ignored after that.;
define("modules/common", function(){});

/**
 * Creates an interface object to the Mozu store's Web APIs. It pulls in the Mozu
 * JavaScript SDK and initializes it with the current store's context values
 * (tenant, catalog and store IDs, and authorization tickets).
 */

define('modules/api',['sdk', 'jquery', 'hyprlive'], function (Mozu, $, Hypr) {
    var apiConfig = require.mozuData('apicontext');
    Mozu.setServiceUrls(apiConfig.urls);
    var api = Mozu.Store(apiConfig.headers).api();

    var extendedPropertyParameters = Hypr.getThemeSetting('extendedPropertyParameters');
    if (extendedPropertyParameters && Hypr.getThemeSetting('extendedPropertiesEnabled')) {
        api.setAffiliateTrackingParameters(extendedPropertyParameters.split(','));
    }

    if (Hypr.getThemeSetting('useDebugScripts') || require.mozuData('pagecontext').isDebugMode) {
        api.on('error', function (badPromise, xhr, requestConf) {
            var e = "Error communicating with Mozu web services";
            if (requestConf && requestConf.url) e += (" at " + requestConf.url);
            var correlation = xhr && xhr.getResponseHeader && xhr.getResponseHeader('x-vol-correlation');
            if (correlation) e += " --- Correlation ID: " + correlation;
            if (window && window.console) console.error(e, badPromise, xhr);
        });
    }
    return api;
});
//     Underscore.js 1.6.0
//     http://underscorejs.org
//     (c) 2009-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    concat           = ArrayProto.concat,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.6.0';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return obj;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, length = obj.length; i < length; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      var keys = _.keys(obj);
      for (var i = 0, length = keys.length; i < length; i++) {
        if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
      }
    }
    return obj;
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results.push(iterator.call(context, value, index, list));
    });
    return results;
  };

  var reduceError = 'Reduce of empty array with no initial value';

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var length = obj.length;
    if (length !== +length) {
      var keys = _.keys(obj);
      length = keys.length;
    }
    each(obj, function(value, index, list) {
      index = keys ? keys[--length] : --length;
      if (!initial) {
        memo = obj[index];
        initial = true;
      } else {
        memo = iterator.call(context, memo, obj[index], index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var result;
    any(obj, function(value, index, list) {
      if (predicate.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(predicate, context);
    each(obj, function(value, index, list) {
      if (predicate.call(context, value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, function(value, index, list) {
      return !predicate.call(context, value, index, list);
    }, context);
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    predicate || (predicate = _.identity);
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(predicate, context);
    each(obj, function(value, index, list) {
      if (!(result = result && predicate.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, predicate, context) {
    predicate || (predicate = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(predicate, context);
    each(obj, function(value, index, list) {
      if (result || (result = predicate.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if the array or object contains a given value (using `===`).
  // Aliased as `include`.
  _.contains = _.include = function(obj, target) {
    if (obj == null) return false;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    return any(obj, function(value) {
      return value === target;
    });
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      return (isFunc ? method : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matches(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matches(attrs));
  };

  // Return the maximum element or (element-based computation).
  // Can't optimize arrays of integers longer than 65,535 elements.
  // See [WebKit Bug 80797](https://bugs.webkit.org/show_bug.cgi?id=80797)
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.max.apply(Math, obj);
    }
    var result = -Infinity, lastComputed = -Infinity;
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      if (computed > lastComputed) {
        result = value;
        lastComputed = computed;
      }
    });
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.min.apply(Math, obj);
    }
    var result = Infinity, lastComputed = Infinity;
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      if (computed < lastComputed) {
        result = value;
        lastComputed = computed;
      }
    });
    return result;
  };

  // Shuffle an array, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var rand;
    var index = 0;
    var shuffled = [];
    each(obj, function(value) {
      rand = _.random(index++);
      shuffled[index - 1] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (obj.length !== +obj.length) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // An internal function to generate lookup iterators.
  var lookupIterator = function(value) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return value;
    return _.property(value);
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, iterator, context) {
    iterator = lookupIterator(iterator);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, iterator, context) {
      var result = {};
      iterator = lookupIterator(iterator);
      each(obj, function(value, index) {
        var key = iterator.call(context, value, index, obj);
        behavior(result, key, value);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, key, value) {
    _.has(result, key) ? result[key].push(value) : result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, key, value) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, key) {
    _.has(result, key) ? result[key]++ : result[key] = 1;
  });

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator, context) {
    iterator = lookupIterator(iterator);
    var value = iterator.call(context, obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >>> 1;
      iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (obj.length === +obj.length) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return (obj.length === +obj.length) ? obj.length : _.keys(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    if ((n == null) || guard) return array[0];
    if (n < 0) return [];
    return slice.call(array, 0, n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if ((n == null) || guard) return array[array.length - 1];
    return slice.call(array, Math.max(array.length - n, 0));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, (n == null) || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, output) {
    if (shallow && _.every(input, _.isArray)) {
      return concat.apply(output, input);
    }
    each(input, function(value) {
      if (_.isArray(value) || _.isArguments(value)) {
        shallow ? push.apply(output, value) : flatten(value, shallow, output);
      } else {
        output.push(value);
      }
    });
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Split an array into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = function(array, predicate) {
    var pass = [], fail = [];
    each(array, function(elem) {
      (predicate(elem) ? pass : fail).push(elem);
    });
    return [pass, fail];
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator, context) {
    if (_.isFunction(isSorted)) {
      context = iterator;
      iterator = isSorted;
      isSorted = false;
    }
    var initial = iterator ? _.map(array, iterator, context) : array;
    var results = [];
    var seen = [];
    each(initial, function(value, index) {
      if (isSorted ? (!index || seen[seen.length - 1] !== value) : !_.contains(seen, value)) {
        seen.push(value);
        results.push(array[index]);
      }
    });
    return results;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(_.flatten(arguments, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.contains(other, item);
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
    return _.filter(array, function(value){ return !_.contains(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var length = _.max(_.pluck(arguments, 'length').concat(0));
    var results = new Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(arguments, '' + i);
    }
    return results;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    if (list == null) return {};
    var result = {};
    for (var i = 0, length = list.length; i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i = 0, length = array.length;
    if (isSorted) {
      if (typeof isSorted == 'number') {
        i = (isSorted < 0 ? Math.max(0, length + isSorted) : isSorted);
      } else {
        i = _.sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
    for (; i < length; i++) if (array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item, from) {
    if (array == null) return -1;
    var hasIndex = from != null;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
      return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
    }
    var i = (hasIndex ? from : array.length);
    while (i--) if (array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(length);

    while(idx < length) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    var args, bound;
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError;
    args = slice.call(arguments, 2);
    return bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      ctor.prototype = func.prototype;
      var self = new ctor;
      ctor.prototype = null;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (Object(result) === result) return result;
      return self;
    };
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    return function() {
      var position = 0;
      var args = boundArgs.slice();
      for (var i = 0, length = args.length; i < length; i++) {
        if (args[i] === _) args[i] = arguments[position++];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return func.apply(this, args);
    };
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length === 0) throw new Error('bindAll must be passed function names');
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(null, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    options || (options = {});
    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      context = args = null;
    };
    return function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
        context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;
      if (last < wait) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) {
        timeout = setTimeout(later, wait);
      }
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      memo = func.apply(this, arguments);
      func = null;
      return memo;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = new Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = new Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    each(keys, function(key) {
      if (key in obj) copy[key] = obj[key];
    });
    return copy;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    for (var key in obj) {
      if (!_.contains(keys, key)) copy[key] = obj[key];
    }
    return copy;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          if (obj[prop] === void 0) obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] == a) return bStack[length] == b;
    }
    // Objects with different constructors are not equivalent, but `Object`s
    // from different frames are.
    var aCtor = a.constructor, bCtor = b.constructor;
    if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&
                             _.isFunction(bCtor) && (bCtor instanceof bCtor))
                        && ('constructor' in a && 'constructor' in b)) {
      return false;
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
        }
      }
    } else {
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return result;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, [], []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) == '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  // Optimize `isFunction` if appropriate.
  if (typeof (/./) !== 'function') {
    _.isFunction = function(obj) {
      return typeof obj === 'function';
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj != +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  _.constant = function(value) {
    return function () {
      return value;
    };
  };

  _.property = function(key) {
    return function(obj) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of `key:value` pairs.
  _.matches = function(attrs) {
    return function(obj) {
      if (obj === attrs) return true; //avoid comparing an object to itself.
      for (var key in attrs) {
        if (attrs[key] !== obj[key])
          return false;
      }
      return true;
    }
  };

  // Run a function **n** times.
  _.times = function(n, iterator, context) {
    var accum = Array(Math.max(0, n));
    for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() { return new Date().getTime(); };

  // List of HTML entities for escaping.
  var entityMap = {
    escape: {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;'
    }
  };
  entityMap.unescape = _.invert(entityMap.escape);

  // Regexes containing the keys and values listed immediately above.
  var entityRegexes = {
    escape:   new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
    unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
  };

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  _.each(['escape', 'unescape'], function(method) {
    _[method] = function(string) {
      if (string == null) return '';
      return ('' + string).replace(entityRegexes[method], function(match) {
        return entityMap[method][match];
      });
    };
  });

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return void 0;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result.call(this, func.apply(_, args));
      };
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\t':     't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(text, data, settings) {
    var render;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = new RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset)
        .replace(escaper, function(match) { return '\\' + escapes[match]; });

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      }
      if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      }
      if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }
      index = offset + match.length;
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + "return __p;\n";

    try {
      render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled function source as a convenience for precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(obj) {
    return this._chain ? _(obj).chain() : obj;
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
      return result.call(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result.call(this, method.apply(this._wrapped, arguments));
    };
  });

  _.extend(_.prototype, {

    // Start chaining a wrapped Underscore object.
    chain: function() {
      this._chain = true;
      return this;
    },

    // Extracts the result from a wrapped and chained object.
    value: function() {
      return this._wrapped;
    }

  });

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define === 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    });
  }
}).call(this);

//     Backbone.js 1.1.2

//     (c) 2010-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Backbone may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://backbonejs.org

(function(root, factory) {

  // Set up Backbone appropriately for the environment. Start with AMD.
  if (typeof define === 'function' && define.amd) {
    define('backbone',['underscore', 'jquery', 'exports'], function(_, $, exports) {
      // Export global even in AMD case in case this script is loaded with
      // others that may still expect a global Backbone.
      root.Backbone = factory(root, exports, _, $);
    });

  // Next for Node.js or CommonJS. jQuery may not be needed as a module.
  } else if (typeof exports !== 'undefined') {
    var _ = require('underscore');
    factory(root, exports, _);

  // Finally, as a browser global.
  } else {
    root.Backbone = factory(root, {}, root._, (root.jQuery || root.Zepto || root.ender || root.$));
  }

}(this, function(root, Backbone, _, $) {

  // Initial Setup
  // -------------

  // Save the previous value of the `Backbone` variable, so that it can be
  // restored later on, if `noConflict` is used.
  var previousBackbone = root.Backbone;

  // Create local references to array methods we'll want to use later.
  var array = [];
  var push = array.push;
  var slice = array.slice;
  var splice = array.splice;

  // Current version of the library. Keep in sync with `package.json`.
  Backbone.VERSION = '1.1.2';

  // For Backbone's purposes, jQuery, Zepto, Ender, or My Library (kidding) owns
  // the `$` variable.
  Backbone.$ = $;

  // Runs Backbone.js in *noConflict* mode, returning the `Backbone` variable
  // to its previous owner. Returns a reference to this Backbone object.
  Backbone.noConflict = function() {
    root.Backbone = previousBackbone;
    return this;
  };

  // Turn on `emulateHTTP` to support legacy HTTP servers. Setting this option
  // will fake `"PATCH"`, `"PUT"` and `"DELETE"` requests via the `_method` parameter and
  // set a `X-Http-Method-Override` header.
  Backbone.emulateHTTP = false;

  // Turn on `emulateJSON` to support legacy servers that can't deal with direct
  // `application/json` requests ... will encode the body as
  // `application/x-www-form-urlencoded` instead and will send the model in a
  // form param named `model`.
  Backbone.emulateJSON = false;

  // Backbone.Events
  // ---------------

  // A module that can be mixed in to *any object* in order to provide it with
  // custom events. You may bind with `on` or remove with `off` callback
  // functions to an event; `trigger`-ing an event fires all callbacks in
  // succession.
  //
  //     var object = {};
  //     _.extend(object, Backbone.Events);
  //     object.on('expand', function(){ alert('expanded'); });
  //     object.trigger('expand');
  //
  var Events = Backbone.Events = {

    // Bind an event to a `callback` function. Passing `"all"` will bind
    // the callback to all events fired.
    on: function(name, callback, context) {
      if (!eventsApi(this, 'on', name, [callback, context]) || !callback) return this;
      this._events || (this._events = {});
      var events = this._events[name] || (this._events[name] = []);
      events.push({callback: callback, context: context, ctx: context || this});
      return this;
    },

    // Bind an event to only be triggered a single time. After the first time
    // the callback is invoked, it will be removed.
    once: function(name, callback, context) {
      if (!eventsApi(this, 'once', name, [callback, context]) || !callback) return this;
      var self = this;
      var once = _.once(function() {
        self.off(name, once);
        callback.apply(this, arguments);
      });
      once._callback = callback;
      return this.on(name, once, context);
    },

    // Remove one or many callbacks. If `context` is null, removes all
    // callbacks with that function. If `callback` is null, removes all
    // callbacks for the event. If `name` is null, removes all bound
    // callbacks for all events.
    off: function(name, callback, context) {
      var retain, ev, events, names, i, l, j, k;
      if (!this._events || !eventsApi(this, 'off', name, [callback, context])) return this;
      if (!name && !callback && !context) {
        this._events = void 0;
        return this;
      }
      names = name ? [name] : _.keys(this._events);
      for (i = 0, l = names.length; i < l; i++) {
        name = names[i];
        if (events = this._events[name]) {
          this._events[name] = retain = [];
          if (callback || context) {
            for (j = 0, k = events.length; j < k; j++) {
              ev = events[j];
              if ((callback && callback !== ev.callback && callback !== ev.callback._callback) ||
                  (context && context !== ev.context)) {
                retain.push(ev);
              }
            }
          }
          if (!retain.length) delete this._events[name];
        }
      }

      return this;
    },

    // Trigger one or many events, firing all bound callbacks. Callbacks are
    // passed the same arguments as `trigger` is, apart from the event name
    // (unless you're listening on `"all"`, which will cause your callback to
    // receive the true name of the event as the first argument).
    trigger: function(name) {
      if (!this._events) return this;
      var args = slice.call(arguments, 1);
      if (!eventsApi(this, 'trigger', name, args)) return this;
      var events = this._events[name];
      var allEvents = this._events.all;
      if (events) triggerEvents(events, args);
      if (allEvents) triggerEvents(allEvents, arguments);
      return this;
    },

    // Tell this object to stop listening to either specific events ... or
    // to every object it's currently listening to.
    stopListening: function(obj, name, callback) {
      var listeningTo = this._listeningTo;
      if (!listeningTo) return this;
      var remove = !name && !callback;
      if (!callback && typeof name === 'object') callback = this;
      if (obj) (listeningTo = {})[obj._listenId] = obj;
      for (var id in listeningTo) {
        obj = listeningTo[id];
        obj.off(name, callback, this);
        if (remove || _.isEmpty(obj._events)) delete this._listeningTo[id];
      }
      return this;
    }

  };

  // Regular expression used to split event strings.
  var eventSplitter = /\s+/;

  // Implement fancy features of the Events API such as multiple event
  // names `"change blur"` and jQuery-style event maps `{change: action}`
  // in terms of the existing API.
  var eventsApi = function(obj, action, name, rest) {
    if (!name) return true;

    // Handle event maps.
    if (typeof name === 'object') {
      for (var key in name) {
        obj[action].apply(obj, [key, name[key]].concat(rest));
      }
      return false;
    }

    // Handle space separated event names.
    if (eventSplitter.test(name)) {
      var names = name.split(eventSplitter);
      for (var i = 0, l = names.length; i < l; i++) {
        obj[action].apply(obj, [names[i]].concat(rest));
      }
      return false;
    }

    return true;
  };

  // A difficult-to-believe, but optimized internal dispatch function for
  // triggering events. Tries to keep the usual cases speedy (most internal
  // Backbone events have 3 arguments).
  var triggerEvents = function(events, args) {
    var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
    switch (args.length) {
      case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx); return;
      case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1); return;
      case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2); return;
      case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); return;
      default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args); return;
    }
  };

  var listenMethods = {listenTo: 'on', listenToOnce: 'once'};

  // Inversion-of-control versions of `on` and `once`. Tell *this* object to
  // listen to an event in another object ... keeping track of what it's
  // listening to.
  _.each(listenMethods, function(implementation, method) {
    Events[method] = function(obj, name, callback) {
      var listeningTo = this._listeningTo || (this._listeningTo = {});
      var id = obj._listenId || (obj._listenId = _.uniqueId('l'));
      listeningTo[id] = obj;
      if (!callback && typeof name === 'object') callback = this;
      obj[implementation](name, callback, this);
      return this;
    };
  });

  // Aliases for backwards compatibility.
  Events.bind   = Events.on;
  Events.unbind = Events.off;

  // Allow the `Backbone` object to serve as a global event bus, for folks who
  // want global "pubsub" in a convenient place.
  _.extend(Backbone, Events);

  // Backbone.Model
  // --------------

  // Backbone **Models** are the basic data object in the framework --
  // frequently representing a row in a table in a database on your server.
  // A discrete chunk of data and a bunch of useful, related methods for
  // performing computations and transformations on that data.

  // Create a new model with the specified attributes. A client id (`cid`)
  // is automatically generated and assigned for you.
  var Model = Backbone.Model = function(attributes, options) {
    var attrs = attributes || {};
    options || (options = {});
    this.cid = _.uniqueId('c');
    this.attributes = {};
    if (options.collection) this.collection = options.collection;
    if (options.parse) attrs = this.parse(attrs, options) || {};
    attrs = _.defaults({}, attrs, _.result(this, 'defaults'));
    this.set(attrs, options);
    this.changed = {};
    this.initialize.apply(this, arguments);
  };

  // Attach all inheritable methods to the Model prototype.
  _.extend(Model.prototype, Events, {

    // A hash of attributes whose current and previous value differ.
    changed: null,

    // The value returned during the last failed validation.
    validationError: null,

    // The default name for the JSON `id` attribute is `"id"`. MongoDB and
    // CouchDB users may want to set this to `"_id"`.
    idAttribute: 'id',

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // Return a copy of the model's `attributes` object.
    toJSON: function(options) {
      return _.clone(this.attributes);
    },

    // Proxy `Backbone.sync` by default -- but override this if you need
    // custom syncing semantics for *this* particular model.
    sync: function() {
      return Backbone.sync.apply(this, arguments);
    },

    // Get the value of an attribute.
    get: function(attr) {
      return this.attributes[attr];
    },

    // Get the HTML-escaped value of an attribute.
    escape: function(attr) {
      return _.escape(this.get(attr));
    },

    // Returns `true` if the attribute contains a value that is not null
    // or undefined.
    has: function(attr) {
      return this.get(attr) != null;
    },

    // Set a hash of model attributes on the object, firing `"change"`. This is
    // the core primitive operation of a model, updating the data and notifying
    // anyone who needs to know about the change in state. The heart of the beast.
    set: function(key, val, options) {
      var attr, attrs, unset, changes, silent, changing, prev, current;
      if (key == null) return this;

      // Handle both `"key", value` and `{key: value}` -style arguments.
      if (typeof key === 'object') {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }

      options || (options = {});

      // Run validation.
      if (!this._validate(attrs, options)) return false;

      // Extract attributes and options.
      unset           = options.unset;
      silent          = options.silent;
      changes         = [];
      changing        = this._changing;
      this._changing  = true;

      if (!changing) {
        this._previousAttributes = _.clone(this.attributes);
        this.changed = {};
      }
      current = this.attributes, prev = this._previousAttributes;

      // Check for changes of `id`.
      if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];

      // For each `set` attribute, update or delete the current value.
      for (attr in attrs) {
        val = attrs[attr];
        if (!_.isEqual(current[attr], val)) changes.push(attr);
        if (!_.isEqual(prev[attr], val)) {
          this.changed[attr] = val;
        } else {
          delete this.changed[attr];
        }
        unset ? delete current[attr] : current[attr] = val;
      }

      // Trigger all relevant attribute changes.
      if (!silent) {
        if (changes.length) this._pending = options;
        for (var i = 0, l = changes.length; i < l; i++) {
          this.trigger('change:' + changes[i], this, current[changes[i]], options);
        }
      }

      // You might be wondering why there's a `while` loop here. Changes can
      // be recursively nested within `"change"` events.
      if (changing) return this;
      if (!silent) {
        while (this._pending) {
          options = this._pending;
          this._pending = false;
          this.trigger('change', this, options);
        }
      }
      this._pending = false;
      this._changing = false;
      return this;
    },

    // Remove an attribute from the model, firing `"change"`. `unset` is a noop
    // if the attribute doesn't exist.
    unset: function(attr, options) {
      return this.set(attr, void 0, _.extend({}, options, {unset: true}));
    },

    // Clear all attributes on the model, firing `"change"`.
    clear: function(options) {
      var attrs = {};
      for (var key in this.attributes) attrs[key] = void 0;
      return this.set(attrs, _.extend({}, options, {unset: true}));
    },

    // Determine if the model has changed since the last `"change"` event.
    // If you specify an attribute name, determine if that attribute has changed.
    hasChanged: function(attr) {
      if (attr == null) return !_.isEmpty(this.changed);
      return _.has(this.changed, attr);
    },

    // Return an object containing all the attributes that have changed, or
    // false if there are no changed attributes. Useful for determining what
    // parts of a view need to be updated and/or what attributes need to be
    // persisted to the server. Unset attributes will be set to undefined.
    // You can also pass an attributes object to diff against the model,
    // determining if there *would be* a change.
    changedAttributes: function(diff) {
      if (!diff) return this.hasChanged() ? _.clone(this.changed) : false;
      var val, changed = false;
      var old = this._changing ? this._previousAttributes : this.attributes;
      for (var attr in diff) {
        if (_.isEqual(old[attr], (val = diff[attr]))) continue;
        (changed || (changed = {}))[attr] = val;
      }
      return changed;
    },

    // Get the previous value of an attribute, recorded at the time the last
    // `"change"` event was fired.
    previous: function(attr) {
      if (attr == null || !this._previousAttributes) return null;
      return this._previousAttributes[attr];
    },

    // Get all of the attributes of the model at the time of the previous
    // `"change"` event.
    previousAttributes: function() {
      return _.clone(this._previousAttributes);
    },

    // Fetch the model from the server. If the server's representation of the
    // model differs from its current attributes, they will be overridden,
    // triggering a `"change"` event.
    fetch: function(options) {
      options = options ? _.clone(options) : {};
      if (options.parse === void 0) options.parse = true;
      var model = this;
      var success = options.success;
      options.success = function(resp) {
        if (!model.set(model.parse(resp, options), options)) return false;
        if (success) success(model, resp, options);
        model.trigger('sync', model, resp, options);
      };
      wrapError(this, options);
      return this.sync('read', this, options);
    },

    // Set a hash of model attributes, and sync the model to the server.
    // If the server returns an attributes hash that differs, the model's
    // state will be `set` again.
    save: function(key, val, options) {
      var attrs, method, xhr, attributes = this.attributes;

      // Handle both `"key", value` and `{key: value}` -style arguments.
      if (key == null || typeof key === 'object') {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }

      options = _.extend({validate: true}, options);

      // If we're not waiting and attributes exist, save acts as
      // `set(attr).save(null, opts)` with validation. Otherwise, check if
      // the model will be valid when the attributes, if any, are set.
      if (attrs && !options.wait) {
        if (!this.set(attrs, options)) return false;
      } else {
        if (!this._validate(attrs, options)) return false;
      }

      // Set temporary attributes if `{wait: true}`.
      if (attrs && options.wait) {
        this.attributes = _.extend({}, attributes, attrs);
      }

      // After a successful server-side save, the client is (optionally)
      // updated with the server-side state.
      if (options.parse === void 0) options.parse = true;
      var model = this;
      var success = options.success;
      options.success = function(resp) {
        // Ensure attributes are restored during synchronous saves.
        model.attributes = attributes;
        var serverAttrs = model.parse(resp, options);
        if (options.wait) serverAttrs = _.extend(attrs || {}, serverAttrs);
        if (_.isObject(serverAttrs) && !model.set(serverAttrs, options)) {
          return false;
        }
        if (success) success(model, resp, options);
        model.trigger('sync', model, resp, options);
      };
      wrapError(this, options);

      method = this.isNew() ? 'create' : (options.patch ? 'patch' : 'update');
      if (method === 'patch') options.attrs = attrs;
      xhr = this.sync(method, this, options);

      // Restore attributes.
      if (attrs && options.wait) this.attributes = attributes;

      return xhr;
    },

    // Destroy this model on the server if it was already persisted.
    // Optimistically removes the model from its collection, if it has one.
    // If `wait: true` is passed, waits for the server to respond before removal.
    destroy: function(options) {
      options = options ? _.clone(options) : {};
      var model = this;
      var success = options.success;

      var destroy = function() {
        model.trigger('destroy', model, model.collection, options);
      };

      options.success = function(resp) {
        if (options.wait || model.isNew()) destroy();
        if (success) success(model, resp, options);
        if (!model.isNew()) model.trigger('sync', model, resp, options);
      };

      if (this.isNew()) {
        options.success();
        return false;
      }
      wrapError(this, options);

      var xhr = this.sync('delete', this, options);
      if (!options.wait) destroy();
      return xhr;
    },

    // Default URL for the model's representation on the server -- if you're
    // using Backbone's restful methods, override this to change the endpoint
    // that will be called.
    url: function() {
      var base =
        _.result(this, 'urlRoot') ||
        _.result(this.collection, 'url') ||
        urlError();
      if (this.isNew()) return base;
      return base.replace(/([^\/])$/, '$1/') + encodeURIComponent(this.id);
    },

    // **parse** converts a response into the hash of attributes to be `set` on
    // the model. The default implementation is just to pass the response along.
    parse: function(resp, options) {
      return resp;
    },

    // Create a new model with identical attributes to this one.
    clone: function() {
      return new this.constructor(this.attributes);
    },

    // A model is new if it has never been saved to the server, and lacks an id.
    isNew: function() {
      return !this.has(this.idAttribute);
    },

    // Check if the model is currently in a valid state.
    isValid: function(options) {
      return this._validate({}, _.extend(options || {}, { validate: true }));
    },

    // Run validation against the next complete set of model attributes,
    // returning `true` if all is well. Otherwise, fire an `"invalid"` event.
    _validate: function(attrs, options) {
      if (!options.validate || !this.validate) return true;
      attrs = _.extend({}, this.attributes, attrs);
      var error = this.validationError = this.validate(attrs, options) || null;
      if (!error) return true;
      this.trigger('invalid', this, error, _.extend(options, {validationError: error}));
      return false;
    }

  });

  // Underscore methods that we want to implement on the Model.
  var modelMethods = ['keys', 'values', 'pairs', 'invert', 'pick', 'omit'];

  // Mix in each Underscore method as a proxy to `Model#attributes`.
  _.each(modelMethods, function(method) {
    Model.prototype[method] = function() {
      var args = slice.call(arguments);
      args.unshift(this.attributes);
      return _[method].apply(_, args);
    };
  });

  // Backbone.Collection
  // -------------------

  // If models tend to represent a single row of data, a Backbone Collection is
  // more analagous to a table full of data ... or a small slice or page of that
  // table, or a collection of rows that belong together for a particular reason
  // -- all of the messages in this particular folder, all of the documents
  // belonging to this particular author, and so on. Collections maintain
  // indexes of their models, both in order, and for lookup by `id`.

  // Create a new **Collection**, perhaps to contain a specific type of `model`.
  // If a `comparator` is specified, the Collection will maintain
  // its models in sort order, as they're added and removed.
  var Collection = Backbone.Collection = function(models, options) {
    options || (options = {});
    if (options.model) this.model = options.model;
    if (options.comparator !== void 0) this.comparator = options.comparator;
    this._reset();
    this.initialize.apply(this, arguments);
    if (models) this.reset(models, _.extend({silent: true}, options));
  };

  // Default options for `Collection#set`.
  var setOptions = {add: true, remove: true, merge: true};
  var addOptions = {add: true, remove: false};

  // Define the Collection's inheritable methods.
  _.extend(Collection.prototype, Events, {

    // The default model for a collection is just a **Backbone.Model**.
    // This should be overridden in most cases.
    model: Model,

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // The JSON representation of a Collection is an array of the
    // models' attributes.
    toJSON: function(options) {
      return this.map(function(model){ return model.toJSON(options); });
    },

    // Proxy `Backbone.sync` by default.
    sync: function() {
      return Backbone.sync.apply(this, arguments);
    },

    // Add a model, or list of models to the set.
    add: function(models, options) {
      return this.set(models, _.extend({merge: false}, options, addOptions));
    },

    // Remove a model, or a list of models from the set.
    remove: function(models, options) {
      var singular = !_.isArray(models);
      models = singular ? [models] : _.clone(models);
      options || (options = {});
      var i, l, index, model;
      for (i = 0, l = models.length; i < l; i++) {
        model = models[i] = this.get(models[i]);
        if (!model) continue;
        delete this._byId[model.id];
        delete this._byId[model.cid];
        index = this.indexOf(model);
        this.models.splice(index, 1);
        this.length--;
        if (!options.silent) {
          options.index = index;
          model.trigger('remove', model, this, options);
        }
        this._removeReference(model, options);
      }
      return singular ? models[0] : models;
    },

    // Update a collection by `set`-ing a new list of models, adding new ones,
    // removing models that are no longer present, and merging models that
    // already exist in the collection, as necessary. Similar to **Model#set**,
    // the core operation for updating the data contained by the collection.
    set: function(models, options) {
      options = _.defaults({}, options, setOptions);
      if (options.parse) models = this.parse(models, options);
      var singular = !_.isArray(models);
      models = singular ? (models ? [models] : []) : _.clone(models);
      var i, l, id, model, attrs, existing, sort;
      var at = options.at;
      var targetModel = this.model;
      var sortable = this.comparator && (at == null) && options.sort !== false;
      var sortAttr = _.isString(this.comparator) ? this.comparator : null;
      var toAdd = [], toRemove = [], modelMap = {};
      var add = options.add, merge = options.merge, remove = options.remove;
      var order = !sortable && add && remove ? [] : false;

      // Turn bare objects into model references, and prevent invalid models
      // from being added.
      for (i = 0, l = models.length; i < l; i++) {
        attrs = models[i] || {};
        if (attrs instanceof Model) {
          id = model = attrs;
        } else {
          id = attrs[targetModel.prototype.idAttribute || 'id'];
        }

        // If a duplicate is found, prevent it from being added and
        // optionally merge it into the existing model.
        if (existing = this.get(id)) {
          if (remove) modelMap[existing.cid] = true;
          if (merge) {
            attrs = attrs === model ? model.attributes : attrs;
            if (options.parse) attrs = existing.parse(attrs, options);
            existing.set(attrs, options);
            if (sortable && !sort && existing.hasChanged(sortAttr)) sort = true;
          }
          models[i] = existing;

        // If this is a new, valid model, push it to the `toAdd` list.
        } else if (add) {
          model = models[i] = this._prepareModel(attrs, options);
          if (!model) continue;
          toAdd.push(model);
          this._addReference(model, options);
        }

        // Do not add multiple models with the same `id`.
        model = existing || model;
        if (order && (model.isNew() || !modelMap[model.id])) order.push(model);
        modelMap[model.id] = true;
      }

      // Remove nonexistent models if appropriate.
      if (remove) {
        for (i = 0, l = this.length; i < l; ++i) {
          if (!modelMap[(model = this.models[i]).cid]) toRemove.push(model);
        }
        if (toRemove.length) this.remove(toRemove, options);
      }

      // See if sorting is needed, update `length` and splice in new models.
      if (toAdd.length || (order && order.length)) {
        if (sortable) sort = true;
        this.length += toAdd.length;
        if (at != null) {
          for (i = 0, l = toAdd.length; i < l; i++) {
            this.models.splice(at + i, 0, toAdd[i]);
          }
        } else {
          if (order) this.models.length = 0;
          var orderedModels = order || toAdd;
          for (i = 0, l = orderedModels.length; i < l; i++) {
            this.models.push(orderedModels[i]);
          }
        }
      }

      // Silently sort the collection if appropriate.
      if (sort) this.sort({silent: true});

      // Unless silenced, it's time to fire all appropriate add/sort events.
      if (!options.silent) {
        for (i = 0, l = toAdd.length; i < l; i++) {
          (model = toAdd[i]).trigger('add', model, this, options);
        }
        if (sort || (order && order.length)) this.trigger('sort', this, options);
      }

      // Return the added (or merged) model (or models).
      return singular ? models[0] : models;
    },

    // When you have more items than you want to add or remove individually,
    // you can reset the entire set with a new list of models, without firing
    // any granular `add` or `remove` events. Fires `reset` when finished.
    // Useful for bulk operations and optimizations.
    reset: function(models, options) {
      options || (options = {});
      for (var i = 0, l = this.models.length; i < l; i++) {
        this._removeReference(this.models[i], options);
      }
      options.previousModels = this.models;
      this._reset();
      models = this.add(models, _.extend({silent: true}, options));
      if (!options.silent) this.trigger('reset', this, options);
      return models;
    },

    // Add a model to the end of the collection.
    push: function(model, options) {
      return this.add(model, _.extend({at: this.length}, options));
    },

    // Remove a model from the end of the collection.
    pop: function(options) {
      var model = this.at(this.length - 1);
      this.remove(model, options);
      return model;
    },

    // Add a model to the beginning of the collection.
    unshift: function(model, options) {
      return this.add(model, _.extend({at: 0}, options));
    },

    // Remove a model from the beginning of the collection.
    shift: function(options) {
      var model = this.at(0);
      this.remove(model, options);
      return model;
    },

    // Slice out a sub-array of models from the collection.
    slice: function() {
      return slice.apply(this.models, arguments);
    },

    // Get a model from the set by id.
    get: function(obj) {
      if (obj == null) return void 0;
      return this._byId[obj] || this._byId[obj.id] || this._byId[obj.cid];
    },

    // Get the model at the given index.
    at: function(index) {
      return this.models[index];
    },

    // Return models with matching attributes. Useful for simple cases of
    // `filter`.
    where: function(attrs, first) {
      if (_.isEmpty(attrs)) return first ? void 0 : [];
      return this[first ? 'find' : 'filter'](function(model) {
        for (var key in attrs) {
          if (attrs[key] !== model.get(key)) return false;
        }
        return true;
      });
    },

    // Return the first model with matching attributes. Useful for simple cases
    // of `find`.
    findWhere: function(attrs) {
      return this.where(attrs, true);
    },

    // Force the collection to re-sort itself. You don't need to call this under
    // normal circumstances, as the set will maintain sort order as each item
    // is added.
    sort: function(options) {
      if (!this.comparator) throw new Error('Cannot sort a set without a comparator');
      options || (options = {});

      // Run sort based on type of `comparator`.
      if (_.isString(this.comparator) || this.comparator.length === 1) {
        this.models = this.sortBy(this.comparator, this);
      } else {
        this.models.sort(_.bind(this.comparator, this));
      }

      if (!options.silent) this.trigger('sort', this, options);
      return this;
    },

    // Pluck an attribute from each model in the collection.
    pluck: function(attr) {
      return _.invoke(this.models, 'get', attr);
    },

    // Fetch the default set of models for this collection, resetting the
    // collection when they arrive. If `reset: true` is passed, the response
    // data will be passed through the `reset` method instead of `set`.
    fetch: function(options) {
      options = options ? _.clone(options) : {};
      if (options.parse === void 0) options.parse = true;
      var success = options.success;
      var collection = this;
      options.success = function(resp) {
        var method = options.reset ? 'reset' : 'set';
        collection[method](resp, options);
        if (success) success(collection, resp, options);
        collection.trigger('sync', collection, resp, options);
      };
      wrapError(this, options);
      return this.sync('read', this, options);
    },

    // Create a new instance of a model in this collection. Add the model to the
    // collection immediately, unless `wait: true` is passed, in which case we
    // wait for the server to agree.
    create: function(model, options) {
      options = options ? _.clone(options) : {};
      if (!(model = this._prepareModel(model, options))) return false;
      if (!options.wait) this.add(model, options);
      var collection = this;
      var success = options.success;
      options.success = function(model, resp) {
        if (options.wait) collection.add(model, options);
        if (success) success(model, resp, options);
      };
      model.save(null, options);
      return model;
    },

    // **parse** converts a response into a list of models to be added to the
    // collection. The default implementation is just to pass it through.
    parse: function(resp, options) {
      return resp;
    },

    // Create a new collection with an identical list of models as this one.
    clone: function() {
      return new this.constructor(this.models);
    },

    // Private method to reset all internal state. Called when the collection
    // is first initialized or reset.
    _reset: function() {
      this.length = 0;
      this.models = [];
      this._byId  = {};
    },

    // Prepare a hash of attributes (or other model) to be added to this
    // collection.
    _prepareModel: function(attrs, options) {
      if (attrs instanceof Model) return attrs;
      options = options ? _.clone(options) : {};
      options.collection = this;
      var model = new this.model(attrs, options);
      if (!model.validationError) return model;
      this.trigger('invalid', this, model.validationError, options);
      return false;
    },

    // Internal method to create a model's ties to a collection.
    _addReference: function(model, options) {
      this._byId[model.cid] = model;
      if (model.id != null) this._byId[model.id] = model;
      if (!model.collection) model.collection = this;
      model.on('all', this._onModelEvent, this);
    },

    // Internal method to sever a model's ties to a collection.
    _removeReference: function(model, options) {
      if (this === model.collection) delete model.collection;
      model.off('all', this._onModelEvent, this);
    },

    // Internal method called every time a model in the set fires an event.
    // Sets need to update their indexes when models change ids. All other
    // events simply proxy through. "add" and "remove" events that originate
    // in other collections are ignored.
    _onModelEvent: function(event, model, collection, options) {
      if ((event === 'add' || event === 'remove') && collection !== this) return;
      if (event === 'destroy') this.remove(model, options);
      if (model && event === 'change:' + model.idAttribute) {
        delete this._byId[model.previous(model.idAttribute)];
        if (model.id != null) this._byId[model.id] = model;
      }
      this.trigger.apply(this, arguments);
    }

  });

  // Underscore methods that we want to implement on the Collection.
  // 90% of the core usefulness of Backbone Collections is actually implemented
  // right here:
  var methods = ['forEach', 'each', 'map', 'collect', 'reduce', 'foldl',
    'inject', 'reduceRight', 'foldr', 'find', 'detect', 'filter', 'select',
    'reject', 'every', 'all', 'some', 'any', 'include', 'contains', 'invoke',
    'max', 'min', 'toArray', 'size', 'first', 'head', 'take', 'initial', 'rest',
    'tail', 'drop', 'last', 'without', 'difference', 'indexOf', 'shuffle',
    'lastIndexOf', 'isEmpty', 'chain', 'sample'];

  // Mix in each Underscore method as a proxy to `Collection#models`.
  _.each(methods, function(method) {
    Collection.prototype[method] = function() {
      var args = slice.call(arguments);
      args.unshift(this.models);
      return _[method].apply(_, args);
    };
  });

  // Underscore methods that take a property name as an argument.
  var attributeMethods = ['groupBy', 'countBy', 'sortBy', 'indexBy'];

  // Use attributes instead of properties.
  _.each(attributeMethods, function(method) {
    Collection.prototype[method] = function(value, context) {
      var iterator = _.isFunction(value) ? value : function(model) {
        return model.get(value);
      };
      return _[method](this.models, iterator, context);
    };
  });

  // Backbone.View
  // -------------

  // Backbone Views are almost more convention than they are actual code. A View
  // is simply a JavaScript object that represents a logical chunk of UI in the
  // DOM. This might be a single item, an entire list, a sidebar or panel, or
  // even the surrounding frame which wraps your whole app. Defining a chunk of
  // UI as a **View** allows you to define your DOM events declaratively, without
  // having to worry about render order ... and makes it easy for the view to
  // react to specific changes in the state of your models.

  // Creating a Backbone.View creates its initial element outside of the DOM,
  // if an existing element is not provided...
  var View = Backbone.View = function(options) {
    this.cid = _.uniqueId('view');
    options || (options = {});
    _.extend(this, _.pick(options, viewOptions));
    this._ensureElement();
    this.initialize.apply(this, arguments);
    this.delegateEvents();
  };

  // Cached regex to split keys for `delegate`.
  var delegateEventSplitter = /^(\S+)\s*(.*)$/;

  // List of view options to be merged as properties.
  var viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName', 'events'];

  // Set up all inheritable **Backbone.View** properties and methods.
  _.extend(View.prototype, Events, {

    // The default `tagName` of a View's element is `"div"`.
    tagName: 'div',

    // jQuery delegate for element lookup, scoped to DOM elements within the
    // current view. This should be preferred to global lookups where possible.
    $: function(selector) {
      return this.$el.find(selector);
    },

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // **render** is the core function that your view should override, in order
    // to populate its element (`this.el`), with the appropriate HTML. The
    // convention is for **render** to always return `this`.
    render: function() {
      return this;
    },

    // Remove this view by taking the element out of the DOM, and removing any
    // applicable Backbone.Events listeners.
    remove: function() {
      this.$el.remove();
      this.stopListening();
      return this;
    },

    // Change the view's element (`this.el` property), including event
    // re-delegation.
    setElement: function(element, delegate) {
      if (this.$el) this.undelegateEvents();
      this.$el = element instanceof Backbone.$ ? element : Backbone.$(element);
      this.el = this.$el[0];
      if (delegate !== false) this.delegateEvents();
      return this;
    },

    // Set callbacks, where `this.events` is a hash of
    //
    // *{"event selector": "callback"}*
    //
    //     {
    //       'mousedown .title':  'edit',
    //       'click .button':     'save',
    //       'click .open':       function(e) { ... }
    //     }
    //
    // pairs. Callbacks will be bound to the view, with `this` set properly.
    // Uses event delegation for efficiency.
    // Omitting the selector binds the event to `this.el`.
    // This only works for delegate-able events: not `focus`, `blur`, and
    // not `change`, `submit`, and `reset` in Internet Explorer.
    delegateEvents: function(events) {
      if (!(events || (events = _.result(this, 'events')))) return this;
      this.undelegateEvents();
      for (var key in events) {
        var method = events[key];
        if (!_.isFunction(method)) method = this[events[key]];
        if (!method) continue;

        var match = key.match(delegateEventSplitter);
        var eventName = match[1], selector = match[2];
        method = _.bind(method, this);
        eventName += '.delegateEvents' + this.cid;
        if (selector === '') {
          this.$el.on(eventName, method);
        } else {
          this.$el.on(eventName, selector, method);
        }
      }
      return this;
    },

    // Clears all callbacks previously bound to the view with `delegateEvents`.
    // You usually don't need to use this, but may wish to if you have multiple
    // Backbone views attached to the same DOM element.
    undelegateEvents: function() {
      this.$el.off('.delegateEvents' + this.cid);
      return this;
    },

    // Ensure that the View has a DOM element to render into.
    // If `this.el` is a string, pass it through `$()`, take the first
    // matching element, and re-assign it to `el`. Otherwise, create
    // an element from the `id`, `className` and `tagName` properties.
    _ensureElement: function() {
      if (!this.el) {
        var attrs = _.extend({}, _.result(this, 'attributes'));
        if (this.id) attrs.id = _.result(this, 'id');
        if (this.className) attrs['class'] = _.result(this, 'className');
        var $el = Backbone.$('<' + _.result(this, 'tagName') + '>').attr(attrs);
        this.setElement($el, false);
      } else {
        this.setElement(_.result(this, 'el'), false);
      }
    }

  });

  // Backbone.sync
  // -------------

  // Override this function to change the manner in which Backbone persists
  // models to the server. You will be passed the type of request, and the
  // model in question. By default, makes a RESTful Ajax request
  // to the model's `url()`. Some possible customizations could be:
  //
  // * Use `setTimeout` to batch rapid-fire updates into a single request.
  // * Send up the models as XML instead of JSON.
  // * Persist models via WebSockets instead of Ajax.
  //
  // Turn on `Backbone.emulateHTTP` in order to send `PUT` and `DELETE` requests
  // as `POST`, with a `_method` parameter containing the true HTTP method,
  // as well as all requests with the body as `application/x-www-form-urlencoded`
  // instead of `application/json` with the model in a param named `model`.
  // Useful when interfacing with server-side languages like **PHP** that make
  // it difficult to read the body of `PUT` requests.
  Backbone.sync = function(method, model, options) {
    var type = methodMap[method];

    // Default options, unless specified.
    _.defaults(options || (options = {}), {
      emulateHTTP: Backbone.emulateHTTP,
      emulateJSON: Backbone.emulateJSON
    });

    // Default JSON-request options.
    var params = {type: type, dataType: 'json'};

    // Ensure that we have a URL.
    if (!options.url) {
      params.url = _.result(model, 'url') || urlError();
    }

    // Ensure that we have the appropriate request data.
    if (options.data == null && model && (method === 'create' || method === 'update' || method === 'patch')) {
      params.contentType = 'application/json';
      params.data = JSON.stringify(options.attrs || model.toJSON(options));
    }

    // For older servers, emulate JSON by encoding the request into an HTML-form.
    if (options.emulateJSON) {
      params.contentType = 'application/x-www-form-urlencoded';
      params.data = params.data ? {model: params.data} : {};
    }

    // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
    // And an `X-HTTP-Method-Override` header.
    if (options.emulateHTTP && (type === 'PUT' || type === 'DELETE' || type === 'PATCH')) {
      params.type = 'POST';
      if (options.emulateJSON) params.data._method = type;
      var beforeSend = options.beforeSend;
      options.beforeSend = function(xhr) {
        xhr.setRequestHeader('X-HTTP-Method-Override', type);
        if (beforeSend) return beforeSend.apply(this, arguments);
      };
    }

    // Don't process data on a non-GET request.
    if (params.type !== 'GET' && !options.emulateJSON) {
      params.processData = false;
    }

    // If we're sending a `PATCH` request, and we're in an old Internet Explorer
    // that still has ActiveX enabled by default, override jQuery to use that
    // for XHR instead. Remove this line when jQuery supports `PATCH` on IE8.
    if (params.type === 'PATCH' && noXhrPatch) {
      params.xhr = function() {
        return new ActiveXObject("Microsoft.XMLHTTP");
      };
    }

    // Make the request, allowing the user to override any Ajax options.
    var xhr = options.xhr = Backbone.ajax(_.extend(params, options));
    model.trigger('request', model, xhr, options);
    return xhr;
  };

  var noXhrPatch =
    typeof window !== 'undefined' && !!window.ActiveXObject &&
      !(window.XMLHttpRequest && (new XMLHttpRequest).dispatchEvent);

  // Map from CRUD to HTTP for our default `Backbone.sync` implementation.
  var methodMap = {
    'create': 'POST',
    'update': 'PUT',
    'patch':  'PATCH',
    'delete': 'DELETE',
    'read':   'GET'
  };

  // Set the default implementation of `Backbone.ajax` to proxy through to `$`.
  // Override this if you'd like to use a different library.
  Backbone.ajax = function() {
    return Backbone.$.ajax.apply(Backbone.$, arguments);
  };

  // Backbone.Router
  // ---------------

  // Routers map faux-URLs to actions, and fire events when routes are
  // matched. Creating a new one sets its `routes` hash, if not set statically.
  var Router = Backbone.Router = function(options) {
    options || (options = {});
    if (options.routes) this.routes = options.routes;
    this._bindRoutes();
    this.initialize.apply(this, arguments);
  };

  // Cached regular expressions for matching named param parts and splatted
  // parts of route strings.
  var optionalParam = /\((.*?)\)/g;
  var namedParam    = /(\(\?)?:\w+/g;
  var splatParam    = /\*\w+/g;
  var escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g;

  // Set up all inheritable **Backbone.Router** properties and methods.
  _.extend(Router.prototype, Events, {

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // Manually bind a single named route to a callback. For example:
    //
    //     this.route('search/:query/p:num', 'search', function(query, num) {
    //       ...
    //     });
    //
    route: function(route, name, callback) {
      if (!_.isRegExp(route)) route = this._routeToRegExp(route);
      if (_.isFunction(name)) {
        callback = name;
        name = '';
      }
      if (!callback) callback = this[name];
      var router = this;
      Backbone.history.route(route, function(fragment) {
        var args = router._extractParameters(route, fragment);
        router.execute(callback, args);
        router.trigger.apply(router, ['route:' + name].concat(args));
        router.trigger('route', name, args);
        Backbone.history.trigger('route', router, name, args);
      });
      return this;
    },

    // Execute a route handler with the provided parameters.  This is an
    // excellent place to do pre-route setup or post-route cleanup.
    execute: function(callback, args) {
      if (callback) callback.apply(this, args);
    },

    // Simple proxy to `Backbone.history` to save a fragment into the history.
    navigate: function(fragment, options) {
      Backbone.history.navigate(fragment, options);
      return this;
    },

    // Bind all defined routes to `Backbone.history`. We have to reverse the
    // order of the routes here to support behavior where the most general
    // routes can be defined at the bottom of the route map.
    _bindRoutes: function() {
      if (!this.routes) return;
      this.routes = _.result(this, 'routes');
      var route, routes = _.keys(this.routes);
      while ((route = routes.pop()) != null) {
        this.route(route, this.routes[route]);
      }
    },

    // Convert a route string into a regular expression, suitable for matching
    // against the current location hash.
    _routeToRegExp: function(route) {
      route = route.replace(escapeRegExp, '\\$&')
                   .replace(optionalParam, '(?:$1)?')
                   .replace(namedParam, function(match, optional) {
                     return optional ? match : '([^/?]+)';
                   })
                   .replace(splatParam, '([^?]*?)');
      return new RegExp('^' + route + '(?:\\?([\\s\\S]*))?$');
    },

    // Given a route, and a URL fragment that it matches, return the array of
    // extracted decoded parameters. Empty or unmatched parameters will be
    // treated as `null` to normalize cross-browser behavior.
    _extractParameters: function(route, fragment) {
      var params = route.exec(fragment).slice(1);
      return _.map(params, function(param, i) {
        // Don't decode the search params.
        if (i === params.length - 1) return param || null;
        return param ? decodeURIComponent(param) : null;
      });
    }

  });

  // Backbone.History
  // ----------------

  // Handles cross-browser history management, based on either
  // [pushState](http://diveintohtml5.info/history.html) and real URLs, or
  // [onhashchange](https://developer.mozilla.org/en-US/docs/DOM/window.onhashchange)
  // and URL fragments. If the browser supports neither (old IE, natch),
  // falls back to polling.
  var History = Backbone.History = function() {
    this.handlers = [];
    _.bindAll(this, 'checkUrl');

    // Ensure that `History` can be used outside of the browser.
    if (typeof window !== 'undefined') {
      this.location = window.location;
      this.history = window.history;
    }
  };

  // Cached regex for stripping a leading hash/slash and trailing space.
  var routeStripper = /^[#\/]|\s+$/g;

  // Cached regex for stripping leading and trailing slashes.
  var rootStripper = /^\/+|\/+$/g;

  // Cached regex for detecting MSIE.
  var isExplorer = /msie [\w.]+/;

  // Cached regex for removing a trailing slash.
  var trailingSlash = /\/$/;

  // Cached regex for stripping urls of hash.
  var pathStripper = /#.*$/;

  // Has the history handling already been started?
  History.started = false;

  // Set up all inheritable **Backbone.History** properties and methods.
  _.extend(History.prototype, Events, {

    // The default interval to poll for hash changes, if necessary, is
    // twenty times a second.
    interval: 50,

    // Are we at the app root?
    atRoot: function() {
      return this.location.pathname.replace(/[^\/]$/, '$&/') === this.root;
    },

    // Gets the true hash value. Cannot use location.hash directly due to bug
    // in Firefox where location.hash will always be decoded.
    getHash: function(window) {
      var match = (window || this).location.href.match(/#(.*)$/);
      return match ? match[1] : '';
    },

    // Get the cross-browser normalized URL fragment, either from the URL,
    // the hash, or the override.
    getFragment: function(fragment, forcePushState) {
      if (fragment == null) {
        if (this._hasPushState || !this._wantsHashChange || forcePushState) {
          fragment = decodeURI(this.location.pathname + this.location.search);
          var root = this.root.replace(trailingSlash, '');
          if (!fragment.indexOf(root)) fragment = fragment.slice(root.length);
        } else {
          fragment = this.getHash();
        }
      }
      return fragment.replace(routeStripper, '');
    },

    // Start the hash change handling, returning `true` if the current URL matches
    // an existing route, and `false` otherwise.
    start: function(options) {
      if (History.started) throw new Error("Backbone.history has already been started");
      History.started = true;

      // Figure out the initial configuration. Do we need an iframe?
      // Is pushState desired ... is it available?
      this.options          = _.extend({root: '/'}, this.options, options);
      this.root             = this.options.root;
      this._wantsHashChange = this.options.hashChange !== false;
      this._wantsPushState  = !!this.options.pushState;
      this._hasPushState    = !!(this.options.pushState && this.history && this.history.pushState);
      var fragment          = this.getFragment();
      var docMode           = document.documentMode;
      var oldIE             = (isExplorer.exec(navigator.userAgent.toLowerCase()) && (!docMode || docMode <= 7));

      // Normalize root to always include a leading and trailing slash.
      this.root = ('/' + this.root + '/').replace(rootStripper, '/');

      if (oldIE && this._wantsHashChange) {
        var frame = Backbone.$('<iframe src="javascript:0" tabindex="-1">');
        this.iframe = frame.hide().appendTo('body')[0].contentWindow;
        this.navigate(fragment);
      }

      // Depending on whether we're using pushState or hashes, and whether
      // 'onhashchange' is supported, determine how we check the URL state.
      if (this._hasPushState) {
        Backbone.$(window).on('popstate', this.checkUrl);
      } else if (this._wantsHashChange && ('onhashchange' in window) && !oldIE) {
        Backbone.$(window).on('hashchange', this.checkUrl);
      } else if (this._wantsHashChange) {
        this._checkUrlInterval = setInterval(this.checkUrl, this.interval);
      }

      // Determine if we need to change the base url, for a pushState link
      // opened by a non-pushState browser.
      this.fragment = fragment;
      var loc = this.location;

      // Transition from hashChange to pushState or vice versa if both are
      // requested.
      if (this._wantsHashChange && this._wantsPushState) {

        // If we've started off with a route from a `pushState`-enabled
        // browser, but we're currently in a browser that doesn't support it...
        if (!this._hasPushState && !this.atRoot()) {
          this.fragment = this.getFragment(null, true);
          this.location.replace(this.root + '#' + this.fragment);
          // Return immediately as browser will do redirect to new url
          return true;

        // Or if we've started out with a hash-based route, but we're currently
        // in a browser where it could be `pushState`-based instead...
        } else if (this._hasPushState && this.atRoot() && loc.hash) {
          this.fragment = this.getHash().replace(routeStripper, '');
          this.history.replaceState({}, document.title, this.root + this.fragment);
        }

      }

      if (!this.options.silent) return this.loadUrl();
    },

    // Disable Backbone.history, perhaps temporarily. Not useful in a real app,
    // but possibly useful for unit testing Routers.
    stop: function() {
      Backbone.$(window).off('popstate', this.checkUrl).off('hashchange', this.checkUrl);
      if (this._checkUrlInterval) clearInterval(this._checkUrlInterval);
      History.started = false;
    },

    // Add a route to be tested when the fragment changes. Routes added later
    // may override previous routes.
    route: function(route, callback) {
      this.handlers.unshift({route: route, callback: callback});
    },

    // Checks the current URL to see if it has changed, and if it has,
    // calls `loadUrl`, normalizing across the hidden iframe.
    checkUrl: function(e) {
      var current = this.getFragment();
      if (current === this.fragment && this.iframe) {
        current = this.getFragment(this.getHash(this.iframe));
      }
      if (current === this.fragment) return false;
      if (this.iframe) this.navigate(current);
      this.loadUrl();
    },

    // Attempt to load the current URL fragment. If a route succeeds with a
    // match, returns `true`. If no defined routes matches the fragment,
    // returns `false`.
    loadUrl: function(fragment) {
      fragment = this.fragment = this.getFragment(fragment);
      return _.any(this.handlers, function(handler) {
        if (handler.route.test(fragment)) {
          handler.callback(fragment);
          return true;
        }
      });
    },

    // Save a fragment into the hash history, or replace the URL state if the
    // 'replace' option is passed. You are responsible for properly URL-encoding
    // the fragment in advance.
    //
    // The options object can contain `trigger: true` if you wish to have the
    // route callback be fired (not usually desirable), or `replace: true`, if
    // you wish to modify the current URL without adding an entry to the history.
    navigate: function(fragment, options) {
      if (!History.started) return false;
      if (!options || options === true) options = {trigger: !!options};

      var url = this.root + (fragment = this.getFragment(fragment || ''));

      // Strip the hash for matching.
      fragment = fragment.replace(pathStripper, '');

      if (this.fragment === fragment) return;
      this.fragment = fragment;

      // Don't include a trailing slash on the root.
      if (fragment === '' && url !== '/') url = url.slice(0, -1);

      // If pushState is available, we use it to set the fragment as a real URL.
      if (this._hasPushState) {
        this.history[options.replace ? 'replaceState' : 'pushState']({}, document.title, url);

      // If hash changes haven't been explicitly disabled, update the hash
      // fragment to store history.
      } else if (this._wantsHashChange) {
        this._updateHash(this.location, fragment, options.replace);
        if (this.iframe && (fragment !== this.getFragment(this.getHash(this.iframe)))) {
          // Opening and closing the iframe tricks IE7 and earlier to push a
          // history entry on hash-tag change.  When replace is true, we don't
          // want this.
          if(!options.replace) this.iframe.document.open().close();
          this._updateHash(this.iframe.location, fragment, options.replace);
        }

      // If you've told us that you explicitly don't want fallback hashchange-
      // based history, then `navigate` becomes a page refresh.
      } else {
        return this.location.assign(url);
      }
      if (options.trigger) return this.loadUrl(fragment);
    },

    // Update the hash location, either replacing the current entry, or adding
    // a new one to the browser history.
    _updateHash: function(location, fragment, replace) {
      if (replace) {
        var href = location.href.replace(/(javascript:|#).*$/, '');
        location.replace(href + '#' + fragment);
      } else {
        // Some browsers require that `hash` contains a leading #.
        location.hash = '#' + fragment;
      }
    }

  });

  // Create the default Backbone.history.
  Backbone.history = new History;

  // Helpers
  // -------

  // Helper function to correctly set up the prototype chain, for subclasses.
  // Similar to `goog.inherits`, but uses a hash of prototype properties and
  // class properties to be extended.
  var extend = function(protoProps, staticProps) {
    var parent = this;
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && _.has(protoProps, 'constructor')) {
      child = protoProps.constructor;
    } else {
      child = function(){ return parent.apply(this, arguments); };
    }

    // Add static properties to the constructor function, if supplied.
    _.extend(child, parent, staticProps);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    var Surrogate = function(){ this.constructor = child; };
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate;

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) _.extend(child.prototype, protoProps);

    // Set a convenience property in case the parent's prototype is needed
    // later.
    child.__super__ = parent.prototype;

    return child;
  };

  // Set up inheritance for the model, collection, router, view and history.
  Model.extend = Collection.extend = Router.extend = View.extend = History.extend = extend;

  // Throw an error when a URL is needed, and none is supplied.
  var urlError = function() {
    throw new Error('A "url" property or function must be specified');
  };

  // Wrap an optional error callback with a fallback error event.
  var wrapError = function(model, options) {
    var error = options.error;
    options.error = function(resp) {
      if (error) error(model, resp, options);
      model.trigger('error', model, resp, options);
    };
  };

  return Backbone;

}));

/**
 * Adds builtin validation features to BackboneJS Models, customized to connect
 * to display internationalized Mozu text labels.
 */
define('modules/backbone-mozu-validation',["underscore", "backbone", 'hyprlive'], function (_, Backbone, Hypr) {

    // Adapted from Backbone.Validation v0.8.1
    //
    // Copyright (c) 2011-2013 Thomas Pedersen
    // Modified by Volusion for Mozu, not officially forked (yet)
    // Distributed under MIT License
    //
    // Documentation and full license available at:
    // http://thedersen.com/projects/backbone-validation
    Backbone.Validation = (function (_) {
        

        // Default options
        // ---------------

        var defaultOptions = {
            forceUpdate: false,
            selector: 'name',
            labelFormatter: 'sentenceCase',
            valid: Function.prototype,
            invalid: Function.prototype
        };


        // Helper functions
        // ----------------

        // Formatting functions used for formatting error messages
        var formatFunctions = {
            // Uses the configured label formatter to format the attribute name
            // to make it more readable for the user
            formatLabel: function (attrName, model) {
                return defaultLabelFormatters[defaultOptions.labelFormatter](attrName, model);
            },

            // Replaces nummeric placeholders like {0} in a string with arguments
            // passed to the function
            format: function () {
                var args = Array.prototype.slice.call(arguments),
                    text = args.shift();
                return text.replace(/\{(\d+)\}/g, function (match, number) {
                    return typeof args[number] !== 'undefined' ? args[number] : match;
                });
            }
        };

        // Flattens an object
        // eg:
        //
        //     var o = {
        //       address: {
        //         street: 'Street',
        //         zip: 1234
        //       }
        //     };
        //
        // becomes:
        //
        //     var o = {
        //       'address.street': 'Street',
        //       'address.zip': 1234
        //     };
        var maxFlattenDepth = 20;
        var flatten = function (obj, into, prefix, depth) {
            if (depth === 0) throw "Cannot flatten circular object.";
            if (!depth) depth = maxFlattenDepth;
            into = into || {};
            prefix = prefix || '';

            if (obj instanceof Backbone.Model) {
                obj = obj.attributes;
            }

            _.each(obj, function (val, key) {
                if (obj.hasOwnProperty(key)) {
                    if (val && typeof val === 'object' && !(
                      val instanceof Array ||
                      val instanceof Date ||
                      val instanceof RegExp ||
                      val instanceof Backbone.Collection)
                    ) {
                        flatten(val, into, prefix + key + '.', --depth);
                    }
                    else {
                        into[prefix + key] = val;
                    }
                }
            });

            return into;
        };

        // Validation
        // ----------

        var Validation = (function () {

            // Returns an object with undefined properties for all
            // attributes on the model that has defined one or more
            // validation rules.
            var getValidatedAttrs = function (model) {
                return _.reduce(_.keys(model.validation || {}), function (memo, key) {
                    memo[key] = void 0;
                    return memo;
                }, {});
            };

            // Looks on the model for validations for a specified
            // attribute. Returns an array of any validators defined,
            // or an empty array if none is defined.
            var getValidators = function (model, attr) {
                var attrValidationSet = model.validation ? model.validation[attr] || {} : {};

                // If the validator is a function or a string, wrap it in a function validator
                if (_.isFunction(attrValidationSet) || _.isString(attrValidationSet)) {
                    attrValidationSet = {
                        fn: attrValidationSet
                    };
                }

                // Stick the validator object into an array
                if (!_.isArray(attrValidationSet)) {
                    attrValidationSet = [attrValidationSet];
                }

                // Reduces the array of validators into a new array with objects
                // with a validation method to call, the value to validate against
                // and the specified error message, if any
                return _.reduce(attrValidationSet, function (memo, attrValidation) {
                    _.each(_.without(_.keys(attrValidation), 'msg'), function (validator) {
                        memo.push({
                            fn: defaultValidators[validator],
                            val: attrValidation[validator],
                            msg: attrValidation.msg
                        });
                    });
                    return memo;
                }, []);
            };

            // Validates an attribute against all validators defined
            // for that attribute. If one or more errors are found,
            // the first error message is returned.
            // If the attribute is valid, an empty string is returned.
            var validateAttr = function (model, attr, value, computed) {
                // Reduces the array of validators to an error message by
                // applying all the validators and returning the first error
                // message, if any.
                return _.reduce(getValidators(model, attr), function (memo, validator) {
                    // Pass the format functions plus the default
                    // validators as the context to the validator
                    var ctx = _.extend({}, formatFunctions, defaultValidators),
                        result = validator.fn.call(ctx, value, attr, validator.val, model, computed);

                    if (result === false || memo === false) {
                        return false;
                    }
                    if (result && !memo) {
                        return validator.msg || result;
                    }
                    return memo;
                }, '');
            };

            // Loops through the model's attributes and validates them all.
            // Returns and object containing names of invalid attributes
            // as well as error messages.
            var validateModel = function (model, attrs) {
                var error,
                    invalidAttrs = {},
                    isValid = true,
                    computed = _.clone(attrs),
                    flattened = flatten(attrs);

                _.each(flattened, function (val, attr) {
                    error = validateAttr(model, attr, val, computed);
                    if (error) {
                        invalidAttrs[attr] = error;
                        isValid = false;
                    }
                });

                return {
                    invalidAttrs: invalidAttrs,
                    isValid: isValid
                };
            };

            // Contains the methods that are mixed in on the model when binding
            var mixin = function (view, options) {
                return {

                    // Check whether or not a value passes validation
                    // without updating the model
                    preValidate: function (attr, value) {
                        return validateAttr(this, attr, value, _.extend({}, this.attributes));
                    },

                    // Check to see if an attribute, an array of attributes or the
                    // entire model is valid. Passing true will force a validation
                    // of the model.
                    isValid: function (option) {
                        var flattened = flatten(this.attributes);

                        if (_.isString(option)) {
                            return !validateAttr(this, option, flattened[option], _.extend({}, this.attributes));
                        }
                        if (_.isArray(option)) {
                            return _.reduce(option, function (memo, attr) {
                                return memo && !validateAttr(this, attr, flattened[attr], _.extend({}, this.attributes));
                            }, true, this);
                        }
                        if (option === true) {
                            this.validate(null, { silent: true });
                        }
                        return this.validation ? this._isValid : true;
                    },

                    // This is called by Backbone when it needs to perform validation.
                    // You can call it manually without any parameters to validate the
                    // entire model.
                    validate: function (attrs, setOptions) {
                        var model = this,
                            validateAll = !attrs,
                            opt = _.extend({}, options, setOptions),
                            validatedAttrs = getValidatedAttrs(model),
                            selectedAttrs = attrs;

                        if (typeof attrs == "string") {
                            selectedAttrs = {};
                            _.each(validatedAttrs, function (v, k) {
                                if (k.indexOf(attrs) === 0) {
                                    selectedAttrs[k] = v;
                                }
                            });
                        }

                        var allAttrs = _.extend({}, validatedAttrs, selectedAttrs, model.attributes),
                            changedAttrs = flatten(selectedAttrs || allAttrs),
                            result = validateModel(model, allAttrs);

                        model._isValid = result.isValid;

                        // After validation is performed, loop through all changed attributes
                        // and call the valid callbacks so the view is updated.
                        _.each(validatedAttrs, function (val, attr) {
                            var invalid = result.invalidAttrs.hasOwnProperty(attr);
                            if (!invalid && !options.silent) {
                                opt.valid(view, attr, opt.selector);
                            }
                        });

                        // After validation is performed, loop through all changed attributes
                        // and call the invalid callback so the view is updated.
                        _.each(validatedAttrs, function (val, attr) {
                            var invalid = result.invalidAttrs.hasOwnProperty(attr),
                                changed = changedAttrs.hasOwnProperty(attr);

                            if (invalid && (changed || validateAll) && !options.silent) {
                                opt.invalid(view, attr, result.invalidAttrs[attr], opt.selector);
                            }
                        });

                        // Trigger validated events.
                        // Need to defer this so the model is actually updated before
                        // the event is triggered.
                        _.defer(function () {
                            model.trigger('validated', model._isValid, model, result.invalidAttrs);
                            model.trigger('validated:' + (model._isValid ? 'valid' : 'invalid'), model, result.invalidAttrs);
                        });

                        // Return any error messages to Backbone, unless the forceUpdate flag is set.
                        // Then we do not return anything and fools Backbone to believe the validation was
                        // a success. That way Backbone will update the model regardless.
                        if (!opt.forceUpdate && _.intersection(_.keys(result.invalidAttrs), _.keys(changedAttrs)).length > 0) {
                            return result.invalidAttrs;
                        }
                    }
                };
            };

            // Helper to mix in validation on a model
            var bindModel = function (view, model, options) {
                _.extend(model, mixin(view, options));
            };

            // Removes the methods added to a model
            var unbindModel = function (model) {
                delete model.validate;
                delete model.preValidate;
                delete model.isValid;
            };

            // Mix in validation on a model whenever a model is
            // added to a collection
            var collectionAdd = function (model) {
                bindModel(this.view, model, this.options);
            };

            // Remove validation from a model whenever a model is
            // removed from a collection
            var collectionRemove = function (model) {
                unbindModel(model);
            };

            // Returns the public methods on Backbone.Validation
            return {

                // Current version of the library
                version: '0.8.1',

                // Called to configure the default options
                configure: function (options) {
                    _.extend(defaultOptions, options);
                },

                // Hooks up validation on a view with a model
                // or collection
                bind: function (view, options) {
                    var model = view.model,
                        collection = view.collection;

                    options = _.extend({}, defaultOptions, defaultCallbacks, options);

                    if (typeof model === 'undefined' && typeof collection === 'undefined') {
                        throw 'Before you execute the binding your view must have a model or a collection.\n' +
                              'See http://thedersen.com/projects/backbone-validation/#using-form-model-validation for more information.';
                    }

                    if (model) {
                        bindModel(view, model, options);
                    }
                    else if (collection) {
                        collection.each(function (model) {
                            bindModel(view, model, options);
                        });
                        collection.bind('add', collectionAdd, { view: view, options: options });
                        collection.bind('remove', collectionRemove);
                    }
                },

                // Removes validation from a view with a model
                // or collection
                unbind: function (view) {
                    var model = view.model,
                        collection = view.collection;

                    if (model) {
                        unbindModel(view.model);
                    }
                    if (collection) {
                        collection.each(function (model) {
                            unbindModel(model);
                        });
                        collection.unbind('add', collectionAdd);
                        collection.unbind('remove', collectionRemove);
                    }
                },

                // Used to extend the Backbone.Model.prototype
                // with validation
                mixin: mixin(null, defaultOptions)
            };
        }());


        // Callbacks
        // ---------

        var defaultCallbacks = Validation.callbacks = {

            // Gets called when a previously invalid field in the
            // view becomes valid. Removes any error message.
            valid: function (view, attr) {
                view.$('[data-mz-value="' + attr + '"]').removeClass('is-invalid');
                view.$('[data-mz-validationmessage-for="' + attr + '"]').text('');
            },

            // Gets called when a field in the view becomes invalid.
            // Adds a error message.
            invalid: function (view, attr, error) {
                view.$('[data-mz-value="' + attr + '"]').addClass('is-invalid');
                view.$('[data-mz-validationmessage-for="' + attr + '"]').text(error);
            }
        };


        // Patterns
        // --------

        var defaultPatterns = Validation.patterns = {
            // Matches any digit(s) (i.e. 0-9)
            digits: /^\d+$/,

            // Matched any number (e.g. 100.000)
            number: /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/,

            // Matches a valid email address (e.g. mail@example.com)
            email: /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i,

            // Mathes any valid url (e.g. http://www.xample.com)
            url: /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i
        };


        // Error messages
        // --------------

        // Error message for the build in validators.
        // {x} gets swapped out with arguments form the validator.
        var defaultMessages = Validation.messages = {
            required: Hypr.getLabel('genericRequired'),
            acceptance: Hypr.getLabel('genericAcceptance'),
            min: Hypr.getLabel('genericMin'),
            max: Hypr.getLabel('genericMax'),
            range: Hypr.getLabel('genericRange'),
            length: Hypr.getLabel('genericLength'),
            minLength: Hypr.getLabel('genericMinLength'),
            maxLength: Hypr.getLabel('genericMaxLength'),
            rangeLength: Hypr.getLabel('genericRangeLength'),
            oneOf: Hypr.getLabel('genericOneOf'),
            equalTo: Hypr.getLabel('genericEqualTo'),
            pattern: Hypr.getLabel('genericPattern')
        };

        // Label formatters
        // ----------------

        // Label formatters are used to convert the attribute name
        // to a more human friendly label when using the built in
        // error messages.
        // Configure which one to use with a call to
        //
        //     Backbone.Validation.configure({
        //       labelFormatter: 'label'
        //     });
        var defaultLabelFormatters = Validation.labelFormatters = {

            // Returns the attribute name with applying any formatting
            none: function (attrName) {
                return attrName;
            },

            // Converts attributeName or attribute_name to Attribute name
            sentenceCase: function (attrName) {
                return attrName.replace(/(?:^\w|[A-Z]|\b\w)/g, function (match, index) {
                    return index === 0 ? match.toUpperCase() : ' ' + match.toLowerCase();
                }).replace(/_/g, ' ');
            },

            // Looks for a label configured on the model and returns it
            //
            //      var Model = Backbone.Model.extend({
            //        validation: {
            //          someAttribute: {
            //            required: true
            //          }
            //        },
            //
            //        labels: {
            //          someAttribute: 'Custom label'
            //        }
            //      });
            label: function (attrName, model) {
                return (model.labels && model.labels[attrName]) || defaultLabelFormatters.sentenceCase(attrName, model);
            }
        };


        // Built in validators
        // -------------------

        var defaultValidators = Validation.validators = (function () {
            // Use native trim when defined
            var trim = String.prototype.trim ?
              function (text) {
                  return text === null ? '' : String.prototype.trim.call(text);
              } :
              function (text) {
                  var trimLeft = /^\s+/,
                      trimRight = /\s+$/;

                  return text === null ? '' : text.toString().replace(trimLeft, '').replace(trimRight, '');
              };

            // Determines whether or not a value is a number
            var isNumber = function (value) {
                return _.isNumber(value) || (_.isString(value) && value.match(defaultPatterns.number));
            };

            // Determines whether or not a value is empty
            var hasValue = function (value) {
                return !(_.isNull(value) || _.isUndefined(value) || (_.isString(value) && trim(value) === '') || (_.isArray(value) && _.isEmpty(value)));
            };

            return {
                // Function validator
                // Lets you implement a custom function used for validation
                fn: function (value, attr, fn, model, computed) {
                    if (_.isString(fn)) {
                        var hier = attr.split('.');
                        if (hier.length > 1) {
                            hier.pop();
                            model = model.get(hier.join('.'));
                        }
                        fn = model[fn];
                    }
                    return fn.call(model, value, attr, computed);
                },

                // Required validator
                // Validates if the attribute is required or not
                required: function (value, attr, required, model, computed) {
                    var isRequired = _.isFunction(required) ? required.call(model, value, attr, computed) : required;
                    if (!isRequired && !hasValue(value)) {
                        return false; // overrides all other validators
                    }
                    if (isRequired && !hasValue(value)) {
                        return this.format(defaultMessages.required, this.formatLabel(attr, model));
                    }
                },

                // Acceptance validator
                // Validates that something has to be accepted, e.g. terms of use
                // `true` or 'true' are valid
                acceptance: function (value, attr, accept, model) {
                    if (value !== 'true' && (!_.isBoolean(value) || value === false)) {
                        return this.format(defaultMessages.acceptance, this.formatLabel(attr, model));
                    }
                },

                // Min validator
                // Validates that the value has to be a number and equal to or greater than
                // the min value specified
                min: function (value, attr, minValue, model) {
                    if (!isNumber(value) || value < minValue) {
                        return this.format(defaultMessages.min, this.formatLabel(attr, model), minValue);
                    }
                },

                // Max validator
                // Validates that the value has to be a number and equal to or less than
                // the max value specified
                max: function (value, attr, maxValue, model) {
                    if (!isNumber(value) || value > maxValue) {
                        return this.format(defaultMessages.max, this.formatLabel(attr, model), maxValue);
                    }
                },

                // Range validator
                // Validates that the value has to be a number and equal to or between
                // the two numbers specified
                range: function (value, attr, range, model) {
                    if (!isNumber(value) || value < range[0] || value > range[1]) {
                        return this.format(defaultMessages.range, this.formatLabel(attr, model), range[0], range[1]);
                    }
                },

                // Length validator
                // Validates that the value has to be a string with length equal to
                // the length value specified
                length: function (value, attr, length, model) {
                    if (!hasValue(value) || trim(value).length !== length) {
                        return this.format(defaultMessages.length, this.formatLabel(attr, model), length);
                    }
                },

                // Min length validator
                // Validates that the value has to be a string with length equal to or greater than
                // the min length value specified
                minLength: function (value, attr, minLength, model) {
                    if (!hasValue(value) || trim(value).length < minLength) {
                        return this.format(defaultMessages.minLength, this.formatLabel(attr, model), minLength);
                    }
                },

                // Max length validator
                // Validates that the value has to be a string with length equal to or less than
                // the max length value specified
                maxLength: function (value, attr, maxLength, model) {
                    if (!hasValue(value) || trim(value).length > maxLength) {
                        return this.format(defaultMessages.maxLength, this.formatLabel(attr, model), maxLength);
                    }
                },

                // Range length validator
                // Validates that the value has to be a string and equal to or between
                // the two numbers specified
                rangeLength: function (value, attr, range, model) {
                    if (!hasValue(value) || trim(value).length < range[0] || trim(value).length > range[1]) {
                        return this.format(defaultMessages.rangeLength, this.formatLabel(attr, model), range[0], range[1]);
                    }
                },

                // One of validator
                // Validates that the value has to be equal to one of the elements in
                // the specified array. Case sensitive matching
                oneOf: function (value, attr, values, model) {
                    if (!_.include(values, value)) {
                        return this.format(defaultMessages.oneOf, this.formatLabel(attr, model), values.join(', '));
                    }
                },

                // Equal to validator
                // Validates that the value has to be equal to the value of the attribute
                // with the name specified
                equalTo: function (value, attr, equalTo, model, computed) {
                    if (value !== computed[equalTo]) {
                        return this.format(defaultMessages.equalTo, this.formatLabel(attr, model), this.formatLabel(equalTo, model));
                    }
                },

                // Pattern validator
                // Validates that the value has to match the pattern specified.
                // Can be a regular expression or the name of one of the built in patterns
                pattern: function (value, attr, pattern, model) {
                    if (!hasValue(value) || !value.toString().match(defaultPatterns[pattern] || pattern)) {
                        return this.format(defaultMessages.pattern, this.formatLabel(attr, model), pattern);
                    }
                }
            };
        }());

        return Validation;
    }(_));

    return Backbone;

});
/*global define:false require:false */
(function (name, context, definition) {
    if (typeof module != 'undefined' && module.exports) module.exports = definition();
    else if (typeof define == 'function' && define.amd) define('vendor/jquery-scrollto',definition);
    else context[name] = definition();
})('jquery-scrollto', this, function (require) {
    // Prepare
    var jQuery, $, ScrollTo;
    jQuery = $ = window.jQuery || require('jquery');

    // Fix scrolling animations on html/body on safari
    $.propHooks.scrollTop = $.propHooks.scrollLeft = {
        get: function (elem, prop) {
            var result = null;
            if (elem.tagName === 'HTML' || elem.tagName === 'BODY') {
                if (prop === 'scrollLeft') {
                    result = window.scrollX;
                } else if (prop === 'scrollTop') {
                    result = window.scrollY;
                }
            }
            if (result == null) {
                result = elem[prop];
            }
            return result;
        }
    };
    $.Tween.propHooks.scrollTop = $.Tween.propHooks.scrollLeft = {
        get: function (tween) {
            return $.propHooks.scrollTop.get(tween.elem, tween.prop);
        },
        set: function (tween) {
            // Our safari fix
            if (tween.elem.tagName === 'HTML' || tween.elem.tagName === 'BODY') {
                // Defaults
                tween.options.bodyScrollLeft = (tween.options.bodyScrollLeft || window.scrollX);
                tween.options.bodyScrollTop = (tween.options.bodyScrollTop || window.scrollY);

                // Apply
                if (tween.prop === 'scrollLeft') {
                    tween.options.bodyScrollLeft = Math.round(tween.now);
                }
                else if (tween.prop === 'scrollTop') {
                    tween.options.bodyScrollTop = Math.round(tween.now);
                }

                // Apply
                window.scrollTo(tween.options.bodyScrollLeft, tween.options.bodyScrollTop);
            }
                // jQuery's IE8 Fix
            else if (tween.elem.nodeType && tween.elem.parentNode) {
                tween.elem[tween.prop] = tween.now;
            }
        }
    };

    // jQuery ScrollTo
    ScrollTo = {
        // Configuration
        config: {
            axis: 'xy',
            duration: 400,
            easing: 'swing',
            callback: undefined,
            durationMode: 'each',
            offsetTop: 0,
            offsetLeft: 0
        },

        // Set Configuration
        configure: function (options) {
            // Apply Options to Config
            $.extend(ScrollTo.config, options || {});

            // Chain
            return this;
        },

        // Perform the Scroll Animation for the Collections
        // We use $inline here, so we can determine the actual offset start for each overflow:scroll item
        // Each collection is for each overflow:scroll item
        scroll: function (collections, config) {
            // Prepare
            var collection, $container, container, $target, $inline, position, containerTagName,
				containerScrollTop, containerScrollLeft,
				containerScrollTopEnd, containerScrollLeftEnd,
				startOffsetTop, targetOffsetTop, targetOffsetTopAdjusted,
				startOffsetLeft, targetOffsetLeft, targetOffsetLeftAdjusted,
				scrollOptions,
				callback;

            // Determine the Scroll
            collection = collections.pop();
            $container = collection.$container;
            $target = collection.$target;
            containerTagName = $container.prop('tagName');

            // Prepare the Inline Element of the Container
            $inline = $('<span/>').css({
                'position': 'absolute',
                'top': '0px',
                'left': '0px'
            });
            position = $container.css('position');

            // Insert the Inline Element of the Container
            $container.css({ position: 'relative' });
            $inline.appendTo($container);

            // Determine the top offset
            startOffsetTop = $inline.offset().top;
            targetOffsetTop = $target.offset().top;
            targetOffsetTopAdjusted = targetOffsetTop - startOffsetTop - parseInt(config.offsetTop, 10);

            // Determine the left offset
            startOffsetLeft = $inline.offset().left;
            targetOffsetLeft = $target.offset().left;
            targetOffsetLeftAdjusted = targetOffsetLeft - startOffsetLeft - parseInt(config.offsetLeft, 10);

            // Determine current scroll positions
            containerScrollTop = $container.prop('scrollTop');
            containerScrollLeft = $container.prop('scrollLeft');

            // Reset the Inline Element of the Container
            $inline.remove();
            $container.css({ position: position });

            // Prepare the scroll options
            scrollOptions = {};

            // Prepare the callback
            callback = function (event) {
                // Check
                if (collections.length === 0) {
                    // Callback
                    if (typeof config.callback === 'function') {
                        config.callback();
                    }
                }
                else {
                    // Recurse
                    ScrollTo.scroll(collections, config);
                }
                // Return true
                return true;
            };

            // Handle if we only want to scroll if we are outside the viewport
            if (config.onlyIfOutside) {
                // Determine current scroll positions
                containerScrollTopEnd = containerScrollTop + $container.height();
                containerScrollLeftEnd = containerScrollLeft + $container.width();

                // Check if we are in the range of the visible area of the container
                if (containerScrollTop < targetOffsetTopAdjusted && targetOffsetTopAdjusted < containerScrollTopEnd) {
                    targetOffsetTopAdjusted = containerScrollTop;
                }
                if (containerScrollLeft < targetOffsetLeftAdjusted && targetOffsetLeftAdjusted < containerScrollLeftEnd) {
                    targetOffsetLeftAdjusted = containerScrollLeft;
                }
            }

            // Determine the scroll options
            if (targetOffsetTopAdjusted !== containerScrollTop) {
                scrollOptions.scrollTop = targetOffsetTopAdjusted;
            }
            if (targetOffsetLeftAdjusted !== containerScrollLeft) {
                scrollOptions.scrollLeft = targetOffsetLeftAdjusted;
            }

            // Check to see if the scroll is necessary
            if ($container.prop('scrollHeight') === $container.width() || config.axis.indexOf('y') === -1) {
                delete scrollOptions.scrollTop;
            }
            if ($container.prop('scrollWidth') === $container.width() || config.axis.indexOf('x') === -1) {
                delete scrollOptions.scrollLeft;
            }

            // Perform the scroll
            if (scrollOptions.scrollTop != null || scrollOptions.scrollLeft != null) {
                $container.animate(scrollOptions, {
                    duration: config.duration,
                    easing: config.easing,
                    complete: callback
                });
            }
            else {
                callback();
            }

            // Return true
            return true;
        },

        // ScrollTo the Element using the Options
        fn: function (options) {
            // Prepare
            var collections, config, $container, container;
            collections = [];

            // Prepare
            var $target = $(this);
            if ($target.length === 0) {
                // Chain
                return this;
            }

            // Handle Options
            config = $.extend({}, ScrollTo.config, options);

            // Fetch
            $container = $target.parent();
            container = $container.get(0);

            // Cycle through the containers
            while (($container.length === 1) && (container !== document.body) && (container !== document)) {
                // Check Container for scroll differences
                var containerScrollTop, containerScrollLeft;
                containerScrollTop = $container.css('overflow-y') !== 'visible' && container.scrollHeight !== container.clientHeight;
                containerScrollLeft = $container.css('overflow-x') !== 'visible' && container.scrollWidth !== container.clientWidth;
                if (containerScrollTop || containerScrollLeft) {
                    // Push the Collection
                    collections.push({
                        '$container': $container,
                        '$target': $target
                    });
                    // Update the Target
                    $target = $container;
                }
                // Update the Container
                $container = $container.parent();
                container = $container.get(0);
            }

            // Add the final collection
            collections.push({
                '$container': $('html'),
                // document.body doesn't work in firefox, html works for all
                // internet explorer starts at the beggining
                '$target': $target
            });

            // Adjust the Config
            if (config.durationMode === 'all') {
                config.duration /= collections.length;
            }

            // Handle
            ScrollTo.scroll(collections, config);

            // Chain
            return this;
        }
    };

    // Apply our extensions to jQuery
    $.ScrollTo = $.ScrollTo || ScrollTo;
    $.fn.ScrollTo = $.fn.ScrollTo || ScrollTo.fn;

    // Export
    return ScrollTo;
});
/*!
 * jQuery Cookie Plugin v1.4.1
 * https://github.com/carhartl/jquery-cookie
 *
 * Copyright 2013 Klaus Hartl
 * Released under the MIT license
 */
(function (factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD
		define('vendor/jquery.cookie/jquery.cookie',['jquery'], factory);
	} else if (typeof exports === 'object') {
		// CommonJS
		factory(require('jquery'));
	} else {
		// Browser globals
		factory(jQuery);
	}
}(function ($) {

	var pluses = /\+/g;

	function encode(s) {
		return config.raw ? s : encodeURIComponent(s);
	}

	function decode(s) {
		return config.raw ? s : decodeURIComponent(s);
	}

	function stringifyCookieValue(value) {
		return encode(config.json ? JSON.stringify(value) : String(value));
	}

	function parseCookieValue(s) {
		if (s.indexOf('"') === 0) {
			// This is a quoted cookie as according to RFC2068, unescape...
			s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
		}

		try {
			// Replace server-side written pluses with spaces.
			// If we can't decode the cookie, ignore it, it's unusable.
			// If we can't parse the cookie, ignore it, it's unusable.
			s = decodeURIComponent(s.replace(pluses, ' '));
			return config.json ? JSON.parse(s) : s;
		} catch(e) {}
	}

	function read(s, converter) {
		var value = config.raw ? s : parseCookieValue(s);
		return $.isFunction(converter) ? converter(value) : value;
	}

	var config = $.cookie = function (key, value, options) {

		// Write

		if (value !== undefined && !$.isFunction(value)) {
			options = $.extend({}, config.defaults, options);

			if (typeof options.expires === 'number') {
				var days = options.expires, t = options.expires = new Date();
				t.setTime(+t + days * 864e+5);
			}

			return (document.cookie = [
				encode(key), '=', stringifyCookieValue(value),
				options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
				options.path    ? '; path=' + options.path : '',
				options.domain  ? '; domain=' + options.domain : '',
				options.secure  ? '; secure' : ''
			].join(''));
		}

		// Read

		var result = key ? undefined : {};

		// To prevent the for loop in the first place assign an empty array
		// in case there are no cookies at all. Also prevents odd result when
		// calling $.cookie().
		var cookies = document.cookie ? document.cookie.split('; ') : [];

		for (var i = 0, l = cookies.length; i < l; i++) {
			var parts = cookies[i].split('=');
			var name = decode(parts.shift());
			var cookie = parts.join('=');

			if (key && key === name) {
				// If second argument (value) is a function it's a converter...
				result = read(cookie, value);
				break;
			}

			// Prevent storing a cookie that we couldn't decode.
			if (!key && (cookie = read(cookie)) !== undefined) {
				result[name] = cookie;
			}
		}

		return result;
	};

	config.defaults = {};

	$.removeCookie = function (key, options) {
		if ($.cookie(key) === undefined) {
			return false;
		}

		// Must not alter options, thus extending a fresh object...
		$.cookie(key, '', $.extend({}, options, { expires: -1 }));
		return !$.cookie(key);
	};

}));

/**
 * This file adds some common plugins to jQuery and then returns jQuery, so you can require it instead of jQuery itself and then you're guaranteed to have these plugins.    * They are:
 *   **$.cookie** -- Adds cookie management, using normal jQuery overload style: $.cookie('foo') gets foo cookie, $.cookie('foo','bar') sets it. *(This plugin is a separate file, shimmed in using the shim plugin.)*
 *   **$.fn.jsonData** -- Equivalent to the getter function of  $.fn.data, but without a weird jQuery bug that fails to parse JSON properly if it's been HTML escaped into an attribute.
 *   **$.fn.noFlickerFadeIn** -- A version of $.fn.fadeIn that operates on visibility:invisible objects, so there's no document reflow.
 *   **$.fn.ScrollTo** -- A plugin to smoothly scroll any element into view.
 */
define('modules/jquery-mozu',["jquery", "vendor/jquery-scrollto", "vendor/jquery.cookie/jquery.cookie"], function ($) {

   
    $.fn.jsonData = function (dataAttr) {
        var d = this.attr("data-mz-" + dataAttr);
        return (typeof d === 'string' && d.charAt(0).match(/[\{\[\(]/)) ? $.parseJSON(d) : d;
    };

    // use this instead of fadeIn for elements that are set to visibility: hidden instead of display:none
    // display:none on large elements makes the page look tiny at first, the footer hugging the header
    $.fn.noFlickerFadeIn = function () {
        this.css('visibility', 'visible');
        if (Modernizr.csstransitions) {
            this.css('opacity', 1);
        } else {
            this.animate({ opacity: 1 }, 300);
        }
    };

    // get url query parameters
    $.deparam = function(querystring) {
        // remove any preceding url and split
        querystring = querystring || window.location.search;
        querystring = querystring.substring(querystring.indexOf('?') + 1).split('&');
        var params = {}, pair, d = decodeURIComponent, i;
        // march and parse
        for (i = querystring.length; i > 0;) {
            pair = querystring[--i].split('=');
            if (pair && pair.length > 1) params[d(pair[0])] = d(pair[1].replace(/\+/g, '%20'));
        }

        return params;
    };//--  fn  deparam

    return $.noConflict();

});

define('modules/models-messages',["backbone", 'hyprlive'], function(Backbone, Hypr) {

    var isDebugMode = require.mozuData('pagecontext').isDebugMode,
    unexpectedErrorText = Hypr.getLabel('unexpectedError');

    var Message = Backbone.Model.extend({
        toJSON: function() {
            var j = Backbone.Model.prototype.toJSON.apply(this);
            if ((!isDebugMode && j.errorCode === "UNEXPECTED_ERROR") || !j.message) j.message = unexpectedErrorText;
            return j;
        }
    }),
    MessagesCollection = Backbone.Collection.extend({
        model: Message
    });
    return {
        Message: Message,
        MessagesCollection: MessagesCollection
    };

});

define('modules/backbone-mozu-model',[
    "modules/jquery-mozu",
    "underscore",
    "modules/api",
    "backbone",
    "modules/models-messages",
    "modules/backbone-mozu-validation"], function ($, _, api, Backbone, MessageModels) {


        var $window = $(window),
            Model = Backbone.Model,
           Collection = Backbone.Collection;

        // Detects dot notation in named properties and deepens a flat object to respect those property names.
        // Pessimistically, prefers dot-notated properties over properly deep ones
        function deepen(obj) {
            var ret = {};
            _.each(obj, function (val, key) {
                var ctx = ret, level;
                key = key.split('.');
                while (key.length > 1) {
                    level = key.shift();
                    ctx = ctx[level] || (ctx[level] = {});
                }
                ctx[key[0]] = val;
            });
            return ret;
        }

        var methodMap = {
            'read': 'get',
            'delete': 'del'
        };

        var modelProto = _.extend({}, Backbone.Validation.mixin,

            /** @lends MozuModel.prototype */
        {
            /**
             * @classdesc Extends the BackboneJS Model object to create a Backbone.MozuModel with extra features for model nesting, error handling, validation, and connection to the JavaScript SDK.
             * @class MozuModel
             * @param {object} json A JSON representation of the model to preload into the MozuModel. If you create a new MozuModel with no arguments, its attributes will be blank.
             * @augments external:Backbone.Model
             */


            /**
             * Array of the names of methods whose return values should be added to the JSON serialization of this model that is sent to the view, when MozuModel#toJSON is called with `{ helpers: true }`, which it is in the default implementation of {@ link MozuView#getRenderContext}.
             * The base MozuModel has helpers `['isLoading', 'isValid']`. When you subclass a MozuModel, any helpers you specify will be added to this array, rather than replacing it.
             * @member {string[]} helpers
             * @memberof MozuModel.prototype
             * @public
             */

            /**
             * If `true`, then this MozuModel will gain a `messages` property that is a {@ link Messages.MessageCollection }. It will also subscribe to the `error` event on its `apiModel` and update the `messages` collection as error messages come in from the service.
             * If `false`, this MozuModel will traverse up any existing tree of relations to find a parent or ancestor model that does handle messages, and use its `messages` collection instead.
             * @member {Boolean} handlesMessages
             * @memberof MozuModel.prototype
             * @default false
             */

            /**
             * Find the nearest parent model that handles error messages and pass all subsequent errors thrown on this model to that model. Run on contruct.
             * @private
             */
            passErrors: function() {
                var self = this;
                _.defer(function() {
                    var ctx = self,
                        passFn = function(e, c) {
                            ctx.trigger('error', e, c);
                        };
                    do {
                        if (ctx.handlesMessages) {
                            self.on('error', passFn);
                            break;
                        }
                        ctx = ctx.parent;
                    } while (ctx);
                }, 300);
            },


            /**
             * Dictionary of related models or collections.
             * @member {Object} relations
             * @memberof MozuModel.prototype
             * @public
             * @example
             * var Product = Backbone.MozuModel.extend({
             *   relations: {
             *     content: ProductContent, // another Backbone.MozuModel or Backbone.Model class
             *     options: Backbone.Collection.extend(
             *       model: ProductOption
             *     }) // a "has many" relationship
             *   }
             * });
             *
             * new Product(someJSON).get('content') // --> an instance of ProductContent
             */

            /**
             * Get the value of an attribute. Unlike the `get()` method on the plain `Backbone.Model`, this method accepts a dot-separated path to a property on a child model (child models are defined on {@link Backbone.MozuModel#relations}).
             * @example
             * // returns the value of Product.ProductContent.ProductName
             * productModel.get('content.productName');
             * @param {string} attr The name, or dot-separated path, of the property to return.
             * @returns {Object} The value of the named attribute, and `undefined` if it was never set.
             */
            get: function(attr) {
                var prop = attr.split('.'), ret = this, level;
                while (ret && (level = prop.shift())) ret = Backbone.Model.prototype.get.call(ret, level);
                if (!ret && this.relations && (attr in this.relations)) {
                    ret = this.setRelation(attr, null, { silent: true });
                    this.attributes[attr] = ret;
                }
                return ret;
            },

            /** @private */
            setRelation: function(attr, val, options) {
                var relation = this.attributes[attr],
                    id = this.idAttribute || "id";

                if (!("parse" in options)) options.parse = true;

                //if (options.unset && relation) delete relation.parent;

                if (this.relations && _.has(this.relations, attr)) {

                    // If the relation already exists, we don't want to replace it, rather
                    // update the data within it whether it is a collection or model
                    if (relation && relation instanceof Collection) {

                        id = relation.model.prototype.idAttribute || id;

                        // If the val that is being set is already a collection, use the models
                        // within the collection.
                        if (val instanceof Collection || val instanceof Array) {
                            val = val.models || val;

                            relation.reset(_.clone(val), options);

                        } else {

                            // The incoming val that is being set is not an array or collection, then it represents
                            // a single model.  Go through each of the models in the existing relation and remove
                            // all models that aren't the same as this one (by id). If it is the same, call set on that
                            // model.

                            relation.each(function(model) {
                                if (val && val[id] === model[id]) {
                                    model.set(val, options);
                                } else {
                                    relation.remove(model);
                                }
                            });
                        }

                        return relation;
                    }

                    if (relation && relation instanceof Model) {
                        if (options.unset) {
                            relation.clear(options);
                        } else {
                            relation.set((val && val.toJSON) ? val.toJSON() : val, options);
                        }
                        return relation;
                    }

                    options._parent = this;

                    if (!(val instanceof this.relations[attr])) val = new this.relations[attr](val, options);
                    val.parent = this;
                }

                return val;
            },


            /**
             * Set the value of an attribute or a hash of attributes. Unlike the `set()` method on he plain `Backbone.Model`, this method accepts a dot-separated path to a property on a child model (child models are defined on {@link Backbone.MozuModel#relations}).
             * @example
             * // sets the value of Customer.EditingContact.FirstName
             * customerModel.set('editingContact.firstName');
             * @param {string} propName The name, or dot-separated path, of the property to return.
             * @returns {Object} Returns the value of the named attribute, and `undefined` if it was never set.
             */
            set: function(key, val, options) {
                var attr, attrs, unset, changes, silent, changing, prev, current;
                if (!key && key !== 0) return this;

                // Handle both `"key", value` and `{key: value}` -style arguments.
                if (typeof key === 'object') {
                    attrs = key;
                    options = val;
                } else {
                    (attrs = {})[key] = val;
                }

                options = options || {};

                // allow for dot notation in setting properties remotely on related models, by shifting context!
                attrs = deepen(attrs);

                // Run validation.
                if (!this._validate(attrs, options)) return false;

                // Extract attributes and options.
                unset = options.unset;
                silent = options.silent;
                changes = [];
                changing = this._changing;
                this._changing = true;

                if (!changing) {
                    this._previousAttributes = _.clone(this.attributes);
                    this.changed = {};
                }
                current = this.attributes;
                prev = this._previousAttributes;

                // Check for changes of `id`.
                if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];

                // For each `set` attribute, update or delete the current value.
                for (attr in attrs) {
                    val = attrs[attr];

                    // Inject in the relational lookup
                    val = this.setRelation(attr, val, options);

                    if (this.dataTypes && attr in this.dataTypes) {
                        val = this.dataTypes[attr](val);
                    }

                    if (!_.isEqual(current[attr], val)) changes.push(attr);
                    if (!_.isEqual(prev[attr], val)) {
                        this.changed[attr] = val;
                    } else {
                        delete this.changed[attr];
                    }
                    var isARelation = this.relations && this.relations[attr] && (val instanceof this.relations[attr]);
                    if (unset && !isARelation) {
                        delete current[attr];
                    } else {
                        current[attr] = val;
                    }
                }

                // Trigger all relevant attribute changes.
                if (!silent) {
                    if (changes.length) this._pending = true;
                    for (var i = 0, l = changes.length; i < l; i++) {
                        this.trigger('change:' + changes[i], this, current[changes[i]], options);
                    }
                }

                if (changing) return this;
                if (!silent) {
                    while (this._pending) {
                        this._pending = false;
                        this.trigger('change', this, options, attrs);
                    }
                }
                this._pending = false;
                this._changing = false;
                return this;
            },
            initApiModel: function(conf) {
                var me = this;
                this.apiModel = api.createSync(this.mozuType, _.extend({}, _.result(this, 'defaults') || {}, conf));
                if (!this.apiModel || !this.apiModel.on) return;
                this.apiModel.on('action', function() {
                    me.isLoading(true);
                    me.trigger('request');
                });
                this.apiModel.on('sync', function(rawJSON) {
                    me.isLoading(false);
                    if (rawJSON) {
                        me._isSyncing = true;
                        me.set(rawJSON);
                        me._isSyncing = false;
                    }
                    me.trigger('sync', rawJSON);
                });
                this.apiModel.on('spawn', function(rawJSON) {
                    me.isLoading(false);
                });
                this.apiModel.on('error', function(err) {
                    me.isLoading(false);
                    me.trigger('error', err);
                });
                this.on('change', function() {
                    if (!me._isSyncing) {
                        var changedAttributes = me.changedAttributes();
                        _.each(changedAttributes, function(v, k, l) {
                            if (v && typeof v.toJSON === "function")
                                l[k] = v.toJSON();
                        });
                        me.apiModel.prop(changedAttributes);
                    }
                });
            },

            /**
             * The type of Mozu API object that this model represents; when you specify a `mozuType`, then an SDK object corresponding to that type is created and exposed at the {@link MozuModel#apiModel} property. Its methods are also added to the MozuModel, all prefixed with "api". For example, the SDK `product` object has a method `addToCart`. A Backbone.MozuModel with mozuType `product` will therefore have a method `apiAddToCart`.
             * member {string} mozuType
             * @memberOf MozuModel.prototype
             */

            /**
             * The underlying SDK object created if you specified a MozuModel#mozuType.
             * MozuModels do not use the default Backbone.sync function used by standard Backbone.Models. Instead, MozuModels can communicate with the Mozu API if a {@link MozuModel#mozuType mozuType} is specified.
             * When a new instance of such a model is created, then it will create an SDK object of its `mozuType`, use event listeners to link up `sync` and `error` events between the SDK object and the MozuModel, and add methods for all the methods provided by the SDK object (see {@link MozuModel#mozuType mozuType}.)
             *
             * @member {object} apiModel
             * @memberOf MozuModel.prototype
             */


            /**
             * Ensure that the underlying SDK object has exactly the same data as the live Backbone model. In conflicts, Backbone always wins.
             * The underlying SDK object has event hooks into changes to the Backbone model, but under some circumstances a change may be unnoticed and they'll get out of sync.
             * For instance, if models are nested several layers deep, or if you changed a model attribute with `{ silent: true }` set. Run this method prior to doing any API action
             * to ensure that the SDK object is up to date.
             * @returns {null}
             */
            syncApiModel: function() {
                this.apiModel.prop(this.toJSON());
            },

            /**
             * A helper method for use in templates. True if there are one or more messages in this model's `messages` cllection.
             * Added to the list of {@link MozuModel#helpers } if {@link MozuModel#handlesMessages } is set to `true`.
             * @returns {boolean} True if there are one or more messages in this model's `messages` collection.
             * @method hasMessages
             * @memberof MozuModel.prototype
             */

            initMessages: function() {
                var me = this;
                me.messages = new MessageModels.MessagesCollection();
                me.hasMessages = function() {
                    return me.messages.length > 0;
                };
                me.helpers.push('hasMessages');
                me.on('error', function(err) {
                    if (err.items && err.items.length) {
                        me.messages.reset(err.items);
                    } else {
                        me.messages.reset([err]);
                    }
                });
                me.on('sync', function(raw) {
                    if (!raw || !raw.messages || raw.messages.length === 0) me.messages.reset();
                });
                _.each(this.relations, function(v, key) {
                    var relInstance = me.get(key);
                    if (relInstance) me.listenTo(relInstance, 'error', function(err) {
                        me.trigger('error', err);
                    });
                });
            },
            fetch: function() {
                var self = this;
                return this.apiModel.get().then(function() {
                    return self;
                });
            },
            sync: function(method, model, options) {
                method = methodMap[method] || method;
                model.apiModel[method](model.attributes).then(function(model) {
                    options.success(model.data);
                }, function(error) {
                    options.error(error);
                });
            },

            /**
             * Called whenever an API request begins. You may call this manually to trigger a `loadingchange` event, which {@link MozuView} automatically listens to and displays loading state in the DOM.
             * Added to the list of {@link MozuModel#helpers } automatically, to provide a boolean `model.isLoading` inside HyprLive templates.
             * @returns {boolean} True if the model is currently loading.
             * @param {boolean} flag Set this to true to trigger a `loadingchange` event.
             */
            isLoading: function(yes, opts) {
                if (arguments.length === 0) return !!this._isLoading;
                this._isLoading = yes;
                // firefox bfcache fix
                if (yes) {
                    this._cleanup = this._cleanup || _.bind(this.isLoading, this, false);
                    this._isWatchingUnload = true;
                    $window.on('beforeunload', this._cleanup);
                } else if (this._isWatchingUnload) {
                    delete this._isWatchingUnload;
                    $window.off('beforeunload', this._cleanup);
                }
                if (!opts || !opts.silent) this.trigger('loadingchange', yes);
            },
            getHelpers: function() {
                return this.helpers;
            },

            /**
             * Calls the provided callback immediately if `isLoading` is false, or queues it to be called the next time `isLoading` becomes false.
             * Good for queueing user actions while waiting for an API request to complete.
             * @param {function} callback The function to be called when the `isLoading` is false.
             */
            whenReady: function(cb) {
                var me = this,
                    isLoading = this.isLoading();
                if (!isLoading) return cb();
                var handler = function(yes) {
                    if (!yes) {
                        me.off('loadingchange', handler);
                        cb();
                    }
                };
                me.on('loadingchange', handler);
            },

            /**
             * Convert the data in this model to a plain JavaScript object that could be passed to `JSON.stringify`.
             * MozuModel extends the Backbone.Model#toJSON method with two configuration options.
             * @param {object} options The configuration options.
             * @param {boolean} options.helpers Include helper methods specified in the {@link MozuModel#helpers} collection.
             * @param {boolean} options.ensureCopy Ensure that the returned JSON is a complete in-memory copy of the attributes, with no references. Use this helper if you're going to transform the JSON.
             * @returns {object}
             */
            toJSON: function(options) {
                var attrs = _.clone(this.attributes);
                if (options && options.helpers) {
                    _.each(this.getHelpers(), function(helper) {
                        attrs[helper] = this[helper]();
                    }, this);
                    if (this.hasMessages) attrs.messages = this.messages.toJSON();
                    if (this.validation) attrs.isValid = this.isValid(options.forceValidation);
                }

                _.each(this.relations, function(rel, key) {
                    if (_.has(attrs, key)) {
                        attrs[key] = attrs[key].toJSON(options);
                    }
                });

                return (options && options.ensureCopy) ? JSON.parse(JSON.stringify(attrs)) : attrs;
            }
        });

        // we have to attach the constructor to the prototype via direct assignment,
        // because iterative extend methods don't work on the 'constructor' property
        // in IE8

        modelProto.constructor = function(conf) {
            this.helpers = (this.helpers || []).concat(['isLoading', 'isValid']);
            Backbone.Model.apply(this, arguments);
            if (this.mozuType) this.initApiModel(conf);
            if (this.handlesMessages) {
                this.initMessages();
            } else {
                this.passErrors();
            }
        };


        var MozuModel = Backbone.MozuModel = Backbone.Model.extend(modelProto, {
            /**
             * Create a mozuModel from any preloaded JSON present for this type.
             * @example
             *     var Product = Backbone.MozuModel.extend({
             *         mozuType: 'product'
             *     });
             *     
             *     // the fromCurrent static factory method is a shortcut for a common pattern.
             *     var thisProduct = Product.fromCurrent();
             *     
             *     // the above is equivalent to:
             *     var thisProduct = new Product(require.mozuData('product'));
             * @memberof MozuModel
             * @static
             */
            fromCurrent: function () {
                return new this(require.mozuData(this.prototype.mozuType), { silent: true, parse: true });
            },
            DataTypes: {
                "Int": function (val) {
                    val = parseInt(val, 10);
                    return isNaN(val) ? 0 : val;
                },
                "Float": function (val) {
                    val = parseFloat(val);
                    return isNaN(val) ? 0 : val;
                },
                "Boolean": function (val) {
                    return typeof val === "string" ? val.toLowerCase() === "true" : !!val;
                }
            }
        });

        function flattenValidation(proto, into, prefix) {
            _.each(proto.validation, function (val, key) {
                into[prefix + key] = val;
            });
            if (!proto.__validationFlattened) {
                _.each(proto.relations, function (val, key) {
                    flattenValidation(val.prototype, into, key + '.');
                });
            }
            proto.__validationFlattened = true;
            return into;
        }

        Backbone.MozuModel.extend = function (conf, statics) {
            if (conf) conf.validation = flattenValidation(conf, {}, '');
            if (conf && conf.mozuType) {
                // reflect all methods
                var actions = api.getAvailableActionsFor(conf.mozuType);
                if (actions) _.each(actions, function (actionName) {
                    var apiActionName = "api" + actionName.charAt(0).toUpperCase() + actionName.substring(1);
                    if (!(apiActionName in conf)) {
                        conf[apiActionName] = function (data) {
                            var self = this;
                            // include self by default...
                            if (actionName in { 'create': true, 'update': true }) data = data || this.toJSON();
                            if (typeof data === "object" && !$.isArray(data) && !$.isPlainObject(data)) data = null;
                            this.syncApiModel();
                            this.isLoading(true);
                            var p = this.apiModel[actionName](data);
                            p.ensure(function () {
                                self.isLoading(false);
                            });
                            return p;
                        };
                    }
                });

            }
            var ret = Backbone.Model.extend.call(this, conf, statics);
            if (conf && conf.helpers && conf.helpers.length > 0 && this.prototype.helpers && this.prototype.helpers.length > 0) ret.prototype.helpers = _.union(this.prototype.helpers, conf.helpers);
            return ret;
        };

        Backbone.Collection.prototype.resetRelations = function (options) {
            _.each(this.models, function(model) {
                _.each(model.relations, function(rel, key) {
                    if (model.get(key) instanceof Backbone.Collection) {
                        model.get(key).trigger('reset', model, options);
                    }
                });
            });
        };

        Backbone.Collection.prototype.reset = function (models, options) {
            options = options || {};
            for (var i = 0, l = this.models.length; i < l; i++) {
                this._removeReference(this.models[i]);
            }
            options.previousModels = this.models;
            this._reset();
            this.add(models, _.extend({ silent: true }, options));
            if (!options.silent) {
                this.trigger('reset', this, options);
                this.resetRelations(options);
            }
            return this;
        };
        return Backbone;
});

define('modules/backbone-mozu-pagedcollection',[
    "jquery",
    "underscore",
    "hyprlive",
    "modules/backbone-mozu-model"], function ($, _, Hypr, Backbone) {

        var defaultPageSize = Hypr.getThemeSetting('defaultPageSize'),
            defaultSort = Hypr.getThemeSetting('defaultSort'),
            sorts = [
            {
                "text": Hypr.getLabel('default'),
                "value": defaultSort
            },
            {
                "text": Hypr.getLabel('sortByPriceAsc'),
                "value": "price asc"
            },
            {
                "text": Hypr.getLabel('sortByPriceDesc'),
                "value": "price desc"
            },
            {
                "text": Hypr.getLabel('sortByNameAsc'),
                "value": "productName asc"
            },
            {
                "text": Hypr.getLabel('sortByNameDesc'),
                "value": "productName desc"
            },
            {
                "text": Hypr.getLabel('sortByDateDesc'),
                "value": "createDate desc"
            },
            {
                "text": Hypr.getLabel('sortByDateAsc'),
                "value": "createDate asc"
            }
        ];

        var PagedCollection = Backbone.MozuPagedCollection = Backbone.MozuModel.extend({
            helpers: ['firstIndex', 'lastIndex', 'middlePageNumbers', 'hasPreviousPage', 'hasNextPage', 'currentPage', 'sorts', 'currentSort'],
            validation: {
                pageSize: { min: 1 },
                pageCount: { min: 1 },
                totalCount: { min: 0 },
                startIndex: { min: 0 }
            },
            dataTypes: {
                pageSize: Backbone.MozuModel.DataTypes.Int,
                pageCount: Backbone.MozuModel.DataTypes.Int,
                startIndex: Backbone.MozuModel.DataTypes.Int,
                totalCount: Backbone.MozuModel.DataTypes.Int
            },
            defaultSort: defaultSort,

            _isPaged: true,

            getQueryParams: function() {
                var self = this, lrClone = _.clone(this.lastRequest);
                _.each(lrClone, function(v, p) {
                    if (self.baseRequestParams && (p in self.baseRequestParams)) delete lrClone[p];
                });
                if (parseInt(lrClone.pageSize, 10) === defaultPageSize) delete lrClone.pageSize;

                var startIndex = this.get('startIndex');
                if (startIndex) lrClone.startIndex = startIndex;
                return lrClone;
            },

            getQueryString: function() {
                var params = this.getQueryParams();
                if (!params || _.isEmpty(params)) return "";
                return "?" + $.param(params)
                              .replace(/\+/g, ' ');
            },

            buildRequest: function() {
                var conf = this.baseRequestParams ? _.clone(this.baseRequestParams) : {},
                    pageSize = this.get("pageSize"),
                    startIndex = this.get("startIndex"),
                    sortBy = $.deparam().sortBy || this.currentSort() || defaultSort;
                conf.pageSize = pageSize;
                if (startIndex) conf.startIndex = startIndex;
                if (sortBy) conf.sortBy = sortBy;
                return conf;
            },

            previousPage: function() {
                try {
                    return this.apiModel.prevPage(this.lastRequest);
                } catch (e) { }
            },

            nextPage: function() {
                try {
                    return this.apiModel.nextPage(this.lastRequest);
                } catch (e) { }
            },

            syncIndex: function (currentUriFragment) {
                try {
                    var uriStartIndex = parseInt(($.deparam(currentUriFragment).startIndex || 0), 10);
                    if (!isNaN(uriStartIndex) && uriStartIndex !== this.apiModel.getIndex()) {
                        this.lastRequest.startIndex = uriStartIndex;
                        return this.apiModel.setIndex(uriStartIndex, this.lastRequest);
                    }
                } catch (e) { }
            },

            setPage: function(num) {
                num = parseInt(num, 10);
                if (num != this.currentPage() && num <= parseInt(this.get('pageCount'), 10)) return this.apiModel.setIndex((num - 1) * parseInt(this.get('pageSize'), 10), this.lastRequest);
            },

            changePageSize: function() {
                return this.apiGet($.extend(this.lastRequest, { pageSize: this.get('pageSize') }));
            },

            firstIndex: function() {
                return this.get("startIndex") + 1;
            },

            lastIndex: function() {
                return this.get("startIndex") + this.get("items").length;
            },

            hasPreviousPage: function() {
                return this.get("startIndex") > 0;
            },

            hasNextPage: function() {
                return this.lastIndex() < this.get("totalCount");
            },

            currentPage: function() {
                return Math.ceil(this.firstIndex() / (this.get('pageSize') || 1));
            },

            middlePageNumbers: function() {
                var current = this.currentPage(),
                    ret = [],
                    pageCount = this.get('pageCount'),
                    i = Math.max(Math.min(current - 2, pageCount - 4), 2),
                    last = Math.min(i + 5, pageCount);
                while (i < last) ret.push(i++);
                return ret;
            },

            sorts: function() {
                return sorts;
            },

            currentSort: function() {
                return (this.lastRequest && this.lastRequest.sortBy && decodeURIComponent(this.lastRequest.sortBy).replace(/\+/g, ' ')) || '';
            },

            sortBy: function(sortString) {
                return this.apiGet($.extend(this.lastRequest, { sortBy: sortString }));
            },
            initialize: function() {
                this.lastRequest = this.buildRequest();
            }
        });


        return Backbone;
});

define('modules/views-messages',['modules/jquery-mozu','underscore','backbone','hyprlive'], function($, _, Backbone, Hypr) {
    // because mozuviews need mozumessageviews and mozumessageviews extend mozuviews, we're risking circular reference problems.
    // we fix this by making a factory method that extends the mozu message view only when asked.
    // this avoids the circular reference problem by not asking for backbone-mozuview until we know it's been provided.
    var MozuMessagesView,
        offset = parseInt(Hypr.getThemeSetting('gutterWidth'), 10) || 10;
    return function(opts) {
        if (!MozuMessagesView) MozuMessagesView = Backbone.MozuView.extend({
            templateName: 'modules/common/message-bar',
            initialize: function() {
                this.model.on('reset', this.render, this);
            },
            render: function() {
                Backbone.MozuView.prototype.render.apply(this, arguments);
                if (this.model.length > 0) {
                    this.$el.ScrollTo({
                        onlyIfOutside: true,
                        offsetTop: offset,
                        offsetLeft: offset * 1.5,
                        axis: 'y'
                    });
                }
            }
        });
        return new MozuMessagesView(opts);
    };

});
define('modules/backbone-mozu-view',[
    "modules/jquery-mozu",
    "underscore",
    "hyprlive",
    "backbone",
    "modules/views-messages"
], function ($, _, Hypr, Backbone, messageViewFactory) {

    var MozuView = Backbone.MozuView = Backbone.View.extend(


        /** @lends MozuView.prototype */
        {

            /**
             * Extends the BackboneJS View object to create a Backbone.MozuView with extra features for Hypr integration, queued rendering, simple one-way data binding, and automatic accessor generation.
             * @class MozuView
             * @augments external:Backbone.View
             */


            /**
             * Array of properties of the model to autogenerate update handlers for. The handlers created follow the naming convention `updatePropName` for a property `propName`. They're designed to be attached to an input element using the `events` or `additionalEvents` hash; they expect a jQuery Event from which they determine the original target element, then they try to get that target element's value and set the model property.
             * @member {Array} autoUpdate
             * @memberOf MozuView.prototype
             * @public
             * @example
             * var FullNameView = Backbone.MozuView.extend({
             *  autoUpdate: ['firstName','lastNameOrSurname']
             * });
             * var fullNameView = new FullNameView({ model: someModel, el: $someElement });
             * typeof fullNameView.updateFirstName; // --> "function" that takes a jQuery Event as its argument
             * typeof fullNameView.updateLastNameOrSurname; // --> same as above
             */


        constructor: function (conf) {
            Backbone.View.apply(this, arguments);
            this.template = Hypr.getTemplate(conf.templateName || this.templateName);
            this.listenTo(this.model, "sync", this.render);
            this.listenTo(this.model, "loadingchange", this.handleLoadingChange);
            if (this.model.handlesMessages && conf.messagesEl) {
                this.messageView = messageViewFactory({
                    el: conf.messagesEl,
                    model: this.model.messages
                });
            }
            if (this.renderOnChange) {
                _.each(this.renderOnChange, function (prop) {
                    var model = this.model;
                    if (prop.indexOf('.') !== -1) {
                        var level, hier = prop.split('.');
                        while (hier.length > 1) {
                            level = hier.shift();
                            model = model[level] || model.get(level);
                        }
                        prop = hier[0];
                    }
                    this.listenTo(model, 'change', _.debounce(this.dequeueRender, 150), this);
                    this.listenTo(model, 'change:' + prop, this.enqueueRender, this);
                }, this);
            }
            Backbone.Validation.bind(this);
            Backbone.MozuView.trigger('create', this);

        },
            enqueueRender: function () {
            this.renderQueued = true;
        },
        dequeueRender: function () {
            if (this.renderQueued) {
                this.render();
                this.renderQueued = false;
            }
        },
        events: function () {
            var defaults = _.object(_.flatten(_.map(this.$('[data-mz-value]'), function (el) {
                var val = el.getAttribute('data-mz-value');
                return _.map(['change', 'blur', 'keyup'], function (ev) {
                    return [ev + ' [data-mz-value="' + val + '"]', "update" + val.charAt(0).toUpperCase() + val.substring(1)];
                });
            }).concat(_.map(this.$('[data-mz-action]'), function (el) {
                var action = el.getAttribute('data-mz-action');
                return _.map(['click'], function (ev) {
                    return [ev + ' [data-mz-action="' + action + '"]', action];
                });
            })), true));
            return this.additionalEvents ? _.extend(defaults, this.additionalEvents) : defaults;
        },
        handleLoadingChange: function (isLoading) {
            this.$el[isLoading ? 'addClass' : 'removeClass']('is-loading');
        },
            /**
             * Get the context that will be sent to the template by the MozuView#render method. In the base implementation, this returns an object with a single property, `model`, whose value is the JSON representation of the `model` property of this view. This object is sent to Hypr, which extends it on to the global context object always present in every template, which includes `siteContext`, `labels`, etc. 
             * 
             * Override this method to add another base-level variable to be available in this template.
             * @example
             * // base implementation
             * productView.getRenderContext(); // --> { model: { [...product data] } }
             * // an example override
             * var ViewWithExtraRootVariable = MozuView.extend({
             *   getRenderContext: function() {
             *      // first get the parent method's output
             *      var context = MozuView.prototype.getRenderContext.apply(this, arguments);
             *      context.foo = "bar";
             *      return context;
             *   }
             * });
             * var anotherView = new ViewWithExtraRootVariable({
             *   model: someModel,
             *   templateName: "path/to/template",
             *   el: $('some-selector')
             * });
             * anotherView.getRenderContext(); // --> { model: { [...model data] }, foo: "bar" }
             * // now, the template bound to this view can say {{ foo }} to render bar.
             * @param {MozuModel} substituteModel A model to use, for this render cycle only instead of the view's model.
             */
            getRenderContext: function (substituteModel) {
            var model = (substituteModel || this.model).toJSON({ helpers: true });
                return {
                    Model: model,
                    model: model
                };
            },
            
            /**
             * Renders the template into the element specified at the `el` property, using the JSON representation of the `model` and whatever else is added by {@link MozuView#getRenderContext}.
             */
            render: function (options) {
                var thenFocus = this.el && document.activeElement && document.activeElement.type !== "radio" && document.activeElement.type !== "checkbox" && $.contains(this.el, document.activeElement) && {
                    'id': document.activeElement.id,
                    'mzvalue': document.activeElement.getAttribute('data-mz-value'),
                    'mzFocusBookmark': document.activeElement.getAttribute('data-mz-focus-bookmark'),
                    'value': document.activeElement.value
                };

                this.storeDropzones();

                Backbone.Validation.unbind(this);
                this.undelegateEvents();
                var newHtml = this.template.render(this.getRenderContext());
                this.$el.html(newHtml);

                this.retrieveDropzones();

                this.delegateEvents();
                Backbone.Validation.bind(this);
                if (thenFocus) {
                    if (thenFocus.id) {
                        $(document.getElementById(thenFocus.id)).focus();
                    } else if (thenFocus.mzFocusBookmark) {
                        this.$('[data-mz-focus-bookmark="' + thenFocus.mzFocusBookmark + '"]').focus();
                    } else if (thenFocus.mzvalue) {
                        this.$('[data-mz-value="' + thenFocus.mzvalue + '"]').focus();
                    }
                }
                if (!options || !options.silent) {
                    this.trigger('render', newHtml);
                    Backbone.MozuView.trigger('render', this, newHtml);
                }
            },

            storeDropzones: function() {
                var dropzones = this.dropzones = {};
                this.$('.mz-drop-zone').each(function() {
                    dropzones[this.id] = this;
                });
            },

            retrieveDropzones: function() {
                var dropzones = this.dropzones;
                this.$('.mz-drop-zone').each(function() {
                    if (dropzones[this.id]) $(this).replaceWith(dropzones[this.id]);
                });
            }

            /**
             * Array of properties of the model to autogenerate update handlers for. The handlers created follow the naming convention `updatePropName` for a property `propName`. They're designed to be attached to an input element using the `events` or `additionalEvents` hash; they expect a jQuery Event from which they determine the original target element, then they try to get that target element's value and set the model property.
             * @member {Array} autoUpdate
             * @memberOf MozuView.prototype
             * @public
             * @example
             * var FullNameView = Backbone.MozuView.extend({
             *  autoUpdate: ['firstName','lastNameOrSurname']
             * });
             * var fullNameView = new FullNameView({ model: someModel, el: $someElement });
             * typeof fullNameView.updateFirstName; // --> "function" that takes a jQuery Event as its argument
             * typeof fullNameView.updateLastNameOrSurname; // --> same as above
             */


        });
    _.extend(Backbone.MozuView, Backbone.Events, {
        extend: function (conf, statics) {
            if (conf.autoUpdate) {
                _.each(conf.autoUpdate, function (prop) {
                    var methodName = 'update' + prop.charAt(0).toUpperCase() + prop.substring(1);
                    conf[methodName] = _.debounce(conf[methodName] || function (e) {
                        var attrs = {},
                            $target = $(e.currentTarget),
                            checked = $target.prop('checked'),
                            value = e.currentTarget.type === "checkbox" ? checked : $target.val();
                        if (!(e.currentTarget.type === "radio" && !checked)) {
                            attrs[prop] = value;
                            this.model.set(attrs);
                        }
                    }, 50);
                });
            }
            return Backbone.View.extend.call(this, conf, statics);
        }
    });
});

/**
 * This is a convenience script which combines Backbone.MozuModel,
 * Backbone.MozuView, and Backbone.Validation into a single package, all on the
 * Backbone object as is BackboneJS convention.
 */
define('modules/backbone-mozu',[
    "modules/backbone-mozu-validation",
    "modules/backbone-mozu-model",
    "modules/backbone-mozu-pagedcollection",
    "modules/backbone-mozu-view"
], function (Backbone) {
    return Backbone;
});

/**
 * Watches for changes to the quantity of items in the shopping cart, to update
 * cart count indicators on the storefront.
 */
define('modules/cart-monitor',['modules/jquery-mozu', 'modules/api'], function ($, api) {

    var $cartCount,
        user = require.mozuData('user'),
        userId = user.userId,
        $document = $(document),
        CartMonitor = {
            setCount: function(count) {
                this.$el.text(count);
                savedCounts[userId] = count;
                $.cookie('mozucartcount', JSON.stringify(savedCounts), { path: '/' });
            },
            addToCount: function(count) {
                this.setCount(this.getCount() + count);
            },
            getCount: function() {
                return parseInt(this.$el.text(), 10) || 0;
            },
            update: function() {
                api.get('cartsummary').then(function(summary) {
                    $document.ready(function() {
                        CartMonitor.setCount(summary.count());
                    });
                });
            }
        },
        savedCounts,
        savedCount;

    try {
        savedCounts = JSON.parse($.cookie('mozucartcount'));
    } catch(e) {}

    if (!savedCounts) savedCounts = {};
    savedCount = savedCounts && savedCounts[userId];

    if (isNaN(savedCount)) {
        CartMonitor.update();
    }

    $document.ready(function () {
        CartMonitor.$el = $('[data-mz-role="cartmonitor"]').text(savedCount || 0);
    });

    return CartMonitor;

});
define('modules/contextify',['modules/jquery-mozu'], function ($) {
    $(document).ready(function () {
        $('[data-mz-contextify]').each(function () {
            var $this = $(this),
                config = $this.data();

            $this.find(config.mzContextify).each(function () {
                var $item = $(this);
                if (config.mzContextifyAttr === "class") {
                    $item.addClass(config.mzContextifyVal);
                } else {
                    $item.prop(config.mzContextifyAttr, config.mzContextifyVal);
                }
            });
        });
    });
});
define('shim!vendor/bootstrap/js/tooltip[modules/jquery-mozu=jQuery]>jQuery',['modules/jquery-mozu'], function(jQuery) { 

/* ========================================================================
 * Bootstrap: tooltip.js v3.2.0
 * http://getbootstrap.com/javascript/#tooltip
 * Inspired by the original jQuery.tipsy by Jason Frame
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  

  // TOOLTIP PUBLIC CLASS DEFINITION
  // ===============================

  var Tooltip = function (element, options) {
    this.type       =
    this.options    =
    this.enabled    =
    this.timeout    =
    this.hoverState =
    this.$element   = null

    this.init('tooltip', element, options)
  }

  Tooltip.VERSION  = '3.2.0'

  Tooltip.DEFAULTS = {
    animation: true,
    placement: 'top',
    selector: false,
    template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
    trigger: 'hover focus',
    title: '',
    delay: 0,
    html: false,
    container: false,
    viewport: {
      selector: 'body',
      padding: 0
    }
  }

  Tooltip.prototype.init = function (type, element, options) {
    this.enabled   = true
    this.type      = type
    this.$element  = $(element)
    this.options   = this.getOptions(options)
    this.$viewport = this.options.viewport && $(this.options.viewport.selector || this.options.viewport)

    var triggers = this.options.trigger.split(' ')

    for (var i = triggers.length; i--;) {
      var trigger = triggers[i]

      if (trigger == 'click') {
        this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this))
      } else if (trigger != 'manual') {
        var eventIn  = trigger == 'hover' ? 'mouseenter' : 'focusin'
        var eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout'

        this.$element.on(eventIn  + '.' + this.type, this.options.selector, $.proxy(this.enter, this))
        this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this))
      }
    }

    this.options.selector ?
      (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' })) :
      this.fixTitle()
  }

  Tooltip.prototype.getDefaults = function () {
    return Tooltip.DEFAULTS
  }

  Tooltip.prototype.getOptions = function (options) {
    options = $.extend({}, this.getDefaults(), this.$element.data(), options)

    if (options.delay && typeof options.delay == 'number') {
      options.delay = {
        show: options.delay,
        hide: options.delay
      }
    }

    return options
  }

  Tooltip.prototype.getDelegateOptions = function () {
    var options  = {}
    var defaults = this.getDefaults()

    this._options && $.each(this._options, function (key, value) {
      if (defaults[key] != value) options[key] = value
    })

    return options
  }

  Tooltip.prototype.enter = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget).data('bs.' + this.type)

    if (!self) {
      self = new this.constructor(obj.currentTarget, this.getDelegateOptions())
      $(obj.currentTarget).data('bs.' + this.type, self)
    }

    clearTimeout(self.timeout)

    self.hoverState = 'in'

    if (!self.options.delay || !self.options.delay.show) return self.show()

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'in') self.show()
    }, self.options.delay.show)
  }

  Tooltip.prototype.leave = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget).data('bs.' + this.type)

    if (!self) {
      self = new this.constructor(obj.currentTarget, this.getDelegateOptions())
      $(obj.currentTarget).data('bs.' + this.type, self)
    }

    clearTimeout(self.timeout)

    self.hoverState = 'out'

    if (!self.options.delay || !self.options.delay.hide) return self.hide()

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'out') self.hide()
    }, self.options.delay.hide)
  }

  Tooltip.prototype.show = function () {
    var e = $.Event('show.bs.' + this.type)

    if (this.hasContent() && this.enabled) {
      this.$element.trigger(e)

      var inDom = $.contains(document.documentElement, this.$element[0])
      if (e.isDefaultPrevented() || !inDom) return
      var that = this

      var $tip = this.tip()

      var tipId = this.getUID(this.type)

      this.setContent()
      $tip.attr('id', tipId)
      this.$element.attr('aria-describedby', tipId)

      if (this.options.animation) $tip.addClass('fade')

      var placement = typeof this.options.placement == 'function' ?
        this.options.placement.call(this, $tip[0], this.$element[0]) :
        this.options.placement

      var autoToken = /\s?auto?\s?/i
      var autoPlace = autoToken.test(placement)
      if (autoPlace) placement = placement.replace(autoToken, '') || 'top'

      $tip
        .detach()
        .css({ top: 0, left: 0, display: 'block' })
        .addClass(placement)
        .data('bs.' + this.type, this)

      this.options.container ? $tip.appendTo(this.options.container) : $tip.insertAfter(this.$element)

      var pos          = this.getPosition()
      var actualWidth  = $tip[0].offsetWidth
      var actualHeight = $tip[0].offsetHeight

      if (autoPlace) {
        var orgPlacement = placement
        var $parent      = this.$element.parent()
        var parentDim    = this.getPosition($parent)

        placement = placement == 'bottom' && pos.top   + pos.height       + actualHeight - parentDim.scroll > parentDim.height ? 'top'    :
                    placement == 'top'    && pos.top   - parentDim.scroll - actualHeight < 0                                   ? 'bottom' :
                    placement == 'right'  && pos.right + actualWidth      > parentDim.width                                    ? 'left'   :
                    placement == 'left'   && pos.left  - actualWidth      < parentDim.left                                     ? 'right'  :
                    placement

        $tip
          .removeClass(orgPlacement)
          .addClass(placement)
      }

      var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight)

      this.applyPlacement(calculatedOffset, placement)

      var complete = function () {
        that.$element.trigger('shown.bs.' + that.type)
        that.hoverState = null
      }

      $.support.transition && this.$tip.hasClass('fade') ?
        $tip
          .one('bsTransitionEnd', complete)
          .emulateTransitionEnd(150) :
        complete()
    }
  }

  Tooltip.prototype.applyPlacement = function (offset, placement) {
    var $tip   = this.tip()
    var width  = $tip[0].offsetWidth
    var height = $tip[0].offsetHeight

    // manually read margins because getBoundingClientRect includes difference
    var marginTop = parseInt($tip.css('margin-top'), 10)
    var marginLeft = parseInt($tip.css('margin-left'), 10)

    // we must check for NaN for ie 8/9
    if (isNaN(marginTop))  marginTop  = 0
    if (isNaN(marginLeft)) marginLeft = 0

    offset.top  = offset.top  + marginTop
    offset.left = offset.left + marginLeft

    // $.fn.offset doesn't round pixel values
    // so we use setOffset directly with our own function B-0
    $.offset.setOffset($tip[0], $.extend({
      using: function (props) {
        $tip.css({
          top: Math.round(props.top),
          left: Math.round(props.left)
        })
      }
    }, offset), 0)

    $tip.addClass('in')

    // check to see if placing tip in new offset caused the tip to resize itself
    var actualWidth  = $tip[0].offsetWidth
    var actualHeight = $tip[0].offsetHeight

    if (placement == 'top' && actualHeight != height) {
      offset.top = offset.top + height - actualHeight
    }

    var delta = this.getViewportAdjustedDelta(placement, offset, actualWidth, actualHeight)

    if (delta.left) offset.left += delta.left
    else offset.top += delta.top

    var arrowDelta          = delta.left ? delta.left * 2 - width + actualWidth : delta.top * 2 - height + actualHeight
    var arrowPosition       = delta.left ? 'left'        : 'top'
    var arrowOffsetPosition = delta.left ? 'offsetWidth' : 'offsetHeight'

    $tip.offset(offset)
    this.replaceArrow(arrowDelta, $tip[0][arrowOffsetPosition], arrowPosition)
  }

  Tooltip.prototype.replaceArrow = function (delta, dimension, position) {
    this.arrow().css(position, delta ? (50 * (1 - delta / dimension) + '%') : '')
  }

  Tooltip.prototype.setContent = function () {
    var $tip  = this.tip()
    var title = this.getTitle()

    $tip.find('.tooltip-inner')[this.options.html ? 'html' : 'text'](title)
    $tip.removeClass('fade in top bottom left right')
  }

  Tooltip.prototype.hide = function () {
    var that = this
    var $tip = this.tip()
    var e    = $.Event('hide.bs.' + this.type)

    this.$element.removeAttr('aria-describedby')

    function complete() {
      if (that.hoverState != 'in') $tip.detach()
      that.$element.trigger('hidden.bs.' + that.type)
    }

    this.$element.trigger(e)

    if (e.isDefaultPrevented()) return

    $tip.removeClass('in')

    $.support.transition && this.$tip.hasClass('fade') ?
      $tip
        .one('bsTransitionEnd', complete)
        .emulateTransitionEnd(150) :
      complete()

    this.hoverState = null

    return this
  }

  Tooltip.prototype.fixTitle = function () {
    var $e = this.$element
    if ($e.attr('title') || typeof ($e.attr('data-original-title')) != 'string') {
      $e.attr('data-original-title', $e.attr('title') || '').attr('title', '')
    }
  }

  Tooltip.prototype.hasContent = function () {
    return this.getTitle()
  }

  Tooltip.prototype.getPosition = function ($element) {
    $element   = $element || this.$element
    var el     = $element[0]
    var isBody = el.tagName == 'BODY'
    return $.extend({}, (typeof el.getBoundingClientRect == 'function') ? el.getBoundingClientRect() : null, {
      scroll: isBody ? document.documentElement.scrollTop || document.body.scrollTop : $element.scrollTop(),
      width:  isBody ? $(window).width()  : $element.outerWidth(),
      height: isBody ? $(window).height() : $element.outerHeight()
    }, isBody ? { top: 0, left: 0 } : $element.offset())
  }

  Tooltip.prototype.getCalculatedOffset = function (placement, pos, actualWidth, actualHeight) {
    return placement == 'bottom' ? { top: pos.top + pos.height,   left: pos.left + pos.width / 2 - actualWidth / 2  } :
           placement == 'top'    ? { top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2  } :
           placement == 'left'   ? { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth } :
        /* placement == 'right' */ { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width   }

  }

  Tooltip.prototype.getViewportAdjustedDelta = function (placement, pos, actualWidth, actualHeight) {
    var delta = { top: 0, left: 0 }
    if (!this.$viewport) return delta

    var viewportPadding = this.options.viewport && this.options.viewport.padding || 0
    var viewportDimensions = this.getPosition(this.$viewport)

    if (/right|left/.test(placement)) {
      var topEdgeOffset    = pos.top - viewportPadding - viewportDimensions.scroll
      var bottomEdgeOffset = pos.top + viewportPadding - viewportDimensions.scroll + actualHeight
      if (topEdgeOffset < viewportDimensions.top) { // top overflow
        delta.top = viewportDimensions.top - topEdgeOffset
      } else if (bottomEdgeOffset > viewportDimensions.top + viewportDimensions.height) { // bottom overflow
        delta.top = viewportDimensions.top + viewportDimensions.height - bottomEdgeOffset
      }
    } else {
      var leftEdgeOffset  = pos.left - viewportPadding
      var rightEdgeOffset = pos.left + viewportPadding + actualWidth
      if (leftEdgeOffset < viewportDimensions.left) { // left overflow
        delta.left = viewportDimensions.left - leftEdgeOffset
      } else if (rightEdgeOffset > viewportDimensions.width) { // right overflow
        delta.left = viewportDimensions.left + viewportDimensions.width - rightEdgeOffset
      }
    }

    return delta
  }

  Tooltip.prototype.getTitle = function () {
    var title
    var $e = this.$element
    var o  = this.options

    title = $e.attr('data-original-title')
      || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title)

    return title
  }

  Tooltip.prototype.getUID = function (prefix) {
    do prefix += ~~(Math.random() * 1000000)
    while (document.getElementById(prefix))
    return prefix
  }

  Tooltip.prototype.tip = function () {
    return (this.$tip = this.$tip || $(this.options.template))
  }

  Tooltip.prototype.arrow = function () {
    return (this.$arrow = this.$arrow || this.tip().find('.tooltip-arrow'))
  }

  Tooltip.prototype.validate = function () {
    if (!this.$element[0].parentNode) {
      this.hide()
      this.$element = null
      this.options  = null
    }
  }

  Tooltip.prototype.enable = function () {
    this.enabled = true
  }

  Tooltip.prototype.disable = function () {
    this.enabled = false
  }

  Tooltip.prototype.toggleEnabled = function () {
    this.enabled = !this.enabled
  }

  Tooltip.prototype.toggle = function (e) {
    var self = this
    if (e) {
      self = $(e.currentTarget).data('bs.' + this.type)
      if (!self) {
        self = new this.constructor(e.currentTarget, this.getDelegateOptions())
        $(e.currentTarget).data('bs.' + this.type, self)
      }
    }

    self.tip().hasClass('in') ? self.leave(self) : self.enter(self)
  }

  Tooltip.prototype.destroy = function () {
    clearTimeout(this.timeout)
    this.hide().$element.off('.' + this.type).removeData('bs.' + this.type)
  }


  // TOOLTIP PLUGIN DEFINITION
  // =========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.tooltip')
      var options = typeof option == 'object' && option

      if (!data && option == 'destroy') return
      if (!data) $this.data('bs.tooltip', (data = new Tooltip(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.tooltip

  $.fn.tooltip             = Plugin
  $.fn.tooltip.Constructor = Tooltip


  // TOOLTIP NO CONFLICT
  // ===================

  $.fn.tooltip.noConflict = function () {
    $.fn.tooltip = old
    return this
  }

}(jQuery);
 ; 

return jQuery; 

});


//@ sourceURL=/vendor/bootstrap/js/tooltip.js

;
define('shim!vendor/bootstrap/js/popover[shim!vendor/bootstrap/js/tooltip[modules/jquery-mozu=jQuery]>jQuery=jQuery]>jQuery',['shim!vendor/bootstrap/js/tooltip[modules/jquery-mozu=jQuery]>jQuery'], function(jQuery) { 

/* ========================================================================
 * Bootstrap: popover.js v3.2.0
 * http://getbootstrap.com/javascript/#popovers
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  

  // POPOVER PUBLIC CLASS DEFINITION
  // ===============================

  var Popover = function (element, options) {
    this.init('popover', element, options)
  }

  if (!$.fn.tooltip) throw new Error('Popover requires tooltip.js')

  Popover.VERSION  = '3.2.0'

  Popover.DEFAULTS = $.extend({}, $.fn.tooltip.Constructor.DEFAULTS, {
    placement: 'right',
    trigger: 'click',
    content: '',
    template: '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
  })


  // NOTE: POPOVER EXTENDS tooltip.js
  // ================================

  Popover.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype)

  Popover.prototype.constructor = Popover

  Popover.prototype.getDefaults = function () {
    return Popover.DEFAULTS
  }

  Popover.prototype.setContent = function () {
    var $tip    = this.tip()
    var title   = this.getTitle()
    var content = this.getContent()

    $tip.find('.popover-title')[this.options.html ? 'html' : 'text'](title)
    $tip.find('.popover-content').empty()[ // we use append for html objects to maintain js events
      this.options.html ? (typeof content == 'string' ? 'html' : 'append') : 'text'
    ](content)

    $tip.removeClass('fade top bottom left right in')

    // IE8 doesn't accept hiding via the `:empty` pseudo selector, we have to do
    // this manually by checking the contents.
    if (!$tip.find('.popover-title').html()) $tip.find('.popover-title').hide()
  }

  Popover.prototype.hasContent = function () {
    return this.getTitle() || this.getContent()
  }

  Popover.prototype.getContent = function () {
    var $e = this.$element
    var o  = this.options

    return $e.attr('data-content')
      || (typeof o.content == 'function' ?
            o.content.call($e[0]) :
            o.content)
  }

  Popover.prototype.arrow = function () {
    return (this.$arrow = this.$arrow || this.tip().find('.arrow'))
  }

  Popover.prototype.tip = function () {
    if (!this.$tip) this.$tip = $(this.options.template)
    return this.$tip
  }


  // POPOVER PLUGIN DEFINITION
  // =========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.popover')
      var options = typeof option == 'object' && option

      if (!data && option == 'destroy') return
      if (!data) $this.data('bs.popover', (data = new Popover(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.popover

  $.fn.popover             = Plugin
  $.fn.popover.Constructor = Popover


  // POPOVER NO CONFLICT
  // ===================

  $.fn.popover.noConflict = function () {
    $.fn.popover = old
    return this
  }

}(jQuery);
 ; 

return jQuery; 

});


//@ sourceURL=/vendor/bootstrap/js/popover.js

;
/*! http://mths.be/placeholder v2.1.0 by @mathias */
(function(factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD
		define('vendor/jquery-placeholder/jquery.placeholder',['jquery'], factory);
	} else {
		// Browser globals
		factory(jQuery);
	}
}(function($) {

	// Opera Mini v7 doesn’t support placeholder although its DOM seems to indicate so
	var isOperaMini = Object.prototype.toString.call(window.operamini) == '[object OperaMini]';
	var isInputSupported = 'placeholder' in document.createElement('input') && !isOperaMini;
	var isTextareaSupported = 'placeholder' in document.createElement('textarea') && !isOperaMini;
	var valHooks = $.valHooks;
	var propHooks = $.propHooks;
	var hooks;
	var placeholder;

	if (isInputSupported && isTextareaSupported) {

		placeholder = $.fn.placeholder = function() {
			return this;
		};

		placeholder.input = placeholder.textarea = true;

	} else {

		var settings = {};

		placeholder = $.fn.placeholder = function(options) {

			var defaults = {customClass: 'placeholder'};
			settings = $.extend({}, defaults, options);

			var $this = this;
			$this
				.filter((isInputSupported ? 'textarea' : ':input') + '[placeholder]')
				.not('.'+settings.customClass)
				.bind({
					'focus.placeholder': clearPlaceholder,
					'blur.placeholder': setPlaceholder
				})
				.data('placeholder-enabled', true)
				.trigger('blur.placeholder');
			return $this;
		};

		placeholder.input = isInputSupported;
		placeholder.textarea = isTextareaSupported;

		hooks = {
			'get': function(element) {
				var $element = $(element);

				var $passwordInput = $element.data('placeholder-password');
				if ($passwordInput) {
					return $passwordInput[0].value;
				}

				return $element.data('placeholder-enabled') && $element.hasClass('placeholder') ? '' : element.value;
			},
			'set': function(element, value) {
				var $element = $(element);

				var $passwordInput = $element.data('placeholder-password');
				if ($passwordInput) {
					return $passwordInput[0].value = value;
				}

				if (!$element.data('placeholder-enabled')) {
					return element.value = value;
				}
				if (value === '') {
					element.value = value;
					// Issue #56: Setting the placeholder causes problems if the element continues to have focus.
					if (element != safeActiveElement()) {
						// We can't use `triggerHandler` here because of dummy text/password inputs :(
						setPlaceholder.call(element);
					}
				} else if ($element.hasClass(settings.customClass)) {
					clearPlaceholder.call(element, true, value) || (element.value = value);
				} else {
					element.value = value;
				}
				// `set` can not return `undefined`; see http://jsapi.info/jquery/1.7.1/val#L2363
				return $element;
			}
		};

		if (!isInputSupported) {
			valHooks.input = hooks;
			propHooks.value = hooks;
		}
		if (!isTextareaSupported) {
			valHooks.textarea = hooks;
			propHooks.value = hooks;
		}

		$(function() {
			// Look for forms
			$(document).delegate('form', 'submit.placeholder', function() {
				// Clear the placeholder values so they don't get submitted
				var $inputs = $('.'+settings.customClass, this).each(clearPlaceholder);
				setTimeout(function() {
					$inputs.each(setPlaceholder);
				}, 10);
			});
		});

		// Clear placeholder values upon page reload
		$(window).bind('beforeunload.placeholder', function() {
			$('.'+settings.customClass).each(function() {
				this.value = '';
			});
		});

	}

	function args(elem) {
		// Return an object of element attributes
		var newAttrs = {};
		var rinlinejQuery = /^jQuery\d+$/;
		$.each(elem.attributes, function(i, attr) {
			if (attr.specified && !rinlinejQuery.test(attr.name)) {
				newAttrs[attr.name] = attr.value;
			}
		});
		return newAttrs;
	}

	function clearPlaceholder(event, value) {
		var input = this;
		var $input = $(input);
		if (input.value == $input.attr('placeholder') && $input.hasClass(settings.customClass)) {
			if ($input.data('placeholder-password')) {
				$input = $input.hide().nextAll('input[type="password"]:first').show().attr('id', $input.removeAttr('id').data('placeholder-id'));
				// If `clearPlaceholder` was called from `$.valHooks.input.set`
				if (event === true) {
					return $input[0].value = value;
				}
				$input.focus();
			} else {
				input.value = '';
				$input.removeClass(settings.customClass);
				input == safeActiveElement() && input.select();
			}
		}
	}

	function setPlaceholder() {
		var $replacement;
		var input = this;
		var $input = $(input);
		var id = this.id;
		if (input.value === '') {
			if (input.type === 'password') {
			    if (!$input.data('placeholder-textinput')) {
                    // JBZ 2014, replaced his more optimistic .clone() method with this one because IE8 will silently fail to change the display characters of a password field
				    $replacement = $('<input>').attr($.extend(args(this), { 'type': 'text' }));
					$replacement
						.removeAttr('name')
						.data({
							'placeholder-password': $input,
							'placeholder-id': id
						})
						.bind('focus.placeholder', clearPlaceholder);
					$input
						.data({
							'placeholder-textinput': $replacement,
							'placeholder-id': id
						})
						.before($replacement);
				}
				$input = $input.removeAttr('id').hide().prevAll('input[type="text"]:first').attr('id', id).show();
				// Note: `$input[0] != input` now!
			}
			$input.addClass(settings.customClass);
			$input[0].value = $input.attr('placeholder');
		} else {
			$input.removeClass(settings.customClass);
		}
	}

	function safeActiveElement() {
		// Avoid IE9 `document.activeElement` of death
		// https://github.com/mathiasbynens/jquery-placeholder/pull/99
		try {
			return document.activeElement;
		} catch (exception) {}
	}

}));

/**
 * Adds a login popover to all login links on a page.
 */
define('modules/login-links',['shim!vendor/bootstrap/js/popover[shim!vendor/bootstrap/js/tooltip[modules/jquery-mozu=jQuery]>jQuery=jQuery]>jQuery', 'modules/api', 'hyprlive', 'underscore', 'vendor/jquery-placeholder/jquery.placeholder'], function ($, api, Hypr, _) {

    var usePopovers = function() {
        return !Modernizr.mq('(max-width: 480px)');
    },
    isTemplate = function(path) {
        return require.mozuData('pagecontext').cmsContext.template.path === path;
    },
    returnFalse = function () {
        return false;
    },
    $docBody,

    polyfillPlaceholders = !('placeholder' in $('<input>')[0]);

    var DismissablePopover = function () { };

    $.extend(DismissablePopover.prototype, {
        boundMethods: [],
        setMethodContext: function () {
            for (var i = this.boundMethods.length - 1; i >= 0; i--) {
                this[this.boundMethods[i]] = $.proxy(this[this.boundMethods[i]], this);
            }
        },
        dismisser: function (e) {
            if (!$.contains(this.popoverInstance.$tip[0], e.target) && !this.loading) {
                // clicking away from a popped popover should dismiss it
                this.$el.popover('destroy');
                this.$el.on('click', this.createPopover);
                this.$el.off('click', returnFalse);
                this.bindListeners(false);
                $docBody.off('click', this.dismisser);
            }
        },
        setLoading: function (yes) {
            this.loading = yes;
            this.$parent[yes ? 'addClass' : 'removeClass']('is-loading');
        },
        onPopoverShow: function () {
            var self = this;
            _.defer(function () {
                $docBody.on('click', self.dismisser);
                self.$el.on('click', returnFalse);
            });
            this.popoverInstance = this.$el.data('bs.popover');
            this.$parent = this.popoverInstance.tip();
            this.bindListeners(true);
            this.$el.off('click', this.createPopover);
            if (polyfillPlaceholders) {
                this.$parent.find('[placeholder]').placeholder({ customClass: 'mz-placeholder' });
            }
        },
        createPopover: function (e) {
            // in the absence of JS or in a small viewport, these links go to the login page.
            // Prevent them from going there!
            var self = this;
            if (usePopovers()) {
                e.preventDefault();
                // If the parent element's not positioned at least relative,
                // the popover won't move with a window resize
                //var pos = $parent.css('position');
                //if (!pos || pos === "static") $parent.css('position', 'relative');
                this.$el.popover({
                    //placement: "auto right",
                    animation: true,
                    html: true,
                    trigger: 'manual',
                    content: this.template,
                    container: 'body'
                }).on('shown.bs.popover', this.onPopoverShow)
                .popover('show');

            }
        },
        retrieveErrorLabel: function (xhr) {
            var message = "";
            if (xhr.message) {
                message = Hypr.getLabel(xhr.message);
            } else if ((xhr && xhr.responseJSON && xhr.responseJSON.message)) {
                message = Hypr.getLabel(xhr.responseJSON.message);
            }

            if (!message || message.length === 0) {
                this.displayApiMessage(xhr);
            } else {
                var msgCont = {};
                msgCont.message = message;
                this.displayApiMessage(msgCont);
            }
        },
        displayApiMessage: function (xhr) {
            this.displayMessage(xhr.message ||
                (xhr && xhr.responseJSON && xhr.responseJSON.message) ||
                Hypr.getLabel('unexpectedError'));
        },
        displayMessage: function (msg) {
            this.setLoading(false);
            this.$parent.find('[data-mz-role="popover-message"]').html('<span class="mz-validationmessage">' + msg + '</span>');
        },
        init: function (el) {
            this.$el = $(el);
            this.loading = false;
            this.setMethodContext();
            if (!this.pageType){
                this.$el.on('click', this.createPopover);
            }
            else {
               this.$el.on('click', _.bind(this.doFormSubmit, this));
            }    
        },
        doFormSubmit: function(e){
            e.preventDefault();
            this.$parent = this.$el.closest(this.formSelector);
            this[this.pageType]();
        }
    });

    var LoginPopover = function() {
        DismissablePopover.apply(this, arguments);
        this.login = _.debounce(this.login, 150);
        this.retrievePassword = _.debounce(this.retrievePassword, 150);
    };
    LoginPopover.prototype = new DismissablePopover();
    $.extend(LoginPopover.prototype, {
        boundMethods: ['handleEnterKey', 'handleLoginComplete', 'displayResetPasswordMessage', 'dismisser', 'displayMessage', 'displayApiMessage', 'createPopover', 'slideRight', 'slideLeft', 'login', 'retrievePassword', 'onPopoverShow'],
        template: Hypr.getTemplate('modules/common/login-popover').render(),
        bindListeners: function (on) {
            var onOrOff = on ? "on" : "off";
            this.$parent[onOrOff]('click', '[data-mz-action="forgotpasswordform"]', this.slideRight);
            this.$parent[onOrOff]('click', '[data-mz-action="loginform"]', this.slideLeft);
            this.$parent[onOrOff]('click', '[data-mz-action="submitlogin"]', this.login);
            this.$parent[onOrOff]('click', '[data-mz-action="submitforgotpassword"]', this.retrievePassword);
            this.$parent[onOrOff]('keypress', 'input', this.handleEnterKey);
        },
        onPopoverShow: function () {
            DismissablePopover.prototype.onPopoverShow.apply(this, arguments);
            this.panelWidth = this.$parent.find('.mz-l-slidebox-panel').first().outerWidth();
            this.$slideboxOuter = this.$parent.find('.mz-l-slidebox-outer');

            if (this.$el.hasClass('mz-forgot')){
                this.slideRight();
            }
        },
        handleEnterKey: function (e) {
            if (e.which === 13) {
                var $parentForm = $(e.currentTarget).parents('[data-mz-role]');
                switch ($parentForm.data('mz-role')) {
                    case "login-form":
                        this.login();
                        break;
                    case "forgotpassword-form":
                        this.retrievePassword();
                        break;
                }
                return false;
            }
        },
        slideRight: function (e) {
            if (e) e.preventDefault();
            this.$slideboxOuter.css('left', -this.panelWidth);
        },
        slideLeft: function (e) {
            if (e) e.preventDefault();
            this.$slideboxOuter.css('left', 0);
        },
        login: function () {
            this.setLoading(true);
            api.action('customer', 'loginStorefront', {
                email: this.$parent.find('[data-mz-login-email]').val(),
                password: this.$parent.find('[data-mz-login-password]').val()
            }).then(this.handleLoginComplete, this.displayApiMessage);
        },
        anonymousorder: function() {
            var email = "";
            var billingZipCode = "";
            var billingPhoneNumber = "";

            switch (this.$parent.find('[data-mz-verify-with]').val()) {
                case "zipCode":
                    {
                        billingZipCode = this.$parent.find('[data-mz-verification]').val();
                        email = null;
                        billingPhoneNumber = null;
                        break;
                    }
                case "phoneNumber":
                    {
                        billingZipCode = null;
                        email = null;
                        billingPhoneNumber = this.$parent.find('[data-mz-verification]').val();
                        break;
                    }
                case "email":
                    {
                        billingZipCode = null;
                        email = this.$parent.find('[data-mz-verification]').val();
                        billingPhoneNumber = null;
                        break;
                    }
                default:
                    {
                        billingZipCode = null;
                        email = null;
                        billingPhoneNumber = null;
                        break;
                    }

            }

            this.setLoading(true);
            // the new handle message needs to take the redirect.
            api.action('customer', 'orderStatusLogin', {
                ordernumber: this.$parent.find('[data-mz-order-number]').val(),
                email: email,
                billingZipCode: billingZipCode,
                billingPhoneNumber: billingPhoneNumber
            }).then(function () { window.location.href = "/my-anonymous-account"; }, _.bind(this.retrieveErrorLabel, this));
        },
        retrievePassword: function () {
            this.setLoading(true);
            api.action('customer', 'resetPasswordStorefront', {
                EmailAddress: this.$parent.find('[data-mz-forgotpassword-email]').val()
            }).then(_.bind(this.displayResetPasswordMessage,this), this.displayApiMessage);
        },
        handleLoginComplete: function () {
            window.location.reload();
        },
        displayResetPasswordMessage: function () {
            this.displayMessage(Hypr.getLabel('resetEmailSent'));
        }
    });

    var SignupPopover = function() {
        DismissablePopover.apply(this, arguments);
        this.signup = _.debounce(this.signup, 150);
    };
    SignupPopover.prototype = new DismissablePopover();
    $.extend(SignupPopover.prototype, LoginPopover.prototype, {
        boundMethods: ['handleEnterKey', 'dismisser', 'displayMessage', 'displayApiMessage', 'createPopover', 'signup', 'onPopoverShow'],
        template: Hypr.getTemplate('modules/common/signup-popover').render(),
        bindListeners: function (on) {
            var onOrOff = on ? "on" : "off";
            this.$parent[onOrOff]('click', '[data-mz-action="signup"]', this.signup);
            this.$parent[onOrOff]('keypress', 'input', this.handleEnterKey);
        },
        handleEnterKey: function (e) {
            if (e.which === 13) { this.signup(); }
        },
        validate: function (payload) {
            if (!payload.account.emailAddress) return this.displayMessage(Hypr.getLabel('emailMissing')), false;
            if (!payload.password) return this.displayMessage(Hypr.getLabel('passwordMissing')), false;
            if (payload.password !== this.$parent.find('[data-mz-signup-confirmpassword]').val()) return this.displayMessage(Hypr.getLabel('passwordsDoNotMatch')), false;
            return true;
        },
        signup: function () {
            var self = this,
                email = this.$parent.find('[data-mz-signup-emailaddress]').val(),
                firstName = this.$parent.find('[data-mz-signup-firstname]').val(),
                lastName = this.$parent.find('[data-mz-signup-lastname]').val(),
                payload = {
                    account: {
                        emailAddress: email,
                        userName: email,
                        firstName: firstName,
                        lastName: lastName,
                        contacts: [{
                            email: email,
                            firstName: firstName,
                            lastNameOrSurname: lastName
                        }]
                    },
                    password: this.$parent.find('[data-mz-signup-password]').val()
                };
            if (this.validate(payload)) {   
                //var user = api.createSync('user', payload);
                this.setLoading(true);
                return api.action('customer', 'createStorefront', payload).then(function () {
                    if (self.redirectTemplate) {
                        window.location.pathname = self.redirectTemplate;
                    }
                    else {
                        window.location.reload();
                    }
                }, self.displayApiMessage);
            }
        }
    });

    $(document).ready(function() {
        $docBody = $(document.body);
        $('[data-mz-action="login"]').each(function() {
            var popover = new LoginPopover();
            popover.init(this);
            $(this).data('mz.popover', popover);
        });
        $('[data-mz-action="signup"]').each(function() {
            var popover = new SignupPopover();
            popover.init(this);
            $(this).data('mz.popover', popover);
        });
        $('[data-mz-action="launchforgotpassword"]').each(function() {
            var popover = new LoginPopover();
            popover.init(this);
            $(this).data('mz.popover', popover);
        });
        $('[data-mz-action="signuppage-submit"]').each(function(){
            var signupPage = new SignupPopover();
            signupPage.formSelector = 'form[name="mz-signupform"]';
            signupPage.pageType = 'signup';
            signupPage.redirectTemplate = 'myaccount';
            signupPage.init(this);
        });
        $('[data-mz-action="loginpage-submit"]').each(function(){
            var loginPage = new SignupPopover();
            loginPage.formSelector = 'form[name="mz-loginform"]';
            loginPage.pageType = 'login';
            loginPage.init(this);
        });
        $('[data-mz-action="anonymousorder-submit"]').each(function () {
            var loginPage = new SignupPopover();
            loginPage.formSelector = 'form[name="mz-anonymousorder"]';
            loginPage.pageType = 'anonymousorder';
            loginPage.init(this);
        });
        $('[data-mz-action="forgotpasswordpage-submit"]').each(function(){
            var loginPage = new SignupPopover();
            loginPage.formSelector = 'form[name="mz-forgotpasswordform"]';
            loginPage.pageType = 'retrievePassword';
            loginPage.init(this);
        });

        $('[data-mz-action="logout"]').each(function(){
            var el = $(this);

            //if were in edit mode, we override the /logout GET, to preserve the correct referrer/page location | #64822
            if (require.mozuData('pagecontext').isEditMode) {
 
                 el.on('click', function(e) {
                    e.preventDefault();
                    $.ajax({
                        method: 'GET',
                        url: '../../logout',
                        complete: function() { location.reload();}
                    });
                });
            }
            
        });
    });

});
define(
    'modules/models-address',["modules/backbone-mozu", 'hyprlive'],
    function(Backbone, Hypr) {


        var countriesRequiringStateAndZip = {
            US: true,
            CA: true,
            JP: true,
            TW: true
        },
            defaultStateProv = "n/a";

        var PhoneNumbers = Backbone.MozuModel.extend({
            validation: {
                home: {
                    required: true,
                    msg: Hypr.getLabel("phoneMissing")
                }
            }
        }),

        StreetAddress = Backbone.MozuModel.extend({
            mozuType: 'address',
            initialize: function() {
                this.on('change:countryCode', this.clearStateAndZipWhenCountryChanges, this);
            },
            clearStateAndZipWhenCountryChanges: function() {
                this.unset('postalOrZipCode');
                this.unset('stateOrProvince');
            },
            validation: {
                address1: {
                    required: true,
                    msg: Hypr.getLabel("streetMissing")
                },
                cityOrTown: {
                    required: true,
                    msg: Hypr.getLabel("cityMissing")
                },
                countryCode: {
                    required: true,
                    msg: Hypr.getLabel("countryMissing")
                },
                stateOrProvince: {
                    fn: "requiresStateAndZip",
                    msg: Hypr.getLabel("stateProvMissing")
                },
                postalOrZipCode: {
                    fn: "requiresStateAndZip",
                    msg: Hypr.getLabel("postalCodeMissing")
                }
            },
            requiresStateAndZip: function(value, attr) {
                if ((this.get('countryCode') in countriesRequiringStateAndZip) && !value) return this.validation[attr.split('.').pop()].msg;
            },
            defaults: {
                candidateValidatedAddresses: null,
                countryCode: Hypr.getThemeSetting('preselectCountryCode') || '',
                addressType: 'Residential'
            },
            toJSON: function(options) {
                // workaround for SA
                var j = Backbone.MozuModel.prototype.toJSON.apply(this, arguments);
                if ((!options || !options.helpers) && !j.stateOrProvince) {
                    j.stateOrProvince = defaultStateProv;
                }
                if (options && options.helpers && j.stateOrProvince === defaultStateProv) {
                    delete j.stateOrProvince;
                }
                return j;
            },
            is: function(another) {
                var s1 = '', s2 = '';
                for (var k in another) {
                    if (k === 'isValidated')
                        continue;
                    s1 = (another[k] || '').toLowerCase();
                    s2 = (this.get(k) || '').toLowerCase();
                    if (s1 != s2) {
                        return false;
                    }
                }
                return true;
            }
        });

        return {
            PhoneNumbers: PhoneNumbers,
            StreetAddress: StreetAddress
        };
    });

define('modules/models-price',["underscore", "modules/backbone-mozu"], function (_, Backbone) {

    var ProductPrice = Backbone.MozuModel.extend({
        dataTypes: {
            price: Backbone.MozuModel.DataTypes.Float,
            salePrice: Backbone.MozuModel.DataTypes.Float,
            offerPrice: Backbone.MozuModel.DataTypes.Float
        },
        helpers: ['onSale'],
        onSale: function() {
            var salePrice = this.get('salePrice');
            return salePrice !== null && !isNaN(salePrice) && salePrice !== this.get("price");
        }
    }),

    ProductPriceRange = Backbone.MozuModel.extend({
        relations: {
            lower: ProductPrice,
            upper: ProductPrice
        }
    });

    return {
        ProductPrice: ProductPrice,
        ProductPriceRange: ProductPriceRange
    };

});
define('modules/models-product',["modules/jquery-mozu", "underscore", "modules/backbone-mozu", "hyprlive", "modules/models-price", "modules/api"], function($, _, Backbone, Hypr, PriceModels, api) {

    function zeroPad(str, len) {
        str = str.toString();
        while (str.length < 2) str = '0' + str;
        return str;
    }
    function formatDate(d) {
        var date = new Date(Date.parse(d) + (new Date()).getTimezoneOffset() * 60000);
        return [zeroPad(date.getFullYear(), 4), zeroPad(date.getMonth() + 1, 2), zeroPad(date.getDate(), 2)].join('-');
    }


    var ProductOption = Backbone.MozuModel.extend({
        idAttribute: "attributeFQN",
        helpers: ['isChecked'],
        initialize: function() {
            var me = this;
            _.defer(function() {
                me.listenTo(me.collection, 'invalidoptionselected', me.handleInvalid, me);
            });

            var equalsThisValue = function(fvalue, newVal) {
                return fvalue.value.toString() === newVal.toString();
            },
            containsThisValue = function(existingOptionValueListing, newVal) {
                return _.some(newVal, function(val) {
                    return equalsThisValue(existingOptionValueListing, val);
                });
            },
            attributeDetail = me.get('attributeDetail');
            if (attributeDetail) {
                if (attributeDetail.valueType === ProductOption.Constants.ValueTypes.Predefined) {
                    this.legalValues = _.chain(this.get('values')).pluck('value').map(function(v) { return !_.isUndefined(v) && !_.isNull(v) ? v.toString() : v; }).value();
                }
                if (attributeDetail.inputType === ProductOption.Constants.InputTypes.YesNo) {
                    me.on('change:value', function(model, newVal) {
                        var values;
                        if (me.previous('value') !== newVal) {
                            values = me.get('values');
                            _.first(values).isSelected = newVal;
                            me.set({
                                value: newVal,
                                shopperEnteredValue: newVal,
                                values: values
                            }, {
                                silent: true
                            });
                            me.trigger('optionchange', newVal, me);
                        }
                    });
                } else {
                    me.on("change:value", function(model, newVal) {
                        var newValObj, values = me.get("values"),
                            comparator = this.get('isMultiValue') ? containsThisValue : equalsThisValue;
                        if (typeof newVal === "string") newVal = $.trim(newVal);
                        if (newVal || newVal === false || newVal === 0 || newVal === '') {
                            _.each(values, function(fvalue) {
                                if (comparator(fvalue, newVal)) {
                                    newValObj = fvalue;
                                    fvalue.isSelected = true;
                                    me.set("value", newVal, { silent: true });
                                } else {
                                    fvalue.isSelected = false;
                                }
                            });
                            me.set("values", values);
                            if (me.get("attributeDetail").valueType === ProductOption.Constants.ValueTypes.ShopperEntered) {
                                me.set("shopperEnteredValue", newVal, { silent: true });
                            }
                        } else {
                            me.unset('value');
                            me.unset("shopperEnteredValue");
                        }
                        if (newValObj && !newValObj.isEnabled) me.collection.trigger('invalidoptionselected', newValObj, me);
                        me.trigger('optionchange', newVal, me);
                    });
                }
            }
        },
        handleInvalid: function(newValObj, opt) {
            if (this !== opt) {
                this.unset("value");
                _.each(this.get("values"), function(value) {
                    value.isSelected = false;
                });
            }
        },
        parse: function(raw) {
            var selectedValue, vals, storedShopperValue;
            if (raw.isMultiValue) {
                vals = _.pluck(_.where(raw.values, { isSelected: true }), 'value');
                if (vals && vals.length > 0) raw.value = vals;
            } else {
                selectedValue = _.findWhere(raw.values, { isSelected: true });
                if (selectedValue) raw.value = selectedValue.value;
            }
            if (raw.attributeDetail) {
                if (raw.attributeDetail.valueType !== ProductOption.Constants.ValueTypes.Predefined) {
                    storedShopperValue = raw.values[0] && raw.values[0].shopperEnteredValue;
                    if (storedShopperValue || storedShopperValue === 0) {
                        raw.shopperEnteredValue = storedShopperValue;
                        raw.value = storedShopperValue;
                    }
                }
                if (raw.attributeDetail.inputType === ProductOption.Constants.InputTypes.Date && raw.attributeDetail.validation) {
                    raw.minDate = formatDate(raw.attributeDetail.validation.minDateValue);
                    raw.maxDate = formatDate(raw.attributeDetail.validation.maxDateValue);
                }
            }
            return raw;
        },
        isChecked: function() {
            var attributeDetail = this.get('attributeDetail'),
                values = this.get('values');

            return !!(attributeDetail && attributeDetail.inputType === ProductOption.Constants.InputTypes.YesNo && values && this.get('shopperEnteredValue'));
        },
        isValidValue: function() {
            var value = this.getValueOrShopperEnteredValue();
            return value !== undefined && value !== '' && (this.get('attributeDetail').valueType !== ProductOption.Constants.ValueTypes.Predefined || (this.get('isMultiValue') ? !_.difference(_.map(value, function(v) { return v.toString(); }), this.legalValues).length : _.contains(this.legalValues, value.toString())));
        },
        getValueOrShopperEnteredValue: function() {
            return this.get('value') || (this.get('value') === 0) ? this.get('value') : this.get('shopperEnteredValue');
        },
        isConfigured: function() {
            var attributeDetail = this.get('attributeDetail');
            if (!attributeDetail) return true; // if attributeDetail is missing, this is a preconfigured product
            return attributeDetail.inputType === ProductOption.Constants.InputTypes.YesNo ? this.isChecked() : this.isValidValue();
        },
        toJSON: function(options) {
            var j = Backbone.MozuModel.prototype.toJSON.apply(this, arguments);
            if (j && j.attributeDetail && j.attributeDetail.valueType !== ProductOption.Constants.ValueTypes.Predefined && this.isConfigured()) {
                var val = j.value || j.shopperEnteredValue;
                if (j.attributeDetail.dataType === "Number") val = parseFloat(val);
                j.shopperEnteredValue = j.value = val;
            }

            return j;
        },
        addConfiguration: function(biscuit, options) {
            var fqn, value, attributeDetail, valueKey, pushConfigObject;
            if (this.isConfigured()) {
                if (options && options.unabridged) {
                    biscuit.push(this.toJSON());
                } else {
                    fqn = this.get('attributeFQN');
                    value = this.getValueOrShopperEnteredValue();
                    attributeDetail = this.get('attributeDetail');
                    valueKey = attributeDetail.valueType === ProductOption.Constants.ValueTypes.ShopperEntered ? "shopperEnteredValue" : "value";
                    if (attributeDetail.dataType === "Number") value = parseFloat(value);
                    pushConfigObject = function(val) {
                        var o = {
                            attributeFQN: fqn
                        };
                        o[valueKey] = val;
                        biscuit.push(o);
                    };
                    if (_.isArray(value)) {
                        _.each(value, pushConfigObject);
                    } else {
                        pushConfigObject(value);
                    }
                }
            }
        }
    }, {
        Constants: {
            ValueTypes: {
                Predefined: "Predefined",
                ShopperEntered: "ShopperEntered",
                AdminEntered: "AdminEntered"
            },
            InputTypes: {
                List: "List",
                YesNo: "YesNo",
                Date: "Date"
            }
        }
    }),

    ProductContent = Backbone.MozuModel.extend({}),

    Product = Backbone.MozuModel.extend({
        mozuType: 'product',
        idAttribute: 'productCode',
        handlesMessages: true,
        helpers: ['mainImage', 'notDoneConfiguring', 'hasPriceRange', 'supportsInStorePickup'],
        defaults: {
            purchasableState: {},
            quantity: 1
        },
        dataTypes: {
            quantity: Backbone.MozuModel.DataTypes.Int
        },
        validation: {
            quantity: {
                min: 1,
                msg: Hypr.getLabel('enterProductQuantity')
            }
        },
        relations: {
            content: ProductContent,
            price: PriceModels.ProductPrice,
            priceRange: PriceModels.ProductPriceRange,
            options: Backbone.Collection.extend({
                model: ProductOption
            })
        },
        getBundledProductProperties: function(opts) {
            var self = this,
                loud = !opts || !opts.silent;
            if (loud) {
                this.isLoading(true);
                this.trigger('request');
            }

            var bundledProducts = this.get('bundledProducts'),
                numReqs = bundledProducts.length,
                deferred = api.defer();
            _.each(bundledProducts, function(bp) {
                var op = api.get('product', bp.productCode);
                op.ensure(function() {
                    if (--numReqs === 0) {
                        _.defer(function() {
                            self.set('bundledProducts', bundledProducts);
                            if (loud) {
                                this.trigger('sync', bundledProducts);
                                this.isLoading(false);
                            }
                            deferred.resolve(bundledProducts);
                        });
                    }
                });
                op.then(function(p) {
                    _.each(p.prop('properties'), function(prop) {
                        if (!prop.values || prop.values.length === 0 || prop.values[0].value === '' || prop.values[0].stringValue === '') {
                            prop.isEmpty = true;
                        }
                    });
                    _.extend(bp, p.data);
                });
            });

            return deferred.promise;
        },
        hasPriceRange: function() {
            return this._hasPriceRange;
        },
        calculateHasPriceRange: function(json) {
            this._hasPriceRange = json && !!json.priceRange;
        },
        initialize: function(conf) {
            var slug = this.get('content').get('seoFriendlyUrl');
            _.bindAll(this, 'calculateHasPriceRange', 'onOptionChange');
            this.listenTo(this.get("options"), "optionchange", this.onOptionChange);
            this.updateConfiguration = _.debounce(this.updateConfiguration, 300);
            this.set({ url: slug ? "/" + slug + "/p/" + this.get("productCode") : "/p/" + this.get("productCode") });
            this.lastConfiguration = [];
            this.calculateHasPriceRange(conf);
            this.on('sync', this.calculateHasPriceRange);
        },
        mainImage: function() {
            var productImages = this.get('content.productImages');
            return productImages && productImages[0];
        },
        notDoneConfiguring: function() {
            return this.get('productUsage') === Product.Constants.ProductUsage.Configurable && !this.get('variationProductCode');
        },
        supportsInStorePickup: function() {
            return _.contains(this.get('fulfillmentTypesSupported'), Product.Constants.FulfillmentTypes.IN_STORE_PICKUP);
        },
        getConfiguredOptions: function(options) {
            return this.get('options').reduce(function(biscuit, opt) {
                opt.addConfiguration(biscuit, options);
                return biscuit;
            }, []);
        },


        addToCart: function () {
            var me = this;
            this.whenReady(function () {
                if (!me.validate()) {
                    var fulfillMethod = me.get('fulfillmentMethod');
                    if (!fulfillMethod) {
                        fulfillMethod = (me.get('goodsType') === 'Physical') ? Product.Constants.FulfillmentMethods.SHIP : Product.Constants.FulfillmentMethods.DIGITAL;
                    }
                    me.apiAddToCart({
                        options: me.getConfiguredOptions(),
                        fulfillmentMethod: fulfillMethod,
                        quantity: me.get("quantity")
                    }).then(function (item) {
                        me.trigger('addedtocart', item);
                    });
                }
            });
        },
        addToWishlist: function() {
            var me = this;
            this.whenReady(function() {
                if (!me.validate()) {
                    me.apiAddToWishlist({
                        customerAccountId: require.mozuData('user').accountId,
                        quantity: me.get("quantity")
                    }).then(function(item) {
                        me.trigger('addedtowishlist', item);
                    });
                }
            });
        },
        addToCartForPickup: function(locationCode, quantity) {
            var me = this;
            this.whenReady(function() {
                return me.apiAddToCartForPickup({
                    fulfillmentLocationCode: locationCode,
                    fulfillmentMethod: Product.Constants.FulfillmentMethods.PICKUP,
                    quantity: quantity || 1
                }).then(function(item) {
                    me.trigger('addedtocart', item);
                });
            });
        },
        onOptionChange: function() {
            this.isLoading(true);
            this.updateConfiguration();
        },
        updateConfiguration: function() {
            var newConfiguration = this.getConfiguredOptions();
            if (JSON.stringify(this.lastConfiguration) !== JSON.stringify(newConfiguration)) {
                this.lastConfiguration = newConfiguration;
                this.apiConfigure({ options: newConfiguration }, { useExistingInstances: true });
            } else {
                this.isLoading(false);
            }
        },
        parse: function(prodJSON) {
            if (prodJSON && prodJSON.productCode && !prodJSON.variationProductCode) {
                this.unset('variationProductCode');
            }
            return prodJSON;
        },
        toJSON: function(options) {
            var j = Backbone.MozuModel.prototype.toJSON.apply(this, arguments);
            if (!options || !options.helpers) {
                j.options = this.getConfiguredOptions({ unabridged: true });
            }
            if (options && options.helpers) {
                if (typeof j.mfgPartNumber == "string") j.mfgPartNumber = [j.mfgPartNumber];
                if (typeof j.upc == "string") j.upc = [j.upc];
                if (j.bundledProducts && j.bundledProducts.length === 0) delete j.bundledProducts;
            }
            return j;
        }
    }, {
        Constants: {
            FulfillmentMethods: {
                SHIP: "Ship",
                PICKUP: "Pickup",
                DIGITAL: "Digital"
            },
            // for catalog instead of commerce
            FulfillmentTypes: {
                IN_STORE_PICKUP: "InStorePickup"
            },
            ProductUsage: {
                Configurable: 'Configurable'
            }
        }
    }),

    ProductCollection = Backbone.MozuModel.extend({
        relations: {
            items: Backbone.Collection.extend({
                model: Product
            })
        }
    });

    return {
        Product: Product,
        Option: ProductOption,
        ProductCollection: ProductCollection
    };

});



define('modules/models-orders',['underscore', "modules/backbone-mozu", "hyprlive", "modules/models-product"], function (_, Backbone, Hypr, ProductModels) {

    var OrderItem = Backbone.MozuModel.extend({
        relations: {
            product: ProductModels.Product
        }
    }),

    OrderItemsList = Backbone.Collection.extend({
        model: OrderItem
    }),

    RMA = Backbone.MozuModel.extend({
        mozuType: 'rma',
        relations: {
            items: OrderItemsList
        },
        dataTypes: {
            quantity: Backbone.MozuModel.DataTypes.Int
        },
        defaults: {
            returnType: 'Refund'
        },
        validation: {
            reason: {
                required: true,
                msg: Hypr.getLabel('enterReturnReason')
            },
            quantity: {
                min: 1,
                msg: Hypr.getLabel('enterReturnQuantity')
            },
            comments: {
                fn: function (value) {
                    if (this.attributes.reason === "Other" && !value) return Hypr.getLabel('enterOtherComments');
                }
            }
        },
        // in GA you can only return one item at a time, but this will have to change at some point
        toJSON: function () {
            var j = Backbone.MozuModel.prototype.toJSON.apply(this, arguments);
            if (j.reason && j.quantity && j.items && j.items[0] && !j.items[0].reason) {
                j.items[0].reasons = [
                    {
                        reason: j.reason,
                        quantity: j.quantity
                    }
                ];
                if (j.comments) j.items[0].notes = [
                    {
                        text: j.comments
                    }
                ];
            }
            delete j.reason;
            delete j.quantity;
            delete j.comments;
            return j;
        }
    }),

    RMACollection = Backbone.MozuPagedCollection.extend({
        mozuType: 'rmas',
        defaults: {
            pageSize: 5
        },
        relations: {
            items: Backbone.Collection.extend({
                model: RMA
            })
        }
    }),

    Order = Backbone.MozuModel.extend({
        mozuType: 'order',
        relations: {
            items: OrderItemsList
        }
    }),

    OrderCollection = Backbone.MozuPagedCollection.extend({
        mozuType: 'orders',
        defaults: {
            pageSize: 5
        },
        relations: {
            items: Backbone.Collection.extend({
                model: Order
            }),
            rma: RMA
        },
        startReturn: function (orderId, itemId) {
            var rma = this.get('rma');
            var item = this.get('items').get(orderId).get('items').get(itemId);
            if (item) {
                item = item.toJSON();
                item.orderItemId = item.id;
                rma.get('items').reset([item]);
                rma.set({
                    originalOrderId: orderId,
                    returnType: 'Refund'
                });
            }
        },
        clearReturn: function() {
            var rma = this.get('rma');
            rma.clear();
        },
        finishReturn: function (id) {
            var self = this, op;
            if (!this.validate()) {
                this.isLoading(true);
                op = this.get('rma').apiCreate();
                if (op) return op.then(function (rma) {
                    self.isLoading(false);
                    self.trigger('returncreated', rma.prop('id'));
                    self.clearReturn();
                    return rma;
                }, function () {
                    self.isLoading(false);
                });
            }
        }
    });

    return {
        OrderItem: OrderItem,
        RMA: RMA,
        RMACollection: RMACollection,
        Order: Order,
        OrderCollection: OrderCollection
    };

});



define('modules/models-paymentmethods',['modules/jquery-mozu', 'underscore', 'modules/backbone-mozu', 'hyprlive'], function ($, _, Backbone, Hypr) {
    // payment methods only validate if they are selected!
    var PaymentMethod = Backbone.MozuModel.extend({
        present: function (value, attr) {
            if (!this.selected) return undefined;
            if (!value) return this.validation[attr.split('.').pop()].msg || Hypr.getLabel('genericRequired');
        }
    });

    var twoWayCardShapeMapping = {
        "cardNumber": "cardNumberPartOrMask",
        "cardNumberPart": "cardNumberPartOrMask",
        "cardType": "paymentOrCardType",
        "id": "paymentServiceCardId"
    };

    var firstDigitMap = {
        "3": "AMEX",
        "4": "VISA",
        "5": "MC",
        "6": "DISCOVER"
    };

    var CreditCard = PaymentMethod.extend({
        mozuType: 'creditcard',
        defaults: {
            isCvvOptional: false,
            isDefaultPayMethod: false,
            isSavedCard: false,
            isVisaCheckout: false
        },
        validation: {
            paymentOrCardType: {
                fn: "present",
                msg: Hypr.getLabel('cardTypeMissing')
            },
            cardNumberPartOrMask: {
                fn: "present",
                msg: Hypr.getLabel('cardNumberMissing')
            },
            expireMonth: {
                fn: 'expirationDateInPast'
            },
            expireYear: {
                fn: 'expirationDateInPast'
            },
            nameOnCard: {
                fn: "present",
                msg: Hypr.getLabel('cardNameMissing')
            }
        },
        initialize: function () {
            var self = this;
            _.each(twoWayCardShapeMapping, function (k, v) {
                self.on('change:' + k, function (m, val) {
                    self.set(v, val, { silent: true });
                });
                self.on('change:' + v, function (m, val) {
                    self.set(v, val, { silent: true });
                });
            });

            if (this.detectCardType) {
                this.on('change:cardNumberPartOrMask', _.debounce(function(self, newValue) {
                    var firstDigit;
                    if (newValue && newValue.toString) {
                        firstDigit = newValue.toString().charAt(0);
                    }
                    if (firstDigit && firstDigit in firstDigitMap) {
                        self.set({ paymentOrCardType: firstDigitMap[firstDigit] });
                    }
                }, 500));
            }
        },
        dataTypes: {
            expireMonth: Backbone.MozuModel.DataTypes.Int,
            expireYear: Backbone.MozuModel.DataTypes.Int,
            isCardInfoSaved: Backbone.MozuModel.DataTypes.Boolean,
            isDefaultPayMethod: Backbone.MozuModel.DataTypes.Boolean
        },
        expirationDateInPast: function (value, attr, computedState) {
            if (!this.selected) return undefined;
            var expMonth = this.get('expireMonth'),
                expYear = this.get('expireYear'),
                exp,
                thisMonth,
                isValid;

            if (isNaN(expMonth) || isNaN(expYear)) return false;

            exp = new Date(expYear, expMonth - 1, 1, 0, 0, 0, 0);
            thisMonth = new Date();
            thisMonth.setDate(1);
            thisMonth.setHours(0, 0, 0, 0);

            isValid = exp >= thisMonth;
            if (!isValid) return Hypr.getLabel('cardExpInvalid');
        },
        // the toJSON method should omit the CVV so it is not sent to the wrong API
        toJSON: function (options) {
            var j = PaymentMethod.prototype.toJSON.apply(this);
            _.each(twoWayCardShapeMapping, function (k, v) {
                if (!(k in j) && (v in j)) j[k] = j[v];
                if (!(v in j) && (k in j)) j[v] = j[k];
            });
            if (j && (!options || !options.helpers) && j.cvv && j.cvv.toString().indexOf('*') !== -1) delete j.cvv;
            return j;
        }
    });

    var CreditCardWithCVV = CreditCard.extend({
        validation: _.extend({}, CreditCard.prototype.validation, {
            cvv: {
                fn: function(value, attr) {
                    var cardType = attr.split('.')[0],
                        card = this.get(cardType),
                        isSavedCard = card.get('isSavedCard'),
                        isVisaCheckout = card.get('isVisaCheckout');

                    var skipValidationSaved = Hypr.getThemeSetting('isCvvSuppressed') && isSavedCard;
                    var skipValidationVisaCheckout = Hypr.getThemeSetting('isCvvSuppressed') && isVisaCheckout;

                    // If card is not selected or cvv is not required, no need to validate
                    if (!card.selected || skipValidationVisaCheckout || skipValidationSaved) {
                        return;
                    }

                    if (!value) {
                        return Hypr.getLabel('securityCodeMissing') || Hypr.getLabel('genericRequired');
                    }

                }
            }
        })
    });


    var PayPal = PaymentMethod.extend({
        mozuType: 'paypalpayment'
    });

    var Check = PaymentMethod.extend({
        validation: {
            nameOnCheck: {
                fn: "present"
            },
            routingNumber: {
                fn: "present"
            },
            checkNumber: {
                fn: "present"
            }
        }
    });

    var DigitalCredit = PaymentMethod.extend({

        isEnabled: false,
        creditAmountApplied: null,
        remainingBalance: null,
        isTiedToCustomer: true,
        addRemainderToCustomer: false,

        initialize: function() {
            this.set({ isEnabled: this.isEnabled });
            this.set({ creditAmountApplied: this.creditAmountApplied });
            this.set({ remainingBalance: this.remainingBalance });
            this.set({ isTiedToCustomer: this.isTiedToCustomer });
            this.set({ addRemainderToCustomer: this.addRemainderToCustomer });
        },

        helpers: ['calculateRemainingBalance'],

        calculateRemainingBalance: function () {
            return (! this.get('creditAmountApplied')) ? this.get('currentBalance') : this.get('currentBalance') - this.get('creditAmountApplied');
        },

        validate: function(attrs, options) {
            if ( (attrs.creditAmountApplied) && (attrs.creditAmountApplied > attrs.currentBalance)) {
                return "Exceeds card balance.";
            }
        }
    });

    return {
        CreditCard: CreditCard,
        CreditCardWithCVV: CreditCardWithCVV,
        Check: Check,
        DigitalCredit: DigitalCredit
    };
});
define('modules/models-customer',['modules/backbone-mozu', 'underscore', 'modules/models-address', 'modules/models-orders', 'modules/models-paymentmethods', 'modules/models-product', 'hyprlive'], function (Backbone, _, AddressModels, OrderModels, PaymentMethods, ProductModels, Hypr) {


    var pageContext = require.mozuData('pagecontext'),
        validShippingCountryCodes,
        validBillingCountryCodes,
        validShippingAndBillingCountryCodes;
    if (pageContext && pageContext.shippingCountries && pageContext.billingCountries) {
        validShippingCountryCodes = _.pluck(pageContext.shippingCountries, 'value');
        validBillingCountryCodes = _.pluck(pageContext.billingCountries, 'value');
        validShippingAndBillingCountryCodes = _.intersection(validShippingCountryCodes, validBillingCountryCodes);
    }


    var contactTypes = ["Billing", "Shipping"],
        contactTypeListeners = {};
    _.each(contactTypes, function(contactType) {
        contactTypeListeners['change:is'+contactType+'Contact'] = function(model, yes) {
            // cheap copy to avoid accidental persistence
            var types = this.get('types');
            types = types ? JSON.parse(JSON.stringify(types)) : [];
            var newType = { name: contactType },
                isAlready = _.findWhere(types, newType);
            if (yes && !isAlready) {
                types.push(newType);
                this.set('types', types, { silent: true });
            }
            if (!yes && isAlready) {
                this.set('types', _.without(types, isAlready), { silent: true});
            }
        };
        contactTypeListeners['change:isPrimary' + contactType + 'Contact'] = function(model, yes) {
            var types = this.get('types'),
                typeConf = { name: contactType },
                type = _.findWhere(types, typeConf);
            if (type) {
                type.isPrimary = yes;
                this.set('types', types, { silent: true });
            }
        };
    });

    var CustomerAttribute = Backbone.MozuModel.extend({
        mozuType: 'customerattribute',
        validation: {
            values: {
                fn: function (values, fieldName, fields) {
                    var inputType = fields.inputType;
                    var messages = Backbone.Validation.messages;
                    var rules = fields.validation;
                    var value = values[0];

                    if (inputType === 'TextBox') {
                        if (rules.maxStringLength && value.length > rules.maxStringLength) return format(messages.maxLength, fields.adminName, rules.maxStringLength);
                        if (rules.minStringLength && value.length < rules.minStringLength) return format(messages.minLength, fields.adminName, rules.minStringLength);
                        if (rules.maxNumericValue && value > rules.maxNumericValue) return format(messages.max, fields.adminName, rules.maxNumericValue);
                        if (rules.minNumericValue && value < rules.minNumericValue) return format(messages.min, fields.adminName, rules.minNumericValue);
                    } else if (inputType === 'TextArea') {
                        if (rules.maxStringLength && value.length > rules.maxStringLength) return format(messages.maxLength, fields.adminName, rules.maxStringLength);
                        if (rules.minStringLength && value.length < rules.minStringLength) return format(messages.minLength, fields.adminName, rules.minStringLength);
                    } else if (inputType === 'Date') {
                        if (rules.maxDateTime && Date.parse(value) > Date.parse(rules.maxDateTime)) return format(messages.max, fields.adminName, Date.parse(rules.maxDateTime));
                        if (rules.minDateTime && Date.parse(value) < Date.parse(rules.minDateTime)) return format(messages.min, fields.adminName, Date.parse(rules.minDateTime));
                    }

                    function format () {
                        var args = Array.prototype.slice.call(arguments),
                            text = args.shift();
                        return text.replace(/\{(\d+)\}/g, function (match, number) {
                            return typeof args[number] !== 'undefined' ? args[number] : match;
                        });
                    }
                }
            }
        }
    });

    var CustomerContact = Backbone.MozuModel.extend({
        mozuType: 'contact',
        relations: {
            address: AddressModels.StreetAddress,
            phoneNumbers: AddressModels.PhoneNumbers
        },
        validation: {
            firstName: {
                required: true,
                msg: Hypr.getLabel('firstNameMissing')
            },
            lastNameOrSurname: {
                required: true,
                msg: Hypr.getLabel('lastNameMissing')
            },
            "address.countryCode": {
                fn: function (value) {
                    if (!validShippingCountryCodes) return undefined;
                    var isBillingContact = this.attributes.isBillingContact || this.attributes.editingContact.attributes.isBillingContact,
                        isShippingContact = this.attributes.isShippingContact || this.attributes.editingContact.attributes.isShippingContact,
                        validCodes = ((isBillingContact && isShippingContact && validShippingAndBillingCountryCodes) ||
                                      (isBillingContact && validBillingCountryCodes) ||
                                      (isShippingContact && validShippingCountryCodes));
                    if (validCodes && !_.contains(validCodes, value)) return Hypr.getLabel("wrongCountryForType");
                }
            }
        },

        toJSON: function(options) {
            var j = Backbone.MozuModel.prototype.toJSON.apply(this, arguments);
            if (!options || !options.helpers) {
                _.each(contactTypes, function(contactType) {
                    delete j['is'+contactType+'Contact'];
                    delete j['isPrimary'+contactType+'Contact'];
                });
            }
            if (j.id === "new") delete j.id;
            return j;
        },
        save: function () {
            if (!this.parent.validate("editingContact")) {
                var id = this.get('id');

                if (!this.get('email')) this.set({ email: this.parent.get('emailAddress') }, { silent: true });
                if (!id) return this.apiCreate();
                return this.apiUpdate();
            }
        },
        setTypeHelpers: function(model, types) {
            var self = this;
            _.each(contactTypes, function (contactType) {
                self.unset('is' + contactType + 'Contact');
                self.unset('isPrimary' + contactType + 'Contact');
                _.each(types, function (type) {
                    var toSet = {};
                    if (type.name === contactType) {
                        toSet['is' + contactType + 'Contact'] = true;
                        if (type.isPrimary) toSet['isPrimary' + contactType + 'Contact'] = true;
                        self.set(toSet, { silent: true });
                    }
                });
            });
        },
        initialize: function () {
            var self = this,
                types = this.get('types');
            if (types) this.setTypeHelpers(null, types);
            this.on(contactTypeListeners);
            this.on('change:types', this.setTypeHelpers, this);
        }
    }),

    WishlistItem = Backbone.MozuModel.extend({
        relations: {
            product: ProductModels.Product
        }
    }),

    Wishlist = Backbone.MozuModel.extend({
        mozuType: 'wishlist',
        helpers: ['hasItems'],
        hasItems: function() {
            return this.get('items').length > 0;
        },
        relations: {
            items: Backbone.Collection.extend({
                model: WishlistItem
            })
        },
        addItemToCart: function (id) {
            var self = this;
            return this.apiAddItemToCartById(id).then(function (item) {
                self.trigger('addedtocart', item, id);
                return item;
            });
        }
    }),

    Customer = Backbone.MozuModel.extend({
        mozuType: 'customer',
        helpers: ['hasSavedCards', 'hasSavedContacts'],
        hasSavedCards: function() {
            var cards = this.get('cards');
            return cards && cards.length > 0;
        },
        hasSavedContacts: function() {
            var contacts = this.get('contacts');
            return contacts && contacts.length > 0;
        },
        relations: {
            attributes: Backbone.Collection.extend({
                model: CustomerAttribute
            }),
            contacts: Backbone.Collection.extend({
                model: CustomerContact
            }),
            cards: Backbone.Collection.extend({
                model: PaymentMethods.CreditCard
            }),
            credits: Backbone.Collection.extend({
                model: PaymentMethods.DigitalCredit
            })
        },
        getAttributes: function () {
            var self = this;
            var attributesCollection = this.get('attributes');

            return this.apiGetAttributes({pageSize:100}).then(function (cc) {
                // transform attributes into key-value pairs, to avoid multiple lookups
                var values = _.reduce(cc.data.items, function (a, b) {
                    a[b.fullyQualifiedName] = {
                        values: b.values,
                        attributeDefinitionId: b.attributeDefinitionId
                    };
                    return a;
                }, {});

                // get all attribute definitions
                return self.apiGetAttributeDefinitions().then(function (defs) {
                    // merge attribute values into definitions
                    _.each(defs.data.items, function (def) {
                        var fqn = def.attributeFQN;

                        if (values[fqn]) {
                            def.values = values[fqn].values;
                            def.attributeDefinitionId = values[fqn].attributeDefinitionId;
                        }
                    });
                    // sort attributes, putting checkboxes first
                    defs.data.items.sort(function (a, b) {
                        if (a.inputType === 'YesNo') return -1;
                        else if (b.inputType === 'YesNo') return 1;
                        else return 0;
                    });
                    // write fully-hydrated attributes to the model
                    attributesCollection.reset(defs.data.items);
                    self.trigger('sync', cc.data);
                    return self;
                });
            });
        },
        getPrimaryContactOfType: function (typeName) {
            return this.get('contacts').find(function (contact) {
                return !!_.findWhere(contact.get('types'), { name: typeName, isPrimary: true });
            });
        },
        getPrimaryBillingContact: function () {
            return this.getPrimaryContactOfType("Billing");
        },
        getPrimaryShippingContact: function () {
            return this.getPrimaryContactOfType("Shipping");
        },
        getContacts: function () {
            var self = this;
            var contactsCollection = this.get('contacts');
            return this.apiGetContacts().then(function (cc) {
                contactsCollection.reset(cc.data.items);
                self.trigger('sync', cc.data);
                return self;
            });
        },
        getStoreCredits: function() {
            var self = this;
            return this.apiGetCredits().then(function (credits) {
                self.set('credits', credits.data.items);
                self.trigger('sync', credits);
                return self;
            });
        },
        addStoreCredit: function (id) {
            return this.apiAddStoreCredit(id);
        }
    }),

    CustomerCardWithContact = PaymentMethods.CreditCard.extend({
        validation: _.extend({
            contactId: {
                fn: function(value, property, model) {
                    if (!value && model.contacts && model.contacts.length > 0) return Hypr.getLabel('cardBillingMissing');
                }
            }
        }, PaymentMethods.CreditCard.prototype.validation),
        selected: true, // so that validation rules always run,
        isCvvOptional: true
    }),

    EditableCustomer = Customer.extend({
        
        handlesMessages: true,
        relations: _.extend({
            editingCard: CustomerCardWithContact,
            editingContact: CustomerContact,
            wishlist: Wishlist,
            orderHistory: OrderModels.OrderCollection,
            returnHistory: OrderModels.RMACollection
        }, Customer.prototype.relations),
        validation: {
            password: {
                fn: function(value) {
                    if (this.validatePassword && !value) return Hypr.getLabel('passwordMissing');
                }
            },
            confirmPassword: {
                fn: function(value) {
                    if (this.validatePassword && value !== this.get('password')) return Hypr.getLabel('passwordsDoNotMatch');
                }
            }
        },
        defaults: function () {
            return {
                editingCard: {},
                editingContact: {}
            };
        },
        initialize: function() {
            var self = this,
                orderHistory = this.get('orderHistory'),
                returnHistory = this.get('returnHistory');
            this.get('editingContact').set('accountId', this.get('id'));
            orderHistory.lastRequest = {
                pageSize: 5
            };
            returnHistory.lastRequest = {
                pageSize: 5
            };
            orderHistory.on('returncreated', function(id) {
                returnHistory.apiGet(returnHistory.lastRequest).then(function () {
                    returnHistory.trigger('returndisplayed', id);
                });
            });

            _.defer(function (cust) {
                cust.getCards();
            }, self);
        },
        changePassword: function () {
            var self = this;
            self.validatePassword = true;
            if (this.validate('password') || this.validate('confirmPassword')) return false;
            return this.apiChangePassword({
                oldPassword: this.get('oldPassword'),
                newPassword: this.get('password')
            }).ensure(function () {
                self.validatePassword = false;
            });
        },
        beginEditCard: function(id) {
            var toEdit = this.get('cards').get(id),
                contacts = this.get('contacts').toJSON(),
                editingCardModel = {
                    contacts: contacts,
                    hasSavedContacts: this.hasSavedContacts()
                };
            if (toEdit) {
                _.extend(editingCardModel, toEdit.toJSON({ helpers: true }), { isCvvOptional: true });
            }
            this.get('editingCard').set(editingCardModel);
        },
        endEditCard: function() {
            this.get('editingCard').clear({ silent: true });
        },
        saveCard: function() {
            if (!this.validate('editingCard')) {
                var self = this,
                    saveContactOp,
                    editingCard = this.get('editingCard').toJSON(),
                    doSaveCard = function() {
                        return self.apiSavePaymentCard(editingCard).then(function() {
                            return self.getCards();
                        }).then(function() {
                            return self.get('editingCard').clear({ silent: true });
                        });
                    },
                    saveContactFirst = function() {
                        self.get('editingContact').set('isBillingContact', true);
                        var op = self.get('editingContact').save();
                        if (op) return op.then(function(contact) {
                            editingCard.contactId = contact.prop('id');
                            self.endEditContact();
                            self.getContacts();
                            return true;
                        });
                    };
                if (!editingCard.contactId || editingCard.contactId === "new") {
                    saveContactOp = saveContactFirst();
                    if (saveContactOp) return saveContactOp.then(doSaveCard);
                } else {
                    return doSaveCard();
                }
            }
        },
        deleteCard: function (id) {
            var self = this;
            return this.apiModel.deletePaymentCard(id).then(function () {
                return self.getCards();
            });
        },
        deleteMultipleCards: function(ids) {
            return this.apiModel.api.all.apply(this.apiModel.api, ids.map(_.bind(this.apiModel.deletePaymentCard, this.apiModel))).then(_.bind(this.getCards, this));
        },
        getCards: function () {
            var self = this;
            var cardsCollection = this.get('cards');
            this.syncApiModel();
            return this.apiModel.getCards().then(function (cc) {
                cardsCollection.set(cc.data.items);
                return self;
            });
        },
        beginEditContact: function (id) {
            var toEdit = this.get('contacts').get(id);
            if (toEdit)
                this.get('editingContact').set(toEdit.toJSON({ helpers: true, ensureCopy: true }), { silent: true });
        },
        endEditContact: function() {
            var editingContact = this.get('editingContact');
            editingContact.clear();
            editingContact.set('accountId', this.get('id'));
        },
        saveContact: function (options) {
            var self = this,
                editingContact = this.get('editingContact'),
                apiContact;
            
            if (options && options.forceIsValid) {
                editingContact.set('address.isValidated', true);
            }

            var op = editingContact.save();
            if (op) return op.then(function (contact) {
                apiContact = contact;
                self.endEditContact();
                return self.getContacts();
            }).then(function () {
                return apiContact;
            });
        },
        deleteContact: function (id) {
            var self = this;
            return this.apiModel.deleteContact(id).then(function () {
                return self.getContacts();
            });
        },
        updateName: function () {
            return this.apiUpdate({
                firstName: this.get('firstName'),
                lastName: this.get('lastName')
            });
        },
        updateAcceptsMarketing: function(yes) {
            return this.apiUpdate({
                acceptsMarketing: yes
            });
        },
        updateAttribute: function (attributeFQN, attributeDefinitionId, values) {
            this.apiUpdateAttribute({
                attributeFQN: attributeFQN,
                attributeDefinitionId: attributeDefinitionId,
                values: values
            });
        },
        toJSON: function (options) {
            var j = Customer.prototype.toJSON.apply(this, arguments);
            if (!options || !options.helpers)
                delete j.customer;
            delete j.password;
            delete j.confirmPassword;
            delete j.oldPassword;
            return j;
        }
    });

    return {
        Contact: CustomerContact,
        Customer: Customer,
        EditableCustomer: EditableCustomer
    };
});
define(
    'modules/models-documents',["modules/backbone-mozu", "underscore", "hyprlivecontext"],
    function (Backbone, _, PagingMixin, context) {
        
        var locals = context.locals;

        var Document = Backbone.MozuModel.extend({
            helpers: ['url'],
            url: function() {
                // attributes available through this.get, theme settings and sitecontext available through "locals.themeSettings" and "locals.siteContext"
                return "/cms/" + this.get('id');
            }
        }),

        DocumentCollection = Backbone.MozuPagedCollection.extend({
            relations: {
                items: Backbone.Collection.extend({
                    model: Document
                })
            },
            buildPagingRequest: function() {
                var conf = this.baseRequestParams ? _.clone(this.baseRequestParams) : {},
                pageSize = this.get("pageSize"),
                startIndex = this.get("startIndex"),
                filter = this.filter,
                query = this.query;
                conf.pageSize = pageSize;
                if (startIndex) conf.startIndex = startIndex;
                if (filter) conf.filter = filter;
                if (query) conf.query = this.query;
                return conf;
            },
            initialize: function() {
                this.lastRequest = this.buildPagingRequest();
            }
        });

        return {
            Document: Document,
            DocumentCollection: DocumentCollection
        };

});

define('modules/models-faceting',['modules/jquery-mozu', 'underscore', "hyprlive", "modules/backbone-mozu", "modules/models-product"], function($, _, Hypr, Backbone, ProductModels) {

    var FacetValue = Backbone.MozuModel.extend({
        idAttribute: 'value'
    }),

    Facet = Backbone.MozuModel.extend({
        idAttribute: 'field',
        helpers: ['isFaceted'],
        defaults: {
            facetType: '',
            field: '',
            label: ''
        },
        relations: {
            values: Backbone.Collection.extend({
                model: FacetValue
            })
        },
        isFaceted: function() {
            return !!this.get("values").findWhere({ "isApplied": true });
        },
        empty: function() {
            this.set("values", { isApplied: false });
            this.collection.parent.updateFacets({ resetIndex: true });
        },
        getAppliedValues: function() {
            return _.invoke(this.get("values").where({ isApplied: true }), 'get', 'filterValue').join(',');
        }

    }),

    FacetedProductCollection = Backbone.MozuPagedCollection.extend({
        mozuType: 'search',
        relations: {
            facets: Backbone.Collection.extend({
                model: Facet
            }),
            items: Backbone.Collection.extend({
                model: ProductModels.Product
            })
        },
        helpers: ['hasValueFacets'],
        hierarchyDepth: 2,
        hierarchyField: 'categoryId',
        getQueryParams: function() {
            var params = Backbone.MozuPagedCollection.prototype.getQueryParams.apply(this, arguments);
            if (this.hierarchyValue) {
                params[window.encodeURIComponent(this.hierarchyField)] = window.encodeURIComponent(this.hierarchyValue);
            }
            return params;
        },
        buildRequest: function(filterValue) {
            var conf = Backbone.MozuPagedCollection.prototype.buildRequest.apply(this, arguments);
            filterValue = filterValue || this.getFacetValueFilter();
            if (filterValue) conf.facetValueFilter = filterValue;
            return conf;
        },
        setQuery: function(query) {
            this.query = query;
            if (!this.hierarchyValue && !this.baseRequestParams) {
                this.baseRequestParams = {
                    facet: this.hierarchyField,
                    facetHierDepth: this.hierarchyField + ":" + this.hierarchyDepth,
                    query: query
                };
            }
            this.lastRequest = this.buildRequest();
        },
        setHierarchy: function(hierarchyField, hierarchyValue) {
            this.hierarchyField = hierarchyField;
            this.hierarchyValue = hierarchyValue;
            this.baseRequestParams = this.baseRequestParams || {};
            if (hierarchyValue || hierarchyValue === 0) {
                this.baseRequestParams = _.extend(this.baseRequestParams, {
                    filter: hierarchyField + ' req ' + hierarchyValue,
                    facetTemplate: hierarchyField + ':' + hierarchyValue,
                    facetHierValue: hierarchyField + ':' + hierarchyValue,
                    facetHierDepth: hierarchyField + ':' + this.hierarchyDepth
                });
            } else {
                this.baseRequestParams = _.omit(this.baseRequestParams, 'filter', 'facetTemplate', 'facetHierValue', 'facetHierDepth');
            }
            if (this.query) this.baseRequestParams.query = this.query;
            this.lastRequest = this.buildRequest();
        },
        hasValueFacets: function() {
            return !!this.get('facets').findWhere({ facetType: 'Value' });
        },
        clearAllFacets: function() {
            this.get("facets").invoke("empty");
        },
        getFacetValueFilter: function() {
            return _.compact(this.get("facets").invoke("getAppliedValues")).join(',');
        },
        setFacetValue: function(field, value, yes) {
            var thisFacetValues = this.get('facets').findWhere({ field: field }).get('values'),
                // jQuery.data attempts to detect type, but the facet value might be a string anyway
                newValue = thisFacetValues.findWhere({ value: value }) || thisFacetValues.findWhere({
                    value: value.toString()
                });
            newValue.set("isApplied", yes);
            this.updateFacets({ resetIndex: true });
        },
        updateFacets: function(options) {
            var me = this,
                conf;
            options = options || {};
            if (options.resetIndex) this.set("startIndex", 0);
            conf = this.buildRequest(options.facetValueFilter);
            if (options.force || !_.isEqual(conf, this.lastRequest)) {
                this.lastRequest = conf;
                this.isLoading(true);
                // wipe current data set, since the server will give us our entire state
                this.get('facets').reset(null, { silent: true });
                this.get('items').reset(null, { silent: true });
                this.apiModel.get(conf).ensure(function() {
                    me.isLoading(false);
                });
            }
        },
        initialize: function() {
            var me = this;
            Backbone.MozuPagedCollection.prototype.initialize.apply(this, arguments);
            this.updateFacets = _.debounce(this.updateFacets, 300);
            this.on('sync', function() {
                me.trigger('facetchange', me.getQueryString());
            });
        }
    }),

    Category = FacetedProductCollection.extend({}),

    SearchResult = FacetedProductCollection.extend({
        defaultSort: '', // relevance rather than createdate
        buildRequest: function() {
            var conf = FacetedProductCollection.prototype.buildRequest.apply(this, arguments);
            if (this.query) conf.query = this.query;
            return conf;
        },
        getQueryParams: function() {
            var params = FacetedProductCollection.prototype.getQueryParams.apply(this, arguments);
            if (this.query) params.query = this.query;
            return params;
        }
    });

    return {
        Facet: Facet,
        FacetValue: FacetValue,
        FacetedProductCollection: FacetedProductCollection,
        Category: Category,
        SearchResult: SearchResult
    };

});

define('shim!vendor/bootstrap/js/affix[jquery=jQuery]',['jquery'], function(jQuery) { 

/* ========================================================================
 * Bootstrap: affix.js v3.2.0
 * http://getbootstrap.com/javascript/#affix
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  

  // AFFIX CLASS DEFINITION
  // ======================

  var Affix = function (element, options) {
    this.options = $.extend({}, Affix.DEFAULTS, options)

    this.$target = $(this.options.target)
      .on('scroll.bs.affix.data-api', $.proxy(this.checkPosition, this))
      .on('click.bs.affix.data-api',  $.proxy(this.checkPositionWithEventLoop, this))

    this.$element     = $(element)
    this.affixed      =
    this.unpin        =
    this.pinnedOffset = null

    this.checkPosition()
  }

  Affix.VERSION  = '3.2.0'

  Affix.RESET    = 'affix affix-top affix-bottom'

  Affix.DEFAULTS = {
    offset: 0,
    target: window
  }

  Affix.prototype.getPinnedOffset = function () {
    if (this.pinnedOffset) return this.pinnedOffset
    this.$element.removeClass(Affix.RESET).addClass('affix')
    var scrollTop = this.$target.scrollTop()
    var position  = this.$element.offset()
    return (this.pinnedOffset = position.top - scrollTop)
  }

  Affix.prototype.checkPositionWithEventLoop = function () {
    setTimeout($.proxy(this.checkPosition, this), 1)
  }

  Affix.prototype.checkPosition = function () {
    if (!this.$element.is(':visible')) return

    var scrollHeight = $(document).height()
    var scrollTop    = this.$target.scrollTop()
    var position     = this.$element.offset()
    var offset       = this.options.offset
    var offsetTop    = offset.top
    var offsetBottom = offset.bottom

    if (typeof offset != 'object')         offsetBottom = offsetTop = offset
    if (typeof offsetTop == 'function')    offsetTop    = offset.top(this.$element)
    if (typeof offsetBottom == 'function') offsetBottom = offset.bottom(this.$element)

    var affix = this.unpin   != null && (scrollTop + this.unpin <= position.top) ? false :
                offsetBottom != null && (position.top + this.$element.height() >= scrollHeight - offsetBottom) ? 'bottom' :
                offsetTop    != null && (scrollTop <= offsetTop) ? 'top' : false

    if (this.affixed === affix) return
    if (this.unpin != null) this.$element.css('top', '')

    var affixType = 'affix' + (affix ? '-' + affix : '')
    var e         = $.Event(affixType + '.bs.affix')

    this.$element.trigger(e)

    if (e.isDefaultPrevented()) return

    this.affixed = affix
    this.unpin = affix == 'bottom' ? this.getPinnedOffset() : null

    this.$element
      .removeClass(Affix.RESET)
      .addClass(affixType)
      .trigger($.Event(affixType.replace('affix', 'affixed')))

    if (affix == 'bottom') {
      this.$element.offset({
        top: scrollHeight - this.$element.height() - offsetBottom
      })
    }
  }


  // AFFIX PLUGIN DEFINITION
  // =======================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.affix')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.affix', (data = new Affix(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.affix

  $.fn.affix             = Plugin
  $.fn.affix.Constructor = Affix


  // AFFIX NO CONFLICT
  // =================

  $.fn.affix.noConflict = function () {
    $.fn.affix = old
    return this
  }


  // AFFIX DATA-API
  // ==============

  $(window).on('load', function () {
    $('[data-spy="affix"]').each(function () {
      var $spy = $(this)
      var data = $spy.data()

      data.offset = data.offset || {}

      if (data.offsetBottom) data.offset.bottom = data.offsetBottom
      if (data.offsetTop)    data.offset.top    = data.offsetTop

      Plugin.call($spy, data)
    })
  })

}(jQuery);
 ; 

return null; 

});


//@ sourceURL=/vendor/bootstrap/js/affix.js

;
define('shim!vendor/bootstrap/js/scrollspy[jquery=jQuery]',['jquery'], function(jQuery) { 

/* ========================================================================
 * Bootstrap: scrollspy.js v3.2.0
 * http://getbootstrap.com/javascript/#scrollspy
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  

  // SCROLLSPY CLASS DEFINITION
  // ==========================

  function ScrollSpy(element, options) {
    var process  = $.proxy(this.process, this)

    this.$body          = $('body')
    this.$scrollElement = $(element).is('body') ? $(window) : $(element)
    this.options        = $.extend({}, ScrollSpy.DEFAULTS, options)
    this.selector       = (this.options.target || '') + ' .nav li > a'
    this.offsets        = []
    this.targets        = []
    this.activeTarget   = null
    this.scrollHeight   = 0

    this.$scrollElement.on('scroll.bs.scrollspy', process)
    this.refresh()
    this.process()
  }

  ScrollSpy.VERSION  = '3.2.0'

  ScrollSpy.DEFAULTS = {
    offset: 10
  }

  ScrollSpy.prototype.getScrollHeight = function () {
    return this.$scrollElement[0].scrollHeight || Math.max(this.$body[0].scrollHeight, document.documentElement.scrollHeight)
  }

  ScrollSpy.prototype.refresh = function () {
    var offsetMethod = 'offset'
    var offsetBase   = 0

    if (!$.isWindow(this.$scrollElement[0])) {
      offsetMethod = 'position'
      offsetBase   = this.$scrollElement.scrollTop()
    }

    this.offsets = []
    this.targets = []
    this.scrollHeight = this.getScrollHeight()

    var self     = this

    this.$body
      .find(this.selector)
      .map(function () {
        var $el   = $(this)
        var href  = $el.data('target') || $el.attr('href')
        var $href = /^#./.test(href) && $(href)

        return ($href
          && $href.length
          && $href.is(':visible')
          && [[$href[offsetMethod]().top + offsetBase, href]]) || null
      })
      .sort(function (a, b) { return a[0] - b[0] })
      .each(function () {
        self.offsets.push(this[0])
        self.targets.push(this[1])
      })
  }

  ScrollSpy.prototype.process = function () {
    var scrollTop    = this.$scrollElement.scrollTop() + this.options.offset
    var scrollHeight = this.getScrollHeight()
    var maxScroll    = this.options.offset + scrollHeight - this.$scrollElement.height()
    var offsets      = this.offsets
    var targets      = this.targets
    var activeTarget = this.activeTarget
    var i

    if (this.scrollHeight != scrollHeight) {
      this.refresh()
    }

    if (scrollTop >= maxScroll) {
      return activeTarget != (i = targets[targets.length - 1]) && this.activate(i)
    }

    if (activeTarget && scrollTop <= offsets[0]) {
      return activeTarget != (i = targets[0]) && this.activate(i)
    }

    for (i = offsets.length; i--;) {
      activeTarget != targets[i]
        && scrollTop >= offsets[i]
        && (!offsets[i + 1] || scrollTop <= offsets[i + 1])
        && this.activate(targets[i])
    }
  }

  ScrollSpy.prototype.activate = function (target) {
    this.activeTarget = target

    $(this.selector)
      .parentsUntil(this.options.target, '.active')
      .removeClass('active')

    var selector = this.selector +
        '[data-target="' + target + '"],' +
        this.selector + '[href="' + target + '"]'

    var active = $(selector)
      .parents('li')
      .addClass('active')

    if (active.parent('.dropdown-menu').length) {
      active = active
        .closest('li.dropdown')
        .addClass('active')
    }

    active.trigger('activate.bs.scrollspy')
  }


  // SCROLLSPY PLUGIN DEFINITION
  // ===========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.scrollspy')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.scrollspy', (data = new ScrollSpy(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.scrollspy

  $.fn.scrollspy             = Plugin
  $.fn.scrollspy.Constructor = ScrollSpy


  // SCROLLSPY NO CONFLICT
  // =====================

  $.fn.scrollspy.noConflict = function () {
    $.fn.scrollspy = old
    return this
  }


  // SCROLLSPY DATA-API
  // ==================

  $(window).on('load.bs.scrollspy.data-api', function () {
    $('[data-spy="scroll"]').each(function () {
      var $spy = $(this)
      Plugin.call($spy, $spy.data())
    })
  })

}(jQuery);
 ; 

return null; 

});


//@ sourceURL=/vendor/bootstrap/js/scrollspy.js

;
define('modules/scroll-nav',['modules/jquery-mozu', 'hyprlive', 'underscore', 'modules/api', 'shim!vendor/bootstrap/js/affix[jquery=jQuery]', 'shim!vendor/bootstrap/js/scrollspy[jquery=jQuery]'], function ($, Hypr, _, api) {
    if (!Modernizr.mq('(max-width: 800px)')) {
        var gutterWidth = parseInt(Hypr.getThemeSetting('gutterWidth'), 10);
        $(document).ready(function () {
            $('[data-mz-scrollnav]').each(function () {
                var $this = $(this),
                    $nav = $($this.data('mzScrollnav')),
                    refreshFn = _.debounce(function () {
                        $nav.scrollspy('refresh');
                    }, 500);
                $this.on('click', 'a', function (e) {
                    e.preventDefault();
                    $(this.getAttribute('href')).ScrollTo({ axis: 'y', offsetTop: gutterWidth });
                }).affix({
                    offset: {
                        top: $this.offset().top - gutterWidth,
                        bottom: 0
                    }
                });
                $(window).on('resize', refreshFn);
                api.on('sync', refreshFn);
                api.on('spawn', refreshFn);
                var id = $this.attr('id');
                if (!id) {
                    id = "scrollnav-" + new Date().getTime();
                    $this.attr('id', id);
                }
                $nav.scrollspy({ target: '#' + id, offset: gutterWidth*1.2 });
            });
        });
    }
});

define('shim!vendor/typeahead.js/typeahead.bundle[modules/jquery-mozu=jQuery]>jQuery',['modules/jquery-mozu'], function(jQuery) { 

/*!
 * typeahead.js 0.10.5
 * https://github.com/twitter/typeahead.js
 * Copyright 2013-2014 Twitter, Inc. and other contributors; Licensed MIT
 */

(function($) {
    var _ = function() {
        
        return {
            isMsie: function() {
                return /(msie|trident)/i.test(navigator.userAgent) ? navigator.userAgent.match(/(msie |rv:)(\d+(.\d+)?)/i)[2] : false;
            },
            isBlankString: function(str) {
                return !str || /^\s*$/.test(str);
            },
            escapeRegExChars: function(str) {
                return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
            },
            isString: function(obj) {
                return typeof obj === "string";
            },
            isNumber: function(obj) {
                return typeof obj === "number";
            },
            isArray: $.isArray,
            isFunction: $.isFunction,
            isObject: $.isPlainObject,
            isUndefined: function(obj) {
                return typeof obj === "undefined";
            },
            toStr: function toStr(s) {
                return _.isUndefined(s) || s === null ? "" : s + "";
            },
            bind: $.proxy,
            each: function(collection, cb) {
                $.each(collection, reverseArgs);
                function reverseArgs(index, value) {
                    return cb(value, index);
                }
            },
            map: $.map,
            filter: $.grep,
            every: function(obj, test) {
                var result = true;
                if (!obj) {
                    return result;
                }
                $.each(obj, function(key, val) {
                    if (!(result = test.call(null, val, key, obj))) {
                        return false;
                    }
                });
                return !!result;
            },
            some: function(obj, test) {
                var result = false;
                if (!obj) {
                    return result;
                }
                $.each(obj, function(key, val) {
                    if (result = test.call(null, val, key, obj)) {
                        return false;
                    }
                });
                return !!result;
            },
            mixin: $.extend,
            getUniqueId: function() {
                var counter = 0;
                return function() {
                    return counter++;
                };
            }(),
            templatify: function templatify(obj) {
                return $.isFunction(obj) ? obj : template;
                function template() {
                    return String(obj);
                }
            },
            defer: function(fn) {
                setTimeout(fn, 0);
            },
            debounce: function(func, wait, immediate) {
                var timeout, result;
                return function() {
                    var context = this, args = arguments, later, callNow;
                    later = function() {
                        timeout = null;
                        if (!immediate) {
                            result = func.apply(context, args);
                        }
                    };
                    callNow = immediate && !timeout;
                    clearTimeout(timeout);
                    timeout = setTimeout(later, wait);
                    if (callNow) {
                        result = func.apply(context, args);
                    }
                    return result;
                };
            },
            throttle: function(func, wait) {
                var context, args, timeout, result, previous, later;
                previous = 0;
                later = function() {
                    previous = new Date();
                    timeout = null;
                    result = func.apply(context, args);
                };
                return function() {
                    var now = new Date(), remaining = wait - (now - previous);
                    context = this;
                    args = arguments;
                    if (remaining <= 0) {
                        clearTimeout(timeout);
                        timeout = null;
                        previous = now;
                        result = func.apply(context, args);
                    } else if (!timeout) {
                        timeout = setTimeout(later, remaining);
                    }
                    return result;
                };
            },
            noop: function() {}
        };
    }();
    var VERSION = "0.10.5";
    var tokenizers = function() {
        
        return {
            nonword: nonword,
            whitespace: whitespace,
            obj: {
                nonword: getObjTokenizer(nonword),
                whitespace: getObjTokenizer(whitespace)
            }
        };
        function whitespace(str) {
            str = _.toStr(str);
            return str ? str.split(/\s+/) : [];
        }
        function nonword(str) {
            str = _.toStr(str);
            return str ? str.split(/\W+/) : [];
        }
        function getObjTokenizer(tokenizer) {
            return function setKey() {
                var args = [].slice.call(arguments, 0);
                return function tokenize(o) {
                    var tokens = [];
                    _.each(args, function(k) {
                        tokens = tokens.concat(tokenizer(_.toStr(o[k])));
                    });
                    return tokens;
                };
            };
        }
    }();
    var LruCache = function() {
        
        function LruCache(maxSize) {
            this.maxSize = _.isNumber(maxSize) ? maxSize : 100;
            this.reset();
            if (this.maxSize <= 0) {
                this.set = this.get = $.noop;
            }
        }
        _.mixin(LruCache.prototype, {
            set: function set(key, val) {
                var tailItem = this.list.tail, node;
                if (this.size >= this.maxSize) {
                    this.list.remove(tailItem);
                    delete this.hash[tailItem.key];
                }
                if (node = this.hash[key]) {
                    node.val = val;
                    this.list.moveToFront(node);
                } else {
                    node = new Node(key, val);
                    this.list.add(node);
                    this.hash[key] = node;
                    this.size++;
                }
            },
            get: function get(key) {
                var node = this.hash[key];
                if (node) {
                    this.list.moveToFront(node);
                    return node.val;
                }
            },
            reset: function reset() {
                this.size = 0;
                this.hash = {};
                this.list = new List();
            }
        });
        function List() {
            this.head = this.tail = null;
        }
        _.mixin(List.prototype, {
            add: function add(node) {
                if (this.head) {
                    node.next = this.head;
                    this.head.prev = node;
                }
                this.head = node;
                this.tail = this.tail || node;
            },
            remove: function remove(node) {
                node.prev ? node.prev.next = node.next : this.head = node.next;
                node.next ? node.next.prev = node.prev : this.tail = node.prev;
            },
            moveToFront: function(node) {
                this.remove(node);
                this.add(node);
            }
        });
        function Node(key, val) {
            this.key = key;
            this.val = val;
            this.prev = this.next = null;
        }
        return LruCache;
    }();
    var PersistentStorage = function() {
        
        var ls, methods;
        try {
            ls = window.localStorage;
            ls.setItem("~~~", "!");
            ls.removeItem("~~~");
        } catch (err) {
            ls = null;
        }
        function PersistentStorage(namespace) {
            this.prefix = [ "__", namespace, "__" ].join("");
            this.ttlKey = "__ttl__";
            this.keyMatcher = new RegExp("^" + _.escapeRegExChars(this.prefix));
        }
        if (ls && window.JSON) {
            methods = {
                _prefix: function(key) {
                    return this.prefix + key;
                },
                _ttlKey: function(key) {
                    return this._prefix(key) + this.ttlKey;
                },
                get: function(key) {
                    if (this.isExpired(key)) {
                        this.remove(key);
                    }
                    return decode(ls.getItem(this._prefix(key)));
                },
                set: function(key, val, ttl) {
                    if (_.isNumber(ttl)) {
                        ls.setItem(this._ttlKey(key), encode(now() + ttl));
                    } else {
                        ls.removeItem(this._ttlKey(key));
                    }
                    return ls.setItem(this._prefix(key), encode(val));
                },
                remove: function(key) {
                    ls.removeItem(this._ttlKey(key));
                    ls.removeItem(this._prefix(key));
                    return this;
                },
                clear: function() {
                    var i, key, keys = [], len = ls.length;
                    for (i = 0; i < len; i++) {
                        if ((key = ls.key(i)).match(this.keyMatcher)) {
                            keys.push(key.replace(this.keyMatcher, ""));
                        }
                    }
                    for (i = keys.length; i--; ) {
                        this.remove(keys[i]);
                    }
                    return this;
                },
                isExpired: function(key) {
                    var ttl = decode(ls.getItem(this._ttlKey(key)));
                    return _.isNumber(ttl) && now() > ttl ? true : false;
                }
            };
        } else {
            methods = {
                get: _.noop,
                set: _.noop,
                remove: _.noop,
                clear: _.noop,
                isExpired: _.noop
            };
        }
        _.mixin(PersistentStorage.prototype, methods);
        return PersistentStorage;
        function now() {
            return new Date().getTime();
        }
        function encode(val) {
            return JSON.stringify(_.isUndefined(val) ? null : val);
        }
        function decode(val) {
            return JSON.parse(val);
        }
    }();
    var Transport = function() {
        
        var pendingRequestsCount = 0, pendingRequests = {}, maxPendingRequests = 6, sharedCache = new LruCache(10);
        function Transport(o) {
            o = o || {};
            this.cancelled = false;
            this.lastUrl = null;
            this._send = o.transport ? callbackToDeferred(o.transport) : $.ajax;
            this._get = o.rateLimiter ? o.rateLimiter(this._get) : this._get;
            this._cache = o.cache === false ? new LruCache(0) : sharedCache;
        }
        Transport.setMaxPendingRequests = function setMaxPendingRequests(num) {
            maxPendingRequests = num;
        };
        Transport.resetCache = function resetCache() {
            sharedCache.reset();
        };
        _.mixin(Transport.prototype, {
            _get: function(url, o, cb) {
                var that = this, jqXhr;
                if (this.cancelled || url !== this.lastUrl) {
                    return;
                }
                if (jqXhr = pendingRequests[url]) {
                    jqXhr.done(done).fail(fail);
                } else if (pendingRequestsCount < maxPendingRequests) {
                    pendingRequestsCount++;
                    pendingRequests[url] = this._send(url, o).done(done).fail(fail).always(always);
                } else {
                    this.onDeckRequestArgs = [].slice.call(arguments, 0);
                }
                function done(resp) {
                    cb && cb(null, resp);
                    that._cache.set(url, resp);
                }
                function fail() {
                    cb && cb(true);
                }
                function always() {
                    pendingRequestsCount--;
                    delete pendingRequests[url];
                    if (that.onDeckRequestArgs) {
                        that._get.apply(that, that.onDeckRequestArgs);
                        that.onDeckRequestArgs = null;
                    }
                }
            },
            get: function(url, o, cb) {
                var resp;
                if (_.isFunction(o)) {
                    cb = o;
                    o = {};
                }
                this.cancelled = false;
                this.lastUrl = url;
                if (resp = this._cache.get(url)) {
                    _.defer(function() {
                        cb && cb(null, resp);
                    });
                } else {
                    this._get(url, o, cb);
                }
                return !!resp;
            },
            cancel: function() {
                this.cancelled = true;
            }
        });
        return Transport;
        function callbackToDeferred(fn) {
            return function customSendWrapper(url, o) {
                var deferred = $.Deferred();
                fn(url, o, onSuccess, onError);
                return deferred;
                function onSuccess(resp) {
                    _.defer(function() {
                        deferred.resolve(resp);
                    });
                }
                function onError(err) {
                    _.defer(function() {
                        deferred.reject(err);
                    });
                }
            };
        }
    }();
    var SearchIndex = function() {
        
        function SearchIndex(o) {
            o = o || {};
            if (!o.datumTokenizer || !o.queryTokenizer) {
                $.error("datumTokenizer and queryTokenizer are both required");
            }
            this.datumTokenizer = o.datumTokenizer;
            this.queryTokenizer = o.queryTokenizer;
            this.reset();
        }
        _.mixin(SearchIndex.prototype, {
            bootstrap: function bootstrap(o) {
                this.datums = o.datums;
                this.trie = o.trie;
            },
            add: function(data) {
                var that = this;
                data = _.isArray(data) ? data : [ data ];
                _.each(data, function(datum) {
                    var id, tokens;
                    id = that.datums.push(datum) - 1;
                    tokens = normalizeTokens(that.datumTokenizer(datum));
                    _.each(tokens, function(token) {
                        var node, chars, ch;
                        node = that.trie;
                        chars = token.split("");
                        while (ch = chars.shift()) {
                            node = node.children[ch] || (node.children[ch] = newNode());
                            node.ids.push(id);
                        }
                    });
                });
            },
            get: function get(query) {
                var that = this, tokens, matches;
                tokens = normalizeTokens(this.queryTokenizer(query));
                _.each(tokens, function(token) {
                    var node, chars, ch, ids;
                    if (matches && matches.length === 0) {
                        return false;
                    }
                    node = that.trie;
                    chars = token.split("");
                    while (node && (ch = chars.shift())) {
                        node = node.children[ch];
                    }
                    if (node && chars.length === 0) {
                        ids = node.ids.slice(0);
                        matches = matches ? getIntersection(matches, ids) : ids;
                    } else {
                        matches = [];
                        return false;
                    }
                });
                return matches ? _.map(unique(matches), function(id) {
                    return that.datums[id];
                }) : [];
            },
            reset: function reset() {
                this.datums = [];
                this.trie = newNode();
            },
            serialize: function serialize() {
                return {
                    datums: this.datums,
                    trie: this.trie
                };
            }
        });
        return SearchIndex;
        function normalizeTokens(tokens) {
            tokens = _.filter(tokens, function(token) {
                return !!token;
            });
            tokens = _.map(tokens, function(token) {
                return token.toLowerCase();
            });
            return tokens;
        }
        function newNode() {
            return {
                ids: [],
                children: {}
            };
        }
        function unique(array) {
            var seen = {}, uniques = [];
            for (var i = 0, len = array.length; i < len; i++) {
                if (!seen[array[i]]) {
                    seen[array[i]] = true;
                    uniques.push(array[i]);
                }
            }
            return uniques;
        }
        function getIntersection(arrayA, arrayB) {
            var ai = 0, bi = 0, intersection = [];
            arrayA = arrayA.sort(compare);
            arrayB = arrayB.sort(compare);
            var lenArrayA = arrayA.length, lenArrayB = arrayB.length;
            while (ai < lenArrayA && bi < lenArrayB) {
                if (arrayA[ai] < arrayB[bi]) {
                    ai++;
                } else if (arrayA[ai] > arrayB[bi]) {
                    bi++;
                } else {
                    intersection.push(arrayA[ai]);
                    ai++;
                    bi++;
                }
            }
            return intersection;
            function compare(a, b) {
                return a - b;
            }
        }
    }();
    var oParser = function() {
        
        return {
            local: getLocal,
            prefetch: getPrefetch,
            remote: getRemote
        };
        function getLocal(o) {
            return o.local || null;
        }
        function getPrefetch(o) {
            var prefetch, defaults;
            defaults = {
                url: null,
                thumbprint: "",
                ttl: 24 * 60 * 60 * 1e3,
                filter: null,
                ajax: {}
            };
            if (prefetch = o.prefetch || null) {
                prefetch = _.isString(prefetch) ? {
                    url: prefetch
                } : prefetch;
                prefetch = _.mixin(defaults, prefetch);
                prefetch.thumbprint = VERSION + prefetch.thumbprint;
                prefetch.ajax.type = prefetch.ajax.type || "GET";
                prefetch.ajax.dataType = prefetch.ajax.dataType || "json";
                !prefetch.url && $.error("prefetch requires url to be set");
            }
            return prefetch;
        }
        function getRemote(o) {
            var remote, defaults;
            defaults = {
                url: null,
                cache: true,
                wildcard: "%QUERY",
                replace: null,
                rateLimitBy: "debounce",
                rateLimitWait: 300,
                send: null,
                filter: null,
                ajax: {}
            };
            if (remote = o.remote || null) {
                remote = _.isString(remote) ? {
                    url: remote
                } : remote;
                remote = _.mixin(defaults, remote);
                remote.rateLimiter = /^throttle$/i.test(remote.rateLimitBy) ? byThrottle(remote.rateLimitWait) : byDebounce(remote.rateLimitWait);
                remote.ajax.type = remote.ajax.type || "GET";
                remote.ajax.dataType = remote.ajax.dataType || "json";
                delete remote.rateLimitBy;
                delete remote.rateLimitWait;
                !remote.url && $.error("remote requires url to be set");
            }
            return remote;
            function byDebounce(wait) {
                return function(fn) {
                    return _.debounce(fn, wait);
                };
            }
            function byThrottle(wait) {
                return function(fn) {
                    return _.throttle(fn, wait);
                };
            }
        }
    }();
    (function(root) {
        
        var old, keys;
        old = root.Bloodhound;
        keys = {
            data: "data",
            protocol: "protocol",
            thumbprint: "thumbprint"
        };
        root.Bloodhound = Bloodhound;
        function Bloodhound(o) {
            if (!o || !o.local && !o.prefetch && !o.remote) {
                $.error("one of local, prefetch, or remote is required");
            }
            this.limit = o.limit || 5;
            this.sorter = getSorter(o.sorter);
            this.dupDetector = o.dupDetector || ignoreDuplicates;
            this.local = oParser.local(o);
            this.prefetch = oParser.prefetch(o);
            this.remote = oParser.remote(o);
            this.cacheKey = this.prefetch ? this.prefetch.cacheKey || this.prefetch.url : null;
            this.index = new SearchIndex({
                datumTokenizer: o.datumTokenizer,
                queryTokenizer: o.queryTokenizer
            });
            this.storage = this.cacheKey ? new PersistentStorage(this.cacheKey) : null;
        }
        Bloodhound.noConflict = function noConflict() {
            root.Bloodhound = old;
            return Bloodhound;
        };
        Bloodhound.tokenizers = tokenizers;
        _.mixin(Bloodhound.prototype, {
            _loadPrefetch: function loadPrefetch(o) {
                var that = this, serialized, deferred;
                if (serialized = this._readFromStorage(o.thumbprint)) {
                    this.index.bootstrap(serialized);
                    deferred = $.Deferred().resolve();
                } else {
                    deferred = $.ajax(o.url, o.ajax).done(handlePrefetchResponse);
                }
                return deferred;
                function handlePrefetchResponse(resp) {
                    that.clear();
                    that.add(o.filter ? o.filter(resp) : resp);
                    that._saveToStorage(that.index.serialize(), o.thumbprint, o.ttl);
                }
            },
            _getFromRemote: function getFromRemote(query, cb) {
                var that = this, url, uriEncodedQuery;
                if (!this.transport) {
                    return;
                }
                query = query || "";
                uriEncodedQuery = encodeURIComponent(query);
                url = this.remote.replace ? this.remote.replace(this.remote.url, query) : this.remote.url.replace(this.remote.wildcard, uriEncodedQuery);
                return this.transport.get(url, this.remote.ajax, handleRemoteResponse);
                function handleRemoteResponse(err, resp) {
                    err ? cb([]) : cb(that.remote.filter ? that.remote.filter(resp) : resp);
                }
            },
            _cancelLastRemoteRequest: function cancelLastRemoteRequest() {
                this.transport && this.transport.cancel();
            },
            _saveToStorage: function saveToStorage(data, thumbprint, ttl) {
                if (this.storage) {
                    this.storage.set(keys.data, data, ttl);
                    this.storage.set(keys.protocol, location.protocol, ttl);
                    this.storage.set(keys.thumbprint, thumbprint, ttl);
                }
            },
            _readFromStorage: function readFromStorage(thumbprint) {
                var stored = {}, isExpired;
                if (this.storage) {
                    stored.data = this.storage.get(keys.data);
                    stored.protocol = this.storage.get(keys.protocol);
                    stored.thumbprint = this.storage.get(keys.thumbprint);
                }
                isExpired = stored.thumbprint !== thumbprint || stored.protocol !== location.protocol;
                return stored.data && !isExpired ? stored.data : null;
            },
            _initialize: function initialize() {
                var that = this, local = this.local, deferred;
                deferred = this.prefetch ? this._loadPrefetch(this.prefetch) : $.Deferred().resolve();
                local && deferred.done(addLocalToIndex);
                this.transport = this.remote ? new Transport(this.remote) : null;
                return this.initPromise = deferred.promise();
                function addLocalToIndex() {
                    that.add(_.isFunction(local) ? local() : local);
                }
            },
            initialize: function initialize(force) {
                return !this.initPromise || force ? this._initialize() : this.initPromise;
            },
            add: function add(data) {
                this.index.add(data);
            },
            get: function get(query, cb) {
                var that = this, matches = [], cacheHit = false;
                matches = this.index.get(query);
                matches = this.sorter(matches).slice(0, this.limit);
                matches.length < this.limit ? cacheHit = this._getFromRemote(query, returnRemoteMatches) : this._cancelLastRemoteRequest();
                if (!cacheHit) {
                    (matches.length > 0 || !this.transport) && cb && cb(matches);
                }
                function returnRemoteMatches(remoteMatches) {
                    var matchesWithBackfill = matches.slice(0);
                    _.each(remoteMatches, function(remoteMatch) {
                        var isDuplicate;
                        isDuplicate = _.some(matchesWithBackfill, function(match) {
                            return that.dupDetector(remoteMatch, match);
                        });
                        !isDuplicate && matchesWithBackfill.push(remoteMatch);
                        return matchesWithBackfill.length < that.limit;
                    });
                    cb && cb(that.sorter(matchesWithBackfill));
                }
            },
            clear: function clear() {
                this.index.reset();
            },
            clearPrefetchCache: function clearPrefetchCache() {
                this.storage && this.storage.clear();
            },
            clearRemoteCache: function clearRemoteCache() {
                this.transport && Transport.resetCache();
            },
            ttAdapter: function ttAdapter() {
                return _.bind(this.get, this);
            }
        });
        return Bloodhound;
        function getSorter(sortFn) {
            return _.isFunction(sortFn) ? sort : noSort;
            function sort(array) {
                return array.sort(sortFn);
            }
            function noSort(array) {
                return array;
            }
        }
        function ignoreDuplicates() {
            return false;
        }
    })(this);
    var html = function() {
        return {
            wrapper: '<span class="twitter-typeahead"></span>',
            dropdown: '<span class="tt-dropdown-menu"></span>',
            dataset: '<div class="tt-dataset-%CLASS%"></div>',
            suggestions: '<span class="tt-suggestions"></span>',
            suggestion: '<div class="tt-suggestion"></div>'
        };
    }();
    var css = function() {
        
        var css = {
            wrapper: {
                position: "relative",
                display: "inline-block"
            },
            hint: {
                position: "absolute",
                top: "0",
                left: "0",
                borderColor: "transparent",
                boxShadow: "none",
                opacity: "1"
            },
            input: {
                position: "relative",
                verticalAlign: "top",
                backgroundColor: "transparent"
            },
            inputWithNoHint: {
                position: "relative",
                verticalAlign: "top"
            },
            dropdown: {
                position: "absolute",
                top: "100%",
                left: "0",
                zIndex: "100",
                display: "none"
            },
            suggestions: {
                display: "block"
            },
            suggestion: {
                whiteSpace: "nowrap",
                cursor: "pointer"
            },
            suggestionChild: {
                whiteSpace: "normal"
            },
            ltr: {
                left: "0",
                right: "auto"
            },
            rtl: {
                left: "auto",
                right: " 0"
            }
        };
        if (_.isMsie()) {
            _.mixin(css.input, {
                backgroundImage: "url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7)"
            });
        }
        if (_.isMsie() && _.isMsie() <= 7) {
            _.mixin(css.input, {
                marginTop: "-1px"
            });
        }
        return css;
    }();
    var EventBus = function() {
        
        var namespace = "typeahead:";
        function EventBus(o) {
            if (!o || !o.el) {
                $.error("EventBus initialized without el");
            }
            this.$el = $(o.el);
        }
        _.mixin(EventBus.prototype, {
            trigger: function(type) {
                var args = [].slice.call(arguments, 1);
                this.$el.trigger(namespace + type, args);
            }
        });
        return EventBus;
    }();
    var EventEmitter = function() {
        
        var splitter = /\s+/, nextTick = getNextTick();
        return {
            onSync: onSync,
            onAsync: onAsync,
            off: off,
            trigger: trigger
        };
        function on(method, types, cb, context) {
            var type;
            if (!cb) {
                return this;
            }
            types = types.split(splitter);
            cb = context ? bindContext(cb, context) : cb;
            this._callbacks = this._callbacks || {};
            while (type = types.shift()) {
                this._callbacks[type] = this._callbacks[type] || {
                    sync: [],
                    async: []
                };
                this._callbacks[type][method].push(cb);
            }
            return this;
        }
        function onAsync(types, cb, context) {
            return on.call(this, "async", types, cb, context);
        }
        function onSync(types, cb, context) {
            return on.call(this, "sync", types, cb, context);
        }
        function off(types) {
            var type;
            if (!this._callbacks) {
                return this;
            }
            types = types.split(splitter);
            while (type = types.shift()) {
                delete this._callbacks[type];
            }
            return this;
        }
        function trigger(types) {
            var type, callbacks, args, syncFlush, asyncFlush;
            if (!this._callbacks) {
                return this;
            }
            types = types.split(splitter);
            args = [].slice.call(arguments, 1);
            while ((type = types.shift()) && (callbacks = this._callbacks[type])) {
                syncFlush = getFlush(callbacks.sync, this, [ type ].concat(args));
                asyncFlush = getFlush(callbacks.async, this, [ type ].concat(args));
                syncFlush() && nextTick(asyncFlush);
            }
            return this;
        }
        function getFlush(callbacks, context, args) {
            return flush;
            function flush() {
                var cancelled;
                for (var i = 0, len = callbacks.length; !cancelled && i < len; i += 1) {
                    cancelled = callbacks[i].apply(context, args) === false;
                }
                return !cancelled;
            }
        }
        function getNextTick() {
            var nextTickFn;
            if (window.setImmediate) {
                nextTickFn = function nextTickSetImmediate(fn) {
                    setImmediate(function() {
                        fn();
                    });
                };
            } else {
                nextTickFn = function nextTickSetTimeout(fn) {
                    setTimeout(function() {
                        fn();
                    }, 0);
                };
            }
            return nextTickFn;
        }
        function bindContext(fn, context) {
            return fn.bind ? fn.bind(context) : function() {
                fn.apply(context, [].slice.call(arguments, 0));
            };
        }
    }();
    var highlight = function(doc) {
        
        var defaults = {
            node: null,
            pattern: null,
            tagName: "strong",
            className: null,
            wordsOnly: false,
            caseSensitive: false
        };
        return function hightlight(o) {
            var regex;
            o = _.mixin({}, defaults, o);
            if (!o.node || !o.pattern) {
                return;
            }
            o.pattern = _.isArray(o.pattern) ? o.pattern : [ o.pattern ];
            regex = getRegex(o.pattern, o.caseSensitive, o.wordsOnly);
            traverse(o.node, hightlightTextNode);
            function hightlightTextNode(textNode) {
                var match, patternNode, wrapperNode;
                if (match = regex.exec(textNode.data)) {
                    wrapperNode = doc.createElement(o.tagName);
                    o.className && (wrapperNode.className = o.className);
                    patternNode = textNode.splitText(match.index);
                    patternNode.splitText(match[0].length);
                    wrapperNode.appendChild(patternNode.cloneNode(true));
                    textNode.parentNode.replaceChild(wrapperNode, patternNode);
                }
                return !!match;
            }
            function traverse(el, hightlightTextNode) {
                var childNode, TEXT_NODE_TYPE = 3;
                for (var i = 0; i < el.childNodes.length; i++) {
                    childNode = el.childNodes[i];
                    if (childNode.nodeType === TEXT_NODE_TYPE) {
                        i += hightlightTextNode(childNode) ? 1 : 0;
                    } else {
                        traverse(childNode, hightlightTextNode);
                    }
                }
            }
        };
        function getRegex(patterns, caseSensitive, wordsOnly) {
            var escapedPatterns = [], regexStr;
            for (var i = 0, len = patterns.length; i < len; i++) {
                escapedPatterns.push(_.escapeRegExChars(patterns[i]));
            }
            regexStr = wordsOnly ? "\\b(" + escapedPatterns.join("|") + ")\\b" : "(" + escapedPatterns.join("|") + ")";
            return caseSensitive ? new RegExp(regexStr) : new RegExp(regexStr, "i");
        }
    }(window.document);
    var Input = function() {
        
        var specialKeyCodeMap;
        specialKeyCodeMap = {
            9: "tab",
            27: "esc",
            37: "left",
            39: "right",
            13: "enter",
            38: "up",
            40: "down"
        };
        function Input(o) {
            var that = this, onBlur, onFocus, onKeydown, onInput;
            o = o || {};
            if (!o.input) {
                $.error("input is missing");
            }
            onBlur = _.bind(this._onBlur, this);
            onFocus = _.bind(this._onFocus, this);
            onKeydown = _.bind(this._onKeydown, this);
            onInput = _.bind(this._onInput, this);
            this.$hint = $(o.hint);
            this.$input = $(o.input).on("blur.tt", onBlur).on("focus.tt", onFocus).on("keydown.tt", onKeydown);
            if (this.$hint.length === 0) {
                this.setHint = this.getHint = this.clearHint = this.clearHintIfInvalid = _.noop;
            }
            if (!_.isMsie()) {
                this.$input.on("input.tt", onInput);
            } else {
                this.$input.on("keydown.tt keypress.tt cut.tt paste.tt", function($e) {
                    if (specialKeyCodeMap[$e.which || $e.keyCode]) {
                        return;
                    }
                    _.defer(_.bind(that._onInput, that, $e));
                });
            }
            this.query = this.$input.val();
            this.$overflowHelper = buildOverflowHelper(this.$input);
        }
        Input.normalizeQuery = function(str) {
            return (str || "").replace(/^\s*/g, "").replace(/\s{2,}/g, " ");
        };
        _.mixin(Input.prototype, EventEmitter, {
            _onBlur: function onBlur() {
                this.resetInputValue();
                this.trigger("blurred");
            },
            _onFocus: function onFocus() {
                this.trigger("focused");
            },
            _onKeydown: function onKeydown($e) {
                var keyName = specialKeyCodeMap[$e.which || $e.keyCode];
                this._managePreventDefault(keyName, $e);
                if (keyName && this._shouldTrigger(keyName, $e)) {
                    this.trigger(keyName + "Keyed", $e);
                }
            },
            _onInput: function onInput() {
                this._checkInputValue();
            },
            _managePreventDefault: function managePreventDefault(keyName, $e) {
                var preventDefault, hintValue, inputValue;
                switch (keyName) {
                  case "tab":
                    hintValue = this.getHint();
                    inputValue = this.getInputValue();
                    preventDefault = hintValue && hintValue !== inputValue && !withModifier($e);
                    break;

                  case "up":
                  case "down":
                    preventDefault = !withModifier($e);
                    break;

                  default:
                    preventDefault = false;
                }
                preventDefault && $e.preventDefault();
            },
            _shouldTrigger: function shouldTrigger(keyName, $e) {
                var trigger;
                switch (keyName) {
                  case "tab":
                    trigger = !withModifier($e);
                    break;

                  default:
                    trigger = true;
                }
                return trigger;
            },
            _checkInputValue: function checkInputValue() {
                var inputValue, areEquivalent, hasDifferentWhitespace;
                inputValue = this.getInputValue();
                areEquivalent = areQueriesEquivalent(inputValue, this.query);
                hasDifferentWhitespace = areEquivalent ? this.query.length !== inputValue.length : false;
                this.query = inputValue;
                if (!areEquivalent) {
                    this.trigger("queryChanged", this.query);
                } else if (hasDifferentWhitespace) {
                    this.trigger("whitespaceChanged", this.query);
                }
            },
            focus: function focus() {
                this.$input.focus();
            },
            blur: function blur() {
                this.$input.blur();
            },
            getQuery: function getQuery() {
                return this.query;
            },
            setQuery: function setQuery(query) {
                this.query = query;
            },
            getInputValue: function getInputValue() {
                return this.$input.val();
            },
            setInputValue: function setInputValue(value, silent) {
                this.$input.val(value);
                silent ? this.clearHint() : this._checkInputValue();
            },
            resetInputValue: function resetInputValue() {
                this.setInputValue(this.query, true);
            },
            getHint: function getHint() {
                return this.$hint.val();
            },
            setHint: function setHint(value) {
                this.$hint.val(value);
            },
            clearHint: function clearHint() {
                this.setHint("");
            },
            clearHintIfInvalid: function clearHintIfInvalid() {
                var val, hint, valIsPrefixOfHint, isValid;
                val = this.getInputValue();
                hint = this.getHint();
                valIsPrefixOfHint = val !== hint && hint.indexOf(val) === 0;
                isValid = val !== "" && valIsPrefixOfHint && !this.hasOverflow();
                !isValid && this.clearHint();
            },
            getLanguageDirection: function getLanguageDirection() {
                return (this.$input.css("direction") || "ltr").toLowerCase();
            },
            hasOverflow: function hasOverflow() {
                var constraint = this.$input.width() - 2;
                this.$overflowHelper.text(this.getInputValue());
                return this.$overflowHelper.width() >= constraint;
            },
            isCursorAtEnd: function() {
                var valueLength, selectionStart, range;
                valueLength = this.$input.val().length;
                selectionStart = this.$input[0].selectionStart;
                if (_.isNumber(selectionStart)) {
                    return selectionStart === valueLength;
                } else if (document.selection) {
                    range = document.selection.createRange();
                    range.moveStart("character", -valueLength);
                    return valueLength === range.text.length;
                }
                return true;
            },
            destroy: function destroy() {
                this.$hint.off(".tt");
                this.$input.off(".tt");
                this.$hint = this.$input = this.$overflowHelper = null;
            }
        });
        return Input;
        function buildOverflowHelper($input) {
            return $('<pre aria-hidden="true"></pre>').css({
                position: "absolute",
                visibility: "hidden",
                whiteSpace: "pre",
                fontFamily: $input.css("font-family"),
                fontSize: $input.css("font-size"),
                fontStyle: $input.css("font-style"),
                fontVariant: $input.css("font-variant"),
                fontWeight: $input.css("font-weight"),
                wordSpacing: $input.css("word-spacing"),
                letterSpacing: $input.css("letter-spacing"),
                textIndent: $input.css("text-indent"),
                textRendering: $input.css("text-rendering"),
                textTransform: $input.css("text-transform")
            }).insertAfter($input);
        }
        function areQueriesEquivalent(a, b) {
            return Input.normalizeQuery(a) === Input.normalizeQuery(b);
        }
        function withModifier($e) {
            return $e.altKey || $e.ctrlKey || $e.metaKey || $e.shiftKey;
        }
    }();
    var Dataset = function() {
        
        var datasetKey = "ttDataset", valueKey = "ttValue", datumKey = "ttDatum";
        function Dataset(o) {
            o = o || {};
            o.templates = o.templates || {};
            if (!o.source) {
                $.error("missing source");
            }
            if (o.name && !isValidName(o.name)) {
                $.error("invalid dataset name: " + o.name);
            }
            this.query = null;
            this.highlight = !!o.highlight;
            this.name = o.name || _.getUniqueId();
            this.source = o.source;
            this.displayFn = getDisplayFn(o.display || o.displayKey);
            this.templates = getTemplates(o.templates, this.displayFn);
            this.$el = $(html.dataset.replace("%CLASS%", this.name));
        }
        Dataset.extractDatasetName = function extractDatasetName(el) {
            return $(el).data(datasetKey);
        };
        Dataset.extractValue = function extractDatum(el) {
            return $(el).data(valueKey);
        };
        Dataset.extractDatum = function extractDatum(el) {
            return $(el).data(datumKey);
        };
        _.mixin(Dataset.prototype, EventEmitter, {
            _render: function render(query, suggestions) {
                if (!this.$el) {
                    return;
                }
                var that = this, hasSuggestions;
                this.$el.empty();
                hasSuggestions = suggestions && suggestions.length;
                if (!hasSuggestions && this.templates.empty) {
                    this.$el.html(getEmptyHtml()).prepend(that.templates.header ? getHeaderHtml() : null).append(that.templates.footer ? getFooterHtml() : null);
                } else if (hasSuggestions) {
                    this.$el.html(getSuggestionsHtml()).prepend(that.templates.header ? getHeaderHtml() : null).append(that.templates.footer ? getFooterHtml() : null);
                }
                this.trigger("rendered");
                function getEmptyHtml() {
                    return that.templates.empty({
                        query: query,
                        isEmpty: true
                    });
                }
                function getSuggestionsHtml() {
                    var $suggestions, nodes;
                    $suggestions = $(html.suggestions).css(css.suggestions);
                    nodes = _.map(suggestions, getSuggestionNode);
                    $suggestions.append.apply($suggestions, nodes);
                    that.highlight && highlight({
                        className: "tt-highlight",
                        node: $suggestions[0],
                        pattern: query
                    });
                    return $suggestions;
                    function getSuggestionNode(suggestion) {
                        var $el;
                        $el = $(html.suggestion).append(that.templates.suggestion(suggestion)).data(datasetKey, that.name).data(valueKey, that.displayFn(suggestion)).data(datumKey, suggestion);
                        $el.children().each(function() {
                            $(this).css(css.suggestionChild);
                        });
                        return $el;
                    }
                }
                function getHeaderHtml() {
                    return that.templates.header({
                        query: query,
                        isEmpty: !hasSuggestions
                    });
                }
                function getFooterHtml() {
                    return that.templates.footer({
                        query: query,
                        isEmpty: !hasSuggestions
                    });
                }
            },
            getRoot: function getRoot() {
                return this.$el;
            },
            update: function update(query) {
                var that = this;
                this.query = query;
                this.canceled = false;
                this.source(query, render);
                function render(suggestions) {
                    if (!that.canceled && query === that.query) {
                        that._render(query, suggestions);
                    }
                }
            },
            cancel: function cancel() {
                this.canceled = true;
            },
            clear: function clear() {
                this.cancel();
                this.$el.empty();
                this.trigger("rendered");
            },
            isEmpty: function isEmpty() {
                return this.$el.is(":empty");
            },
            destroy: function destroy() {
                this.$el = null;
            }
        });
        return Dataset;
        function getDisplayFn(display) {
            display = display || "value";
            return _.isFunction(display) ? display : displayFn;
            function displayFn(obj) {
                return obj[display];
            }
        }
        function getTemplates(templates, displayFn) {
            return {
                empty: templates.empty && _.templatify(templates.empty),
                header: templates.header && _.templatify(templates.header),
                footer: templates.footer && _.templatify(templates.footer),
                suggestion: templates.suggestion || suggestionTemplate
            };
            function suggestionTemplate(context) {
                return "<p>" + displayFn(context) + "</p>";
            }
        }
        function isValidName(str) {
            return /^[_a-zA-Z0-9-]+$/.test(str);
        }
    }();
    var Dropdown = function() {
        
        function Dropdown(o) {
            var that = this, onSuggestionClick, onSuggestionMouseEnter, onSuggestionMouseLeave;
            o = o || {};
            if (!o.menu) {
                $.error("menu is required");
            }
            this.isOpen = false;
            this.isEmpty = true;
            this.datasets = _.map(o.datasets, initializeDataset);
            onSuggestionClick = _.bind(this._onSuggestionClick, this);
            onSuggestionMouseEnter = _.bind(this._onSuggestionMouseEnter, this);
            onSuggestionMouseLeave = _.bind(this._onSuggestionMouseLeave, this);
            this.$menu = $(o.menu).on("click.tt", ".tt-suggestion", onSuggestionClick).on("mouseenter.tt", ".tt-suggestion", onSuggestionMouseEnter).on("mouseleave.tt", ".tt-suggestion", onSuggestionMouseLeave);
            _.each(this.datasets, function(dataset) {
                that.$menu.append(dataset.getRoot());
                dataset.onSync("rendered", that._onRendered, that);
            });
        }
        _.mixin(Dropdown.prototype, EventEmitter, {
            _onSuggestionClick: function onSuggestionClick($e) {
                this.trigger("suggestionClicked", $($e.currentTarget));
            },
            _onSuggestionMouseEnter: function onSuggestionMouseEnter($e) {
                this._removeCursor();
                this._setCursor($($e.currentTarget), true);
            },
            _onSuggestionMouseLeave: function onSuggestionMouseLeave() {
                this._removeCursor();
            },
            _onRendered: function onRendered() {
                this.isEmpty = _.every(this.datasets, isDatasetEmpty);
                this.isEmpty ? this._hide() : this.isOpen && this._show();
                this.trigger("datasetRendered");
                function isDatasetEmpty(dataset) {
                    return dataset.isEmpty();
                }
            },
            _hide: function() {
                this.$menu.hide();
            },
            _show: function() {
                this.$menu.css("display", "block");
            },
            _getSuggestions: function getSuggestions() {
                return this.$menu.find(".tt-suggestion");
            },
            _getCursor: function getCursor() {
                return this.$menu.find(".tt-cursor").first();
            },
            _setCursor: function setCursor($el, silent) {
                $el.first().addClass("tt-cursor");
                !silent && this.trigger("cursorMoved");
            },
            _removeCursor: function removeCursor() {
                this._getCursor().removeClass("tt-cursor");
            },
            _moveCursor: function moveCursor(increment) {
                var $suggestions, $oldCursor, newCursorIndex, $newCursor;
                if (!this.isOpen) {
                    return;
                }
                $oldCursor = this._getCursor();
                $suggestions = this._getSuggestions();
                this._removeCursor();
                newCursorIndex = $suggestions.index($oldCursor) + increment;
                newCursorIndex = (newCursorIndex + 1) % ($suggestions.length + 1) - 1;
                if (newCursorIndex === -1) {
                    this.trigger("cursorRemoved");
                    return;
                } else if (newCursorIndex < -1) {
                    newCursorIndex = $suggestions.length - 1;
                }
                this._setCursor($newCursor = $suggestions.eq(newCursorIndex));
                this._ensureVisible($newCursor);
            },
            _ensureVisible: function ensureVisible($el) {
                var elTop, elBottom, menuScrollTop, menuHeight;
                elTop = $el.position().top;
                elBottom = elTop + $el.outerHeight(true);
                menuScrollTop = this.$menu.scrollTop();
                menuHeight = this.$menu.height() + parseInt(this.$menu.css("paddingTop"), 10) + parseInt(this.$menu.css("paddingBottom"), 10);
                if (elTop < 0) {
                    this.$menu.scrollTop(menuScrollTop + elTop);
                } else if (menuHeight < elBottom) {
                    this.$menu.scrollTop(menuScrollTop + (elBottom - menuHeight));
                }
            },
            close: function close() {
                if (this.isOpen) {
                    this.isOpen = false;
                    this._removeCursor();
                    this._hide();
                    this.trigger("closed");
                }
            },
            open: function open() {
                if (!this.isOpen) {
                    this.isOpen = true;
                    !this.isEmpty && this._show();
                    this.trigger("opened");
                }
            },
            setLanguageDirection: function setLanguageDirection(dir) {
                this.$menu.css(dir === "ltr" ? css.ltr : css.rtl);
            },
            moveCursorUp: function moveCursorUp() {
                this._moveCursor(-1);
            },
            moveCursorDown: function moveCursorDown() {
                this._moveCursor(+1);
            },
            getDatumForSuggestion: function getDatumForSuggestion($el) {
                var datum = null;
                if ($el.length) {
                    datum = {
                        raw: Dataset.extractDatum($el),
                        value: Dataset.extractValue($el),
                        datasetName: Dataset.extractDatasetName($el)
                    };
                }
                return datum;
            },
            getDatumForCursor: function getDatumForCursor() {
                return this.getDatumForSuggestion(this._getCursor().first());
            },
            getDatumForTopSuggestion: function getDatumForTopSuggestion() {
                return this.getDatumForSuggestion(this._getSuggestions().first());
            },
            update: function update(query) {
                _.each(this.datasets, updateDataset);
                function updateDataset(dataset) {
                    dataset.update(query);
                }
            },
            empty: function empty() {
                _.each(this.datasets, clearDataset);
                this.isEmpty = true;
                function clearDataset(dataset) {
                    dataset.clear();
                }
            },
            isVisible: function isVisible() {
                return this.isOpen && !this.isEmpty;
            },
            destroy: function destroy() {
                this.$menu.off(".tt");
                this.$menu = null;
                _.each(this.datasets, destroyDataset);
                function destroyDataset(dataset) {
                    dataset.destroy();
                }
            }
        });
        return Dropdown;
        function initializeDataset(oDataset) {
            return new Dataset(oDataset);
        }
    }();
    var Typeahead = function() {
        
        var attrsKey = "ttAttrs";
        function Typeahead(o) {
            var $menu, $input, $hint;
            o = o || {};
            if (!o.input) {
                $.error("missing input");
            }
            this.isActivated = false;
            this.autoselect = !!o.autoselect;
            this.minLength = _.isNumber(o.minLength) ? o.minLength : 1;
            this.$node = buildDom(o.input, o.withHint);
            $menu = this.$node.find(".tt-dropdown-menu");
            $input = this.$node.find(".tt-input");
            $hint = this.$node.find(".tt-hint");
            $input.on("blur.tt", function($e) {
                var active, isActive, hasActive;
                active = document.activeElement;
                isActive = $menu.is(active);
                hasActive = $menu.has(active).length > 0;
                if (_.isMsie() && (isActive || hasActive)) {
                    $e.preventDefault();
                    $e.stopImmediatePropagation();
                    _.defer(function() {
                        $input.focus();
                    });
                }
            });
            $menu.on("mousedown.tt", function($e) {
                $e.preventDefault();
            });
            this.eventBus = o.eventBus || new EventBus({
                el: $input
            });
            this.dropdown = new Dropdown({
                menu: $menu,
                datasets: o.datasets
            }).onSync("suggestionClicked", this._onSuggestionClicked, this).onSync("cursorMoved", this._onCursorMoved, this).onSync("cursorRemoved", this._onCursorRemoved, this).onSync("opened", this._onOpened, this).onSync("closed", this._onClosed, this).onAsync("datasetRendered", this._onDatasetRendered, this);
            this.input = new Input({
                input: $input,
                hint: $hint
            }).onSync("focused", this._onFocused, this).onSync("blurred", this._onBlurred, this).onSync("enterKeyed", this._onEnterKeyed, this).onSync("tabKeyed", this._onTabKeyed, this).onSync("escKeyed", this._onEscKeyed, this).onSync("upKeyed", this._onUpKeyed, this).onSync("downKeyed", this._onDownKeyed, this).onSync("leftKeyed", this._onLeftKeyed, this).onSync("rightKeyed", this._onRightKeyed, this).onSync("queryChanged", this._onQueryChanged, this).onSync("whitespaceChanged", this._onWhitespaceChanged, this);
            this._setLanguageDirection();
        }
        _.mixin(Typeahead.prototype, {
            _onSuggestionClicked: function onSuggestionClicked(type, $el) {
                var datum;
                if (datum = this.dropdown.getDatumForSuggestion($el)) {
                    this._select(datum);
                }
            },
            _onCursorMoved: function onCursorMoved() {
                var datum = this.dropdown.getDatumForCursor();
                this.input.setInputValue(datum.value, true);
                this.eventBus.trigger("cursorchanged", datum.raw, datum.datasetName);
            },
            _onCursorRemoved: function onCursorRemoved() {
                this.input.resetInputValue();
                this._updateHint();
            },
            _onDatasetRendered: function onDatasetRendered() {
                this._updateHint();
            },
            _onOpened: function onOpened() {
                this._updateHint();
                this.eventBus.trigger("opened");
            },
            _onClosed: function onClosed() {
                this.input.clearHint();
                this.eventBus.trigger("closed");
            },
            _onFocused: function onFocused() {
                this.isActivated = true;
                this.dropdown.open();
            },
            _onBlurred: function onBlurred() {
                this.isActivated = false;
                this.dropdown.empty();
                this.dropdown.close();
            },
            _onEnterKeyed: function onEnterKeyed(type, $e) {
                var cursorDatum, topSuggestionDatum;
                cursorDatum = this.dropdown.getDatumForCursor();
                topSuggestionDatum = this.dropdown.getDatumForTopSuggestion();
                if (cursorDatum) {
                    this._select(cursorDatum);
                    $e.preventDefault();
                } else if (this.autoselect && topSuggestionDatum) {
                    this._select(topSuggestionDatum);
                    $e.preventDefault();
                }
            },
            _onTabKeyed: function onTabKeyed(type, $e) {
                var datum;
                if (datum = this.dropdown.getDatumForCursor()) {
                    this._select(datum);
                    $e.preventDefault();
                } else {
                    this._autocomplete(true);
                }
            },
            _onEscKeyed: function onEscKeyed() {
                this.dropdown.close();
                this.input.resetInputValue();
            },
            _onUpKeyed: function onUpKeyed() {
                var query = this.input.getQuery();
                this.dropdown.isEmpty && query.length >= this.minLength ? this.dropdown.update(query) : this.dropdown.moveCursorUp();
                this.dropdown.open();
            },
            _onDownKeyed: function onDownKeyed() {
                var query = this.input.getQuery();
                this.dropdown.isEmpty && query.length >= this.minLength ? this.dropdown.update(query) : this.dropdown.moveCursorDown();
                this.dropdown.open();
            },
            _onLeftKeyed: function onLeftKeyed() {
                this.dir === "rtl" && this._autocomplete();
            },
            _onRightKeyed: function onRightKeyed() {
                this.dir === "ltr" && this._autocomplete();
            },
            _onQueryChanged: function onQueryChanged(e, query) {
                this.input.clearHintIfInvalid();
                query.length >= this.minLength ? this.dropdown.update(query) : this.dropdown.empty();
                this.dropdown.open();
                this._setLanguageDirection();
            },
            _onWhitespaceChanged: function onWhitespaceChanged() {
                this._updateHint();
                this.dropdown.open();
            },
            _setLanguageDirection: function setLanguageDirection() {
                var dir;
                if (this.dir !== (dir = this.input.getLanguageDirection())) {
                    this.dir = dir;
                    this.$node.css("direction", dir);
                    this.dropdown.setLanguageDirection(dir);
                }
            },
            _updateHint: function updateHint() {
                var datum, val, query, escapedQuery, frontMatchRegEx, match;
                datum = this.dropdown.getDatumForTopSuggestion();
                if (datum && this.dropdown.isVisible() && !this.input.hasOverflow()) {
                    val = this.input.getInputValue();
                    query = Input.normalizeQuery(val);
                    escapedQuery = _.escapeRegExChars(query);
                    frontMatchRegEx = new RegExp("^(?:" + escapedQuery + ")(.+$)", "i");
                    match = frontMatchRegEx.exec(datum.value);
                    match ? this.input.setHint(val + match[1]) : this.input.clearHint();
                } else {
                    this.input.clearHint();
                }
            },
            _autocomplete: function autocomplete(laxCursor) {
                var hint, query, isCursorAtEnd, datum;
                hint = this.input.getHint();
                query = this.input.getQuery();
                isCursorAtEnd = laxCursor || this.input.isCursorAtEnd();
                if (hint && query !== hint && isCursorAtEnd) {
                    datum = this.dropdown.getDatumForTopSuggestion();
                    datum && this.input.setInputValue(datum.value);
                    this.eventBus.trigger("autocompleted", datum.raw, datum.datasetName);
                }
            },
            _select: function select(datum) {
                this.input.setQuery(datum.value);
                this.input.setInputValue(datum.value, true);
                this._setLanguageDirection();
                this.eventBus.trigger("selected", datum.raw, datum.datasetName);
                this.dropdown.close();
                _.defer(_.bind(this.dropdown.empty, this.dropdown));
            },
            open: function open() {
                this.dropdown.open();
            },
            close: function close() {
                this.dropdown.close();
            },
            setVal: function setVal(val) {
                val = _.toStr(val);
                if (this.isActivated) {
                    this.input.setInputValue(val);
                } else {
                    this.input.setQuery(val);
                    this.input.setInputValue(val, true);
                }
                this._setLanguageDirection();
            },
            getVal: function getVal() {
                return this.input.getQuery();
            },
            destroy: function destroy() {
                this.input.destroy();
                this.dropdown.destroy();
                destroyDomStructure(this.$node);
                this.$node = null;
            }
        });
        return Typeahead;
        function buildDom(input, withHint) {
            var $input, $wrapper, $dropdown, $hint;
            $input = $(input);
            $wrapper = $(html.wrapper).css(css.wrapper);
            $dropdown = $(html.dropdown).css(css.dropdown);
            $hint = $input.clone().css(css.hint).css(getBackgroundStyles($input));
            $hint.val("").removeData().addClass("tt-hint").removeAttr("id name placeholder required").prop("readonly", true).attr({
                autocomplete: "off",
                spellcheck: "false",
                tabindex: -1
            });
            $input.data(attrsKey, {
                dir: $input.attr("dir"),
                autocomplete: $input.attr("autocomplete"),
                spellcheck: $input.attr("spellcheck"),
                style: $input.attr("style")
            });
            $input.addClass("tt-input").attr({
                autocomplete: "off",
                spellcheck: false
            }).css(withHint ? css.input : css.inputWithNoHint);
            try {
                !$input.attr("dir") && $input.attr("dir", "auto");
            } catch (e) {}
            return $input.wrap($wrapper).parent().prepend(withHint ? $hint : null).append($dropdown);
        }
        function getBackgroundStyles($el) {
            return {
                backgroundAttachment: $el.css("background-attachment"),
                backgroundClip: $el.css("background-clip"),
                backgroundColor: $el.css("background-color"),
                backgroundImage: $el.css("background-image"),
                backgroundOrigin: $el.css("background-origin"),
                backgroundPosition: $el.css("background-position"),
                backgroundRepeat: $el.css("background-repeat"),
                backgroundSize: $el.css("background-size")
            };
        }
        function destroyDomStructure($node) {
            var $input = $node.find(".tt-input");
            _.each($input.data(attrsKey), function(val, key) {
                _.isUndefined(val) ? $input.removeAttr(key) : $input.attr(key, val);
            });
            $input.detach().removeData(attrsKey).removeClass("tt-input").insertAfter($node);
            $node.remove();
        }
    }();
    (function() {
        
        var old, typeaheadKey, methods;
        old = $.fn.typeahead;
        typeaheadKey = "ttTypeahead";
        methods = {
            initialize: function initialize(o, datasets) {
                datasets = _.isArray(datasets) ? datasets : [].slice.call(arguments, 1);
                o = o || {};
                return this.each(attach);
                function attach() {
                    var $input = $(this), eventBus, typeahead;
                    _.each(datasets, function(d) {
                        d.highlight = !!o.highlight;
                    });
                    typeahead = new Typeahead({
                        input: $input,
                        eventBus: eventBus = new EventBus({
                            el: $input
                        }),
                        withHint: _.isUndefined(o.hint) ? true : !!o.hint,
                        minLength: o.minLength,
                        autoselect: o.autoselect,
                        datasets: datasets
                    });
                    $input.data(typeaheadKey, typeahead);
                }
            },
            open: function open() {
                return this.each(openTypeahead);
                function openTypeahead() {
                    var $input = $(this), typeahead;
                    if (typeahead = $input.data(typeaheadKey)) {
                        typeahead.open();
                    }
                }
            },
            close: function close() {
                return this.each(closeTypeahead);
                function closeTypeahead() {
                    var $input = $(this), typeahead;
                    if (typeahead = $input.data(typeaheadKey)) {
                        typeahead.close();
                    }
                }
            },
            val: function val(newVal) {
                return !arguments.length ? getVal(this.first()) : this.each(setVal);
                function setVal() {
                    var $input = $(this), typeahead;
                    if (typeahead = $input.data(typeaheadKey)) {
                        typeahead.setVal(newVal);
                    }
                }
                function getVal($input) {
                    var typeahead, query;
                    if (typeahead = $input.data(typeaheadKey)) {
                        query = typeahead.getVal();
                    }
                    return query;
                }
            },
            destroy: function destroy() {
                return this.each(unattach);
                function unattach() {
                    var $input = $(this), typeahead;
                    if (typeahead = $input.data(typeaheadKey)) {
                        typeahead.destroy();
                        $input.removeData(typeaheadKey);
                    }
                }
            }
        };
        $.fn.typeahead = function(method) {
            var tts;
            if (methods[method] && method !== "initialize") {
                tts = this.filter(function() {
                    return !!$(this).data(typeaheadKey);
                });
                return methods[method].apply(tts, [].slice.call(arguments, 1));
            } else {
                return methods.initialize.apply(this, arguments);
            }
        };
        $.fn.typeahead.noConflict = function noConflict() {
            $.fn.typeahead = old;
            return this;
        };
    })();
})(window.jQuery); ; 

return jQuery; 

});


//@ sourceURL=/vendor/typeahead.js/typeahead.bundle.js

;
define('modules/search-autocomplete',['shim!vendor/typeahead.js/typeahead.bundle[modules/jquery-mozu=jQuery]>jQuery', 'hyprlive', 'modules/api'], function($, Hypr, api) {

    // bundled typeahead saves a lot of space but exports bloodhound to the root object, let's lose it
    var Bloodhound = window.Bloodhound.noConflict();

    // bloodhound wants to make its own AJAX requests, and since it's got such good caching and tokenizing algorithms, i'm happy to help it
    // so instead of using the SDK to place the request, we just use it to get the URL configs and the required API headers
    var qs = '%QUERY',
        eqs = encodeURIComponent(qs),
        suggestPriorSearchTerms = Hypr.getThemeSetting('suggestPriorSearchTerms'),
        getApiUrl = function(groups) {
            return api.getActionConfig('suggest', 'get', { query: qs, groups: groups }).url;
        },
        termsUrl = getApiUrl('terms'),
        productsUrl = getApiUrl('pages'),
        ajaxConfig = {
            headers: api.getRequestHeaders()
        },
        i,
        nonWordRe = /\W+/,
        makeSuggestionGroupFilter = function(name) {
            return function(res) {
                var suggestionGroups = res.suggestionGroups,
                    thisGroup;
                for (i = suggestionGroups.length - 1; i >= 0; i--) {
                    if (suggestionGroups[i].name === name) {
                        thisGroup = suggestionGroups[i];
                        break;
                    }
                }
                return thisGroup.suggestions;
            };
        },

        makeTemplateFn = function(name) {
            var tpt = Hypr.getTemplate(name);
            return function(obj) {
                return tpt.render(obj);
            };
        },

    // create bloodhound instances for each type of suggestion

    AutocompleteManager = {
        datasets: {
            pages: new Bloodhound({
                datumTokenizer: function(datum) {
                    return datum.suggestion.term.split(nonWordRe);
                },
                queryTokenizer: Bloodhound.tokenizers.whitespace,
                remote: {
                    url: productsUrl,
                    wildcard: eqs,
                    filter: makeSuggestionGroupFilter("Pages"),
                    rateLimitWait: 400,
                    ajax: ajaxConfig
                }
            })
        }
    };

    $.each(AutocompleteManager.datasets, function(name, set) {
        set.initialize();
    });

    var dataSetConfigs = [
        {
            name: 'pages',
            displayKey: function(datum) {
                return datum.suggestion.productCode;
            },
            templates: {
                suggestion: makeTemplateFn('modules/search/autocomplete-page-result')
            },
            source: AutocompleteManager.datasets.pages.ttAdapter()
        }
    ];

    if (suggestPriorSearchTerms) {
        AutocompleteManager.datasets.terms = new Bloodhound({
            datumTokenizer: function(datum) {
                return datum.suggestion.term.split(nonWordRe);
            },
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            remote: {
                url: termsUrl,
                wildcard: eqs,
                filter: makeSuggestionGroupFilter("Terms"),
                rateLimitWait: 100,
                ajax: ajaxConfig
            }
        });
        AutocompleteManager.datasets.terms.initialize();
        dataSetConfigs.push({
            name: 'terms',
            displayKey: function(datum) {
                return datum.suggestion.term;
            },
            source: AutocompleteManager.datasets.terms.ttAdapter()
        });
    }

    $(document).ready(function() {
        var $field = AutocompleteManager.$typeaheadField = $('[data-mz-role="searchquery"]');
        AutocompleteManager.typeaheadInstance = $field.typeahead({
            minLength: 3
        }, dataSetConfigs).data('ttTypeahead');
        // user hits enter key while menu item is selected;
        $field.on('typeahead:selected', function (e, data, set) {
            if (data.suggestion.productCode) window.location = "/p/" + data.suggestion.productCode;
        });
    });

    return AutocompleteManager;
});
/**
 * Abstract dispatcher for routed applications in storefront.
 * Register a callback that will be called with a parsed URL.
 * @method onUrlChange(handler:function(e, uri)) -> undefined
 *         Add a handler to be called when the URL changes.
 */

define('modules/url-dispatcher',['backbone'], function(Backbone) {

    var Dispatcher;
    var proto;

    if (Modernizr.history) {
        Backbone.history.start({ pushState: true });

        proto = Backbone.Router.prototype;

        // using a backbone router ONLY for its event emitter capability
        Dispatcher = new Backbone.Router();

        // register catchall route so it fires event
        Dispatcher.route('*all', 'all', function() { });

        // hiding the implementation of the particular event emitter
        Dispatcher.onChange = function(cb) {
            Dispatcher.on('route:all', function() {
                cb(window.location.pathname + window.location.search + window.location.hash);
            });
        };

        Dispatcher.send = function(url) {
            return proto.navigate.call(this, url, { trigger: true });
        };

        Dispatcher.replace = function(url) {
            return proto.navigate.call(this, url, { replace: true });
        };

    } else {
        // if the browser does not support the HTML5 History API,
        // the dispatcher should simply default to full page navigation.
        Dispatcher = {
            send: function(url) {
                window.location = url;
            },
            replace: function(url) {
                window.location.replace(url);
            },
            onChange: function() { } // let the browser do its thing instead
        };
    }

    

    return Dispatcher;

});
/**
 * A bit like an RxJS observable stream, but using Backbone
 * (a preexisting dependency), aggregates user input into
 * a stream of intents, based on the mapping function
 * that you supply to turn an event into an intent.
 */

define('modules/intent-emitter',['underscore', 'backbone'], function(_, Backbone) {

	return function(element, subscriptions, processor, eventName) {
		var emitter = _.extend({}, Backbone.Events);
		var handler = function(e) {
			emitter.trigger(eventName || 'data', processor.apply(this, arguments), e);
		};
		var View = Backbone.View.extend({
			events: _.reduce(subscriptions, function(memo, subscription) {
				memo[subscription] = handler;
				return memo;
			}, {})
		});
		var view = new View({
			el: element
		});
		emitter.view = view;
		return emitter;
	};

});
/**
 * What if I told you that server-side Hypr can be client-side Hypr.
 * Only depends on jquery for AJAX, so that can be subbed in later
 * with something smaller.
 * Only depends on modules/api to turn jQuery deferred promises into
 * actually composable promises.
 * Only depends on modules/api to get access to compliant promises.
 * Later when we shim ES6/promise that can also go away.
 */

define('modules/get-partial-view',['modules/jquery-mozu', 'modules/api'], function($, api) {

    function setPartialTrue(url) {
        return url + (url.indexOf('?') === -1 ? "?" : "&") + "_partial=true";
    }

    function removePartialParam(url) {
        return url.replace(/[&\?]_partial=true/g, '');
    }

    return function getPartialView(url, partialTemplate) {

        var deferred = api.defer();

        function handleSuccess(body, __, res) {
            var canonical = res.getResponseHeader('x-vol-canonical-url');
            if (canonical) {
                canonical = removePartialParam(canonical);
            }
            deferred.resolve({
                canonicalUrl: canonical,
                body: body
            });
        }

        function handleError(error) {
            deferred.reject(error);
        }

        $.ajax({
            method: 'GET',
            url: setPartialTrue(removePartialParam(url)),
            dataType: 'html',
            headers: {
                'x-vol-alternative-view': partialTemplate
            }
        }).then(handleSuccess, handleError);

        return deferred.promise;

    };

});
/**
 * Unidirectional dispatch-driven collection views, for your pleasure.
 */


define('modules/views-collections',[
    'backbone',
    'underscore',
    'modules/url-dispatcher',
    'modules/intent-emitter',
    'modules/get-partial-view'
], function(Backbone, _, UrlDispatcher, IntentEmitter, getPartialView) {

    function factory(conf) {

        var _$body = conf.$body;
        var _dispatcher = UrlDispatcher;
        var ROUTE_NOT_FOUND = 'ROUTE_NOT_FOUND';

        function updateUi(response) {
            var url = response.canonicalUrl;
            _$body.html(response.body);
            if (url) _dispatcher.replace(url);
            _$body.removeClass('mz-loading');
        }

        function showError(error) {
            // if (error.message === ROUTE_NOT_FOUND) {
            //     window.location.href = url;
            // }
            _$body.find('[data-mz-messages]').text(error.message);
        }

        function intentToUrl(e) {
            var elm = e.target;
            var url;
            if (elm.tagName.toLowerCase() === "select") {
                elm = elm.options[elm.selectedIndex];
            }
            url = elm.getAttribute('data-mz-url') || elm.getAttribute('href') || '';
            if (url && url[0] != "/") {
                var parser = document.createElement('a');
                parser.href = url;
                url = parser.pathname + parser.search;
            }
            return url;
        }

        var navigationIntents = IntentEmitter(
            _$body,
            [
                'click [data-mz-pagingcontrols] a',
                'click [data-mz-pagenumbers] a',
                'click a[data-mz-facet-value]',
                'click [data-mz-action="clearFacets"]',
                'change input[data-mz-facet-value]',
                'change [data-mz-value="pageSize"]',
                'change [data-mz-value="sortBy"]'
            ],
            intentToUrl
        );

        navigationIntents.on('data', function(url, e) {
            if (_dispatcher.send(url)) {
                _$body.addClass('mz-loading');
                e.preventDefault();
            }
        });

        _dispatcher.onChange(function(url) {
            getPartialView(url, conf.template).then(updateUi, showError);
        });

    }

    return {
        createFacetedCollectionViews: factory
    };

});
/**
 * Can be used on any Backbone.MozuModel that has had the paging mixin in mixins-paging added to it.
 */
define('modules/views-paging',['modules/jquery-mozu', 'underscore', 'modules/backbone-mozu'], function($, _, Backbone) {

    var PagingBaseView = Backbone.MozuView.extend({
        initialize: function() {
            var me = this;
            if (!this.model._isPaged) {
                throw "Cannot bind a Paging view to a model that does not have the Paging mixin!";
            }

            //handle browser's back button to make sure startIndex is updated.
            Backbone.history.on('route', function () {
                me.model.syncIndex(Backbone.history.fragment);
            });
        },
        render: function() {
            Backbone.MozuView.prototype.render.apply(this, arguments);
            this.$('select').each(function() {
                var $this = $(this);
                $this.val($this.find('option[selected]').val());
            });
        }
    });

    var PagingControlsView = PagingBaseView.extend({
        templateName: 'modules/common/paging-controls',
        autoUpdate: ['pageSize'],
        updatePageSize: function(e) {
            var newSize = parseInt($(e.currentTarget).val(), 10),
            currentSize = this.model.get('pageSize');
            if (isNaN(newSize)) throw new SyntaxError("Cannot set page size to a non-number!");
            if (newSize !== currentSize) {
                this.model.set('pageSize', newSize);
                this.model.set("startIndex", 0);
            }
        }
    });

    var PageNumbersView = PagingBaseView.extend({
        templateName: 'modules/common/page-numbers',
        previous: function(e) {
            e.preventDefault();
            return this.model.previousPage();
        },
        next: function(e) {
            e.preventDefault();
            return this.model.nextPage();
        },
        page: function(e) {
            e.preventDefault();
            return this.model.setPage(parseInt($(e.currentTarget).data('mz-page-num'), 10) || 1);
        }
    });

    var scrollToTop = function() {
        $('body').ScrollTo({ duration: 200 });
    };

    var TopScrollingPageNumbersView = PageNumbersView.extend({
        previous: function() {
            return PageNumbersView.prototype.previous.apply(this, arguments).then(scrollToTop);
        },
        next: function() {
            return PageNumbersView.prototype.next.apply(this, arguments).then(scrollToTop);
        },
        page: function() {
            return PageNumbersView.prototype.page.apply(this, arguments).then(scrollToTop);
        }
    });

    var PageSortView = PagingBaseView.extend({
        templateName: 'modules/common/page-sort',
        updateSortBy: function(e) {
            return this.model.sortBy($(e.currentTarget).val());
        }
    });

    return {
        PagingControls: PagingControlsView,
        PageNumbers: PageNumbersView,
        TopScrollingPageNumbers: TopScrollingPageNumbersView,
        PageSortView: PageSortView
    };

});
define('modules/views-productlists',['modules/jquery-mozu', 'underscore', 'modules/backbone-mozu', 'hyprlive'], function ($, _, Backbone, Hypr) {
    
    var ProductListView = Backbone.MozuView.extend({
            templateName: 'modules/product/product-list-tiled'
        }),

    FacetingPanel = Backbone.MozuView.extend({
        additionalEvents: {
            "change [data-mz-facet-value]": "setFacetValue",
            "click [data-mz-facet-link]": "handleFacetLink"
        },
        templateName: "modules/product/faceting-form",
        initialize: function () {
            this.listenTo(this.model, 'loadingchange', function (isLoading) {
                this.$el.find('input').prop('disabled', isLoading);
            });
        },
        clearFacets: function () {
            this.model.clearAllFacets();
        },
        clearFacet: function (e) {
            this.model.get("facets").findWhere({ field: $(e.currentTarget).data('mz-facet') }).empty();
        },
        drillDown: function(e) {
            var $target = $(e.currentTarget),
                id = $target.data('mz-hierarchy-id'),
                field = $target.data('mz-facet');
            this.model.setHierarchy(field, id);
            this.model.updateFacets({ force: true, resetIndex: true });
            e.preventDefault();
        },
        setFacetValue: function (e) {
            var $box = $(e.currentTarget);
            this.model.setFacetValue($box.data('mz-facet'), $box.data('mz-facet-value'), $box.is(':checked'));
        },
        handleFacetLink: function (e) {
            e.stopImmediatePropagation();
        }
    });



    return {
        List: ProductListView,
        FacetingPanel: FacetingPanel
    };
});