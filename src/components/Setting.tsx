// 'use client';

// import { useSession, signOut } from 'next-auth/react';
// import { useRouter } from 'next/navigation';
// import React, { useCallback, useEffect, useState } from 'react';
// import {
//   UserCircleIcon,
//   BuildingStorefrontIcon,
//   ExclamationTriangleIcon,
//   QrCodeIcon,
//   PencilIcon,
//   CheckIcon,
//   XMarkIcon,
//   ArrowDownTrayIcon,
// } from '@heroicons/react/24/outline';

// // Type for the form data
// type FormData = {
//   name: string;
//   phoneNumber: string;
//   address: string;
//   shopName: string;
//   shopAddress: string;
//   merchantUpiId: string;
// };

// // Type for the SettingsField component's props
// type SettingsFieldProps = {
//   label: string;
//   value: string;
//   isEditing: boolean;
//   name: keyof FormData;
//   onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
//   type?: string;
// };

// // A reusable component for displaying a settings field
// const SettingsField = ({ label, value, isEditing, name, onChange, type = 'text' }: SettingsFieldProps) => (
//   <div className="py-2 border-b border-gray-200 last:border-b-0">
//     <label htmlFor={name} className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
//       {label}
//     </label>
//     {isEditing ? (
//       <input
//         type={type}
//         name={name}
//         id={name}
//         value={value}
//         onChange={onChange}
//         className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-1.5 px-2 mt-1"
//         placeholder={`Enter ${label.toLowerCase()}`}
//       />
//     ) : (
//       <p className="text-sm text-gray-800 pt-0.5">{value || '-'}</p>
//     )}
//   </div>
// );

// // --- ENHANCED MODAL COMPONENT (Compact Version) ---
// type ModalProps = {
//   isOpen: boolean;
//   onClose: () => void;
//   title: string;
//   message: string;
//   type?: 'success' | 'error' | 'info';
// };

// const Modal = ({ isOpen, onClose, title, message, type = 'info' }: ModalProps) => {
//   if (!isOpen) return null;

//   let Icon = ExclamationTriangleIcon;
//   let iconColor = 'text-gray-500';
//   let bgColor = 'bg-gray-100';
//   let borderColor = 'from-[#5a4fcf]';

//   if (type === 'success') {
//     Icon = CheckIcon;
//     iconColor = 'text-green-600';
//     bgColor = 'bg-green-100';
//     borderColor = 'from-[#5a4fcf]';
//   } else if (type === 'error') {
//     Icon = ExclamationTriangleIcon;
//     iconColor = 'text-red-600';
//     bgColor = 'bg-red-100';
//     borderColor = 'from-red-500';
//   } else {
//     Icon = ExclamationTriangleIcon; // Info default
//     iconColor = 'text-blue-600';
//     bgColor = 'bg-blue-100';
//     borderColor = 'from-[#5a4fcf]';
//   }

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
//       {/* Outer Wrapper - Reduced Max Width to max-w-xs (approx 320px) */}
//       <div className="relative group w-full max-w-[300px] rounded-xl overflow-hidden p-1.5">
//         {/* Animated 'Sound Line' Border */}
//         <div className={`absolute inset-[-100%] bg-[conic-gradient(from_90deg_at_50%_50%,#E2E8F0_0%,#E2E8F0_50%,var(--tw-gradient-from)_100%)] ${borderColor} animate-[spin_3s_linear_infinite]`} />

