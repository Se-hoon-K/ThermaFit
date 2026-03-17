import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { UserPreferences, DEFAULT_PREFERENCES } from '../types/preferences';
import { loadPreferences, savePreferences } from '../storage/preferencesStorage';

interface PreferencesContextValue {
  prefs: UserPreferences;
  setPrefs: (prefs: UserPreferences) => Promise<void>;
  loaded: boolean;
}

const PreferencesContext = createContext<PreferencesContextValue>({
  prefs: DEFAULT_PREFERENCES,
  setPrefs: async () => {},
  loaded: false,
});

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefsState] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadPreferences().then((p) => {
      setPrefsState(p);
      setLoaded(true);
    });
  }, []);

  const setPrefs = useCallback(async (newPrefs: UserPreferences) => {
    setPrefsState(newPrefs);
    await savePreferences(newPrefs);
  }, []);

  return (
    <PreferencesContext.Provider value={{ prefs, setPrefs, loaded }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  return useContext(PreferencesContext);
}
