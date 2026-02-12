import { NextResponse } from 'next/server';
import { validateExternalRequest } from '@/lib/api-validation'; // Updated path
import Sales from '@/models/Sales';

export async function GET(req: Request) {
  const tenant = await validateExternalRequest(req);

  if (!tenant) {
    return NextResponse.json({ error: 'Invalid Merchant ID or API Key' }, { status: 401 });
  }

  const tenantId = tenant.ownerEmail || tenant.subdomain;
  const escapedId = tenantId.replace(/[.*+?^${}()|[\]\\]/g, '\\\\$&');

  const sales = await Sales.find({
    $or: [
      { tenantId: tenantId },
      { tenantId: { $regex: new RegExp(`^${escapedId}$`, 'i') } }
    ]
  })
    .select('customerName totalAmount createdAt status items billId') // Added items and billId for better visibility
    .sort({ createdAt: -1 });

  return NextResponse.json({ data: sales });
}