"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Alexa = __importStar(require("ask-sdk-core"));
var ask_sdk_express_adapter_1 = require("ask-sdk-express-adapter");
var express_1 = __importDefault(require("express"));
//////////////////////////////// Const ////////////////////////////////
// サーバー情報
var PORT = 3000;
var ENDPOINT = "/";
// 固定メッセージ
var LAUNCH_MESSAGE = "いくつのサイコロを投げますか?";
var ERROR_MESSAGE = "ごめん、よくわかんなかった。";
//////////////////////////////// Logic ////////////////////////////////
/**
 * 結果メッセージ取得
 */
var getThrowResultMessage = function (diceCount) {
    var throwResult = throwDice(diceCount);
    var message = resultText(throwResult);
    return message;
};
/**
 * サイコロの結果を返す
 */
var throwDice = function (diceCount) {
    var results = [];
    var midText = "";
    var sum = 0;
    console.log("throw " + diceCount + " times");
    for (var i = 0; i < diceCount; i++) {
        var rand = Math.floor(Math.random() * 6) + 1;
        console.log(i + 1 + " time: " + rand);
        results.push(rand);
        sum += rand;
        midText += rand + ", ";
    }
    midText = midText.replace(/, $/, "");
    return { midText: midText, sum: sum, diceCount: diceCount };
};
/**
 * サイコロの結果を元にメッセージ分岐
 */
var resultText = function (throwResult) {
    if (throwResult.diceCount === 1)
        return "\u7D50\u679C\u306F " + throwResult.sum + " \u3067\u3059\u3002";
    if (throwResult.diceCount < 4)
        return "\u7D50\u679C\u306F " + throwResult.midText + " \u3067\u3001\u5408\u8A08 " + throwResult.sum + " \u3067\u3059\u3002";
    return throwResult.diceCount + "\u500B\u306E\u30B5\u30A4\u30B3\u30ED\u306E\u5408\u8A08\u306F " + throwResult.sum + " \u3067\u3059\u3002";
};
//////////////////////////////// Handler ////////////////////////////////
/**
 * 起動処理
 */
var launchHandler = {
    canHandle: function (handlerInput) {
        handlerInput.requestEnvelope.request.type === "IntentRequest" &&
            handlerInput.requestEnvelope.request.intent;
        var request = handlerInput.requestEnvelope.request;
        return request.type === "LaunchRequest";
    },
    handle: function (handlerInput) {
        return handlerInput.responseBuilder
            .speak(LAUNCH_MESSAGE)
            .reprompt(LAUNCH_MESSAGE)
            .getResponse();
    }
};
/**
 * サイコロを振る処理
 */
var throwDiceHandler = {
    canHandle: function (handlerInput) {
        var request = handlerInput.requestEnvelope.request;
        return (request.type === "IntentRequest" &&
            request.intent.name === "ThrowDiceIntent");
    },
    handle: function (handlerInput) {
        // サイコロの個数をnumberスロットから取得
        var diceCount = (Alexa.getSlotValue(handlerInput.requestEnvelope, "number") || 1);
        // サイコロの個数分サイコロを振った結果の文言を取得
        var throwResultMessage = getThrowResultMessage(diceCount);
        // 結果の発話フレーズ
        var speech = "\u30B5\u30A4\u30B3\u30ED\u3092" + diceCount + "\u500B\u6295\u3052\u307E\u3059\u3002\u30B3\u30ED\u30B3\u30ED\u30B3\u30ED\u3001\u3001\u3001" + throwResultMessage;
        return handlerInput.responseBuilder.speak(speech).getResponse();
    }
};
/**
 * 終了処理
 */
var sessionEndedHandler = {
    canHandle: function (handlerInput) {
        var request = handlerInput.requestEnvelope.request;
        return request.type === "SessionEndedRequest";
    },
    handle: function (handlerInput) {
        return handlerInput.responseBuilder.getResponse();
    }
};
/**
 * エラー処理
 */
var errorHandler = {
    canHandle: function (handlerInput) {
        return true;
    },
    handle: function (handlerInput) {
        return handlerInput.responseBuilder
            .speak(ERROR_MESSAGE)
            .reprompt(ERROR_MESSAGE)
            .getResponse();
    }
};
/**
 * ハンドラー生成
 */
var skill = Alexa.SkillBuilders.custom()
    .addRequestHandlers(launchHandler, throwDiceHandler, sessionEndedHandler)
    .addErrorHandlers(errorHandler)
    .create();
//////////////////////////////// App ////////////////////////////////
var adapter = new ask_sdk_express_adapter_1.ExpressAdapter(skill, false, false);
express_1.default()
    .post(ENDPOINT, adapter.getRequestHandlers())
    .listen(PORT);
console.log("start!");
//# sourceMappingURL=index.js.map