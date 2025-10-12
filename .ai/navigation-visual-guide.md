# Visual Navigation Guide - Organizer Menu

## Desktop View (≥768px)

### Main Menu - Collapsed Submenu
```
┌─────────────────────────────┐
│  JamJudge              [👤▼]│
├─────────────────────────────┤
│                             │
│  ┌───────────────────────┐  │
│  │ 🏠 Dashboard          │  │
│  │ 📅 Event Settings     │  │
│  │ ⭐ Criteria           │  │
│  │ 👥 Teams              │  │
│  │ 📁 Projects           │  │
│  │ 👤 Users              │  │
│  │ 🏆 Results & Final... ▶│  │
│  │ ⚙️  Settings           │  │
│  └───────────────────────┘  │
│                             │
│     [Main Content Area]     │
│                             │
└─────────────────────────────┘
```

### Main Menu - Expanded Submenu (When on /organizer/scores)
```
┌─────────────────────────────┐
│  JamJudge              [👤▼]│
├─────────────────────────────┤
│                             │
│  ┌───────────────────────┐  │
│  │ 🏠 Dashboard          │  │
│  │ 📅 Event Settings     │  │
│  │ ⭐ Criteria           │  │
│  │ 👥 Teams              │  │
│  │ 📁 Projects           │  │
│  │ 👤 Users              │  │
│  │ 🏆 Results & Final... ▼│  │
│  │   📊 Scores Preview ◀─│◀─ Active
│  │   🚀 Publish Results  │  │
│  │   🔍 Audit Log        │  │
│  │   ☁️  Storage Monitor  │  │
│  │ ⚙️  Settings           │  │
│  └───────────────────────┘  │
│                             │
│  ┌─────────────────────┐    │
│  │ Scores Preview Page │    │
│  │ [Table with scores] │    │
│  └─────────────────────┘    │
│                             │
└─────────────────────────────┘
```

---

## Mobile View (<768px)

### Portrait Mode - Typical Usage
```
┌───────────────────────────┐
│  JamJudge           [👤▼] │
├───────────────────────────┤
│                           │
│  ┌─────────────────────┐  │
│  │  Scores Preview     │  │
│  │  ─────────────────  │  │
│  │                     │  │
│  │  [Project Table]    │  │
│  │  ┌────┬─────────┐   │  │
│  │  │ #1 │ Team A  │   │  │
│  │  │ #2 │ Team B  │   │  │
│  │  │ #3 │ Team C  │   │  │
│  │  └────┴─────────┘   │  │
│  │                     │  │
│  └─────────────────────┘  │
│                           │
│   (scrollable content)    │
│                           │
├───────────────────────────┤
│ [🏠]  [👥]  [📁]  [📊]  [🚀]│
│ Dash  Team  Proj  Score Pub│
└───────────────────────────┘
        ↑ Active Tab
```

### Example: Publish Results Page
```
┌───────────────────────────┐
│  JamJudge           [👤▼] │
├───────────────────────────┤
│                           │
│  ┌─────────────────────┐  │
│  │  Publish Results    │  │
│  │  ─────────────────  │  │
│  │                     │  │
│  │  Event Status:      │  │
│  │  ✓ Rating Complete  │  │
│  │                     │  │
│  │  ┌───────────────┐  │  │
│  │  │  [🚀 Publish] │  │  │
│  │  └───────────────┘  │  │
│  │                     │  │
│  └─────────────────────┘  │
│                           │
├───────────────────────────┤
│ [🏠]  [👥]  [📁]  [📊]  [🚀]│
│ Dash  Team  Proj  Score Pub│
└───────────────────────────┘
                          ↑ Active
```

---

## Navigation Interaction Flow

### Desktop - Accessing Scores Preview
```
User Flow:
1. Click "Results & Finalization" in menu
   ↓
2. Submenu expands showing 4 options
   ↓
3. Click "Scores Preview"
   ↓
4. Page loads, menu item highlighted
   ↓
5. Submenu stays open (auto-expand)
```

### Mobile - Accessing Scores Preview
```
User Flow:
1. Tap "Scores" tab in bottom bar
   ↓
2. Page loads immediately
   ↓
3. Tab highlighted at bottom
```

---

## Real-World Example Scenarios

