# AGENTS.md

## Repo shape

Two things live side by side:

- `app/` — the real app: Vite 8 + React 19 + TypeScript + Tailwind CSS v4 + React Router 7 + Zustand 5.
- 18 directories at the root, one per screen, each with `code.html` and `screen.png`. These are **static design comps** and the visual source of truth; they are not part of the app build and should not be edited unless the task is about the mockups themselves.

There is no backend, test suite, or CI. The repository is local only (no remote).

## App commands

Run from `app/`:

```bash
npm install        # first time only
npm run dev        # http://localhost:5173
npm run build      # tsc -b + vite build (use this to verify)
npm run preview    # serve dist/
npm run lint       # oxlint
```

`npm run build` is the only typecheck. There is no test runner; verify UI changes in a browser at phone width (~390 px) and check the console.

## App architecture

- Routes live in `src/App.tsx`. Tab routes (`/feed`, `/search`, `/saved`, `/profile`) use `TabLayout` + `BottomNav`; detail/create/notifications/leaderboard/top-dishes/settings and the story flow (`/stories/*`) are standalone screens.
- Design tokens are defined **CSS-first** in `src/index.css` under `@theme` (`primary`, `surface`, `surface-dark`, `ink`, `muted`, `line`, `font-display`). There is no `tailwind.config.js`; do not add one.
- Dark mode is class-based (`@custom-variant dark`), applied to `<html>` by an inline script in `index.html` and `src/lib/theme.ts`. Keep `dark:` variants in sync.
- Mobile shell: `AppShell` centers content in `max-w-md` with `min-h-dvh`; the bottom nav is fixed and uses `.pb-safe`.
- Images are local in `public/img/` (served as `/img/...`). `src/data/images.json` maps every downloaded image to its original mockup, screen, and alt text — consult it before adding new photos.
- User-facing copy is Spanish. Brand is **YummySocial**; the mockups also contain "Dinner Dish", but the app uses one brand and one palette.
- Demo data is meant to be persisted in `localStorage`; no backend or real auth.

## Demo data, session and routing guards

