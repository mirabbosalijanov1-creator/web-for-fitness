const HF_INFERENCE_URL =
  process.env.HF_PLAN_MODEL_URL ??
  "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2";

const HF_WEEKLY_MODEL_URL =
  process.env.HF_WEEKLY_MODEL_URL ??
  "https://api-inference.huggingface.co/models/tiiuae/falcon-7b-instruct";

const HF_MONTHLY_MODEL_URL =
  process.env.HF_MONTHLY_MODEL_URL ?? HF_WEEKLY_MODEL_URL;

const buildHeaders = () => {
  const token = process.env.HUGGINGFACE_API_KEY;

  if (!token) {
    return undefined;
  }

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  } satisfies HeadersInit;
};

const safeFetch = async (url: string, payload: unknown) => {
  const headers = buildHeaders();

  if (!headers) {
    return null;
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) {
    console.warn("HuggingFace request failed", await response.text());
    return null;
  }

  try {
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to parse HF response", error);
    return null;
  }
};

export const requestWeeklyPlan = async (prompt: string) => {
  return safeFetch(HF_INFERENCE_URL, { inputs: prompt });
};

export const requestWeeklyAdjustment = async (prompt: string) => {
  return safeFetch(HF_WEEKLY_MODEL_URL, { inputs: prompt });
};

export const requestMonthlyEvolution = async (prompt: string) => {
  return safeFetch(HF_MONTHLY_MODEL_URL, { inputs: prompt });
};
