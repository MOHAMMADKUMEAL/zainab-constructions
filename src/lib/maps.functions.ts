import { createServerFn } from "@tanstack/react-start";

export const geocodeAddress = createServerFn({ method: "GET" })
  .inputValidator((data: { address: string }) => {
    const address = String(data?.address ?? "").trim().slice(0, 200);
    if (!address) throw new Error("Address is required");
    return { address };
  })
  .handler(async ({ data }) => {
    const lovableKey = process.env["LOVABLE_API_KEY"];
    const mapsKey = process.env["GOOGLE_MAPS_API_KEY"];
    if (!lovableKey || !mapsKey) {
      return { lat: null as number | null, lng: null as number | null, error: "Maps not configured" };
    }

    const res = await fetch(
      `https://connector-gateway.lovable.dev/google_maps/maps/api/geocode/json?address=${encodeURIComponent(
        data.address,
      )}`,
      {
        headers: {
          Authorization: `Bearer ${lovableKey}`,
          "X-Connection-Api-Key": mapsKey,
        },
      },
    );

    if (!res.ok) {
      const body = await res.text();
      console.error(`Geocode failed [${res.status}]: ${body}`);
      return { lat: null, lng: null, error: `Geocoding failed (${res.status})` };
    }

    const json = (await res.json()) as {
      results?: { geometry?: { location?: { lat: number; lng: number } } }[];
    };
    const loc = json.results?.[0]?.geometry?.location;
    if (!loc) return { lat: null, lng: null, error: "Location not found" };
    return { lat: loc.lat, lng: loc.lng, error: null as string | null };
  });
