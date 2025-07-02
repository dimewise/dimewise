import { eq, sql } from "drizzle-orm";
import * as Crypto from "expo-crypto";
import { db } from "../drizzle";
import { userSetting } from "../schema";
import type { UserSetting, CurrencyType, LanguageType } from "../schema";

export const getUserSettingByUserId = (userId: string) => {
  return db
    .select()
    .from(userSetting)
    .where(eq(userSetting.userId, userId))
    .get();
};

export const createUserSetting = (settingData: Omit<UserSetting, 'id' | 'createdAt' | 'updatedAt'>) => {
  const id = Crypto.randomUUID();
  return db
    .insert(userSetting)
    .values({
      id,
      ...settingData,
    })
    .returning()
    .get();
};

export const updateUserSetting = (userId: string, updates: {
  currency?: CurrencyType;
  preferredLanguage?: LanguageType;
}) => {
  return db
    .update(userSetting)
    .set({
      ...updates,
      updatedAt: sql`CURRENT_TIMESTAMP`,
    })
    .where(eq(userSetting.userId, userId))
    .returning()
    .get();
};

export const upsertUserSetting = async (userId: string, settingData: {
  currency: CurrencyType;
  preferredLanguage?: LanguageType;
}) => {
  // First try to update
  const existingSetting = getUserSettingByUserId(userId);

  if (existingSetting) {
    return updateUserSetting(userId, settingData);
  } else {
    return createUserSetting({
      userId,
      currency: settingData.currency,
      preferredLanguage: settingData.preferredLanguage || 'en',
    });
  }
}; 