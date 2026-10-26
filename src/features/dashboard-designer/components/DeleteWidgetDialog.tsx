import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

interface DeleteWidgetDialogProps {
  open: boolean;
  widgetTitle?: string;
  isDeleting?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteWidgetDialog({
  open,
  widgetTitle,
  isDeleting = false,
  onCancel,
  onConfirm,
}: DeleteWidgetDialogProps) {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>حذف ویجت</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {widgetTitle
            ? `ویجت «${widgetTitle}» از این داشبورد حذف شود؟ این عملیات قابل بازگشت نیست.`
            : 'این ویجت از داشبورد حذف شود؟ این عملیات قابل بازگشت نیست.'}
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
