**Deep Mindfulness — Values Assessment**

**Consolidated QA Bug Report**

*values.deepmindfulness.io/assessment*

**Prepared:** June 19, 2026     **Test window:** June 15–17, 2026     **Testers:** 4 (Aziz Ur Rehman, Talal Ahmed, Zafar Ahmad, Anil Kumar)

**Coverage:** 8 submissions (each tester on Desktop \+ Mobile). Evidence reviewed: form reports, 5 screenshots/PDFs, and 6 unique screen recordings.

# **1\. Executive Summary**

**Overall verdict:** the app is functional end-to-end — all testers completed account creation, the values selection, rating, results, and image download. No crashes or blocking defects were reported. **Issues cluster into three areas:** (a) authentication gaps, (b) the reassess / snapshot workflow, and (c) UI polish (hover/cursor, scroll, formatting).

**Severity rating from testers:** Aziz — Moderate; Anil — Moderate; Talal — Minor; Zafar — Minor. Two testers (Talal Desktop, Zafar) marked “worked correctly: Yes” with minor issues; Aziz marked “Partially.”

**Issues by severity (de-duplicated):** 

| Severity | Count | Theme |
| ----- | ----- | :---- |
| **High** | 0 | — |
| **Medium** | 4 | Auth \+ snapshot data integrity |
| **Low** | 7 | UI / UX polish & copy |
| **Info** | 1 | Seed/content review |

# **2\. Top Priorities (start here)**

* **Snapshot duplication & no-op snapshots** — “Save New Snapshot” can be clicked repeatedly; Aziz generated 15 duplicate snapshots from one session, and snapshots can be created with no changes. (Medium)

* **Silent data loss on Reassess** — modified answers are discarded when navigating away unless “Save Change” is clicked first; no warning is shown. (Medium)

* **Authentication gaps** — no “Forgot password,” no show/hide password toggle, and weak passwords accepted with no strength guidance. Reported by 3 of 4 testers. (Medium)

* **Global cursor / hover affordance** — buttons don’t switch to the hand pointer on hover, so clickable elements don’t feel clickable. Two independent video confirmations. (Low, but high-visibility)

# **3\. Detailed Findings**

**BUG-01  “Save New Snapshot” allows duplicate submissions**

| Severity | Medium |
| :---- | :---- |
| **Area** | Reassess / Snapshot history |
| **Steps to reproduce** | On the Reassess flow, click “Save New Snapshot” multiple times in quick succession. |
| **Expected** | Button disables after the first click (or de-dupes); one snapshot per save. |
| **Actual** | Each click creates a new snapshot. 15 consecutive clicks produced 15 identical snapshots from a single reassessment session. |
| **Reported by** | Aziz (Desktop \+ Mobile) |
| **Evidence** | Described in reports. Corroborated by Zafar snapshot screen showing multiple same-day entries (video z5). |

**BUG-02  No-op snapshots can be created with zero changes**

| Severity | Medium |
| :---- | :---- |
| **Area** | Reassess / Snapshot history |
| **Steps to reproduce** | Open Reassess, make no edits to values/descriptions/ratings, then save a new snapshot. |
| **Expected** | Saving without changes is blocked or no new snapshot is created. |
| **Actual** | A new snapshot is created even with no modifications, producing redundant history entries. |
| **Reported by** | Aziz (Desktop \+ Mobile) |
| **Evidence** | Reports; consistent with duplicate same-day snapshots seen in Zafar video z5. |

**BUG-03  Unsaved changes silently discarded when leaving Reassess**

| Severity | Medium |
| :---- | :---- |
| **Area** | Progress saving |
| **Steps to reproduce** | On a previously completed round, modify answers and click Continue (or navigate away) WITHOUT clicking “Save Change.” |
| **Expected** | Either auto-save, or warn the user that unsaved changes will be lost before navigating. |
| **Actual** | Changes are discarded with no warning dialog — potential accidental data loss. |
| **Reported by** | Aziz (Desktop \+ Mobile) |
| **Evidence** | Reports (Sections 3 & 4). |

**BUG-04  No “Forgot Password” / password recovery**

| Severity | Medium |
| :---- | :---- |
| **Area** | Authentication |
| **Steps to reproduce** | View the Sign in screen. |
| **Expected** | A “Forgot password?” link with a reset flow. |
| **Actual** | No recovery option exists; a locked-out user cannot regain access. |
| **Reported by** | Aziz (Desktop \+ Mobile), Zafar (Desktop), Anil (Mobile ref.) |
| **Evidence** | Aziz login PDF; Zafar login screenshots (“Welcome back” screen has no recovery link). |

