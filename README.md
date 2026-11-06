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
