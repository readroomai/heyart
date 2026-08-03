import 'server-only'
import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { ConfigurationError } from './db'
import { UnauthorizedError } from './auth'
import { AiConfigurationError, AiResponseError } from './ai'

export type ApiError = { error: string; code: string; details?: unknown }

/**
 * Maps a thrown error onto a friendly message and status. Stack traces never
 * reach the client, and image bytes or prompts are never logged.
 */
export function errorResponse(error: unknown): NextResponse<ApiError> {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Some details were missing or invalid.',
        code: 'validation_error',
        details: error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      },
      { status: 400 }
    )
  }

  if (error instanceof UnauthorizedError) {
    return NextResponse.json({ error: error.message, code: 'unauthorized' }, { status: 401 })
  }

  if (error instanceof ConfigurationError) {
    return NextResponse.json({ error: error.message, code: 'not_configured' }, { status: 503 })
  }

  if (error instanceof AiConfigurationError) {
    return NextResponse.json(
      {
        error: 'Reviews are not available yet — the AI provider is not configured.',
        code: 'ai_not_configured',
      },
      { status: 503 }
    )
  }

  if (error instanceof AiResponseError) {
    return NextResponse.json({ error: error.message, code: 'ai_invalid_response' }, { status: 502 })
  }

  if (error instanceof Error) {
    if (error.name === 'DailyLimitError') {
      return NextResponse.json({ error: error.message, code: 'daily_limit' }, { status: 429 })
    }
    if (error.name === 'BrandProfileLimitError') {
      return NextResponse.json({ error: error.message, code: 'profile_limit' }, { status: 409 })
    }
    if (error.name === 'NotFoundError') {
      return NextResponse.json({ error: error.message, code: 'not_found' }, { status: 404 })
    }
    if (error.name === 'ForbiddenError') {
      return NextResponse.json({ error: error.message, code: 'forbidden' }, { status: 403 })
    }
    // Log the message only — never request bodies, prompts or image data.
    console.error(`[hiart] ${error.name}: ${error.message}`)
  } else {
    console.error('[hiart] Unknown error')
  }

  return NextResponse.json(
    { error: 'Something went wrong on our side. Please try again.', code: 'server_error' },
    { status: 500 }
  )
}

export function notFound(message = 'That item does not exist.'): never {
  const error = new Error(message)
  error.name = 'NotFoundError'
  throw error
}

export function forbidden(message = 'You do not have access to that.'): never {
  const error = new Error(message)
  error.name = 'ForbiddenError'
  throw error
}
