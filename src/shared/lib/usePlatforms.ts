import { Platform } from "react-native";

export type OS = "ios" | "android" | "web";

export const usePlatforms = () => {
  const os = Platform.OS as OS;
  return {
    os,
    isWeb: os === "web",
    isNative: os !== "web", // iOS/Android 공통 처리용
    isIOS: os === "ios",
    isAndroid: os === "android",
  };
};
