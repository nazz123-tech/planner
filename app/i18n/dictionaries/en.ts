/**
 * The source of truth for every translatable string. The other dictionaries
 * are typed as `Record<TranslationKey, string>`, so adding a key here and
 * forgetting to translate it is a compile error rather than a silent gap.
 *
 * Placeholders use {braces} and are filled by `t(key, { name: "..." })`.
 */
export const en = {
    // ---- navigation ----
    "nav.dashboard": "Dashboard",
    "nav.boards": "Boards",
    "nav.calendar": "Calendar",
    "nav.habits": "Habits",
    "nav.logout": "Log out",
    "nav.addItem": "Add item",
    "nav.dropToDelete": "Drop a task here to delete it",
    "nav.remindersOn": "Task reminders on",
    "nav.remindersOff": "Task reminders off",
    "nav.language": "Language",
    "nav.remindersHint": "Task reminders on — emailed 2 hours before a task",
    "nav.settingSaveFailed": "Couldn’t save that setting",

    // ---- auth ----
    "auth.login.title": "Login",
    "auth.register.title": "Sign up",
    "auth.email": "EMAIL",
    "auth.password": "PASSWORD",
    "auth.name": "NAME",
    "auth.emailPlaceholder": "your@email.com",
    "auth.namePlaceholder": "yourname",
    "auth.signIn": "Sign In",
    "auth.signUp": "Sign Up",
    "auth.signingUp": "Signing up…",
    "auth.or": "OR",
    "auth.google": "Sign in using Google",
    "auth.forgotPassword": "Forgot password?",
    "auth.sendingLink": "Sending link…",
    "auth.firstTime": "First time?",
    "auth.signUpHere": "Sign up here!",
    "auth.haveAccount": "Already have an account?",
    "auth.signInHere": "Sign in here!",
    "auth.enterEmailAbove": "Enter your email above to reset your password",
    "auth.enterEmailFirst": "Enter your email above first",
    "auth.resetSent": "Password reset link sent to {email}",
    "auth.invalidEmailAddress": "That email address looks invalid",
    "auth.tooManyAttempts": "Too many attempts — try again in a few minutes",
    "auth.resetFailed": "Couldn't send the reset email. Try again",
    "auth.userNotFound": "User not found",

    // ---- validation ----
    "validation.emailRequired": "Email is required",
    "validation.passwordRequired": "Password is required",
    "validation.nameRequired": "Name is required",
    "validation.invalidEmail": "Invalid email",
    "validation.min2": "Minimum 2 characters",
    "validation.min7": "Minimum 7 characters",
    "validation.max30": "Maximum 30 characters",
    "validation.titleRequired": "Title is required",
    "validation.emojiRequired": "Emoji is required",
    "validation.pickEmoji": "Pick an emoji",
    "validation.selectDay": "Select at least one day",

    // ---- loading ----
    "loader.loading": "Loading…",
    "loader.loadingPlanner": "Loading your planner…",
    "loader.redirecting": "Redirecting…",

    // ---- greetings ----
    "greeting.morning.1": "Good morning, {name}.",
    "greeting.morning.2": "Have a great day, {name}.",
    "greeting.morning.3": "Up before your tasks, {name}.",
    "greeting.day.1": "Good day, {name}.",
    "greeting.day.2": "Let's keep going, {name}.",
    "greeting.day.3": "Halfway through the day, {name}.",
    "greeting.evening.1": "Good evening, {name}.",
    "greeting.evening.2": "Have a nice evening, {name}.",
    "greeting.evening.3": "The day's almost done, {name}.",
    "greeting.night.1": "Can't sleep, {name}?",
    "greeting.night.2": "It's late, {name}.",
    "greeting.night.3": "Quiet out there tonight, {name}.",
    "greeting.fallbackName": "Buddy",
    "greeting.subtext.none": "Nothing planned for today — take a breather.",
    "greeting.subtext.allDone": "All done. Nice work.",
    "greeting.subtext.light": "Light day — just {count} left.",
    "greeting.subtext.busy": "Busy day — {count} ahead.",

    // ---- dashboard ----
    "dashboard.todayTasks": "01 / Today tasks",
    "today.empty.title": "Nothing planned today",
    "today.empty.hint": "Add a task and it will show up right here.",
    "dashboard.boards": "02 / Boards",
    "dashboard.habits": "03 / Habits",

    // ---- boards ----
    "boards.title": "Boards",
    "boards.subtitle": "Tasks and notes are grouped by categories",
    "boards.new": "New Board",
    "boards.empty.title": "No boards yet",
    "boards.empty.hint": "Group tasks and notes by creating a board.",
    "boards.deleteTitle": "Delete board?",
    "boards.deleteMessage":
        "“{name}” and everything inside it will be removed. This can't be undone.",
    "boards.tasks": "Tasks",
    "boards.notes": "Notes",
    "boards.noTasks": "No tasks on this board yet.",
    "boards.noNotes": "No notes on this board yet.",
    "boards.back": "Back to boards",
    "boards.progress": "{done} of {total} done",

    // ---- habits ----
    "habits.title": "Habits",
    "habits.subtitle": "Small things, done often",
    "habits.new": "New Habit",
    "habits.empty.title": "No habits yet",
    "habits.empty.hint": "Build a routine by adding your first habit.",
    "habits.deleteTitle": "Delete habit?",
    "habits.deleteMessage":
        "“{name}” and its streak will be removed. This can't be undone.",
    "habits.streak": "{count} day streak",
    "habits.everyDay": "Every day",
    "habits.noDays": "No days set",
    "habits.repeat": "Repeat",
    "habits.daily": "Every day",
    "habits.weekdays": "Certain days",
    "habits.doneToday": "Done today",
    "habits.markDone": "Mark as done",

    // ---- calendar ----
    "calendar.title": "Calendar",
    "calendar.today": "Today",
    "calendar.import": "Import .ics",
    "calendar.addTask": "Add task",
    "calendar.previousYear": "Previous year",
    "calendar.nextYear": "Next year",
    "calendar.selectMonth": "Select month",
    "calendar.notesOnDay": "{count} notes",
    "calendar.backToCalendar": "Back to calendar",

    // ---- day details ----
    "day.tasks": "Tasks",
    "day.notes": "Notes",
    "day.noTasks": "Nothing planned for this day.",
    "day.noNotes": "No notes for this day.",
    "day.addTask": "+ Add task",
    "day.addNote": "Add note",
    "day.deleteTask": "Delete task",
    "day.deleteNote": "Delete note",

    // ---- task details ----
    "task.details": "Task",
    "task.title": "Title",
    "task.description": "Description",
    "task.date": "Date",
    "task.time": "Time",
    "task.category": "Category",
    "task.status": "Status",
    "task.done": "Done",
    "task.todo": "To do",
    "task.noDescription": "No description",
    "task.save": "Save changes",
    "task.saving": "Saving…",
    "task.delete": "Delete task",
    "task.deleteConfirm": "Delete this task? This can't be undone.",
    "task.cancel": "Cancel",
    "task.markDone": "Mark as done",
    "task.markTodo": "Mark as not done",

    // ---- create form ----
    "create.title": "New task",
    "create.taskTitle": "Title",
    "create.titlePlaceholder": "What needs doing?",
    "create.description": "Description",
    "create.descriptionPlaceholder": "Any details…",
    "create.date": "Date",
    "create.time": "Time",
    "create.category": "Category",
    "create.newCategory": "Create category",
    "create.addNote": "Add note",
    "create.notePlaceholder": "Write a note…",
    "create.submit": "Create",
    "create.creating": "Creating…",
    "create.cancel": "Cancel",

    // ---- board form ----
    "boardForm.title": "New board",
    "boardForm.name": "Name",
    "boardForm.namePlaceholder": "Board name",
    "boardForm.colour": "Colour",
    "boardForm.emoji": "Emoji",
    "boardForm.submit": "Create board",
    "boardForm.creating": "Creating…",

    // ---- habit form ----
    "habitForm.title": "New habit",
    "habitForm.name": "Name",
    "habitForm.namePlaceholder": "Habit name",
    "habitForm.emoji": "EMOJI",
    "habitForm.days": "DAYS",
    "habitForm.repeat": "REPEAT",
    "habitForm.nameLabel": "NAME",
    "habitForm.submit": "Create habit",
    "habitForm.creating": "Creating…",

    // ---- import ----
    "import.title": "Import from calendar",
    "import.hint": "Pick an .ics file exported from your calendar app.",
    "import.choose": "Choose file",
    "import.importing": "Importing…",
    "import.submit": "Import",
    "import.board": "Add to board",
    "import.found": "{count} events found",
    "import.none": "No events found in that file.",
    "import.failed": "Couldn't read that file.",

    // ---- toasts ----
    "toast.taskCreated": "Task created",
    "toast.taskUpdated": "Task updated",
    "toast.taskDeleted": "Task deleted",
    "toast.taskUpdateFailed": "Couldn’t update the task",
    "toast.taskDeleteFailed": "Couldn’t delete the task",
    "toast.noteCreated": "Note created",
    "toast.noteDeleted": "Note deleted",
    "toast.noteDeleteFailed": "Couldn’t delete the note",
    "toast.habitCreated": "New habit created",
    "toast.habitDeleted": "Habit deleted",
    "toast.boardCreated": "New board created",
    "toast.boardDeleteFailed": "Couldn’t delete the board",
    "toast.boardCreateFailed": "Couldn’t create the board. Please try again.",
    "toast.importFailed": "Import failed. Please try again.",
    "toast.somethingWrong": "Something went wrong",

    // ---- misc labels ----
    "day.overview": "Day overview",
    "task.editKicker": "Edit task",
    "task.detailsKicker": "Task details",
    "task.titlePlaceholder": "Task title…",
    "task.descriptionPlaceholder": "Description…",
    "habits.deleteAria": "Delete habit",
    "import.heading": "Import calendar",
    "import.boardEmoji": "Board emoji",
    "import.boardName": "Board name",

    // ---- generic ----
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.save": "Save",
    "common.close": "Close",
    "common.confirm": "Confirm",
} as const;

export type TranslationKey = keyof typeof en;

/** Every locale must supply every key. */
export type Dictionary = Record<TranslationKey, string>;