- `src/types.ts` defines `User`, `Recipe`, `Comment`, `AppNotification`, `Story` and `StoryHighlight`, plus `RecipeInput`, `ProfileInput` and `StoryInput` for the forms. `src/data/seed.ts` holds the demo users, 8 recipes (3 saved by the demo account), comments, notifications, 11 stories and 4 highlights; the demo account is `u-jesse` (`DEMO_USER_ID`) and starts without published recipes.
- `src/store/useAppStore.ts` is the single Zustand store, persisted under `yummysocial:store` (version 2). It exposes `login`, `logout`, `completeOnboarding`, `toggleLike`, `toggleSave`, `addComment`, `addRecipe`, `updateProfile`, `toggleFollow` (also updates the followers/following counters), `addStory`, `deleteStory`, `markStoryViewed`, `addHighlight`, `removeHighlight`, `unlockSecrets`, notification actions and `resetDemoData`. Helpers: `useCurrentUser()`, `useUnreadNotifications()`. The secret ingredient/step of a recipe unlocks when the user has at least `SECRET_STAR_COST` (50) stars; unlocked recipe ids live in `unlockedSecrets`.
- The custom persist `merge` keeps seed content authoritative while restoring the user's likes, saves (including `savedAt`), comments, follows, secret unlocks, notification read state and session. It also preserves recipes created by the user (ids not present in the seed), the editable profile fields and the follow counters. For stories it restores created stories, viewed ids and highlights, drops expired stories, and respects `hiddenStories`/`hiddenHighlights` tombstones so deleting a seed story or highlight survives reloads. When adding fields, update `merge` too.
- Route guards live in `src/App.tsx`: `HomeRedirect` (`/`), `WelcomeRoute` (no session only), `OnboardingRoute` (session without onboarding) and `Protected` (requires session + completed onboarding, wraps tab routes, create/detail/notifications/leaderboard/top-dishes/settings and the story flow).
- The welcome buttons call `login()` and go to `/onboarding` (or `/feed` if already onboarded). Onboarding has 4 swipeable slides and can be skipped; Settings handles theme, logout and `resetDemoData`.
- `/profile` shows real stats, the rank card, a highlights row and the Recetas/Guardadas tabs. The edit sheet updates name, username, bio, location and avatar. Highlights are real: "Nueva" opens the story picker, tapping a highlight opens `/stories/:userId?s=<storyId>` and the viewer menu can add, rename or remove a highlight.
- `/create` persists a draft under `yummysocial:recipe-draft` (restored on return and cleared on publish). Cover uploads are compressed to ~1200 px JPEG by `src/lib/image.ts`; example photos are available from `/img`. Publishing calls `addRecipe` and opens the new detail. `src/lib/ranks.ts` maps stars to the five community ranks.
- `/search` filters and sorts the catalogue with `src/lib/recipeFilters.ts` (accent-insensitive text search across title, description, tags, author and ingredients; time, difficulty and tag chips; recent/popular/rated order). `/saved` lists `savedByMe` recipes, filters by tag/text, sorts by `savedAt` and allows quick unsave with `RecipeCard`'s optional `onRemove`. `/notifications` groups by day, filters by unread/mention/system, marks rows read on open and toggles `Seguir`/`Siguiendo` for follow notifications; copy and grouping live in `src/lib/notifications.ts`.
- `/leaderboard` ranks chefs with `src/lib/rankings.ts` by stars (default), likes received in the last 7 days or followers; it shows a top-3 podium, the rest of the list and a sticky row for the current user when they are outside the podium. `/top-dishes` ranks recipes with at least one review by rating, review count or likes, with category/difficulty filters and links to each detail. Both are derived from the store with no extra persisted fields, and both share `RankingTabs`; access is via the feed header and the rank card in `/profile`.
- Stories: `/stories/new` (picker: camera, gallery or example photo; compresses with `readImageFile`), `/stories/new/editor` (9:16 canvas with text, palette and stickers, persisted under `yummysocial:story-draft`), `/stories/new/publish` (caption, tags, 12/24 h duration, audience, location) and `/stories/:userId` (full-screen viewer with segmented progress, 5 s per story or 7 s with overlay text, hold to pause, tap zones, swipe down, arrow keys and Esc). `src/lib/stories.ts` handles expiry, audience visibility, grouping and ordering; `src/lib/storyDraft.ts` the draft. The feed strip uses `groupStoriesByAuthor` plus `StoryRing`, and viewers mark stories as seen in `viewedStories`.
- Shared UI pieces for those screens: `SearchField`, `FilterChip`, `SegmentedControl`, `RankingTabs`, `EmptyState`, `StoryRing` and `StoryProgress`. The bell badge uses `useUnreadNotifications()` and is shown on feed, search, saved and profile.

## Working with the mockups

- `code.html` is the full page (not `index.html`); open it directly in a browser.
- Screen directories and several paths contain accented Spanish characters (`sesión`, `configuración`, `clasificación`, `más`). Quote paths in shell commands.
- Mockups are standalone: each has its own inline Tailwind CDN config, duplicated headers/nav, no shared components, and no working links (only `onclick="history.back()"` on the leaderboard). Don't infer app routing from them.
- Palettes differ per mockup; the app intentionally unifies them. When porting a screen, translate the mockup's classes to the app tokens instead of copying its inline `tailwind.config`.
- `_1`/`_2` suffixes are inconsistent: sometimes alternate takes (recipe detail, leaderboard, new recipe), sometimes different screens (onboarding vs saved recipes). Read both before choosing.
- `screen.png` is a reference render and is not regenerated by any script; it can be stale relative to `code.html`.
- Mockup images originally pointed at `lh3.googleusercontent.com`; they were downloaded and compressed into `app/public/img/`. Keep the app self-contained rather than hotlinking.
