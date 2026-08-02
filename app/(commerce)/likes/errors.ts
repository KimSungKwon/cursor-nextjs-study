export class AuthRequiredError extends Error {
  static readonly code = "AUTH_REQUIRED" as const;

  readonly code = AuthRequiredError.code;

  constructor(message = "로그인이 필요합니다.") {
    super(message);
    this.name = "AuthRequiredError";
  }
}

export function isAuthRequiredError(error: unknown): boolean {
  if (error instanceof AuthRequiredError) {
    return true;
  }

  if (typeof error !== "object" || error === null) {
    return false;
  }

  const candidate = error as { name?: string; message?: string; code?: string };

  return (
    candidate.name === "AuthRequiredError" ||
    candidate.code === AuthRequiredError.code ||
    candidate.message === "로그인이 필요합니다."
  );
}
