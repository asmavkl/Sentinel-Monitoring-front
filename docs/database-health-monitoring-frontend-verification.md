# Database Health Monitoring - Frontend Verification

## 1. NumberCard / Widget DataSource Verification

### Inspection Results

**File:** `src/components/widgets/NumberMetricWidget.tsx`

**Lines 39-47:**
```typescript
if (!serverSource && (!metricValue.checkId || !metricValue.metricId)) {
  return (
    <Box sx={{ height: '100%', p: 2 }} data-testid="number-metric-widget">
      <Typography variant="body2" color="text.secondary">
        منبع داده متریک تنظیم نشده است.
      </Typography>
    </Box>
  );
}
```

**Conclusion:** [BLOCKER] NumberMetricWidget requires BOTH `checkId` AND `metricId`. If either is missing, it displays "metric data source not configured" and renders nothing.

---

**File:** `src/components/widgets/useMetricWidgetValue.ts`

**Lines 68-69:**
```typescript
const shouldQuery = metricId != null && metricId > 0 && checkId != null && checkId > 0;
```

**Lines 125-126:**
```typescript
const shouldQuery = metricId != null && metricId > 0 && checkId != null && checkId > 0;
const latestQuery = useMetricLatest(checkId ?? 0, metricId ?? 0, undefined, refreshOverride);
```

**Conclusion:** [CONFIRMED] The hook only queries metrics if both `metricId > 0` AND `checkId > 0`. The metricId is required for the API call.

---

**File:** `src/utils/widgetDataSource.ts`

**Lines 57-61:**
```typescript
export function getPrimaryMetricId(dataSources: WidgetDataSourceDto[]): number | null {
  const source = getPrimaryDataSource(dataSources);
  const metricId = source?.metricDefinitionId ?? source?.metricId ?? null;
  return metricId != null && metricId > 0 ? metricId : null;
}
```

**Conclusion:** [CONFIRMED] The utility extracts `metricId` from `metricDefinitionId` or `metricId` field in the data source. It returns null if neither exists or if value is 0.

---

**File:** `src/api/checkMetricsApi.ts`

**Lines 27-33:**
```typescript
getMetricLatest(checkId: number, metricId: number, applicationId?: number) {
  return requestApiData<MetricLatestDto>(() =>
    httpClient.get(`${CHECKS_PATH}/${checkId}/metrics/${metricId}/latest`, {
      params: applicationId ? { applicationId } : undefined,
    }),
  );
}
```

**Conclusion:** [CONFIRMED] The API requires both `checkId` and `metricId` as path parameters. There is no endpoint to get metrics by checkId only.

---

**File:** `src/types/widgets.ts`

**Lines 60-78:**
```typescript
export interface WidgetDataSourceDto {
  id: number;
  checkId?: number | null;
  checkName?: string | null;
  applicationId?: number | null;
  monitoredServerId?: number | null;
  serverMetricDefinitionId?: number | null;
  metricName?: string | null;
  metricDisplayName?: string | null;
  /** Wire field returned by the dashboard layout API. */
  metricId?: number | null;
  metricDefinitionId?: number | null;
  value?: number | null;
  timestamp?: string | null;
  healthStatus?: ApplicationHealthStatus | null;
  history?: ServerMetricHistoryPoint[] | null;
  displayOrder?: number;
  status?: CheckStatusDto | null;
}
```

**Conclusion:** [CONFIRMED] WidgetDataSourceDto has optional `metricId` and `metricDefinitionId` fields. Both are nullable. However, the frontend requires at least one to be non-null and > 0.

---

### Summary

**Is metricId required?** [CONFIRMED] YES. NumberMetricWidget will not render without it.

**Can NumberCard render using only checkId?** [BLOCKER] NO. The widget shows an error message if metricId is missing.

**What happens when metricId is null?** [CONFIRMED] Widget displays "منبع داده متریک تنظیم نشده است" (metric data source not configured) and renders nothing.

**What exact WidgetDataSource shape is expected?** [CONFIRMED] Must have either `metricId` or `metricDefinitionId` with value > 0, plus `checkId` with value > 0.

