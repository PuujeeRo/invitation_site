# Naashir — Product Plan (v1)

## 1. Core Idea
Naashir lets a user create an event invitation in a few clicks, share it as a link on Messenger, and let guests open the link, view an animated invitation page, and answer RSVP directly. The organizer sees a live dashboard of guest responses.

## 2. Pricing

### Free Plan
- Free, but invitation is active for **7 days** only
- Watermark shown on the invitation
- Free RSVP guest limit depends on event type:
  - Small events (birthday, kid's 1st birthday, other) — **10 free guests**
  - Big events (wedding, graduation) — **100 free guests**

*7 days is usually enough for people to RSVP before the event. This also pushes people who need it longer to upgrade.*

### Paid Plan — 999₮ / event
- No watermark
- Unlimited RSVP guests
- Custom design / theme colors
- Custom invitation text — edit the greeting, wording, and template text freely (free plan uses fixed template text only)
- Photo / video upload
- Map link
- Countdown timer

*999₮ feels like almost nothing — an easy, friendly impulse purchase, similar in size to a cup of coffee. Much friendlier than a 4,999₮ price point.*

### Optional Add-on (later, not in MVP)
- Bank account for gifts — possible +500₮, or bundled into a future 1,999₮ Premium tier after demand is tested

#### Bank / Gift Feature — Detail
This is likely the single most-used feature in Mongolia (weddings, birthdays). Two levels:

**Level 1 — Simple (easy to build first)**
- Organizer enters: bank name, account number, account holder name
- Guest sees a "🎁 Gift" card on the invitation page
- Button: **"Данс хуулах" (Copy account number)** — copies number to clipboard, shows "Хуулагдлаа ✅"
- No real banking integration needed — just text + copy button

**Level 2 — Deep link to guest's banking app (nicer, more work)**
- Button: **"Мөнгө шилжүүлэх"** — tries to open the guest's own banking app directly with the account pre-filled, using each bank's URL scheme, for example:
  - Khan Bank app: `khanbank://transfer?account=...`
  - Golomt SocialPay: `socialpay://...`
  - State Bank, TDB, Xac Bank — similar app deep links
- If the guest doesn't have that bank's app installed, fallback to showing the account number + copy button (Level 1)
- This needs testing per bank, since deep link schemes are not officially documented — may need trial and error or contacting each bank

**Recommendation:** ship Level 1 first (just copy-account-number). Add Level 2 only if users ask for it — deep links add real engineering time and depend on things outside your control (each bank's app).

| Feature | Free | 999₮ / event |
|---|---|---|
| Watermark | Yes | No |
| RSVP guest limit | 10 or 100 (by event type) | Unlimited |
| Custom design | No | Yes |
| Custom invitation text | No (fixed template text) | Yes |
| Photo/video, map, countdown | No | Yes |

## 3. MVP Feature List
Build only this for version 1:

1. Event type selector: Birthday / Wedding / Kid's 1st Birthday / Graduation / Other
2. Simple form: Name, Date, Time, Location, One photo, Short description
3. Guest personalization (optional): organizer can add guest first name + last name when sharing individually. Invitation page shows a personalized greeting, e.g.:
   *"Хүндэт Б. Пүрэвсүрэн, таныг [event_name] [event_type]-д урьж байна."*
   If no name is entered, show a generic greeting instead.
3. 5–8 templates (fewer but nicer is better than 10–20 for v1)
4. Generate a unique URL, e.g. `naashir.com/bat-dorj-4x9k`
5. Guest RSVP page: Yes / No / Maybe + number of people attending
6. Organizer dashboard: total invited, going, not going, no answer
7. Share button that opens Messenger directly
8. Email invitations (optional): organizer can enter guest email (optional field) to also send the invitation by email, not only by link.
   - **Free plan:** up to 10 email sends per event
   - **Paid plan:** unlimited email sends
   - Backend: use **Resend** (resend.com) for sending — has a free tier (~3,000 emails/month) and works well with Node.js. Avoid sending from a personal Gmail account — Gmail has daily limits (~500/day) and often flags automated sending as spam.

### Guest Counting Rule
- **Count = number of unique devices that submitted RSVP, not link opens and not button clicks.**
- When a guest first opens the invitation, generate a random guest ID and save it in their browser (`localStorage` or cookie) — this identifies "this device" for this event.
- RSVP is stored as one row per `(event_id, guest_id)` pair. If the same device changes their answer later (Yes → No), it **updates** that row — it does not create a new one. So clicking Yes/No multiple times never inflates the count.
- The guest count for the free limit = number of unique `guest_id` rows for that event.
- The 10 / 100 free limit means "up to 10 (or 100) unique devices can submit an RSVP."
- When the limit is reached, the next new device sees: *"This invitation reached its free guest limit. Ask the organizer to upgrade."* The organizer sees: "Upgrade for 999₮ to unlock unlimited guests."
- Known trade-off: if the same person opens the link on two devices (phone + laptop), that counts as 2 guest slots, since there is no login system. This is acceptable for MVP — most guests will only RSVP once, from their phone via Messenger.
- Simple database rule: `rsvp` table has a unique constraint on `(event_id, guest_id)`. Use an "upsert" (insert or update) when saving an RSVP, and count rows with `SELECT COUNT(*) FROM rsvp WHERE event_id = X` checked against the plan limit before allowing a new guest_id to insert.

## 5. Not in MVP (add later, based on user feedback)
- Photo album from guests
- Background music
- Bank account / gift money
- Countdown widget
- Google / Yandex map embed

## 6. Pricing Roadmap — Future Plans

The core audience is normal people planning 1–2 events per year, so **per-event pricing stays the main plan**. A subscription only makes sense for a different, smaller audience: businesses that make many events (wedding planners, event agencies, schools). Do not build this in MVP — add it later, only after real demand appears.

**Phase 1 (MVP, launch):**
- Free plan (7-day limit, watermark, 10/100 guest limit)
- 999₮ / event paid plan

**Phase 2 (later, after demand is validated):**
- Yearly plan for businesses — e.g. **49,000₮/year, unlimited invitations** — for wedding planners, event agencies, schools
- Not monthly: most users only need this occasionally, and a monthly bill feels wasteful for one-time personal events — this is why per-event stays the default for individuals
- Not lifetime: a single one-time payment creates ongoing support cost with no continuing revenue; avoid as a permanent option. Could still be used briefly as a limited-time "founding user" deal to get early cash and first customers, but not as a standing plan.

## 7. Suggested Build Order
1. Invitation builder + URL generation
2. RSVP page + guest dashboard
3. Payment (QPay / SocialPay) for the 999₮ unlock
4. Everything else, based on real user feedback
