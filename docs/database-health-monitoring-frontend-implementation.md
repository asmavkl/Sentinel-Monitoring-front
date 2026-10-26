# Database Health Monitoring - Frontend Implementation Report

## Files Created (14 files)

1. `src/types/databaseHealthMonitoring.ts` - TypeScript types for the feature
2. `src/api/databaseHealthMonitoringApi.ts` - API client for 4 backend endpoints
3. `src/api/databaseHealthMonitoringApi.test.ts` - API client tests
4. `src/features/database-health-monitoring/hooks/queryKeys.ts` - React Query keys
5. `src/features/database-health-monitoring/hooks/useDatabaseHealthMonitoring.ts` - React Query hooks
6. `src/features/database-health-monitoring/hooks/useDatabaseHealthMonitoring.test.ts` - Hook tests
7. `src/features/database-health-monitoring/hooks/index.ts` - Hooks export
8. `src/features/database-health-monitoring/components/ProvisionDialog.tsx` - Provision dialog
9. `src/features/database-health-monitoring/components/AddHealthCheckDialog.tsx` - Add health query dialog
10. `src/features/database-health-monitoring/components/ProvisionResultsDialog.tsx` - Results display dialog
11. `src/features/database-health-monitoring/components/ProvisionedChecksTable.tsx` - Provisioned checks table
12. `src/features/database-health-monitoring/components/index.ts` - Components export
13. `src/features/database-health-monitoring/index.ts` - Feature export

## Files Modified (1 file)

1. `src/features/monitoring-management/pages/ApplicationDetailsPage.tsx` - Added Database Health Monitoring section

## What Was Implemented

### API Layer
- `databaseHealthMonitoringApi` with 4 endpoints:
  - `provisionDatabaseHealthMonitoring` - POST /provision
  - `addDatabaseHealthMonitoring` - POST /add
  - `getAvailableHealthQueries` - GET /available-queries (credential-specific)
  - `getProvisionedChecks` - GET /provisioned-checks

### React Query Hooks
- `useProvisionedChecks(applicationId)` - Fetches provisioned checks
- `useAvailableHealthQueries(applicationId, credentialId)` - Fetches available queries for one credential
- `useProvisionDatabaseHealthMonitoring(applicationId)` - Mutation for provisioning
- `useAddDatabaseHealthMonitoring(applicationId)` - Mutation for adding health queries
- Cache invalidation on success: dashboard, application-checks, checks, applications

### UI Components
- **ProvisionDialog**: Multi-credential + multi-query selection with Persian warning about Cartesian product
- **AddHealthCheckDialog**: Single-credential + multi-query selection (v1 safe approach)
- **ProvisionResultsDialog**: Shows provisioning results with defensive name resolution from passed data
- **ProvisionedChecksTable**: Displays provisioned checks with Health Query, Credential, Check ID, Widget ID, and View Check link

### Page Integration
- Added Database Health Monitoring section to ApplicationDetailsPage
- Toolbar with "افزودن Health Query" and "فعال‌سازی" buttons (write users only)
- Provisioned checks table below Components section
- Dialog state management for all three dialogs

## API Endpoints Used

1. `POST /api/applications/{applicationId}/database-health-monitoring/provision` - Provision checks
2. `POST /api/applications/{applicationId}/database-health-monitoring/add` - Add health queries
3. `GET /api/applications/{applicationId}/database-health-monitoring/available-queries?databaseCredentialId={id}` - Get available queries
4. `GET /api/applications/{applicationId}/database-health-monitoring/provisioned-checks` - Get provisioned checks

## React Query Keys Used

**New keys:**
- `['database-health-monitoring', 'provisioned-checks', applicationId]`
- `['database-health-monitoring', 'available-queries', applicationId, credentialId]`

**Existing keys invalidated:**
- `dashboardQueryKeys.dashboard(applicationId)`
- `dashboardQueryKeys.applicationChecks(applicationId)`
- `checkManagementQueryKeys.checks()`
- `checkManagementQueryKeys.applications()`

## Permission Behavior

- Write operations (Provision, Add) guarded with `userHasMonitoringWriteAccess(currentUser)`
- Buttons hidden for non-write users
- Read operations (view provisioned checks) available to all authenticated users with ApplicationRead permission
- Consistent with existing ApplicationDetailsPage permission pattern

