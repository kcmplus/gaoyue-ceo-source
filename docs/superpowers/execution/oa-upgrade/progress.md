# SDD ledger — plan: docs/superpowers/plans/2026-10-18-oa-prototype-upgrade.md

Execution: Native approved by user. Implement inline; one independent final review.
Baseline: index SHA256 141807593DEF09C75DF53DA737F2F4DD668B2B8CB77AEE3D9FD686A663E06CA9. Source checkpoint in deliverables/checkpoint-oa-20261018. Member and governance baseline tests passed.
Ruling: No root Git repository; use the approved project directory, source checkpoint and persistent ledger instead of Git worktree/task scripts. No artificial repository initialization. Cost: checkpoints rather than commit-range review.
Pre-flight: Task1 capabilities feed all tasks; preserve legacy role enum and add workforce kind. Task2 Context feeds recurrence and facts. Task3 instances feed Task4/5/6 without copying project tasks. Task7 uses own route and one existing OA request. Task8 reuses notice records. Task9 consumes scoped interfaces. Task10 tests and publishes only demo source.
Task 1: in progress.
Task 1: complete — workforce tests RED → GREEN; admin 8, member, governance 16 passed. Global visibility uses capabilities, not identity impersonation. Browser GM navigation verified.
Task 2: complete — calendar tests RED → GREEN: fixed weekdays, overnight, DST missing/repeated time and permissions. Calendar UI rendered in browser.
Task 3: complete — template/allocation/generation tests RED → GREEN; browser published template and assigned employee.
Task 4: complete — daily work tests RED → GREEN; browser employee submitted and supervisor confirmed, reload retained data.
Task 5: in progress — support and absence model tests RED → GREEN; interface integration next.
Ruling: Cross-project approvals retain only an internal project-id/lifecycle lookup after directory filtering, to keep assigned approvals actionable without exposing the project directory. Existing cross-department regression proved this necessary; cost if wrong: unrelated project metadata visibility, covered by scoped tests.
Task 5: complete — coordination tests RED → GREEN; support, absence, cover UI and unified inbox integrated. Project deadline requests now create CEO decision instead of silently changing the project plan.
Task 6: model and UI implemented, acceptance tests RED → GREEN. Legacy test expectations and final regression pending.
Ruling: Work-task dates are absolute instants with explicit local display. A project leave extension requires a linked decision; approval applies the effective deadline while retaining original plan dates. Cost if wrong: old timeline may need explicit adjusted-deadline labeling, addressed in final integration.
Task 7: complete — four finance office types, delegated routing, distinct bookkeeping, budget/currency/duplicate checks and browser end-to-end passed.
Task 8: complete — versioned important notice acknowledgment, ordinary notices, supervisor follow-up and legacy-entry guard verified.
Task 9: complete — company work summary, new work commitments, contextual deep links, scope-aware entries, effective deadlines and coherent demo clock integrated; browser screenshots reviewed.
Task 10: validation complete — 29/29 suites passed, including build idempotence, actual legacy migration, browser refresh/conflicts and all new workflows. Packaging/publication in progress.
Independent review: one fresh read-only reviewer (gpt-6-astra), 2 important findings. HR editing hidden project membership and current-day exemption UI/inbox fixed with RED→GREEN verify-review-fixes. No unresolved important findings. Reviewer excluded backend/ERP/mobile strategy and did not certify publication; root verifies deliverables separately.
Ruling: sandbox account process startup failed 1909. Approved escalated verification continued. Existing publishing checkout ownership differs across accounts; per-process safe.directory exact checkout used, no global Git change.
Task 10: complete — source ZIP extracted and all 84 file hashes verified; extracted four-step build matches source. Public demo v4 deployed successfully, 2026-10-18 08:19 UTC, commit 59c8166c335a041ded4ac6ce88d112d6dbc936b6. URL https://gaoyue-ceo-workbench.acus-ny-9168.chatgpt.site. No browser-local user data published. Final 29/29 regression suites passed.
Publication environment repair: official packager required installed Git Bash on the current process path and TAR_OPTIONS=--force-local for Windows drive paths; no global configuration changed. Same Site identity and public audience retained.
Remote verification limit: Sites native deployment succeeded. Additional unauthenticated HTTP inspection received Cloudflare 403; no bypass attempted. Browser open handoff queued by app. Local interaction QA passed; runnable local package also delivered.
