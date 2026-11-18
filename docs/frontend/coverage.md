# Coverage zones: do we deliver here?

Delivery areas are polygons that admins draw on a map. A point is **covered** when an **active** zone contains it. Inactive zones never count.

## Customer app: the map pin

`GET /v1/public/coverage/check?lat=24.7136&lng=46.6753` needs no token, so the app can call it before sign-in.

```json
{ "covered": true, "zone": { "id": "…", "name": { "ar": "وسط وشمال الرياض", "en": "Central and North Riyadh" }, "city": "الرياض" } }
```

- When the point is not covered, the answer is `{ "covered": false, "zone": null }`. `zone` is always present.
- `lat` is -90 to 90 and `lng` is -180 to 180, in degrees. A missing or out-of-range value gets `VALIDATION_FAILED`.
- A change an admin makes applies from the next request.

**Saved addresses** carry the same answer as `isCovered` on every address of `GET /v1/customer/addresses` (and on each single address the address endpoints return). It is worked out on every read, so it changes when the zones change. See [customer-profile.md](customer-profile.md).

## Admin dashboard: the zones map

All under `/v1/admin/coverage-zones`, with an admin token. Every change is audited.

| Call | Does |
|---|---|
| `GET /v1/admin/coverage-zones` | Every zone, active and inactive, newest first, paged by cursor (`{ items, nextCursor }`). |
| `GET /v1/admin/coverage-zones/{id}` | One zone. |
| `POST /v1/admin/coverage-zones` | Adds a zone: `{ name: { ar, en }, city, polygon, isActive? }`. `isActive` is `true` when left out. Answers 201 with the zone. |
| `PATCH /v1/admin/coverage-zones/{id}` | Changes only the fields sent: the name (both languages together), `city`, `polygon`, `isActive`. |
| `DELETE /v1/admin/coverage-zones/{id}` | Deletes the zone for good (204). To pause a zone, set `isActive` to `false` instead. |

A zone is `{ id, name: { ar, en }, city, polygon, isActive, createdAt, updatedAt }`.

**`polygon` is GeoJSON** (RFC 7946), in and out:

```json
{ "type": "Polygon", "coordinates": [[[46.55, 24.6], [46.85, 24.6], [46.85, 24.85], [46.55, 24.85], [46.55, 24.6]]] }
```

- Positions are `[longitude, latitude]`: **longitude first**, the GeoJSON order. Map libraries usually give `{ lat, lng }`, so swap them.
- The first ring is the boundary. Any further rings are holes.
- Each ring has at least four positions, and the last repeats the first.
- Coordinates come back rounded to 9 decimal places.

**`INVALID_POLYGON` (422):** the boundary is not a valid shape. Its edges cross, a ring is not closed or has fewer than four positions, or a position is out of range. Nothing was saved. Show the message and let the admin redraw the shape.

`NOT_FOUND`: the zone does not exist or was already deleted. Reload the list.
