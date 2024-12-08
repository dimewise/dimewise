import { Alert, Slide, Snackbar } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store";
import { hideToast } from "../store/toastSlice";

export const Toast = () => {
  const dispatch = useDispatch();
  const { message, type, open } = useSelector((state: RootState) => state.toast);

  const handleClose = () => {
    dispatch(hideToast());
  };

  return (
    <Snackbar
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      onClose={handleClose}
      open={open}
      autoHideDuration={1500}
      TransitionComponent={Slide}
    >
      <Alert
        onClose={handleClose}
        severity={type}
        sx={{ width: "100%" }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};
