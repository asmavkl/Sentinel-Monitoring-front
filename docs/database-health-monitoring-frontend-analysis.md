# Database Health Monitoring Provisioning - Frontend Architecture Analysis

## 1. Executive Summary

This document analyzes the existing frontend architecture of Sentinel Monitoring to determine the optimal implementation strategy for the new Database Health Monitoring Provisioning feature. The backend now exposes four new endpoints for automatic provisioning of database health checks and widgets.

**Key Findings:**
- The frontend uses React 19, Material-UI (MUI), TanStack Query, and Axios
- Existing patterns for CRUD operations, forms, and dialogs are well-established
- Dashboard and Widget architecture supports dynamic sections and widgets
- Permission system uses role-based access (Admin, Operator, Viewer)
- The feature should integrate into the Application Details page (/monitoring/applications/:id)
- Available-queries endpoint requires per-credential calls (backend limitation)

**Recommendation:** Reuse existing Monitoring Management patterns, add a new tab/section in Application Details page, and leverage existing Dashboard/Widget infrastructure with minimal changes.

---

## 2. Actual Frontend Architecture

### Framework & Build
- **Framework:** React 19.2.8
- **Build Tool:** Vite 8.2.2
- **TypeScript:** 6.0.2
- **Package Manager:** npm
- **Entry Point:** `src/main.tsx` → `src/app/App.tsx`

### Routing
- **Router:** React Router DOM 7.18.3
- **Route Definition:** `src/routes/AppRoutes.tsx`
- **Path Utilities:** `src/routes/paths.ts`
- **Current Routes:**
  - `/applications` - Applications overview
  - `/applications/:applicationId/dashboard` - Application dashboard
  - `/monitoring/applications` - Monitoring applications list
  - `/monitoring/applications/:id` - Application details
  - `/monitoring/checks` - Checks management
  - `/monitoring/credentials` - Database credentials
  - `/monitoring/health-queries` - Database health queries catalog
  - `/monitoring/servers` - Server monitoring

### Authentication & Authorization
- **Auth Context:** `src/features/auth/contexts/UserContext.tsx`
- **Role Hooks:** `src/features/auth/hooks/useUserRoleSimple.ts`
- **Role Access:** `src/auth/roleAccess.ts`
- **Protected Routes:** `src/routes/ProtectedRoute.tsx`
- **Admin Routes:** `src/routes/AdminRoute.tsx`
- **Roles:** Admin, Operator, Viewer
- **Access Functions:**
  - `isAdmin(role)` - Admin only
  - `canWriteSystem(role)` - Admin only
  - `canWriteMonitoring(role)` - Admin only
  - `canEditDashboard(role)` - Admin or Operator

### HTTP Client
- **HTTP Client:** Axios 1.20.0
- **Client Factory:** `src/api/httpClient.ts`
<!-- - **Base URL:** Configured via `env.apiBaseUrl` -->
- **Interceptors:**
  - Request: Adds authorization headers
  - Response: Handles 401 → redirect to login
- **Error Handling:** `src/api/apiUtils.ts` → `ApiError` class

### State Management
- **Global State:** Zustand 5.0.15
- **Stores:**
  - `src/store/dashboardStore.ts` - Dashboard state
  - `src/store/uiStore.ts` - UI state
- **Query State:** TanStack Query 5.102.8
- **Query Client:** `src/app/queryClient.ts`
- **Default Config:**
  - Queries: retry=2, staleTime=30s, gcTime=5min
  - Mutations: retry=1

### Form Management
- **Form Library:** Uncontrolled components with React state
- **Validation:** Custom validation functions (no form library)
- **Pattern:** Dialog-based forms with local state
- **Examples:**
  - `CredentialFormDialog` - Database credentials
  - `HealthQueryFormDialog` - Health queries
  - `ApplicationFormDialog` - Applications
  - `CreateCheckDialog` - Checks

### UI Component Library
- **Library:** Material-UI (MUI) 9.4.0
- **Icons:** `@mui/icons-material` 9.4.0
- **Styling:** Emotion 11.14.0
- **Theming:** Custom theme in `src/theme`
- **RTL Support:** `stylis-plugin-rtl` 2.1.1

### Modal/Drawer Patterns
- **Dialog Pattern:** MUI Dialog with open/close state
- **Confirmation Dialog:** `ConfirmDeleteDialog` in monitoring-management
- **Form Dialog:** Common pattern across all CRUD operations
- **No Drawer Pattern:** Only Dialogs are used

### Notification/Toast Patterns
- **No Toast Library:** Uses inline Alert components
- **Success/Error Display:** Alert components within pages
- **Error Messages:** Displayed in Dialogs via `submitError` prop
- **Example:** Connection test results in CredentialFormDialog

### Table Patterns
- **Table Component:** MUI Table
- **Table Cards:** `MonitoringTableCard` wrapper
- **Pagination:** Not implemented (no pagination in current lists)
- **Filtering:** API-side filtering with query params
- **Examples:**
  - `CredentialTable` - Database credentials
  - `HealthQueryTable` - Health queries
  - `ApplicationTable` - Applications
  - `CheckTable` - Checks

### Select/MultiSelect Patterns
- **Single Select:** MUI Select with MenuItem
- **MultiSelect:** NOT currently used in the codebase
- **Pattern:** Controlled value with onChange handler
- **Example:** Credential selection in DatabaseCheckForm

### Loading/Error Patterns
- **Loading Component:** `DashboardLoading` in `src/components/dashboard`
- **Error Component:** `DashboardError` in `src/components/dashboard`
- **Empty State:** `MonitoringEmptyState` in `src/components/monitoring/layout`
- **Pattern:** Check `isLoading`, `isError`, then render appropriate component

### Page/Layout Architecture
- **Main Layout:** `src/layouts/MainLayout.tsx`
- **Layout Components:**
  - Header
  - Sidebar with MonitoringNav
  - Main content area
- **Monitoring Nav:** `src/components/monitoring/layout/monitoringNav.tsx`
- **Page Pattern:** `MonitoringPageContainer` wrapper
- **Header Pattern:** `MonitoringSectionHeader`
- **Toolbar Pattern:** `MonitoringToolbar`

### Dashboard Architecture
- **Dashboard Page:** `src/features/dashboard/pages/ApplicationDashboardPage.tsx`
- **Dashboard API:** `src/api/applicationDashboardApi.ts`
- **Dashboard Hook:** `src/features/dashboard/hooks/useApplicationDashboard.ts`
- **Layout Renderer:** `src/components/widgets/DashboardLayoutRenderer.tsx`
- **Section Renderer:** `src/components/widgets/DashboardSectionRenderer.tsx`
- **Layout Normalization:** `src/utils/dashboardLayout.ts`
- **Structure:**
  - DashboardLayoutDto contains sections[]
  - Each DashboardSectionDto contains widgets[]
  - Widgets are rendered via WidgetGrid
  - Sections are filtered by `isVisible` flag

### Widget Architecture
- **Widget Registry:** `src/components/widgets/registry.ts`
- **Widget Renderer:** `src/components/widgets/WidgetRenderer.tsx`
- **Widget Grid:** `src/components/widgets/WidgetGrid.tsx`
- **Widget Types:**
  - StatusCard
  - NumberCard (NumberMetricWidget)
  - Chart (MetricChartWidget)
  - MultiSeriesChart
  - Table
  - Gauge
  - ProgressBar
- **Widget Chrome:** `src/components/widgets/WidgetChrome.tsx`
- **Widget Detail Dialog:** `src/components/widgets/WidgetDetailDialog.tsx`
- **Data Sources:** WidgetDataSourceDto with checkId, metricId, etc.

### Application Management Architecture
- **Applications Page:** `src/features/applications/pages/ApplicationsOverviewPage.tsx`
- **Monitoring Applications:** `src/features/monitoring-management/pages/MonitoringApplicationsPage.tsx`
- **Application Details:** `src/features/monitoring-management/pages/ApplicationDetailsPage.tsx`
- **API:** `src/api/applicationsApi.ts` (limited) + `src/api/checkManagementApi.ts` (monitoring applications)
- **Components:**
  - ApplicationTable
  - ApplicationFormDialog
  - ApplicationInfoCard
  - ComponentList
  - ComponentFormDialog
- **Structure:**
  - MonitoringApplicationDto (from checkManagementApi)
  - MonitoringComponentDto
  - Application has multiple Components
  - Checks belong to Components

### Database Credential Management UI
- **Page:** `src/features/database-credentials/pages/DatabaseCredentialsPage.tsx`
- **API:** `src/api/databaseCredentialsApi.ts`
- **Hooks:** `src/features/database-credentials/hooks/useDatabaseCredentials.ts`
- **Components:**
  - CredentialTable
  - CredentialFormDialog
  - ConnectionTestResult
- **Credential Types:** SqlServer, Redis, MongoDb, PostgreSql, MySql, Oracle, Snmp
- **Features:** Create, Edit, View, Delete, Activate, Deactivate, Test Connection
- **Filtering:** By credential type (implied via UI)

### Database Health Query Management UI
- **Page:** `src/features/database-health-queries/pages/DatabaseHealthQueriesPage.tsx`
- **API:** `src/api/databaseHealthQueriesApi.ts`
- **Hooks:** `src/features/database-health-queries/hooks/useDatabaseHealthQueries.ts`
- **Components:**
  - HealthQueryTable
  - HealthQueryFormDialog
- **Features:** Create, Edit, Activate, Deactivate
- **Filtering:** databaseType, category, isActive, search
- **Database Types:** SqlServer, PostgreSql, MySql, Oracle (relational only)
- **Categories:** Connection, Availability, Performance, Capacity, Storage
- **Result Types:** Scalar, StatusCount, Dataset

### Check Management UI
- **Page:** `src/features/check-management/pages/MonitoringChecksPage.tsx`
- **API:** `src/api/checkManagementApi.ts`
- **Hooks:** `src/features/check-management/hooks/` (useChecks, useCreateCheck, etc.)
- **Components:**
  - CheckTable
  - CreateCheckDialog
  - DatabaseCheckForm
  - HttpCheckForm
  - RedisCheckForm
  - MongoDbCheckForm
- **Check Types:** HttpRequest, SqlQuery, Redis, MongoDb
- **Health Query Integration:** DatabaseCheckForm supports healthQueryId selection
- **Features:** Create, Edit, Delete, Activate, Deactivate, Configure Criteria

### Application Component UI
- **Location:** Within ApplicationDetailsPage
- **Component:** ComponentList
- **Form:** ComponentFormDialog
- **Purpose:** Define Application Components for attaching Checks
- **Pattern:** One Application → Multiple Components → Multiple Checks

### Existing API Hooks/Services
- **Pattern:** Feature-based hooks in `src/features/{feature}/hooks/`
- **API Layer:** Centralized in `src/api/`
- **Query Keys:** Defined in `hooks/queryKeys.ts` per feature
- **Mutation Pattern:** Use useMutation with onSuccess cache invalidation
- **Query Pattern:** Use useQuery with enabled condition

### Query Key Conventions
- **Application:** `['applications', 'list']`
- **Dashboard:** `['application-dashboard', applicationId]`
- **Dashboard Sections:** `['dashboard-sections', dashboardId]`
- **Check Status:** `['check-status', checkId]`
- **Check Metrics:** `['check-metrics', checkId]`
- **Database Credentials:** `['database-credentials', 'list']`
- **Health Queries:** `['database-health-queries', filters]`
- **Monitoring Applications:** `['monitoring-applications']`

