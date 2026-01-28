'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { Scanner, IDetectedBarcode } from '@yudiel/react-qr-scanner';
import QRCode from 'react-qr-code';
import {
  Scan, Trash2, Edit2, Check, X, AlertTriangle,
  CreditCard, CheckCircle, DollarSign, MessageSquare,
  Nfc
} from 'lucide-react';

// --- HELPER FUNCTIONS ---
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR"
  }).format(amount);
};

const calculateGstDetails = (sellingPrice: number, gstRate: number) => {
  const price = Number(sellingPrice) || 0;
  const rate = Number(gstRate) || 0;
  const gstAmount = (price * rate) / 100;
  const totalPrice = price + gstAmount;
  return { gstAmount, totalPrice };
};

// --- TYPE DEFINITIONS ---
type CartItem = {
  id: number;
  productId?: string;
  name: string;
  quantity: number | '';
  price: number | '';
  gstRate: number;
  profitPerUnit?: number;
  isEditing?: boolean;
};

type InventoryProduct = {
  id: string;
  name: string;
  quantity: number;
  sellingPrice: number;
  gstRate: number;
  image?: string;
  sku?: string;
  profitPerUnit?: number;
};

// --- MODAL COMPONENT ---
type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onConfirm?: () => void;
  confirmText?: string;
  showCancel?: boolean;
};

