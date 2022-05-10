var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
var puppeteer = require('puppeteer');
var loadCsv = require('./loadCSV');
var logger = require('./logger');
var url = "https://examsnet.com/test/physical-world-and-measurements/";
var initBrowser = function () { return __awaiter(_this, void 0, void 0, function () {
    var browser, page;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, puppeteer.launch({
                    headless: false,
                    devtools: true,
                    args: ["--window-size=1920,1080"],
                    defaultViewport: {
                        width: 1920,
                        height: 1080
                    }
                })];
            case 1:
                browser = _a.sent();
                return [4 /*yield*/, browser.newPage()];
            case 2:
                page = _a.sent();
                return [2 /*return*/, { browser: browser, page: page }];
        }
    });
}); };
var processEachPage = function () {
};
var extractFolderNameFromUrl = function (url) {
};
(function () { return __awaiter(_this, void 0, void 0, function () {
    var urls, _a, browser, page, getQuestionCount, totalQuestions, i, cropQuestion, cropAnswers;
    var _this = this;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, loadCsv()];
            case 1:
                urls = _b.sent();
                return [4 /*yield*/, initBrowser()];
            case 2:
                _a = _b.sent(), browser = _a.browser, page = _a.page;
                return [4 /*yield*/, page.setViewport({ height: 1080, width: 1920 })];
            case 3:
                _b.sent();
                return [4 /*yield*/, page.goto(url)];
            case 4:
                _b.sent();
                getQuestionCount = function () { return __awaiter(_this, void 0, void 0, function () {
                    var innerText, count;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, page.$eval("#question", function (el) { return el.lastElementChild.lastElementChild.innerHTML; })];
                            case 1:
                                innerText = _a.sent();
                                count = Number.parseInt(innerText.split(":")[1]);
                                return [2 /*return*/, count];
                        }
                    });
                }); };
                return [4 /*yield*/, getQuestionCount()];
            case 5:
                totalQuestions = _b.sent();
                // logger.info(`Total Questions: ${totalQuestions}`);
                console.log("Total Questions: ".concat(totalQuestions));
                for (i = 0; i < totalQuestions; i++) {
                }
                cropQuestion = function () { return __awaiter(_this, void 0, void 0, function () {
                    var questionDiv;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, page.$("#imagewrap")];
                            case 1:
                                questionDiv = _a.sent();
                                return [4 /*yield*/, questionDiv.screenshot({ path: './images/test-question.png' })];
                            case 2:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); };
                cropAnswers = function () { return __awaiter(_this, void 0, void 0, function () {
                    var answers;
                    var _this = this;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, page.$$("#answers > .list-group-item")];
                            case 1:
                                answers = _a.sent();
                                answers.forEach(function (x, i) { return __awaiter(_this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, page.waitForTimeout(1000)];
                                            case 1:
                                                _a.sent();
                                                return [4 /*yield*/, x.screenshot({ path: "./images/".concat(i + 1, ".png") })];
                                            case 2:
                                                _a.sent();
                                                return [2 /*return*/];
                                        }
                                    });
                                }); });
                                return [2 /*return*/];
                        }
                    });
                }); };
                return [2 /*return*/];
        }
    });
}); })();
