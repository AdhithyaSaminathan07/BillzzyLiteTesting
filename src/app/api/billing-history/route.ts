import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import dbConnect from "@/lib/mongodb";
import Sales from "@/models/Sales";
import { authOptions } from "@/lib/auth";

// This file handles requests to: /api/billing-history
export async function GET(req: Request) {
  // ... your existing GET logic here
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const startDate = from ? new Date(from) : new Date();
    startDate.setHours(0, 0, 0, 0);
    const endDate = to ? new Date(to) : new Date();
    endDate.setHours(23, 59, 59, 999);

    const bills = await Sales.find({
      tenantId: session.user.email,
      createdAt: { $gte: startDate, $lte: endDate },
    }).sort({ createdAt: -1 });

    return NextResponse.json(bills);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}