"use server";

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
});

const systemMessage = `Combine the 'Existing Notes' with the 'Input Notes' to create a Combined Note. 
Deduplicate and reorganize notes if possible to improve the overall understanding.
Organize the notes in a tree using the tab character for nesting.
Give a summary of changes at the bottom prefixed with **.`;

export async function processAction(note: string, existingNotes: string) {
  let result = {
    newNote: "",
    error: "",
  };

  try {
    const userMsg1 = `Existing Notes:\n${existingNotes}`;
    const userMsg2 = `Input Notes:\n${note}`;

    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userMsg1 },
        { role: "user", content: userMsg2 },
      ],
    });

    const content = chatCompletion.choices[0].message.content;
    
    if (!content)
    {
      result.error = "Error: No result";
    }
    else {
      result.newNote = content.replace(/combined note(s)?( output)?:(\n)?/i, "");
    }

  } catch (e) {
    result.error = '' + e;
  }

  return result;
}
