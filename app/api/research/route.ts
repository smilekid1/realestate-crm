import { NextRequest } from "next/server";

const RENTCAST_KEY = process.env.RENTCAST_API_KEY;
const BASE = "https://api.rentcast.io/v1";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address");
  const city = searchParams.get("city") || "Cleveland";
  const state = searchParams.get("state") || "OH";

  if (!address) {
    return Response.json({ error: "Address required" }, { status: 400 });
  }

  if (!RENTCAST_KEY) {
    return Response.json({
      error: "RENTCAST_API_KEY not configured",
      mock: true,
      data: getMockData(address, city),
    });
  }

  const zip = searchParams.get("zip") || "";

  try {
    // Properties endpoint uses separate params
    const propParams = new URLSearchParams({ address, city, state, limit: "1" });
    if (zip) propParams.set("zipCode", zip);

    // Value estimate requires full address as one string: "Street, City, State, Zip"
    const fullAddress = [address, city, state, zip].filter(Boolean).join(", ");
    const avmParams = new URLSearchParams({ address: fullAddress, compCount: "5" });

    const [propRes, avmRes] = await Promise.all([
      fetch(`${BASE}/properties?${propParams}`, {
        headers: { "X-Api-Key": RENTCAST_KEY },
      }),
      fetch(`${BASE}/avm/value?${avmParams}`, {
        headers: { "X-Api-Key": RENTCAST_KEY },
      }),
    ]);

    const propText = await propRes.text();
    const avmText = await avmRes.text();

    console.log("RentCast property:", propRes.status, propText.slice(0, 300));
    console.log("RentCast AVM:", avmRes.status, avmText.slice(0, 300));

    const propParsed = propRes.ok ? JSON.parse(propText) : null;
    const property = Array.isArray(propParsed) ? propParsed[0] ?? null : propParsed;
    const avm = avmRes.ok ? JSON.parse(avmText) : null;

    if (!property && !avm) {
      return Response.json({
        error: `RentCast: property=${propRes.status}, avm=${avmRes.status}`,
        propBody: propText.slice(0, 200),
        avmBody: avmText.slice(0, 200),
      }, { status: 502 });
    }

    // Normalize avm response to match what the UI expects
    const comps = avm ? {
      price: avm.price,
      priceRangeLow: avm.priceRangeLow,
      priceRangeHigh: avm.priceRangeHigh,
      comparables: avm.comparables ?? [],
    } : null;

    return Response.json({ property, comps });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}

function getMockData(address: string, city: string) {
  return {
    property: {
      address,
      city,
      state: "OH",
      bedrooms: 3,
      bathrooms: 1.5,
      squareFootage: 1400,
      yearBuilt: 1968,
      estimatedValue: 142000,
    },
    comps: {
      price: 148000,
      priceRangeLow: 130000,
      priceRangeHigh: 165000,
      comparables: [
        { address: "123 Nearby St", price: 145000, squareFootage: 1380, daysOld: 18 },
        { address: "456 Sample Ave", price: 152000, squareFootage: 1450, daysOld: 32 },
        { address: "789 Example Blvd", price: 141000, squareFootage: 1360, daysOld: 45 },
      ],
    },
  };
}
