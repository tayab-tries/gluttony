import { Router } from 'express';
import { getSupabaseAdmin } from '../services/supabase.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { customerEmail, driverEmail, restaurantId, status } = req.query;
    const supabase = getSupabaseAdmin();
    let query = supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false });

    if (customerEmail) query = query.eq('customer_email', customerEmail);
    if (driverEmail) query = query.eq('driver_email', driverEmail);
    if (restaurantId) query = query.contains('restaurant_ids', [restaurantId]);
    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;

    res.json({ orders: normalizeOrders(data || []) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    res.json({ order: normalizeOrder(data) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const orderInput = req.body || {};
    const supabase = getSupabaseAdmin();

    const orderPayload = {
      customer_id: orderInput.customerId || null,
      customer_email: orderInput.customerEmail,
      driver_email: orderInput.driverEmail || null,
      status: orderInput.status || 'pending',
      restaurants: orderInput.restaurants || [],
      restaurant_ids: orderInput.restaurantIds || [],
      subtotal_price: orderInput.subtotalPrice || 0,
      delivery_fee: orderInput.deliveryFee || 0,
      service_fee: orderInput.serviceFee || 0,
      total_price: orderInput.totalPrice || 0,
      delivery_address: orderInput.deliveryAddress || '',
      customer_location: orderInput.customerLocation || null,
      restaurant_locations: orderInput.restaurantLocations || [],
      estimated_delivery: orderInput.estimatedDelivery || null,
      distance_km: orderInput.distanceKm || null,
      route_stops: orderInput.routeStops || 1,
      driver_name: orderInput.driverName || null,
      driver_location: orderInput.driverLocation || null,
    };

    const { data: orderRow, error: orderError } = await supabase
      .from('orders')
      .insert(orderPayload)
      .select('*')
      .single();

    if (orderError) throw orderError;

    const itemsPayload = (orderInput.items || []).map(item => ({
      order_id: orderRow.id,
      menu_item_id: item.menu_item_id,
      menu_item_name: item.menu_item_name,
      restaurant_id: item.restaurant_id,
      restaurant_name: item.restaurant_name,
      price: item.price,
      quantity: item.quantity,
      image_url: item.image_url || null,
    }));

    if (itemsPayload.length > 0) {
      const { error: itemsError } = await supabase.from('order_items').insert(itemsPayload);
      if (itemsError) throw itemsError;
    }

    res.status(201).json({
      order: normalizeOrder({
        ...orderRow,
        order_items: itemsPayload,
      }),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:id/status', async (req, res) => {
  try {
    const updates = {};
    if (req.body?.status) updates.status = req.body.status;
    if (req.body?.driverEmail !== undefined) updates.driver_email = req.body.driverEmail;
    if (req.body?.driverName !== undefined) updates.driver_name = req.body.driverName;
    if (req.body?.driverLocation !== undefined) updates.driver_location = req.body.driverLocation;

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', req.params.id)
      .select('*, order_items(*)')
      .single();

    if (error) throw error;
    res.json({ order: normalizeOrder(data) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function normalizeOrders(rows) {
  return rows.map(normalizeOrder);
}

function normalizeOrder(row) {
  return {
    id: row.id,
    customer_email: row.customer_email,
    driver_email: row.driver_email,
    driver_name: row.driver_name,
    driver_location: row.driver_location,
    items: (row.order_items || []).map(item => ({
      menu_item_id: item.menu_item_id,
      menu_item_name: item.menu_item_name,
      restaurant_id: item.restaurant_id,
      restaurant_name: item.restaurant_name,
      price: item.price,
      quantity: item.quantity,
      image_url: item.image_url,
    })),
    total_price: row.total_price,
    subtotal_price: row.subtotal_price,
    delivery_fee: row.delivery_fee,
    service_fee: row.service_fee,
    delivery_address: row.delivery_address,
    customer_location: row.customer_location,
    restaurant_locations: row.restaurant_locations || [],
    status: row.status,
    restaurants: row.restaurants || [],
    estimated_delivery: row.estimated_delivery,
    distance_km: row.distance_km,
    route_stops: row.route_stops,
    created_at: row.created_at,
  };
}

export default router;
