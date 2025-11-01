export type GptModelName = "gpt-5" | "gpt-5-mini" | "gpt-5-nano";

export type GptModel = {
  name: GptModelName;
  description: string;
  maxTokens: number;
  costPer1MInput: number;
  costPer1MOutput: number;
};

const gptModels: GptModel[] = [
  {
    name: "gpt-5",
    description: "GPT-5 400k",
    maxTokens: 400_000,
    costPer1MInput: 1.25,
    costPer1MOutput: 10,
  },
  {
    name: "gpt-5-mini",
    description: "GPT-5 mini 400k",
    maxTokens: 400_000,
    costPer1MInput: 0.25,
    costPer1MOutput: 2.0,
  },
  {
    name: "gpt-5-nano",
    description: "GPT-5 nano 400k",
    maxTokens: 400_000,
    costPer1MInput: 0.05,
    costPer1MOutput: 0.4,
  },
];

export default gptModels;

export function getSystemMessage(
  message: string,
): {
  role: "system" | "user";
  content: string;
} {
  return {
    role: "system",
    content: message,
  };
}
