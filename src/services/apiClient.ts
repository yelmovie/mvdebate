/**
 * Generic API client with error handling
 * Single Responsibility: HTTP request/response handling
 */
export async function apiFetch<T>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> {
  try {
    const res = await fetch(input, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers || {})
      }
    });

    if (!res.ok) {
      let errorMessage = `API error: ${res.status} ${res.statusText}`;
      try {
        const errorData = await res.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        // If JSON parsing fails, try text
        const text = await res.text().catch(() => "");
        if (text) errorMessage = text;
      }
      throw new Error(errorMessage);
    }

    return (await res.json()) as T;
  } catch (error) {
    // Re-throw known errors
    if (error instanceof Error) {
      throw error;
    }
    // Handle network errors
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error("네트워크 오류: 서버에 연결할 수 없습니다.");
    }
    throw new Error("알 수 없는 오류가 발생했습니다.");
  }
}
