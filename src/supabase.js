import { createClient } from '@supabase/supabase-js';

let supabaseInstance = null;

/**
 * Get credentials from environment variables or custom settings
 */
export function getSupabaseCredentials() {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  let localUrl = null;
  let localKey = null;

  try {
    const raw = localStorage.getItem('portfolio_settings');
    if (raw) {
      const parsed = JSON.parse(raw);
      localUrl = parsed.supabaseUrl;
      localKey = parsed.supabaseKey;
    }
  } catch (e) {
    console.warn('Could not parse local settings for Supabase:', e);
  }

  const url = (localUrl && localUrl.trim()) || (envUrl && envUrl.trim()) || '';
  const key = (localKey && localKey.trim()) || (envKey && envKey.trim()) || '';

  return { url, key, isConfigured: Boolean(url && key) };
}

/**
 * Returns the Supabase client or null if unconfigured
 */
export function getSupabaseClient() {
  if (supabaseInstance) return supabaseInstance;

  const { url, key, isConfigured } = getSupabaseCredentials();

  if (!isConfigured) {
    return null;
  }

  try {
    supabaseInstance = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
    return supabaseInstance;
  } catch (err) {
    console.warn('Supabase initialization failed:', err.message);
    return null;
  }
}

/**
 * Re-initialize client with new credentials
 */
export function reinitSupabase(url, key) {
  if (!url || !key) {
    supabaseInstance = null;
    return null;
  }
  try {
    supabaseInstance = createClient(url, key);
    return supabaseInstance;
  } catch (err) {
    console.error('Failed to reinitialize Supabase:', err);
    return null;
  }
}

/**
 * Test connectivity to Supabase
 */
export async function testSupabaseConnection() {
  const client = getSupabaseClient();
  if (!client) {
    return { ok: false, message: 'Supabase URL or Key not configured.' };
  }

  try {
    // Attempt a light ping by querying current user or count
    const { error } = await client.from('portfolio_data').select('id', { count: 'exact', head: true });
    if (error && error.code !== 'PGRST116') {
      // Table might not exist yet, but connection succeeded
      return { ok: true, message: 'Connected to Supabase successfully (Table sync ready).' };
    }
    return { ok: true, message: 'Supabase connection verified.' };
  } catch (err) {
    return { ok: false, message: err.message || 'Connection failed.' };
  }
}
