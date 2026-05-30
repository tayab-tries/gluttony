import { Router } from 'express';
import { geocodeAddress } from '../services/geocoding.js';
import { calculateDeliveryPricing } from '../services/deliveryPricing.js';
import { getRouteSummary } from '../services/routing.js';

const router = Router();

router.post('/geocode', async (req, res) => {
  try {
    const { address } = req.body || {};
    if (!address) {
      return res.status(400).json({ error: 'Address is required.' });
    }

    const result = await geocodeAddress(address);
    if (!result) {
      return res.status(404).json({ error: 'Address not found.' });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/quote', async (req, res) => {
  try {
    const { pickupPoints = [], dropoffPoint } = req.body || {};

    if (
      !Array.isArray(pickupPoints) ||
      pickupPoints.length === 0 ||
      typeof dropoffPoint?.lat !== 'number' ||
      typeof dropoffPoint?.lng !== 'number'
    ) {
      return res.status(400).json({ error: 'Pickup points and dropoff point are required.' });
    }

    const routePoints = [...pickupPoints, dropoffPoint];
    const route = await getRouteSummary(routePoints);
    const pricing = calculateDeliveryPricing({
      distanceKm: route.distanceKm,
      stopCount: pickupPoints.length,
    });

    res.json({
      ...pricing,
      route,
      etaLabel: `${pricing.etaMinutes}-${pricing.etaMinutes + 8} min`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
