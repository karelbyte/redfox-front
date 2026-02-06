This is the RedFox POS frontend: a [Next.js](https://nextjs.org) application with multi-language support (es/en) and integration to the RedFox API.

## 🚀 Phase 2 Features - Expansion

This version includes the Phase 2 expansion features:

### 💰 Financial Management
- **Expense Tracking**: Complete expense management with categories and receipts
- **Accounts Receivable**: Track customer payments and overdue accounts
- **Cash Flow Analysis**: Visual reports of income vs expenses
- **Financial Dashboard**: Real-time financial KPIs and trends

### 🔍 Global Search (⌘K)
- **Universal Search**: Search across all data with keyboard shortcut
- **Smart Results**: Grouped results by type (products, clients, invoices, etc.)
- **Quick Navigation**: Jump to any record instantly
- **Barcode Support**: Search products by scanning or typing barcodes

### 📱 Progressive Web App (PWA)
- **Offline Mode**: Core functionality works without internet
- **Installable**: Add to home screen on mobile/desktop
- **Background Sync**: Automatic data sync when connection returns
- **Push Notifications**: Real-time business alerts
- **App Shortcuts**: Quick access to key features

### 🎨 Enhanced UX
- **Consistent Design**: All new features follow existing design patterns
- **Responsive Layout**: Optimized for mobile, tablet, and desktop
- **Accessibility**: Full keyboard navigation and screen reader support
- **Performance**: Optimized loading and caching strategies

## New Routes

### Financial Management
- `/dashboard/finanzas/gastos` - Expense management
- `/dashboard/finanzas/cuentas-por-cobrar` - Accounts receivable
- `/dashboard/finanzas/cuentas-por-pagar` - Accounts payable
- `/dashboard/finanzas/flujo-de-caja` - Cash flow analysis

### Features
- Global search modal (⌘K from anywhere)
- Offline indicator and sync status
- PWA installation prompts

## PWA Configuration

The app is now a fully functional Progressive Web App:

- **Manifest**: `/public/manifest.json` with app metadata
- **Service Worker**: `/public/sw.js` for offline functionality
- **Caching Strategy**: Network-first for API, cache-first for assets
- **Background Sync**: Queues offline actions for later sync
- **Push Notifications**: Real-time business alerts

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Company settings (Generales de empresa)

- **Purpose**: Centralize the company/business info used by the app to customize tickets/reports and branding.
- **UI route**: `/{locale}/dashboard/configuracion/generales-empresa`
- **Menu**: Under **Configuración**, above **Roles**.
- **Fields**: trade name, legal name, tax id (RFC), address, phone, email, website, and **logo** upload.

### Ticket header (POS)

The POS ticket header is no longer hardcoded. It is loaded from **Company settings**:
- Name: `name` (fallback: `legalName`)
- Address: `address`
- Phone: `phone`
- Tax ID: `taxId` (label shown as `RFC` for `es` locale, otherwise `Tax ID`)

### Environment variable

- `NEXT_PUBLIC_URL_API`: Base URL of the backend API **without** `/api` (example: `http://localhost:4010`).
  - The frontend uses it to call the API at `${NEXT_PUBLIC_URL_API}/api/...`
  - The company logo is loaded from `${NEXT_PUBLIC_URL_API}/api/uploads/...`

### Certification pack sync (PAC)

- **Clients**: On create/edit, the API syncs with the pack and returns `pack_sync_success` / `pack_sync_error`. A green check icon in the list indicates `pack_client_id` is set. Toasts show pack sync errors on save.
- **Products**: Products are catalog only; sync to the pack happens when applying a **reception** or **closing a warehouse**. Pack data lives in inventory (`pack_product_id`). The product list no longer shows an “en pack” icon; that can be shown in the inventory list when available.
- **i18n**: Keys `pages.clients.table.inPack`, `pages.products.table.inPack`, and `pages.*.messages.packSyncFailedCreate` / `packSyncFailedUpdate` are used for labels and messages (es/en).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
## 🧩 New Components

### Expense Management
- `ExpenseList` - Main expense listing with filters and pagination
- `ExpenseTable` - Data table with sorting and actions
- `ExpenseModal` - Create/edit expense form
- `ExpenseFilters` - Advanced filtering options

### Accounts Receivable
- `AccountsReceivableList` - Main accounts listing
- `AccountsReceivableTable` - Data table with payment tracking
- `AccountsReceivableModal` - Create/edit account form
- `AccountsReceivableFilters` - Advanced filtering options

### Global Search
- `GlobalSearchModal` - Universal search interface
- `useGlobalSearch` - Hook for search functionality
- `useOffline` - Hook for connectivity detection

### PWA Components
- `OfflineIndicator` - Shows connection status
- Service worker registration in layout
- Manifest configuration for installation

## 🔧 Technical Implementation

### State Management
- React hooks for local state
- Context providers for global state
- Optimistic updates for better UX

### API Integration
- TypeScript services for all endpoints
- Error handling and retry logic
- Loading states and skeleton screens

### Offline Support
- Service worker caching strategies
- IndexedDB for offline data storage
- Background sync for pending operations
- Conflict resolution for data sync

### Performance Optimizations
- Code splitting by route
- Image optimization
- Bundle size optimization
- Lazy loading for heavy components

## 🎯 User Experience Features

### Keyboard Shortcuts
- `⌘K` / `Ctrl+K` - Open global search
- `Escape` - Close modals and overlays
- `Tab` navigation throughout the app

### Responsive Design
- Mobile-first approach
- Touch-friendly interfaces
- Adaptive layouts for all screen sizes

### Accessibility
- ARIA labels and roles
- Keyboard navigation
- Screen reader support
- High contrast mode support

### Error Handling
- User-friendly error messages
- Retry mechanisms for failed operations
- Graceful degradation for offline mode

## 🔄 Data Synchronization

### Online Mode
- Real-time data updates
- Immediate server synchronization
- Live validation and feedback

### Offline Mode
- Local data storage in IndexedDB
- Queue pending operations
- Automatic sync when online
- Conflict resolution strategies

### Sync Indicators
- Visual sync status indicators
- Progress bars for large operations
- Success/error notifications
- Retry options for failed syncs

## 📊 Financial Features

### Expense Management
- Category-based organization
- Receipt attachment support
- Recurring expense templates
- Vendor tracking and history
- Expense approval workflows

### Accounts Receivable
- Automatic overdue detection
- Payment reminder system
- Partial payment tracking
- Client credit limits
- Aging reports

### Reporting
- Real-time financial dashboards
- Expense category breakdowns
- Cash flow projections
- Receivables aging analysis
- Export capabilities (PDF/Excel)