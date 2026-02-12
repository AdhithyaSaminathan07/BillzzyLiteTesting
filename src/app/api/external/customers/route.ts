import { NextResponse } from 'next/server';
import { validateMerchantRequest } from '@/lib/api-validation'; // Updated path
import Customer from '@/models/Customer';

export async function GET(req: Request) {
  const tenant = await validateMerchantRequest(req);

  if (!tenant) {
    return NextResponse.json({ error: 'Invalid Merchant ID or API Key' }, { status: 401 });
  }

  const escapedId = (tenant.ownerEmail || tenant.subdomain).replace(/[.*+?^${}()|[\]\\]/g, '\\\\$&');
  const tenantId = tenant.ownerEmail || tenant.subdomain;

  const customers = await Customer.find({
    $or: [
      { tenantId: tenantId },
      { tenantId: { $regex: new RegExp(`^${escapedId}$`, 'i') } }
    ]
  })
    .select('name phoneNumber email -_id');

  return NextResponse.json(customers);
}