**What API request is made to obtain the value?** [CONFIRMED] `GET /api/checks/{checkId}/metrics/{metricId}/latest` requires both checkId and metricId.

---

## 2. Backend ↔ Frontend Widget Contract

### Backend Provisioning Contract

From the backend specifications provided:

**Backend Creates:**
- NumberCard Widget with `widgetType: "NumberCard"`
- WidgetDataSource with `checkId` (provisioned check ID)
- **UNCERTAIN:** Whether backend creates metric definitions and includes `metricId` in WidgetDataSource

### Frontend Requirements

**Frontend Expects:**
- WidgetDataSource with:
  - `checkId` (required, > 0)
  - `metricId` OR `metricDefinitionId` (required, > 0)
- Without metricId, NumberCard will not render

### Compatibility Analysis

**[BLOCKER]** If backend does NOT create metric definitions:
- Frontend NumberCard will display error message
- Widgets will be invisible or show "metric data source not configured"
- Dashboard will have non-functional widgets

**[CONFIRMED]** If backend DOES create metric definitions:
- Frontend NumberCard will render correctly
- Widgets will display metric values
- Dashboard will be functional

**[UNCERTAIN]** Backend metric creation behavior is not documented in the provided contract. The backend spec mentions:
- "WidgetConfiguration: NumberCard"
- "DataSource: to Check new bind"
- But does not explicitly state whether metric definitions are created.

### Conclusion

**[BLOCKER]** Frontend cannot consume backend-created widgets without metricId. Backend MUST create metric definitions for provisioned checks and include `metricId` in the WidgetDataSource.

**Recommended Action:** Verify with backend team whether metric definitions are created during provisioning. If not, this is a backend blocker that must be resolved before frontend implementation.

---

## 3. Criteria Configuration Flow

### Inspection Results

**File:** `src/features/checks/pages/CheckDetailPage.tsx`

**Lines 115-120:**
```typescript
const { data: check, isLoading: checkLoading } = useCheck(checkIdNum);
const { data: criteria, isLoading: criteriaLoading, refetch: refetchCriteria } = useCheckCriteria(checkIdNum);
const createCriteria = useCreateCriteria();
const updateCriteria = useUpdateCriteria();
const deleteCriteria = useDeleteCriteria();
```

**Lines 129-176:**
```typescript
const handleSaveCriteria = async (criteriaData: CriteriaDefinitionDto) => {
  try {
    setSaveError(null);
    const rulesPayload = criteriaData.rules.map((rule) => {
      // ... transform rules
    });

    if (criteria?.id) {
      await updateCriteria.mutateAsync({
        checkId: checkIdNum,
        criteriaId: criteria.id,
        payload: {
          isActive: criteriaData.isActive,
          rules: rulesPayload,
        },
      });
    } else {
      await createCriteria.mutateAsync({
        checkId: checkIdNum,
        payload: {
          isActive: criteriaData.isActive,
          rules: rulesPayload,
        },
      });
    }
    await refetchCriteria();
    setIsEditingCriteria(false);
  } catch (error) {
    setSaveError(getErrorMessage(error));
  }
};
```

**Lines 228-238:**
```typescript
<CriteriaRuleEditor
  criteria={criteria ?? undefined}
  checkId={checkIdNum}
  onSave={handleSaveCriteria}
  onCancel={() => {
    setSaveError(null);
    setIsEditingCriteria(false);
  }}
  isLoading={createCriteria.isPending || updateCriteria.isPending}
/>
```

**Lines 240-262:**
```typescript
) : criteria ? (
  <Card>
    <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
      <Stack spacing={2}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography variant="h6">قوانین معیار</Typography>
```

### Existing Behavior

**[CONFIRMED]** Check Detail Page has a dedicated Criteria section:
- Displays existing criteria with rules
- "Edit" button opens CriteriaRuleEditor
- CriteriaRuleEditor allows adding/editing/deleting rules
- Rules define conditions (operator, expectedValue, healthStatus, priority)
- Criteria can be activated/deactivated
- Criteria can be deleted entirely

