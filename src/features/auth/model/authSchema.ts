// [zod 라이브러리] 스키마 하나로 유효성 규칙과 에러 메시지를 한 곳에서 관리할 수 있다.
import { z } from 'zod';
import i18next from '@/shared/lib/i18n';

// 에러 메시지를 문자열이 아니라 함수로 넘긴다. 스키마 자체는 모듈 로드 시 1회만
// 만들어지지만, 메시지는 parse 시점에 평가되므로 언어를 바꿔도 즉시 반영된다.
// 헬퍼로 묶지 않고 매번 직접 호출하는 이유는, 키를 변수로 넘기면 i18next의
// 타입 세이프 키 검사(오타 시 tsc 실패)가 풀리기 때문이다.

// 로그인(signIn) 스키마
export const signInSchema = z.object({
  email: z
    .string()
    .min(1, { error: () => i18next.t('auth.emailRequired') })
    .email({ error: () => i18next.t('auth.emailInvalid') }),
  password: z
    .string()
    .min(1, { error: () => i18next.t('auth.passwordRequired') }),
});

// 회원가입(signUp) 스키마
export const signUpSchema = z
  .object({
    // 로그인 식별자로 사용하는 이메일
    email: z
      .string()
      .min(1, { error: () => i18next.t('auth.emailRequired') })
      .email({ error: () => i18next.t('auth.emailInvalid') }),
    // 비밀번호 원문. 서버 저장 시 해시 처리
    password: z
      .string()
      .min(8, { error: () => i18next.t('auth.passwordMinLength') })
      .regex(/[A-Za-z]/, { error: () => i18next.t('auth.passwordNeedsLetter') })
      .regex(/[0-9]/, { error: () => i18next.t('auth.passwordNeedsNumber') }),
    passwordConfirm: z
      .string()
      .min(8, { error: () => i18next.t('auth.passwordMinLength') }),
    // 서비스 내 고유 사용자명
    username: z
      .string()
      .min(1, { error: () => i18next.t('auth.usernameRequired') })
      .max(50, { error: () => i18next.t('auth.maxLength50') }),
    // 화면 표시명
    displayName: z
      .string()
      .min(1, { error: () => i18next.t('auth.displayNameRequired') })
      .max(50, { error: () => i18next.t('auth.maxLength50') }),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    error: () => i18next.t('auth.passwordMismatch'),
    path: ['passwordConfirm'], // 에러가 이 필드 밑에 표시됨
  });

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
