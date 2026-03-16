# Task: Dashboard Date Navigation Component

**Role:** Senior React Developer

## Requirements

### 1. Create Dashboard Component

- Create date navigation component in `src/components/dashboard/dashboard-component.tsx`

### 2. Date Picker

- Use MUI X DatePicker with `views={["month", "year"]}` for month/year selection

### 3. Navigation Arrows

- Add previous/next `IconButton` arrows  flanking the DatePicker
- Arrows step by one month, automatically handling month/year overflow via dayjs

### 4. Integrate into Dashboard Page

- Import and render the component in `src/pages/dashboard-page.tsx`
- Dashboard page shows an h4 title, a `Divider`, then the date navigation component
