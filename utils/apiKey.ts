export const localStorageApiKeyKey = "openaiApiKey";

export function getApiKeyOrThrow() {
  const apiKey = localStorage.getItem(localStorageApiKeyKey);
  if (!apiKey) {
    throw new Error("API key not found. Please enter it in the header.");
  }
  return JSON.parse(apiKey) as string;
}
