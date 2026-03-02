# Financial Charts & API Integration

## 1. Spending vs Planned Chart (Graphs Page)

Create a chart component on the Graphs page to visualize financial data using the `Item` data model.

### Date Selector
- Two month pickers: **From Month** and **To Month**
- Default both to the current month
- When the selected range spans more than one month, show a toggle to switch between grouping by **day** and grouping by **month**
- When only a single month is selected, hide the toggle (always show days)

### Chart
- Grouped bar chart comparing **Spent** vs **Planned** amounts per period
- X-axis: day labels (`Mar 2`) or month labels (`Mar 2026`) depending on the toggle
- Y-axis: currency amounts
- Bars: **Planned** in grey, **Spent** in primary indigo
- Chart must be responsive (fill available width)

### Tooltip
- On hover show: Planned amount, Spent amount, and the difference
- Color the difference: red if over budget, green if under budget, grey if on budget

### Data
- Fetch items from `GET /api/v1/items?dateFrom=&dateTo=` using the selected date range
- Show a loading spinner while fetching
- Show an error message on failure
- Show an empty state when no data exists for the range

---

## 2. Dashboard Calendar — API Integration

Replace hardcoded seed data with live API data.

### Calendar Grid
- On mount and on every month navigation, fetch items from `GET /api/v1/items` for the visible month
- Show a loading overlay on the calendar while fetching
- Display each day's total as a currency amount (2 decimal places)

### Day Popup — Add Payment
- Call `POST /api/v1/items` to create a new payment for the selected day
- Reflect the returned item immediately in the calendar

### Day Popup — Remove Payments
- Call `DELETE /api/v1/items/{itemId}/payments/{paymentId}` for each selected payment
- Remove deleted payments from the calendar immediately
- Disable Add/Remove buttons while a request is in flight; show a progress indicator

### General
- All monetary values displayed with exactly 2 decimal places to avoid floating-point drift
- Remove all hardcoded seed data from the store; start with an empty state
