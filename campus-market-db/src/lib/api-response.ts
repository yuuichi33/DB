import { NextResponse } from "next/server";

export function ok<T>(data: T) {
  return NextResponse.json({ ok: true, data });
}

export function fail(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export function toApiError(error: unknown) {
  if (error instanceof Error) {
    return fail(error.message, 400);
  }

  return fail("服务器内部错误", 500);
}
