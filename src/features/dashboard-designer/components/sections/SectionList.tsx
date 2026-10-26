import AddIcon from '@mui/icons-material/Add';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { Box, Button, List, ListItemButton, ListItemText, Stack, Typography } from '@mui/material';
import type { DashboardSectionDto } from '@/types/dashboard';
import { resolveSectionColor } from '../../utils/sectionDraft';

interface SectionListProps {
  sections: DashboardSectionDto[];
  selectedSectionId: number | null;
  disabled?: boolean;
  onSelect: (sectionId: number) => void;
  onAddSection: () => void;
}

export function SectionList({
  sections,
  selectedSectionId,
  disabled = false,
  onSelect,
  onAddSection,
}: SectionListProps) {
  const sorted = [...sections].sort((left, right) => left.displayOrder - right.displayOrder);

  return (
    <Stack spacing={1} data-testid="section-list">
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="subtitle2">بخش ها</Typography>
        <Button
          size="small"
          startIcon={<AddIcon />}
          disabled={disabled}
          onClick={onAddSection}
          aria-label="افزودن بخش"
        >
          افزودن بخش
        </Button>
      </Stack>

      {sorted.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          هنوز بخشی تعریف نشده است.
        </Typography>
      ) : (
        <List dense disablePadding>
          {sorted.map((section) => (
            <ListItemButton
              key={section.id}
              selected={selectedSectionId === section.id}
              disabled={disabled}
              onClick={() => onSelect(section.id)}
              sx={{ borderRadius: 1, mb: 0.5 }}
            >
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  bgcolor: resolveSectionColor(section.color),
                  mr: 1,
                  flexShrink: 0,
                }}
              />
              <ListItemText
                primary={section.title}
                secondary={`${section.widgets.length} ویجت`}
                slotProps={{
                  primary: { noWrap: true, variant: 'body2' },
                  secondary: { variant: 'caption' },
                }}
              />
              {!section.isVisible ? <VisibilityOffIcon fontSize="small" color="disabled" /> : null}
            </ListItemButton>
          ))}
        </List>
      )}
    </Stack>
  );
}
