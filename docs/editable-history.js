(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('mobx')) :
	typeof define === 'function' && define.amd ? define(['exports', 'mobx'], factory) :
	(global = global || self, factory(global.EditableHistory = {}, global.mobx));
}(this, function (exports, mobx) { 'use strict';

	mobx = mobx && mobx.hasOwnProperty('default') ? mobx['default'] : mobx;

	function unwrapExports (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var PathUtils = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	/**
	 * copy from https://github.com/ReactTraining/history
	 */
	function addLeadingSlash(path) {
	    return path.charAt(0) === '/' ? path : '/' + path;
	}
	exports.addLeadingSlash = addLeadingSlash;
	function stripLeadingSlash(path) {
	    return path.charAt(0) === '/' ? path.substr(1) : path;
	}
	exports.stripLeadingSlash = stripLeadingSlash;
	function hasBasename(path, prefix) {
	    return (path.toLowerCase().indexOf(prefix.toLowerCase()) === 0 &&
	        '/?#'.indexOf(path.charAt(prefix.length)) !== -1);
	}
	exports.hasBasename = hasBasename;
	function stripBasename(path, prefix) {
	    return hasBasename(path, prefix) ? path.substr(prefix.length) : path;
	}
	exports.stripBasename = stripBasename;
	function stripTrailingSlash(path) {
	    return path.charAt(path.length - 1) === '/' ? path.slice(0, -1) : path;
	}
	exports.stripTrailingSlash = stripTrailingSlash;
	function parsePath(path) {
	    let pathname = path || '/';
	    let search = '';
	    let hash = '';
	    const hashIndex = pathname.indexOf('#');
	    if (hashIndex !== -1) {
	        hash = pathname.substr(hashIndex);
	        pathname = pathname.substr(0, hashIndex);
	    }
	    const searchIndex = pathname.indexOf('?');
	    if (searchIndex !== -1) {
	        search = pathname.substr(searchIndex);
	        pathname = pathname.substr(0, searchIndex);
	    }
	    return {
	        pathname,
	        search: search === '?' ? '' : search,
	        hash: hash === '#' ? '' : hash
	    };
	}
	exports.parsePath = parsePath;
	function createPath(location) {
	    const { pathname, search, hash } = location;
	    let path = pathname || '/';
	    if (search && search !== '?')
	        path += search.charAt(0) === '?' ? search : `?${search}`;
	    if (hash && hash !== '#')
	        path += hash.charAt(0) === '#' ? hash : `#${hash}`;
	    return path;
	}
	exports.createPath = createPath;

	});

	unwrapExports(PathUtils);
	var PathUtils_1 = PathUtils.addLeadingSlash;
	var PathUtils_2 = PathUtils.stripLeadingSlash;
	var PathUtils_3 = PathUtils.hasBasename;
	var PathUtils_4 = PathUtils.stripBasename;
	var PathUtils_5 = PathUtils.stripTrailingSlash;
	var PathUtils_6 = PathUtils.parsePath;
	var PathUtils_7 = PathUtils.createPath;

	var utils = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });

	function isEditableHistoryState(state = {}) {
	    state = state || {};
	    return state.hasOwnProperty('eh_ck') && state.hasOwnProperty('eh_sl');
	}
	exports.isEditableHistoryState = isEditableHistoryState;
	function isKey(input) {
	    return typeof input === 'string';
	}
	exports.isKey = isKey;
	function isIndex(input) {
	    return typeof input === 'number';
	}
	exports.isIndex = isIndex;
	function getLocation(path, basename) {
	    if (path) {
	        path = PathUtils.stripTrailingSlash(PathUtils.addLeadingSlash(path));
	        if (basename) {
	            path = PathUtils.stripBasename(path, basename);
	        }
	        return PathUtils.parsePath(path);
	    }
	    else {
	        return {
	            pathname: '/',
	            hash: '',
	            search: ''
	        };
	    }
	}
	exports.getLocation = getLocation;
	function getHashPath(url) {
	    const href = url || window.location.href;
	    const hashIndex = href.indexOf('#');
	    return hashIndex === -1 ? '' : href.substring(hashIndex + 1);
	}
	exports.getHashPath = getHashPath;
	function getAbsolutePath(url, useHash, basename) {
	    url = url || '';
	    if (useHash) {
	        url = window.location.pathname + '#' + basename + PathUtils.stripTrailingSlash(PathUtils.addLeadingSlash(url));
	    }
	    else {
	        url = basename + PathUtils.stripTrailingSlash(PathUtils.addLeadingSlash(url));
	    }
	    return url;
	}
	exports.getAbsolutePath = getAbsolutePath;
	function createHistoryKey() {
	    return Math.random()
	        .toString(36)
	        .substr(2, 8);
	}
	exports.createHistoryKey = createHistoryKey;

	});

	unwrapExports(utils);
	var utils_1 = utils.isEditableHistoryState;
	var utils_2 = utils.isKey;
	var utils_3 = utils.isIndex;
	var utils_4 = utils.getLocation;
	var utils_5 = utils.getHashPath;
	var utils_6 = utils.getAbsolutePath;
	var utils_7 = utils.createHistoryKey;

	var HistoryEditor_1 = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });

	const utils_2 = utils;


	const PopStateEvent = 'popstate';
	const rawHistory = window.history;
	class HistoryEditor {
	    constructor({ basename = '', initState = null, useHash = false }) {
	        this.basename = '';
	        this.useHash = false;
	        this.indexOf = (keyOrIndex) => {
	            if (utils_2.isKey(keyOrIndex)) {
	                return this.historyState.eh_sl.findIndex(stateObject => {
	                    return stateObject.k === keyOrIndex;
	                });
	            }
	            else if (utils_2.isIndex(keyOrIndex)) {
	                if (this.historyState.eh_sl[keyOrIndex]) {
	                    return keyOrIndex;
	                }
	                else {
	                    return -1;
	                }
	            }
	            else {
	                return -1;
	            }
	        };
	        this.indexOfActive = () => {
	            return this.historyState.eh_sl.findIndex(stateObject => {
	                return stateObject.k === this.historyState.eh_ck;
	            });
	        };
	        this.cutHitoryList = (topKey) => {
	            const topIndex = this.historyState.eh_sl.findIndex(s => {
	                return s.k === topKey;
	            });
	            if (topIndex > -1) {
	                this.historyState.eh_sl.splice(topIndex + 1, this.historyState.eh_sl.length - topIndex - 1);
	            }
	        };
	        this.isBack = (key) => {
	            return this.historyList.eh_sl.some(s => {
	                return s.k === key;
	            });
	        };
	        this.handlerRawHistoryState = (ev) => {
	            const { eh_ck = undefined, eh_sl = undefined } = ev.state || {};
	            if (this.predictionAction && this.predictionAction.key === eh_ck) {
	                const cb = this.predictionAction.cb;
	                this.predictionAction = undefined;
	                this.historyState.eh_ck = eh_ck;
	                this.cutHitoryList(eh_ck);
	                rawHistory.replaceState(mobx.toJS(this.historyState), '');
	                if (typeof cb === 'function') {
	                    cb();
	                }
	            }
	            else {
	                if (utils.isEditableHistoryState(ev.state)) {
	                    if (this.isBack(eh_ck)) {
	                        this.cutHitoryList(eh_ck);
	                    }
	                    else {
	                        for (let index = this.historyState.eh_sl.length; index < eh_sl.length; index++) {
	                            this.historyState.eh_sl.push(eh_sl[index]);
	                        }
	                    }
	                    this.historyState.eh_ck = eh_ck;
	                    rawHistory.replaceState(mobx.toJS(this.historyState), '');
	                }
	                else {
	                    const newHistoryKey = utils.createHistoryKey();
	                    this.historyState.eh_sl.splice(this.indexOfActive() + 1, this.historyState.eh_sl.length - this.indexOfActive() - 1);
	                    this.historyState.eh_sl.push({
	                        k: newHistoryKey,
	                        s: null,
	                        l: this.useHash ? utils_2.getHashPath() : window.location.pathname
	                    });
	                    this.historyState.eh_ck = newHistoryKey;
	                    rawHistory.replaceState(mobx.toJS(this.historyState), '');
	                }
	            }
	        };
	        this.stepProcessor = (targetIndex, cb) => {
	            targetIndex = this.indexOf(targetIndex);
	            const activeIndex = this.indexOfActive();
	            if (targetIndex > -1 && targetIndex < activeIndex) {
	                const predictionKey = this.historyState.eh_sl[targetIndex].k;
	                this.predictionAction = {
	                    key: predictionKey,
	                    cb
	                };
	                rawHistory.go(targetIndex - activeIndex);
	            }
	            else {
	                if (typeof cb === 'function') {
	                    cb();
	                }
	            }
	        };
	        this.push = (params = {}) => {
	            const { state, url, keyOrIndex = this.indexOfActive() } = params;
	            let targetIndex = this.indexOf(keyOrIndex);
	            if (targetIndex < 0) {
	                console.warn(`[push]: \`keyOrIndex\`=${keyOrIndex} is out of range'`);
	                return;
	            }
	            const historyKey = utils.createHistoryKey();
	            const absoluteUrl = utils_2.getAbsolutePath(url, this.useHash, this.basename);
	            this.stepProcessor(targetIndex, () => {
	                this.historyState.eh_sl.splice(targetIndex + 1, this.historyState.eh_sl.length - targetIndex - 1);
	                this.historyState.eh_sl.push({
	                    k: historyKey,
	                    s: state,
	                    l: this.useHash ? utils_2.getHashPath(absoluteUrl) : absoluteUrl
	                });
	                this.historyState.eh_ck = historyKey;
	                rawHistory.pushState(mobx.toJS(this.historyState), '', absoluteUrl || '/');
	            });
	            return historyKey;
	        };
	        this.replace = (params) => {
	            const { state, url, keyOrIndex = this.indexOfActive() } = params;
	            let targetIndex = this.indexOf(keyOrIndex);
	            if (targetIndex < 0 || targetIndex > this.indexOfActive()) {
	                console.warn(`[replace]: \`keyOrIndex\`=${keyOrIndex} is out of range'`);
	                return;
	            }
	            const historyKey = utils.createHistoryKey();
	            const absoluteUrl = utils_2.getAbsolutePath(url, this.useHash, this.basename);
	            this.stepProcessor(targetIndex, () => {
	                this.historyState.eh_sl.forEach((stateObject, index) => {
	                    if (index === targetIndex) {
	                        stateObject.k = historyKey;
	                        stateObject.l = this.useHash ? utils_2.getHashPath(absoluteUrl) : absoluteUrl;
	                        stateObject.s = state;
	                    }
	                });
	                this.historyState.eh_ck = historyKey;
	                rawHistory.replaceState(mobx.toJS(this.historyState), '', absoluteUrl || '/');
	            });
	            return historyKey;
	        };
	        this.active = (keyOrIndex) => {
	            const targetIndex = this.indexOf(keyOrIndex);
	            if (targetIndex < 0 || targetIndex > this.indexOfActive()) {
	                console.warn(`[active]: \`keyOrIndex\`=${keyOrIndex} is out of range'`);
	                return;
	            }
	            this.stepProcessor(targetIndex);
	        };
	        this.basename = basename ? PathUtils.stripTrailingSlash(PathUtils.addLeadingSlash(basename)) : '';
	        this.useHash = useHash;
	        window.addEventListener(PopStateEvent, this.handlerRawHistoryState);
	        if (utils.isEditableHistoryState(rawHistory.state)) {
	            this.historyState = mobx.observable(rawHistory.state);
	        }
	        else {
	            const historyKey = utils.createHistoryKey();
	            const newHistoryState = {
	                eh_ck: historyKey,
	                eh_sl: [
	                    {
	                        k: historyKey,
	                        s: initState,
	                        l: this.useHash ? utils_2.getHashPath() : window.location.pathname
	                    }
	                ]
	            };
	            this.historyState = mobx.observable(newHistoryState);
	            rawHistory.replaceState(mobx.toJS(this.historyState), '');
	        }
	    }
	    get historyList() {
	        return this.historyState;
	    }
	}
	exports.HistoryEditor = HistoryEditor;

	});

	unwrapExports(HistoryEditor_1);
	var HistoryEditor_2 = HistoryEditor_1.HistoryEditor;

	var createEditableHistory_1 = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });

	let hasCreated = false;
	function createEditableHistory(props = {}) {
	    const { basename = '', useHash = false } = props;
	    if (hasCreated) {
	        console.warn('A window supports only one editableHistory at a time');
	        return;
	    }
	    hasCreated = true;
	    const historyEditor = new HistoryEditor_1.HistoryEditor({
	        basename,
	        useHash
	    });
	    return {
	        push: historyEditor.push,
	        replace: historyEditor.replace,
	        active: historyEditor.active,
	        historyList: historyEditor.historyList,
	        length: historyEditor.historyList.eh_sl.length
	    };
	}
	exports.default = createEditableHistory;

	});

	unwrapExports(createEditableHistory_1);

	var commonjs = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });

	exports.createEditableHistory = createEditableHistory_1.default;

	});

	var index = unwrapExports(commonjs);
	var commonjs_1 = commonjs.createEditableHistory;

	exports.createEditableHistory = commonjs_1;
	exports.default = index;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
