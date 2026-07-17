# Travel content guide

The public page is generated at `/travel/`. Each destination is one Hugo page
bundle under `content/travel/`.

## Add a destination

Copy an existing destination directory, rename it with an ASCII slug, and update
`index.md`. Administrative levels use an ordered `admin_path` because the
correct hierarchy differs between countries.

```yaml
---
title: Hangzhou
id: hangzhou
geography:
  continent: { id: asia, label: Asia }
  country_or_area: { id: china, label: Mainland China }
  admin_path:
    - { kind: province, label: Zhejiang }
  place_kind: { id: sub-provincial-city, label: City }
  card_badge: Provincial capital
coordinates: { lat: 30.2741, lon: 120.1551, zoom: 9 }
trips:
  - id: hangzhou-2025-spring
    status: visited
    when:
      start: "2025-04-03"
      end: "2025-04-07"
      display: "3–7 April 2025"
      precision: day
    note: A short note about this visit.
    photos:
      - file: west-lake.jpg
        alt: West Lake in the early morning
        thumbnail_focus: top
        when:
          start: "2025-04-04T06:30:00+08:00"
          end: "2025-04-04T07:15:00+08:00"
          display: "4 April 2025, 06:30–07:15"
        note: Mist over the water before the paths became busy.
        spot:
          name: West Lake State Guest House
          kind: hotel
          area: Xihu District
          coordinates: { lat: 30.2337, lon: 120.1370 }
          show_pin: false
_build: { render: never, list: local, publishResources: false }
---

An optional destination-level description can be written here in Markdown.
```

`place_kind.id` may retain a precise administrative classification, while its
visible `label` should stay simple. Every destination should have a
`card_badge`: use `City` for an ordinary city, or a more informative label such
as `Capital`, `Provincial capital`, `State capital`, `County`, `Town`, `Lake`,
or `Special Administrative Region`.

For a direct-administered municipality such as Beijing, Shanghai, Tianjin, or
Chongqing, use `place_kind.id: municipality` and keep `admin_path` empty. The
archive card will show the municipality's own name in the province-level line,
while the map and detail breadcrumb retain the country or region context.

Put `west-lake.jpg` beside `index.md`. A photo may instead use a relative
subdirectory such as `2025-spring/west-lake.jpg`.

Photos within each trip are displayed in ascending order by `when.start`.
Photos with the same date retain their order in the content file. Thumbnails
use a centered crop by default; set `thumbnail_focus` to `top` or `bottom` when
the important subject would otherwise be cropped. Opening a thumbnail still
shows the complete fitted image.

## Time fields

- Quote ISO values in `start` and `end` so they remain unambiguous.
- A single moment needs only `start`.
- A range uses both `start` and `end`.
- `display` is the natural English text shown on the page, so approximate
  periods such as `Spring 2027` are allowed.
- A photo without its own `when` inherits the trip's displayed period.

## Multiple visits and future plans

Add another entry to `trips`; do not duplicate the destination directory.
Use `status: visited` for past visits and `status: planned` for future plans.
The page automatically gathers planned trips into **Future travel plans**.

For public future plans, prefer a season or month. Do not publish exact future
accommodation, transport, or real-time itinerary details.

## Photo-specific places

A hotel, campus, museum, or attraction belongs under the photo's `spot`; it is
not part of the destination's administrative hierarchy. Coordinates are
optional. Omitting coordinates is the safest choice when the exact place is
private.

`show_pin: false` controls presentation only. It does not hide coordinates
from a public source repository, so remove sensitive coordinates entirely.
