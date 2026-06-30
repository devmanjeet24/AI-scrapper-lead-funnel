import { isAxiosError } from 'axios'

export function getAuthErrorMessage(error: unknown, fallback: string): string {
  if (!isAxiosError(error)) {
    return fallback
  }

  const detail = error.response?.data?.detail

  if (typeof detail === 'string') {
    return detail
  }

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        if (typeof item === 'object' && item !== null && 'msg' in item) {
          return String(item.msg)
        }
        return null
      })
      .filter(Boolean)

    if (messages.length > 0) {
      return messages.join('. ')
    }
  }

  return fallback
}
