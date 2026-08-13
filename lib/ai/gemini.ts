import { GoogleGenAI } from "@google/genai";

const DEFAULT_MODEL = "gemini-3.6-flash";

function createGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "환경변수 GEMINI_API_KEY이(가) 설정되지 않았습니다. .env.local 파일을 확인하세요.",
    );
  }

  return new GoogleGenAI({ apiKey });
}

function extractTextOrThrow(text: string | undefined): string {
  const trimmed = text?.trim();
  if (!trimmed) {
    throw new Error("Gemini 응답에서 텍스트를 추출하지 못했습니다.");
  }
  return trimmed;
}

/**
 * Gemini로 단일 텍스트를 생성한다.
 * @param prompt 사용자 프롬프트
 * @param model 사용할 모델 (기본: gemini-3.6-flash)
 * @returns 생성된 텍스트
 */
export async function generateGeminiText(
  prompt: string,
  model: string = DEFAULT_MODEL,
): Promise<string> {
  const ai = createGeminiClient();
  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
  });

  return extractTextOrThrow(response.text);
}

/**
 * 시스템 프롬프트와 사용자 프롬프트를 결합해 Gemini 텍스트를 생성한다.
 * @param systemPrompt 시스템 지시문
 * @param userPrompt 사용자 프롬프트
 * @param model 사용할 모델 (기본: gemini-3.6-flash)
 * @returns 생성된 텍스트
 */
export async function generateGeminiTextWithSystemPrompt(
  systemPrompt: string,
  userPrompt: string,
  model: string = DEFAULT_MODEL,
): Promise<string> {
  const combinedPrompt = `${systemPrompt}\n${userPrompt}`;
  const ai = createGeminiClient();
  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        role: "user",
        parts: [{ text: combinedPrompt }],
      },
    ],
  });

  return extractTextOrThrow(response.text);
}

/**
 * Gemini 스트리밍 응답을 chunk 단위로 yield한다.
 * @param prompt 사용자 프롬프트
 * @param model 사용할 모델 (기본: gemini-3.6-flash)
 * @yields 응답 텍스트 청크
 */
export async function* generateGeminiTextStream(
  prompt: string,
  model: string = DEFAULT_MODEL,
): AsyncGenerator<string, void, unknown> {
  const ai = createGeminiClient();
  const stream = await ai.models.generateContentStream({
    model,
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
  });

  for await (const chunk of stream) {
    if (chunk.text) {
      yield chunk.text;
    }
  }
}
