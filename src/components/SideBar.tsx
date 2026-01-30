// 'use client';

// import React, { Dispatch, SetStateAction } from 'react';
// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import Image from 'next/image';
// import { signOut } from 'next-auth/react';
// import {
//   Home,
//   Package,
//   Settings,
//   CreditCard,
//   LogOut,
//   Menu,
//   X,
//   Clock,
//   ShoppingCart,
//   BarChart2,
// } from 'lucide-react';

// interface SidebarProps {
//   isMobileOpen: boolean;
//   setIsMobileOpen: Dispatch<SetStateAction<boolean>>;
// }

// interface MobileHeaderProps {
//   onMenuClick: () => void;
// }

// const NavLink = React.forwardRef<
//   HTMLAnchorElement,
//   {
//     href: string;
//     children: React.ReactNode;
//     setIsMobileOpen: Dispatch<SetStateAction<boolean>>;
//     isActive: boolean;
//   }
// >(({ href, children, setIsMobileOpen, isActive }, ref) => {
//   const handleClick = () => {
//     setIsMobileOpen(false);
//   };

//   return (
//     <Link
//       ref={ref}
//       href={href}
//       onClick={handleClick}
//       className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
//         isActive
//           ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md'
//           : 'text-gray-700 hover:bg-gray-50 active:bg-gray-100'
//       }`}
//     >
//       {children}
//     </Link>
//   );
// });

// NavLink.displayName = 'NavLink';

// export function Sidebar({ isMobileOpen, setIsMobileOpen }: SidebarProps) {
//   const pathname = usePathname();

//   const handleLogout = () => {
//     signOut({ callbackUrl: '/' });
//   };

//   return (
//     <>
//       <div
//         className={`fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden transition-opacity duration-300 ease-in-out ${
//           isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
//         }`}
//         onClick={() => setIsMobileOpen(false)}
//       />

//       <aside
//         className={`fixed top-0 left-0 h-full w-64 flex flex-col bg-white z-50 lg:relative transform transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none lg:border-r ${
//           isMobileOpen ? 'translate-x-0' : '-translate-x-full'
//         } lg:translate-x-0`}
//       >
//         <div className="flex h-16 items-center justify-between px-5 bg-gradient-to-r from-indigo-50 to-purple-50">
//           <Image src="/assets/lite-logo.png" alt="BillzzyLite Logo" width={130} height={32} priority />
//           <button
//             onClick={() => setIsMobileOpen(false)}
//             className="lg:hidden p-2 rounded-full hover:bg-white/50 text-gray-600 hover:text-gray-900 transition-colors"
//             aria-label="Close menu"
//           >
//             <X size={22} />
//           </button>
//         </div>

//         <div className="h-1 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400" />

//         <nav className="flex flex-1 flex-col space-y-2 p-4">
//           <NavLink href="/dashboard" setIsMobileOpen={setIsMobileOpen} isActive={pathname === '/dashboard'}>
//             <Home className="h-5 w-5" /><span>Dashboard</span>
//           </NavLink>

//           {/* ✅ Reports added */}
//           <NavLink href="/report" setIsMobileOpen={setIsMobileOpen} isActive={pathname === '/report'}>
//             <BarChart2 className="h-5 w-5" /><span>Reports</span>
//           </NavLink>

//           <NavLink href="/inventory" setIsMobileOpen={setIsMobileOpen} isActive={pathname === '/inventory'}>
//             <Package className="h-5 w-5" /><span>Inventory</span>
//           </NavLink>

//           <NavLink href="/billing" setIsMobileOpen={setIsMobileOpen} isActive={pathname === '/billing'}>
//             <CreditCard className="h-5 w-5" /><span>Billing</span>
//           </NavLink>

//           <NavLink href="/billing-history" setIsMobileOpen={setIsMobileOpen} isActive={pathname === '/billing-history'}>
//             <Clock className="h-5 w-5" /><span>Billing History</span>
//           </NavLink>

//           <NavLink href="/purchase" setIsMobileOpen={setIsMobileOpen} isActive={pathname === '/purchase'}>
//             <ShoppingCart className="h-5 w-5" /><span>Purchase</span>
//           </NavLink>

//           <NavLink href="/settings" setIsMobileOpen={setIsMobileOpen} isActive={pathname === '/settings'}>
//             <Settings className="h-5 w-5" /><span>Settings</span>
//           </NavLink>
//         </nav>

//         <div className="p-4 mt-auto bg-gray-50 border-t">
//           <button
//             onClick={handleLogout}
//             className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-red-600 transition-all hover:bg-red-50 active:bg-red-100 font-medium"
//           >
//             <LogOut className="h-5 w-5" />
//             <span>Logout</span>
//           </button>
//         </div>
//       </aside>
//     </>
//   );
// }

// export function MobileHeader({ onMenuClick }: MobileHeaderProps) {
//   return (
//     <header className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center justify-between border-b bg-white px-4 shadow-sm lg:hidden">
//       <Image src="/assets/lite-logo.png" alt="BillzzyLite Logo" width={110} height={28} priority />

