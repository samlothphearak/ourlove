// components/LocationPickerMap.tsx
"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default Leaflet marker icon issue in Next.js / React
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface MapProps {
  locationName: string;
  onSelectLocation: (address: string, lat: number, lng: number) => void;
}

// Sub-component to sync map view center when coordinates change
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 14, { animate: true });
  }, [center, map]);
  return null;
}

// Click listener to handle reverse geocoding on map click
function MapClickHandler({
  onLocationFound,
}: {
  onLocationFound: (address: string, lat: number, lng: number) => void;
}) {
  useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng;
      try {
        // Reverse Geocoding using free OpenStreetMap Nominatim API
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
        );
        const data = await res.json();
        const address =
          data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        onLocationFound(address, lat, lng);
      } catch (err) {
        onLocationFound(`${lat.toFixed(4)}, ${lng.toFixed(4)}`, lat, lng);
      }
    },
  });
  return null;
}

export default function LocationPickerMap({
  locationName,
  onSelectLocation,
}: MapProps) {
  // Default coordinates (Phnom Penh center)
  const [position, setPosition] = useState<[number, number]>([11.5564, 104.9282]);

  const handleLocationUpdate = (address: string, lat: number, lng: number) => {
    setPosition([lat, lng]);
    onSelectLocation(address, lat, lng);
  };

  return (
    <div className="w-full h-44 rounded-2xl overflow-hidden border border-rose-200 shadow-inner mt-2">
      <MapContainer
        center={position}
        zoom={12}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <ChangeView center={position} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} icon={markerIcon} />
        <MapClickHandler onLocationFound={handleLocationUpdate} />
      </MapContainer>
    </div>
  );
}