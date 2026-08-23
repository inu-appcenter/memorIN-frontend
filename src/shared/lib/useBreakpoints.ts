import { useWindowDimensions } from 'react-native';

// 브레이크포인트: 375(폰 최소 기준) / 768(테블릿 시작) / 1200(데스크탑 시작)
const TABLET_BREAKPOINT = 768;
const DESKTOP_BREAKPOINT = 1200;

// 레이아웃을 보장하는 최소 화면 폭. 이보다 좁아지면 가로 스크롤이 생기더라도
// 요소가 찌그러지지 않도록, 좁은 화면에 놓이는 컨테이너에 minWidth로 건다.
export const MIN_SUPPORTED_WIDTH = 375;

export type Device = 'desktop' | 'tablet' | 'phone';

export const useBreakpoints = () => {
  const { width } = useWindowDimensions();
  const device: Device =
    width >= DESKTOP_BREAKPOINT
      ? 'desktop'
      : width >= TABLET_BREAKPOINT
        ? 'tablet'
        : 'phone';

  return { device, width };
};
