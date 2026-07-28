# Enkiama — Deploy Manifest

## This batch: THE fix for "Sofie's letter shows in admin but not public"

### Root cause (found by tracing the exact execution order)
Sofie's letter is correct in every layer — approved, consented, readable by
anon, complete text. I verified the public query returns it. The bug was a
JavaScript **scope/timing race** on reflections.html:

- The page seeds 4 example letters and renders them on load — so the page
  looked like it was "showing letters" (the examples).
- Real approved letters (Sofie) are fetched asynchronously, added to the list,
  and the page must RE-RENDER to include them.
- But that re-render call sat in a different IIFE (scope block) than the
  renderLetters function it was trying to call. The reference resolved to
  nothing, the guard `typeof renderLetters === 'function'` came back false,
  and the re-render silently never happened.
- Result: the 4 examples showed; Sofie never did. Exactly your symptom.

### The fix
The re-render now calls `window.renderLetters()` explicitly and defers it one
tick, so it runs after all setup is complete regardless of network speed or
scope. Verified by simulation: on load 4 examples render; after the fetch,
Sofie appears at the top (newest). Same fix applied to the letters map render.

### Files changed
reflections.html only. JS parses; one focused change to the fetch callback.

### After deploy — verify (30 seconds)
1. Push, then HARD-REFRESH reflections.html (Ctrl-Shift-R) to clear old JS.
2. Sofie's letter (Kilimanjaro) should now appear at the TOP of the letters,
   above the example letters, as a full anthology entry.
3. If you approve another consented letter in admin, it will appear too.

### Note
This was a genuine bug I introduced/left in an earlier pass by splitting the
render logic across scopes. Fixed now, and simulated to confirm.

### Still parked (by request)
- notify Edge Function secrets; disable open sign-ups toggle.
