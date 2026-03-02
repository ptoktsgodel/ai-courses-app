# Task: Spending Analysis Dashboard

**Role:** Senior React Developer

## Requirements

### 1. Header Controls

- Two month-level date pickers ("From" and "To"), defaulting to the start and end of the current month
- A toggle switch to switch between "Daily" and "Monthly" aggregation, visible only when the selected range spans more than one month

### 2. Spending by Type Trend Chart

- Multi-line chart with smooth curves
- Display spending trends broken down by payment type (e.g. Credit Card, Cash, Debit, Crypto)
- Each payment type renders two lines: one for **Spent** (solid) and one for **Planned** (dashed), sharing the same color
- Lines must span the full selected date range, including days with no payments
- Use a distinct color per payment type, cycling through a fixed palette

### 3. Type Filter Chips

- Render a chip for each discovered payment type below the date controls
- Active chip: filled with the type's color; inactive: outlined
- Clicking a chip toggles that type's lines on/off in the chart
- Newly loaded types are auto-selected

### 4. Chart Axes & Legend

- X axis: day labels (`MMM D`) in daily mode, month labels (`MMM YYYY`) in monthly mode
- Y axis: dollar-formatted ticks with smart `k` abbreviation for large values; anchored at 0 with sufficient tick density
- Legend: shows a short line swatch (solid or dashed) next to each series label so the line style is immediately recognisable
- Shared tooltip showing dollar amounts per series on hover
