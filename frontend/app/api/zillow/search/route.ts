import { NextRequest, NextResponse } from "next/server";

const RAPIDAPI_KEY = process.env.ZILLOW_RAPIDAPI_KEY || "";
const RAPIDAPI_HOST = "zillow-com1.p.rapidapi.com";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const location = searchParams.get("location") || "Atlanta, GA";
  const page = searchParams.get("page") || "1";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const beds = searchParams.get("beds") || "";
  const baths = searchParams.get("baths") || "";
  const sort = searchParams.get("sort") || "newest";
  const listingType = searchParams.get("listingType") || "rent";

  if (!RAPIDAPI_KEY) {
    return NextResponse.json(
      { error: "Zillow API key not configured" },
      { status: 500 }
    );
  }

  const params = new URLSearchParams({
    location,
    page,
    sort,
    listing_type: listingType === "rent" ? "by_agent" : "by_agent",
    home_type: "Apartments",
    isForRent: "true",
  });

  if (minPrice) params.set("minPrice", minPrice);
  if (maxPrice) params.set("maxPrice", maxPrice);
  if (beds) params.set("bedsMin", beds);
  if (baths) params.set("bathsMin", baths);

  const res = await fetch(
    `https://${RAPIDAPI_HOST}/propertyExtendedSearch?${params.toString()}`,
    {
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_HOST,
      },
      next: { revalidate: 300 },
    }
  );

  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to fetch listings" },
      { status: res.status }
    );
  }

  const data = await res.json();

  // Normalize response
  const listings = (data.props || []).map((p: Record<string, unknown>) => ({
    zpid: p.zpid,
    address: p.address,
    price: p.price,
    currency: p.currency || "USD",
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    livingArea: p.livingArea,
    livingAreaUnit: "sqft",
    latitude: p.latitude,
    longitude: p.longitude,
    imgSrc: p.imgSrc,
    detailUrl: p.detailUrl ? `https://www.zillow.com${p.detailUrl}` : null,
    listingStatus: p.listingStatus,
    propertyType: p.propertyType,
    daysOnZillow: p.daysOnZillow,
  }));

  return NextResponse.json({
    results: listings,
    totalResults: data.totalResultCount || listings.length,
    totalPages: data.totalPages || 1,
    currentPage: Number(page),
  });
}
