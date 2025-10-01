import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getEvent } from "@/lib/data";

const HMAC_SECRET_KEY = process.env.HMAC_SECRET_KEY || "super-secret-key-for-swiftcheck-demo";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const eventNumber = searchParams.get("eventNumber");
  const ticketNumber = searchParams.get("ticketNumber");

  if (!eventNumber || !ticketNumber) {
    return NextResponse.json(
      { error: "eventNumber and ticketNumber are required" },
      { status: 400 }
    );
  }
  
  const currentEvent = await getEvent();
  if (!currentEvent || currentEvent.id.toString() !== eventNumber) {
    return NextResponse.json(
      { error: "Event number does not match current event" },
      { status: 400 }
    );
  }

  const timestamp = Date.now().toString();
  const dataToSign = `${eventNumber}:${ticketNumber}:${timestamp}`;
  const hmac = crypto
    .createHmac("sha256", HMAC_SECRET_KEY)
    .update(dataToSign)
    .digest("hex");
  
  const qrData = `${dataToSign}:${hmac}`;

  const displayUrl = new URL('/display-qr', request.url);
  displayUrl.searchParams.set('data', qrData);
  displayUrl.searchParams.set('eventName', currentEvent.name);
  displayUrl.searchParams.set('ticketNumber', ticketNumber);

  return NextResponse.json({ qrCodeUrl: displayUrl.toString() });
}
