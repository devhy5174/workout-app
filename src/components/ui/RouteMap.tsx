import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";

export type RoutePoint = { lat: number; lng: number; timestamp: number };

interface RouteMapProps {
  points: RoutePoint[];
  small?: boolean;
  className?: string;
}

// 점이 너무 많으면 균등 샘플링 (렌더링 성능)
function downsample(pts: RoutePoint[], max: number): RoutePoint[] {
  if (pts.length <= max) return pts;
  const result: RoutePoint[] = [pts[0]];
  const step = (pts.length - 1) / (max - 2);
  for (let i = 1; i < max - 1; i++) {
    result.push(pts[Math.round(i * step)]);
  }
  result.push(pts[pts.length - 1]);
  return result;
}

export default function RouteMap({ points, small = false, className = "" }: RouteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!containerRef.current || points.length < 2) return;

    let destroyed = false;

    import("leaflet")
      .then((L) => {
        if (destroyed || !containerRef.current) return;

        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }

        const primaryColor =
          getComputedStyle(document.documentElement)
            .getPropertyValue("--color-primary")
            .trim() || "#FF5733";

        const map = L.map(containerRef.current, {
          zoomControl: !small,
          dragging: !small,
          touchZoom: !small,
          doubleClickZoom: false,
          scrollWheelZoom: false,
          attributionControl: !small,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap",
          maxZoom: 19,
        }).addTo(map);

        const sampled = downsample(points, 300);
        const latlngs = sampled.map((p) => [p.lat, p.lng] as [number, number]);

        const polyline = L.polyline(latlngs, {
          color: primaryColor,
          weight: small ? 3 : 5,
          opacity: 0.9,
          lineJoin: "round",
        }).addTo(map);

        // 출발점 — 초록
        L.circleMarker(latlngs[0], {
          radius: small ? 5 : 8,
          fillColor: "#22c55e",
          fillOpacity: 1,
          color: "white",
          weight: 2,
        }).addTo(map);

        // 도착점 — 테마 색
        L.circleMarker(latlngs[latlngs.length - 1], {
          radius: small ? 5 : 8,
          fillColor: primaryColor,
          fillOpacity: 1,
          color: "white",
          weight: 2,
        }).addTo(map);

        map.fitBounds(polyline.getBounds(), {
          padding: [small ? 16 : 40, small ? 16 : 40],
        });

        mapRef.current = map;
      })
      .catch(() => {
        if (!destroyed) setFailed(true);
      });

    return () => {
      destroyed = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [points, small]);

  if (points.length < 2 || failed) return null;

  return (
    <div
      ref={containerRef}
      className={`w-full rounded-2xl overflow-hidden ${className}`}
      style={{ height: small ? "180px" : "280px" }}
    />
  );
}
