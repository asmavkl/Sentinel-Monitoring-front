// import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
// import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
// import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
// import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
// import VisibilityIcon from '@mui/icons-material/Visibility';
// import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
// import { Box, IconButton, Stack, Tooltip, Typography } from '@mui/material';
// import type { DashboardSectionDto, WidgetDto } from '@/types/dashboard';
// import { EmptyState } from '@/components/common';
// import { LayoutEditor } from './LayoutEditor';
// import { resolveSectionColor } from '../utils/sectionDraft';

// interface SectionCanvasProps {
//   sections: DashboardSectionDto[];
//   selectedSectionId: number | null;
//   selectedWidgetId: number | null;
//   disabled?: boolean;
//   previewMode?: boolean;
//   onSelectSection: (sectionId: number) => void;
//   onEditSection: (sectionId: number) => void;
//   onDeleteSection: (sectionId: number) => void;
//   onToggleSectionVisibility: (sectionId: number) => void;
//   onMoveSection: (sectionId: number, direction: 'up' | 'down') => void;
//   onSectionWidgetsChange: (sectionId: number, widgets: WidgetDto[]) => void;
//   onSelectWidget: (widgetId: number, sectionId: number) => void;
//   onEditWidget: (widgetId: number, sectionId: number) => void;
//   onDeleteWidget: (widgetId: number) => void;
//   onDuplicateWidget: (widgetId: number, sectionId: number) => void;
//   onMoveWidgetToSection: (widgetId: number, targetSectionId: number) => void;
// }

// export function SectionCanvas({
//   sections,
//   selectedSectionId,
//   selectedWidgetId,
//   disabled = false,
//   previewMode = false,
//   onSelectSection,
//   onEditSection,
//   onDeleteSection,
//   onToggleSectionVisibility,
//   onMoveSection,
//   onSectionWidgetsChange,
//   onSelectWidget,
//   onEditWidget,
//   onDeleteWidget,
//   onDuplicateWidget,
//   onMoveWidgetToSection,
// }: SectionCanvasProps) {
//   const sorted = [...sections].sort((left, right) => left.displayOrder - right.displayOrder);

//   if (sorted.length === 0) {
//     return (
//       <Box
//         data-testid="dashboard-canvas"
//         sx={{
//           minHeight: '100%',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//         }}
//       >
//         <EmptyState
//           title="بوم خالی است"
//           description="ویجت‌ها را از کتابخانه انتخاب کنید"
//         />
//       </Box>
//     );
//   }

//   return (
//     <Stack
//       spacing={2}
//       data-testid="dashboard-canvas"
//       sx={{ width: '100%', minHeight: '100%' }}
//     >
//       {sorted.map((section, index) => {
//         const headerColor = resolveSectionColor(section.color);
//         const isSelected = selectedSectionId === section.id;

//         return (
//           <Box
//             key={section.id}
//             data-testid="designer-section"
//             data-section-id={section.id}
//             onClick={() => onSelectSection(section.id)}
//             sx={{
//               bgcolor: 'transparent',
//               borderRadius: 1,
//               opacity: section.isVisible ? 1 : 0.72,
//               outline: isSelected ? '2px solid' : 'none',
//               outlineColor: 'primary.main',
//               outlineOffset: 4,
//               position: 'relative',
//             }}
//           >
//             <Stack
//               direction="row"
//               spacing={0.5}
//               sx={{
//                 alignItems: 'center',
//                 px: 1.5,
//                 py: 0.85,
//                 bgcolor: headerColor,
//                 color: '#fff',
//                 borderRadius: 0.5,
//                 minHeight: 40,
//               }}
//             >
//               <Box sx={{ flexGrow: 1, minWidth: 0 }}>
//                 <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>
//                   {section.title}
//                 </Typography>
//               </Box>

