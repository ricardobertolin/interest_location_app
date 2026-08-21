# Atlas

A world map for logging the countries you have been to and the places worth knowing inside them.

Click a country to mark it visited. Add sites to it — a name, a one-line hook, notes, coordinates —
and tick them off as you go, attaching photos and field notes to each. Everything you build is one
file you own and can move between devices.

## Photos

Attach as many as you like to a site — the picker takes several at once. They appear as a grid of
thumbnails under the notes; click any one to open it full screen, where the arrow keys, the on-screen
arrows or a swipe move between them.

One photo is the site's **main** one. It is the picture shown wherever the site is presented: as a
banner at the top of the site once it is selected, as a thumbnail on the collapsed card, on its card
in the gallery, and beside the site in the overview's visited list. The first photo you attach takes
the role; press ★ on any other thumbnail, or **Set as main** in the full-screen view, to move it.
Remove the main photo and the first remaining one takes over.

## All sites

**Sites** in the header opens every site on file as a gallery, each led by its main photo, whether
or not you have been there. Search by name, country or hook, and narrow to what is visited, still
to do, has photos, or is your own entry. Tapping a card's picture opens it full screen; tapping
anywhere else on the card goes to the site.

## Scales

A **scale** is a number an atlas puts on a place — how hard it is to reach, how good it was, what it
cost. The atlas defines them; every site and every territory can then carry a value on each.

Add one under **Scales** in the overview: a name, how many points it runs to, whether it applies to
sites, to territories, or to both, and optionally a name per point (`Turn up, Easy trip, Committing,
Hard, Extreme`). Values are set by tapping a step — on the territory itself at the top of a country
page, and inside each site's card. The `–` step clears a value again.

Once a scale exists it shows everywhere the place does: as pips on the gallery card and on the
collapsed site card, in the map tooltip, in the copied report, and as a column in an exported
manifest. **All sites** gains a sort (low or high first, unrated always last) and a filter for one
level at a time. The overview shows how far through each level you are — which of the easy ones are
still outstanding, and how much of the hard end you have actually done.

Removing a scale keeps the numbers already recorded; add it back under the same name and they
return. Six scales is the limit.

## Selection

