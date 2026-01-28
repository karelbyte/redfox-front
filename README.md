This is the RedFox POS frontend: a [Next.js](https://nextjs.org) application with multi-language support (es/en) and integration to the RedFox API.

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
