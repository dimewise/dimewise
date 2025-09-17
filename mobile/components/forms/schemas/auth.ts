import type { TFunction } from 'i18next';
import * as z from 'zod';

export const createSignInSchema = (t: TFunction<'translation', undefined>) =>
  z.object({
    emailAddress: z.email(t('error_invalid_email')),
    password: z
      .string()
      .min(8, t('error_min_password'))
      .regex(/[A-Z]/, t('error_missing_uppercase_password'))
      .regex(/[a-z]/, t('error_missing_lowercase_password'))
      .regex(/\d/, t('error_missing_number_password')),
  });
export type signInData = z.infer<ReturnType<typeof createSignInSchema>>;

export const createSignUpSchema = (t: TFunction<'translation', undefined>) =>
  z.object({
    emailAddress: z.email(t('error_invalid_email')),
    password: z
      .string()
      .min(8, t('error_min_password'))
      .regex(/[A-Z]/, t('error_missing_uppercase_password'))
      .regex(/[a-z]/, t('error_missing_lowercase_password'))
      .regex(/\d/, t('error_missing_number_password')),
  });
export type signUpData = z.infer<ReturnType<typeof createSignUpSchema>>;

export const createVerificationSchema = (t: TFunction<'translation', undefined>) =>
  z.object({
    code: z.string().min(1, t('error_required_verification_code')),
  });
export type verificationData = z.infer<ReturnType<typeof createVerificationSchema>>;
