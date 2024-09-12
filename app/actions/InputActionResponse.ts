import OpenAI from "openai";

export interface InputActionResponse {
  newNote: string;
  chatLog: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
  error: string;
  inputTokens: number;
  outputTokens: number;
}

export function initInputActionResponse(): InputActionResponse {
  return {
    newNote: "",
    chatLog: [],
    error: "",
    inputTokens: 0,
    outputTokens: 0,
  };
}

export function setTokensUsed(
  chatCompletion: OpenAI.Chat.Completions.ChatCompletion,
  response: InputActionResponse,
) {
  response.inputTokens = chatCompletion.usage?.prompt_tokens || 0;
  response.outputTokens = chatCompletion.usage?.completion_tokens || 0;
}
