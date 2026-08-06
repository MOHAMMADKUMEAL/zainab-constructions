import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { geocodeAddress } from "@/lib/maps.functions";

declare global {
  interface Window {
    google?: any;
    __zcMapsReady?: boolean;
    __zcInitMaps?: () => void;
  }
}

const KEY = import.meta.env['VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY'] as string | undefined;
const CHANNEL = import.meta.env['VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID'] as string | undefined;

function loadMaps(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.__zcMapsReady) return Promise.resolve();
  return new Promise((resolve) => {
    const existing = document.getElementById("zc-google-maps");
    const prev = window.__zcInitMaps;
    window.__zcInitMaps = () => {
      window.__zcMapsReady = true;
      prev?.();
      resolve();
    };
    if (existing) return;
    const script = document.createElement("script");
    script.id = "zc-google-maps";
    script.async = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${KEY}&loading=async&callback=__zcInitMaps${
      CHANNEL ? `&channel=${CHANNEL}` : ""
    }`;
    document.head.appendChild(script);
  });
}

export function ProjectMap({ address, title }: { address: string; title: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["geocode", address],
    queryFn: () => geocodeAddress({ data: { address } }),
    enabled: Boolean(address.trim()),
    staleTime: 1000 * 60 * 60,
  });

  useEffect(() => {
    if (!KEY) return;
    let cancelled = false;
    loadMaps().then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready || !ref.current || !data?.lat || !data?.lng || !window.google) return;
    const center = { lat: data.lat, lng: data.lng };
    const map = new window.google.maps.Map(ref.current, {
      center,
      zoom: 15,
      mapTypeControl: false,
      streetViewControl: false,
    });
    new window.google.maps.Marker({ position: center, map, title });
  }, [ready, data, title]);

  if (!address.trim()) {
    return (
      <Card className="rounded-2xl shadow-card">
        <CardContent className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" /> Add a location to this project to see it on the map.
        </CardContent>
      </Card>
    );
  }

  if (isLoading || (!data && KEY)) return <Skeleton className="h-72 rounded-2xl" />;

  if (!KEY || !data?.lat) {
    return (
      <Card className="rounded-2xl shadow-card">
        <CardContent className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" /> {data?.error ?? "Map unavailable"} — {address}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden rounded-2xl shadow-card">
      <CardContent className="p-0">
        <div ref={ref} className="h-72 w-full" aria-label={`Map of ${address}`} />
      </CardContent>
    </Card>
  );
}