**BUG-05  No show/hide password toggle**

| Severity | Low |
| :---- | :---- |
| **Area** | Authentication |
| **Steps to reproduce** | Enter a password on Create Account or Sign in. |
| **Expected** | An eye icon to reveal/hide the entered password. |
| **Actual** | No toggle present on either screen. |
| **Reported by** | Aziz (Desktop \+ Mobile), Anil (Desktop) |
| **Evidence** | Aziz login PDF; Anil report links (prnt.sc). |

**BUG-06  Weak passwords accepted; no strength guidance**

| Severity | Low |
| :---- | :---- |
| **Area** | Authentication |
| **Steps to reproduce** | Register with a password that only meets the 8-character minimum. |
| **Expected** | Strength meter / complexity guidance beyond bare length. |
| **Actual** | Only an 8-char minimum is enforced (“Please lengthen this text to 8 characters”); no strength feedback. |
| **Reported by** | Aziz (Desktop \+ Mobile) |
| **Evidence** | Aziz Create Account PDF (7-char rejection → 8-char accepted). |

**BUG-07  Missing hand-pointer cursor on buttons (global)**

| Severity | Low |
| :---- | :---- |
| **Area** | UI / affordance |
| **Steps to reproduce** | Hover the mouse over any button (e.g. “Continue to Reflection,” “Create account,” “Sign out”). |
| **Expected** | Cursor changes to the hand pointer over clickable controls. |
| **Actual** | Cursor stays as the default arrow; clickability is unclear. Anil notes this is global, including Sign out. |
| **Reported by** | Talal (Desktop), Anil (Desktop) |
| **Evidence** | Video: Hover\_effect\_-\_Talal\_Ahmed.mp4 (customize screen, Continue to Reflection). Anil screenshot (Create account button). |

**BUG-08  Answer cards flicker on hover over card border**

| Severity | Low |
| :---- | :---- |
| **Area** | UI / assessment list |
| **Steps to reproduce** | On the assessment selection screen, move the cursor onto the borderline between answer cards. |
| **Expected** | Stable hover state. |
| **Actual** | Cards flicker/jitter repeatedly; UI feels unstable during hover. |
| **Reported by** | Talal (Desktop) |
| **Evidence** | Video: Flickering\_-\_Talal\_Ahmed.mp4 (Round 56 of 71; cursor on COMFORT/COMMITMENT border). |

**BUG-09  Page does not scroll to top between steps**

| Severity | Low |
| :---- | :---- |
| **Area** | Navigation / UX |
| **Steps to reproduce** | Answer a step, then advance to the next step. |
| **Expected** | New step starts scrolled to the top. |
| **Actual** | Scroll position is retained, so the next step opens mid-page. |
| **Reported by** | Anil (Desktop) |
| **Evidence** | Anil report (prnt.sc link). |

**BUG-10  Snapshot history shows date only (no timestamp); same-day entries indistinguishable**

| Severity | Low |
| :---- | :---- |
| **Area** | Results / history |
| **Steps to reproduce** | Create more than one snapshot on the same day; open snapshot history. |
| **Expected** | Timestamps so same-day snapshots can be told apart. |
| **Actual** | Only the date is shown; multiple same-day snapshots all read identically. |
| **Reported by** | Aziz (Mobile), Anil (Desktop — “same date showing”) |
| **Evidence** | Reports; Zafar videos z5 / z2\_90 show multiple “June 2026” chips. |

**BUG-11  Copy & formatting polish**

| Severity | Low |
| :---- | :---- |
| **Area** | Content / formatting |
| **Steps to reproduce** | Review instructions and results copy. |
| **Expected** | Sentence-case consistency; clear onboarding; aligned result numbering. |
| **Actual** | First letter of words not capitalized in places; results numbering misaligned; “Review My Answers” reloads the same screen; Home “15–20 minutes … free” wording unclear; first-time users want an intro/alert explaining what to do. |
| **Reported by** | Anil (Desktop), Zafar (Desktop) |
| **Evidence** | Anil report (multiple prnt.sc links); Zafar Section 2\. |

**BUG-12  Other reported gaps to confirm**

| Severity | Info |
| :---- | :---- |
| **Area** | Authentication / flow |
| **Steps to reproduce** | — |
| **Expected** | — |
| **Actual** | Anil notes: no verification email on signup, and after Sign Out the user is not redirected back to the login screen. Confirm intended behavior with product. |
| **Reported by** | Anil (Desktop) |
| **Evidence** | Anil report. |

# **4\. Tester Coverage Matrix**

