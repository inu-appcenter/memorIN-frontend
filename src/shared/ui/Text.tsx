import { Text as RNText, type TextProps } from "react-native";
import { TYPO_CLASS, type TypoToken } from "@/shared/config/typography";

interface Props extends TextProps {
  className?: string;
  variant?: TypoToken;
}
// Text 컴포넌트 오버라이딩
export function Text({ variant, className, ...props }: Props) {
  return (
    <RNText
      className={`font-sans ${variant ? TYPO_CLASS[variant] : ""} ${className ?? ""}`}
      {...props}
    />
  );
}
