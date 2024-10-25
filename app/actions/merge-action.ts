//"use server";

import { getApiKeyOrThrow } from "@/utils/apiKey";
import { getSystemMessage, GptModelName } from "@/utils/gptModels";
import OpenAI from "openai";
import {
  initInputActionResponse,
  InputActionResponse,
  setTokensUsed,
} from "./InputActionResponse";

const systemMessage = `Combine the 'Existing Notes' with the 'Input Notes' to create an 'Output Note'. 
Deduplicate and reorganize notes if possible to improve the overall understanding.
Organize the notes in a tree using the tab character for nesting.
Give a summary of changes at the bottom prefixed with **.`;

export async function mergeAction(
  note: string,
  existingNotes: string,
  modelName: GptModelName,
): Promise<InputActionResponse> {
  let result = initInputActionResponse();

  try {
    const openai = new OpenAI({
      apiKey: getApiKeyOrThrow(), //process.env["OPENAI_API_KEY"],
      dangerouslyAllowBrowser: true,
    });

    const noteMsg = `Existing Notes:\n${existingNotes}`;
    const inputMsg = `Input Notes:\n${note}`;

    const chatCompletion = await openai.chat.completions.create({
      model: modelName,
      messages: [
        getSystemMessage(modelName, systemMessage),
        { role: "user", content: noteMsg },
        { role: "user", content: inputMsg },
      ],
    });

    const newNote = chatCompletion.choices[0].message.content;

    if (!newNote) {
      result.error = "Error: No result";
    } else {
      result.newNote = newNote.replace(/output note(s)?:(\n)?/i, "");
    }

    setTokensUsed(chatCompletion, result);
  } catch (e) {
    result.error = "" + e;
  }

  return result;
}
