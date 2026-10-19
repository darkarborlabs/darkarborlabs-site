/* Dark Arbor Labs product catalog: the single source for the nav menu, the Products page
   and each product page's store buttons. Paths are relative to the site root.
   Loaded as a plain script (not fetched) so it also works when a page is opened from disk. */
window.DAL_PRODUCTS = [
  {
    "slug": "pickibot",
    "name": "PickiBot",
    "tagline": "Spin the wheel. Let the bot pick.",
    "summary": "A friendly robot and a spinner wheel for every little decision: dinner, chores, who goes first. No ads, no account, works offline.",
    "category": "Utilities",
    "icon": "assets/products/pickibot/icon.webp",
    "url": "products/pickibot/",
    "status": "coming-soon",
    "stores": {
      "ios": {
        "url": null
      },
      "android": {
        "url": null
      }
    }
  },
  {
    "slug": "clutterwise",
    "name": "Clutterwise",
    "tagline": "Find what you already own.",
    "summary": "Organize your home, pack for a move, or manage a storage unit. Scan items with AI or type them in, label boxes with QR codes, and find anything later.",
    "category": "Productivity",
    "icon": "assets/products/clutterwise/icon.webp",
    "url": "products/clutterwise/",
    "status": "in-development",
    "stores": {
      "ios": {
        "url": null,
        "label": "iPhone"
      }
    }
  }
];
