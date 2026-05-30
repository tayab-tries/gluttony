import { Router } from 'express';
import { getSupabaseAdmin } from '../services/supabase.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .order('name');

    if (error) throw error;
    res.json({ restaurants: data || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/menu', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('restaurant_id', req.params.id)
      .order('name');

    if (error) throw error;
    res.json({ menuItems: data || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
