import React, { useEffect, useRef, useCallback, useState } from 'react';
import { View } from 'react-native';
import {
  Text,
  Button,
  useTheme,
  Divider,
  IconButton,
  Dialog,
  Portal
} from 'react-native-paper';
import { BottomSheetModal, BottomSheetView, BottomSheetScrollView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Expense, Category, PaymentMethod, useExpenses, formatAmount } from '../storage';
import { useCurrency } from '../utils/CurrencyContext';

interface ExpenseDetailBottomSheetProps {
  visible: boolean;
  expense: Expense | null;
  category?: Category;
  paymentMethod?: PaymentMethod;
  onDismiss: () => void;
  onEdit: (expense: Expense) => void;
  onDeleted: () => void;
}

export default function ExpenseDetailBottomSheet({
  visible,
  expense,
  category,
  paymentMethod,
  onDismiss,
  onEdit,
  onDeleted
}: ExpenseDetailBottomSheetProps) {
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const theme = useTheme();
  const { currency } = useCurrency();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const expenseOps = useExpenses();

  useEffect(() => {
    if (visible && expense) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [visible, expense]);

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      onDismiss();
    }
  }, [onDismiss]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        onPress={onDismiss}
      />
    ),
    [onDismiss]
  );

  const formatAmountLocal = (amount: number) => {
    return formatAmount(amount, currency);
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!expense) return;

    setDeleting(true);
    setShowDeleteDialog(false);

    try {
      await expenseOps.deleteExpense(expense.id);
      onDismiss();
      onDeleted();
    } catch (error) {
      console.error('Error deleting expense:', error);
      // Could add error toast here if needed
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = () => {
    if (expense) {
      onEdit(expense);
    }
  };

  if (!expense) return null;

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      onChange={handleSheetChanges}
      enablePanDownToClose
      enableDynamicSizing
      backgroundStyle={{ backgroundColor: theme.colors.surface }}
      handleIndicatorStyle={{ backgroundColor: theme.colors.onSurfaceVariant }}
      backdropComponent={renderBackdrop}
    >
      <BottomSheetScrollView contentContainerStyle={{ padding: 16 }}>
        <SafeAreaView edges={['bottom']} style={{ flex: 1 }}>
          <View style={{
            padding: 8,
            backgroundColor: theme.colors.surface,
          }}>
            {/* Header */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 32
            }}>
              <Text variant="headlineMedium" style={{
                fontWeight: '700',
                color: theme.colors.onSurface,
                flex: 1
              }}>
                Expense Details
              </Text>
            </View>

            {/* Expense Details */}
            <View style={{ gap: 24 }}>
              {/* Title */}
              <View>
                <Text variant="labelLarge" style={{
                  color: theme.colors.onSurfaceVariant,
                  marginBottom: 8,
                  fontWeight: '600'
                }}>
                  Title
                </Text>
                <Text variant="titleLarge" style={{
                  color: theme.colors.onSurface,
                  fontWeight: '600'
                }}>
                  {expense.title}
                </Text>
              </View>

              {/* Description */}
              {expense.description && (
                <View>
                  <Text variant="labelLarge" style={{
                    color: theme.colors.onSurfaceVariant,
                    marginBottom: 8,
                    fontWeight: '600'
                  }}>
                    Description
                  </Text>
                  <Text variant="bodyLarge" style={{
                    color: theme.colors.onSurface,
                    lineHeight: 24
                  }}>
                    {expense.description}
                  </Text>
                </View>
              )}

              {/* Amount */}
              <View>
                <Text variant="labelLarge" style={{
                  color: theme.colors.onSurfaceVariant,
                  marginBottom: 8,
                  fontWeight: '600'
                }}>
                  Amount
                </Text>
                <Text variant="headlineSmall" style={{
                  color: theme.colors.primary,
                  fontWeight: '700'
                }}>
                  {formatAmountLocal(expense.amount)}
                </Text>
              </View>

              <Divider style={{ backgroundColor: theme.colors.outline }} />

              {/* Category */}
              <View>
                <Text variant="labelLarge" style={{
                  color: theme.colors.onSurfaceVariant,
                  marginBottom: 8,
                  fontWeight: '600'
                }}>
                  Category
                </Text>
                <View style={{
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  backgroundColor: theme.colors.primaryContainer,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: theme.colors.outline,
                  alignSelf: 'flex-start'
                }}>
                  <Text variant="titleMedium" style={{
                    color: theme.colors.onPrimaryContainer,
                    fontWeight: '600'
                  }}>
                    {category?.name || 'Unknown'}
                  </Text>
                </View>
              </View>

              {/* Payment Method */}
              {paymentMethod && (
                <View>
                  <Text variant="labelLarge" style={{
                    color: theme.colors.onSurfaceVariant,
                    marginBottom: 8,
                    fontWeight: '600'
                  }}>
                    Payment Method
                  </Text>
                  <View style={{
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    backgroundColor: theme.colors.surfaceVariant,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: theme.colors.outline,
                    alignSelf: 'flex-start'
                  }}>
                    <Text variant="titleMedium" style={{
                      color: theme.colors.onSurfaceVariant,
                      fontWeight: '600'
                    }}>
                      {paymentMethod.name}
                    </Text>
                  </View>
                </View>
              )}

              {/* Date */}
              <View>
                <Text variant="labelLarge" style={{
                  color: theme.colors.onSurfaceVariant,
                  marginBottom: 8,
                  fontWeight: '600'
                }}>
                  Date
                </Text>
                <Text variant="titleMedium" style={{
                  color: theme.colors.onSurface,
                  fontWeight: '600'
                }}>
                  {new Date(expense.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
              </View>

              {/* Action Buttons */}
              <View style={{
                flexDirection: 'row',
                gap: 16,
                marginTop: 32,
                paddingTop: 16,
                borderTopWidth: 1,
                borderTopColor: theme.colors.outline
              }}>
                <Button
                  mode="outlined"
                  onPress={handleDelete}
                  loading={deleting}
                  disabled={deleting}
                  contentStyle={{
                    paddingVertical: 4,
                  }}
                  labelStyle={{
                    fontSize: 16,
                    fontWeight: '600',
                    letterSpacing: 0.25
                  }}
                  style={{
                    flex: 1,
                    borderRadius: 6,
                    borderColor: theme.colors.error
                  }}
                  textColor={theme.colors.error}
                >
                  Delete
                </Button>
                <Button
                  mode="contained"
                  onPress={handleEdit}
                  contentStyle={{
                    paddingVertical: 4,
                  }}
                  labelStyle={{
                    fontSize: 16,
                    fontWeight: '600',
                    letterSpacing: 0.25
                  }}
                  style={{
                    flex: 1,
                    borderRadius: 6,
                    shadowColor: '#000000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  Edit
                </Button>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </BottomSheetScrollView>

      <Portal>
        <Dialog
          visible={showDeleteDialog}
          onDismiss={() => setShowDeleteDialog(false)}
          style={{
            backgroundColor: theme.colors.surface,
            borderRadius: 8,
          }}
        >
          <Dialog.Title style={{ color: theme.colors.onSurface }}>
            Delete Expense
          </Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, marginBottom: 16 }}>
              Are you sure you want to delete "{expense?.title}"?
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>
              Amount: {expense ? formatAmountLocal(expense.amount) : ''}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 16 }}>
              Date: {expense ? new Date(expense.date).toLocaleDateString() : ''}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              This action cannot be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => setShowDeleteDialog(false)}
              contentStyle={{ paddingVertical: 4 }}
            >
              Cancel
            </Button>
            <Button
              onPress={handleConfirmDelete}
              textColor={theme.colors.error}
              loading={deleting}
              disabled={deleting}
              contentStyle={{ paddingVertical: 4 }}
            >
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </BottomSheetModal>
  );
} 