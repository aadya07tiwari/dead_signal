# Dead Signal

Dead Signal is a browser-based recovery workstation built with plain HTML, CSS, JavaScript and optional PHP persistence hooks. Unlocking the recovered NEXUS-7 account opens a functional desktop with window management, project files, system tools and the investigation workflow.

## Theme continuity

The desktop derives its scoped workspace tokens from the landing screen itself: matte black monitor framing, ivory paper, muted salmon inputs, dark brown controls, sepia imagery and amber system warnings. The same `investigation-room.png` and `newspaper-collage.png` assets continue behind the desktop so login and workspace read as one recovered machine.

Muted salmon and brown are used for active states and focus, while amber remains reserved for system warnings. Window motion uses the shared duration token and respects the existing reduced-motion setting.

## Run locally

Serve the repository with any local web server. For the PHP progress endpoint, run it through Apache/XAMPP or PHP's built-in server. The front end fails softly and keeps progress in `localStorage` when PHP is unavailable.

```text
php -S localhost:8080
```

Then open `http://localhost:8080`.

The recovery password shown by the login-screen clue is `0317`.

## Gameplay systems

- **Contextual hints:** the current objective is derived from saved puzzle state. Hints progress from a broad nudge to a direct answer. In Settings, players can choose manual hints, an inactivity suggestion after 2/5/10 minutes, or disable hints. Suggestions do not reveal a hint or affect the No Hint badge.
- **Progression controller:** `js/game-controller.js` owns objective/act transitions, application gates, ending eligibility, progressive hint selection, and checkpoint snapshot creation. UI code reads these rules instead of duplicating them.
- **Save and resume:** progress remains in `localStorage`, optionally mirrors to the PHP endpoint, and manual checkpoints preserve both game state and open-window layout.
- **Accessible workstation:** Settings provide reduced motion and glitches, paused decorative effects, global subtitles/transcripts, high contrast, text sizing, and independent master/voice/effects volume preferences.
- **Recovery path:** identify and restore `AUD_0017.wav` from Recycle Bin, isolate its Voice transcript at `0.75×`, complete `D _ W _` as `DAWN`, then run `open archive`, `unlock archive DAWN`, and `recover final_message.enc` in Terminal.
- **Reactive finale:** `observer_service.exe` establishes the earlier remote-observer beat; the later evidence hold produces early, late, or ignored outcomes that change ending eligibility and narrative.

## Testing

Run the dependency-free controller tests with:

```text
npm test
```

The suite covers objective transitions, application locks, save migration, the audio-puzzle requirements, finale consequences, progressive hints, ending eligibility, and checkpoint snapshot isolation. The browser QA page in `tests/qa.html` runs 21 dependency-free checks. The full recovery, audio, hint, save/resume, progression, and ending checklist is in `tests/MANUAL_TESTS.md`.
