// // src/app/api/analytics/sales-chart/route.ts
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Sale from "@/models/Sales"; // Importing 'Sale' to match your model export
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { startOfDay, subDays, subMonths, subYears, startOfYear } from "date-fns";

export async function GET(req: Request) {
  try {
    // 1. Get Logged-in User
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userEmail = session.user.email;

    await connectToDatabase();

    // 2. Get Date Range from Frontend
    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "1D";

    let startDate = new Date();
    let endDate = new Date(); // Default to now
    const today = new Date();

    switch (range) {
      case "1D":
        startDate = startOfDay(today);
        endDate = new Date(); // till now
        break;
      case "Yesterday":
        startDate = startOfDay(subDays(today, 1));
        endDate = startOfDay(today);
        break;
      case "7D": startDate = subDays(today, 6); break; // 6 days ago + today = 7 days
      case "1M": startDate = subMonths(today, 1); break;
      case "YTD": startDate = startOfYear(today); break;
      case "1Y": startDate = subYears(today, 1); break;
      case "5Y": startDate = subYears(today, 5); break;
      case "MAX": startDate = new Date(0); break;
      default:
        startDate = startOfDay(today);
        endDate = new Date();
    }

    // 3. Fetch Every Individual Bill
    // We filter by tenantId (email) and the date range.
    const query: { tenantId: string; createdAt: { $gte: Date; $lt?: Date } } = {
      tenantId: userEmail,
      createdAt: { $gte: startDate }
    };

    // For Yesterday, we need an upper bound (less than today start)
    if (range === "Yesterday") {
      query.createdAt.$lt = endDate;
    }

    const salesData = await Sale.find(query)
      .sort({ createdAt: 1 }) // Sort oldest to newest
      .select("amount createdAt"); // Select 'amount' to match your Schema

    // 4. Format and Send to Frontend
    const formatted = salesData.map((item) => ({
      date: item.createdAt.toISOString(),
      sales: item.amount, // Using 'amount'
    }));

    return NextResponse.json(formatted);

  } catch (error) {
    console.error("Error fetching sales chart data:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