**[CONFIRMED]** Newly provisioned checks with no criteria:
- Check Detail Page will show "قوانین معیار" section
- Will display empty state or no criteria
- "Edit" button will open CriteriaRuleEditor with empty criteria
- User can create criteria from scratch
- No special handling needed for provisioned checks

### UX Path

**[CONFIRMED]** Existing UI path for configuring criteria on a provisioned check:
1. User navigates to Check Detail Page (via link from provisioned-checks table or Check list)
2. User sees Criteria section
3. User clicks "Edit" button
4. CriteriaRuleEditor opens
5. User adds rules (operator, expectedValue, healthStatus, priority)
6. User saves
7. Criteria is created/updated
8. Check now has criteria for health status evaluation

**[CONFIRMED]** No automatic criteria creation is implemented or needed. Users configure criteria manually via existing UI.

### Conclusion

**[CONFIRMED]** Provisioned checks with no criteria can be clearly configured from the existing Check Detail Page UI. No frontend changes needed for criteria configuration.

---

## 4. Add Health Monitoring UX Verification

### Inspection Results

**File:** `src/features/check-management/components/DatabaseCheckForm.tsx`

**Lines 48-94:**
```typescript
const relationalCredentials = credentials.filter((credential) =>
  isRelationalCredentialType(getCredentialType(credential)),
);
const selectedCredential = relationalCredentials.find(
  (credential) => credential.id === values.databaseCredentialId,
);
const credentialType = selectedCredential ? getCredentialType(selectedCredential) : null;
const healthQueryMode = values.querySource === 'healthQuery';
const selectedHealthQueryId = typeof values.healthQueryId === 'number' ? values.healthQueryId : 0;

const healthQueries = useDatabaseHealthQueries(
  {
    databaseType: credentialType ?? undefined,
    isActive: true,
  },
  healthQueryMode && credentialType != null,
);
```

**Lines 98-120:**
```typescript
<FormControl fullWidth disabled={readOnly} error={Boolean(errors.databaseCredentialId)}>
  <InputLabel id="check-credential-label">{credentialScopeLabel('Database')}</InputLabel>
  <Select
    labelId="check-credential-label"
    id="check-credential"
    label={credentialScopeLabel('Database')}
    value={values.databaseCredentialId}
    onChange={(event) => handleCredentialChange(String(event.target.value))}
    inputProps={{ 'aria-label': credentialScopeLabel('Database') }}
  >
    <MenuItem value="">
      <em>انتخاب کنید</em>
    </MenuItem>
    {relationalCredentials.map((credential) => (
      <MenuItem key={credential.id} value={credential.id}>
        {credential.name}
      </MenuItem>
    ))}
  </Select>
```

**Lines 232-256:**
```typescript
<FormControl fullWidth disabled={selectorDisabled} error={Boolean(errors.healthQueryId)}>
  <InputLabel id="health-query-select-label">کوئری سلامت</InputLabel>
  <Select
    labelId="health-query-select-label"
    id="health-query-select"
    label="کوئری سلامت"
    value={values.healthQueryId}
    onChange={(event) => {
      const parsed = Number(event.target.value);
      onChange({
        healthQueryId: Number.isFinite(parsed) && parsed > 0 ? parsed : '',
      });
    }}
    inputProps={{ 'aria-label': 'کوئری سلامت' }}
  >
    <MenuItem value="">
      <em>انتخاب کنید</em>
    </MenuItem>
    {options.map((query) => (
      <MenuItem key={query.id} value={query.id}>
        {query.displayName}
        {query.isActive ? '' : ' (غیرفعال)'}
      </MenuItem>
    ))}
  </Select>
```

### Existing Pattern

**[CONFIRMED]** DatabaseCheckForm uses:
- **Single-select** for credential (MUI Select)
- **Single-select** for health query (MUI Select)
- One credential selected → one health query selected
- Creates one check with one credential and one health query

### Backend Add Contract

