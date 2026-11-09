# Dead Signal manual smoke tests

Run the site through a local HTTP server. Use a fresh browser profile or choose **Reset game** before the full-flow test.

## Recovery and progression

1. Unlock the workstation with `0317` and confirm Act 1 starts at Messages.
2. Confirm Recycle Bin is blocked before the Audio Lab sequence is completed.
3. Restore `AUD_0317.wav`, play through the signal, and confirm Recycle Bin becomes available.
4. Reconstruct and restore `FINAL_MESSAGE.enc`; confirm the objective advances to Evidence Board.
5. Confirm Terminal remains blocked until all six Evidence Board connections are complete.
6. Complete the board and confirm Terminal accepts `unlock system`, then `DAWN`.

## Audio

1. Confirm Audio Lab is gated before the filename puzzle is solved.
2. After recovery, verify play, pause, stop, seek, volume, speed, captions, descriptions, markers, and keyboard controls.
3. Play beyond 00:46 and confirm the `4 · 1 · 23 · 14` evidence is recorded only once.

## Hints

1. At each objective, reveal hints repeatedly and confirm they progress from broad guidance to the direct answer.
2. Set hints to **Off** and confirm the taskbar help button reveals nothing.
3. Set hints to **Suggest after inactivity**, choose a delay, and confirm one suggestion appears for the unchanged objective without increasing the hint count.
4. Interact with the desktop and confirm the inactivity timer resets.

## Save and resume

1. Open and arrange multiple windows, save a checkpoint, then make additional progress.
2. Resume the checkpoint and confirm puzzle state and window positions return to the saved values.
3. Confirm a checkpoint cannot bypass current application locks.
4. Reload without manually resuming and confirm normal `localStorage` progress remains intact.

## Endings

1. Confirm Broadcast and Silence are unavailable before final decryption.
2. Confirm Trace Mira remains disabled without both the location and external-session evidence.
3. Complete the timeline, pin both required evidence tags, and confirm all three endings become available.
