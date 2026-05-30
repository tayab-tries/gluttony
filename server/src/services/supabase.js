import { createClient } from '@supabase/supabase-js';
import { config, requireConfig } from '../config.js';

let adminClient;

export function getSupabaseAdmin() {
  if (!adminClient) {
    adminClient = createClient(
      requireConfig('SUPABASE_URL', config.supabaseUrl),
      requireConfig('SUPABASE_SERVICE_ROLE_KEY', config.supabaseServiceRoleKey),
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }

  return adminClient;
}