//               {!previewMode ? (
//                 <>
//                   <Tooltip title="بالا">
//                     <span>
//                       <IconButton
//                         size="small"
//                         disabled={disabled || index === 0}
//                         onClick={(event) => {
//                           event.stopPropagation();
//                           onMoveSection(section.id, 'up');
//                         }}
//                         aria-label={`بالا بردن بخش ${section.title}`}
//                         sx={{ color: 'inherit' }}
//                       >
//                         <ArrowUpwardIcon fontSize="small" />
//                       </IconButton>
//                     </span>
//                   </Tooltip>
//                   <Tooltip title="پایین">
//                     <span>
//                       <IconButton
//                         size="small"
//                         disabled={disabled || index === sorted.length - 1}
//                         onClick={(event) => {
//                           event.stopPropagation();
//                           onMoveSection(section.id, 'down');
//                         }}
//                         aria-label={`پایین بردن بخش ${section.title}`}
//                         sx={{ color: 'inherit' }}
//                       >
//                         <ArrowDownwardIcon fontSize="small" />
//                       </IconButton>
//                     </span>
//                   </Tooltip>
//                   <Tooltip title={section.isVisible ? 'مخفی کردن' : 'نمایش'}>
//                     <IconButton
//                       size="small"
//                       disabled={disabled}
//                       onClick={(event) => {
//                         event.stopPropagation();
//                         onToggleSectionVisibility(section.id);
//                       }}
//                       aria-label={`تغییر نمایش بخش ${section.title}`}
//                       sx={{ color: 'inherit' }}
//                     >
//                       {section.isVisible ? (
//                         <VisibilityIcon fontSize="small" />
//                       ) : (
//                         <VisibilityOffIcon fontSize="small" />
//                       )}
//                     </IconButton>
//                   </Tooltip>
//                   <Tooltip title="ویرایش بخش">
//                     <IconButton
//                       size="small"
//                       disabled={disabled}
//                       onClick={(event) => {
//                         event.stopPropagation();
//                         onEditSection(section.id);
//                       }}
//                       aria-label={`ویرایش بخش ${section.title}`}
//                       sx={{ color: 'inherit' }}
//                     >
//                       <EditOutlinedIcon fontSize="small" />
//                     </IconButton>
//                   </Tooltip>
//                   <Tooltip title="حذف بخش">
//                     <IconButton
//                       size="small"
//                       disabled={disabled}
//                       onClick={(event) => {
//                         event.stopPropagation();
//                         onDeleteSection(section.id);
//                       }}
//                       aria-label={`حذف بخش ${section.title}`}
//                       sx={{ color: 'inherit' }}
//                     >
//                       <DeleteOutlinedIcon fontSize="small" />
//                     </IconButton>
//                   </Tooltip>
//                 </>
//               ) : null}
//             </Stack>

//             <Box sx={{ width: '100%', minHeight: 0, pt: 1.5, direction: 'ltr' }}>
//               <LayoutEditor
//                 widgets={section.widgets}
//                 selectedWidgetId={selectedWidgetId}
//                 sections={sorted}
//                 currentSectionId={section.id}
//                 previewMode={previewMode}
//                 onWidgetsChange={(widgets) => onSectionWidgetsChange(section.id, widgets)}
//                 onSelectWidget={(widgetId) => onSelectWidget(widgetId, section.id)}
//                 onEditWidget={(widgetId) => onEditWidget(widgetId, section.id)}
//                 onDeleteWidget={onDeleteWidget}
//                 onDuplicateWidget={(widgetId) => onDuplicateWidget(widgetId, section.id)}
//                 onMoveWidgetToSection={onMoveWidgetToSection}
//                 emptyDescription="ویجت‌ها را از کتابخانه انتخاب کنید"
//               />
//             </Box>
//           </Box>
//         );
//       })}
//     </Stack>
//   );
// }
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

