//"use server";

import { getApiKeyOrThrow } from "@/utils/apiKey";
import OpenAI from "openai";
import {
  InputActionResponse,
  initInputActionResponse,
} from "./InputActionResponse";

const systemMessage = `Run the following question on the 'Existing Notes'.`;

export async function questionAction(
  question: string,
  existingNotes: string,
  messageLog: OpenAI.Chat.Completions.ChatCompletionMessage[],
): Promise<InputActionResponse> {
  let result = initInputActionResponse();

  try {
    const openai = new OpenAI({
      apiKey: getApiKeyOrThrow(), //process.env["OPENAI_API_KEY"],
      dangerouslyAllowBrowser: true,
    });

    const noteMsg = `Existing Notes:\n${existingNotes}`;

    const questionAnswer: OpenAI.Chat.Completions.ChatCompletionMessage[] = [
      { role: "user", content: question },
    ];

    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: noteMsg },
        ...messageLog,
        ...questionAnswer,
      ],
    });

    const answer = chatCompletion.choices[0].message.content;

    if (!answer) {
      result.error = "Error: No result";
    } else {
      questionAnswer.push({
        role: "assistant",
        content: answer,
      });

      result.chatLog = questionAnswer;
    }
  } catch (e) {
    result.error = "" + e;
  }

  return result;
}
