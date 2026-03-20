import React, { useState, useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import {
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  MapPinIcon,
  ChevronLeftIcon,
} from "@heroicons/react/24/outline";

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
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sync internal state to parent on change
  useEffect(() => {
    if (position) {
      onChange(position.lat, position.lng);
    }
  }, [position, onChange]);

  // Handle Escape key to exit fullscreen
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsFullscreen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // Dispatch resize event when toggling fullscreen to fix Leaflet gray tiles
  useEffect(() => {
    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 100);
  }, [isFullscreen]);

  const mapContent = (
    <div className="h-full w-full relative">
      <MapContainer
        center={position || defaultCenter}
        zoom={position ? 15 : 11}
        scrollWheelZoom={true}
        className="h-full w-full relative z-0"
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
        <LocationMarker position={position} setPosition={setPosition} />
      </MapContainer>

      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsFullscreen(!isFullscreen);
        }}
        className="absolute top-3 right-3 z-1000 p-2.5 bg-white/95 backdrop-blur-md border border-black/8 rounded-xl shadow-xl hover:bg-white hover:text-emerald-600 transition-all cursor-pointer group active:scale-95"
        title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Mode"}
      >
        {isFullscreen ? (
          <ArrowsPointingInIcon className="w-5 h-5 text-gray-500 group-hover:text-emerald-600" />
        ) : (
          <ArrowsPointingOutIcon className="w-4 h-4 text-gray-400 group-hover:text-emerald-600" />
        )}
      </button>
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-9999 bg-white flex flex-col animate-in fade-in duration-300">
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsFullscreen(false)}
              className="p-2 hover:bg-gray-50 rounded-xl border border-black/5 transition-colors cursor-pointer group"
            >
              <ChevronLeftIcon className="w-5 h-5 text-gray-400 group-hover:text-emerald-600" />
            </button>
            <h3 className="text-[15px] font-bold text-gray-800 tracking-tight flex items-center gap-2">
              <MapPinIcon className="w-4 h-4 text-emerald-600" />
              Delivery Location
            </h3>
          </div>
          <div className="hidden sm:block">
            <p className="text-[11px] text-gray-400 font-medium tracking-wide bg-gray-50 px-3 py-1 rounded-lg border border-black/5">
              Press{" "}
              <span className="text-emerald-600 font-bold uppercase">Esc</span>{" "}
              to return
            </p>
          </div>
        </div>
        <div className="flex-1 relative">{mapContent}</div>
      </div>
    );
  }

  return <div className={className}>{mapContent}</div>;
};
