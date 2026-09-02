# Project TODO

## Product foundation

- [x] Confirm native iOS and Android delivery target
- [x] Create mobile interface design plan
- [x] Create prioritized project TODO tracker
- [ ] Reconcile duplicated and historical backlog items
- [ ] Capture baseline type-check, test, dependency, and preview/build status

## Core task management

- [x] Build the Calendar primary screen
- [x] Build the Tasks tab with search, filters, sorting, and pull-to-refresh
- [ ] Build the Task Detail screen
- [ ] Build the Task Editor for standalone task creation and editing
- [ ] Add task completion, snooze, delete, and confirmation feedback
- [ ] Add project and milestone relationship fields to task flows
- [ ] Persist task changes across app restarts

## Projects and milestones

- [x] Build the Projects list with status and progress
- [x] Build the Project Detail with tasks and milestone timeline
- [ ] Build Milestones management flow
- [ ] Support project-linked task creation with locked project context
- [ ] Support optional milestone selection without auto-assigning milestones
- [ ] Add milestone edit, completion, and deletion behavior
- [ ] Persist project and milestone relationships across app restarts

## Reminders and recurrence

- [ ] Build Reminders management screen
- [ ] Add reminder create, edit, test, snooze, and delete actions
- [ ] Add local notification permission and scheduling flow
- [ ] Add recurring-task next-occurrence display
- [ ] Add single-instance versus future-series editing
- [ ] Add recurring-task deletion options

## Voice interaction

- [ ] Build Voice Assistant screen and listening states
- [ ] Add microphone permission handling
- [ ] Add live transcript and audio-level feedback
- [ ] Add intent confirmation for search, task creation, and daily recap
- [ ] Add voice success/error feedback cues
- [ ] Provide a complete non-voice alternative for every action

## Settings and account modes

- [x] Build Profile and Settings screen
- [ ] Add light/dark mode and accent palette persistence
- [ ] Add timezone, sound, vibration, and notification preferences
- [ ] Support guest and normal-login local sessions
- [ ] Verify authenticated navigation and logout behavior
- [ ] Defer or separately scope cloud account, OAuth, email, and phone automation

## Quality and release readiness

- [ ] Add unit tests for core domain services
- [ ] Add integration tests for task/project/milestone persistence
- [ ] Add regression tests for standalone and linked workflows
- [ ] Validate iOS, Android, and web behavior where supported
- [ ] Validate accessibility, dynamic type, reduced motion, and touch targets
- [ ] Validate startup, list performance, memory, and notification behavior
- [ ] Add global loading, empty, retry, and error states
- [x] Generate and configure final app branding assets
- [ ] Save a validated checkpoint before delivery

<!-- Checkpoint retry marker: initial mobile foundation validated locally. -->

## Continuation sprint

- [ ] Retry project checkpoint synchronization after session refresh
- [x] Add interactive task creation from the Calendar capture action
- [x] Add interactive task creation from the Tasks tab
- [x] Add task detail and edit navigation
- [x] Add project detail and milestone management routes
- [x] Add local persistence for MVP task and project state
- [x] Re-run type-check and tests after continuation work

## Synchronization continuation

- [ ] Retry checkpoint synchronization after the latest session refresh
- [ ] Confirm the synchronized version is reviewable from the Management UI

## Persistent database integration

- [x] Define server-backed task persistence architecture and local fallback behavior
- [x] Add persistent task database schema and migration
- [x] Add task query and mutation helpers
- [x] Add validated tRPC task list/create/update/delete procedures
- [x] Connect the mobile task list and editor to server persistence
- [x] Add authentication and ownership boundaries for synced data
- [x] Validate migration, API procedures, reload persistence, and fallback behavior
- [ ] Save a database-enabled checkpoint
