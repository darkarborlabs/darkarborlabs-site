# Store badges

Apple and Google require their **official, unmodified** badge artwork when linking to their stores. Don't redraw or recolor them. Download once the apps are live and save them here:

| File | Source |
| --- | --- |
| `app-store.svg` | https://developer.apple.com/app-store/marketing/guidelines/ (use the "Download on the App Store" black badge) |
| `google-play.png` | https://play.google.com/intl/en_us/badges/ ("Get it on Google Play") |

Keep clear space around each badge (Apple: 1/10 of badge height; Google: 1/4), show both at the same visual height, and keep the trademark line in the page footer.

## Going live for a product

In `assets/products.json`, set the store URL and flip the status:

```json
"status": "available",
"stores": { "ios": { "url": "https://apps.apple.com/app/id…" }, "android": { "url": "https://play.google.com/store/apps/details?id=…" } }
```

The menu, the Products page and the product page's store buttons all update from that one entry.
