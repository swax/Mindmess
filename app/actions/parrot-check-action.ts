//"use server";

import { getApiKeyOrThrow } from "@/utils/apiKey";
import { GptModelName } from "@/utils/gptModels";
import OpenAI from "openai";
import {
  initInputActionResponse,
  InputActionResponse,
} from "./InputActionResponse";

const systemMessage = `Run the following question on the 'Existing Notes'.`;

export async function parrotCheckAction(
  comment: string,
  context: string,
  modelName: GptModelName,
): Promise<InputActionResponse> {
  let result = initInputActionResponse();

  try {
    const openai = new OpenAI({
      apiKey: getApiKeyOrThrow(), //process.env["OPENAI_API_KEY"],
      dangerouslyAllowBrowser: true,
    });

    const commentWords = comment.trim().split(/\s+/);
    let rebuildComment = "";

    for (let i = 0; i < commentWords.length; i++) {
      const word = commentWords[i];

      const completionResponse = await openai.completions.create({
        model: "gpt-3.5-turbo-instruct", // "gpt-3.5-turbo-instruct", //  'gpt-3.5-turbo-instruct' | 'davinci-002' | 'babbage-002'
        prompt: `${context}\n\n${rebuildComment}`,
        logprobs: 5,
        max_tokens: 5,
      });

      // check the response here if the next word was predicted and the probability of it
      let match = "";

      // Get the top logprobs for the first predicted token
      const choice = completionResponse.choices[0];
      const topLogprobs = choice.logprobs?.top_logprobs?.[0];

      const sanitizedTopLogprobs: { [key: string]: number } = {};

      const sanitizedWord = word.replace(/[.,!?;:"'<>]\n$/, "").toLowerCase();

      if (sanitizedWord && topLogprobs) {
        for (const key in topLogprobs) {
          const keySanitized = key
            .replace(/[.,!?;:"'<>]\n$/, "")
            .trim()
            .toLowerCase();
          const logprob = topLogprobs[key];
          const probability = Math.exp(logprob) * 100;

          if (!keySanitized) continue;

          if (keySanitized in sanitizedTopLogprobs) {
            sanitizedTopLogprobs[keySanitized] += probability;
          } else {
            sanitizedTopLogprobs[keySanitized] = probability;
          }

          if (sanitizedWord.includes(keySanitized)) {
            match = keySanitized;
            // Keep going to accumulate probabilities
          }
        }
      }

      result.parrotReport.push({
        word,
        probability: sanitizedTopLogprobs[match] || 0,
        match,
        predictedText: choice.text.trim(),
        other_words: Object.entries(sanitizedTopLogprobs).map(
          ([word, probability]) => ({ word, probability }),
        ),
      });

      rebuildComment += word + " ";
    }

    //setTokensUsed(chatCompletion, result);
  } catch (e) {
    result.error = "" + e;
  }

  return result;
}