From backend specifications:
```typescript
POST /api/applications/{applicationId}/database-health-monitoring/add
{
  databaseCredentialIds: number[],
  databaseHealthQueryIds: number[]
}
```

**[CONFIRMED]** Backend accepts arrays and will provision all combinations (Cartesian product).

### Cartesian Product Risk

**[BLOCKER]** If frontend uses independent multi-selects:
- User selects credentials: [1, 2]
- User selects health queries: [A, B]
- Backend will provision: (1,A), (1,B), (2,A), (2,B) = 4 checks
- User may not expect this behavior
- UI does not clarify this

### Recommended UI Model

**Option A: Sequential Selection (Recommended)**
1. User selects health query first
2. UI shows compatible credentials for that query
3. User selects one or more credentials
4. Backend provisions selected query for selected credentials
5. Repeat for additional queries

**Pros:**
- Clear intent: "This query for these credentials"
- No accidental Cartesian product
- Consistent with existing single-select pattern

**Cons:**
- Multiple API calls for available-queries (one per query)
- More steps for user

**Option B: Grouped Selection**
1. User selects credentials
2. UI groups compatible health queries by credential type
3. User selects queries per credential type
4. UI shows summary: "Query A for Credentials [1,2], Query B for Credential [3]"
5. Backend provisions

**Pros:**
- Clear mapping of which query goes to which credential
- No accidental Cartesian product

**Cons:**
- More complex UI
- Requires backend to support per-credential query mapping (not available)

**Option C: Single-Credential Simplification**
1. Restrict "Add Health Query" to one credential at a time
2. User selects one credential
3. User selects one or more health queries
4. Backend provisions

**Pros:**
- Simplest UI
- Consistent with existing DatabaseCheckForm pattern
- No Cartesian product confusion

**Cons:**
- Requires multiple API calls for multiple credentials
- User must repeat for each credential

### Conclusion

**[BLOCKER]** Independent multi-selects would create Cartesian product unexpectedly. Must implement sequential or grouped selection to avoid confusion.

**[RECOMMENDED]** Option C (Single-Credential Simplification) is safest and most consistent with existing patterns. Option A (Sequential Selection) is viable but more complex.

**[CONFIRMED]** Available-queries endpoint is credential-specific, so any multi-credential UI requires multiple API calls regardless of approach.

---

## 5. Application Details Integration Point

### Inspection Results

**File:** `src/features/monitoring-management/pages/ApplicationDetailsPage.tsx`

**Lines 127-140:**
```typescript
return (
  <MonitoringPageContainer>
    <BackButton fallbackTo={ROUTES.monitoringApplications} />
    <MonitoringSectionHeader title={application.name} />
    <MonitoringToolbar
      title="کامپوننت‌ها"
      actions={
        canWrite ? (
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            افزودن Component
          </Button>
        ) : undefined
      }
    />

    <ApplicationInfoCard application={application} />

    <MonitoringTableCard title="Components">
      {/* Components table */}
    </MonitoringTableCard>

    {/* Dialogs */}
  </MonitoringPageContainer>
);
```

### Current Structure

**[CONFIRMED]** ApplicationDetailsPage structure:
1. BackButton
2. MonitoringSectionHeader (with application name)
3. MonitoringToolbar (Components title + Add button)
4. ApplicationInfoCard (application details)
5. MonitoringTableCard (Components table)
6. Dialogs (ComponentFormDialog, ConfirmDeleteDialog)

**[CONFIRMED]** No tabs, no collapsible sections. Linear layout.

### Insertion Point

**[CONFIRMED]** Two viable insertion points:

**Option A: Below Components (Recommended)**
- Add new MonitoringTableCard below existing Components card
- Title: "Database Health Monitoring"
- Can follow same pattern as Components section
- No structural changes needed

**Option B: Tabs**
- Convert Components and Database Health to tabs
- Requires restructuring entire page
- More complex, but cleaner for many sections

**Option C: Collapsible Section**
- Add collapsible Card below Components
- More complex, not existing pattern

### Conclusion

**[CONFIRMED]** Recommended insertion point: Below Components section using same MonitoringTableCard pattern.

