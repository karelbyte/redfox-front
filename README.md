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

### Certification pack sync (PAC)

When creating or editing **clients** or **products**, the app calls the API, which syncs with the active certification pack (e.g. Facturapi). The API returns `pack_sync_success` and optionally `pack_sync_error`.

- **Clients / Products list**: A green check icon next to the name indicates the record is registered in the pack (`pack_product_id` set).
- **Create/Edit forms**: If the pack sync fails after save, a toast shows the error (e.g. `packSyncFailedCreate` / `packSyncFailedUpdate`) with the detail from `pack_sync_error`. The list still refreshes so the user sees the saved entity.
- **i18n**: Keys `pages.clients.table.inPack`, `pages.products.table.inPack`, and `pages.*.messages.packSyncFailedCreate` / `packSyncFailedUpdate` are used for labels and messages (es/en).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
