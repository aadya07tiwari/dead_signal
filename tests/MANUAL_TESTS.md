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

## Member A cross-testing

1. Open several applications and verify focus order, dragging, resizing, maximize, minimize, taskbar switching, closing, and restored positions.
2. Complete all Evidence Board connections with pointer and keyboard; verify deductions, line rendering, removal, timeline completion, and ending requirements.
3. Navigate the desktop, dialogs, Settings, Audio Lab, System Monitor, Terminal, and endings using only the keyboard with visible focus throughout.
4. Verify text size, contrast, reduced motion/glitch, subtitles, volume, and decorative-effect settings consistently affect Audio Lab, the remote-wipe finale, and terminal feedback.
5. Confirm clue-bearing notifications remain in history and no essential information is lost when a toast or dialog closes.

## Member B finale and destructive recovery

1. Reach the archive/audio finale condition and verify the unfamiliar host, network entries, `remote_wipe`, countdown, and file deletions appear in Monitor and Explorer.
2. Protect immediately, protect after multiple deletions, and ignore the warning; verify early, late, and ignored outcome summaries respectively.
3. Hide the browser tab during the countdown and confirm deletion pauses; reload mid-finale and confirm the saved step resumes.
4. Recover pre-hold deleted items through scan, validation, and restore; confirm double restoration is refused.
5. Test Empty Bin, context-menu deletion, Shift+Delete, and `rm --permanent <file>`; verify typed `DELETE`/terminal y-N confirmation and cancellation.
6. Activate Evidence Hold and confirm all permanent-deletion routes are refused and logged as tampering attempts.

## Final regression matrix

1. Complete one clean-start playthrough and one resumed-save playthrough, including boot, login, Caesar puzzle, Mail, hints, Explorer, Recycle Bin, Audio Lab, Monitor, Evidence Board, Terminal, and all endings.
2. Repeat the critical path at 760px, 600px, and 360px widths and confirm every control and dialog remains reachable.
3. Run a keyboard-only playthrough with reduced motion enabled.
4. Corrupt the primary test save, verify backup recovery, then corrupt both test slots and verify quarantine/export/fresh-session behavior.
5. Disable storage in a disposable browser profile and verify the non-blocking memory-only warning without gameplay failure.