### Mutation Conventions
- **Create:** Invalidate list queries
- **Update:** Invalidate list and detail queries
- **Delete:** Invalidate list queries
- **Activate/Deactivate:** Invalidate list and detail queries
- **Pattern:** Function-based invalidation in onSuccess callback

### Cache Invalidation Conventions
- **Helper Functions:** Each feature has `invalidateXQueries(queryClient)`
- **Scope:** Invalidate specific keys, not entire cache
- **Example:** `invalidateCredentialQueries(queryClient, id)`

### Permission/Role Checks
- **Role Hooks:** `useUserRoleSimple()` returns role string
- **Access Functions:** `canWriteMonitoring(role)`, `canEditDashboard(role)`
- **UI Guards:** Conditional rendering based on `canWrite` boolean
- **Route Guards:** ProtectedRoute and AdminRoute components
- **Current State:** TODO comments indicate role checks not fully implemented yet

---

## 3. Relevant Existing Components

### Applications

**Files:**
- Page: `src/features/applications/pages/ApplicationsOverviewPage.tsx`
- Hooks: `src/features/applications/hooks/useApplications.ts`
- Query Keys: `src/features/applications/hooks/queryKeys.ts`
- Components: `src/features/applications/components/` (ApplicationHealthCard, ApplicationsWall, etc.)
- API: `src/api/applicationsApi.ts` (basic CRUD only)
- Monitoring API: `src/api/checkManagementApi.ts` (getMonitoringApplications)

**What it does:**
- Displays list of applications with health status
- Shows application cards with status indicators
- Navigates to dashboard on click
- Fetches application status from backend

**Why it can be reused:**
- Application list pattern is established
- Application navigation pattern exists
- Status display components are reusable
- Query key pattern is clear

**Where Database Health Monitoring belongs:**
- **Application Details Page** (`/monitoring/applications/:id`) is the natural location
- Existing ApplicationDetailsPage already shows Components
- Can add a new section/tab for "Database Health Monitoring"
- Can reuse the existing page structure and navigation

### Database Credentials

**Files:**
- Page: `src/features/database-credentials/pages/DatabaseCredentialsPage.tsx`
- Hooks: `src/features/database-credentials/hooks/useDatabaseCredentials.ts`
- Query Keys: `src/features/database-credentials/hooks/queryKeys.ts`
- Components: `src/features/database-credentials/components/` (CredentialTable, CredentialFormDialog, ConnectionTestResult)
- API: `src/api/databaseCredentialsApi.ts`
- Utils: `src/features/database-credentials/utils/credentialType.ts`, `formValidation.ts`

**What it does:**
- Lists all database credentials
- Create/Edit/View/Delete credentials
- Activate/Deactivate credentials
- Test database connection
- Filter by credential type (implied)
- Support for SqlServer, Redis, MongoDb, PostgreSql, MySql, Oracle, Snmp

**Why it can be reused:**
- Credential selection pattern exists (CredentialTable)
- Credential type filtering utilities exist
- Active/inactive handling is implemented
- Credential DTO already has credentialType field
- Connection testing pattern is established

**How the new feature should reuse:**
- Use existing `useDatabaseCredentials()` hook to load credentials
- Filter credentials by application (if backend supports) or show all
- Reuse credential type labels and utilities
- Reuse credential type compatibility logic
- Display credential selection UI similar to DatabaseCheckForm

### Database Health Queries

**Files:**
- Page: `src/features/database-health-queries/pages/DatabaseHealthQueriesPage.tsx`
- Hooks: `src/features/database-credentials/hooks/useDatabaseHealthQueries.ts`
- Query Keys: `src/features/database-health-queries/hooks/queryKeys.ts`
- Components: `src/features/database-health-queries/components/` (HealthQueryTable, HealthQueryFormDialog)
- API: `src/api/databaseHealthQueriesApi.ts`
- Types: `src/types/databaseHealthQueries.ts`
- Utils: `src/features/database-health-queries/utils/labels.ts`, `formValidation.ts`

**What it does:**
- Lists all database health queries
- Create/Edit/Activate/Deactivate queries
- Filter by databaseType, category, isActive, search
- Display: name, displayName, description, databaseType, category, resultType, unit
- Support for relational databases only (SqlServer, PostgreSql, MySql, Oracle)

**Why it can be reused:**
- Health query DTO structure exists
- Query filtering by databaseType is implemented
- Category labels and utilities exist
- ResultType handling is established
- Active/inactive handling is implemented

**How the new feature should reuse:**
- Use existing `useDatabaseHealthQueries()` hook for catalog queries
- Reuse category labels and database type labels
- Reuse filtering logic for compatibility
- Display query selection UI similar to DatabaseCheckForm
- Backend's available-queries endpoint returns similar structure

### Checks

**Files:**
- Page: `src/features/check-management/pages/MonitoringChecksPage.tsx`
- Detail Page: `src/features/checks/pages/CheckDetailPage.tsx`
- Hooks: `src/features/check-management/hooks/` (useChecks, useCreateCheck, etc.)
- Components: `src/features/check-management/components/` (CheckTable, CreateCheckDialog, DatabaseCheckForm, etc.)
- API: `src/api/checkManagementApi.ts`
- Types: `src/types/checkManagement.ts`

**What it does:**
- Lists all checks across applications
- Create/Edit/Delete/Activate/Deactivate checks
- Support for HTTP, SQL, Redis, MongoDB check types
- Configure criteria for checks
- SQL checks can use healthQueryId or custom query
- Display check status, last execution, health status

**Why it can be reused:**
- Check CRUD operations are fully implemented
- Health query integration exists in DatabaseCheckForm
- Check status display components exist
- Criteria configuration UI exists
- Check DTO structure is well-defined

**How the new feature should reuse:**
- Provisioned checks should be viewable in existing CheckList
- Check detail page can display health query information
- Criteria configuration should work for provisioned checks
- No changes needed to Check architecture - just new checks

### Dashboards

**Files:**
- Page: `src/features/dashboard/pages/ApplicationDashboardPage.tsx`
- Hooks: `src/features/dashboard/hooks/` (useApplicationDashboard, useApplicationOverview, etc.)
- Query Keys: `src/features/dashboard/hooks/queryKeys.ts`
- Components: `src/features/dashboard/components/` (ThinHealthHeader, DashboardRefreshButton, etc.)
- API: `src/api/applicationDashboardApi.ts`
- Services: `src/features/dashboard/services/metricHistoryApi.ts`
- Types: `src/types/dashboard.ts`

**What it does:**
- Displays application dashboard with sections and widgets
- Shows application health header
- Refreshes dashboard data
- Navigates to dashboard designer (Admin/Operator)
- Supports multiple sections

**Why it can be reused:**
- Dashboard rendering is fully dynamic
- Section-based architecture supports new sections
- Widget rendering is type-based via registry
- Refresh pattern is established
- Dashboard normalization handles backend variations

**How the new feature should reuse:**
- "Database Health" section will appear automatically
- NumberCard widgets will render automatically
- No frontend changes needed for widget display
- Dashboard refresh will include new widgets

### Widgets

**Files:**
- Registry: `src/components/widgets/registry.ts`
- Renderer: `src/components/widgets/WidgetRenderer.tsx`
- Layout Renderer: `src/components/widgets/DashboardLayoutRenderer.tsx`
- Section Renderer: `src/components/widgets/DashboardSectionRenderer.tsx`
- Widget Grid: `src/components/widgets/WidgetGrid.tsx`
- Widget Types:
  - NumberCard: `src/components/widgets/NumberMetricWidget.tsx`
  - StatusCard: `src/components/widgets/StatusCardWidget.tsx`
  - Chart: `src/components/widgets/MetricChartWidget.tsx`
  - MultiSeriesChart: `src/components/widgets/MultiSeriesChartWidget.tsx`
  - Table: `src/components/widgets/TableWidget.tsx`
  - Gauge: `src/components/widgets/GaugeWidget.tsx`
  - ProgressBar: `src/components/widgets/ProgressBarWidget.tsx`
- Widget Chrome: `src/components/widgets/WidgetChrome.tsx`
- Widget Detail Dialog: `src/components/widgets/WidgetDetailDialog.tsx`
- Hooks: `src/components/widgets/useMetricWidgetValue.ts`, `useWidgetRefresh.ts`
- Types: `src/types/widgets.ts`

**What it does:**
- Renders widgets based on type registry
- Displays widget data from data sources
- Supports check-based data sources
- Supports server metric data sources
- Handles widget refresh
- Shows widget details on click

**Why it can be reused:**
- Widget registry is extensible
- NumberCard widget already exists
- Check-based data source handling exists
- Widget rendering is type-based and dynamic
- No special handling needed for auto-provisioned widgets

**How the new feature should reuse:**
- NumberCard widgets will render automatically
- Check-based data sources will work automatically
- No changes needed to widget architecture
- Widget detail dialog will show check information

### NumberCard

**File:** `src/components/widgets/NumberMetricWidget.tsx`

**What it does:**
- Displays a single metric value
- Shows metric label and aggregation
- Supports threshold-based coloring
- Supports health status from API
- Handles server metric data sources
- Handles check-based metric data sources

**Why it can be reused:**
- Check-based data source handling exists
- Metric value fetching is implemented
- Health status display is implemented
- Threshold coloring is implemented

**How the new feature should reuse:**
- Auto-provisioned NumberCards will work automatically
- Check-based data source will be used
- No changes needed to NumberCard widget

### Permissions

**Files:**
- Role Access: `src/auth/roleAccess.ts`
- Role Hooks: `src/features/auth/hooks/useUserRoleSimple.ts`
- Protected Routes: `src/routes/ProtectedRoute.tsx`
- Admin Routes: `src/routes/AdminRoute.tsx`
- User Context: `src/features/auth/contexts/UserContext.tsx`

**What it does:**
- Provides role-based access control
- Guards admin-only routes
- Guards write operations
- Provides role hooks for components

**Why it can be reused:**
- Role checking functions exist
- Admin route guard exists
- Write permission pattern exists
- UI guard pattern exists

**How the new feature should reuse:**
- Provision endpoints (POST) should use Admin guard
- Read endpoints (GET) should use ProtectedRoute
- UI should use `canWriteMonitoring(role)` for write actions
- Follow existing permission patterns

### API/React Query

**Files:**
- HTTP Client: `src/api/httpClient.ts`
- API Utils: `src/api/apiUtils.ts`
- Query Client: `src/app/queryClient.ts`
- Pattern: Feature-based API files in `src/api/`
- Pattern: Feature-based hooks in `src/features/{feature}/hooks/`

**What it does:**
- Centralized HTTP client with interceptors
- Standardized error handling
- React Query integration
- Query key conventions
- Mutation patterns

**Why it can be reused:**
- HTTP client is configured
- Error handling is standardized
- Query client is configured
- API pattern is established
- Hook pattern is established

**How the new feature should reuse:**
- Create new API file: `src/api/databaseHealthMonitoringApi.ts`
- Create new hooks in `src/features/database-health-monitoring/hooks/`
- Follow existing query key patterns
- Follow existing mutation patterns
- Use existing error handling

---

## 4. Existing Reusable Patterns

### API Service Pattern

