export type GptModelName = "gpt-4o" | "gpt-4o-mini" | "o1-preview" | "o1-mini";

export type GptModel = {
  name: GptModelName;
  description: string;
  maxTokens: number;
  costPer1MInput: number;
  costPer1MOutput: number;
};

const gptModels: GptModel[] = [
  {
    name: "gpt-4o",
    description: "GPT-4o 128k",
    maxTokens: 128_000,
    costPer1MInput: 2.5,
    costPer1MOutput: 10,
  },
  {
    name: "gpt-4o-mini",
    description: "GPT-4o mini 128k",
    maxTokens: 128_000,
    costPer1MInput: 0.15,
    costPer1MOutput: 0.6,
  },
  {
    name: "o1-preview",
    description: "GPT-o1 preview 128k",
    maxTokens: 128_000,
    costPer1MInput: 15,
    costPer1MOutput: 60,
  },
  {
    name: "o1-mini",
    description: "GPT-o1 mini 128k",
    maxTokens: 128_000,
    costPer1MInput: 3,
    costPer1MOutput: 12,
  },
];

export default gptModels;

export function getSystemMessage(
  modelName: GptModelName,
  message: string,
): {
  role: "system" | "user";
  content: string;
} {
  return {
    role: modelName.startsWith("o1") ? "user" : "system",
    content: modelName.startsWith("o1") ? `Instructions:\n${message}` : message,
  };
}