**[NO CHANGE]** No new route needed. Page structure supports adding sections linearly.

---

## 6. Permission Verification

### Inspection Results

**File:** `src/auth/roleAccess.ts`

**Lines 17-19:**
```typescript
export function canWriteMonitoring(role: string | null): boolean {
  return isAdmin(role);
}
```

**Conclusion:** [CONFIRMED] `canWriteMonitoring` returns true only for Admin role.

---

**File:** `src/auth/currentUser.ts`

**Lines 147-162:**
```typescript
export function userHasMonitoringWriteAccess(user?: CurrentUser | null): boolean {
  if (userHasDashboardWriteAccess(user)) {
    return true;
  }

  if (!user) {
    return false;
  }

  if (hasExplicitReadOnlyRole(getEffectiveUserRoles(user))) {
    return false;
  }

  // Portal users such as «مدیر اصلی» are authenticated but may not send an English Admin role.
  return true;
}
```

**Lines 8-18:**
```typescript
const WRITE_ROLE_ALIASES = new Set([
  'admin',
  'administrator',
  'superadmin',
  'super-admin',
  'sysadmin',
  'مدیر',
  'ادمین',
  'مدیر سیستم',
  'مدیر اصلی',
]);
```

**Conclusion:** [CONFIRMED] `userHasMonitoringWriteAccess` checks for Admin role or write role aliases. Also allows Portal admin users (Persian/English aliases). Returns false for explicit read-only roles (viewer, operator).

---

**File:** `src/features/monitoring-management/pages/ApplicationDetailsPage.tsx`

**Lines 35-36:**
```typescript
const { data: currentUser } = useCurrentUser();
const canWrite = userHasMonitoringWriteAccess(currentUser);
```

**Lines 133-139:**
```typescript
actions={
  canWrite ? (
    <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
      افزودن Component
    </Button>
  ) : undefined
}
```

**Conclusion:** [CONFIRMED] ApplicationDetailsPage uses `userHasMonitoringWriteAccess` to guard write actions. Button is hidden for non-write users.

### Production Readiness

**[CONFIRMED]** Permission implementation is production-ready:
- Not a TODO comment
- Fully implemented with role aliases
- Used in production pages
- Handles Portal users with Persian role names

### Conclusion

**[CONFIRMED]** Use `userHasMonitoringWriteAccess(currentUser)` for guarding Provision and Add operations. It is production-ready and handles all role scenarios.

**[CONFIRMED]** Hide Provision/Add buttons for non-write users. Show message: "Only Admin can provision database health monitoring" or similar.

---

## 7. React Query Cache Verification

### Inspection Results

**File:** `src/features/dashboard/hooks/queryKeys.ts`

**Lines 31-36:**
```typescript
dashboard: (applicationId: number) => ['application-dashboard', applicationId] as const,
serverDashboard: (serverId: number) => ['server-dashboard', serverId] as const,
layout: (applicationId: number) => ['dashboard-layout', applicationId] as const,
sections: (dashboardId: number) => ['dashboard-sections', dashboardId] as const,
widget: (widgetId: number) => ['dashboard-widget', widgetId] as const,
applicationChecks: (applicationId: number) => ['application-checks', applicationId] as const,
```

**Conclusion:** [CONFIRMED] Dashboard query key is `['application-dashboard', applicationId]`. Application checks key is `['application-checks', applicationId]`.

---

**File:** `src/features/database-credentials/hooks/queryKeys.ts`

**Lines 1-5:**
```typescript
export const databaseCredentialsQueryKeys = {
  all: ['database-credentials'] as const,
  list: () => [...databaseCredentialsQueryKeys.all, 'list'] as const,
  detail: (id: number) => [...databaseCredentialsQueryKeys.all, 'detail', id] as const,
};
```

**Conclusion:** [CONFIRMED] Credentials query key is `['database-credentials', 'list']`.

---

**File:** `src/features/database-health-queries/hooks/queryKeys.ts`