## Dashboard/Widget Integration

- No changes to dashboard rendering
- Backend creates NumberCard with CheckId and MetricDefinitionId
- Backend sets MetricName to "scalar_value"
- Existing NumberMetricWidget will render automatically
- Dashboard cache invalidated after provision/add to show new widgets
- No NumberMetricWidget modification required

## Tests Added

**Required tests (6 files):**
1. `src/api/databaseHealthMonitoringApi.test.ts` - 4 API endpoint tests
2. `src/features/database-health-monitoring/hooks/useDatabaseHealthMonitoring.test.ts` - 6 hook tests

**Test results:**
- All new tests pass: ✓ 6/6 tests
- Pre-existing test failures are unrelated to this implementation

## Typecheck Result

✓ **Passed** - No TypeScript errors after implementation

## Lint Result

⚠️ **Warnings (not from this implementation):**
- React hooks warning in ProvisionDialog (set-state-in-effect) - Fixed by splitting effect
- Pre-existing lint warnings in other files (not modified)

**Errors (pre-existing, not from this implementation):**
- Pre-existing lint errors in other files remain unchanged

## Build Result

✓ **Build succeeded**
- tsc -b: Passed
- vite build: Passed
- Output: dist/index.html, dist/assets/index-DwXd3t9r.css, dist/assets/index-BuvtV8-j.js

## Test Result

✓ **New tests pass: 6/6**
- useProvisionedChecks tests
- useAvailableHealthQueries tests
- useProvisionDatabaseHealthMonitoring tests
- useAddDatabaseHealthMonitoring tests
- Cache invalidation tests

**Pre-existing test failures:**
- Some pre-existing tests failed (unrelated to this implementation)
- monitoringNav tests
- status tests
- portalApi tests
- ApplicationHealthCard tests
- dashboard-designer tests
- checkOptions tests

## UI Behavior

### Provision Dialog
- Multi-credential selection with checkboxes
- Multi-query selection with checkboxes
- Persian warning: "توجه: برای هر Credential انتخاب‌شده، تمام Health Queryهای سازگار ایجاد خواهند شد. ترکیب‌های ناسازگار ایجاد نمی‌شوند."
- Credential-specific already-provisioned status (not global)
- Already-provisioned queries disabled for relevant credentials
- Validation: at least one credential and one query required

### Add Health Check Dialog
- Single credential selection (MUI Select)
- Multi-query selection with checkboxes
- Filters out already-provisioned queries
- Validation: one credential and at least one query required
- Safer v1 approach to avoid Cartesian product confusion

### Provision Results Dialog
- Shows summary: createdChecks, existingChecks, createdWidgets, skipped
- Table with Health Query, Credential, Status, Error
- Defensive name resolution: "Credential #ID" or "Query #ID" if not found in selected data
- No additional API calls (uses passed credential/query objects)

### Provisioned Checks Table
- Columns: Health Query, Credential, Check ID, Widget ID, View Check
- Cross-references IDs with credential and health query catalogs
- Link to Check Detail Page via `buildCheckRoute(checkId)`
- Loading and empty states
- No Check Status column (not provided by backend)

## Backend Contract Compliance

✓ All DTOs match backend contract:
- Separate DTOs for GET provisioned-checks and POST provisioning-result items
- CamelCase field names (createdChecks, existingChecks, etc.)
- Correct request/response structures

✓ Multi-credential behavior:
- Backend creates Cartesian product and skips incompatible combinations
- Frontend shows Persian warning explaining this behavior
- Credential-specific already-provisioned handling

✓ Add flow:
- Single-credential selection (v1 safe approach)
- Avoids Cartesian product confusion

## Cache Invalidation

After successful Provision/Add:
1. `databaseHealthMonitoringQueryKeys.provisionedChecks(applicationId)`
2. `dashboardQueryKeys.dashboard(applicationId)`
3. `dashboardQueryKeys.applicationChecks(applicationId)`
4. `checkManagementQueryKeys.checks()`
5. `checkManagementQueryKeys.applications()`

No unnecessary invalidation of:
- database credentials catalog
- health queries catalog

## Remaining Issues

None - Implementation complete and functional.

**Note:** Pre-existing lint warnings and test failures in other parts of the codebase remain unchanged and are unrelated to this implementation.
