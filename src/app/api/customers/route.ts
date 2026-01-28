// src/app/api/customers/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import dbConnect from "@/lib/mongodb";
import Customer from "@/models/Customer";
import { authOptions } from "@/lib/auth";

/**
 * GET: Fetches customers for the currently logged-in user.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const tenantId = session.user.email;
    await dbConnect();

    const customers = await Customer.find({ tenantId }).sort({ createdAt: -1 });

    return NextResponse.json(customers);
  } catch (error) {
    console.error("Failed to fetch customers:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * POST: Creates a new customer for the currently logged-in user.
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const tenantId = session.user.email;
    await dbConnect();

    const { name, phoneNumber, email } = await request.json();

    if (!name || !phoneNumber) {
      return NextResponse.json({ message: "Name and phone number are required" }, { status: 400 });
    }

    // Check if customer with same phone number already exists
    const existingCustomer = await Customer.findOne({ tenantId, phoneNumber });
    if (existingCustomer) {
      return NextResponse.json({ message: "Customer with this phone number already exists" }, { status: 400 });
    }

    const newCustomer = new Customer({
      tenantId,
      name,
      phoneNumber,
      email,
    });

    await newCustomer.save();
    return NextResponse.json({ message: "Customer created successfully", customer: newCustomer }, { status: 201 });
  } catch (error) {
    console.error("Failed to create customer:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * DELETE: Deletes a customer for the currently logged-in user.
 */
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const tenantId = session.user.email;
    await dbConnect();

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ message: "Customer ID is required" }, { status: 400 });
    }

    // Find and delete the customer, ensuring it belongs to the current tenant
    const deletedCustomer = await Customer.findOneAndDelete({ _id: id, tenantId });

    if (!deletedCustomer) {
      return NextResponse.json({ message: "Customer not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ message: "Customer deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete customer:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}