import { NextResponse } from 'next/server';

/**
 * APIレスポンスのヘルパー関数群
 * Next.jsのAPIルートで使用するためのレスポンス生成関数を提供します。
 */

/**
 * 成功レスポンスを生成します。
 * @param data - レスポンスデータ（任意）
 * @param message - 成功メッセージ（デフォルト: "Success"）
 * @param status - HTTPステータスコード（デフォルト: 200）
 * @returns NextResponseオブジェクト
 */
export function successResponse<T = unknown>(
  data?: T,
  message: string = 'Success',
  status: number = 200
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status }
  );
}

/**
 * エラーレスポンスを生成します。
 * @param message - エラーメッセージ
 * @param status - HTTPステータスコード（デフォルト: 400）
 * @param errors - 詳細なエラー情報（任意）
 * @returns NextResponseオブジェクト
 */
export function errorResponse(
  message: string,
  status: number = 400,
  errors?: Record<string, string[]>
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      message,
      errors,
    },
    { status }
  );
}

/**
 * バリデーションエラーレスポンスを生成します。
 * @param errors - バリデーションエラーの詳細
 * @returns NextResponseオブジェクト（ステータス422）
 */
export function validationErrorResponse(errors: Record<string, string[]>): NextResponse {
  return NextResponse.json(
    {
      success: false,
      message: 'Validation failed',
      errors,
    },
    { status: 422 }
  );
}

/**
 * 認証エラーレスポンスを生成します。
 * @param message - エラーメッセージ（デフォルト: "Unauthorized"）
 * @returns NextResponseオブジェクト（ステータス401）
 */
export function unauthorizedResponse(message: string = 'Unauthorized'): NextResponse {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status: 401 }
  );
}

/**
 * 権限エラーレスポンスを生成します。
 * @param message - エラーメッセージ（デフォルト: "Forbidden"）
 * @returns NextResponseオブジェクト（ステータス403）
 */
export function forbiddenResponse(message: string = 'Forbidden'): NextResponse {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status: 403 }
  );
}

/**
 * 見つからないエラーレスポンスを生成します。
 * @param message - エラーメッセージ（デフォルト: "Not Found"）
 * @returns NextResponseオブジェクト（ステータス404）
 */
export function notFoundResponse(message: string = 'Not Found'): NextResponse {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status: 404 }
  );
}

/**
 * サーバーエラーレスポンスを生成します。
 * @param message - エラーメッセージ（デフォルト: "Internal Server Error"）
 * @returns NextResponseオブジェクト（ステータス500）
 */
export function serverErrorResponse(message: string = 'Internal Server Error'): NextResponse {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status: 500 }
  );
}