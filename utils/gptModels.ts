export type GptModelName =
  | "gpt-3.5-turbo"
  | "gpt-3.5-turbo-16k"
  | "gpt-4"
  | "gpt-4-32k";

export type GptModel = {
  name: GptModelName;
  description: string;
  maxTokens: number;
  costPer1kInput: number;
  costPer1kOutput: number;
};

const gptModels: GptModel[] = [
  {
    name: "gpt-3.5-turbo",
    description: "GPT-3 4k",
    maxTokens: 4097,
    costPer1kInput: 0.0015,
    costPer1kOutput: 0.002,
  },
  {
    name: "gpt-3.5-turbo-16k",
    description: "GPT-3 16k",
    maxTokens: 16385,
    costPer1kInput: 0.003,
    costPer1kOutput: 0.004,
  },
  {
    name: "gpt-4",
    description: "GPT-4 8k",
    maxTokens: 8192,
    costPer1kInput: 0.03,
    costPer1kOutput: 0.06,
  },
  {
    name: "gpt-4-32k",
    description: "GPT-4 32k",
    maxTokens: 32768,
    costPer1kInput: 0.06,
    costPer1kOutput: 0.12,
  },
];

export default gptModels;