import {
  Box,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';

import { alpha } from '@mui/material/styles';

import type {
  DashboardSectionDto,
  WidgetDto,
} from '@/types/dashboard';

import { EmptyState } from '@/components/common';

import { LayoutEditor } from './LayoutEditor';

import { resolveSectionColor } from '../utils/sectionDraft';

interface SectionCanvasProps {
  sections: DashboardSectionDto[];
  selectedSectionId: number | null;
  selectedWidgetId: number | null;
  disabled?: boolean;
  previewMode?: boolean;

  onSelectSection: (
    sectionId: number,
  ) => void;

  onEditSection: (
    sectionId: number,
  ) => void;

  onDeleteSection: (
    sectionId: number,
  ) => void;

  onToggleSectionVisibility: (
    sectionId: number,
  ) => void;

  onMoveSection: (
    sectionId: number,
    direction: 'up' | 'down',
  ) => void;

  onSectionWidgetsChange: (
    sectionId: number,
    widgets: WidgetDto[],
  ) => void;

  onSelectWidget: (
    widgetId: number,
    sectionId: number,
  ) => void;

  onEditWidget: (
    widgetId: number,
    sectionId: number,
  ) => void;

  onDeleteWidget: (
    widgetId: number,
  ) => void;

  onDuplicateWidget: (
    widgetId: number,
    sectionId: number,
  ) => void;

  onMoveWidgetToSection: (
    widgetId: number,
    targetSectionId: number,
  ) => void;
}

// ─────────────────────────────────────────────
// Section Color Resolver
// ─────────────────────────────────────────────

function getSectionColorValue(
  color: string,
): string {
  const normalized = color
    .trim()
    .toLowerCase();

  const colors: Record<string, string> = {
    blue: '#3F978E',
    purple: '#8F65B8',
    gray: '#64748B',
    grey: '#64748B',
    green: '#4CAF7D',
    orange: '#D9903D',
    red: '#C85C5C',
    teal: '#3F978E',
  };

  const resolvedColor =
    colors[normalized];

  if (resolvedColor) {
    return resolvedColor;
  }

  // Already a valid CSS color.
  if (
    color.startsWith('#') ||
    color.startsWith('rgb(') ||
    color.startsWith('rgba(') ||
    color.startsWith('hsl(') ||
    color.startsWith('hsla(')
  ) {
    return color;
  }

  // Safe fallback.
  return '#64748B';
}

// ─────────────────────────────────────────────
// Section Canvas
// ─────────────────────────────────────────────

export function SectionCanvas({
  sections,
  selectedSectionId,
  selectedWidgetId,
  disabled = false,
  previewMode = false,

  onSelectSection,
  onEditSection,
  onDeleteSection,
  onToggleSectionVisibility,
  onMoveSection,
  onSectionWidgetsChange,
  onSelectWidget,
  onEditWidget,
  onDeleteWidget,
  onDuplicateWidget,
  onMoveWidgetToSection,
}: SectionCanvasProps) {
  const sorted = [...sections].sort(
    (left, right) =>
      left.displayOrder -
      right.displayOrder,
  );

  // ───────────────────────────────────────────
  // Empty State
  // ───────────────────────────────────────────

  if (sorted.length === 0) {
    return (
      <Box
        data-testid="dashboard-canvas"
        sx={{
          width: '100%',
          minHeight: '100%',

          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',

          px: 2,
          py: 4,
        }}
      >
        <EmptyState
          title="بوم داشبورد خالی است"
          description="برای شروع، یک ویجت از کتابخانه انتخاب کنید یا یک بخش جدید ایجاد کنید."
        />
      </Box>
    );
  }

  // ───────────────────────────────────────────
  // Sections
  // ───────────────────────────────────────────

  return (
    <Stack
      spacing={2.5}
      data-testid="dashboard-canvas"
      sx={{
        width: '100%',
        minHeight: '100%',
      }}
    >
      {sorted.map((section, index) => {
        const headerColor =
          getSectionColorValue(
            resolveSectionColor(
              section.color,
            ),
          );

        const isSelected =
          selectedSectionId === section.id;

        const isFirst = index === 0;

        const isLast =
          index === sorted.length - 1;

        const widgetCount =
          section.widgets?.length ?? 0;

        return (
          <Box
            key={section.id}
            data-testid="designer-section"
            data-section-id={section.id}
            data-selected={isSelected}
            data-visible={section.isVisible}
            onClick={() =>
              onSelectSection(section.id)
            }
            sx={(theme) => ({
              width: '100%',

              position: 'relative',

              borderRadius: 2.5,

              backgroundColor:
                theme.palette.background.paper,

              border: '1px solid',

              borderColor: isSelected
                ? theme.palette.primary.main
                : theme.palette.divider,

              overflow: 'hidden',

              transition:
                'border-color 160ms ease, background-color 160ms ease',

              cursor: 'pointer',

              '&:hover': {
                borderColor: isSelected
                  ? theme.palette.primary.main
                  : alpha(
                    theme.palette.primary.main,
                    0.35,
                  ),
              },

              ...(isSelected && {
                '&::after': {
                  content: '""',

                  position: 'absolute',

                  top: 0,
                  right: 0,
                  bottom: 0,

                  width: 3,

                  backgroundColor:
                    theme.palette.primary.main,

                  pointerEvents: 'none',
                },
              }),
            })}
          >
            <SectionHeader
              title={section.title}
              color={headerColor}
              isSelected={isSelected}
              isVisible={section.isVisible}
              widgetCount={widgetCount}
              previewMode={previewMode}
              disabled={disabled}
              isFirst={isFirst}
              isLast={isLast}
              onMoveUp={() =>
                onMoveSection(
                  section.id,
                  'up',
                )
              }
              onMoveDown={() =>
                onMoveSection(
                  section.id,
                  'down',
                )
              }
              onToggleVisibility={() =>
                onToggleSectionVisibility(
                  section.id,
                )
              }
              onEdit={() =>
                onEditSection(section.id)
              }
              onDelete={() =>
                onDeleteSection(section.id)
              }
            />

            {/* Section Content */}

            <Box
              sx={{
                width: '100%',
                minHeight: 0,

                px: {
                  xs: 1,
                  sm: 1.5,
                },

                pt: 1.5,
                pb: 1.5,

                // Layout editor is LTR.
                direction: 'ltr',

                opacity: section.isVisible
                  ? 1
                  : 0.55,

                transition:
                  'opacity 160ms ease',
              }}
            >
              <LayoutEditor
                widgets={section.widgets}
                selectedWidgetId={
                  selectedWidgetId
                }
                sections={sorted}
                currentSectionId={section.id}
                previewMode={previewMode}
                onWidgetsChange={(widgets) =>
                  onSectionWidgetsChange(
                    section.id,
                    widgets,
                  )
                }
                onSelectWidget={(widgetId) =>
                  onSelectWidget(
                    widgetId,
                    section.id,
                  )
                }
                onEditWidget={(widgetId) =>
                  onEditWidget(
                    widgetId,
                    section.id,
                  )
                }
                onDeleteWidget={
                  onDeleteWidget
                }
                onDuplicateWidget={(widgetId) =>
                  onDuplicateWidget(
                    widgetId,
                    section.id,
                  )
                }
                onMoveWidgetToSection={
                  onMoveWidgetToSection
                }
                emptyDescription="ویجت‌ها را از کتابخانه انتخاب کنید"
              />
            </Box>
          </Box>
        );
      })}
    </Stack>
  );
}

// ═══════════════════════════════════════════════
// Section Header
// ═══════════════════════════════════════════════

interface SectionHeaderProps {
  title: string;
  color: string;
  isSelected: boolean;
  isVisible: boolean;
  widgetCount: number;
  previewMode: boolean;
  disabled: boolean;
  isFirst: boolean;
  isLast: boolean;

  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggleVisibility: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function SectionHeader({
  title,
  color,
  isSelected,
  isVisible,
  widgetCount,
  previewMode,
  disabled,
  isFirst,
  isLast,

  onMoveUp,
  onMoveDown,
  onToggleVisibility,
  onEdit,
  onDelete,
}: SectionHeaderProps) {
  return (
    <Box
      sx={(theme) => ({
        width: '100%',

        direction: 'rtl',

        background:
          theme.palette.mode === 'dark'
            ? alpha(color, 0.14)
            : alpha(color, 0.07),

        borderBottom: '1px solid',

        borderColor:
          theme.palette.mode === 'dark'
            ? alpha(color, 0.22)
            : alpha(color, 0.14),

        position: 'relative',
      })}
    >
      {/* Section Accent */}

      <Box
        sx={{
          position: 'absolute',

          top: 0,
          left: 0,
          bottom: 0,

          width: 3,

          bgcolor: color,
        }}
      />

      <Stack
        direction="row"
        spacing={1}
        sx={{
          minHeight: 52,

          alignItems: 'center',

          px: {
            xs: 1.25,
            sm: 1.75,
          },

          py: 0.75,

          pl: {
            xs: 1.5,
            sm: 2,
          },
        }}
      >
        {/* ───────────────────────────────────── */}
        {/* Preview */}
        {/* ───────────────────────────────────── */}

        {previewMode ? (
          !isVisible && (
            <Tooltip title="این بخش مخفی است">
              <Box
                sx={{
                  width: 30,
                  height: 30,

                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',

                  color: 'text.disabled',
                }}
              >
                <VisibilityOffIcon
                  fontSize="small"
                />
              </Box>
            </Tooltip>
          )
        ) : (
          <SectionActions
            disabled={disabled}
            isFirst={isFirst}
            isLast={isLast}
            isVisible={isVisible}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            onToggleVisibility={
              onToggleVisibility
            }
            onEdit={onEdit}
            onDelete={onDelete}
          />
        )}

        {/* ───────────────────────────────────── */}
        {/* Section Information */}
        {/* ───────────────────────────────────── */}

        <Box
          sx={{
            flex: '1 1 auto',
            minWidth: 0,
            textAlign: 'left',
            direction: 'ltr',
          }}
        >
          <Stack spacing={0.25}>
            <Stack
              direction="row"
              spacing={0.75}
              sx={{
                minWidth: 0,
                alignItems: 'center',
              }}
            >
              <Typography
                component="h2"
                noWrap
                title={title}
                sx={{
                  minWidth: 0,

                  color: 'text.primary',

                  fontSize: {
                    xs: '0.82rem',
                    sm: '0.88rem',
                  },

                  fontWeight: 700,

                  lineHeight: 1.4,

                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {title}
              </Typography>

              {isSelected &&
                !previewMode && (
                  <Typography
                    component="span"
                    sx={{
                      flexShrink: 0,

                      color: 'primary.main',

                      fontSize: '0.62rem',

                      fontWeight: 600,
                    }}
                  >
                    انتخاب‌شده
                  </Typography>
                )}
            </Stack>

            <Stack
              direction="row"
              spacing={0.75}
              sx={{
                alignItems: 'center',
              }}
            >
              <Typography
                component="span"
                sx={{
                  color: 'text.secondary',

                  fontSize: '0.64rem',

                  lineHeight: 1.3,
                }}
              >
                {widgetCount === 0
                  ? 'بدون ویجت'
                  : `${widgetCount} ویجت`}
              </Typography>

              {!isVisible && (
                <>
                  <Box
                    component="span"
                    sx={{
                      width: 3,
                      height: 3,

                      borderRadius: '50%',

                      bgcolor:
                        'text.disabled',
                    }}
                  />

                  <Typography
                    component="span"
                    sx={{
                      color: 'text.secondary',

                      fontSize: '0.64rem',
                    }}
                  >
                    مخفی
                  </Typography>
                </>
              )}
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Box >
  );
}

// ═══════════════════════════════════════════════
// Section Actions
// ═══════════════════════════════════════════════

interface SectionActionsProps {
  disabled: boolean;
  isFirst: boolean;
  isLast: boolean;
  isVisible: boolean;

  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggleVisibility: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function SectionActions({
  disabled,
  isFirst,
  isLast,
  isVisible,

  onMoveUp,
  onMoveDown,
  onToggleVisibility,
  onEdit,
  onDelete,
}: SectionActionsProps) {
  const iconButtonSx = {
    width: 30,
    height: 30,

    borderRadius: 1.25,

    color: 'text.secondary',

    '&:hover': {
      color: 'primary.main',
      bgcolor: 'action.hover',
    },

    '&.Mui-disabled': {
      opacity: 0.35,
    },
  };

  return (
    <Stack
      direction="row"
      spacing={0.25}
      sx={{
        flexShrink: 0,
        alignItems: 'center',
        mr: 'auto',
      }}
    >
      {/* Visibility */}

      <Tooltip
        title={
          isVisible
            ? 'مخفی کردن بخش'
            : 'نمایش بخش'
        }
      >
        <span>
          <IconButton
            size="small"
            disabled={disabled}
            onClick={(event) => {
              event.stopPropagation();
              onToggleVisibility();
            }}
            aria-label={
              isVisible
                ? 'مخفی کردن بخش'
                : 'نمایش بخش'
            }
            sx={iconButtonSx}
          >
            {isVisible ? (
              <VisibilityIcon
                fontSize="small"
              />
            ) : (
              <VisibilityOffIcon
                fontSize="small"
              />
            )}
          </IconButton>
        </span>
      </Tooltip>

      {/* Edit */}

      <Tooltip title="ویرایش بخش">
        <span>
          <IconButton
            size="small"
            disabled={disabled}
            onClick={(event) => {
              event.stopPropagation();
              onEdit();
            }}
            aria-label="ویرایش بخش"
            sx={iconButtonSx}
          >
            <EditOutlinedIcon
              fontSize="small"
            />
          </IconButton>
        </span>
      </Tooltip>

      {/* Delete */}

      <Tooltip title="حذف بخش">
        <span>
          <IconButton
            size="small"
            disabled={disabled}
            onClick={(event) => {
              event.stopPropagation();
              onDelete();
            }}
            aria-label="حذف بخش"
            sx={{
              ...iconButtonSx,

              '&:hover': {
                color: 'error.main',

                bgcolor: (theme) =>
                  alpha(
                    theme.palette.error.main,
                    0.08,
                  ),
              },
            }}
          >
            <DeleteOutlinedIcon
              fontSize="small"
            />
          </IconButton>
        </span>
      </Tooltip>

      <Divider
        orientation="vertical"
        flexItem
        sx={{
          mx: 0.5,
          my: 0.5,
        }}
      />

      {/* Move Up */}

      <Tooltip title="انتقال بخش به بالا">
        <span>
          <IconButton
            size="small"
            disabled={
              disabled || isFirst
            }
            onClick={(event) => {
              event.stopPropagation();
              onMoveUp();
            }}
            aria-label="انتقال بخش به بالا"
            sx={iconButtonSx}
          >
            <ArrowUpwardIcon
              fontSize="small"
            />
          </IconButton>
        </span>
      </Tooltip>

      {/* Move Down */}

      <Tooltip title="انتقال بخش به پایین">
        <span>
          <IconButton
            size="small"
            disabled={
              disabled || isLast
            }
            onClick={(event) => {
              event.stopPropagation();
              onMoveDown();
            }}
            aria-label="انتقال بخش به پایین"
            sx={iconButtonSx}
          >
            <ArrowDownwardIcon
              fontSize="small"
            />
          </IconButton>
        </span>
      </Tooltip>
    </Stack>
  );
}