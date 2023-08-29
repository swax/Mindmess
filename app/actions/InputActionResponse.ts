import OpenAI from "openai";

export interface InputActionResponse {
  newNote: string;
  chatLog: OpenAI.Chat.Completions.ChatCompletionMessage[];
  error: string;
}

export function initInputActionResponse(): InputActionResponse {
  return {
    newNote: "",
    chatLog: [],
    error: "",
  };
}
