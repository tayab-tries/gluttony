import React from 'react';
import { MapPin } from 'lucide-react';
import { buildMapEmbedUrl } from '../lib/delivery';

const PIN_STYLES = {
  restaurant: 'bg-orange-500/90 text-white',
  driver: 'bg-primary/90 text-primary-foreground',
  customer: 'bg-emerald-500/90 text-white',
};

const PIN_LABELS = {
  restaurant: 'Pickup',
  driver: 'Driver',
  customer: 'Dropoff',
};

export default function DeliveryMapCard({ points = [], etaLabel, addressLabel }) {
  const mapUrl = buildMapEmbedUrl(points);

  return (
    <div className="rounded-2xl overflow-hidden h-48 relative bg-secondary border border-border">
      {mapUrl ? (
        <iframe
          title="Delivery map"
          src={mapUrl}
          className="w-full h-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-center px-6">
          <div>
            <div className="text-4xl mb-2">🗺️</div>
            <p className="text-muted-foreground text-xs">Add location details to unlock live delivery mapping.</p>
          </div>
        </div>
      )}

      <div className="absolute inset-x-3 top-3 flex flex-wrap gap-2 pointer-events-none">
        {points.map(point => (
          <span
            key={point.id}
            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold backdrop-blur ${PIN_STYLES[point.type] || PIN_STYLES.customer}`}
          >
            {PIN_LABELS[point.type] || point.type}
          </span>
        ))}
      </div>

      <div className="absolute bottom-3 left-3 right-3 bg-card/90 backdrop-blur rounded-xl px-3 py-2 flex items-center gap-2">
        <MapPin size={14} className="text-primary flex-shrink-0" />
        <p className="text-white text-xs truncate">{addressLabel}</p>
        {etaLabel ? <span className="text-primary text-xs font-semibold ml-auto flex-shrink-0">{etaLabel}</span> : null}
      </div>
    </div>
  );
}
