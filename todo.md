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
- [x] Add light/dark mode and accent palette persistence
- [x] Add timezone, sound, vibration, and notification preferences
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

## Phase 1 audit

- [x] Verify task schema and migration in the current project
- [x] Verify Task model/type definitions
- [x] Verify task CRUD implementation and ownership behavior
- [x] Verify Home/task overview screen
- [x] Verify the complete task filtering set
- [x] Verify Create/Edit Task modal behavior
- [x] Verify task completion toggle behavior
- [x] Run type-check and relevant tests

## Phase 2 audit

- [x] Verify calendar-events and alarms database schema
- [x] Verify Calendar month-view screen
- [x] Verify previous/next month navigation
- [x] Verify task indicators on calendar dates
- [x] Verify calendar day view
- [x] Verify quick task creation from the calendar
- [x] Run Phase 2 type-check and relevant tests

## Phase 5 audit

- [x] Verify generated custom logo and launcher icon assets
- [x] Verify app branding fields in app.config.ts

## Calendar Enhancements audit

- [x] Verify Generate Note button at the bottom of Calendar
- [x] Verify bottom task-list display
- [x] Verify note generation from tasks
- [x] Verify selected-date tasks in the bottom section

## IndexedDB audit

- [x] Verify IndexedDB database service for task persistence
- [x] Verify local task CRUD operations
- [x] Verify LocalTask schema and validation
- [x] Verify first-run migration system
- [x] Verify task query and filtering dimensions
- [x] Verify error handling and recovery
- [x] Verify useLocalTasks React hook
- [x] Verify task-context integration readiness
- [x] Verify database unit-test coverage and count
- [x] Verify web-platform IndexedDB support

## Database integration audit

- [x] Verify task context uses the claimed database service
- [x] Verify existing task state migration and full CRUD mapping
- [x] Verify automatic persistence on create/update/delete
- [x] Verify startup loading from the database
- [x] Verify comprehensive database-operation error handling
- [x] Verify database/task-management integration test coverage
- [x] Verify persistence across page reloads
- [x] Verify all task operations are tested and functional

## Date and time picker audit

- [x] Verify date picker component and month navigation
- [x] Verify time picker component and scrolling selection
- [x] Verify date-picker integration in task creation
- [x] Verify time-picker integration in task creation
- [x] Verify quick date options
- [x] Verify date min/max validation
- [x] Verify 24-hour time validation
- [x] Verify readable date/time display
- [x] Verify picker unit-test coverage and reported count
- [x] Verify web-platform testing

## Consolidated implementation sprint

- [x] Add canonical task date/time fields with validation and readable formatting
- [x] Add reusable date picker with month navigation and quick date options
- [x] Add reusable time picker with valid 24-hour input
- [x] Expand task filters to All, Today, Tomorrow, This Week, Overdue, Completed
- [x] Complete local task CRUD, validation, migration, and recovery behavior
- [ ] Add calendar-event and alarm persistence schema
- [x] Make calendar indicators and selected-day tasks data-driven
- [x] Add Generate Note action derived from selected-day tasks
- [ ] Add persisted reminder scheduling and management behavior
- [x] Add deterministic unit and integration tests for implemented flows
- [x] Re-audit all implemented checklist items and save a validated checkpoint

## Task edit and delete audit

- [x] Verify full edit form fields and picker integration
- [x] Verify edit entry point on task list items
- [x] Verify edit entry point on task detail
- [x] Verify deletion confirmation behavior
- [x] Verify delete entry point on task list items
- [x] Verify delete entry point on task detail
- [x] Verify server database edit helpers
- [x] Verify edit/delete unit and integration tests

## Task edit and delete implementation

- [x] Make Task Editor support create and edit modes
- [x] Load existing task data into the shared editor
- [x] Persist local task updates and deletes
- [x] Persist authenticated task updates and deletes
- [x] Add edit and delete actions to task list items
- [x] Connect Task Detail edit and delete actions to persistence
- [x] Add category support to the task model and editor
- [x] Add deterministic edit/delete tests
- [x] Run validation and save a feature checkpoint

## Approved remaining features

- [x] Add persisted task category field and category selector
- [ ] Add deterministic edit/delete integration tests
- [x] Add calendar-events and alarms database schema and migration
- [x] Add alarm CRUD and ownership-protected API procedures
- [x] Add local notification permission and scheduling helpers
- [ ] Connect reminders to persisted alarm state
- [x] Add recurring task fields and next-occurrence behavior
- [ ] Add recurring edit/delete scope choices
- [x] Persist settings and notification preferences
- [x] Add Voice Assistant screen with listening, transcript, confirmation, and feedback states
- [x] Add microphone permission handling and non-voice alternatives
- [x] Validate all approved feature groups and save a checkpoint

## Welcome, calendar UI, and quick settings implementation

- [ ] Verify welcome screen route and remove any Home action
- [ ] Verify Login and Sign Up actions remain available
- [ ] Verify welcome navigation behavior
- [x] Add Projects action beside the Calendar month toggle
- [x] Add Settings gear action in Calendar day view
- [x] Create Quick Settings Menu component
- [x] Add personal information display settings
- [x] Add email integration setting
- [x] Add theme toggle setting
- [x] Add cloud sync setting for registered users
- [x] Add timezone setting
- [x] Integrate Quick Settings with Calendar gear
- [x] Validate web and native-safe behavior

## UI refinements and timezone detection

