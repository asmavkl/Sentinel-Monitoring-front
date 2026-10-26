import {
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import type { DashboardSectionDto } from '@/types/dashboard';
import { SECTION_COLOR_OPTIONS } from '../../utils/sectionDraft';

interface SectionEditorProps {
  section: DashboardSectionDto;
  onChange: (patch: Partial<DashboardSectionDto>) => void;
}

export function SectionEditor({ section, onChange }: SectionEditorProps) {
  return (
    <Stack spacing={2} data-testid="section-editor">
      <Typography variant="subtitle2" color="text.secondary">
        ویرایش بخش
      </Typography>
      <TextField
        label="عنوان"
        value={section.title}
        onChange={(event) => onChange({ title: event.target.value })}
        fullWidth
        required
        slotProps={{ htmlInput: { 'aria-label': 'عنوان بخش' } }}
      />
      <TextField
        label="توضیحات"
        value={section.description ?? ''}
        onChange={(event) => onChange({ description: event.target.value })}
        fullWidth
        multiline
        minRows={2}
        slotProps={{ htmlInput: { 'aria-label': 'توضیحات بخش' } }}
      />
      <FormControl fullWidth>
        <InputLabel id="edit-section-color-label">رنگ</InputLabel>
        <Select
          labelId="edit-section-color-label"
          label="رنگ"
          value={section.color ?? 'blue'}
          onChange={(event) => onChange({ color: String(event.target.value) })}
          inputProps={{ 'aria-label': 'رنگ بخش' }}
        >
          {SECTION_COLOR_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        label="ترتیب نمایش"
        type="number"
        value={section.displayOrder}
        onChange={(event) => onChange({ displayOrder: Number(event.target.value) || 0 })}
        fullWidth
        slotProps={{ htmlInput: { 'aria-label': 'ترتیب نمایش بخش' } }}
      />
      <FormControlLabel
        control={
          <Switch
            checked={section.isVisible}
            onChange={(event) => onChange({ isVisible: event.target.checked })}
          />
        }
        label={section.isVisible ? 'قابل نمایش' : 'مخفی'}
      />
    </Stack>
  );
}
