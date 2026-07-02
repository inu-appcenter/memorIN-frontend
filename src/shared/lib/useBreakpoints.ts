import { BREAKPOINT } from "../config/platform";
import { useWindowDimensions } from "react-native";

export const useBreakpoints = () => {
  const { width } = useWindowDimensions();
  const platform = width >= BREAKPOINT ? "desktop" : "mobile";
  return { platform };
};
