# Personal Assistant Mobile App Design Plan

## Product direction

The app is a calm, local-first personal assistant for capturing tasks quickly, organizing work into projects, viewing schedules, and receiving reminders. The primary interaction is designed for **portrait orientation and one-handed use**. The experience should feel native to iOS while remaining comfortable on Android: clear hierarchy, large touch targets, restrained motion, bottom-sheet creation flows, and predictable navigation.

The first release prioritizes reliable task, calendar, project, milestone, reminder, and settings workflows. Voice capture is presented as a fast secondary input method rather than the only way to use the product. Cloud accounts and email automation remain optional extensions and should not block the local-first experience.

## Screen list

| Screen | Primary content | Main actions |
|---|---|---|
| Welcome | Brand mark, concise value proposition, Login, Sign Up, and Continue as Guest | Enter authenticated or guest mode |
| Calendar | Month/day switcher, date grid, task indicators, selected-day task list, Projects and Settings actions, voice/add action | Navigate dates, create tasks, open task details, open projects/settings |
| Tasks | Search field, filter chips, sort control, task list grouped by date/status | Complete, snooze, edit, delete, create, filter, sort, refresh |
| Task Detail | Title, description, due date/time, priority, category, project, milestone, recurrence, reminders | Edit, complete, delete, change relationships, manage reminders |
| Task Editor | Compact form in a bottom sheet or full-screen modal | Create or edit a task; save or cancel |
| Projects | Project cards/list, status and progress, search/filter, add button | Create, open, edit, archive, delete projects |
| Project Detail | Project overview, status, dates, progress, task list, milestone timeline, AI suggestions | Add/edit tasks, add/edit milestones, edit/delete project |
| Milestones | Project-scoped milestone list/timeline with status and due dates | Create, edit, complete, delete milestones |
| Reminders | Upcoming and completed reminders grouped by task/project | Create, edit, test, snooze, delete reminders |
| Voice Assistant | Listening state, live transcript, suggested intent/action, confirmation | Search, create task, generate daily recap, confirm/cancel action |
| Daily Recap | Today’s tasks, completion summary, spoken or readable recap | Complete tasks, add task, replay recap |
| Profile & Settings | User identity, theme, accent color, notification, timezone, sound, account mode | Edit profile, theme, sounds, permissions, upgrade/logout |
| Notification Permission | Short explanation of reminder value and native permission action | Allow or continue without notifications |

## Navigation structure

Use a bottom tab bar with four destinations: **Calendar**, **Tasks**, **Projects**, and **Settings**. The central floating action button is reserved for the most frequent capture action and opens the Task Editor. Voice Assistant can be entered from the central action or microphone control in search contexts. Detail screens use a native back affordance and do not create additional persistent tabs.

After entering guest, normal-login, or authenticated mode, the default landing screen is Calendar. The Home/dashboard concept is represented by the calendar’s selected-day summary and Daily Recap rather than being a separate primary tab.

## Key user flows

### Quick task capture

1. The user taps the central add button from any primary tab.
2. The Task Editor opens with the title field focused and the keyboard visible.
3. The user enters a title, optionally chooses a date/time, priority, project, milestone, recurrence, or reminder.
4. The user taps Save.
5. The app shows a lightweight success confirmation, updates the current list/calendar, and returns focus to the prior screen.

### Project-linked task creation

1. The user opens a project and taps **Add/Edit Tasks**.
2. The Task Editor opens with the project field automatically selected and not editable.
3. The user optionally chooses a milestone belonging to that project.
4. The user saves the task.
5. The task appears in the project detail list, calendar, and global Tasks view with the relationship preserved.

### Calendar planning

1. The user swipes or taps to another month.
2. The user selects a date with task indicators.
3. The selected-day section displays that date’s tasks and milestones.
4. The user taps an item to open detail or taps the add action to create an item prefilled with the selected date.

### Reminder management

1. The user opens Reminders from Settings or a task detail screen.
2. The user reviews upcoming reminders grouped by date.
3. The user taps a reminder to edit its time, sound, vibration, or repeat pattern.
4. The user can test the alert, snooze it, or delete it with confirmation.
5. Changes are persisted locally and reflected in the task/project detail screens.

### Voice capture

1. The user taps the microphone button.
2. A subtle start cue plays and the interface enters a listening state with waveform and interim transcript.
3. The user speaks a request such as creating a task, searching tasks, or generating a recap.
4. The app presents the interpreted action and editable details.
5. The user confirms, edits, or cancels; a success or error cue provides feedback.
6. The app executes the action and returns to the relevant screen.

## Visual language

The brand uses a deep indigo foundation with warm amber emphasis to communicate focus and momentum without feeling corporate. The primary palette is:

| Token | Light mode | Dark mode | Use |
|---|---|---|---|
| Background | `#F7F8FC` | `#101321` | Main screen background |
| Surface | `#FFFFFF` | `#1A1F33` | Cards, sheets, list rows |
| Foreground | `#172033` | `#F5F7FF` | Primary text |
| Muted | `#6F7890` | `#AAB3CC` | Supporting text |
| Primary indigo | `#4F46E5` | `#818CF8` | Main actions and selected states |
| Amber accent | `#F59E0B` | `#FBBF24` | Voice/capture emphasis and due-soon states |
| Success | `#16A34A` | `#4ADE80` | Completion and healthy status |
| Warning | `#D97706` | `#FBBF24` | Overdue or attention-needed states |
| Error | `#DC2626` | `#FB7185` | Destructive actions and failures |
| Border | `#E5E7F0` | `#303852` | Dividers and card boundaries |

Use rounded cards with moderate corner radii, soft elevation, and high-contrast typography. Keep primary actions near the lower half of the screen for thumb reach. Use compact chips for filters, but avoid filling the interface with competing badges.

## Interaction and accessibility rules

All primary controls should have a minimum comfortable touch target, visible pressed feedback, and a clear disabled/loading state. Use haptics only for important actions such as completion, save, destructive confirmation, and toggles. Voice interactions should include visual state changes and subtle audio cues, with a non-voice alternative always available.

Respect system light/dark mode while allowing an explicit preference. Support dynamic text sizing, accessible labels for icon-only buttons, sufficient color contrast, reduced-motion behavior, keyboard dismissal, and screen-reader-friendly order. Destructive actions require confirmation; deletion should never be the only swipe action without an alternate visible route.

## Data model vocabulary

The shared domain vocabulary is: `Task`, `Project`, `Milestone`, `Reminder`, `RecurrenceRule`, `UserProfile`, `ThemePreference`, and `VoiceAction`. A task may optionally reference one project and one milestone, but milestones must not be automatically added to tasks. Project detail should show task progress, while the Milestones view should focus on milestone information rather than exposing a task count.
