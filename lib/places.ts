export interface PlaceReview {
  author: string;
  rating: number;
  text: string;
  relativeTime: string;
}

export interface PlaceInfo {
  rating?: number;
  userRatingsTotal?: number;
  openNow?: boolean;
  hours?: string[];
  reviews?: PlaceReview[];
  popularity?: number;
}

export function placesEnabled(): boolean {
  return Boolean(process.env.GOOGLE_PLACES_API_KEY);
}

export async function getPlaceInfo(
  nombre: string,
  lat: number,
  lon: number,
): Promise<PlaceInfo | null> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) return null;

  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": [
        "places.rating",
        "places.userRatingCount",
        "places.currentOpeningHours.openNow",
        "places.regularOpeningHours.weekdayDescriptions",
        "places.reviews",
      ].join(","),
    },
    body: JSON.stringify({
      textQuery: `${nombre}, Rosario, Santa Fe`,
      languageCode: "es",
      maxResultCount: 1,
      locationBias: {
        circle: { center: { latitude: lat, longitude: lon }, radius: 3000 },
      },
    }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  const place = data.places?.[0];
  if (!place) return null;

  const rating: number | undefined = place.rating;
  const total: number | undefined = place.userRatingCount;
  const popularity =
    rating && total
      ? Math.min(100, Math.round((rating / 5) * 60 + Math.min(total, 4000) / 100))
      : undefined;

  const reviews: PlaceReview[] = (place.reviews ?? []).slice(0, 3).map(
    (r: {
      authorAttribution?: { displayName?: string };
      rating?: number;
      text?: { text?: string };
      relativePublishTimeDescription?: string;
    }) => ({
      author: r.authorAttribution?.displayName ?? "Anónimo",
      rating: r.rating ?? 0,
      text: r.text?.text ?? "",
      relativeTime: r.relativePublishTimeDescription ?? "",
    }),
  );

  return {
    rating,
    userRatingsTotal: total,
    openNow: place.currentOpeningHours?.openNow,
    hours: place.regularOpeningHours?.weekdayDescriptions,
    reviews,
    popularity,
  };
}
