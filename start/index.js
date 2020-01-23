const Alexa = require("ask-sdk-core")
const Model = require("ask-sdk-model")
const { ExpressAdapter } = require("ask-sdk-express-adapter")
const express = require("express")



//////////////////////////////// Const ////////////////////////////////

// サーバー情報
const PORT = 3000
const ENDPOINT = "/"

// 固定メッセージ
const LAUNCH_MESSAGE = "いくつのサイコロを投げますか?"
const ERROR_MESSAGE = "ごめん、よくわかんなかった。"



//////////////////////////////// Logic ////////////////////////////////

/**
 * 結果メッセージ取得
 */
const getThrowResultMessage = (diceCount) => {
	const throwResult = throwDice(diceCount)
	const message = resultText(throwResult)
	return message
}

/**
 * サイコロの結果を返す
 */
const throwDice = (diceCount) => {
	const results = []
	let midText = ""
	let sum = 0
	console.log(`throw ${diceCount} times`)
	
	for (let i = 0; i < diceCount; i++) {
		const rand = Math.floor(Math.random() * 6) + 1
		console.log(`${i + 1} time: ${rand}`)
		
		results.push(rand)
		sum += rand
		midText += `${rand}, `
	}
	
	midText = midText.replace(/, $/, "")
	return { midText, sum, diceCount }
}

/**
 * サイコロの結果を元にメッセージ分岐
 */
const resultText = (throwResult) => {
	if (throwResult.diceCount === 1) return `結果は ${throwResult.sum} です。`
	if (throwResult.diceCount < 4) return `結果は ${throwResult.midText} で、合計 ${throwResult.sum} です。`
	return `${throwResult.diceCount}個のサイコロの合計は ${throwResult.sum} です。`
}



//////////////////////////////// Handler ////////////////////////////////

/**
 * 起動処理
 */
const launchHandler = {
	canHandle(handlerInput) {
		const request = handlerInput.requestEnvelope.request
		return request.type === "LaunchRequest"
	},
	handle(handlerInput) {
		return handlerInput.responseBuilder
			.speak(LAUNCH_MESSAGE)
			.reprompt(LAUNCH_MESSAGE)
			.getResponse()
	}
}

/**
 * サイコロを振る処理
 */
const throwDiceHandler = {
	canHandle(handlerInput) {
		const request = handlerInput.requestEnvelope.request
		return request.type === "IntentRequest" &&
			request.intent.name === "ThrowDiceIntent"
	},
	handle(handlerInput) {
		// サイコロの個数をnumberスロットから取得
		const diceCount = Alexa.getSlotValue(handlerInput.requestEnvelope, "number") || 1
		
		// サイコロの個数分サイコロを振った結果の文言を取得
		const throwResultMessage = getThrowResultMessage(diceCount)
		
		// 結果の発話フレーズ
		const speech = `サイコロを${diceCount}個投げます。コロコロコロ、、、${throwResultMessage}`
		
		return handlerInput.responseBuilder
			.speak(speech)
			.getResponse()
	}
}

/**
 * 終了処理
 */
const sessionEndedHandler = {
	canHandle(handlerInput) {
		const request = handlerInput.requestEnvelope.request
		return request.type === "SessionEndedRequest"
	},
	handle(handlerInput) {
		return handlerInput.responseBuilder.getResponse()
	}
}

/**
 * エラー処理
 */
const errorHandler = {
	canHandle(handlerInput) {
		return true
	},
	handle(handlerInput) {
		return handlerInput.responseBuilder
			.speak(ERROR_MESSAGE)
			.reprompt(ERROR_MESSAGE)
			.getResponse()
	}
}

/**
 * ハンドラー生成
 */
const skill = Alexa.SkillBuilders.custom()
	.addRequestHandlers(
		launchHandler,
		throwDiceHandler,
		sessionEndedHandler,
	)
	.addErrorHandlers(errorHandler)
	.create()



//////////////////////////////// App ////////////////////////////////

const adapter = new ExpressAdapter(skill, false, false)
express()
	.post(ENDPOINT, adapter.getRequestHandlers())
	.listen(PORT)

console.log("start!")