- [x] Verify gear placement beside Projects in Calendar header
- [x] Verify day-view gear removal
- [x] Add system timezone detection utility
- [x] Add Quick Settings auto-detect timezone action
- [x] Persist and display detected timezone
- [x] Validate timezone behavior safely on web and native platforms

## Preview recovery

- [x] Restart the development server
- [x] Confirm the preview URL responds after restart

## Project management audit and implementation

- [ ] Verify project database schema and model types
- [ ] Verify project CRUD, context, list filtering, sorting, and forms
- [ ] Verify project status, type, color, and icon behavior
- [ ] Verify task project relationship and project filtering
- [ ] Verify project detail task counts and progress calculation
- [ ] Verify milestone model, CRUD, timeline, and notifications
- [ ] Verify project reminders and deadline reminders
- [ ] Verify project detail edit/delete and tests

## Project Management feature update

- [x] Add persistent project schema and model types
- [x] Add project CRUD helpers and authenticated API procedures
- [x] Add persistent project context/state management
- [x] Build project create/edit/delete flows with validation
- [x] Add project status, type, color, icon, search, filtering, and sorting
- [x] Add task project relationship and project filter behavior
- [x] Add persistent milestone schema, CRUD, and timeline
- [ ] Add project reminder and deadline scheduling behavior
- [x] Complete Project Detail statistics, progress, tasks, milestones, edit, and delete
- [x] Add project and Project Detail tests
- [x] Re-audit the full project feature checklist and save a checkpoint

## Advanced task sorting update

- [x] Add a shared task sort option model and deterministic comparator
- [x] Add priority, created-date, due-date, and title sort modes to Tasks
- [x] Persist the selected task sort preference in AsyncStorage
- [x] Add a mobile-friendly sort dropdown selector
- [x] Add deterministic sorting regression tests
- [x] Validate type-check, tests, and task-list behavior

## Task detail, editor, and relationships update

- [x] Complete Task Detail data loading and actions for local and authenticated tasks
- [x] Complete standalone Task Editor creation and editing flow
- [x] Add project selection to standalone task creation and editing
- [x] Add optional milestone selection without automatically assigning milestones
- [x] Persist project and milestone relationships locally and through tRPC
- [ ] Add relationship and screen regression tests
- [x] Validate type-check, tests, and task detail/editor previews

## Project interface enhancements

- [x] Add reusable project timeline visualization with milestone markers
- [x] Add Active, Completed, On Hold, and Archived status presentation
- [x] Add timeline view mode to the Projects list
- [x] Add project health/status indicators derived from project progress and dates
- [x] Add deterministic project timeline and status tests
- [x] Validate project interface behavior and save a checkpoint

## Project management necessity audit

- [x] Reconcile project-management checklist items against the current implementation
- [x] Identify launch-blocking project-management gaps
- [x] Identify quality, security, and usability follow-up work
- [x] Prioritize the remaining project-management roadmap

## Task Detail and standalone Task Editor implementation

- [x] Verify Task Detail route and task data loading for local and authenticated tasks
- [x] Verify Task Detail completion, edit, and delete actions
- [x] Verify standalone Task Editor create and edit modes
- [x] Verify task validation, date/time fields, and persistence
- [x] Verify project and optional milestone relationship fields without automatic milestone assignment
- [x] Add or update regression tests and validate the screens

## Core project and milestone workflow completion

- [x] Add project start/end date editing and validation
- [x] Add project status editing for Active, Completed, On Hold, and Archived
- [x] Connect authenticated Projects list and Project Detail data with local fallback
- [x] Add milestone due-date and reminder fields to create/edit flows
- [x] Add milestone edit, completion, and delete behavior in local and authenticated modes
- [x] Preserve stable project/task/milestone relationships and optional assignment behavior
- [x] Add project and milestone workflow regression tests
- [x] Validate and checkpoint the completed workflow

## Data integrity and authorization hardening

- [x] Validate project ownership for authenticated project-linked task writes
- [x] Validate project and milestone ownership for authenticated task writes
- [x] Validate milestone ownership and project consistency on milestone updates
- [x] Define safe cleanup for linked tasks and milestones when deleting a project
- [x] Prevent orphaned project and milestone relationships
- [x] Add authorization and integrity regression tests
- [x] Validate and checkpoint the security hardening update

## Database foreign keys and relationship indexes

- [x] Audit project, task, milestone, alarm, and user relationship constraints
- [x] Add explicit foreign keys with safe delete behavior
- [x] Add explicit indexes for relationship and ownership queries
- [x] Generate and review the non-destructive migration
- [x] Apply the reviewed migration to the database
- [x] Validate schema, TypeScript, API behavior, and regression tests
- [x] Save the database integrity checkpoint

## Task-management essentials audit

- [x] Reconcile essential task CRUD, detail, editor, filters, sorting, and persistence against the current implementation
- [x] Check task/project/milestone relationship behavior and data integrity
- [x] Check reminders, notifications, recurring tasks, and calendar integration
- [x] Check loading, empty, error, offline, and authentication states
- [x] Identify first-release task gaps and prioritize implementation

## Settings preference persistence update

- [x] Persist light/dark appearance mode
- [x] Persist accent palette selection
- [x] Persist timezone preference and auto-detection
- [x] Persist sound and vibration preferences
- [x] Persist notification preference and connect it to reminder behavior
- [x] Add settings preference regression tests
- [x] Validate settings persistence and mark verified steps complete
