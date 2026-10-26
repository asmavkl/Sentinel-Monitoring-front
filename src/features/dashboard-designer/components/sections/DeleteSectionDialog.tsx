import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

interface DeleteSectionDialogProps {
  open: boolean;
  sectionTitle?: string;
  isDeleting?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteSectionDialog({
  open,
  sectionTitle,
  isDeleting = false,
  onCancel,
  onConfirm,
}: DeleteSectionDialogProps) {
  return (
    <Dialog open={open} onClose={onCancel} data-testid="delete-section-dialog">
      <DialogTitle>حذف بخش</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {sectionTitle
            ? `بخش «${sectionTitle}» و ویجت های داخل آن حذف شود؟ این عملیات قابل بازگشت نیست.`
            : 'این بخش و ویجت های داخل آن حذف شود؟ این عملیات قابل بازگشت نیست.'}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={isDeleting}>
          انصراف
        </Button>
        <Button color="error" variant="contained" onClick={onConfirm} disabled={isDeleting}>
          {isDeleting ? 'در حال حذف...' : 'حذف'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
