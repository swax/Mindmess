//"use server";

import { getApiKeyOrThrow } from "@/utils/apiKey";
import { GptModelName } from "@/utils/gptModels";
import OpenAI from "openai";
import {
  InputActionResponse,
  initInputActionResponse,
  setTokensUsed,
} from "./InputActionResponse";

const systemMessage = `Run the specificed 'Command' on the 'Existing Notes' to create a new 'Output Note'.
Give a summary of changes at the bottom prefixed with **.`;

export async function commandAction(
  command: string,
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
    const commandMsg = `Command:\n${command}`;

    const chatCompletion = await openai.chat.completions.create({
      model: modelName,
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: noteMsg },
        { role: "user", content: commandMsg },
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
