import { useRef, useState } from 'react';
import { Dimensions, Modal, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/shared/ui/text';
import { cn } from '@/shared/lib/utils';
import { COLORS } from '@/shared/lib/theme';
import ChevronDownIcon from '@/shared/assets/icons/chevron-down.svg';
import type { PostSortType } from '@/entities/post';

const SORT_OPTIONS = [
  'ACCURACY_DESC',
  'LATEST',
  'VIEW_COUNT_DESC',
] as const satisfies readonly PostSortType[];

const SORT_LABEL_KEY = {
  ACCURACY_DESC: 'searchPage.sortAccuracy',
  LATEST: 'searchPage.sortLatest',
  VIEW_COUNT_DESC: 'searchPage.sortPopular',
} as const satisfies Record<PostSortType, string>;

// 트리거 아래로 이만큼 띄운다
const MENU_GAP_PX = 6;

interface SortSelectProps {
  value: PostSortType;
  onChange: (value: PostSortType) => void;
  allowAccuracy: boolean;
}

// 목록을 Modal로 띄운다. 같은 화면 안에 absolute로 두면 뒤에 오는 목록
// 컨테이너가 위에 깔려 터치를 가져간다(NewChatMenu와 같은 이유).
export function SortSelect({
  value,
  onChange,
  allowAccuracy,
}: SortSelectProps) {
  const { t } = useTranslation();
  const triggerRef = useRef<View>(null);
  const [anchor, setAnchor] = useState<{ top: number; right: number } | null>(
    null
  );

  const options = allowAccuracy
    ? SORT_OPTIONS
    : SORT_OPTIONS.filter((option) => option !== 'ACCURACY_DESC');
  // 검색어를 지우면 훅이 LATEST로 내려 보내므로 표시도 맞춘다.
  const displayed =
    value === 'ACCURACY_DESC' && !allowAccuracy ? 'LATEST' : value;

  const openMenu = () => {
    // 칩 줄이 생기고 사라지면서 트리거의 y가 달라지므로 열 때마다 잰다.
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({
        top: y + height + MENU_GAP_PX,
        right: Dimensions.get('window').width - (x + width),
      });
    });
  };

  const closeMenu = () => setAnchor(null);

  return (
    <>
      <Pressable
        ref={triggerRef}
        onPress={openMenu}
        className="flex-row items-center gap-xs"
        hitSlop={8}
      >
        <Text className="text-secondary">{t(SORT_LABEL_KEY[displayed])}</Text>
        <ChevronDownIcon width={16} height={16} color={COLORS.textSecondary} />
      </Pressable>

      {/* 페이드를 주면 항목을 누른 뒤 메뉴가 사라질 때까지 남아 보인다 */}
      <Modal
        visible={anchor !== null}
        transparent
        animationType="none"
        onRequestClose={closeMenu}
      >
        {/* 바깥 아무 곳이나 누르면 닫힌다 */}
        <Pressable className="flex-1" onPress={closeMenu}>
          <View
            style={{
              position: 'absolute',
              top: anchor?.top ?? 0,
              right: anchor?.right ?? 0,
            }}
            className="min-w-[128px] overflow-hidden rounded-md border border-border bg-page py-xs shadow-modal"
          >
            {options.map((option) => {
              const selected = option === displayed;
              return (
                <Pressable
                  key={option}
                  onPress={() => {
                    onChange(option);
                    closeMenu();
                  }}
                  className={cn(
                    'px-lg py-md active:bg-subtle',
                    selected && 'bg-brand-subtle'
                  )}
                >
                  <Text className={selected ? 'text-link' : 'text-primary'}>
                    {t(SORT_LABEL_KEY[option])}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
