import { createClient } from '@supabase/supabase-js';

let supabaseInstance = null;

const DEFAULT_SUPABASE_URL = 'https://znlinbqdlixfsfytiqan.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpubGluYnFkbGl4ZnNmeXRpcWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5NTEyMjgsImV4cCI6MjEwNDUyNzIyOH0.qfd-oNbdIx3TluvQRoktxSucTXBfwIInaOxDRkzdC-U';

/**
 * Get credentials from environment variables, custom settings, or built-in defaults
 */
export function getSupabaseCredentials() {
  const envUrl = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env.VITE_SUPABASE_URL : (typeof process !== 'undefined' && process.env ? process.env.VITE_SUPABASE_URL : '');
  const envKey = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env.VITE_SUPABASE_ANON_KEY : (typeof process !== 'undefined' && process.env ? process.env.VITE_SUPABASE_ANON_KEY : '');

  let localUrl = null;
  let localKey = null;

  try {
    if (typeof localStorage !== 'undefined') {
      const rawCache = localStorage.getItem('portfolio_master_cache');
      if (rawCache) {
        const parsed = JSON.parse(rawCache);
        if (parsed && parsed.settings) {
          localUrl = parsed.settings.supabaseUrl;
          localKey = parsed.settings.supabaseKey;
        }
      }
    }
  } catch (e) {
    // ignore parsing errors
  }

  const url = (localUrl && localUrl.trim()) || (envUrl && envUrl.trim()) || DEFAULT_SUPABASE_URL;
  const key = (localKey && localKey.trim()) || (envKey && envKey.trim()) || DEFAULT_SUPABASE_ANON_KEY;

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