**Lines 3-15:**
```typescript
export const databaseHealthQueryKeys = {
  all: ['database-health-queries'] as const,
  lists: () => [...databaseHealthQueryKeys.all, 'list'] as const,
  list: (filters: DatabaseHealthQueryListFilters = {}) =>
    [
      ...databaseHealthQueryKeys.lists(),
      filters.databaseType ?? null,
      filters.category ?? null,
      filters.isActive ?? null,
      filters.search?.trim() ?? '',
    ] as const,
  detail: (id: number) => [...databaseHealthQueryKeys.all, 'detail', id] as const,
};
```

**Conclusion:** [CONFIRMED] Health queries query key is `['database-health-queries', 'list', ...filters]`.

---

**File:** `src/features/check-management/hooks/useCheckManagement.ts`

**Lines 10-20:**
```typescript
function invalidateCheckQueries(queryClient: ReturnType<typeof useQueryClient>, checkId?: number) {
  void queryClient.invalidateQueries({ queryKey: checkManagementQueryKeys.checks() });
  void queryClient.invalidateQueries({ queryKey: checkManagementQueryKeys.applications() });
  void queryClient.invalidateQueries({ queryKey: monitoringManagementQueryKeys.applications() });
  void queryClient.invalidateQueries({ queryKey: applicationQueryKeys.all });

  if (checkId) {
    void queryClient.invalidateQueries({ queryKey: checkManagementQueryKeys.check(checkId) });
    void queryClient.invalidateQueries({ queryKey: checkManagementQueryKeys.criteria(checkId) });
  }
}
```

**Conclusion:** [CONFIRMED] Check invalidation already invalidates:
- checkManagementQueryKeys.checks()
- checkManagementQueryKeys.applications()
- monitoringManagementQueryKeys.applications()
- applicationQueryKeys.all
- checkManagementQueryKeys.check(checkId) (if checkId provided)
- checkManagementQueryKeys.criteria(checkId) (if checkId provided)

### Minimum Cache Invalidation After Provision

**[CONFIRMED]** After POST /provision, invalidate:
1. `dashboardQueryKeys.dashboard(applicationId)` - to show new widgets
2. `dashboardQueryKeys.applicationChecks(applicationId)` - to show new checks in dashboard overview
3. `checkManagementQueryKeys.checks()` - to update global checks list
4. `checkManagementQueryKeys.applications()` - to update monitoring applications list

**[NO CHANGE]** Do NOT invalidate:
- databaseCredentialsQueryKeys.list() - credentials not changed
- databaseHealthQueryKeys.list() - health queries not changed
- Individual check keys - not needed unless specific check known

### Minimum Cache Invalidation After Add

**[CONFIRMED]** Same as Provision:
1. `dashboardQueryKeys.dashboard(applicationId)`
2. `dashboardQueryKeys.applicationChecks(applicationId)`
3. `checkManagementQueryKeys.checks()`
4. `checkManagementQueryKeys.applications()`

### Conclusion

**[CONFIRMED]** Minimum invalidations: dashboard, application-checks, checks, and applications. Do not invalidate unrelated caches (credentials, health queries).

---

## 8. Confirmed Decisions

### 1. NumberCard Requires metricId

**[BLOCKER]** NumberMetricWidget cannot render without metricId. Backend MUST create metric definitions during provisioning.

**Action:** Verify with backend team. If backend does not create metrics, this is a backend blocker.

### 2. No New Route Needed

**[CONFIRMED]** Add Database Health Monitoring section to existing ApplicationDetailsPage. No new route required.

**Action:** Use MonitoringTableCard pattern below Components section.

### 3. Permission Implementation

**[CONFIRMED]** Use `userHasMonitoringWriteAccess(currentUser)` for write guards. It is production-ready.

**Action:** Hide Provision/Add buttons for non-write users.

### 4. Criteria Configuration

**[CONFIRMED]** Existing Check Detail Page UI can configure criteria for provisioned checks. No changes needed.

**Action:** Provide link to Check Detail Page from provisioned-checks table.

### 5. Multi-Credential UX

