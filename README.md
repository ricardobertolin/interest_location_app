# Atlas

A world map for logging the countries you have been to and the places worth knowing inside them.

Click a country to mark it visited. Add sites to it — a name, a one-line hook, notes, coordinates —
and tick them off as you go, attaching photos and field notes to each. Everything you build is one
file you own and can move between devices.

It is a single static page. No account, no server, no tracking, and it works with no connection
once loaded.

## Running it

Open `index.html` through any web server. It cannot be opened as a `file://` path, because service
workers and the map data both require an HTTP origin.

```sh
npx serve .          # or: python -m http.server 8000
```

Then visit the address it prints. `localhost` counts as a secure origin, so the offline support and
the install prompt behave exactly as they will in production.

To publish, commit the repo and enable GitHub Pages on the branch — every path is relative, so it
works from a project subdirectory without configuration.

## The save file

Your atlas is a single JSON file. It holds the name, the whole catalogue of sites, and your
progress together, so opening it anywhere restores exactly what you had.

```json
{
  "format": "atlas-save",
  "version": 1,
  "name": "My Atlas",
  "tagline": "Places worth the detour",
  "sites": [
    {
      "id": "peru/nazca-lines",
      "country": "Peru",
      "name": "Nazca Lines",
      "hook": "Figures hundreds of metres across, legible only from the air.",
      "lore": "Longer notes, shown when the card is opened.",
      "lat": -14.739,
      "lng": -75.13
    }
  ],
  "progress": {
    "countries": { "604": true },
    "places": { "peru/nazca-lines": { "visited": true, "notes": "", "photos": [] } },
    "own": []
  }
}
```

**Save to file** downloads it. **Open file…** loads one back. **New atlas** clears to an empty
world. The **Name** and **Tagline** fields rename the atlas — the header and the browser tab follow.

Your work is also written to this browser's `localStorage` after every change, so closing the tab
loses nothing. That copy is per-browser and per-device; the file is how you move between them, and
how you back up.

### Writing a catalogue by hand

`sites` is the part worth editing in a text editor if you are building a themed set.

| field | | |
|---|---|---|
| `country` | required | Must match a country on the map — see below. |
| `name` | required | |
| `hook` | optional | One line, shown on the collapsed card. |
| `lore` | optional | Shown when the card is opened. |
| `lat` / `lng` | optional | Decimal degrees. Without both, the site is listed under its country but never drawn on the map. |
| `id` | optional | Generated from `country` and `name` if you leave it out. |

IDs are slugs like `peru/nazca-lines`, not positions, so you can reorder, insert and delete freely
without your ticks sliding onto the wrong sites. Keep an `id` stable and its progress follows it.

`country` is matched against [Natural Earth](https://www.naturalearthdata.com/) names at 110m
resolution, with aliases for the common variants (`USA`, `UK`, `Russia`). A few use cartographic
short forms — `Dem. Rep. Congo`, `Macedonia`, `Bosnia and Herz.` — and very small states are not in
the dataset at all. A site whose country does not resolve still appears on the map at its
coordinates, but gets no country page; unresolved names are logged to the browser console.

`sites` also accepts the compact array form `["Country", "Name", "hook", "lore", lat, lng]`, which
is easier to type in bulk.

## Offline and installing

The service worker precaches the page, the icons and the map geometry, so a second visit works with
no connection. Same-origin files are fetched network-first, so a redeploy
reaches clients that already have it installed; the versioned map libraries are served cache-first.

In Chrome or Edge an **Install** button appears once the browser offers it, and the app then runs in
its own window. Firefox and Safari do not fire that event — on iOS, use Share → Add to Home Screen.

## Files

| | |
|---|---|
| `index.html` | The entire application — markup, styles and logic. |
| `manifest.json` | Install metadata. |
| `sw.js` | Service worker: precache and offline behaviour. |
| `icon-192.png`, `icon-512.png` | App icons. |

Save files are deliberately not committed — `.gitignore` excludes `*.atlas.json`, so your atlases
stay yours and never end up in the repository by accident.

## Notes

Photos are downscaled to 720px and embedded in the save file as data URLs. That keeps a file
self-contained, but a heavily illustrated atlas gets large, and `localStorage` is capped at a few
megabytes per origin — the app warns you when a write fails.

Map geometry is [world-atlas](https://github.com/topojson/world-atlas) (Natural Earth, public
domain), rendered with [D3](https://d3js.org/) and topojson-client, both loaded from a CDN and
pinned with subresource integrity.

The country outlines are simplified for size. Small islands and fine coastline are absent, so a site
on one can sit slightly outside the landmass it belongs to. This is cosmetic — the dot is at its real
coordinates.

`version` in the save file is the hook for format changes; nothing reads it yet.

## Licence

MIT — see [LICENSE](LICENSE).
