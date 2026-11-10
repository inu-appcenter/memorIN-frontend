// 업로드 단계 사이에 취소 여부를 확인하는 헬퍼.
//
// AbortSignal.any·AbortSignal.timeout·signal.throwIfAborted는 최신 브라우저에만 있고
// React Native(Hermes)의 AbortController 폴리필에는 없다. 두 플랫폼에서 같은 코드를
// 쓰려고 AbortController 하나에 부모 신호와 타이머를 직접 연결한다.

export function createAbortError(): Error {
  const error = new Error('Aborted');
  error.name = 'AbortError';
  return error;
}

export function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) throw createAbortError();
}

export interface Deadline {
  // 부모가 취소되거나 시간이 다 되면 abort된다.
  signal: AbortSignal;
  // abort가 타이머 때문인지. 부모 취소와 구별해 다른 오류를 내야 한다.
  readonly timedOut: boolean;
  // 끝났으면 타이머와 부모 리스너를 정리한다. 남겨 두면 다음 업로드에 영향을 준다.
  clear: () => void;
}

export function createDeadline(
  parent: AbortSignal | undefined,
  timeoutMs: number
): Deadline {
  const controller = new AbortController();
  let timedOut = false;

  const onParentAbort = () => controller.abort();
  if (parent?.aborted) controller.abort();
  else parent?.addEventListener('abort', onParentAbort);

  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  return {
    signal: controller.signal,
    get timedOut() {
      return timedOut;
    },
    clear: () => {
      clearTimeout(timer);
      parent?.removeEventListener('abort', onParentAbort);
    },
  };
}
