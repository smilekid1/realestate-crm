import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
  }

  const lead = await req.json();

  const prompt = `You are a real estate wholesaling coach. Generate a friendly, confident, conversational phone call script for a real estate investor in Cleveland, Ohio.

LEAD DETAILS:
- Owner Name: ${lead.ownerName}
- Property: ${lead.address}, ${lead.city}, ${lead.state}
- Their Asking Price: ${lead.askingPrice ? "$" + lead.askingPrice.toLocaleString() : "Unknown"}
- Motivation: ${lead.motivation || "Unknown"}
- Property Condition: ${lead.condition || "Unknown"}
- Timeline to Sell: ${lead.timeline || "Unknown"}
- Estimated ARV: ${lead.arv ? "$" + lead.arv.toLocaleString() : "Unknown"}
- Our Max Offer: ${lead.maxOffer ? "$" + lead.maxOffer.toLocaleString() : "Unknown"}
- Our Planned Offer: ${lead.ourOffer ? "$" + lead.ourOffer.toLocaleString() : "Unknown"}

Write a script that:
1. Opens warmly and builds rapport
2. Re-establishes why they want to sell (pain point)
3. Gently asks about the property condition and timeline
4. Presents our cash offer confidently but without pressure
5. Handles common objections (price too low, need to think about it, talking to other buyers)
6. Has a clear close — either schedule a walkthrough or get a verbal yes

Format it with clearly labeled sections: OPENING, RAPPORT, DISCOVERY, OFFER, OBJECTION HANDLERS, CLOSE.
Keep the tone natural — this investor is real and human, not a robot salesman. Short sentences. Conversational.`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1500,
    messages: [{ role: "user", content: prompt }],
  });

  const script = message.content[0].type === "text" ? message.content[0].text : "";
  return Response.json({ script });
}
