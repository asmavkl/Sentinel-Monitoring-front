import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { SECTION_COLOR_OPTIONS } from '../../utils/sectionDraft';

export interface SectionFormValues {
  title: string;
  description: string;
  color: string;
  displayOrder: number;
  isVisible: boolean;
}

interface CreateSectionDialogProps {
  open: boolean;
  defaultDisplayOrder?: number;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (values: SectionFormValues) => void;
}

const EMPTY_FORM: SectionFormValues = {
  title: '',
  description: '',
  color: 'blue',
  displayOrder: 0,
  isVisible: true,
};

export function CreateSectionDialog({
  open,
  defaultDisplayOrder = 0,
  isSubmitting = false,
  onClose,
  onSubmit,
}: CreateSectionDialogProps) {
  const [values, setValues] = useState<SectionFormValues>(EMPTY_FORM);
  const [titleError, setTitleError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setTitleError(null);
    setValues({
      ...EMPTY_FORM,
      displayOrder: defaultDisplayOrder,
    });
  }, [open, defaultDisplayOrder]);

  const handleSubmit = () => {
    if (!values.title.trim()) {
      setTitleError('عنوان بخش الزامی است');
      return;
    }

    onSubmit({
      ...values,
      title: values.title.trim(),
      description: values.description.trim(),
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" data-testid="create-section-dialog">
      <DialogTitle>افزودن بخش</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="عنوان"
            value={values.title}
            onChange={(event) => setValues((current) => ({ ...current, title: event.target.value }))}
            error={Boolean(titleError)}
            helperText={titleError}
            required
            fullWidth
            slotProps={{ htmlInput: { 'aria-label': 'عنوان بخش' } }}
          />
          <TextField
            label="توضیحات"
            value={values.description}
            onChange={(event) =>
              setValues((current) => ({ ...current, description: event.target.value }))
            }
            fullWidth
            multiline
            minRows={2}
            slotProps={{ htmlInput: { 'aria-label': 'توضیحات بخش' } }}
          />
          <FormControl fullWidth>
            <InputLabel id="section-color-label">رنگ</InputLabel>
            <Select
              labelId="section-color-label"
              label="رنگ"
              value={values.color}
              onChange={(event) =>
                setValues((current) => ({ ...current, color: String(event.target.value) }))
              }
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
            value={values.displayOrder}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                displayOrder: Number(event.target.value) || 0,
              }))
            }
            fullWidth
            slotProps={{ htmlInput: { 'aria-label': 'ترتیب نمایش بخش' } }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={values.isVisible}
                onChange={(event) =>
                  setValues((current) => ({ ...current, isVisible: event.target.checked }))
                }
              />
            }
            label={values.isVisible ? 'قابل نمایش' : 'مخفی'}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          انصراف
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'در حال ایجاد...' : 'ایجاد بخش'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