//         {/* Modal Content - Compact Padding */}
//         <div className="relative bg-white w-full h-full rounded-xl shadow-2xl overflow-hidden">
//           <div className="p-4 flex items-start gap-3">
//             <div className={`p-2 rounded-full flex-shrink-0 ${bgColor}`}>
//               <Icon className={`h-5 w-5 ${iconColor}`} />
//             </div>
//             <div className="flex-1 min-w-0">
//               <h3 className="text-base font-bold text-gray-900 leading-tight mb-1">{title}</h3>
//               <p className="text-xs text-gray-600 leading-relaxed font-medium">{message}</p>
//             </div>
//           </div>
//           <div className="bg-gray-50 px-4 py-2 flex justify-end">
//             <button
//               onClick={onClose}
//               className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-md hover:bg-indigo-700 transition-colors shadow-sm"
//             >
//               Okay
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default function Settings() {
//   const { data: session, status } = useSession();
//   const router = useRouter();
//   const [editingSection, setEditingSection] = useState<string | null>(null);
//   const [formData, setFormData] = useState<FormData>({
//     name: '',
//     phoneNumber: '',
//     address: '',
//     shopName: '',
//     shopAddress: '',
//     merchantUpiId: '',
//   });
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   const [isNewUser, setIsNewUser] = useState<boolean>(false);

//   // Modal State
//   const [modalState, setModalState] = useState<{ isOpen: boolean; title: string; message: string; type: 'success' | 'error' | 'info' }>({
//     isOpen: false,
//     title: '',
//     message: '',
//   }, [status, router]);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleSave = async (sectionKey: string) => {
//     if (!session?.user?.email) {
//       setModalState({ isOpen: true, title: 'Error', message: 'Could not save settings. User not found.', type: 'error' });
//       return;
//     }

//     localStorage.setItem(`userSettings-${session.user.email}`, JSON.stringify(formData));

//     try {
//       if (sectionKey === 'personal') {
//         const response = await fetch('/api/users/phone', {
//           method: 'PUT',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ phoneNumber: formData.phoneNumber }),
//         });

//         if (!response.ok) {
//           const errorData = await response.json();
//           throw new Error(errorData.message || 'Failed to update phone number');
//         }
//       }

//       setModalState({ isOpen: true, title: 'Success!', message: 'Settings saved successfully.', type: 'success' });
//     } catch (error) {
//       console.error('Error saving data to database:', error);
//       const errorMessage = error instanceof Error ? error.message : 'Unknown error';
//       setModalState({
//         isOpen: true,
//         title: 'Save Warning',
//         message: `Settings saved locally, but failed to update in the database. Error: ${errorMessage}`,
//         type: 'error'
//       });
//     } finally {
//       setEditingSection(null);
//     }
//   };

//   const handleCancel = () => {
//     loadFormData();
//     setEditingSection(null);
//   };

//   if (status === 'loading') {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
//       </div>
//     );
//   }

//   const SectionHeader = ({ title, sectionKey, icon }: { title: string; sectionKey: string; icon: React.ReactNode }) => (
//     <div className="px-3 py-1.5 border-b border-gray-200 flex items-center justify-between gap-2 bg-gray-50">
//       <div className="flex items-center gap-2">
//         {icon}
//         <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
//       </div>
//       <div>
//         {editingSection === sectionKey ? (
//           <div className="flex items-center gap-2">
//             <button type="button" onClick={handleCancel} className="p-1.5 rounded-full text-gray-500 hover:bg-gray-200">
//               <XMarkIcon className="h-5 w-5" />
//             </button>
//             <button type="button" onClick={() => handleSave(sectionKey)} className="p-1.5 rounded-full text-indigo-600 hover:bg-indigo-100">
//               <CheckIcon className="h-5 w-5" />
//             </button>
//           </div>
//         ) : (
//           <button type="button" onClick={() => setEditingSection(sectionKey)} className="p-1.5 rounded-full text-gray-500 hover:bg-gray-200">
//             <PencilIcon className="h-4 w-4" />
//           </button>
//         )}
//       </div>
//     </div>
//   );

//   if (status === 'authenticated' && session.user) {
//     return (
//       <div className="bg-gray-50 min-h-screen pb-20">
//         <div className="bg-gradient-to-br from-indigo-500 to-purple-600 px-4 py-3">
//           <div className="flex items-center gap-3">
//             <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
//               <UserCircleIcon className="h-8 w-8 text-white" />
//             </div>
//             <div>
//               <p className="text-white font-semibold text-base">{session.user.name}</p>
//               <p className="mt-1">
//                 <span style={{ backgroundColor: '#5a4fcf' }} className="px-2 py-0.5 rounded-full text-white text-xs font-medium">
//                   {session.user.email}
//                 </span>
//               </p>
//             </div>
//           </div>
//         </div>

//         <div className="space-y-2 px-2 pt-2">
//           {/* User Profile Section */}
//           <div className="bg-white rounded-lg shadow-sm overflow-hidden">
//             <SectionHeader title="Personal Information" sectionKey="personal" icon={<UserCircleIcon className="h-4 w-4 text-indigo-600" />} />
//             <div className="px-3">
//               <SettingsField label="Full Name" name="name" value={formData.name} isEditing={editingSection === 'personal'} onChange={handleChange} />
//               <SettingsField label="Phone Number" name="phoneNumber" value={formData.phoneNumber || ''} isEditing={editingSection === 'personal'} onChange={handleChange} type="tel" />
//               <SettingsField label="Address" name="address" value={formData.address} isEditing={editingSection === 'personal'} onChange={handleChange} />
//             </div>
//           </div>

//           {/* Shop Details Section */}
//           <div className="bg-white rounded-lg shadow-sm overflow-hidden">
//             <SectionHeader title="Shop Details" sectionKey="shop" icon={<BuildingStorefrontIcon className="h-4 w-4 text-green-600" />} />
//             <div className="px-3">
//               <SettingsField label="Shop Name" name="shopName" value={formData.shopName} isEditing={editingSection === 'shop'} onChange={handleChange} />
//               <SettingsField label="Shop Address" name="shopAddress" value={formData.shopAddress} isEditing={editingSection === 'shop'} onChange={handleChange} />
//             </div>
//           </div>

//           {/* Merchant UPI Section */}
//           <div className="bg-white rounded-lg shadow-sm overflow-hidden">
//             <SectionHeader title="Payment Details" sectionKey="payment" icon={<QrCodeIcon className="h-4 w-4 text-purple-600" />} />
//             <div className="px-3">
//               <SettingsField label="Merchant UPI ID" name="merchantUpiId" value={formData.merchantUpiId} isEditing={editingSection === 'payment'} onChange={handleChange} />
//             </div>
//           </div>

//           {/* --- NEW SECTION: Download App --- */}
//           <div className="bg-white rounded-lg shadow-sm overflow-hidden">
//             <div className="px-3 py-1.5 border-b border-gray-200 flex items-center gap-2 bg-gray-50">
//               <ArrowDownTrayIcon className="h-4 w-4 text-blue-600" />
//               <h2 className="text-sm font-semibold text-gray-800">Install App</h2>
//             </div>
//             <div className="px-3 py-2.5">
//               <a
//                 href="/downloads/billzzylite.apk"
//                 download="billzzylite.apk"
//                 className="w-full rounded-md bg-blue-50 border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
//               >
//                 <ArrowDownTrayIcon className="h-5 w-5" />
//                 Download Android APK
//               </a>
//             </div>
//           </div>

//           {/* Danger Zone */}
//           <div className="bg-white rounded-lg shadow-sm overflow-hidden">
//             <div className="px-3 py-1.5 border-b border-gray-200 flex items-center gap-2 bg-gray-50">
//               <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
//               <h2 className="text-sm font-semibold text-gray-800">Account Actions</h2>
//             </div>
//             <div className="px-3 py-2.5">
//               <button
//                 onClick={() => signOut({ callbackUrl: '/' })}
//                 type="button"
//                 className="w-full rounded-md bg-red-50 border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
//               >
//                 Log Out
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Modal Render */}
//         <Modal
//           isOpen={modalState.isOpen}
//           onClose={closeModal}
//           title={modalState.title}
//           message={modalState.message}
//           type={modalState.type}
//         />
//       </div>
//     );
//   }

