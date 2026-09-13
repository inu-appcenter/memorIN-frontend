import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SEARCH_HISTORY_KEY = 'memorin.search.recent';
const MAX_ENTRIES = 10;

// 최근 검색어는 백엔드에 저장하는 API가 없다. languageStorage와 같은 패턴으로
// 기기에만 남긴다.
async function read(): Promise<string[]> {
  const raw =
    Platform.OS === 'web'
      ? localStorage.getItem(SEARCH_HISTORY_KEY)
      : await AsyncStorage.getItem(SEARCH_HISTORY_KEY);

  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === 'string')
      : [];
  } catch {
    return [];
  }
}

async function write(entries: string[]): Promise<void> {
  const raw = JSON.stringify(entries);
  if (Platform.OS === 'web') {
    localStorage.setItem(SEARCH_HISTORY_KEY, raw);
    return;
  }
  await AsyncStorage.setItem(SEARCH_HISTORY_KEY, raw);
}

export const searchHistoryStorage = {
  get: read,

  async add(keyword: string): Promise<string[]> {
    const trimmed = keyword.trim();
    if (!trimmed) return read();

    const previous = await read();
    // 같은 검색어를 다시 치면 맨 앞으로 올린다.
    const next = [trimmed, ...previous.filter((v) => v !== trimmed)].slice(
      0,
      MAX_ENTRIES
    );
    await write(next);
    return next;
  },

  async remove(keyword: string): Promise<string[]> {
    const next = (await read()).filter((v) => v !== keyword);
    await write(next);
    return next;
  },

  async clear(): Promise<void> {
    await write([]);
  },
};