//       <button
//         onClick={onMenuClick}
//         className="px-3 py-2 rounded-lg bg-[#5a4fcf] text-white shadow-sm hover:bg-[#4c42b8] transition-all duration-200 hover:shadow-md active:scale-95"
//         aria-label="Open menu"
//       >
//         <Menu size={22} strokeWidth={2.3} />
//       </button>
//     </header>
//   );
// }




'use client';

import React, { Dispatch, SetStateAction } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { signOut } from 'next-auth/react';
import {
  Home,
  Package,
  Settings,
  CreditCard,
  LogOut,
  Menu,
  X,
  Clock,
  ShoppingCart,
  BarChart2,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: Dispatch<SetStateAction<boolean>>;
}

interface MobileHeaderProps {
  onMenuClick: () => void;
}

const NavLink = React.forwardRef<
  HTMLAnchorElement,
  {
    href: string;
    children: React.ReactNode;
    setIsMobileOpen: Dispatch<SetStateAction<boolean>>;
    isActive: boolean;
  }
>(({ href, children, setIsMobileOpen, isActive }, ref) => {
  return (
    <Link
      ref={ref}
      href={href}
      onClick={() => setIsMobileOpen(false)}
      className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-semibold text-sm ${
        isActive
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 translate-x-1'
          : 'text-gray-500 hover:text-indigo-600 hover:bg-indigo-50/50 active:scale-95'
      }`}
    >
      {children}
      {isActive && (
        <div className="ml-auto">
          <ChevronRight className="h-4 w-4 opacity-70" />
        </div>
      )}
    </Link>
  );
});

NavLink.displayName = 'NavLink';

export function Sidebar({ isMobileOpen, setIsMobileOpen }: SidebarProps) {
  const pathname = usePathname();

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <>
      {/* Mobile Overlay with Backdrop Blur */}
      <div
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 lg:hidden transition-opacity duration-300 ${
          isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileOpen(false)}
      />

      <aside
        className={`fixed top-0 left-0 h-full w-[280px] lg:w-72 flex flex-col bg-white z-50 lg:relative transform transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        } border-r border-gray-100`}
      >
        {/* Sidebar Logo Section */}
        <div className="flex h-20 items-center justify-between px-6">
          <div className="relative h-10 w-32">
            <Image 
              src="/assets/lite-logo.png" 
              alt="Logo" 
              fill 
              className="object-contain" 
              priority 
            />
          </div>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-2 rounded-xl bg-gray-50 text-gray-400 hover:text-gray-900 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5 custom-scrollbar">
          
         <nav className="space-y-1">
            <NavLink href="/dashboard" setIsMobileOpen={setIsMobileOpen} isActive={pathname === '/dashboard'}>
              <Home className="h-5 w-5" /><span>Dashboard</span>
            </NavLink>

            <NavLink href="/report" setIsMobileOpen={setIsMobileOpen} isActive={pathname === '/report'}>
              <BarChart2 className="h-5 w-5" /><span>Reports</span>
            </NavLink>

            <NavLink href="/inventory" setIsMobileOpen={setIsMobileOpen} isActive={pathname === '/inventory'}>
              <Package className="h-5 w-5" /><span>Inventory</span>
            </NavLink>

            <NavLink href="/billing" setIsMobileOpen={setIsMobileOpen} isActive={pathname === '/billing'}>
              <CreditCard className="h-5 w-5" /><span>Billing</span>
            </NavLink>

            <NavLink href="/billing-history" setIsMobileOpen={setIsMobileOpen} isActive={pathname === '/billing-history'}>
              <Clock className="h-5 w-5" /><span>History</span>
            </NavLink>

            <NavLink href="/purchase" setIsMobileOpen={setIsMobileOpen} isActive={pathname === '/purchase'}>
              <ShoppingCart className="h-5 w-5" /><span>Purchase</span>
            </NavLink>
          </nav>

          <div className="pt-6">
            <p className="px-4 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Account</p>
            <NavLink href="/settings" setIsMobileOpen={setIsMobileOpen} isActive={pathname === '/settings'}>
              <Settings className="h-5 w-5" /><span>Settings</span>
            </NavLink>
          </div>
        </div>

        {/* Logout Footer Section */}
        <div className="p-4 border-t border-gray-50 bg-gray-50/30">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-red-500 transition-all hover:bg-red-50 active:scale-95 font-bold text-sm"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout Account</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export function MobileHeader({ onMenuClick }: MobileHeaderProps) {
  return (
    <header className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between border-b bg-white/90 backdrop-blur-md px-4 lg:hidden">
      {/* Logo moved to the Left side */}
      <div className="flex items-center">
        <div className="relative h-8 w-28">
          <Image 
            src="/assets/lite-logo.png" 
            alt="BillzzyLite Logo" 
            fill 
            className="object-contain" 
            priority 
          />
        </div>
      </div>

      {/* Menu Button on the Right side */}
      <button
        onClick={onMenuClick}
        className="h-10 w-10 flex items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-100 active:scale-90 transition-transform"
        aria-label="Open menu"
      >
        <Menu size={20} strokeWidth={2.5} />
      </button>
    </header>
  );
}