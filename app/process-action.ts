"use server";

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
});

const systemMessage = `Combine the 'input' note with the 'exiting' note to create a combined note output.
Don't print out any header in the output.
Ensure the combined note is organized well into nested bullet points, and duplication is minimized.`;

export async function processAction(note: string, existingNotes: string) {
  let result = {
    newNote: "",
    error: "",
  };

  try {
    const userMsg = `Input Note: ${note}\nExisting Notes: ${existingNotes}`;

    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userMsg },
      ],
    });

    const content = chatCompletion.choices[0].message.content;
    
    if (!content)
    {
      result.error = "Error: No result";
    }
    else {
      result.newNote = content.replace(/combined note:/i, "");
    }

  } catch (e) {
    result.error = '' + e;
  }

  return result;
}
