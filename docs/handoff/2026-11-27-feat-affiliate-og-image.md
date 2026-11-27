# 2026-11-27 feat/affiliate-og-image: link preview image for /affiliate

## Scope
Links to `/affiliate` shared on WhatsApp showed the site-wide default image (book and stationery). This adds a dedicated 1200×630 image:
- BeSmartKids logo;
- "Jadi affiliate BeSmartKids";
- commission Rp19.900 / Rp34.900;
- brand colours and affiliate ornaments.

## Paths
- `src/app/affiliate/opengraph-image.png`: rendered from HTML using the Poppins font and `public/logo.png`.
- `src/app/affiliate/opengraph-image.alt.txt`

## Validation
- Build: OK.
- `/affiliate` emits `og:image` 1200×630 with alt text.
- The image URL returns 200 `image/png`.

## Note
WhatsApp caches link previews. A link that was already shared may keep the old image for a while; new chats or a newly pasted link pick up the new image.