**File:** `src/api/databaseCredentialsApi.ts`

**What it does:**
- Exports an object with async methods
- Each method calls httpClient with appropriate path
- Uses `requestApiData` wrapper for error handling
- Returns typed DTOs

**Why it can be reused:**
- Established pattern for all API services
- Type-safe with TypeScript
- Consistent error handling
- Easy to extend

**New API file needed:** `src/api/databaseHealthMonitoringApi.ts`

### React Query Hook Pattern

**File:** `src/features/database-credentials/hooks/useDatabaseCredentials.ts`

**What it does:**
- Exports named hooks for queries and mutations
- Uses useQuery with queryKey and queryFn
- Uses useMutation with mutationFn and onSuccess
- Invalidates cache in onSuccess
- Helper function for cache invalidation

**Why it can be reused:**
- Established pattern for all features
- Consistent cache invalidation
- Type-safe
- Easy to extend

**New hooks needed:** `src/features/database-health-monitoring/hooks/`

### Query Key Pattern

**File:** `src/features/database-credentials/hooks/queryKeys.ts`

**What it does:**
- Exports a `queryKeys` object
- Follows hierarchical structure: all, list, detail
- Uses factory functions for dynamic keys
- Type-safe with `as const`

**Why it can be reused:**
- Established pattern for all features
- Hierarchical structure
- Type-safe
- Easy to extend

**New query keys needed:** `src/features/database-health-monitoring/hooks/queryKeys.ts`

### Dialog Form Pattern

**File:** `src/features/database-credentials/components/CredentialFormDialog.tsx`

**What it does:**
- MUI Dialog with title, content, actions
- Form fields with validation
- Submit button with loading state
- Error display via Alert
- Mode prop for create/edit/view
- onSubmit callback with form values
- onClose callback

**Why it can be reused:**
- Established pattern for all forms
- Supports multiple modes
- Handles loading and error states
- Type-safe with TypeScript

**New dialog needed:** Provision Database Health Monitoring Dialog

### Table Card Pattern

**File:** `src/features/database-credentials/components/CredentialTable.tsx`

**What it does:**
- MUI Table with columns
- Action buttons (view, edit, delete, toggle active)
- Loading state for async actions
- Sort by display order
- Filters by type/active status

**Why it can be reused:**
- Established pattern for all tables
- Supports async actions
- Type-safe
- Easy to extend

**New table needed:** Provisioned Checks Table (optional, for viewing status)

### Page Container Pattern

**File:** `src/features/database-credentials/pages/DatabaseCredentialsPage.tsx`

**What it does:**
- Uses MonitoringPageContainer wrapper
- MonitoringSectionHeader for title
- MonitoringToolbar for actions
- Loading/Error/Empty state handling
- Dialog state management
- Mutation state management
- Refresh logic

**Why it can be reused:**
- Established pattern for all pages
- Consistent layout
- Handles all states
- Easy to extend

**New page/section needed:** Database Health Monitoring section in ApplicationDetailsPage

### Monitoring Navigation Pattern

**File:** `src/components/monitoring/layout/monitoringNav.tsx`

**What it does:**
- Defines navigation items with id, label, path, icon
- Groups items into sections
- Filters items by role
- Determines active item based on pathname
- Provides section title based on pathname

**Why it can be reused:**
- Established navigation pattern
- Role-based filtering
- Active state logic
- Section grouping

**Potential change:** Add new nav item if separate page is created (not recommended)

### Form Validation Pattern

**File:** `src/features/database-credentials/utils/formValidation.ts`

**What it does:**
- Defines form values interface
- Defines form errors interface
- Validation function returns errors object
- Helper functions for specific validations
- Type-safe with TypeScript

**Why it can be reused:**
- Established pattern for all forms
- Type-safe
- Reusable validation functions
- Easy to extend

**New validation needed:** Provision form validation (credential selection)

### Loading/Error/Empty State Pattern

**Files:**
- `src/components/dashboard/DashboardLoading.tsx`
- `src/components/dashboard/DashboardError.tsx`
- `src/components/monitoring/layout/MonitoringEmptyState.tsx`

**What they do:**
- Display loading spinner with message
- Display error with retry button
- Display empty state with action button
- Consistent styling

**Why they can be reused:**
- Established pattern for all pages
- Consistent UX
- Easy to use

**No new components needed** - reuse existing ones

### Mutation Success/Error Pattern

**File:** `src/features/database-credentials/pages/DatabaseCredentialsPage.tsx`

**What it does:**
- Mutation error displayed in Alert
- Success message via notice state
- Error message via getErrorMessage
- Reset mutation on dialog open
- Refetch queries on success

**Why it can be reused:**
- Established pattern for all mutations
- Consistent error display
- Automatic refetch
- Easy to implement

**Reuse in:** Provision mutation success/error handling

---

## 5. Backend API Contract

### POST /api/applications/{applicationId}/database-health-monitoring/provision

**Method:** POST
**Route:** `/api/applications/{applicationId}/database-health-monitoring/provision`
**Authorization:** Bearer token (Admin role required)
**Content-Type:** application/json

**Request:**
```typescript
{
  databaseCredentialIds: number[]
}
```

**Required Fields:**
- `databaseCredentialIds`: Array of credential IDs to provision

**Optional Fields:** None

**Validation Behavior:**
- Application must exist
- All credentials must exist
- All credentials must be active
- Credentials must be compatible with health queries (by database type)
- Returns success even if some items are skipped (idempotent)

**Response (Success):**
```typescript
{
  success: true,
  message: string,
  data: {
    createdChecks: number,
    existingChecks: number,
    createdWidgets: number,
    skipped: number,
    items: Array<{
      healthQueryId: number,
      databaseCredentialId: number,
      checkId: number | null,
      widgetId: number | null,
      created: boolean,
      error: string | null
    }>
  }
}
```

**Response (Error):**
```typescript
{
  success: false,
  message: string,
  errors?: string[] | null
}
```

**Frontend Implications:**
- Admin-only operation - use Admin guard or check role
- Call after user selects credentials
- Display result summary (created, existing, skipped)
- Display detailed errors if any items failed
- Invalidate dashboard query after success
- Invalidate provisioned-checks query after success
- Navigate to dashboard or show success message

### POST /api/applications/{applicationId}/database-health-monitoring/add

**Method:** POST
**Route:** `/api/applications/{applicationId}/database-health-monitoring/add`
**Authorization:** Bearer token (Admin role required)
**Content-Type:** application/json

**Request:**
```typescript
{
  databaseCredentialIds: number[],
  databaseHealthQueryIds: number[]
}
```

**Required Fields:**
- `databaseCredentialIds`: Array of credential IDs
- `databaseHealthQueryIds`: Array of health query IDs to add

**Optional Fields:** None

**Validation Behavior:**
- Application must exist
- All credentials must exist and be active
- All health queries must exist and be active
- Credentials must be compatible with health queries
- Skips already provisioned combinations

**Response:** Same structure as provision endpoint

**Frontend Implications:**
- Admin-only operation
- Call after user selects specific health queries
- Display result summary
- Display detailed errors
- Invalidate dashboard query after success
- Invalidate provisioned-checks query after success
- Used for adding new health queries to existing applications

### GET /api/applications/{applicationId}/database-health-monitoring/available-queries?databaseCredentialId={id}

**Method:** GET
**Route:** `/api/applications/{applicationId}/database-health-monitoring/available-queries?databaseCredentialId={id}`
**Authorization:** Bearer token (Admin, Operator, Viewer)
**Query Parameters:**
- `databaseCredentialId` (required): ID of the credential to get queries for

**Request Parameters:** None in body

**Validation Behavior:**
- Application must exist
- Credential must exist
- Credential must be active

**Response (Success):**
```typescript
{
  success: true,
  data: Array<{
    id: number,
    name: string,
    displayName: string,
    description: string | null,
    databaseType: CredentialType, // SqlServer, PostgreSql, MySql, Oracle
    category: DatabaseHealthQueryCategory,
    resultType: ResultType, // Scalar, StatusCount, Dataset
    unit: string | null,
    isAlreadyProvisioned: boolean
  }>
}
```

**Response (Error):**
```typescript
{
  success: false,
  message: string
}
```

**Frontend Implications:**
- Read operation - use ProtectedRoute
- **Credential-specific:** Must call once per selected credential
- Display available queries with isAlreadyProvisioned flag
- Filter out already provisioned queries from selection
- Show database type, category, result type, unit
- Cache results per credential
- Used in "Add Health Monitoring" flow

**Important:** This endpoint is credential-specific. For multi-credential selection, frontend must:
1. Call this endpoint for each selected credential
2. Merge results and deduplicate by health query ID
3. Display which credentials each query is available for
4. OR: Call sequentially and allow user to select per-credential

### GET /api/applications/{applicationId}/database-health-monitoring/provisioned-checks

**Method:** GET
**Route:** `/api/applications/{applicationId}/database-health-monitoring/provisioned-checks`
**Authorization:** Bearer token (Admin, Operator, Viewer)
**Query Parameters:** None

**Request Parameters:** None

**Validation Behavior:**
- Application must exist

**Response (Success):**
```typescript
{
  success: true,
  data: Array<{
    healthQueryId: number,
    databaseCredentialId: number,
    checkId: number | null,
    widgetId: number | null,
    created: boolean
  }>
}
```

**Response (Error):**
```typescript
{
  success: false,
  message: string
}
```

**Frontend Implications:**
- Read operation - use ProtectedRoute
- Display current provisioning status
- Show which health queries are provisioned for which credentials
- Show check and widget IDs
- Identify missing widgets (check exists but widget is null)
- Cache results
- Refresh after provision/add operations
- Used to show "View Provisioned Checks" UI

**Fields useful to UI:**
- `healthQueryId`: Cross-reference with health query catalog
- `databaseCredentialId`: Cross-reference with credential list
- `checkId`: Link to check detail page
- `widgetId`: Link to widget (if needed)
- `created`: Distinguish newly created vs existing

**Missing information from backend:**
- Health query name/display name (must cross-reference with catalog)
- Credential name (must cross-reference with credential list)
- Widget title (must cross-reference with dashboard or widget API)
- Section information (must cross-reference with dashboard)

---

## 6. Recommended UX

### Initial Provisioning

**Conceptual Flow:**
1. User opens Application Details page (/monitoring/applications/:id)
2. User sees "Database Health Monitoring" section/tab
3. Frontend loads application's database credentials
4. User selects one or more active credentials
5. Frontend shows summary of what will be provisioned (credential count, estimated queries)
6. User confirms
7. POST /provision is called
8. Show result dialog with created/existing/skipped counts
9. Refresh relevant data (dashboard, provisioned-checks)
10. Navigate to dashboard or allow user to open Database Health section

**Recommended Location:**
- **Application Details Page** (`src/features/monitoring-management/pages/ApplicationDetailsPage.tsx`)
- Add a new tab or section below Components
- Title: "Database Health Monitoring"
- Use existing MonitoringSectionHeader and MonitoringTableCard patterns

**Existing Components to Reuse:**
- ApplicationDetailsPage structure
- MonitoringSectionHeader
- MonitoringToolbar
- CredentialTable or custom credential selection UI
- Dialog pattern for confirmation
- Alert pattern for success/error

