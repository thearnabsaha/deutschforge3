/**
 * Unified storage wrapper — uses expo-secure-store (available in Expo Go SDK 53+)
 * Falls back to in-memory if unavailable.
 */
import * as SecureStore from "expo-secure-store";

const memCache: Record<string, string> = {};

export const Storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      const val = await SecureStore.getItemAsync(key);
      return val ?? null;
    } catch {
      return memCache[key] ?? null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      memCache[key] = value;
    }
    memCache[key] = value; // keep in-memory cache in sync
  },
  async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {}
    delete memCache[key];
  },
};