| Tester | Device | Environment | Severity | App worked? |
| :---- | :---- | :---- | :---- | :---- |
| Aziz Ur Rehman | Desktop | Win 11 / Chrome | Moderate | Partially |
| Aziz Ur Rehman | Mobile | iOS 18 / Android 13 / Chrome | Moderate | Partially |
| Talal Ahmed | Desktop | Win 11 / Chrome | Minor | Yes |
| Talal Ahmed | Mobile | iPhone XS / Safari | No issues | Yes |
| Zafar Ahmad | Desktop | Win 11 / Chrome | Minor | Yes |
| Zafar Ahmad | Mobile | Android (SM-A245F) / Chrome | No issues | Yes |
| Anil Kumar | Desktop | macOS / Chrome | Moderate | Yes |
| Anil Kumar | Mobile | Samsung S25 Ultra / Chrome | No issues\* | Yes |

*\* Anil’s Mobile submission deferred to “same bugs as Desktop Mode” rather than itemizing; treat his Desktop findings as applying to mobile too.*

# **5\. Evidence Index**

**Screen recordings (6 unique; 3 of the originally supplied files were byte-identical duplicates):**

* [Flickering\_-\_Talal\_Ahmed.mp4](https://drive.google.com/file/d/11CZPb7DxE1imI7DrS90Sj9PYCOOIidzy/view?usp=sharing) — assessment list, card flicker on border hover (BUG-08).

* [Hover\_effect\_-\_Talal\_Ahmed.mp4](https://drive.google.com/file/d/1tUfeTOVlewihW5sxH6L44TB_P9s0UEFq/view?usp=sharing) — customize screen, missing pointer on “Continue to Reflection” (BUG-07).

* [20260616\_134513\_-\_Zafar\_Ahmad.mp4](https://drive.google.com/file/d/1CQIfOnELFYEM02cc5TXpQvkAXRs8bRIO/view?usp=drive_link) — mobile login (“Welcome back”).

* [20260616\_134714\_-\_Zafar\_Ahmad.mp4](https://drive.google.com/file/d/157WcXB6Kg7z1tUbk8e7obA3H5K092rce/view?usp=drive_link) — mobile rating step (sliders / “How fully are you living it?”). \[3 identical copies submitted\]

* [20260616\_134956\_-\_Zafar\_Ahmad.mp4](https://drive.google.com/file/d/1Vap9EKK3eunvsX1Nin1CGCcVG7Ft5HNm/view?usp=drive_link) — mobile values/results list.

* [20260616\_135506\_-\_Zafar\_Ahmad.mp4](https://drive.google.com/file/d/1D_3t5m3SXtd5X8OGzPo1RuZVLfPQu5c6/view?usp=drive_link) — mobile login (email entry). \[2 identical copies submitted\]

* [20260616\_135755\_-\_Zafar\_Ahmad.mp4](https://drive.google.com/file/d/1yIbgveCd2ZyoQAj9mV-f_p4Ni4fhOeka/view?usp=drive_link) — mobile snapshot/history (Reassess / Retake test; same-month date chips).

**Images / PDFs:**

* [Login\_issue\_s\_-\_Aziz\_Ur\_Rehman.pdf](https://drive.google.com/file/d/1U-vYXlBUPu6od1vGDUhSJ8t1gjtY2RGP/view?usp=drive_link) — 4 pages: 8-char password enforcement, Create account, and two “Invalid email or password” states (no recovery link).

* [Cursor\_Hover\_pointer\_effect\_is\_missibg\_-\_Anil\_Kumar.png](https://drive.google.com/file/d/1MxoFbIwSuUfnl-B--5jq9fnshqy4tKVE/view?usp=drive_link) — Create account button, default arrow cursor.

* [Zafar “Welcome back” screenshots](https://drive.google.com/file/d/1MstN8UQpVCSfbXfDFgE7k5nmTnB-NcuO/view?usp=drive_link) (×3) — desktop sign-in, no “Forgot password” link.

* [my-values-2026-06-15\_-\_Zafar\_Ahmad.png](https://drive.google.com/file/d/1ZyIkx2gz_z9sW86sy2UzgrI4EBd983m_/view?usp=drive_link) — downloaded results image (10 values, all rated 5/10).

# **6\. Notes for the Developer**

* **Duplicate uploads:** Zafar’s recording for the rating step was uploaded 3× and the login step 2× (identical files). No data was lost — just flagging so they aren’t treated as separate evidence.

* **Reassess vs Retake test (UX):** Multiple testers found the distinction between “Reassess” and “Retake Test” unclear. Consider explanatory text or a confirmation describing each outcome.

*Prepared from 8 form submissions and all attached evidence. Severity labels are the report author’s consolidation of tester-reported severities.*

