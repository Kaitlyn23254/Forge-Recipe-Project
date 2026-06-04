import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

export default function DeleteConfirmDialog({ open, onCancel, onConfirm }) {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>Delete Recipe</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete this recipe? This cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button onClick={onConfirm} className="delete-confirm-dialog__confirm-btn">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
