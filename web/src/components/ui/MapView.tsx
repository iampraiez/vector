import React, { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Truck, Navigation } from "lucide-react";
import { renderToString } from "react-dom/server";
import { Route, RouteStop } from "../../store/routeStore";
import { Driver } from "../../store/driverStore";

import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Default to Lagos, Nigeria
const DEFAULT_CENTER: [number, number] = [6.5244, 3.3792];

interface MapViewProps {
  drivers: Driver[];
  routes?: Route[];
  selectedDriverId?: string | null;
  userLocation?: { lat: number; lng: number } | null;
  onLocationDetected?: (lat: number, lng: number) => void;
  className?: string;
}

const getDriverColor = (driverId: string | null) => {
  if (!driverId) return "#94A3B8"; // Slate-400 for unassigned routes
  // Generate a stable color from the ID
  let hash = 0;
  for (let i = 0; i < driverId.length; i++) {
    hash = driverId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 70%, 50%)`;
};

/**
 * Internal helper component to handle map movements
 */
function MapViewUpdater({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, {
      duration: 1.5,
      easeLinearity: 0.25,
    });
  }, [center, zoom, map]);
  return null;
}

/**
 * Interactive Map Component for tracking drivers
 */
const MapView: React.FC<MapViewProps> = ({
  drivers,
  routes = [],
  selectedDriverId,
  userLocation,
  onLocationDetected,
  className,
}) => {
  const [isLocating, setIsLocating] = React.useState(false);

  const handleLocateMe = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        onLocationDetected?.(latitude, longitude);
        setIsLocating(false);
      },
      (error) => {
        console.error("Error detecting location:", error);
        alert(
          "Unable to retrieve your location. Please check your permissions.",
        );
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 },
    );
  };

  const selectedDriver = useMemo(
    () => drivers.find((d) => d.id === selectedDriverId),
    [drivers, selectedDriverId],
  );

  const center: [number, number] = useMemo(() => {
    if (userLocation) return [userLocation.lat, userLocation.lng];
    if (selectedDriver?.location_lat && selectedDriver?.location_lng) {
      return [selectedDriver.location_lat, selectedDriver.location_lng];
    }
    // Fallback to first driver with coordinates
    const firstWithCoords = drivers.find(
      (d) => d.location_lat && d.location_lng,
    );
    if (firstWithCoords?.location_lat && firstWithCoords?.location_lng) {
      return [firstWithCoords.location_lat, firstWithCoords.location_lng];
    }
    return DEFAULT_CENTER;
  }, [userLocation, selectedDriver, drivers]);

  const zoom = selectedDriver || userLocation ? 15 : 12;

  // Custom marker icon using L.divIcon and Lucide icons
  const createTruckIcon = (
    isSelected: boolean,
    status: string,
    color: string,
  ) => {
    const isActive = status === "active";

    return L.divIcon({
      html: renderToString(
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "38px",
            height: "38px",
            position: "relative",
          }}
        >
          {isActive && (
            <div
              className="pulse-ring-active"
              style={{ backgroundColor: color }}
            />
          )}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "36px",
              height: "36px",
              backgroundColor: isSelected ? color : "#FFFFFF",
              color: isSelected ? "#FFFFFF" : color,
              borderRadius: "50%",
              border: `2px solid ${isSelected ? "#FFFFFF" : color}`,
              boxShadow: isSelected
                ? `0 0 0 4px ${color}33, 0 4px 6px -1px rgb(0 0 0 / 0.1)`
                : "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
              zIndex: 10,
              position: "relative",
            }}
          >
            <Truck size={20} />
          </div>
        </div>,
      ),
      className: "custom-truck-marker",
      iconSize: [38, 38],
      iconAnchor: [19, 19],
      popupAnchor: [0, -19],
    });
  };

  const createUserIcon = () => {
    return L.divIcon({
      html: renderToString(
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "36px",
            height: "36px",
            position: "relative",
          }}
        >
          <div
            className="pulse-ring-active"
            style={{ backgroundColor: "#2563EB" }}
          />
          <div
            style={{
              width: "16px",
              height: "16px",
              backgroundColor: "#2563EB",
              borderRadius: "50%",
              border: "3px solid #FFFFFF",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              zIndex: 10,
            }}
          />
        </div>,
      ),
      className: "custom-user-marker",
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });
  };

  return (
    <div
      className={`relative w-full h-full rounded-xl overflow-hidden border border-border bg-slate-50 ${className}`}
      style={{ minHeight: "400px" }}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full"
        style={{ zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapViewUpdater center={center} zoom={zoom} />

        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={createUserIcon()}
          >
            <Popup>
              <div style={{ padding: "4px", textAlign: "center" }}>
                <p
                  style={{ fontWeight: "bold", fontSize: "14px", margin: "0" }}
                >
                  Your Current Location
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Route Polylines */}
        {routes.map((route) => {
          if (!route.stops || route.stops.length === 0) return null;
          const driverColor = getDriverColor(route.driver_id);
          const points = (route.stops || [])
            .filter(
              (s: RouteStop): s is RouteStop & { lat: number; lng: number } =>
                !!(s.lat && s.lng),
            )
            .map((s) => [s.lat, s.lng] as [number, number]);

          // Also include current driver location if available
          const driver = drivers.find((d) => d.id === route.driver_id);
          if (
            driver?.location_lat &&
            driver?.location_lng &&
            route.status === "active"
          ) {
            // Logic to find closest stop or just append?
            // Better to show the path between stops.
          }

          if (points.length < 2) return null;

          return (
            <Polyline
              key={route.id}
              positions={points}
              color={driverColor}
              weight={3}
              opacity={0.6}
              dashArray={route.status === "pending" ? "10, 10" : undefined}
            />
          );
        })}

        {drivers.map((driver) => {
          if (!driver.location_lat || !driver.location_lng) return null;

          const isSelected = driver.id === selectedDriverId;
          const driverColor = getDriverColor(driver.id);

          return (
            <Marker
              key={driver.id}
              position={[driver.location_lat, driver.location_lng]}
              icon={createTruckIcon(isSelected, driver.status, driverColor)}
            >
              <Popup>
                <div style={{ minWidth: "160px", padding: "4px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "8px",
                    }}
                  >
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: driverColor,
                      }}
                    />
                    <span style={{ fontWeight: "bold", fontSize: "14px" }}>
                      {driver.name}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                      fontSize: "12px",
                      color: "#6B7280",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>Status:</span>
                      <span
                        style={{
                          color: "#111827",
                          fontWeight: 500,
                          textTransform: "capitalize",
                        }}
                      >
                        {driver.status}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>Coordinates:</span>
                      <span style={{ color: "#111827" }}>
                        {driver.location_lat.toFixed(4)},{" "}
                        {driver.location_lng.toFixed(4)}
                      </span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Locate Me Button */}
      <button
        onClick={handleLocateMe}
        disabled={isLocating}
        className="absolute bottom-6 right-6 z-400 bg-white p-3.5 rounded-2xl shadow-xl border border-black/5 hover:bg-slate-50 transition-all active:scale-95 group disabled:opacity-50"
        title="Locate Me"
      >
        <div className="relative">
          {isLocating && (
            <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping scale-150" />
          )}
          <Navigation
            className={`w-5 h-5 relative z-10 ${isLocating ? "text-blue-600" : "text-slate-500 group-hover:text-blue-600"} transition-colors`}
          />
        </div>
      </button>
    </div>
  );
};

export default MapView;
