import { useState, useEffect, useCallback } from 'react';

const AUTH_URL = 'https://functions.poehali.dev/ac29db61-49b4-43ad-9e27-2827db2c5f22';
const PROFILE_URL = 'https://functions.poehali.dev/32568107-a02f-40d5-a9a1-53648e999d42';
const TOKEN_KEY = 'nutri_session_token';

export type TgUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
};

export type UserProfile = {
  gender: string;
  age: number;
  height_cm: number;
  weight_kg: number;
  activity_factor: number;
  goal: string;
  calories_goal: number;
  protein_goal: number;
  fat_goal: number;
  carbs_goal: number;
};

export const useAuth = () => {
  const [user, setUser] = useState<TgUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const login = useCallback(async () => {
    const tg = (window as { Telegram?: { WebApp?: { initData?: string } } }).Telegram?.WebApp;
    const initData = tg?.initData || 'dev_test';

    const res = await fetch(AUTH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData }),
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      setUser(data.user);
      if (data.profile) setProfile(data.profile);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      if (token) {
        const res = await fetch(PROFILE_URL, {
          headers: { 'X-Session-Token': token },
        });
        if (res.status === 401) {
          localStorage.removeItem(TOKEN_KEY);
          setToken(null);
          await login();
        } else if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } else {
        await login();
      }
      setLoading(false);
    };
    init();
  }, []);

  const saveProfile = useCallback(async (profileData: UserProfile) => {
    if (!token) return false;
    setSaving(true);
    setSaved(false);
    const res = await fetch(PROFILE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Session-Token': token },
      body: JSON.stringify(profileData),
    });
    setSaving(false);
    if (res.ok) {
      setProfile(profileData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      return true;
    }
    return false;
  }, [token]);

  return { user, profile, token, loading, saving, saved, saveProfile };
};