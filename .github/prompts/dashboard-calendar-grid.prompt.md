# Task: Dashboard Calendar Grid

**Role:** Senior React Developer

## Requirements

### 1. Calendar Grid Component

- Create a 7-column CSS Grid calendar in `src/components/dashboard/`
- Show day-of-week headers (Sun–Sat)
- Pad the first row with empty cells to align day 1 to the correct weekday
- Pad the last row with empty cells to complete the final week

### 2. Day Blocks

- Each day is a separate clickable block component
- Display the day number in the top-left corner
- Display the total price of that day's items in the center; show `—` when zero
- Highlight today's block with a distinctive border color

### 3. Day Popup

- Clicking a block opens a MUI Dialog titled with the full date
- Dialog shows a list of items (name + price) for that day
- Items can be individually selected (multi-select); clicking again deselects
- Show a running total below the list
- "Select All" / "Clear All" toggle button next to the total
- **Add** button appends a new mock item to the current day
- **Remove** button deletes all selected items; disabled when nothing is selected
- Close button in the top-right corner of the dialog
- List overflows into additional columns (max 7 items per column) instead of scrolling; dialog widens accordingly
- Font size of list items scales down dynamically as item count grows
