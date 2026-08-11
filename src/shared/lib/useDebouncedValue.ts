import { useEffect, useState } from 'react';

// 값이 delayMs 동안 더 이상 바뀌지 않을 때만 최신값을 반영한다.
// 검색 입력처럼 타이핑 중간마다 API를 호출하지 않으려는 용도.
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
