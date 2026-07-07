import { useWindowDimensions } from "react-native";

const BREAKPOINT = 768;

export const useBreakpoints = () => {
  const { width } = useWindowDimensions();
  const device = width >= BREAKPOINT ? "desktop" : "mobile";
  return { device };
};
