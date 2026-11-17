# Customer app: profile, consent, addresses, account deletion

All the endpoints here need a **customer** access token (see [auth.md](auth.md)). Each one also returns the usual codes:
- `UNAUTHORIZED`, `ACCESS_TOKEN_EXPIRED`, `FORBIDDEN`, `RATE_LIMITED`, `SERVICE_UNAVAILABLE`, `INTERNAL_ERROR`;
- `ACCOUNT_DISABLED`: show the support message and do not retry.

**`UNAUTHORIZED` can also mean the account was deleted** (on another device) while the token was still valid. Clear the tokens and go to sign-in.

Every write takes effect at once; nothing here goes to review. A write may answer `TRANSACTION_CONFLICT` when another change to the same account was saved at the same moment. Nothing was saved, so send the same request again.

## Start-up and the account screen

1. `GET /v1/customer/me` returns:
   - the customer's own phone number in full (the only response that shows it unmasked);
   - `fullName`, which is `null` until given;
   - `email`, which may be `null`;
   - `preferredLanguage`, `ar` or `en`;
   - `profileComplete`;
   - `marketingConsent`, as `{ granted, changedAt }`.
2. If `profileComplete` is `false`, the app may show the profile completion screen. The customer can skip it (see [auth.md](auth.md#profilecomplete-and-the-completion-screen-customer-app)).

## Profile screen (and the name step after the first sign-in)

`PATCH /v1/customer/profile` sends only the fields that changed:

| Field | Rules |
|---|---|
| `fullName` | 2 to 60 characters, trimmed. Can be changed, not removed: `null` is `VALIDATION_FAILED`. A name makes the profile complete. |
| `email` | Optional, up to 254 characters, stored in lowercase. `null` or `""` removes it. |
| `preferredLanguage` | `ar` or `en`. Can be changed, not removed. |

The answer is the whole profile. Use `preferredLanguage` for the app language if the customer chose one, and send it as `Accept-Language`.

## Marketing messages switch

`PUT /v1/customer/profile/marketing-consent` with `{ "granted": true }` or `{ "granted": false }`.
- Marketing is **opt-in**: until the customer grants it, it is not granted.
- Every change is recorded and kept, as proof of consent.
- Sending the current value again records nothing and returns it unchanged, so it is safe to repeat.
- The answer is `{ granted, changedAt }`. `changedAt` is `null` when the customer has never chosen.

The current value is also in `GET /v1/customer/me`.

## Address book

**List:** `GET /v1/customer/addresses` returns `{ items: [...] }` with every address, **default first**, then newest first.
- At most 10; not paged, so there is no cursor.
- An empty `items` means none is saved yet.
- Use the same list for the delivery address picker.

**Add an address** (map pin, then a form):
1. The customer drops a pin. The app fills the readable fields from the point (reverse geocoding), and the customer may edit them.
2. `POST /v1/customer/addresses`:

| Field | Rules |
|---|---|
| `label` (required) | 1 to 30 characters: "البيت", "العمل" |
| `location` (required) | `{ latitude, longitude }` in degrees, as JSON numbers |
| `city`, `district`, `street`, `building` | optional, up to 100 characters each; blank or `null` is saved as `null` |
| `shortNationalAddress` | optional, the 8-character Saudi short address (`RRRD2929`); Arabic digits and a space are accepted and normalised |
| `driverInstructions` | optional, up to 300 characters |
| `isDefault` | optional; `true` makes it the default instead of the current one. The first address is always the default. |

3. On `ADDRESS_LIMIT_REACHED` (409), the customer already has the maximum (`details.limit`, 10). Nothing was saved; ask them to delete one first.

Whether the point is inside a delivery area is **not checked yet**. Delivery zones are not built (see [not-built-yet.md](not-built-yet.md)).

**Edit an address:**
1. Load it with `GET /v1/customer/addresses/{id}`.
2. Save the changed fields with `PATCH /v1/customer/addresses/{id}`.
   - For the readable fields, `null` or blank clears the field.
   - `label` and `location` can be changed but not removed.
   - Being the default does not change here.

**Set as default:** `POST /v1/customer/addresses/{id}/default`, with no body.
- Exactly one address is then the default.
- Repeating it is safe.
- Reload the list, or move the item to the top yourself.

**Delete:** `DELETE /v1/customer/addresses/{id}` answers 204.
- If it was the default, the newest remaining address becomes the default, so reload the list.
- Deleting the last address leaves none.

**`NOT_FOUND` on any address id:** the address does not exist, belongs to someone else, or was deleted on another device. Reload the list.

## Delete my account

Apple and Google require in-app account deletion. The flow:
1. **Confirmation screen.** Explain what happens:
   - every session ends, in every app;
   - the profile, addresses and vendor applications not yet approved are removed;
   - the phone number can sign up again later as a new user.

   Offer the reasons (optional, from this fixed list; never free text):

   | `reason` | Suggested label |
   |---|---|
   | `not_using` | I don't use the app anymore |
   | `privacy` | Privacy concerns |
   | `bad_experience` | I had a bad experience |
   | `other_account` | I have another account |
   | `other` | Something else |

   The labels are the app's own; translate them in the app.
2. Call `DELETE /v1/customer/me?reason=not_using` (leave `reason` out if none was chosen).
3. The outcome:
   - **204:** delete the tokens from the device and go to the sign-in screen. The account is gone; the old refresh token no longer works.
   - **`RECENT_SIGN_IN_REQUIRED` (403):** the customer signed in more than 10 minutes ago. Run the sign-in flow again (a new code by SMS), then repeat the deletion. It is not a token refresh (see [auth.md](auth.md)).
   - **`ACCOUNT_HAS_STAFF_ACCESS` (409):** the same phone has vendor, kitchen or admin access. It cannot be deleted in the app: show the message and a way to contact support.
   - **`ACCOUNT_DISABLED` (403):** deletion of a disabled account goes through support.

## Sign out

- **On this device:** `POST /v1/public/auth/logout` with the refresh token (see [auth.md](auth.md)).
- **On every device:** `POST /v1/customer/auth/logout-all`. It ends every customer session of this user, this one included; delete the tokens afterwards. Access tokens already issued keep working until they expire (15 minutes by default). The same person's dashboard sessions are not touched.
