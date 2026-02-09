// // // src/app/api/analytics/sales-chart/route.ts
// import { NextResponse } from "next/server";
// import connectToDatabase from "@/lib/mongodb";
// import Sale from "@/models/Sales"; // Importing 'Sale' to match your model export
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";
// import { startOfDay, subDays, subMonths, subYears, startOfYear } from "date-fns";

// export async function GET(req: Request) {
//   try {
//     // 1. Get Logged-in User
//     const session = await getServerSession(authOptions);
//     if (!session?.user?.email) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }
//     const userEmail = session.user.email;

//     await connectToDatabase();

//     // 2. Get Date Range from Frontend
//     const { searchParams } = new URL(req.url);
//     const range = searchParams.get("range") || "1D";

//     let startDate = new Date();
//     let endDate = new Date(); // Default to now
//     const today = new Date();

//     switch (range) {
//       case "1D":
//         startDate = startOfDay(today);
//         endDate = new Date(); // till now
//         break;
//       case "Yesterday":
//         startDate = startOfDay(subDays(today, 1));
//         endDate = startOfDay(today);
//         break;
//       case "7D": startDate = subDays(today, 6); break; // 6 days ago + today = 7 days
//       case "1M": startDate = subMonths(today, 1); break;
//       case "YTD": startDate = startOfYear(today); break;
//       case "1Y": startDate = subYears(today, 1); break;
//       case "5Y": startDate = subYears(today, 5); break;
//       case "MAX": startDate = new Date(0); break;
//       default:
//         startDate = startOfDay(today);
//         endDate = new Date();
//     }

//     // 3. Fetch Every Individual Bill
//     // We filter by tenantId (email) and the date range.
//     const query: { tenantId: string; createdAt: { $gte: Date; $lt?: Date } } = {
//       tenantId: userEmail,
//       createdAt: { $gte: startDate }
//     };

//     // For Yesterday, we need an upper bound (less than today start)
//     if (range === "Yesterday") {
//       query.createdAt.$lt = endDate;
//     }

//     const salesData = await Sale.find(query)
//       .sort({ createdAt: 1 }) // Sort oldest to newest
//       .select("amount createdAt"); // Select 'amount' to match your Schema

//     // 4. Format and Send to Frontend
//     const formatted = salesData.map((item) => ({
//       date: item.createdAt.toISOString(),
//       sales: item.amount, // Using 'amount'
//     }));

//     return NextResponse.json(formatted);

//   } catch (error) {
//     console.error("Error fetching sales chart data:", error);
//     return NextResponse.json({ error: "Internal Error" }, { status: 500 });
//   }
// }



import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Sale from "@/models/Sales"; // Importing 'Sale' to match your model export
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
// --- MODIFIED: Ensure endOfDay is imported for accurate date range filtering ---
import { startOfDay, endOfDay, subDays, subMonths, subYears, startOfYear } from "date-fns";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userEmail = session.user.email;

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range");
    // --- NEW: Read startDate and endDate parameters for the custom range ---
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    let startDate: Date;
    let endDate: Date = new Date(); // Default to now, will be adjusted

    // --- NEW: This logic block makes the custom date range work ---
    // It checks for the calendar dates FIRST.
    if (startDateParam && endDateParam) {
      startDate = startOfDay(new Date(startDateParam));
      endDate = endOfDay(new Date(endDateParam)); // CRUCIAL: Gets all data from the end date until midnight
    } 
    // If no custom dates are sent, it falls back to your original logic for "Today", "Weekly", etc.
    else {
      const today = new Date();
      switch (range) {
        case "1D":
          startDate = startOfDay(today);
          endDate = endOfDay(today); // Use endOfDay for consistency
          break;
        case "7D":
          startDate = startOfDay(subDays(today, 6));
          endDate = endOfDay(today);
          break;
        case "1M":
          startDate = startOfDay(subMonths(today, 1));
          endDate = endOfDay(today);
          break;
        // Add any other presets you might have
        default:
          startDate = startOfDay(today);
          endDate = endOfDay(today);
      }
    }

    // This query now works for BOTH presets and custom ranges
    const query = {
      tenantId: userEmail,
      createdAt: { $gte: startDate, $lte: endDate } // Use $lte for an inclusive range
    };

    const salesData = await Sale.find(query)
      .sort({ createdAt: 1 })
      .select("amount createdAt");

    const formatted = salesData.map((item) => ({
      date: item.createdAt.toISOString(),
      sales: item.amount,
    }));

    return NextResponse.json(formatted);

  } catch (error) {
    console.error("Error fetching sales chart data:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}