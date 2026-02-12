import dbConnect from './mongodb';
import Tenant from '@/models/Tenant';
import { hashKey } from './api-keys';

export async function validateExternalRequest(req: Request) {
  const merchantId = req.headers.get('x-merchant-id');
  const apiKey = req.headers.get('x-api-key');

  if (!merchantId || !apiKey) return null;

  await dbConnect();

  // Find the tenant using the permanent Merchant ID
  const tenant = await Tenant.findOne({ merchantId: merchantId });
  
  if (!tenant || !tenant.apiKeyHash) return null;

  // Verify the key by hashing the incoming key and comparing to DB
  const incomingHash = hashKey(apiKey);
  if (incomingHash !== tenant.apiKeyHash) return null;

  return tenant; // Returns the full tenant context if valid
}