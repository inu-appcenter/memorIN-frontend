import { useWindowDimensions } from 'react-native';

// 브레이크포인트: 375(폰 최소 기준) / 768(테블릿 시작) / 1200(데스크탑 시작)
const TABLET_BREAKPOINT = 768;
const DESKTOP_BREAKPOINT = 1200;

export const useBreakpoints = () => {
  const { width } = useWindowDimensions();
  const device =
    width >= DESKTOP_BREAKPOINT
      ? ('desktop' as const)
      : width >= TABLET_BREAKPOINT
        ? ('tablet' as const)
        : ('mobile' as const);

  return { device, width };
};
