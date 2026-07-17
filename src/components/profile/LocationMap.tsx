"use client";

import { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface LocationMapProps {
  latitude: number;
  longitude: number;
  draggable?: boolean;
  onDragEnd: (lat: number, lng: number) => void;
}

function MapRecenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom(), { animate: true });
  }, [lat, lng, map]);
  return null;
}

export default function LocationMap({
  latitude,
  longitude,
  draggable = true,
  onDragEnd,
}: LocationMapProps) {
  const position = useMemo(
    () => [latitude, longitude] as [number, number],
    [latitude, longitude]
  );

  return (
    <MapContainer
      center={position}
      zoom={16}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapRecenter lat={latitude} lng={longitude} />
      <Marker
        position={position}
        icon={defaultIcon}
        draggable={draggable}
        eventHandlers={{
          dragend: (event) => {
            const marker = event.target as L.Marker;
            const { lat, lng } = marker.getLatLng();
            onDragEnd(lat, lng);
          },
        }}
      />
    </MapContainer>
  );
}
