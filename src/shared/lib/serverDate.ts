// JS는 오프셋 없는 날짜시간 문자열을 '로컬 시간'으로 해석하는데 실제 값은 UTC라,
// 그대로 파싱하면 KST 기준 항상 9시간 어긋난다. 오프셋이 없으면 UTC로 못박는다.
export function parseServerDate(iso: string): Date {
  const hasTimezone = /(Z|[+-]\d{2}:?\d{2})$/.test(iso);
  return new Date(hasTimezone ? iso : `${iso}Z`);
}
