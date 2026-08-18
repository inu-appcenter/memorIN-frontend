import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import SplashLogo from '@/shared/assets/icons/memorIN_splash_icon.png';

// app.json의 expo-splash-screen backgroundColor와 반드시 같아야 한다.
// 네이티브 스플래시 → JS 스플래시로 넘어가는 순간 색이 다르면 깜빡인다.
export const SPLASH_BACKGROUND = '#1747BB';

interface AppSplashProps {
  /** true면 화면을 덮고, false로 바뀌면 페이드아웃 후 스스로 언마운트된다 */
  visible: boolean;
}

// 안드로이드 12+ 네이티브 스플래시는 이미지를 원형으로 잘라내서
// 로고 옆 워드마크를 표현할 수 없다. 그래서 네이티브는 로고만 띄우고,
// 피그마 시안(파란 배경 + 로고 + MemorIN)은 이 컴포넌트가 그린다.
export function AppSplash({ visible }: AppSplashProps) {
  const opacity = useRef(new Animated.Value(1)).current;
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    if (visible) return;
    Animated.timing(opacity, {
      toValue: 0,
      duration: 320,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setMounted(false);
    });
  }, [visible, opacity]);

  if (!mounted) return null;

  return (
    <Animated.View
      pointerEvents={visible ? 'auto' : 'none'}
      style={[StyleSheet.absoluteFill, styles.root, { opacity }]}
    >
      <View style={styles.stack}>
        <Image source={SplashLogo} style={styles.logo} resizeMode="contain" />
        <Text style={styles.wordmark}>MemorIN</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SPLASH_BACKGROUND,
    // Stack / PortalHost / ToastHost 위로 확실히 올라오게
    zIndex: 999,
    elevation: 999,
  },
  stack: {
    alignItems: 'center',
    gap: 16,
  },
  logo: {
    width: 96,
    height: 96,
  },
  wordmark: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 28,
    lineHeight: 40,
    letterSpacing: -0.2,
    color: '#FFFFFF',
  },
});