### Scenario 1: End-of-Event Workflow (Desktop)
```
Step 1: Check Scores
┌─────────────────────────────────────────┐
│ Menu                 │ Content          │
├──────────────────────┼──────────────────┤
│ ...                  │                  │
│ 🏆 Results & Final ▼ │ Scores Preview   │
│   📊 Scores ◀────────┼─► [Score Table]  │
│   🚀 Publish         │   Team A: 98.5   │
│   🔍 Audit           │   Team B: 95.2   │
│   ☁️  Storage         │   Team C: 92.8   │
│ ...                  │                  │
└─────────────────────────────────────────┘

Step 2: Publish (Same submenu open)
┌─────────────────────────────────────────┐
│ Menu                 │ Content          │
├──────────────────────┼──────────────────┤
│ ...                  │                  │
│ 🏆 Results & Final ▼ │ Publish Results  │
│   📊 Scores          │                  │
│   🚀 Publish ◀───────┼─► [Publish UI]   │
│   🔍 Audit           │   ✓ Ready        │
│   ☁️  Storage         │   [🚀 PUBLISH]   │
│ ...                  │                  │
└─────────────────────────────────────────┘

Step 3: Verify in Audit Log
┌─────────────────────────────────────────┐
│ Menu                 │ Content          │
├──────────────────────┼──────────────────┤
│ ...                  │                  │
│ 🏆 Results & Final ▼ │ Audit Log        │
│   📊 Scores          │                  │
│   🚀 Publish         │ [Filter: All ▼]  │
│   🔍 Audit ◀─────────┼─► [Log Table]    │
│   ☁️  Storage         │   Published...   │
│ ...                  │   User: admin    │
└─────────────────────────────────────────┘
```

### Scenario 2: Quick Check on Mobile
```
Organizer wants to quickly see current scores:

1. Open app → Dashboard
2. Tap "Scores" tab (📊)
3. See scores immediately
4. Done! (2 taps)

Alternative without dedicated tab:
1. Open app → Dashboard
2. Tap menu → Find "Scores"
3. Scroll to find it
4. Tap
5. Done (4+ taps, more complex)
```

---

## Color & Visual States

### Active State (Example)
```
Normal Item:
┌──────────────────────┐
│ 📊 Scores Preview    │
└──────────────────────┘

Active Item:
┌──────────────────────┐
│ 📊 Scores Preview    │ ◀─ Blue background
└──────────────────────┘    Bold text
```

### Submenu State
```
Closed:
│ 🏆 Results & Finalization  ▶ │

Open:
│ 🏆 Results & Finalization  ▼ │
│   📊 Scores Preview           │
│   🚀 Publish Results          │
│   🔍 Audit Log                │
│   ☁️  Storage Monitor          │
```

---

## Responsive Breakpoints

### Transition at 768px
```
Desktop (≥768px):         Mobile (<768px):
┌─────────────────┐       ┌─────────────┐
│ Menu│  Content  │       │   Content   │
│─────│───────────│       │             │
│ 🏠  │           │       │             │
│ 📅  │           │  →    │             │
│ 🏆▼ │           │       │             │
│  📊 │           │       ├─────────────┤
│  🚀 │           │       │ 🏠 👥 📁 📊 🚀│
└─────────────────┘       └─────────────┘
```

---

## Accessibility Features

### Keyboard Navigation (Desktop)
```
Tab Order:
1. Dashboard
2. Event Settings
3. Criteria
4. Teams
5. Projects
6. Users
7. Results & Finalization (Enter to expand)
   7a. Scores Preview
   7b. Publish Results
   7c. Audit Log
   7d. Storage Monitor
8. Settings

Arrow Keys:
↑/↓ - Navigate menu items
→   - Expand submenu
←   - Collapse submenu
Enter - Select item
```

### Screen Reader Announcements
```
When navigating to submenu:
"Results and Finalization, submenu, collapsed"

When opening submenu:
"Results and Finalization, submenu, expanded, 4 items"

When selecting Scores Preview:
"Scores Preview, selected, link"
```

---

## Summary

### Desktop Navigation
- **Submenu approach** keeps interface organized
- **Auto-expanding** provides smart context awareness
- **11 total pages** accessible with clear hierarchy

### Mobile Navigation  
- **5 critical tabs** for fastest access
- **Bottom bar** familiar mobile pattern
- **One-tap access** to key finalization features

### Best Practices Applied
✅ Logical grouping (finalization tasks together)
✅ Progressive disclosure (submenu hides complexity)
✅ Mobile-first (most important actions in tab bar)
✅ Semantic icons (clear meaning)
✅ Accessibility (keyboard nav, screen readers)
✅ Responsive (smooth transition at breakpoint)

**Navigation is intuitive, accessible, and efficient!** 🎯