A country and a site are selected together, not one instead of the other. Open a site — from a
marker, from the gallery, or by opening its card inside a country — and both the marker and the
territory holding it are lit on the map, so the panel and the map never disagree about where you
are. The selected marker keeps a pulsing ring, which is what makes a site picked from a list
findable among its neighbours.

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
  "version": 3,
  "app": "1.3.0",
  "name": "My Atlas",
  "tagline": "Places worth the detour",
  "scales": [
    {
      "key": "difficulty",
      "label": "Difficulty to visit",
      "min": 1,
      "max": 5,
      "levels": ["Turn up", "Easy trip", "Committing", "Hard", "Extreme"],
      "scope": "both"
    }
  ],
  "territories": [
    { "country": "Peru", "fid": "604", "values": { "difficulty": 2 } }
  ],
  "sites": [
    {
      "id": "peru/nazca-lines",
      "country": "Peru",
      "name": "Nazca Lines",
      "hook": "Figures hundreds of metres across, legible only from the air.",
      "lore": "Longer notes, shown when the card is opened.",
      "lat": -14.739,
      "lng": -75.13,
      "values": { "difficulty": 2 }
    }
  ],
  "progress": {
    "countries": { "604": true },
    "places": {
      "peru/nazca-lines": { "visited": true, "notes": "", "photos": [], "cover": 0 }
    },
    "own": []
  }
}
```

**Save .json** downloads it. **Export bundle…** writes the same thing as a zip with the photos
alongside it as real files. **Open file…** loads either back. **New atlas** clears to an empty
world. The **Name** and **Tagline** fields rename the atlas — the header and the browser tab follow.

`territories` is keyed by country **name**, not by the map's numeric id, so a file survives a change
of map dataset; `fid` is written as a hint and only used when the name matches nothing. A territory
the map cannot place keeps its values and is written back out untouched.

Your work is also written to this browser's storage after every change, so closing the tab loses
nothing. That copy is per-browser and per-device; the file is how you move between them, and how you
back up. **Space used** at the foot of the overview shows the photo count and how much room is left.

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
| `values` | optional | One entry per scale, `{"difficulty": 3}`, keyed by the scale's `key`. |

IDs are slugs like `peru/nazca-lines`, not positions, so you can reorder, insert and delete freely
without your ticks sliding onto the wrong sites. Keep an `id` stable and its progress follows it.

`country` is matched against [Natural Earth](https://www.naturalearthdata.com/) names at 110m
resolution, with aliases for the common variants (`USA`, `UK`, `Russia`). A few use cartographic
short forms — `Dem. Rep. Congo`, `Macedonia`, `Bosnia and Herz.`, `N. Cyprus` — and very small
states are not in the dataset at all. A site whose country does not resolve still appears on the map
at its coordinates, but gets no country page; unresolved names are logged to the browser console.

Natural Earth assigns no ISO number to the territories it does not treat as states, so the dataset
gives `N. Cyprus`, `Somaliland` and `Kosovo` no id at all. The app assigns those an id of its own
from the name (`x-n-cyprus` and so on), which is what keeps them three separate countries rather
than one. Those ids appear in `progress.countries` in place of a number.

`sites` also accepts the compact array form `["Country", "Name", "hook", "lore", lat, lng]`, which
is easier to type in bulk.

## Export bundles

A `.json` save carries its photos as base64 inside the record, which makes them a third larger than
they need to be and reachable by nothing but this app. **Export bundle…** writes a `.zip` instead:

```
my-atlas.atlas.zip
├── atlas.json                          the whole atlas, photos named rather than carried
├── photos/
│   └── peru/nazca-lines-01.jpg         cut to one format, one size, one naming pattern
├── photos.csv                          a row per picture: site, country, coordinates, scales, notes
└── README.txt                          what the settings were
```

Drop the `.zip` straight back into **Open file…** and everything returns — progress, notes, main
photo pointers and all. Nothing else needs to understand it: the photos are ordinary picture files.

| setting | |
|---|---|
| Sites | All, visited only, or only those with photos. |
| Photos | Every photo, the main one only, or none — data only. |
| Format | JPEG, WebP or PNG. A format the browser cannot write is refused rather than silently swapped. |
| Quality | Ignored for PNG. |
| Long edge | 640 to 2048 px, or as stored. |
| Shape | As shot, or cropped from the centre to 1:1, 4:3, 3:2 or 16:9. |
| Photos smaller than that | Left at their own size by default; scale up if every file must match exactly. |
| File naming | `{country}` `{site}` `{n}` `{index}` `{date}` `{atlas}`. A slash makes a folder; the extension is added for you. |

The zip is written with no compression, which is the right choice for files that are already
compressed and means reading one back needs no inflate. A bundle another tool has recompressed is
still read, through the browser's own `DecompressionStream`.

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

## Versions

The running version is printed at the foot of the **Atlas** overview panel and lives in one place in
the source: `APP_VERSION` in `index.html`. Two things follow it and are bumped by hand alongside it:
`CACHE` in `sw.js`, whose name is what retires the previous release's cached files, and
`SAVE_VERSION`, which changes only when the shape of a save file does.

| | |
|---|---|
| 1.3.0 | Scales: a number per site and per territory, defined by the atlas. Export bundles (`.zip`) with the photos as files. Attachments now kept at 1600px. Save format 3. |
| 1.2.0 | Photos moved to IndexedDB, ending the loss of recent attachments. Gallery of every site. Country and site selected together. N. Cyprus, Somaliland and Kosovo separated. Save format 2, unchanged. |
| 1.1.0 | Photo grid, full-screen viewer, and a main photo per site (`cover`). Save format 2. |
| 1.0.0 | First release. Save format 1. |

Every format change so far has been an addition, so an older file opens unchanged. Format 2 adds the
optional `cover` pointer — a site with photos and none simply treats the first as its main one.
Format 3 adds `scales`, `territories` and per-site `values`; a file without them opens as an atlas
that has no scales, and saving it back writes a format 3 file with those parts empty.

## Where photos are kept

Photos are downscaled to 1600px on the long edge and stored as data URLs. In a **save file** they are
embedded, which is what keeps one file self-contained — a heavily illustrated atlas therefore gets
large. Up to 1.2.0 the limit was 1000px; it was raised so that an exported bundle contains real
pictures rather than thumbnails. Photos attached before then keep the size they were stored at.

In the **browser**, up to 1.1.0, the whole atlas including its pictures went into `localStorage`.
That is capped near 5 MB, so past roughly twenty photos every write threw and each edit made after
that was gone on the next visit — newest first, which is why it read as "the last ones disappear".

From 1.2.0 the atlas lives in IndexedDB instead: the record in one store, each photo on its own key
in another. The quota is orders of magnitude larger, and editing a note no longer rewrites every
picture. An existing `localStorage` atlas is moved across automatically the first time 1.2.0 runs;
a browser with no IndexedDB at all falls back to the old behaviour, and the overview says which is
in use.

The app also asks for persistent storage, which stops a browser reclaiming the atlas on its own.
That is a request, not a guarantee, and clearing site data still erases everything — so keep a file
copy of anything you would not want to lose.

Map geometry is [world-atlas](https://github.com/topojson/world-atlas) (Natural Earth, public
domain), rendered with [D3](https://d3js.org/) and topojson-client, both loaded from a CDN and
pinned with subresource integrity.

The country outlines are simplified for size. Small islands and fine coastline are absent, so a site
on one can sit slightly outside the landmass it belongs to. This is cosmetic — the dot is at its real
coordinates.

`version` in the save file is the hook for format changes; the reader is tolerant rather than
strict, so nothing reads it yet — it is there for a change that cannot be absorbed silently.
`app` records which build wrote the file.

The zip reader and writer are a few dozen lines in `index.html` — store method, CRC-32 and a central
directory. There is no dependency to add and nothing to keep up to date, which for a page that has
to work offline is worth more than the compression it gives up.

## Licence

MIT — see [LICENSE](LICENSE).
