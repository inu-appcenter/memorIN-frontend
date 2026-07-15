import * as React from "react";
import { Text as RNText, type TextProps } from "react-native";
import { cn } from "@/shared/lib/utils";
import { TYPO_CLASS, type TypoToken } from "@/shared/config/typography";

export const TextClassContext = React.createContext<string | undefined>(
  undefined,
);

interface Props extends TextProps {
  className?: string;
  variant?: TypoToken;
}

// Text 컴포넌트 오버라이딩
export function Text({ variant, className, ...props }: Props) {
  const textClass = React.useContext(TextClassContext);
  return (
    <RNText
      className={cn(
        "font-sans text-text", // 앱 기본값
        variant && TYPO_CLASS[variant], // props로 variant가 있으면 해당 타이포 토큰적용
        textClass, // 부모(Button 등)가 주입한 스타일
        className, // 호출부 명시 — 최우선
      )}
      {...props}
    />
  );
}
