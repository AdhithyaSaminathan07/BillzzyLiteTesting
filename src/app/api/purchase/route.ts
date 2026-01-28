import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Purchase from "@/models/purchase";

// ✅ GET all purchases for the tenant
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const tenantId = session?.user?.email;

    // Protect the route: ensure the user is authenticated
    if (!tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const purchases = await Purchase.find({ tenantId }).sort({ createdAt: -1 });
    return NextResponse.json(purchases);
  } catch {
    return NextResponse.json({ error: "Failed to fetch purchases" }, { status: 500 });
  }
}

// ✅ POST new purchase for the tenant
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const tenantId = session?.user?.email;

    // Protect the route: ensure the user is authenticated
    if (!tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    const newPurchase = await Purchase.create({ ...body, tenantId });
    return NextResponse.json(newPurchase);
  } catch {
    return NextResponse.json({ error: "Failed to create purchase" }, { status: 500 });
  }
}