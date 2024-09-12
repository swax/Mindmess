export type GptModelName = "gpt-4o" | "gpt-4o-mini";

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
    costPer1MInput: 5,
    costPer1MOutput: 15,
  },
  {
    name: "gpt-4o-mini",
    description: "GPT-4o mini 128k",
    maxTokens: 128_000,
    costPer1MInput: 0.15,
    costPer1MOutput: 0.6,
  },
];

export default gptModels;
