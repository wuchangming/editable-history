(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('mobx')) :
	typeof define === 'function' && define.amd ? define(['exports', 'mobx'], factory) :
	(global = global || self, factory(global.EditableHistory = {}, global.mobx));
}(this, function (exports, mobx) { 'use strict';

	mobx = mobx && mobx.hasOwnProperty('default') ? mobx['default'] : mobx;

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function unwrapExports (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var createHistoryKey_1 = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	let keyLength = 8;
	function createHistoryKey() {
	    return Math.random()
	        .toString(36)
	        .substr(2, keyLength);
	}
	exports.default = createHistoryKey;

	});

	unwrapExports(createHistoryKey_1);

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
	function getHashPath() {
	    const href = window.location.href;
	    const hashIndex = href.indexOf('#');
	    return hashIndex === -1 ? '' : href.substring(hashIndex + 1);
	}
	exports.getHashPath = getHashPath;
	function getAbsolutePath(url, useHash, basename) {
	    if (url) {
	        if (useHash) {
	            url =
	                window.location.pathname + '#' + basename + PathUtils.stripTrailingSlash(PathUtils.addLeadingSlash(url));
	        }
	        else {
	            url = basename + PathUtils.stripTrailingSlash(PathUtils.addLeadingSlash(url));
	        }
	    }
	    return url;
	}
	exports.getAbsolutePath = getAbsolutePath;

	});

	unwrapExports(utils);
	var utils_1 = utils.isKey;
	var utils_2 = utils.isIndex;
	var utils_3 = utils.getLocation;
	var utils_4 = utils.getHashPath;
	var utils_5 = utils.getAbsolutePath;

	var HistoryEditor_1 = createCommonjsModule(function (module, exports) {
	var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	const createHistoryKey_1$1 = __importDefault(createHistoryKey_1);



	const PopStateEvent = 'popstate';
	const rawHistory = window.history;
	class HistoryEditor {
	    constructor({ basename = '', initState, useHash = false }) {
	        this.rawHistoryList = [];
	        this.basename = '';
	        this.useHash = false;
	        this.indexOf = (keyOrIndex) => {
	            if (utils.isKey(keyOrIndex)) {
	                return this.rawHistoryList.findIndex(historyObject => {
	                    return historyObject.historyKey === keyOrIndex;
	                });
	            }
	            else if (utils.isIndex(keyOrIndex)) {
	                if (this.rawHistoryList[keyOrIndex]) {
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
	            return this.historyList.findIndex(history => {
	                return history.isActive;
	            });
	        };
	        this.handlerRawHistoryState = (ev) => {
	            const { historyKey = undefined, state = undefined } = ev.state || {};
	            if (this.predictionAction && this.predictionAction.key === historyKey) {
	                const cb = this.predictionAction.cb;
	                this.predictionAction = undefined;
	                if (typeof cb === 'function') {
	                    cb();
	                }
	            }
	            else {
	                if (utils.isKey(historyKey)) {
	                    if (this.indexOf(historyKey) > -1) {
	                        this.rawHistoryList.forEach(historyObject => {
	                            if (historyObject.historyKey === historyKey) {
	                                historyObject.isActive = true;
	                            }
	                            else {
	                                historyObject.isActive = false;
	                            }
	                        });
	                    }
	                    else {
	                        this.rawHistoryList.forEach(historyObject => {
	                            historyObject.isActive = false;
	                        });
	                        this.rawHistoryList.push({
	                            historyKey,
	                            state,
	                            isActive: true,
	                            location: utils.getLocation(this.useHash ? utils.getHashPath() : window.location.pathname, this.basename)
	                        });
	                    }
	                }
	                else {
	                    const newHistoryKey = createHistoryKey_1$1.default();
	                    rawHistory.replaceState({
	                        historyKey: newHistoryKey
	                    }, '');
	                    this.rawHistoryList.splice(this.indexOfActive() + 1, this.rawHistoryList.length - this.indexOfActive());
	                    this.rawHistoryList.forEach(historyObject => {
	                        historyObject.isActive = false;
	                    });
	                    this.rawHistoryList.push({
	                        historyKey: newHistoryKey,
	                        state: undefined,
	                        isActive: true,
	                        location: utils.getLocation(this.useHash ? utils.getHashPath() : window.location.pathname, this.basename)
	                    });
	                }
	            }
	        };
	        this.stepProcessor = (targetIndex, cb) => {
	            targetIndex = this.indexOf(targetIndex);
	            const activeIndex = this.indexOfActive();
	            if (targetIndex !== activeIndex && targetIndex > -1) {
	                const predictionKey = this.historyList[targetIndex].historyKey;
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
	            const historyKey = createHistoryKey_1$1.default();
	            const absoluteUrl = utils.getAbsolutePath(url, this.useHash, this.basename);
	            this.stepProcessor(targetIndex, () => {
	                rawHistory.pushState({
	                    historyKey,
	                    state
	                }, '', absoluteUrl);
	                this.rawHistoryList.splice(targetIndex + 1, this.rawHistoryList.length - targetIndex);
	                this.rawHistoryList.forEach(historyObject => {
	                    historyObject.isActive = false;
	                });
	                this.rawHistoryList.push({
	                    isActive: true,
	                    historyKey,
	                    state,
	                    location: url
	                        ? utils.getLocation(url || '', '')
	                        : this.rawHistoryList[this.rawHistoryList.length - 1]
	                });
	            });
	            return historyKey;
	        };
	        this.replace = (params) => {
	            const { state, url, keyOrIndex = this.indexOfActive() } = params;
	            let targetIndex = this.indexOf(keyOrIndex);
	            if (targetIndex < 0) {
	                console.warn(`[replace]: \`keyOrIndex\`=${keyOrIndex} is out of range'`);
	                return;
	            }
	            const historyKey = createHistoryKey_1$1.default();
	            const absoluteUrl = utils.getAbsolutePath(url, this.useHash, this.basename);
	            this.stepProcessor(targetIndex, () => {
	                rawHistory.replaceState({
	                    historyKey,
	                    state
	                }, '', absoluteUrl);
	                this.rawHistoryList.forEach((historyObject, index) => {
	                    if (index === targetIndex) {
	                        historyObject.historyKey = historyKey;
	                        historyObject.isActive = true;
	                        historyObject.location = url
	                            ? utils.getLocation(url || '', '')
	                            : historyObject.location;
	                        historyObject.state = state;
	                    }
	                });
	            });
	        };
	        this.active = (keyOrIndex) => {
	            const targetIndex = this.indexOf(keyOrIndex);
	            if (targetIndex < 0) {
	                console.warn(`[active]: \`keyOrIndex\`=${keyOrIndex} is out of range'`);
	                return;
	            }
	            this.stepProcessor(targetIndex, () => {
	                this.rawHistoryList.forEach((historyObject, index) => {
	                    if (index === targetIndex) {
	                        historyObject.isActive = true;
	                    }
	                    else {
	                        historyObject.isActive = false;
	                    }
	                });
	            });
	        };
	        this.basename = basename ? PathUtils.stripTrailingSlash(PathUtils.addLeadingSlash(basename)) : '';
	        this.useHash = useHash;
	        this.rawHistoryList = mobx.observable(this.rawHistoryList);
	        window.addEventListener(PopStateEvent, this.handlerRawHistoryState);
	        const { historyKey = undefined, state = undefined } = rawHistory.state || {};
	        if (utils.isKey(historyKey)) {
	            this.rawHistoryList.push({
	                historyKey,
	                state,
	                isActive: true,
	                location: utils.getLocation(this.useHash ? utils.getHashPath() : window.location.pathname, this.basename)
	            });
	        }
	        else {
	            const historyKey = createHistoryKey_1$1.default();
	            rawHistory.replaceState({
	                historyKey,
	                state: initState
	            }, '');
	            this.rawHistoryList.push({
	                historyKey,
	                state: initState,
	                isActive: true,
	                location: utils.getLocation(this.useHash ? utils.getHashPath() : window.location.pathname, this.basename)
	            });
	        }
	    }
	    get historyList() {
	        return this.rawHistoryList;
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
	        length: historyEditor.historyList.length
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
