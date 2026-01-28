// FILE: src/app/api/products/route.ts

import { getServerSession } from "next-auth/next"; // 1. IMPORT getServerSession for v4 compatibility
import { authOptions } from "@/lib/auth";          // 2. IMPORT your existing authOptions
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import { NextRequest, NextResponse } from 'next/server';

// --- Your existing interfaces (no changes needed here) ---
interface IProductInput {
  sku: string;
  name: string;
  profitPerUnit?: number;
  [key: string]: unknown;
}

interface IProductFromDB extends IProductInput {
  _id: { toString: () => string };
  __v?: number;
  tenantId: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

interface MongoDuplicateKeyError {
  code: number;
  message: string;
}

const transformProduct = (product: IProductFromDB) => {
  const { _id, ...rest } = product;
  return {
    ...rest,
    id: _id.toString(),
  };
};
// --- End of interfaces ---


// GET all products for a specific tenant
export async function GET() {
  // 3. GET THE SESSION using getServerSession with your authOptions
  const session = await getServerSession(authOptions);
  const tenantId = session?.user?.email;

  // Protect the route: ensure the user is authenticated
  if (!tenantId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const productsFromDb = await Product.find({ tenantId: tenantId })
      .sort({ createdAt: -1 })
      .lean<IProductFromDB[]>();

    const products = productsFromDb.map(transformProduct);
    return NextResponse.json(products);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: 'Failed to fetch products', error: errorMessage }, { status: 500 });
  }
}

// POST a new product (handles both single and batch) for a specific tenant
export async function POST(request: NextRequest) {
  // 3. GET THE SESSION using getServerSession with your authOptions
  const session = await getServerSession(authOptions);
  const tenantId = session?.user?.email;

  // Protect the route: ensure the user is authenticated
  if (!tenantId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const body: IProductInput | IProductInput[] = await request.json();
    console.log("Received Product Data:", JSON.stringify(body, null, 2));

    if (Array.isArray(body)) {
      const productsWithTenant = body.map(product => ({
        ...product,
        tenantId: tenantId, // Assign tenantId from the user's session
      }));
      if (productsWithTenant.length > 0) {
        await Product.insertMany(productsWithTenant, { ordered: false }).catch((err: unknown) => {
          if ((err as { code?: number }).code !== 11000) throw err;
          console.warn("Batch insert contained duplicate SKUs for this tenant, which were ignored.");
        });
      }
    } else {
      const productWithTenant = { ...body, tenantId: tenantId }; // Assign tenantId from the user's session
      await Product.create(productWithTenant);
    }

    const allProductsFromDb = await Product.find({ tenantId: tenantId })
      .sort({ createdAt: -1 })
      .lean<IProductFromDB[]>();

    const allProducts = allProductsFromDb.map(transformProduct);

    return NextResponse.json(allProducts, { status: 201 });

  } catch (error: unknown) {
    const isMongoDuplicateKeyError = (err: unknown): err is MongoDuplicateKeyError => {
      return (
        typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        (err as { code: unknown }).code === 11000
      );
    }

    if (isMongoDuplicateKeyError(error)) {
      return NextResponse.json(
        { message: 'A product with a duplicate SKU already exists for this tenant.', error: error.message },
        { status: 409 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: 'Failed to create product(s)', error: errorMessage }, { status: 500 });
  }
}