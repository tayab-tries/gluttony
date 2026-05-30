export function calculateDeliveryPricing({ distanceKm, stopCount }) {
  const baseFee = 2.49;
  const distanceFee = distanceKm * 0.9;
  const multiStopFee = Math.max(0, stopCount - 1) * 0.8;
  const serviceFee = 0.99;
  const deliveryFee = roundMoney(baseFee + distanceFee + multiStopFee);

  return {
    distanceKm: roundMoney(distanceKm),
    stopCount,
    deliveryFee,
    serviceFee,
    etaMinutes: Math.max(15, Math.round(12 + distanceKm * 4.5 + Math.max(0, stopCount - 1) * 6)),
  };
}

function roundMoney(value) {
  return Math.round(value * 100) / 100;
}
