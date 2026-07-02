import { z } from 'zod'

const PASSWORD_UPPERCASE = /[A-Z]/
const PASSWORD_LOWERCASE = /[a-z]/
const PASSWORD_DIGIT = /\d/

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be at most 128 characters')
  .refine((value) => value === value.trim(), {
    message: 'Password must not have leading or trailing spaces',
  })
  .refine((value) => PASSWORD_UPPERCASE.test(value), {
    message: 'Password must contain at least one uppercase letter',
  })
  .refine((value) => PASSWORD_LOWERCASE.test(value), {
    message: 'Password must contain at least one lowercase letter',
  })
  .refine((value) => PASSWORD_DIGIT.test(value), {
    message: 'Password must contain at least one number',
  })

export const PASSWORD_HINT =
  'At least 8 characters with uppercase, lowercase, and a number.'
