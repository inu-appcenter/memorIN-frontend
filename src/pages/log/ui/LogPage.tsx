import { ScrollView, View } from 'react-native';
import { useBreakpoints } from '@/shared/lib/useBreakpoints';
import { CalendarGrid } from '@/widgets/calendarGrid';
import { DayDetailPanel } from '@/widgets/dayDetailPanel';

export function LogPage() {
  const { device } = useBreakpoints();
  return (
    <View className="flex-1 bg-page desktop:flex-row">
      <ScrollView className="flex-1">
        <CalendarGrid />
      </ScrollView>
      {device === 'desktop' && <DayDetailPanel />}
    </View>
  );
}
