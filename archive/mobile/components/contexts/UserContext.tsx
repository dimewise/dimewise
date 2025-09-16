import { eq } from 'drizzle-orm';
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { db } from '../../db/drizzle';
import { type User, type UserSetting, user, userSetting } from '../../db/schema';
import i18n from '../../utils/i18n';

type UserContextType = {
  user: User | null;
  userSetting: UserSetting | null;
  refreshUser: () => Promise<void>;
  loading: boolean;
  error: string | null;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: PropsWithChildren) => {
  const [userObj, setUserObj] = useState<User | null>(null);
  const [setting, setSetting] = useState<UserSetting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user and settings
  const fetchUserAndSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Get the first user (customize as needed for your auth)
      const foundUser = db.select().from(user).limit(1).get();
      setUserObj(foundUser ?? null);

      // Fetch user settings if user exists
      if (foundUser?.id) {
        const foundSetting = db
          .select()
          .from(userSetting)
          .where(eq(userSetting.userId, foundUser.id))
          .limit(1)
          .get();
        setSetting(foundSetting ?? null);

        // Sync i18n language with user's preferred language
        if (foundSetting?.preferredLanguage && i18n.language !== foundSetting.preferredLanguage) {
          await i18n.changeLanguage(foundSetting.preferredLanguage);
        }
      } else {
        setSetting(null);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load user');
      setUserObj(null);
      setSetting(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserAndSettings();
  }, [fetchUserAndSettings]);

  return (
    <UserContext.Provider
      value={{
        user: userObj,
        userSetting: setting,
        refreshUser: fetchUserAndSettings,
        loading,
        error,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return ctx;
}
