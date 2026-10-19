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
    "summary": "Scan your drawers, closets and bins once, then search for anything by what it is or where it lives. An iPhone app that never makes you remember where you put it.",
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