const Modal = ({ isOpen, onClose, title, children, onConfirm, confirmText = 'OK', showCancel = false }: ModalProps) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-[90%] max-w-md rounded-2xl bg-white p-5 shadow-2xl border border-gray-200">
        <div className="flex items-start">
          <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-[#5a4fcf]/10">
            <AlertTriangle className="h-5 w-5 text-[#5a4fcf]" />
          </div>
          <div className="ml-3 text-left">
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            <div className="mt-1.5 text-gray-600 text-sm">{children}</div>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          {showCancel && <button onClick={onClose} className="rounded-lg bg-gray-200 px-3 py-1.5 text-sm font-semibold text-gray-800 hover:bg-gray-300">Cancel</button>}
          <button onClick={() => { if (onConfirm) onConfirm(); onClose(); }} className="rounded-lg bg-[#5a4fcf] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#4c42b8]">{confirmText}</button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN BILLING COMPONENT ---
export default function BillingPage() {
  const { data: session, status } = useSession();
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [productName, setProductName] = React.useState('');
  const [scanning, setScanning] = React.useState(true);
  const [inventory, setInventory] = React.useState<InventoryProduct[]>([]);
  const [suggestions, setSuggestions] = React.useState<InventoryProduct[]>([]);
  const [showSuggestions, setShowSuggestions] = React.useState(false);

  // States for flow
  const [showWhatsAppSharePanel, setShowWhatsAppSharePanel] = React.useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = React.useState(false);

  // This state holds 'cash' or 'qr-code' depending on which tab is open
  const [selectedPayment, setSelectedPayment] = React.useState<string>('');

  // Data states
  const [merchantUpi, setMerchantUpi] = React.useState('');
  const [merchantName, setMerchantName] = React.useState('Billzzy Lite');
  const [whatsAppNumber, setWhatsAppNumber] = React.useState('');
  const [customerName, setCustomerName] = React.useState('');
  const [amountGiven, setAmountGiven] = React.useState<number | ''>('');

  // Loading states
  const [isMessaging, setIsMessaging] = React.useState(false); // For WhatsApp/DB Save
  const [isCreatingLink, setIsCreatingLink] = React.useState(false); // For NFC

  const [scannerError, setScannerError] = React.useState<string>('');
  const [modal, setModal] = React.useState<{ isOpen: boolean; title: string; message: string | React.ReactNode; onConfirm?: (() => void); confirmText: string; showCancel: boolean; }>({ isOpen: false, title: '', message: '', confirmText: 'OK', showCancel: false });
  const suggestionsRef = React.useRef<HTMLDivElement | null>(null);

  const [settingsComplete, setSettingsComplete] = React.useState(false);
  const [discountInput, setDiscountInput] = React.useState<string>('');
  const [discountType, setDiscountType] = React.useState<'percentage' | 'fixed'>('percentage');

  const subtotal = React.useMemo(() =>
    cart.reduce((sum, item) => {
      const { totalPrice } = calculateGstDetails(Number(item.price) || 0, item.gstRate);
      return sum + totalPrice * (Number(item.quantity) || 0);
    }, 0),
    [cart]
  );

  const { discountAmount, totalAmount } = React.useMemo(() => {
    const discountValue = parseFloat(discountInput) || 0;
    let calculatedDiscount = 0;
    if (discountType === 'percentage' && discountValue > 0) {
      calculatedDiscount = (subtotal * discountValue) / 100;
    } else if (discountType === 'fixed' && discountValue > 0) {
      calculatedDiscount = Math.min(discountValue, subtotal);
    }
    const finalTotal = Math.max(0, subtotal - calculatedDiscount);
    return { discountAmount: calculatedDiscount, totalAmount: finalTotal };
  }, [subtotal, discountInput, discountType]);

  const balance = React.useMemo(() => {
    const total = totalAmount;
    const given = Number(amountGiven);
    return given > 0 ? given - total : 0;
  }, [totalAmount, amountGiven]);

  const upiQR = merchantUpi ? `upi://pay?pa=${merchantUpi}&pn=${encodeURIComponent(merchantName)}&am=${totalAmount.toFixed(2)}&cu=INR&tn=Bill%20Payment` : '';

  // Check Phone Number
  const checkPhoneNumber = React.useCallback(() => {
    if (status === 'authenticated' && session?.user?.email) {
      // 1. Check Session first (Source of Truth for Phone)
      if (session.user.phoneNumber) {
        setSettingsComplete(true);
        // We still need merchant details from local storage if available
        const savedData = localStorage.getItem(`userSettings-${session.user.email}`);
        if (savedData) {
          try {
            const parsedData = JSON.parse(savedData);
            setMerchantUpi(parsedData.merchantUpiId || '');
            setMerchantName(parsedData.shopName || 'Billzzy Lite');
          } catch { /* ignore */ }
        }
        return true;
      }

      // 2. Fallback to Local Storage (Legacy behavior)
      const savedData = localStorage.getItem(`userSettings-${session.user.email}`);
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          const phoneNumber = parsedData.phoneNumber || '';
          if (phoneNumber && phoneNumber.trim() !== '' && /^\d{10,15}$/.test(phoneNumber)) {
            setSettingsComplete(true);
            setMerchantUpi(parsedData.merchantUpiId || '');
            setMerchantName(parsedData.shopName || 'Billzzy Lite');
            return true;
          }
        } catch (error) {
          console.error('Error parsing settings data:', error);
        }
      }
      setSettingsComplete(false);
      return false;
    }
    return false;
  }, [status, session]);

  React.useEffect(() => { checkPhoneNumber(); }, [checkPhoneNumber]);

  // Inventory Fetch
  React.useEffect(() => {
    if (status !== 'authenticated') return;
    (async () => {
      try {
        const res = await fetch('/api/products');
        if (!res.ok) { setInventory([]); return; }
        const data: InventoryProduct[] = await res.json();
        const productsWithGst = data.map(p => ({ ...p, gstRate: p.gstRate || 0 }));
        setInventory(productsWithGst);
      } catch { setInventory([]); }
    })();
  }, [status]);

  // Suggestions
  React.useEffect(() => {
    if (!productName.trim()) { setShowSuggestions(false); return; }
    const query = productName.trim().toLowerCase();
    const filtered = inventory.filter(p => p.name.toLowerCase().includes(query) || p.sku?.toLowerCase().includes(query)).slice(0, 5);
    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
  }, [productName, inventory]);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // --- WHATSAPP LOGIC ---
  const sendWhatsAppMessage = React.useCallback(async (phoneNumber: string, messageType: string) => {
    if (!phoneNumber.trim() || !/^\d{10,15}$/.test(phoneNumber)) {
      setModal({
        isOpen: true,
        title: 'Invalid Number',
        message: 'Please enter a valid WhatsApp number including the country code (e.g., 919876543210).',
        showCancel: false,
        confirmText: 'Got it',
      });
      return false;
    }

    try {
      const formattedPhone = phoneNumber.startsWith('91') ? phoneNumber : `91${phoneNumber}`;
      const orderId = `INV-${Date.now().toString().slice(-6)}`;
      const itemsList = cart.map((item) => `${item.name} (x${item.quantity})`).join(', ');

      let templateName = '';
      let bodyParameters: string[] = [];

      switch (messageType) {
        case 'cashPayment': templateName = 'payment_receipt_cashh'; break;
        case 'qrPayment': templateName = 'payment_receipt_upii'; break;
        case 'cardPayment': templateName = 'payment_receipt_card'; break;
        default: throw new Error(`Invalid message type: ${messageType}`);
      }

      bodyParameters = [
        orderId,
        merchantName,
        `₹${subtotal.toFixed(2)}`,
        itemsList,
        discountAmount > 0 ? `₹${discountAmount.toFixed(2)}` : '₹0.00',
      ];

      const messageData = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: formattedPhone,
        type: 'template',
        template: {
          name: templateName,
          language: { code: 'en' },
          components: [{ type: 'body', parameters: bodyParameters.map((text) => ({ type: 'text', text })) }],
        },
      };

      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to send message');
      if (!result.success) throw new Error(result.message || 'WhatsApp API returned success: false');

      return true;
    } catch (error) {
      console.error('WhatsApp API error:', error);
      setModal({
        isOpen: true,
        title: 'Messaging Error',
        message: `Failed to send WhatsApp message: ${error instanceof Error ? error.message : 'Unknown error'}.`,
        showCancel: false,
        confirmText: 'OK',
      });
      return false;
    }
  }, [cart, subtotal, discountAmount, merchantName]);

  const sendWhatsAppReceipt = React.useCallback(async (paymentMethod: string) => {
    let templateType = '';
    switch (paymentMethod) {
      case 'cash': templateType = 'cashPayment'; break;
      case 'qr-code': templateType = 'qrPayment'; break;
      default: templateType = 'cashPayment';
    }
    return await sendWhatsAppMessage(whatsAppNumber, templateType);
  }, [whatsAppNumber, sendWhatsAppMessage]);

  // --- CART ACTIONS ---
  // --- CART ACTIONS ---
  const addToCart = React.useCallback((name: string, price: number, gstRate: number, productId?: string, profitPerUnit?: number, isEditing = false) => {
    if (!name || price < 0) return;

    // Check stock if productId exists
    if (productId) {
      const product = inventory.find(p => p.id === productId);
      if (product) {
        // Find existing quantity in cart
        const existingItem = cart.find(item => item.productId === productId);
        const currentCartQty = existingItem ? (Number(existingItem.quantity) || 0) : 0;

        if (currentCartQty + 1 > product.quantity) {
          setModal({
            isOpen: true,
            title: 'Out of Stock',
            message: `Cannot add more "${name}". Only ${product.quantity} available.`,
            confirmText: 'OK',
            showCancel: false
          });
          return;
        }
      }
    }

    setCart(prev => {
      const existingItem = productId ? prev.find(item => item.productId === productId) : null;
      if (existingItem) {
        return prev.map(item => item.productId === productId ? { ...item, quantity: (Number(item.quantity) || 0) + 1 } : item);
      }
      return [{ id: Date.now(), productId, name, quantity: 1, price, gstRate, profitPerUnit: profitPerUnit || 0, isEditing }, ...prev];
    });
    setProductName('');
    setShowSuggestions(false);
  }, [inventory, cart]); // Added dependencies

  const handleScan = React.useCallback((results: IDetectedBarcode[]) => {
    if (results && results[0]) {
      const scannedValue = results[0].rawValue;
      const foundProduct = inventory.find(p => p.id === scannedValue || p.sku?.toLowerCase() === scannedValue.toLowerCase() || p.name.toLowerCase() === scannedValue.toLowerCase());
      if (foundProduct) {
        addToCart(foundProduct.name, foundProduct.sellingPrice, foundProduct.gstRate, foundProduct.id, foundProduct.profitPerUnit);
        setScanning(false);
      } else {
        addToCart(scannedValue, 0, 0, undefined, 0, true);
        setScanning(false);
      }
    }
  }, [inventory, addToCart]);

  const handleScanError = React.useCallback((error: unknown) => {
    setScannerError(error instanceof Error ? error.message : 'Unknown scanner error');
  }, []);

  const handleManualAdd = React.useCallback(() => {
    const name = productName.trim();
    if (!name) {
      setModal({ isOpen: true, title: 'Item Name Required', message: 'Please enter a name for the custom item.', showCancel: false, confirmText: 'OK' });
      return;
    }
    addToCart(name, 0, 0, undefined, 0, true);
  }, [productName, addToCart]);

  const deleteCartItem = (id: number) => setCart(prev => prev.filter(item => item.id !== id));
  const toggleEdit = (id: number) => setCart(prev => prev.map(item => item.id === id ? { ...item, isEditing: !item.isEditing } : { ...item, isEditing: false }));

  const updateCartItem = (id: number, updatedValues: Partial<CartItem>) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        // If updating quantity, check stock
        if (updatedValues.quantity !== undefined && item.productId) {
          const product = inventory.find(p => p.id === item.productId);
          const newQty = Number(updatedValues.quantity);
          if (product && newQty > product.quantity) {
            setModal({
              isOpen: true,
              title: 'Insufficient Stock',
              message: `Cannot set quantity to ${newQty}. Only ${product.quantity} available.`,
              confirmText: 'OK',
              showCancel: false
            });
            return item; // Return original item without update
          }
        }
        return { ...item, ...updatedValues };
      }
      return item;
    }));
  };

  const handleTransactionDone = React.useCallback(() => {
    setCart([]);
    setSelectedPayment('');
    setShowWhatsAppSharePanel(false);
    setShowPaymentOptions(false);
    setWhatsAppNumber('');
    setAmountGiven('');
    setDiscountInput('');
    setModal({ ...modal, isOpen: false });
  }, [modal]);

  const handleProceedToPayment = React.useCallback(async () => {
    if (showWhatsAppSharePanel && cart.length > 0) {
      if (whatsAppNumber.trim() !== '') {
        const phoneRegex = /^\d{10,15}$/;
        if (!phoneRegex.test(whatsAppNumber)) {
          alert("Please enter a valid phone number (10-15 digits)");
          return;
        }
      }
    }

    if (cart.length === 0) {
      setModal({ isOpen: true, title: 'Cart Empty', message: 'Please add items to the cart before finalizing.', confirmText: 'OK', showCancel: false });
      return;
    }
    setShowWhatsAppSharePanel(false);
    setShowPaymentOptions(true);
  }, [cart.length, showWhatsAppSharePanel, whatsAppNumber]);

  // --- FINAL PAYMENT HANDLER ---
  const handlePaymentSuccess = React.useCallback(async (useNfc: boolean = false) => {
    // 1. Set Loading UI based on action
    if (useNfc) {
      setIsCreatingLink(true);
    } else {
      setIsMessaging(true);
    }

    try {
      // 2. Prepare Variables
      let nfcToken = '';

      // Prepare sanitized cart with valid numbers for API
      const safeCart = cart.map(item => ({
        ...item,
        quantity: Number(item.quantity) || 0,
        price: Number(item.price) || 0
      }));

      // 3. Update Inventory (ALWAYS run this for both)
      const updatePromises = safeCart.filter(item => item.productId).map(item =>
        fetch(`/api/products/${item.productId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantityToDecrement: item.quantity })
        })
      );
      await Promise.all(updatePromises).catch(err => console.error("Inventory update failed:", err));

      // 4. Save Customer DB (ALWAYS run this for both if name exists)
      if (customerName.trim() && whatsAppNumber.trim()) {
        fetch('/api/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: customerName.trim(), phoneNumber: whatsAppNumber.trim() })
        }).catch(err => console.error("Customer save error", err));
      }

      // Calculate total profit based on safeCart
      const totalProfit = safeCart.reduce((sum, item) => sum + ((item.profitPerUnit || 0) * item.quantity), 0);

      // 5. HANDLE PAYMENT & SALE CREATION
      if (useNfc) {
        // === NFC FLOW ===
        // Calling /api/nfc-link creates the Order/Sale in the backend AND returns the ID
        // The 'paymentMethod' (Cash vs QR) is passed here, so the backend saves it correctly.
        const nfcRes = await fetch('/api/nfc-link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cart: safeCart, totalAmount, paymentMethod: selectedPayment, profit: totalProfit }),
        });
        const nfcData = await nfcRes.json();

        if (nfcData.success && nfcData.orderId) {
          nfcToken = nfcData.orderId;
        } else {
          throw new Error(nfcData.message || 'Failed to generate NFC link');
        }
        // NOTE: We do NOT call /api/sales here to avoid Double Bill.

      } else {
        // === REGULAR CONFIRM FLOW (CASH / QR) ===
        // Manually create the sale record
        const response = await fetch('/api/sales', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: totalAmount,
            paymentMethod: selectedPayment,
            profit: totalProfit,
            items: safeCart,
            customerPhone: whatsAppNumber,
            customerName: customerName,
            merchantName: merchantName,
            discount: discountAmount
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to save sale');
        }

        // Send WhatsApp only for Manual Confirm
        if (whatsAppNumber && whatsAppNumber.trim()) {
          await sendWhatsAppReceipt(selectedPayment);
        }
      }

      // 6. Launch NFC App (Only for NFC Flow)
      if (useNfc && nfcToken) {
        const packageName = "com.billzzylite.bridge";
        const bridgeUrl = `intent://nfc/${nfcToken}#Intent;scheme=billzzylite;package=${packageName};end`;
        window.location.href = bridgeUrl;
      }

      // 7. Show Success Modal
      setModal({
        isOpen: true,
        title: 'Success!',
        message: useNfc
          ? 'Inventory updated. Tap your card to finish.'
          : 'Transaction completed! Receipt sent via WhatsApp.',
        confirmText: 'New Bill',
        onConfirm: handleTransactionDone,
        showCancel: false
      });

    } catch (error) {
      console.error("Payment Process Error:", error);
      setModal({
        isOpen: true,
        title: 'Error',
        message: 'An error occurred while saving the transaction.',
        confirmText: 'OK',
        showCancel: false
      });
    } finally {
      setIsCreatingLink(false);
      setIsMessaging(false);
    }
  }, [selectedPayment, totalAmount, cart, handleTransactionDone, whatsAppNumber, sendWhatsAppReceipt, customerName, merchantName, discountAmount]);

  const toggleScanner = React.useCallback(() => {
    setScanning(prev => { if (!prev) { setScannerError(''); } return !prev; });
  }, []);

  return (
    <>
      <div className="h-full flex flex-col bg-gray-50">
        {!settingsComplete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-[90%] max-w-md rounded-2xl bg-white p-5 shadow-2xl border border-gray-200">
              <div className="flex items-start">
                <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-[#5a4fcf]/10"><AlertTriangle className="h-5 w-5 text-[#5a4fcf]" /></div>
                <div className="ml-3 text-left"><h3 className="text-base font-semibold text-gray-900">Settings Incomplete</h3><div className="mt-1.5 text-gray-600 text-sm"><p>Please fill in your phone number in the settings to proceed with billing.</p></div></div>
              </div>
              <div className="mt-4 flex justify-end"><button onClick={() => { window.location.assign('/settings'); }} className="rounded-lg bg-[#5a4fcf] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#4c42b8]">Go to Settings</button></div>
            </div>
          </div>
        )}

        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="p-2 space-y-2">

            {scanning && settingsComplete && (
              <div className="bg-white rounded-xl p-3 shadow-md border border-indigo-100">
                <div className="max-w-sm mx-auto"><Scanner onScan={handleScan} onError={handleScanError} scanDelay={300} styles={{ container: { width: '100%', height: 180, borderRadius: '12px', overflow: 'hidden' } }} /></div>
                {scannerError && <p className="text-center text-xs text-red-500 mt-2">{scannerError}</p>}
                <button onClick={toggleScanner} className="w-full mt-3 flex items-center justify-center gap-2 bg-red-50 text-red-600 py-2 rounded-lg text-sm font-semibold hover:bg-red-100"><X size={16} /> Close Scanner</button>
              </div>
            )}

            <div className="bg-white rounded-xl p-3 shadow-md border border-gray-200">
              <div className="flex gap-2">
                <div ref={suggestionsRef} className="relative flex-1">
                  <input type="text" placeholder={settingsComplete ? "Search or add item..." : "Settings required to add items"} className="w-full rounded-lg border-2 border-gray-300 p-2.5 text-sm focus:ring-2 focus:ring-[#5a4fcf] focus:border-[#5a4fcf] outline-none transition-all" value={productName} onChange={(e) => setProductName(e.target.value)} onClick={() => setScanning(false)} onKeyPress={(e) => { if (e.key === 'Enter') { handleManualAdd(); } }} disabled={!settingsComplete} />
                  {showSuggestions && settingsComplete && (
                    <div className="absolute z-10 mt-2 w-full rounded-xl border-2 border-[#5a4fcf] bg-white shadow-xl max-h-48 overflow-y-auto">{suggestions.map((s) => (<div key={s.id} onClick={() => addToCart(s.name, s.sellingPrice, s.gstRate, s.id, s.profitPerUnit)} className="cursor-pointer border-b border-gray-100 p-3 hover:bg-indigo-50 transition-colors last:border-b-0"><div className="flex justify-between items-center"><span className="font-semibold text-gray-800 text-sm">{s.name}</span><span className="text-[#5a4fcf] font-bold text-sm">{formatCurrency(s.sellingPrice)}</span></div>{s.sku && <p className="text-xs text-gray-500 mt-0.5">SKU: {s.sku}</p>}</div>))}</div>
                  )}
                </div>
              </div>
              {!scanning && settingsComplete && (<button onClick={toggleScanner} className="w-full mt-2 flex items-center justify-center gap-2 bg-indigo-50 text-[#5a4fcf] py-2 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition-colors"><Scan size={16} /> Scan Barcode</button>)}
            </div>

            {cart.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center shadow-md border border-gray-200"><div className="text-5xl mb-3">🛒</div><p className="text-gray-600 font-medium">{settingsComplete ? "Cart is Empty" : "Settings Required"}</p><p className="text-xs text-gray-500 mt-1">{settingsComplete ? "Add items to get started" : "Please complete your settings to start billing"}</p></div>
            ) : (
              <div className="space-y-2">{cart.map((item) => {
                const { gstAmount, totalPrice } = calculateGstDetails(Number(item.price) || 0, item.gstRate); const totalItemPrice = totalPrice * (Number(item.quantity) || 0); return (
                  <div key={item.id} className={`rounded-lg p-2.5 shadow-sm border transition-all ${item.isEditing ? 'bg-indigo-50 border-[#5a4fcf]' : 'bg-white border-gray-200'}`}>

                    {item.isEditing ? (
                      /* === COMPACT EDIT MODE === */
                      <div className="flex flex-col gap-2">
                        {/* Row 1: Name */}
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateCartItem(item.id, { name: e.target.value })}
                          className="w-full px-2 py-1.5 rounded-md border border-gray-300 text-sm focus:ring-1 focus:ring-[#5a4fcf] outline-none bg-white"
                          placeholder="Item Name"
                          disabled={!settingsComplete}
                        />

                        {/* Row 2: Qty | Price | Actions */}
                        <div className="flex items-center gap-2">
                          <div className="relative flex-[1]">
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateCartItem(item.id, { quantity: e.target.value === '' ? '' : parseInt(e.target.value, 10) })}
                              className="w-full px-2 py-1.5 rounded-md border border-gray-300 text-sm focus:ring-1 focus:ring-[#5a4fcf] outline-none bg-white font-medium text-center"
                              placeholder="Qty"
                              disabled={!settingsComplete}
                            />
                            <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] text-gray-400 pointer-events-none">Qty</span>
                          </div>

                          <div className="relative flex-[1.5]">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">₹</span>
                            <input
                              type="number"
                              value={item.price}
                              onChange={(e) => updateCartItem(item.id, { price: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                              className="w-full pl-5 pr-2 py-1.5 rounded-md border border-gray-300 text-sm focus:ring-1 focus:ring-[#5a4fcf] outline-none bg-white font-medium"
                              placeholder="Price"
                              disabled={!settingsComplete}
                            />
                          </div>

                          {/* Actions */}
                          <button
                            onClick={() => toggleEdit(item.id)}
                            className="flex items-center justify-center p-1.5 rounded-md bg-[#5a4fcf] text-white hover:bg-[#4c42b8] shadow-sm transition-all"
                            title="Save"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => deleteCartItem(item.id)}
                            className="flex items-center justify-center p-1.5 rounded-md bg-red-100 text-red-500 hover:bg-red-200 shadow-sm transition-all"
                            title="Remove"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* === VIEW MODE UI (Compact) === */
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 text-sm truncate leading-tight">{item.name}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">Qty: {item.quantity}</span>
                            <span className="text-[10px] text-gray-400">×</span>
                            <span className="text-xs text-gray-500">{formatCurrency(totalPrice)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[#5a4fcf]">
                            {formatCurrency(totalItemPrice)}
                          </span>

                          <div className="flex gap-1">
                            <button onClick={() => toggleEdit(item.id)} disabled={!settingsComplete} className="p-1 rounded bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-[#5a4fcf] transition-colors"><Edit2 size={14} /></button>
                            <button onClick={() => deleteCartItem(item.id)} disabled={!settingsComplete} className="p-1 rounded bg-red-50 text-red-500 hover:bg-red-100 transition-colors"><Trash2 size={14} /></button>
                          </div>
                        </div>
                      </div>
                    )}

                    {!item.isEditing && item.gstRate > 0 && (
                      <div className="mt-1.5 pt-1.5 border-t border-dashed border-gray-100 text-[10px] text-gray-400">
                        Base: {formatCurrency(Number(item.price) || 0)} + GST ({item.gstRate}%): {formatCurrency(gstAmount)}
                      </div>
                    )}
                  </div>
                );
              })}</div>
            )}
          </div>
        </div>

        <div className="flex-shrink-0 bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.1)] border-t-2 border-gray-200">
          <div className="p-2.5 space-y-2 max-h-[45vh] overflow-y-auto">

            <div className="space-y-2"><div className="relative"><input type="number" placeholder="Discount" value={discountInput} onChange={(e) => setDiscountInput(e.target.value)} className="w-full rounded-lg border-2 border-gray-300 p-2 text-sm focus:ring-2 focus:ring-[#5a4fcf] focus:border-[#5a4fcf] outline-none transition-all pr-12" disabled={cart.length === 0 || !settingsComplete} /><div className="absolute inset-y-0 right-0 flex items-center"><button onClick={() => setDiscountType(discountType === 'percentage' ? 'fixed' : 'percentage')} className="h-full rounded-r-lg px-3 text-sm font-bold text-white bg-[#5a4fcf] hover:bg-[#4c42b8] transition-colors" disabled={cart.length === 0 || !settingsComplete}>{discountType === 'percentage' ? '%' : '₹'}</button></div></div><div className="space-y-1 text-sm rounded-lg bg-gray-50 p-2 border"><div className="flex justify-between items-center text-gray-600"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>{discountAmount > 0 && (<div className="flex justify-between items-center text-green-600"><span>Discount</span><span>- {formatCurrency(discountAmount)}</span></div>)}<div className="flex justify-between items-center text-gray-900 font-bold border-t pt-1 mt-1"><span className="text-base">Total</span><span className="text-xl">{formatCurrency(totalAmount)}</span></div></div></div>

            {!showWhatsAppSharePanel && !showPaymentOptions && (
              <button onClick={() => { if (cart.length === 0) { setModal({ isOpen: true, title: 'Cart Empty', message: 'Please add items to the cart before finalizing.', confirmText: 'OK', showCancel: false }); return; } setShowWhatsAppSharePanel(true); setShowPaymentOptions(false); }} className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#5a4fcf] py-2.5 font-bold text-white hover:bg-[#4c42b8] disabled:bg-gray-400 transition-colors shadow-lg text-sm" disabled={cart.length === 0 || !settingsComplete}><CreditCard size={16} /><span>Proceed to Payment</span></button>
            )}

            {/* --- CUSTOMER PANEL --- */}
            {showWhatsAppSharePanel && cart.length > 0 && settingsComplete && (
              <div className="space-y-2 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 p-2.5 border-2 border-green-200">
                <p className="text-xs font-semibold text-gray-700 text-center">Customer Details & Sharing</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-1"><input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Customer Name (Optional)" className="w-full rounded-lg border-2 border-green-300 p-2 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200" /></div>
                  <div className="col-span-1"><input type="tel" value={whatsAppNumber} onChange={(e) => setWhatsAppNumber(e.target.value)} placeholder="91XXXXXXXXXX" className="w-full rounded-lg border-2 border-green-300 p-2 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200" /></div>
                </div>
                <button onClick={handleProceedToPayment} disabled={isMessaging} className="w-full flex items-center justify-center gap-2 rounded-lg bg-green-600 py-2 font-semibold text-white hover:bg-green-700 disabled:bg-gray-400 transition-colors shadow-md text-sm">
                  {isMessaging ? (
                    <div className="flex items-center gap-2"><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div><span className="text-xs">Processing...</span></div>
                  ) : (
                    <><MessageSquare size={14} /><span className="text-xs">{whatsAppNumber.trim() ? 'Next: Payment' : 'Skip & Continue'}</span></>
                  )}
                </button>
              </div>
            )}

            {showPaymentOptions && cart.length > 0 && settingsComplete && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-700 text-center">Select Payment Method</p>
                <div className="grid grid-cols-2 gap-1.5">{[{ method: 'cash', label: 'Cash', color: 'green' }, { method: 'qr-code', label: 'QR/UPI', color: 'blue' }].map(({ method, label }) => (<button key={method} onClick={() => setSelectedPayment(method)} className={`rounded-lg px-2 py-2 text-xs font-bold capitalize transition-all ${selectedPayment === method ? 'bg-[#5a4fcf] text-white shadow-lg scale-105' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{label}</button>))}</div>

                {selectedPayment === 'cash' && (
                  <div className="rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 p-2.5 border-2 border-green-200">
                    <p className="text-xs text-center font-medium text-gray-700 mb-2">Cash Payment</p>
                    <div className="grid grid-cols-2 gap-2 mb-2"><input type="number" placeholder="Amount Given" value={amountGiven} onChange={(e) => setAmountGiven(e.target.value === '' ? '' : parseFloat(e.target.value))} className="rounded-lg border-2 border-green-300 p-1.5 text-sm focus:ring-2 focus:ring-green-500 outline-none" /><div className="rounded-lg bg-white border-2 border-green-300 p-1.5 flex flex-col items-center justify-center"><span className="text-xs text-gray-500">Balance</span><span className={`font-bold text-sm ${balance < 0 ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(balance)}</span></div></div>
                    <div className="flex gap-2">
                      {/* NFC Button - SAVES as CASH */}
                      <button onClick={() => handlePaymentSuccess(true)} disabled={isCreatingLink || isMessaging} className="flex-1 rounded-lg bg-indigo-600 py-2 font-bold text-white hover:bg-indigo-700 flex items-center justify-center shadow-md">
                        {isCreatingLink ? (<div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>) : (<div className="flex items-center gap-1"><Nfc size={18} /><span className="text-[10px]">Tap</span></div>)}
                      </button>
                      {/* Complete Button - SAVES as CASH */}
                      <button onClick={() => handlePaymentSuccess(false)} disabled={isMessaging || isCreatingLink} className="flex-[3] flex items-center justify-center gap-2 rounded-lg bg-green-600 py-2 font-bold text-white disabled:bg-gray-400 hover:bg-green-700 transition-colors shadow-md text-xs">
                        {isMessaging ? (<div className="flex items-center gap-2"><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div><span>Processing...</span></div>) : (<><DollarSign size={16} /><span>Confirm Cash Payment</span></>)}
                      </button>
                    </div>
                  </div>
                )}

                {selectedPayment === 'qr-code' && (
                  <div className="rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 p-2.5 border-2 border-blue-200">
                    {upiQR ? (<><p className="text-xs text-center font-medium text-gray-700 mb-2">Scan QR to Pay</p><div className="bg-white p-2 rounded-lg mx-auto max-w-[140px] border-2 border-blue-300"><QRCode value={upiQR} style={{ height: 'auto', width: '100%' }} /></div><p className="mt-1.5 text-xs text-center text-gray-600">Pay to: <span className="font-semibold">{merchantUpi}</span></p>
                      <div className="flex gap-2 mt-2">
                        {/* NFC Button - SAVES as QR/UPI */}
                        <button onClick={() => handlePaymentSuccess(true)} disabled={isCreatingLink || isMessaging} className="flex-1 rounded-lg bg-indigo-600 py-2 font-bold text-white hover:bg-indigo-700 flex items-center justify-center shadow-md">
                          {isCreatingLink ? (<div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>) : (<div className="flex items-center gap-1"><Nfc size={18} /><span className="text-[10px]">Tap</span></div>)}
                        </button>
                        {/* Complete Button - SAVES as QR/UPI */}
                        <button onClick={() => handlePaymentSuccess(false)} disabled={isMessaging || isCreatingLink} className="flex-[3] flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-2 font-bold text-white disabled:bg-gray-400 hover:bg-blue-700 transition-colors shadow-md text-xs">
                          {isMessaging ? (<div className="flex items-center gap-2"><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div><span>Processing...</span></div>) : (<><CheckCircle size={16} /><span>Confirm Payment Received</span></>)}
                        </button>
                      </div>
                    </>) : (<p className="text-center text-xs font-semibold text-red-600 py-4">UPI ID not configured. Please update settings.</p>)}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <Modal isOpen={modal.isOpen} onClose={() => setModal({ ...modal, isOpen: false, message: '' })} title={modal.title} onConfirm={modal.onConfirm} confirmText={modal.confirmText} showCancel={modal.showCancel}>{modal.message}</Modal>
    </>
  );
}