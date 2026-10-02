# VLAN Planner

Plan VLAN allocations in the browser, flag duplicate or out-of-range IDs, and export the current table as CSV.

## Features

- Add, edit, and remove VLAN ID, name, subnet, and description rows
- Highlights duplicate IDs, IDs outside 1–4094, and common reserved IDs
- Exports RFC 4180-compatible CSV with spreadsheet-formula neutralization
- English and Portuguese UI with light and dark themes

## Local development

```bash
npm install
npm run dev
```

Open the URL printed by Vite. Use `npm run lint`, `npm test`, and `npm run build` before changes are submitted.

## Data and limits

All data stays in the current browser session; the app has no backend, account, persistence, or network-device integration. Validation is limited to VLAN ID range, duplicate detection, and the listed reserved IDs. Review your network standards before applying an exported plan.

## License

[MIT](LICENSE)
