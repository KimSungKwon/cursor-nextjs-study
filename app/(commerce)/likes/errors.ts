export class AuthRequiredError extends Error {
  static readonly code = "AUTH_REQUIRED" as const;

  readonly code = AuthRequiredError.code;

  constructor(message = "로그인이 필요합니다.") {
    super(message);
    this.name = "AuthRequiredError";
  }
}

export class NotFoundError extends Error {
  static readonly code = "NOT_FOUND" as const;

  readonly code = NotFoundError.code;

  constructor(message = "요청한 리소스를 찾을 수 없습니다.") {
    super(message);
    this.name = "NotFoundError";
  }
}

export class ForbiddenError extends Error {
  static readonly code = "FORBIDDEN" as const;

  readonly code = ForbiddenError.code;

  constructor(message = "권한이 없습니다.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

function matchSerializedError(
  error: unknown,
  name: string,
  code: string,
  fallbackMessage: string,
): boolean {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const candidate = error as { name?: string; message?: string; code?: string };

  return (
    candidate.name === name ||
    candidate.code === code ||
    candidate.message === fallbackMessage
  );
}

export function isAuthRequiredError(error: unknown): boolean {
  if (error instanceof AuthRequiredError) {
    return true;
  }

  return matchSerializedError(
    error,
    "AuthRequiredError",
    AuthRequiredError.code,
    "로그인이 필요합니다.",
  );
}

export function isNotFoundError(error: unknown): boolean {
  if (error instanceof NotFoundError) {
    return true;
  }

  return (
    matchSerializedError(
      error,
      "NotFoundError",
      NotFoundError.code,
      "요청한 리소스를 찾을 수 없습니다.",
    ) ||
    matchSerializedError(
      error,
      "NotFoundError",
      NotFoundError.code,
      "리뷰를 찾을 수 없습니다.",
    )
  );
}

export function isForbiddenError(error: unknown): boolean {
  if (error instanceof ForbiddenError) {
    return true;
  }

  return (
    matchSerializedError(
      error,
      "ForbiddenError",
      ForbiddenError.code,
      "권한이 없습니다.",
    ) ||
    matchSerializedError(
      error,
      "ForbiddenError",
      ForbiddenError.code,
      "본인의 리뷰만 수정/삭제할 수 있습니다.",
    )
  );
}
