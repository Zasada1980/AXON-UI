Summary

Implement Phase 3 diagnostics UI with tabbed layout and baseline tests.

Why
- Begin Phase 3 per TZ with safe, contract-neutral UI wiring and green gates.
- Provide a single place for health, recovery, backups, and checkpoints.

Changes
- DiagnosticsPage: Tabs (Overview, Monitoring & Recovery, Backups, Checkpoints).
  - Overview: SystemDiagnostics (metrics, issues, micro-tasks, AXON health).
  - Monitoring & Recovery: ErrorMonitoring + AutoRecovery side-by-side.
  - Backups: AutoBackupSystem (create/restore/export/schedule).
  - Checkpoints: CheckpointSystem (create/restore/export, auto).
- ErrorFallback: fix ui imports; switch to phosphor icons; keep DEV rethrow.
- Tests: diagnostics.render (tabs/header), errorboundary.fallback (DEV rethrow).
- Journal: src/ui-integration-tz.md updated — Phase 3 set to In-Progress (≥50%).

Quality Gates
- Typecheck: PASS
- Build: PASS (only non-blocking CSS optimizer warnings)
- Tests: PASS (25/25)

How to verify
1) Open Navigation → System Tools → Diagnostics.
2) Overview: see metrics, issues, micro-tasks, AXON backend badge.
3) Monitoring & Recovery: ErrorMonitoring log and AutoRecovery components visible.
4) Backups: create a manual backup, see it appear in the list (localStorage).
5) Checkpoints: create a checkpoint and see it in the list.

Risks
- UI size growth (chunks) — acceptable for now; can split later if needed.
- Jsdom quirks in tests (Radix) — mitigated via role-based queries and polyfills.

Post-merge actions
- Add small smoke tests for actions (backup creation, schedule switches, repair trigger).
- Consider RU/EN labels on tabs and minor UX improvements.