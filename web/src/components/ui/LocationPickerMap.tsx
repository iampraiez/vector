import React, { useState, useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface LocationPickerMapProps {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
  className?: string;
  defaultCenter?: [number, number];
}

function LocationMarker({
  position,
  setPosition,
}: {
  position: L.LatLng | null;
  setPosition: (pos: L.LatLng) => void;
}) {
  const markerRef = useRef<L.Marker>(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          setPosition(marker.getLatLng());
        }
      },
    }),
    [setPosition],
  );

  return position === null ? null : (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
    />
  );
}

export const LocationPickerMap: React.FC<LocationPickerMapProps> = ({
  lat,
  lng,
  onChange,
  className = "h-48 w-full rounded-xl overflow-hidden",
  defaultCenter = [6.5244, 3.3792], // Default Lagos
}) => {
  const [position, setPosition] = useState<L.LatLng | null>(
    lat && lng ? new L.LatLng(lat, lng) : null,
  );

  // Sync internal state to parent on change
  useEffect(() => {
    if (position) {
      onChange(position.lat, position.lng);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position]);

  return (
    <div className={className}>
      <MapContainer
        center={position || defaultCenter}
        zoom={position ? 15 : 11}
        scrollWheelZoom={true}
        className="h-full w-full relative z-0"
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
        <LocationMarker position={position} setPosition={setPosition} />
      </MapContainer>
    </div>
  );
};
