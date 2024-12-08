import { DeleteOutlined, EditOutlined } from "@mui/icons-material";
import { Box, Button, Stack, Typography } from "@mui/material";
import { DateTime } from "luxon";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { type Expense, useApiV1ExpenseExpenseIdDeleteExpenseMutation } from "../../services/api/v1";
import { DesktopDialog } from "../DesktopDialog";
import { MobileDrawer } from "../MobileDrawer";
import { TransactionForm } from "./TransactionForm";
import { TransactionDetailsEnum } from "./type";

interface Props {
  open: boolean;
  transaction: Expense;
  handleClose: () => void;
}

export const TransactionDetails = ({ open, transaction, handleClose }: Props) => {
  const { t } = useTranslation();
  const [detailsType, setDetailsType] = useState<TransactionDetailsEnum>(TransactionDetailsEnum.view);

  const title = useMemo(() => {
    return detailsType === TransactionDetailsEnum.view
      ? transaction.title
      : detailsType === TransactionDetailsEnum.edit
        ? t("transactions.edit.title")
        : t("transactions.delete.confirmation-title");
  }, [detailsType, transaction, t]);

  const handleResetOnClose = () => {
    handleClose();

    // set timeout needed to prevent modal flickering
    setTimeout(() => {
      setDetailsType(TransactionDetailsEnum.view);
    }, 500);
  };

  return (
    <>
      <MobileDrawer
        title={title}
        open={open}
        handleClose={handleResetOnClose}
      >
        <TransactionContent
          detailsType={detailsType}
          setDetailsType={setDetailsType}
          transaction={transaction}
          handleCloseModal={handleResetOnClose}
        />
      </MobileDrawer>
      <DesktopDialog
        title={title}
        open={open}
        handleClose={handleResetOnClose}
      >
        <TransactionContent
          detailsType={detailsType}
          setDetailsType={setDetailsType}
          transaction={transaction}
          handleCloseModal={handleResetOnClose}
        />
      </DesktopDialog>
    </>
  );
};

interface TransactionContentProps {
  detailsType: TransactionDetailsEnum;
  setDetailsType: (detailsType: TransactionDetailsEnum) => void;
  transaction: Expense;
  handleCloseModal: () => void;
}

const TransactionContent = ({
  detailsType,
  setDetailsType,
  transaction,
  handleCloseModal,
}: TransactionContentProps) => {
  const { t } = useTranslation();
  const [deleteExpenseById] = useApiV1ExpenseExpenseIdDeleteExpenseMutation();

  const date = DateTime.fromISO(transaction.date).toFormat("MMM d, yyyy");
  const currency = "JPY";
  const transactionAmountStr = `${currency} ${transaction.amount}`;

  // Edit
  const handleOnClickEdit = () => {
    setDetailsType(TransactionDetailsEnum.edit);
  };
  const handleOnClickEditCancel = () => {
    setDetailsType(TransactionDetailsEnum.view);
  };
  const handleOnClickEditSave = () => {
    // add clean up code here to close
    setDetailsType(TransactionDetailsEnum.view);
  };

  // Delete
  const handleOnClickDelete = () => {
    setDetailsType(TransactionDetailsEnum.delete);
  };
  const handleOnClickDeleteCancel = () => {
    setDetailsType(TransactionDetailsEnum.view);
  };
  const handleOnClickDeleteConfirm = () => {
    deleteExpenseById({
      expenseId: transaction.id,
    })
      .unwrap()
      .then(() => {
        handleCloseModal();
        // TODO: Add toast for success message
      })
      .catch((err) => {
        console.error(err);
        // TODO: Add toast for error message
      });
  };

  return (
    <Stack
      direction="column"
      gap={1}
    >
      {detailsType === TransactionDetailsEnum.view && (
        <>
          <Typography sx={{ fontSize: 16, fontWeight: "bold" }}>{t("transactions.details.description")}</Typography>
          <Typography>{transaction.description}</Typography>
          <Typography sx={{ fontSize: 16, fontWeight: "bold" }}>{t("transactions.details.amount")}</Typography>
          <Typography>{transactionAmountStr}</Typography>
          <Typography sx={{ fontSize: 16, fontWeight: "bold" }}>
            {t("transactions.details.date-of-transaction")}
          </Typography>
          <Typography>{date}</Typography>
          <Typography sx={{ fontSize: 16, fontWeight: "bold" }}>{t("transactions.details.category")}</Typography>
          <Typography>{transaction.category.name}</Typography>
          <Box
            sx={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: { sm: "space-between", md: "end" },
              gap: 1,
            }}
          >
            <Button
              sx={{
                textTransform: "none",
                width: {
                  xs: "100%",
                  md: "fit-content",
                },
              }}
              variant="contained"
              color="error"
              startIcon={<DeleteOutlined />}
              onClick={handleOnClickDelete}
            >
              {t("common.button.delete")}
            </Button>
            <Button
              sx={{
                textTransform: "none",
                width: {
                  xs: "100%",
                  md: "fit-content",
                },
              }}
              variant="contained"
              color="primary"
              startIcon={<EditOutlined />}
              onClick={handleOnClickEdit}
            >
              {t("common.button.edit")}
            </Button>
          </Box>
        </>
      )}
      {detailsType === TransactionDetailsEnum.edit && (
        <TransactionForm
          transaction={transaction}
          handleSubmit={handleOnClickEditSave}
          handleClose={handleOnClickEditCancel}
        />
      )}
      {detailsType === TransactionDetailsEnum.delete && (
        <>
          <Typography>{t("transactions.delete.confirmation-body")}</Typography>
          <Box
            sx={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: { sm: "space-between", md: "end" },
              gap: 1,
            }}
          >
            <Button
              sx={{
                textTransform: "none",
                width: {
                  xs: "100%",
                  md: "fit-content",
                },
              }}
              variant="contained"
              color="secondary"
              onClick={handleOnClickDeleteCancel}
            >
              {t("common.button.cancel")}
            </Button>
            <Button
              sx={{
                textTransform: "none",
                width: {
                  xs: "100%",
                  md: "fit-content",
                },
              }}
              variant="contained"
              color="error"
              onClick={handleOnClickDeleteConfirm}
            >
              {t("common.button.confirm")}
            </Button>
          </Box>
        </>
      )}
    </Stack>
  );
};
