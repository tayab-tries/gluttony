import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: Number(process.env.PORT || 4000),
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  nominatimBaseUrl: process.env.NOMINATIM_BASE_URL || 'https://nominatim.openstreetmap.org',
  osrmBaseUrl: process.env.OSRM_BASE_URL || 'https://router.project-osrm.org',
};

export function requireConfig(name, value) {
  if (!value) {
    throw new Error(`Missing required config: ${name}`);
  }
  return value;
}
