import {
  LayoutDashboard,
  ShoppingCart,
  PackageCheck,
  ShieldCheck,
  Factory,
  Boxes,
  Warehouse,
  Ship,
  Users,
  Wallet,
  UserCog,
  Wrench,
  FileCheck2,
} from 'lucide-react'

// `role` must match a value in the `roles` table seeded in 00_setup.sql.
// `role: null` means every authenticated user can see it (e.g. the Dashboard).
export const navSections = [
  {
    label: 'Overview',
    items: [{ name: 'Dashboard', path: '/', icon: LayoutDashboard, role: null }],
  },
  {
    label: 'Source & Receive',
    items: [
      { name: 'Procurement', path: '/procurement', icon: ShoppingCart, role: 'procurement' },
      { name: 'Receiving', path: '/receiving', icon: PackageCheck, role: 'receiving' },
      { name: 'Quality', path: '/quality', icon: ShieldCheck, role: 'quality' },
    ],
  },
  {
    label: 'Make & Store',
    items: [
      { name: 'Production', path: '/production', icon: Factory, role: 'production' },
      { name: 'Inventory', path: '/inventory', icon: Boxes, role: 'inventory' },
      { name: 'Warehouse', path: '/warehouse', icon: Warehouse, role: 'warehouse' },
    ],
  },
  {
    label: 'Sell & Ship',
    items: [
      { name: 'Export', path: '/export', icon: Ship, role: 'export' },
      { name: 'Sales', path: '/sales', icon: Users, role: 'sales' },
      { name: 'Finance', path: '/finance', icon: Wallet, role: 'finance' },
    ],
  },
  {
    label: 'Run the Business',
    items: [
      { name: 'HR', path: '/hr', icon: UserCog, role: 'hr' },
      { name: 'Maintenance', path: '/maintenance', icon: Wrench, role: 'maintenance' },
      { name: 'Compliance', path: '/compliance', icon: FileCheck2, role: 'compliance' },
    ],
  },
]