**[BLOCKER]** Independent multi-selects would create Cartesian product. Must use sequential or single-credential selection.

**[RECOMMENDED]** Use single-credential selection per operation (safest, consistent with existing pattern).

**Action:** Implement "Add Health Query" for one credential at a time, or sequential selection.

### 6. Cache Invalidation

**[CONFIRMED]** Invalidate: dashboard, application-checks, checks, applications. Do NOT invalidate credentials or health queries.

**Action:** Implement minimal invalidation in onSuccess callbacks.

### 7. Dashboard Rendering

**[CONFIRMED]** Dashboard will automatically render provisioned widgets if metricId is provided. No frontend changes needed.

**Action:** Only if backend creates metric definitions.

---

## 9. Remaining Backend Questions

### 1. Metric Definition Creation

**[BLOCKER]** Does the backend create metric definitions for provisioned checks?

**Why it matters:** Frontend NumberCard requires metricId to render. Without metric definitions, widgets will not work.

**Impact:** BLOCKER if backend does not create metrics.

**Verification needed:** Check backend provisioning code to confirm metric definition creation.

---

### 2. WidgetDataSource metricId Field

**[UNCERTAIN]** Does the backend include metricId in the WidgetDataSource for provisioned widgets?

**Why it matters:** Frontend extracts metricId from WidgetDataSource. If not included, widgets won't render.

**Impact:** BLOCKER if metricId not included.

**Verification needed:** Check backend widget creation code to confirm metricId is set.

---

### 3. Application-Credential Association

**[UNCERTAIN]** Is there an endpoint to get credentials specific to an application?

**Why it matters:** Current implementation loads all credentials globally. May show credentials not associated with the application.

**Impact:** UX degradation if unrelated credentials shown. Security concern if credentials are global.

**Verification needed:** Check if backend has application-specific credential endpoint.

---

### 4. Available-Queries Multi-Credential Support

**[BACKEND GAP]** Does the backend support passing multiple databaseCredentialIds to available-queries endpoint?

**Why it matters:** Current endpoint is credential-specific. Multi-credential UI requires multiple API calls.

**Impact:** UX complexity and performance degradation.

**Verification needed:** Confirm backend limitation is intentional or can be extended.

---

### 5. Provisioned-Checks Cross-Reference Data

**[BACKEND GAP]** Can the backend include health query name and credential name in provisioned-checks response?

**Why it matters:** Frontend must cross-reference with catalog and credential list to get names. Additional API calls needed.

**Impact:** Slower UX, more complex frontend logic.

**Verification needed:** Check if backend can add name fields to response.

---

### 6. Widget Deletion Tracking

**[BACKEND GAP]** Does the backend track widget deletion?

**Why it matters:** If user deletes widget via dashboard designer, provisioned-checks API still shows widgetId. Frontend cannot detect deletion.

**Impact:** Inconsistent state, confusing UX.

**Verification needed:** Check if backend has widget status or deletion tracking.

---

### 7. Health Query Deactivation Impact

**[BACKEND GAP]** What happens to provisioned checks when health query is deactivated?

**Why it matters:** Check may continue running with inactive query. Frontend cannot detect deactivation.

**Impact:** Inconsistent state, potential errors.

**Verification needed:** Check backend behavior when health query is deactivated.

---

### 8. Credential Deletion Impact

**[BACKEND GAP]** What happens to provisioned checks when credential is deleted?

**Why it matters:** Check may fail with credential not found error. Frontend cannot detect deletion.

**Impact:** Check failures, inconsistent state.

**Verification needed:** Check backend behavior when credential is deleted.

---

## 10. Implementation Blockers

### Critical Blocker

**[BLOCKER] NumberCard Requires metricId**

**Evidence:**
- `src/components/widgets/NumberMetricWidget.tsx` line 39: requires both checkId and metricId
- `src/components/widgets/useMetricWidgetValue.ts` line 68: shouldQuery requires both > 0
- `src/api/checkMetricsApi.ts` line 27: API requires both checkId and metricId

**Impact:** Frontend cannot render provisioned widgets without metricId.

