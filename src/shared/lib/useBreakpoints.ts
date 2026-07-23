import { useWindowDimensions } from 'react-native';

const TABLET_BREAKPOINT = 768;
const DESKTOP_BREAKPOINT = 1024;

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