//   return null;
// }



'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import {
  UserCircleIcon,
  BuildingStorefrontIcon,
  ExclamationTriangleIcon,
  QrCodeIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';

// Type for the form data
type FormData = {
  name: string;
  phoneNumber: string;
  address: string;
  shopName: string;
  shopAddress: string;
  merchantUpiId: string;
};

// Type for the SettingsField component's props
type SettingsFieldProps = {
  label: string;
  value: string;
  isEditing: boolean;
  name: keyof FormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
};

// A reusable component for displaying a settings field
const SettingsField = ({ label, value, isEditing, name, onChange, type = 'text' }: SettingsFieldProps) => (
  <div className="py-2 border-b border-gray-200 last:border-b-0">
    <label htmlFor={name} className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
      {label}
    </label>
    {isEditing ? (
      <input
        type={type}
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#5a4fcf] focus:ring-[#5a4fcf] text-sm py-1.5 px-2 mt-1"
        placeholder={`Enter ${label.toLowerCase()}`}
      />
    ) : (
      <p className="text-sm text-gray-800 pt-0.5">{value || '-'}</p>
    )}
  </div>
);

// --- ENHANCED MODAL COMPONENT (Compact Version) ---
type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info';
};

const Modal = ({ isOpen, onClose, title, message, type = 'info' }: ModalProps) => {
  if (!isOpen) return null;

  let Icon = ExclamationTriangleIcon;
  let iconColor = 'text-gray-500';
  let bgColor = 'bg-gray-100';
  let borderColor = 'from-[#5a4fcf]';

  if (type === 'success') {
    Icon = CheckIcon;
    iconColor = 'text-green-600';
    bgColor = 'bg-green-100';
    borderColor = 'from-[#5a4fcf]';
  } else if (type === 'error') {
    Icon = ExclamationTriangleIcon;
    iconColor = 'text-red-600';
    bgColor = 'bg-red-100';
    borderColor = 'from-red-500';
  } else {
    Icon = ExclamationTriangleIcon; // Info default
    iconColor = 'text-blue-600';
    bgColor = 'bg-blue-100';
    borderColor = 'from-[#5a4fcf]';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative group w-full max-w-[300px] rounded-xl overflow-hidden p-1.5">
        <div className={`absolute inset-[-100%] bg-[conic-gradient(from_90deg_at_50%_50%,#E2E8F0_0%,#E2E8F0_50%,var(--tw-gradient-from)_100%)] ${borderColor} animate-[spin_3s_linear_infinite]`} />
        <div className="relative bg-white w-full h-full rounded-xl shadow-2xl overflow-hidden">
          <div className="p-4 flex items-start gap-3">
            <div className={`p-2 rounded-full flex-shrink-0 ${bgColor}`}>
              <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-gray-900 leading-tight mb-1">{title}</h3>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">{message}</p>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-2 flex justify-end">
            <button
              onClick={onClose}
              style={{ backgroundColor: '#5a4fcf' }}
              className="px-3 py-1.5 text-white text-xs font-bold rounded-md hover:opacity-90 transition-colors shadow-sm"
            >
              Okay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Settings() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phoneNumber: '',
    address: '',
    shopName: '',
    shopAddress: '',
    merchantUpiId: '',
  });
  const [modalState, setModalState] = useState<{ isOpen: boolean; title: string; message: string; type: 'success' | 'error' | 'info' }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  const closeModal = () => setModalState(prev => ({ ...prev, isOpen: false }));

  const loadFormData = useCallback(async () => {
    if (session?.user?.email) {
      // 1. Try to fetch from DB first (Single Source of Truth)
      try {
        const response = await fetch('/api/users/settings');
        if (response.ok) {
          const dbData = await response.json();

          const mergedData: FormData = {
            name: dbData.name || session.user.name || '',
            phoneNumber: dbData.phoneNumber || '',
            address: dbData.address || '',
            shopName: dbData.shopName || '',
            shopAddress: dbData.shopAddress || '',
            merchantUpiId: dbData.merchantUpiId || '',
          };

          setFormData(mergedData);
          localStorage.setItem(`userSettings-${session.user.email}`, JSON.stringify(mergedData));
          return;
        }
      } catch (error) {
        console.error('Error fetching settings from DB:', error);
      }

      // 2. Fallback to Local Storage
      const savedData = localStorage.getItem(`userSettings-${session.user.email}`);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (session.user.phoneNumber && (!parsed.phoneNumber || parsed.phoneNumber !== session.user.phoneNumber)) {
          parsed.phoneNumber = session.user.phoneNumber;
        }
        setFormData(parsed);
      } else {
        // 3. Init from Session
        const initialData = {
          name: session.user.name || '',
          phoneNumber: session.user.phoneNumber || '',
          address: '',
          shopName: '',
          shopAddress: '',
          merchantUpiId: '',
        };
        localStorage.setItem(`userSettings-${session.user.email}`, JSON.stringify(initialData));
        setFormData(initialData);
      }
    }
  }, [session]);

  useEffect(() => {
    if (status === 'authenticated') {
      loadFormData();
    }
  }, [status, loadFormData]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (sectionKey: string) => {
    if (!session?.user?.email) {
      setModalState({ isOpen: true, title: 'Error', message: 'Could not save settings. User not found.', type: 'error' });
      return;
    }

    // Still update local storage for immediate offline / quick access fallback
    localStorage.setItem(`userSettings-${session.user.email}`, JSON.stringify(formData));

    try {
      // Use the new centralized settings API for ALL sections
      const response = await fetch('/api/users/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update settings');
      }

      setModalState({ isOpen: true, title: 'Success!', message: 'Settings saved successfully to database.', type: 'success' });
    } catch (error) {
      console.error('Error saving data to database:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setModalState({
        isOpen: true,
        title: 'Save Warning',
        message: `Settings saved locally, but failed to update in the database. Error: ${errorMessage}`,
        type: 'error'
      });
    } finally {
      setEditingSection(null);
    }
  };

  const handleCancel = () => {
    loadFormData();
    setEditingSection(null);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5a4fcf]"></div>
      </div>
    );
  }

  const SectionHeader = ({ title, sectionKey, icon }: { title: string; sectionKey: string; icon: React.ReactNode }) => (
    <div className="px-3 py-1.5 border-b border-gray-200 flex items-center justify-between gap-2 bg-gray-50">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
      </div>
      <div>
        {editingSection === sectionKey ? (
          <div className="flex items-center gap-2">
            <button type="button" onClick={handleCancel} className="p-1.5 rounded-full text-gray-500 hover:bg-gray-200">
              <XMarkIcon className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => handleSave(sectionKey)} className="p-1.5 rounded-full text-[#5a4fcf] hover:bg-indigo-50">
              <CheckIcon className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => setEditingSection(sectionKey)} className="p-1.5 rounded-full text-gray-500 hover:bg-gray-200">
            <PencilIcon className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );

  if (status === 'authenticated' && session.user) {
    return (
      <div className="bg-gray-50 min-h-screen pb-20">
        <div style={{ background: 'linear-gradient(to bottom right, #5a4fcf, #7c3aed)' }} className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <UserCircleIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-base">{session.user.name}</p>
              <p className="mt-1">
                <span style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }} className="px-2 py-0.5 rounded-full text-white text-xs font-medium">
                  {session.user.email}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2 px-2 pt-2">
          {/* User Profile Section */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <SectionHeader title="Personal Information" sectionKey="personal" icon={<UserCircleIcon className="h-4 w-4 text-[#5a4fcf]" />} />
            <div className="px-3">
              <SettingsField label="Full Name" name="name" value={formData.name} isEditing={editingSection === 'personal'} onChange={handleChange} />
              <SettingsField label="Phone Number" name="phoneNumber" value={formData.phoneNumber || ''} isEditing={editingSection === 'personal'} onChange={handleChange} type="tel" />
              <SettingsField label="Address" name="address" value={formData.address} isEditing={editingSection === 'personal'} onChange={handleChange} />
            </div>
          </div>

          {/* Shop Details Section */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <SectionHeader title="Shop Details" sectionKey="shop" icon={<BuildingStorefrontIcon className="h-4 w-4 text-green-600" />} />
            <div className="px-3">
              <SettingsField label="Shop Name" name="shopName" value={formData.shopName} isEditing={editingSection === 'shop'} onChange={handleChange} />
              <SettingsField label="Shop Address" name="shopAddress" value={formData.shopAddress} isEditing={editingSection === 'shop'} onChange={handleChange} />
            </div>
          </div>

          {/* Merchant UPI Section */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <SectionHeader title="Payment Details" sectionKey="payment" icon={<QrCodeIcon className="h-4 w-4 text-purple-600" />} />
            <div className="px-3">
              <SettingsField label="Merchant UPI ID" name="merchantUpiId" value={formData.merchantUpiId} isEditing={editingSection === 'payment'} onChange={handleChange} />
            </div>
          </div>

          {/* Download App Section */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-3 py-1.5 border-b border-gray-200 flex items-center gap-2 bg-gray-50">
              <ArrowDownTrayIcon className="h-4 w-4 text-blue-600" />
              <h2 className="text-sm font-semibold text-gray-800">Install App</h2>
            </div>
            <div className="px-3 py-2.5">
              <a
                href="/downloads/billzzylite.apk"
                download="billzzylite.apk"
                className="w-full rounded-md bg-blue-50 border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
                Download Android APK
              </a>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-3 py-1.5 border-b border-gray-200 flex items-center gap-2 bg-gray-50">
              <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
              <h2 className="text-sm font-semibold text-gray-800">Account Actions</h2>
            </div>
            <div className="px-3 py-2.5">
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                type="button"
                className="w-full rounded-md bg-red-50 border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>

        {/* Modal Render */}
        <Modal
          isOpen={modalState.isOpen}
          onClose={closeModal}
          title={modalState.title}
          message={modalState.message}
          type={modalState.type}
        />
      </div>
    );
  }

  return null;
}