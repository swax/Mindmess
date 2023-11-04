const localStorageApiKeyKey = "openai-api-key";

export function getApiKey() {
  return localStorage.getItem(localStorageApiKeyKey) || "";
}

export function getApiKeyOrThrow() {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("API key not found. Please enter it in the header.");
  }
  return apiKey;
}

export function saveApiKey(apiKey: string) {
  localStorage.setItem(localStorageApiKeyKey, apiKey);
}

export function clearApiKey() {
  localStorage.removeItem(localStorageApiKeyKey);
}