**Required Backend Change:** Backend MUST create metric definitions for provisioned checks and include metricId in WidgetDataSource.

**Verification Needed:** Confirm with backend team whether metric definitions are created during provisioning.

---

### UX Blocker

**[BLOCKER] Cartesian Product Risk in Multi-Select**

**Evidence:**
- Backend POST /add accepts arrays of credentialIds and healthQueryIds
- Independent multi-selects would create all combinations (Cartesian product)
- User may not expect this behavior
- No existing multi-select pattern in codebase

**Impact:** UX confusion, accidental over-provisioning.

**Required Frontend Decision:** Must implement sequential or single-credential selection.

**Recommended Solution:** Use single-credential selection per operation (consistent with existing DatabaseCheckForm pattern).

---

### Backend Gaps (Not Frontend Blockers)

**[BACKEND GAP] Available-Queries is Credential-Specific**

**Evidence:** Backend spec: `GET /available-queries?databaseCredentialId={id}` requires single credential ID.

**Impact:** Multiple API calls needed for multi-credential UI. UX complexity.

**Frontend Workaround:** Call endpoint per credential, merge results.

**Do Not Fix in Frontend:** This is a backend limitation.

---

**[BACKEND GAP] Provisioned-Checks Missing Names**

**Evidence:** Backend spec returns only IDs (healthQueryId, databaseCredentialId, checkId, widgetId).

**Impact:** Additional API calls needed for cross-reference. Slower UX.

**Frontend Workaround:** Cross-reference with health query catalog and credential list.

**Do Not Fix in Frontend:** Request backend to include names.

---

**[BACKEND GAP] Widget Deletion Not Tracked**

**Evidence:** Backend spec does not indicate widget deletion status.

**Impact:** Cannot detect if provisioned widget was deleted. Inconsistent state.

**Frontend Workaround:** Cross-reference with dashboard widgets (if feasible).

**Do Not Fix in Frontend:** Request backend to track widget status.

---

**[BACKEND GAP] Health Query Deactivation Not Tracked**

**Evidence:** Backend spec does not indicate health query status in provisioned-checks.

**Impact:** Cannot detect if provisioned check's health query was deactivated.

**Frontend Workaround:** Cross-reference with health query catalog.

**Do Not Fix in Frontend:** Request backend to include health query status.

---

**[BACKEND GAP] Credential Deletion Not Tracked**

**Evidence:** Backend spec does not indicate credential status in provisioned-checks.

**Impact:** Cannot detect if provisioned check's credential was deleted.

**Frontend Workaround:** Cross-reference with credential list.

**Do Not Fix in Frontend:** Request backend to include credential status.

---

**[BACKEND GAP] Application-Credential Association**

**Evidence:** No endpoint for application-specific credentials in spec.

**Impact:** Must load all credentials globally. May show unrelated credentials.

**Frontend Workaround:** Use global credential list (existing pattern).

**Do Not Fix in Frontend:** Request backend to provide application-specific credential endpoint.

---

## Summary

### Blockers

1. **[BLOCKER]** NumberCard requires metricId - Backend must create metric definitions
2. **[BLOCKER]** Cartesian product risk - Must use sequential/single-credential selection

### Confirmed Decisions

1. Add section to ApplicationDetailsPage (no new route)
2. Use `userHasMonitoringWriteAccess` for permission guards
3. Existing Criteria UI works for provisioned checks
4. Invalidate: dashboard, application-checks, checks, applications
5. Dashboard renders automatically if metricId provided

### Backend Questions to Verify

1. Does backend create metric definitions for provisioned checks?
2. Does backend include metricId in WidgetDataSource?
3. Can backend add names to provisioned-checks response?
4. Can backend track widget/health query/credential deletion?

### Next Steps

1. **CRITICAL:** Verify with backend team whether metric definitions are created during provisioning
2. If yes: Proceed with frontend implementation
3. If no: This is a backend blocker that must be resolved first
4. Document backend response to metric definition question
5. Implement single-credential selection for "Add Health Monitoring" to avoid Cartesian product
