// [zod 라이브러리] 스키마 하나로 유효성 규칙과 에러 메시지를 한 곳에서 관리할 수 있다.
import { z } from 'zod';

// 로그인(signIn) 스키마
export const signInSchema = z.object({
  email: z
    .string()
    .min(1, '이메일을 입력하세요')
    .email('올바른 이메일 형식이 아닙니다'),
  password: z.string().min(1, '비밀번호를 입력하세요'),
});

// 회원가입(signUp) 스키마
export const signUpSchema = z
  .object({
    // 로그인 식별자로 사용하는 이메일
    email: z
      .string()
      .min(1, '이메일을 입력하세요')
      .email('올바른 이메일 형식이 아닙니다'),
    // 비밀번호 원문. 서버 저장 시 해시 처리
    password: z
      .string()
      .min(8, '비밀번호는 8자 이상이어야 합니다')
      .regex(/[A-Za-z]/, '영문자를 포함해야 합니다')
      .regex(/[0-9]/, '숫자를 포함해야 합니다'),
    passwordConfirm: z.string().min(8, '비밀번호는 8자 이상이어야 합니다'),
    // 서비스 내 고유 사용자명
    username: z
      .string()
      .min(1, '사용자명을 입력하세요')
      .max(50, '50자 이하여야 합니다'),
    // 화면 표시명
    displayName: z
      .string()
      .min(1, '화면 표시명을 입력하세요')
      .max(50, '50자 이하여야 합니다'),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['passwordConfirm'], // 에러가 이 필드 밑에 표시됨
  });

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