**Credential Selection UI:**
- Multi-select checkbox list of credentials
- Filter by active status (only show active)
- Show credential type badge
- Show credential name and server
- Use MUI Select with checkboxes or custom CheckboxList
- [UNCERTAIN]: Should inactive credentials be shown as disabled or hidden?

**Summary Display:**
- Before confirmation: "Will provision X health queries for Y credentials"
- After confirmation: "Created Z checks, W widgets. Skipped V (already exist)"

**Loading:**
- Show loading spinner while fetching credentials
- Show loading spinner during provision call
- Disable confirm button during provision

**Errors:**
- Show error alert if no credentials exist
- Show error alert if no compatible credentials
- Show error alert if provision fails
- Display detailed errors from items array

**Confirmation:**
- Use confirmation dialog similar to ConfirmDeleteDialog
- Show selected credentials count
- Show estimated queries count (if calculable)
- Warn about idempotency (won't create duplicates)

**Success Display:**
- Show success alert with counts
- Show detailed results in a dialog or expandable section
- Show errors for any failed items
- Provide button to navigate to dashboard

### Add Health Monitoring

**Conceptual Flow:**
1. User opens Database Health Monitoring section in Application Details
2. User clicks "Add Health Query" button
3. Frontend loads available health queries (per credential)
4. User selects one or more health queries
5. User selects one or more compatible credentials
6. User confirms
7. POST /add is called
8. Show result dialog
9. Refresh provisioned-checks and dashboard
10. Update available queries list

**Recommended Location:**
- Same section as Initial Provisioning
- Add toolbar button "Add Health Query"
- Open dialog for selection

**Health Query Selection UI:**
- Display available health queries in a table or list
- Show: displayName, databaseType, category, unit
- Filter out isAlreadyProvisioned queries
- Show which credentials each query is compatible with
- Multi-select checkboxes

**Credential Selection UI:**
- Multi-select checkboxes for credentials
- Filter by compatibility with selected health queries
- Show credential type badges
- Gray out incompatible credentials

**[BACKEND GAP]:** The available-queries endpoint is credential-specific. For multi-credential "Add" flow:
- **Option A:** Call available-queries for each credential, merge results, show which credentials each query is available for
- **Option B:** Require user to select one credential first, then show queries for that credential only
- **Option C:** Call global health queries catalog, filter by database type, check provisioned status separately

**Recommended:** Option A (merge results) for best UX, but requires multiple API calls.

**Loading:**
- Show loading while fetching available queries per credential
- Show loading during add call
- Disable confirm button during add

**Errors:**
- Show error if no queries available
- Show error if no compatible credentials
- Show error if add fails
- Display detailed errors from items array

**Success Display:**
- Show success alert with counts
- Show detailed results
- Refresh available queries list
- Refresh provisioned-checks list

### View Provisioned Checks

**Conceptual Flow:**
1. User opens Database Health Monitoring section
2. Frontend loads provisioned-checks
3. Display table of provisioned checks
4. Show health query name, credential name, check status
5. Provide link to check detail page
6. Provide link to dashboard

**Recommended Location:**
- Same section as Initial Provisioning
- Table below provisioning controls
- Or separate tab "Provisioned Checks"

**Table Columns:**
- Health Query (displayName)
- Credential (name)
- Database Type
- Check Status (from check detail or last execution)
- Check ID (link to CheckDetailPage)
- Widget Status (exists/missing)
- Actions (view check, view dashboard)

**Data Sources:**
- GET /provisioned-checks
- Cross-reference with health query catalog for names
- Cross-reference with credential list for names
- Cross-reference with check status API for status

**Loading:**
- Show loading spinner while fetching provisioned-checks
- Show loading while fetching cross-reference data

**Errors:**
- Show error if fetch fails
- Show retry button

**Empty State:**
- Show empty state if no checks provisioned
- Offer button to "Enable Database Health Monitoring"

### Dashboard Integration

**Automatic Rendering:**
- Backend automatically creates "Database Health" section
- Backend automatically creates NumberCard widgets
- Frontend DashboardLayoutRenderer handles sections dynamically
- Frontend WidgetRenderer handles NumberCard widgets dynamically
- **No frontend changes needed** for rendering

**Verification:**
- Dashboard query (`/api/applications/{applicationId}/dashboard`) returns sections
- Section with title "Database Health" will appear
- Widgets with type "NumberCard" will render
- Widget data sources will reference provisioned checks
- Check metrics will populate widget values

**User Flow:**
1. User provisions database health monitoring
2. User navigates to application dashboard
3. "Database Health" section appears automatically
4. NumberCard widgets show health query results
5. Widgets refresh with dashboard refresh interval

**Potential Frontend Gap:**
- [UNCERTAIN]: Does NumberCard widget support Check-based data source without metricId?
- Current NumberMetricWidget uses checkId and metricId
- Backend provisioned widgets may not have metricId
- **Investigation needed:** Check if NumberMetricWidget can work with checkId only

**If Gap Exists:**
- May need to update NumberMetricWidget to support check-only data sources
- Or backend must create metric definitions for provisioned checks
- Mark as [BACKEND GAP] if metricId is required

---

## 7. State Model

### HealthQuery States

**Available:**
- Definition: Health query exists in catalog, is active, and is compatible with selected credential(s)
- Detection: `isActive: true` in catalog, `databaseType` matches credential type
- UI Display: Show in selection list, enabled

**Already Provisioned:**
- Definition: Health query is already provisioned for the application and credential
- Detection: `isAlreadyProvisioned: true` in available-queries response
- OR: Exists in provisioned-checks response
- UI Display: Show in selection list but disabled, with "Already provisioned" label

**Inactive:**
- Definition: Health query exists but is not active
- Detection: `isActive: false` in catalog
- UI Display: Filtered out from selection lists (not shown)

**Incompatible:**
- Definition: Health query database type does not match credential type
- Detection: `databaseType` mismatch between query and credential
- UI Display: Not shown in available-queries for that credential

**Error:**
- Definition: Health query failed to provision
- Detection: `error: string` not null in provision response items
- UI Display: Show error message in results dialog

### Credential States

**Active:**
- Definition: Credential exists and is active
- Detection: `isActive: true` in credential DTO
- UI Display: Show in selection list, enabled

**Inactive:**
- Definition: Credential exists but is not active
- Detection: `isActive: false` in credential DTO
- UI Display: Hide from selection list (backend validates active status)

**Compatible:**
- Definition: Credential type matches at least one health query type
- Detection: Credential type exists in health query catalog
- UI Display: Show in selection list

**Incompatible:**
- Definition: Credential type matches no health queries
- Detection: No health queries returned for credential type
- UI Display: Show but with "No compatible health queries" message

### Provisioned Check States

**Created:**
- Definition: Check was newly created by provision operation
- Detection: `created: true` in provision response
- UI Display: Show as "Created" in results

**Existing:**
- Definition: Check already existed before provision operation
- Detection: `created: false` in provision response, `checkId` not null
- UI Display: Show as "Existing" in results, skip count

**Missing Widget:**
- Definition: Check exists but widget was not created
- Detection: `checkId` not null, `widgetId` null in provisioned-checks
- UI Display: Show warning in provisioned-checks table

**Error:**
- Definition: Check or widget creation failed
- Detection: `error: string` not null in provision response items
- UI Display: Show error message in results dialog

### States Not Supported by Backend

**Partial Success:**
- Backend returns items array with individual errors
- Frontend can display partial success
- Backend supports this via items array

**Provisioning in Progress:**
- Backend does not provide async status
- Frontend must show loading during API call
- No background polling needed

**Health Query Deletion Impact:**
- Backend does not indicate if a provisioned check's health query was deleted
- Frontend cannot detect this
- Mark as [BACKEND GAP]

**Credential Deletion Impact:**
- Backend does not indicate if a provisioned check's credential was deleted
- Frontend cannot detect this
- Mark as [BACKEND GAP]

---

## 8. React Query / Cache Strategy

### Query Key Convention

**Proposed Structure:**
```typescript
export const databaseHealthMonitoringQueryKeys = {
  all: ['database-health-monitoring'] as const,
  provisionedChecks: (applicationId: number) =>
    [...databaseHealthMonitoringQueryKeys.all, 'provisioned-checks', applicationId] as const,
  availableQueries: (applicationId: number, credentialId: number) =>
    [...databaseHealthMonitoringQueryKeys.all, 'available-queries', applicationId, credentialId] as const,
}
```

**Follows existing pattern:**
- Hierarchical structure (all → specific)
- Factory functions for dynamic keys
- Type-safe with `as const`

### Cache Invalidation After Provision

**Queries to Invalidate:**
1. `dashboardQueryKeys.dashboard(applicationId)` - Refresh dashboard to show new widgets
2. `databaseHealthMonitoringQueryKeys.provisionedChecks(applicationId)` - Refresh provisioned checks list
3. `dashboardQueryKeys.overview(applicationId)` - Refresh application overview (check counts may change)
4. `dashboardQueryKeys.applicationChecks(applicationId)` - Refresh checks list

**Implementation:**
```typescript
function invalidateAfterProvision(queryClient: QueryClient, applicationId: number) {
  void queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.dashboard(applicationId) });
  void queryClient.invalidateQueries({ queryKey: databaseHealthMonitoringQueryKeys.provisionedChecks(applicationId) });
  void queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.overview(applicationId) });
  void queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.applicationChecks(applicationId) });
}
```

### Cache Invalidation After Add

**Same as Provision:**
- Invalidate dashboard (new widgets may be added)
- Invalidate provisioned-checks (new checks added)
- Invalidate overview (check counts change)
- Invalidate application-checks (check list changes)

### Cache Invalidation After Health Query Changes

**If health query is activated/deactivated:**
- Invalidate `databaseHealthMonitoringQueryKeys.availableQueries()` for affected applications
- Frontend cannot know which applications are affected
- Mark as [BACKEND GAP] - Backend should notify or frontend should invalidate all

**If health query is updated:**
- Invalidate `databaseHealthQueryKeys.lists()` - catalog changed
- Invalidate `databaseHealthMonitoringQueryKeys.availableQueries()` - query metadata changed

### Cache Invalidation After Credential Changes

**If credential is activated/deactivated:**
- Invalidate `databaseCredentialsQueryKeys.list()` - credential list changed
- Invalidate `databaseHealthMonitoringQueryKeys.provisionedChecks()` - credential status affects compatibility

**If credential is deleted:**
- Invalidate `databaseCredentialsQueryKeys.list()`
- Invalidate `databaseHealthMonitoringQueryKeys.provisionedChecks()`
- Provisioned checks may become orphaned
- Mark as [BACKEND GAP] - Backend should handle or indicate orphaned checks

### Cache Invalidation After Check Changes

**If provisioned check is deleted via Check UI:**
- Invalidate `databaseHealthMonitoringQueryKeys.provisionedChecks()` - check no longer provisioned
- Invalidate `dashboardQueryKeys.dashboard(applicationId)` - widget may be affected
- Invalidate `dashboardQueryKeys.applicationChecks(applicationId)` - check list changed

**If provisioned check is activated/deactivated:**
- Invalidate `databaseHealthMonitoringQueryKeys.provisionedChecks()` - status changed
- Invalidate dashboard metrics

### Stale Time Configuration

**provisioned-checks:**
- staleTime: 30_000 (30 seconds) - standard
- refetchInterval: Not needed (refresh on action)

**available-queries:**
- staleTime: 60_000 (60 seconds) - catalog changes infrequently
- refetchInterval: Not needed (refresh on action)

---

## 9. Routing Strategy

### Current Routes Analysis

**Application-Related Routes:**
- `/applications` - Applications overview (operational view)
- `/applications/:applicationId/dashboard` - Application dashboard (operational view)
- `/monitoring/applications` - Monitoring applications list (management view)
- `/monitoring/applications/:id` - Application details (management view)

**Pattern:**
- `/applications/*` - Operational views (dashboard, status)
- `/monitoring/*` - Management views (CRUD, configuration)

### Recommended Strategy

**No New Route Needed**

**Location:** Application Details Page (`/monitoring/applications/:id`)

**Implementation:**
- Add a new tab or section in `ApplicationDetailsPage.tsx`
- Use MUI Tabs or expandable sections
- Tab 1: Components (existing)
- Tab 2: Database Health Monitoring (new)
- OR: Add section below Components with collapsible header

**Why No New Route:**
- Feature is application-specific
- Existing ApplicationDetailsPage is the natural location
- Follows existing pattern (Components are in the same page)
- Reduces navigation complexity
- Consistent with existing UX

**Alternative (Not Recommended):**
- New route `/monitoring/applications/:id/database-health`
- Requires additional navigation
- Breaks existing pattern
- Adds complexity

### Route Implementation

**File:** `src/routes/paths.ts`
**Change:** None (no new route)

**File:** `src/routes/AppRoutes.tsx`
**Change:** None (no new route)

**File:** `src/features/monitoring-management/pages/ApplicationDetailsPage.tsx`
**Change:** Add Database Health Monitoring section/tab

---

## 10. Permission Strategy

### Backend Permission Requirements

**POST /provision:**
- Admin only

**POST /add:**
- Admin only

**GET /available-queries:**
- Admin, Operator, Viewer

**GET /provisioned-checks:**
- Admin, Operator, Viewer

### Frontend Permission Implementation

**Write Operations (Provision, Add):**
- Use `canWriteMonitoring(role)` from `src/auth/roleAccess.ts`
- Returns true only for Admin
- Disable buttons for non-Admin users
- Show message: "Only Admin can provision database health monitoring"

**Read Operations (Available Queries, Provisioned Checks):**
- Use ProtectedRoute (already wraps all monitoring routes)
- All authenticated users can view
- No additional checks needed

**UI Guards:**
```typescript
const { data: role } = useUserRoleSimple();
const canWrite = canWriteMonitoring(role);

// Provision button
{canWrite && (
  <Button onClick={openProvisionDialog}>
    Enable Database Health Monitoring
  </Button>
)}

// Add button
{canWrite && (
  <Button onClick={openAddDialog}>
    Add Health Query
  </Button>
)}
```

**Read-Only View:**
- Non-Admin users can view provisioned checks
- Non-Admin users can view available queries
- Non-Admin users cannot see "Enable" or "Add" buttons
- Show message: "Contact Admin to enable database health monitoring"

### Existing Permission Patterns

**File:** `src/features/monitoring-management/pages/MonitoringApplicationsPage.tsx`
**Pattern:**
```typescript
const { data: role } = useUserRoleSimple();
const canWrite = canWriteMonitoring(role);

// Guard write actions
{canWrite ? <Button onClick={...}>Add</Button> : null}
```

**File:** `src/features/database-credentials/pages/DatabaseCredentialsPage.tsx`
**Pattern:**
```typescript
// TODO: Restrict to Admin when backend roles are finalized
const canWrite = true;
```

**Current State:**
- TODO comments indicate role checks not fully implemented
- Can implement role checks for this feature from the start
- Follow existing pattern once it's finalized

### Recommended Implementation

**For Provision/Add:**
- Implement Admin-only guard from the start
- Use `canWriteMonitoring(role)`
- Disable buttons for non-Admin
- Show informative message

**For Read Operations:**
- Allow all authenticated users
- Use existing ProtectedRoute
- No additional checks

**For View Provisioned Checks:**
- Allow all authenticated users to view
- Show status information
- Disable edit/delete actions (not applicable to provisioned checks)

---

## 11. Dashboard / Widget Integration

### Backend Automatic Creation

**What Backend Creates:**
1. **ApplicationComponent:** code="DatabaseHealthMonitoring" (if not exists)
2. **DashboardSection:** title="Database Health" (if not exists)
3. **NumberCard Widgets:** One per provisioned health query
4. **WidgetDataSources:** Links widget to provisioned check

### Frontend Dashboard Rendering

**Trace:**

1. **API Response:**
   - `GET /api/applications/{applicationId}/dashboard`
   - Returns `DashboardLayoutDto` with sections[]
   - Includes "Database Health" section with widgets[]

2. **Dashboard Query:**
   - Hook: `useApplicationDashboard(applicationId)`
   - Query Key: `['application-dashboard', applicationId]`
   - File: `src/features/dashboard/hooks/useApplicationDashboard.ts`

3. **Layout Normalization:**
   - Function: `normalizeDashboardLayout(raw)`
   - File: `src/utils/dashboardLayout.ts`
   - Handles sections[] and widgets[]
   - Normalizes sectionId and dashboardSectionId

4. **Sections Rendering:**
   - Component: `DashboardLayoutRenderer`
   - File: `src/components/widgets/DashboardLayoutRenderer.tsx`
   - Calls `getVisibleDashboardSections(layout)`
   - Maps sections to `DashboardSectionRenderer`

5. **Section Rendering:**
   - Component: `DashboardSectionRenderer`
   - File: `src/components/widgets/DashboardSectionRenderer.tsx`
   - Renders section header with title and color
   - Calls `WidgetGrid` with section.widgets

6. **Widget Rendering:**
   - Component: `WidgetGrid`
   - File: `src/components/widgets/WidgetGrid.tsx`
   - Maps widgets to `WidgetRenderer`

7. **Widget Component Resolution:**
   - Component: `WidgetRenderer`
   - File: `src/components/widgets/WidgetRenderer.tsx`
   - Calls `getWidgetComponent(widgetType)` from registry
   - Registry: `src/components/widgets/registry.ts`

8. **NumberCard Rendering:**
   - Component: `NumberMetricWidget`
   - File: `src/components/widgets/NumberMetricWidget.tsx`
   - Receives: title, configuration, dataSources
   - Uses: `useMetricWidgetValueWithStatus(configuration, dataSources)`

9. **Data Source Handling:**
   - Hook: `useMetricWidgetValueWithStatus`
   - File: `src/components/widgets/useMetricWidgetValue.ts`
   - Extracts checkId and metricId from dataSources
   - Fetches metric value from check metrics API

10. **Check Result Fetching:**
    - API: `checkMetricsApi.getCheckMetrics(checkId)`
    - File: `src/api/checkMetricsApi.ts`
    - Returns latest metric values

### Frontend Gap Analysis

**Gap 1: NumberCard with Check-Only Data Source**
- Current NumberMetricWidget expects both checkId and metricId
- Backend provisioned widgets may not have metricId
- [UNCERTAIN]: Does backend create metric definitions for provisioned checks?
- [UNCERTAIN]: Does NumberMetricWidget work with checkId only?

**Investigation Needed:**
- Check NumberMetricWidget implementation
- Check if metricId is required or optional
- Check if checkId alone can fetch metrics

**If Gap Exists:**
- Option A: Update NumberMetricWidget to support check-only data sources
- Option B: Backend must create metric definitions for provisioned checks
- Mark as [BACKEND GAP] if backend doesn't create metrics

**Gap 2: Widget Title**
- Backend sets widget title to HealthQuery.DisplayName
- Frontend should display this title
- NumberMetricWidget uses title prop from widget DTO
- No gap expected

**Gap 3: Section Title**
- Backend sets section title to "Database Health"
- Frontend DashboardSectionRenderer displays section.title
- No gap expected

**Gap 4: Widget Configuration**
- Backend may set widget configuration (thresholds, units, etc.)
- Frontend NumberMetricWidget uses configuration prop
- No gap expected if configuration is properly set

### Recommended Verification

**Before Implementation:**
1. Test if NumberMetricWidget works with checkId only (no metricId)
2. Check if backend creates metric definitions for provisioned checks
3. Verify dashboard API returns provisioned widgets correctly
4. Verify widget data sources reference checkId correctly

**If Verification Fails:**
- Document specific gap
- Determine if frontend or backend change is needed
- Mark as [BACKEND GAP] if backend change required

### No Frontend Changes Expected

**Dashboard Rendering:**
- Fully dynamic, supports new sections automatically
- No changes needed to DashboardLayoutRenderer
- No changes needed to DashboardSectionRenderer

**Widget Rendering:**
- Fully dynamic via registry
- NumberCard already registered
- No changes needed to WidgetRenderer
- No changes needed to registry

**Data Fetching:**
- Check metrics API already exists
- Dashboard refresh already implemented
- No changes needed to data fetching

**Summary:**
- Frontend should automatically render provisioned widgets
- No changes to dashboard architecture needed
- No changes to widget architecture needed
- Only potential gap is NumberCard data source handling

---

## 12. TypeScript Domain Model Impact

### Existing Types to Reuse

**Application:**
- File: `src/types/applications.ts`
- Type: `ApplicationListItem`, `ApplicationStatusDto`
- Reuse: Display application name, check status

**DatabaseCredential:**
- File: `src/types/databaseCredentials.ts`
- Type: `DatabaseCredentialDto`
- Fields: id, name, server, databaseName, credentialType, isActive
- Reuse: Credential selection, compatibility check

**DatabaseHealthQuery:**
- File: `src/types/databaseHealthQueries.ts`
- Type: `DatabaseHealthQueryDto`
- Fields: id, name, displayName, databaseType, category, resultType, unit, isActive
- Reuse: Query selection, display

**Check:**
- File: `src/types/checkManagement.ts`
- Type: `CheckDefinitionDto`, `CheckListItem`
- Fields: id, name, checkType, sqlConfiguration (with healthQueryId)
- Reuse: Link to check details, display check status

**Dashboard:**
- File: `src/types/dashboard.ts`
- Type: `DashboardLayoutDto`, `DashboardSectionDto`, `WidgetDto`
- Reuse: Dashboard rendering, widget linking

**Widget:**
- File: `src/types/widgets.ts`
- Type: `WidgetDataSourceDto`, `WidgetConfiguration`
- Reuse: Widget data source handling

**Enums:**
- File: `src/types/enums.ts`
- Types: `CredentialType`, `DatabaseHealthQueryCategory`, `ResultType`
- Reuse: Type filtering, display labels

### Types That Need Extension

**New Types Needed:**

```typescript
// src/types/databaseHealthMonitoring.ts

export interface ProvisionDatabaseHealthMonitoringRequestDto {
  databaseCredentialIds: number[];
}

export interface AddDatabaseHealthMonitoringRequestDto {
  databaseCredentialIds: number[];
  databaseHealthQueryIds: number[];
}

export interface ProvisioningResultDto {
  createdChecks: number;
  existingChecks: number;
  createdWidgets: number;
  skipped: number;
  items: ProvisionedCheckDetailDto[];
}

export interface ProvisionedCheckDetailDto {
  healthQueryId: number;
  databaseCredentialId: number;
  checkId: number | null;
  widgetId: number | null;
  created: boolean;
  error: string | null;
}

export interface AvailableHealthQueryDto {
  id: number;
  name: string;
  displayName: string;
  description: string | null;
  databaseType: CredentialType;
  category: DatabaseHealthQueryCategory;
  resultType: ResultType;
  unit: string | null;
  isAlreadyProvisioned: boolean;
}

export interface ProvisionedCheckDto {
  healthQueryId: number;
  databaseCredentialId: number;
  checkId: number | null;
  widgetId: number | null;
  created: boolean;
}
```

### Types That Eventually Need Backend DTO Mapping

**AvailableHealthQueryDto:**
- Similar to existing DatabaseHealthQueryDto
- Adds isAlreadyProvisioned field
- Can extend or map from DatabaseHealthQueryDto

**ProvisionedCheckDto:**
- New structure, not existing
- Maps provisioned checks to health queries and credentials
- Requires cross-reference with existing types

### No Backend DTO Changes Needed

**Existing DTOs:**
- DatabaseCredentialDto - Already has credentialType, isActive
- DatabaseHealthQueryDto - Already has all needed fields
- CheckDefinitionDto - Already has sqlConfiguration with healthQueryId
- DashboardSectionDto - Already supports dynamic sections
- WidgetDto - Already supports NumberCard type

---

## 13. Error Handling

### Existing Error Handling Pattern

**File:** `src/api/apiUtils.ts`

**Pattern:**
- Axios errors wrapped in ApiError class
- ApiError has message, statusCode, errors array
- `getErrorMessage(error)` extracts message
- Components display error via Alert or submitError prop

**Examples:**
- CredentialFormDialog displays submitError
- DatabaseCredentialsPage displays error Alert
- DashboardError component displays error with retry

### Frontend Error Handling for New Endpoints

**Application not found (404):**
- Backend returns: `{ success: false, message: "Application not found." }`
- Frontend: Show error alert, redirect to applications list
- Pattern: Same as existing ApplicationDetailsPage

**Credential not found (400):**
- Backend returns: `{ success: false, message: "Credential not found." }`
- Frontend: Show error in dialog, refresh credential list
- Pattern: Same as existing credential deletion errors

**Inactive credential (400):**
- Backend returns: `{ success: false, message: "Credential is inactive." }`
- Frontend: Show error, filter out inactive credentials from selection
- Pattern: Pre-validate credential selection before API call

**Incompatible credential/query (400 partial success):**
- Backend returns: `{ success: true, data: { items: [{ error: "..." }] } }`
- Frontend: Show detailed errors in results dialog, show skip count
- Pattern: Display errors from items array

**Duplicate request (idempotent):**
- Backend returns: `{ success: true, data: { existingChecks: N, createdChecks: 0 } }`
- Frontend: Show as success, indicate no new checks created
- Pattern: Display existing count in results

**Validation failure (400):**
- Backend returns: `{ success: false, message: "...", errors: [...] }`
- Frontend: Show validation errors, correct form
- Pattern: Same as existing form validation errors

**Transaction failure (500):**
- Backend returns: `{ success: false, message: "..." }`
- Frontend: Show error alert, offer retry
- Pattern: Same as existing API errors

**Unauthorized (401):**
- HTTP interceptor handles automatically
- Frontend: Redirects to login
- Pattern: Existing behavior

**Forbidden (403):**
- Backend returns: `{ success: false, message: "Admin role required." }`
- Frontend: Show error, disable button for non-Admin
- Pattern: Use role guard to prevent call

**Network error:**
- Axios interceptors handle
- Frontend: Show "ارتباط با سرویس برقرار نشد"
- Pattern: Existing behavior

### Reuse Existing Patterns

**No New Error Handling Mechanism Needed:**
- Use existing ApiError class
- Use existing getErrorMessage function
- Use existing Alert components
- Use existing submitError prop pattern
- Use existing retry button pattern

**Implementation:**
```typescript
try {
  await provisionMutation.mutateAsync({ databaseCredentialIds });
  // Show success
} catch (error) {
  // Error is already in mutation.error
  // Display via Alert or submitError
}
```

---

## 14. Edge Cases

### Case 1: Application has no Database Credentials

**Backend Behavior:**
- GET /available-queries returns empty array (no credentials to query)
- POST /provision validates credentialIds array (must not be empty)
- Returns 400 error if empty

**Frontend Behavior:**
- Load credentials via useDatabaseCredentials()
- If empty, show empty state: "No database credentials configured"
- Disable "Enable Database Health Monitoring" button
- Show link to add credentials: "Add database credentials first"
- Or: Add credentials directly in the same dialog (more complex)

**Recommended:**
- Show empty state with link to credentials page
- Prevent provision call
- User must add credentials first

### Case 2: Application has credentials but none are compatible

**Backend Behavior:**
- Credentials exist but database types don't match any health queries
- GET /available-queries returns empty array for each credential
- POST /provision may succeed with skipped=all

**Frontend Behavior:**
- Load credentials and available queries
- If all available-queries responses are empty, show message
- "No compatible health queries for your database types"
- Disable provision button
- Show which database types are supported

**Recommended:**
- Display message: "No health queries available for your database types"
- List supported database types (SqlServer, PostgreSql, MySql, Oracle)
- Allow user to proceed (backend will skip all)

### Case 3: All compatible HealthQueries are already provisioned

**Backend Behavior:**
- GET /provisioned-checks returns all queries
- GET /available-queries returns all with isAlreadyProvisioned=true
- POST /provision returns createdChecks=0, existingChecks=N

**Frontend Behavior:**
- Show provisioned-checks table
- All items show "Already provisioned"
- "Enable Database Health Monitoring" button shows as "Already Enabled"
- Button disabled or shows message: "All health queries already provisioned"
- POST /provision still allowed (idempotent)

**Recommended:**
- Show status: "Database Health Monitoring is enabled"
- Show provisioned-checks table
- "Enable" button disabled or shows as "Refresh"
- Allow re-provision (idempotent)

### Case 4: Some HealthQueries are provisioned and some are available

**Backend Behavior:**
- GET /provisioned-checks returns subset
- GET /available-queries returns mix of isAlreadyProvisioned true/false
- POST /provision creates only new ones

**Frontend Behavior:**
- Show provisioned-checks table
- Show "Add Health Query" button
- Available queries filtered to show only non-provisioned
- User can add remaining queries

**Recommended:**
- Show status: "Partially provisioned"
- Show provisioned-checks table
- "Add Health Query" button enabled
- Filter available queries to exclude provisioned

### Case 5: Multiple credentials have different database types

**Backend Behavior:**
- Each credential has different databaseType
- GET /available-queries returns different queries per credential
- POST /provision provisions compatible queries per credential

**Frontend Behavior:**
- User selects multiple credentials
- Frontend calls available-queries for each credential
- Merge results, group by health query
- Show which credentials each query is available for
- Example: "Connection Pool (SqlServer, PostgreSql)"

**Recommended:**
- Display queries with credential type badges
- Show which credentials each query applies to
- Allow user to see what will be provisioned per credential
- Summarize: "Will provision X queries for Y credentials"

### Case 6: HealthQuery becomes inactive after provisioning

**Backend Behavior:**
- Health query deactivated in catalog
- Provisioned check still exists
- Check may continue running with stored query text
- Or check may be deactivated (backend behavior unclear)

**Frontend Behavior:**
- GET /provisioned-checks still returns the check
- GET /available-queries does not return inactive query
- User sees check in provisioned list
- Check may show "Inactive" status

**[BACKEND GAP]:**
- Backend does not indicate if provisioned check's health query is inactive
- Frontend cannot detect if health query was deactivated
- May need to cross-reference with catalog

**Recommended:**
- Cross-reference provisioned-checks with health query catalog
- If health query is inactive, show warning in table
- Mark as [BACKEND GAP] if backend doesn't handle

### Case 7: Check exists but Widget does not

**Backend Behavior:**
- Check was provisioned but widget creation failed
- GET /provisioned-checks returns checkId not null, widgetId null
- POST /provision may recreate widget on retry

**Frontend Behavior:**
- Show provisioned-checks table
- Row shows check exists, widget missing
- Show warning icon or status "Widget missing"
- Allow user to retry provision

**Recommended:**
- Display "Widget missing" status in table
- Show warning icon
- Offer "Retry Provision" button
- Call POST /provision again (idempotent)

### Case 8: User deletes a provisioned widget

**Backend Behavior:**
- Widget deleted via dashboard designer
- Check still exists
- GET /provisioned-checks returns checkId, widgetId null (or old widgetId)
- Backend may not track widget deletion

**Frontend Behavior:**
- Check still in provisioned-checks list
- Widget no longer in dashboard
- User sees inconsistency

**[BACKEND GAP]:**
- Backend does not track widget deletion
- provisioned-checks API may still show old widgetId
- Frontend cannot detect widget deletion

**Recommended:**
- Cross-reference provisioned-checks with dashboard widgets
- If widget missing from dashboard, show warning
- Mark as [BACKEND GAP]

### Case 9: Provision request partially fails

**Backend Behavior:**
- Some checks created, some failed
- Returns items array with mixed success/error
- createdChecks < total attempts
- Some items have error message

**Frontend Behavior:**
- Show success message with counts
- Show detailed results dialog
- List all items with success/error status
- Show error messages for failed items
- Allow user to retry failed items

**Recommended:**
- Display: "Created X checks, Y failed"
- Show detailed results table
- Highlight failed items in red
- Show error messages
- Offer "Retry Failed" button (call provision again with same credentials)

### Case 10: User clicks Provision twice

**Backend Behavior:**
- Idempotent operation
- Second call returns existingChecks=N, createdChecks=0
- No duplicates created

**Frontend Behavior:**
- Show loading on first click
- Disable button during API call
- Second click disabled, no effect
- On success, show "Already provisioned" message
- Or show success with existing count

**Recommended:**
- Disable button during mutation
- Show loading spinner
- On success, display result with existing count
- Message: "No new checks created (already provisioned)"

---

## 15. Backend Gaps / Frontend Blockers

### Gap 1: Available-Queries is Credential-Specific

**Issue:**
- GET /available-queries requires databaseCredentialId parameter
- Cannot fetch all available queries for multiple credentials in one call
- For multi-credential selection, must call endpoint per credential

**Impact:**
- Multiple API calls needed for multi-credential UI
- More complex frontend logic to merge results
- Slower UX for applications with many credentials

**Workaround:**
- Call available-queries for each selected credential
- Merge results and deduplicate by health query ID
- Display which credentials each query is available for

**[BACKEND GAP]:**
- Backend should accept multiple databaseCredentialIds
- Or provide endpoint that returns all available queries for application

### Gap 2: Provisioned-Checks Missing Cross-Reference Data

**Issue:**
- GET /provisioned-checks returns only IDs (healthQueryId, databaseCredentialId, checkId, widgetId)
- Does not return names (health query name, credential name)
- Frontend must cross-reference with catalog and credential list

**Impact:**
- Additional API calls needed to display names
- More complex frontend logic
- Slower UX

**Workaround:**
- Fetch health query catalog and credential list
- Cross-reference IDs to get names
- Cache results

**[BACKEND GAP]:**
- Backend should include health query name and credential name in response

### Gap 3: Widget Deletion Not Tracked

**Issue:**
- If user deletes a provisioned widget via dashboard designer
- GET /provisioned-checks still shows widgetId
- Backend does not track widget deletion

**Impact:**
- Frontend cannot detect if widget was deleted
- Provisioned-checks table shows inconsistent state
- User cannot see which widgets are missing

**Workaround:**
- Cross-reference provisioned-checks with dashboard widgets
- If widget missing from dashboard, show warning

**[BACKEND GAP]:**
- Backend should track widget deletion or provide widget status

### Gap 4: Health Query Deactivation Not Tracked

**Issue:**
- If health query is deactivated in catalog
- Provisioned check still exists and may run
- GET /provisioned-checks does not indicate health query status

**Impact:**
- Frontend cannot detect if health query was deactivated
- Check may continue running with inactive query
- Inconsistent state

**Workaround:**
- Cross-reference provisioned-checks with health query catalog
- If health query inactive, show warning

**[BACKEND GAP]:**
- Backend should indicate if provisioned check's health query is inactive

### Gap 5: Credential Deletion Not Tracked

**Issue:**
- If credential is deleted
- Provisioned check still exists
- GET /provisioned-checks does not indicate credential status

**Impact:**
- Frontend cannot detect if credential was deleted
- Check may fail with credential not found error
- Inconsistent state

**Workaround:**
- Cross-reference provisioned-checks with credential list
- If credential missing, show error

**[BACKEND GAP]:**
- Backend should handle orphaned checks or indicate credential status

### Gap 6: MetricId for Provisioned Widgets

**Issue:**
- NumberMetricWidget expects both checkId and metricId
- Backend may not create metric definitions for provisioned checks
- Unclear if widget data sources will have metricId

**Impact:**
- NumberCard widgets may not render correctly
- Metrics may not display
- Frontend gap in widget rendering

**[UNCERTAIN]:**
- Needs verification: Does backend create metric definitions?
- Needs verification: Does NumberMetricWidget work with checkId only?

**[BACKEND GAP]:**
- Backend must create metric definitions for provisioned checks
- OR: Frontend must update NumberMetricWidget to support check-only data sources

### Gap 7: Application-Credential Association

**Issue:**
- GET /available-queries requires applicationId and databaseCredentialId
- No endpoint to get credentials for a specific application
- Must use global credential list and filter

**Impact:**
- Frontend must load all credentials and filter
- May show credentials not associated with application
- Security concern if credentials are global

**Workaround:**
- Load all credentials (existing pattern)
- User selects from all credentials
- Backend validates association

**[BACKEND GAP]:**
- Backend should provide endpoint to get application-specific credentials

---

## 16. Proposed Frontend Changes

### Phase 1 - API/Types/Hooks

**[NEW] API File:**
- File: `src/api/databaseHealthMonitoringApi.ts`
- Functions:
  - `provisionDatabaseHealthMonitoring(applicationId, payload)`
  - `addDatabaseHealthMonitoring(applicationId, payload)`
  - `getAvailableHealthQueries(applicationId, credentialId)`
  - `getProvisionedChecks(applicationId)`

**[NEW] Types File:**
- File: `src/types/databaseHealthMonitoring.ts`
- Types:
  - `ProvisionDatabaseHealthMonitoringRequestDto`
  - `AddDatabaseHealthMonitoringRequestDto`
  - `ProvisioningResultDto`
  - `ProvisionedCheckDetailDto`
  - `AvailableHealthQueryDto`
  - `ProvisionedCheckDto`

**[NEW] Hooks Directory:**
- Directory: `src/features/database-health-monitoring/hooks/`
- Files:
  - `queryKeys.ts`
  - `useDatabaseHealthMonitoring.ts`
  - `index.ts`

**[NEW] Query Keys:**
- File: `src/features/database-health-monitoring/hooks/queryKeys.ts`
- Keys:
  - `databaseHealthMonitoringQueryKeys.all`
  - `databaseHealthMonitoringQueryKeys.provisionedChecks(applicationId)`
  - `databaseHealthMonitoringQueryKeys.availableQueries(applicationId, credentialId)`

**[NEW] Hooks:**
- File: `src/features/database-health-monitoring/hooks/useDatabaseHealthMonitoring.ts`
- Hooks:
  - `useProvisionedChecks(applicationId)`
  - `useAvailableHealthQueries(applicationId, credentialId)`
  - `useProvisionDatabaseHealthMonitoring(applicationId)`
  - `useAddDatabaseHealthMonitoring(applicationId)`

**[REUSE] Existing:**
- `useDatabaseCredentials()` - for credential selection
- `useDatabaseHealthQueries()` - for catalog cross-reference
- `useApplicationDashboard()` - for dashboard refresh
- Existing error handling patterns

### Phase 2 - Provisioning UX

**[EXTEND] Application Details Page:**
- File: `src/features/monitoring-management/pages/ApplicationDetailsPage.tsx`
- Changes:
  - Add "Database Health Monitoring" tab or section
  - Add credential selection UI
  - Add "Enable Database Health Monitoring" button
  - Add provision confirmation dialog
  - Add results display

**[NEW] Provision Dialog Component:**
- File: `src/features/database-health-monitoring/components/ProvisionDialog.tsx`
- Features:
  - Multi-select credentials
  - Show summary of what will be provisioned
  - Confirm button
  - Loading state
  - Error display

**[NEW] Results Dialog Component:**
- File: `src/features/database-health-monitoring/components/ProvisionResultsDialog.tsx`
- Features:
  - Display created/existing/skipped counts
  - Display detailed items table
  - Show errors for failed items
  - Link to dashboard button

**[REUSE] Existing:**
- Dialog pattern from CredentialFormDialog
- Confirmation pattern from ConfirmDeleteDialog
- Alert pattern for errors
- Loading pattern

### Phase 3 - Add Health Monitoring UX

**[NEW] Add Dialog Component:**
- File: `src/features/database-health-monitoring/components/AddHealthQueryDialog.tsx`
- Features:
  - Multi-select health queries
  - Multi-select credentials
  - Filter by compatibility
  - Show isAlreadyProvisioned status
  - Confirm button
  - Loading state
  - Error display

**[EXTEND] Application Details Page:**
- Changes:
  - Add "Add Health Query" button
  - Open AddHealthQueryDialog
  - Display results

**[REUSE] Existing:**
- Dialog pattern
- Multi-select pattern (need to implement)
- Table pattern for query selection

### Phase 4 - Dashboard Integration

**[NO CHANGE] Dashboard Rendering:**
- DashboardLayoutRenderer already handles dynamic sections
- DashboardSectionRenderer already handles section display
- WidgetRenderer already handles widget type resolution
- NumberCard already registered in registry

**[POTENTIAL CHANGE] NumberCard Widget:**
- File: `src/components/widgets/NumberMetricWidget.tsx`
- Change: Support check-only data source (if metricId not provided)
- Condition: Only if backend doesn't create metric definitions
- Mark as [BACKEND GAP] if needed

**[NO CHANGE] Dashboard Refresh:**
- Existing refresh pattern works
- Invalidate dashboard query after provision
- Auto-refresh interval already configured

### Phase 5 - Tests

**[NEW] API Tests:**
- File: `src/api/databaseHealthMonitoringApi.test.ts`
- Tests:
  - provisionDatabaseHealthMonitoring
  - addDatabaseHealthMonitoring
  - getAvailableHealthQueries
  - getProvisionedChecks

**[NEW] Hook Tests:**
- File: `src/features/database-health-monitoring/hooks/useDatabaseHealthMonitoring.test.ts`
- Tests:
  - useProvisionedChecks
  - useAvailableHealthQueries
  - useProvisionDatabaseHealthMonitoring
  - useAddDatabaseHealthMonitoring
  - Cache invalidation

**[NEW] Component Tests:**
- File: `src/features/database-health-monitoring/components/ProvisionDialog.test.tsx`
- File: `src/features/database-health-monitoring/components/AddHealthQueryDialog.test.tsx`
- File: `src/features/database-health-monitoring/components/ProvisionResultsDialog.test.tsx`

**[EXTEND] Page Tests:**
- File: `src/features/monitoring-management/pages/ApplicationDetailsPage.test.tsx`
- Tests:
  - Database Health Monitoring section rendering
  - Provision button interaction
  - Dialog interactions

### Summary of Changes

**New Files:**
- `src/api/databaseHealthMonitoringApi.ts`
- `src/types/databaseHealthMonitoring.ts`
- `src/features/database-health-monitoring/hooks/queryKeys.ts`
- `src/features/database-health-monitoring/hooks/useDatabaseHealthMonitoring.ts`
- `src/features/database-health-monitoring/hooks/index.ts`
- `src/features/database-health-monitoring/components/ProvisionDialog.tsx`
- `src/features/database-health-monitoring/components/AddHealthQueryDialog.tsx`
- `src/features/database-health-monitoring/components/ProvisionResultsDialog.tsx`
- Test files for all above

**Extended Files:**
- `src/features/monitoring-management/pages/ApplicationDetailsPage.tsx`
- `src/features/monitoring-management/pages/ApplicationDetailsPage.test.tsx`

**Potentially Changed Files:**
- `src/components/widgets/NumberMetricWidget.tsx` (if metricId gap exists)

**No Changes:**
- Dashboard architecture
- Widget architecture
- Check architecture
- Permission system
- Routing
- API client
- State management

---

## 17. Implementation Phases

### Phase 1 - API/Types/Hooks (Foundation)

**Goal:** Establish API layer and React Query hooks

**Tasks:**
1. Create `src/types/databaseHealthMonitoring.ts` with all DTOs
2. Create `src/api/databaseHealthMonitoringApi.ts` with API functions
3. Create `src/features/database-health-monitoring/hooks/queryKeys.ts`
4. Create `src/features/database-health-monitoring/hooks/useDatabaseHealthMonitoring.ts`
5. Create `src/features/database-health-monitoring/hooks/index.ts`
6. Write tests for API functions
7. Write tests for hooks

**Dependencies:** None
**Risk:** Low
**Estimated Time:** 4-6 hours

### Phase 2 - Provisioning UX (Initial Enable)

**Goal:** Allow users to enable database health monitoring for an application

**Tasks:**
1. Create `ProvisionDialog.tsx` component
2. Create `ProvisionResultsDialog.tsx` component
3. Extend `ApplicationDetailsPage.tsx` with Database Health Monitoring section
4. Add credential selection UI
5. Add "Enable" button
6. Implement provision flow
7. Add results display
8. Implement error handling
9. Add permission guards (Admin only)
10. Write component tests
11. Update page tests

**Dependencies:** Phase 1
**Risk:** Medium
**Estimated Time:** 8-12 hours

### Phase 3 - Add Health Monitoring UX (Incremental Add)

**Goal:** Allow users to add specific health queries later

**Tasks:**
1. Create `AddHealthQueryDialog.tsx` component
2. Implement health query selection UI
3. Implement credential selection UI
4. Implement compatibility filtering
5. Implement multi-credential handling (call available-queries per credential)
6. Merge and display available queries
7. Implement add flow
8. Add results display
9. Implement error handling
10. Add permission guards (Admin only)
11. Write component tests
12. Update page tests

**Dependencies:** Phase 1, Phase 2
**Risk:** Medium-High (multi-credential complexity)
**Estimated Time:** 10-14 hours

### Phase 4 - Dashboard Integration (Verification)

**Goal:** Ensure dashboard automatically renders provisioned widgets

**Tasks:**
1. Test dashboard rendering with provisioned widgets
2. Verify NumberCard widget works with check-based data source
3. Verify metricId handling (if backend creates metrics)
4. Update NumberMetricWidget if needed (check-only support)
5. Test dashboard refresh after provision
6. Test widget click to check detail
7. Test widget deletion and re-provision
8. Write integration tests

**Dependencies:** Phase 1, Phase 2
**Risk:** Low-Medium (depends on backend behavior)
**Estimated Time:** 4-6 hours

### Phase 5 - Tests & Polish (Quality)

**Goal:** Ensure comprehensive test coverage and polish UX

**Tasks:**
1. Complete all remaining tests
2. Add E2E tests (if applicable)
3. Polish UI/UX based on testing
4. Add loading states for all async operations
5. Add empty states for all edge cases
6. Add error messages for all error cases
7. Add success messages
8. Review and optimize performance
9. Update documentation
10. Code review and refactoring

**Dependencies:** Phase 1-4
**Risk:** Low
**Estimated Time:** 6-8 hours

### Total Estimated Time

**Optimistic:** 22-30 hours
**Realistic:** 32-46 hours
**Conservative:** 40-60 hours

**Critical Path:** Phase 1 → Phase 2 → Phase 4 (Phase 3 can be done in parallel with Phase 4)

---

## 18. Risks

### High Risk

**Risk 1: NumberCard Data Source Gap**
- **Description:** NumberMetricWidget may not work with check-only data source
- **Impact:** Widgets may not render or display data
- **Mitigation:** Verify backend creates metric definitions, or update widget
- **Contingency:** Update NumberMetricWidget to support check-only data sources

**Risk 2: Multi-Credential UX Complexity**
- **Description:** available-queries endpoint is credential-specific, requires multiple calls
- **Impact:** Complex frontend logic, slower UX
- **Mitigation:** Implement efficient merging and caching
- **Contingency:** Simplify to single-credential selection (UX degradation)

### Medium Risk

**Risk 3: Backend Behavior Uncertainty**
- **Description:** Some backend behaviors are uncertain (metric creation, widget tracking)
- **Impact:** May require frontend changes after backend clarification
- **Mitigation:** Verify backend behavior with backend team before implementation
- **Contingency:** Be prepared to adjust frontend based on actual backend behavior

**Risk 4: Permission Implementation**
- **Description:** Role checks not fully implemented in existing codebase
- **Impact:** May need to implement role checks for this feature from scratch
- **Mitigation:** Follow existing pattern even if not fully implemented
- **Contingency:** Implement basic Admin-only guard, refine later

**Risk 5: Cross-Reference Data Gaps**
- **Description:** Provisioned-checks API doesn't include names, requires cross-reference
- **Impact:** Additional API calls, slower UX
- **Mitigation:** Cache catalog and credential list
- **Contingency:** Accept slower UX or request backend change

### Low Risk

**Risk 6: Test Coverage**
- **Description:** Complex multi-credential logic may be hard to test
- **Impact:** Lower confidence in implementation
- **Mitigation:** Write comprehensive unit and integration tests
- **Contingency:** Manual testing if automated tests insufficient

**Risk 7: Performance**
- **Description:** Multiple API calls for available-queries may be slow
- **Impact:** Slower UX for applications with many credentials
- **Mitigation:** Implement parallel calls, caching, optimistic UI
- **Contingency:** Show loading spinner, acceptable delay

**Risk 8: Edge Cases**
- **Description:** Many edge cases (no credentials, incompatible types, etc.)
- **Impact:** May miss some edge cases in initial implementation
- **Mitigation:** Comprehensive edge case analysis, iterative testing
- **Contingency:** Handle edge cases as they are discovered

---

## 19. Open Questions

### Backend API Questions

1. **Metric Creation:** Does the backend create metric definitions for provisioned checks?
   - If yes: NumberCard will work with existing implementation
   - If no: Frontend must update NumberMetricWidget to support check-only data source

2. **Widget Data Source:** What does the widget data source look like for provisioned widgets?
   - Does it include metricId?
   - Does it include only checkId?
   - What is the exact structure?

3. **Credential Association:** Is there an endpoint to get credentials specific to an application?
   - Or must we use the global credential list?
   - Are credentials global or application-scoped?

4. **Widget Deletion Tracking:** Does the backend track widget deletion?
   - Can we detect if a provisioned widget was deleted?
   - How is this reflected in the provisioned-checks API?

5. **Health Query Deactivation:** What happens to provisioned checks when health query is deactivated?
   - Does the check continue running?
   - Is the check deactivated?
   - Does the API indicate this status?

6. **Credential Deletion:** What happens to provisioned checks when credential is deleted?
   - Does the check fail?
   - Is the check deleted?
   - Does the API indicate this status?

### Frontend UX Questions

1. **Multi-Select Implementation:** Should we use MUI Select with checkboxes or implement a custom CheckboxList?
   - MUI Select is simpler but may have UX limitations
   - Custom CheckboxList is more flexible but more work

2. **Inactive Credentials:** Should inactive credentials be shown as disabled or hidden?
   - Hidden: Cleaner UI, but user may wonder why credentials are missing
   - Disabled: Clearer, but adds visual clutter

3. **Provisioned Checks Display:** Should provisioned checks be a separate tab or a section below?
   - Tab: Cleaner, but requires navigation
   - Section: Simpler, but may clutter the page

4. **Confirmation Dialog:** Should we show a detailed summary before provisioning?
   - Detailed: Better UX, but more complex
   - Simple: Faster, but user may not know what will happen

5. **Results Display:** Should results be shown in a dialog or inline?
   - Dialog: Cleaner, but requires interaction
   - Inline: Immediate, but may clutter

### Integration Questions

1. **Dashboard Refresh:** Should we automatically navigate to dashboard after provisioning?
   - Yes: Immediate feedback, but may be jarring
   - No: User stays on page, but may not see widgets

2. **Check Link:** Should provisioned checks link to the existing CheckDetailPage?
   - Yes: Consistent with existing UX
   - No: Custom view for provisioned checks

3. **Widget Management:** Should users be able to manage provisioned widgets via dashboard designer?
   - Yes: Consistent with existing UX
   - No: Lock provisioned widgets (simpler but restrictive)

---

## 20. Final Recommendation

### Summary

The Database Health Monitoring Provisioning feature can be implemented in the existing frontend architecture with minimal changes. The frontend already has:

- Established patterns for CRUD operations, forms, and dialogs
- Dynamic dashboard and widget rendering
- Role-based permission system
- React Query for data fetching and caching
- All necessary types and enums

### Recommended Approach

**Location:** Add Database Health Monitoring section to Application Details Page (`/monitoring/applications/:id`)

**Implementation:**
1. Create new API file and hooks following existing patterns
2. Add provisioning dialog with credential selection
3. Add health query addition dialog with multi-credential support
4. Display provisioned checks in a table
5. Leverage existing dashboard rendering (no changes needed)
6. Implement Admin-only permission guards

**Key Decisions:**
- No new route (reuse Application Details Page)
- No new state management (reuse React Query)
- No new dashboard changes (dynamic rendering works)
- No new permission system (reuse existing role checks)
- Multi-credential support via multiple API calls (backend limitation)

### Architecture Alignment

**Follows Existing Patterns:**
- ✅ API service pattern
- ✅ React Query hook pattern
- ✅ Query key pattern
- ✅ Dialog form pattern
- ✅ Page container pattern
- ✅ Error handling pattern
- ✅ Permission guard pattern

**No Architectural Changes:**
- ✅ No new state management solution
- ✅ No new API client
- ✅ No new dashboard architecture
- ✅ No new widget architecture
- ✅ No new permission system
- ✅ No new design system

### Risks and Mitigations

**High Risk:**
- NumberCard data source gap → Verify backend behavior, update widget if needed
- Multi-credential complexity → Implement efficient merging and caching

**Medium Risk:**
- Backend behavior uncertainty → Verify with backend team before implementation
- Permission implementation → Follow existing pattern even if incomplete

**Low Risk:**
- Test coverage → Write comprehensive tests
- Performance → Implement caching and parallel calls

### Backend Gaps

**Documented Gaps:**
1. available-queries endpoint is credential-specific (requires multiple calls)
2. provisioned-checks API missing cross-reference data (names)
3. Widget deletion not tracked
4. Health query deactivation not tracked
5. Credential deletion not tracked
6. MetricId for provisioned widgets (uncertain)
7. Application-credential association (global credentials)

**All gaps marked as [BACKEND GAP] - do not fix in frontend implementation phase.**

### Implementation Phases

**Phase 1:** API/Types/Hooks (4-6 hours)
**Phase 2:** Provisioning UX (8-12 hours)
**Phase 3:** Add Health Monitoring UX (10-14 hours)
**Phase 4:** Dashboard Integration (4-6 hours)
**Phase 5:** Tests & Polish (6-8 hours)

**Total:** 32-46 hours (realistic estimate)

### Success Criteria

✅ Admin can enable database health monitoring for an application
✅ Admin can select one or more credentials
✅ Backend provisions all compatible health queries
✅ Dashboard automatically shows "Database Health" section
✅ NumberCard widgets display health query results
✅ Admin can add specific health queries later
✅ Users can view provisioned checks status
✅ Permission guards prevent non-Admin from provisioning
✅ All edge cases handled gracefully
✅ Comprehensive test coverage

### Conclusion

The Database Health Monitoring Provisioning feature is a natural fit for the existing frontend architecture. By reusing established patterns and leveraging the dynamic dashboard rendering, the implementation can be completed with minimal architectural changes. The main challenges are the backend API limitations (credential-specific available-queries) and potential gaps in widget data source handling, both of which can be mitigated with careful implementation and verification.

---

## Traceability Table

| Area | Existing Structure | Reuse | New Work | Risk |
|------|-------------------|-------|----------|------|
| Application | ApplicationDetailsPage.tsx, useMonitoringApplications | [EXTEND] Add section/tab | [NEW] Database Health Monitoring section | Low |
| Credentials | useDatabaseCredentials, CredentialTable, CredentialFormDialog | [REUSE] Credential selection, type filtering | [NEW] Multi-select UI | Low |
| Health Queries | useDatabaseHealthQueries, HealthQueryTable, HealthQueryFormDialog | [REUSE] Catalog cross-reference, filtering | [NEW] Available queries display | Low |
| Provisioning | No existing | [NO CHANGE] N/A | [NEW] ProvisionDialog, AddHealthQueryDialog, ProvisionResultsDialog | Medium |
| Dashboard | ApplicationDashboardPage, DashboardLayoutRenderer, WidgetRenderer | [REUSE] Dynamic rendering | [NO CHANGE] Automatic rendering | Low-Medium |
| Widgets | NumberMetricWidget, WidgetRegistry | [REUSE] NumberCard rendering | [POTENTIAL] Check-only data source support | Medium |
| React Query | queryClient, useQuery, useMutation patterns | [REUSE] All patterns | [NEW] databaseHealthMonitoring hooks | Low |
| Permissions | roleAccess.ts, useUserRoleSimple, ProtectedRoute | [REUSE] Role checks | [NO CHANGE] Existing guards | Low |
| Routing | AppRoutes.tsx, paths.ts | [REUSE] Existing routes | [NO CHANGE] No new route | Low |
| Tests | Vitest, existing test patterns | [REUSE] Test patterns | [NEW] API, hook, component tests | Low |

---

**End of Analysis Document**
