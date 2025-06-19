import React, { useEffect, useRef, useCallback, useState } from 'react';
import { Dimensions, View } from 'react-native';
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
import { useTranslation } from 'react-i18next';
import { Expense, Category, PaymentMethod, useExpenses, formatAmount } from '../storage';
import { useCurrency } from '../utils/UserSettingsContext';

interface ExpenseDetailBottomSheetProps {
  visible: boolean;
  expense: Expense | null;
  category?: Category;
  paymentMethod?: PaymentMethod;
  onDismiss: () => void;
  onEdit: (expense: Expense) => void;
  onDeleted: () => void;
  onExpenseUpdated?: () => void;
}

export default function ExpenseDetailBottomSheet({
  visible,
  expense,
  category,
  paymentMethod,
  onDismiss,
  onEdit,
  onDeleted,
  onExpenseUpdated
}: ExpenseDetailBottomSheetProps) {
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [updating, setUpdating] = useState(false);
  const theme = useTheme();
  const { t } = useTranslation();
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

  const handleToggleVerification = async () => {
    if (!expense) return;

    setUpdating(true);
    try {
      if (expense.isVerified) {
        await expenseOps.unverifyExpense(expense.id);
      } else {
        await expenseOps.verifyExpense(expense.id);
      }

      if (onExpenseUpdated) {
        await onExpenseUpdated();
      }
    } catch (error) {
      console.error('Error toggling verification:', error);
    } finally {
      setUpdating(false);
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
      maxDynamicContentSize={Dimensions.get('window').height * 0.85}
    >
      <BottomSheetScrollView contentContainerStyle={{ padding: 16 }}>
        <SafeAreaView edges={['bottom']} style={{ flex: 1 }}>
          <View style={{
            padding: 8,
            backgroundColor: theme.colors.surface,
          }}>
            {/* Expense Details */}
            <View style={{ gap: 24 }}>
              {/* Title */}
              <Text variant="titleLarge" style={{
                color: theme.colors.onSurface,
                fontWeight: '600'
              }}>
                {expense.title}
              </Text>

              {/* Description */}
              {expense.description && (
                <View>
                  <Text variant="labelLarge" style={{
                    color: theme.colors.onSurfaceVariant,
                    marginBottom: 8,
                    fontWeight: '600'
                  }}>
                    {t('forms.description')}
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
                  {t('forms.amount')}
                </Text>
                <Text variant="headlineSmall" style={{
                  color: theme.colors.primary,
                  fontWeight: '700'
                }}>
                  {formatAmountLocal(expense.amount)}
                </Text>
              </View>

              <Divider style={{ backgroundColor: theme.colors.outline }} />

              {/* Date */}
              <View>
                <Text variant="labelLarge" style={{
                  color: theme.colors.onSurfaceVariant,
                  marginBottom: 8,
                  fontWeight: '600'
                }}>
                  {t('expenses.date')}
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

              {/* Metadata */}
              <View>
                <Text variant="labelLarge" style={{
                  color: theme.colors.onSurfaceVariant,
                  marginBottom: 8,
                  fontWeight: '600'
                }}>
                  {t('expenses.categoryAndPaymentMethod')}
                </Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <View style={{
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    backgroundColor: theme.colors.primaryContainer,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: theme.colors.outline,
                    alignSelf: 'flex-start'
                  }}>
                    <Text variant="bodySmall" style={{
                      color: theme.colors.onPrimaryContainer,
                      fontWeight: '600'
                    }}>
                      {category?.name || t('common.unknown')}
                    </Text>
                  </View>
                  {paymentMethod && (
                    <View style={{
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      backgroundColor: theme.colors.surfaceVariant,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: theme.colors.outline,
                      alignSelf: 'flex-start'
                    }}>
                      <Text variant="bodySmall" style={{
                        color: theme.colors.onSurfaceVariant,
                        fontWeight: '600'
                      }}>
                        {paymentMethod.name}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Verification Status */}
              <View>
                <Text variant="labelLarge" style={{
                  color: theme.colors.onSurfaceVariant,
                  marginBottom: 8,
                  fontWeight: '600'
                }}>
                  {t('expenses.verificationStatus')}
                </Text>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  backgroundColor: expense.isVerified ? theme.colors.primaryContainer : theme.colors.surfaceVariant,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: theme.colors.outline,
                }}>
                  <View style={{ flex: 1 }}>
                    <Text variant="titleMedium" style={{
                      color: expense.isVerified ? theme.colors.onPrimaryContainer : theme.colors.onSurfaceVariant,
                      fontWeight: '600',
                      marginBottom: 4
                    }}>
                      {expense.isVerified ? t('status.verified') : t('status.unverified')}
                    </Text>
                    {expense.isVerified && expense.verifiedAt && (
                      <Text variant="bodySmall" style={{
                        color: expense.isVerified ? theme.colors.onPrimaryContainer : theme.colors.onSurfaceVariant,
                        opacity: 0.8
                      }}>
                        {t('status.verifiedOn', {
                          date: new Date(expense.verifiedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        })}
                      </Text>
                    )}
                  </View>
                  <Button
                    mode={expense.isVerified ? "outlined" : "contained"}
                    onPress={handleToggleVerification}
                    loading={updating}
                    disabled={updating}
                    contentStyle={{ paddingVertical: 4, paddingHorizontal: 12 }}
                    labelStyle={{ fontSize: 14, fontWeight: '600' }}
                    style={{
                      borderRadius: 6,
                      ...(expense.isVerified ? {
                        borderColor: theme.colors.onPrimaryContainer
                      } : {})
                    }}
                    textColor={expense.isVerified ? theme.colors.onPrimaryContainer : undefined}
                  >
                    {expense.isVerified ? t('actions.unverify') : t('actions.verify')}
                  </Button>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={{
                flexDirection: 'row',
                gap: 16,
                marginTop: 16,
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
                  {t('common.delete')}
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
                  {t('common.edit')}
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
            {t('expenses.deleteExpense')}
          </Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, marginBottom: 16 }}>
              {t('actions.deleteConfirmMessage', { name: expense?.title })}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>
              {t('forms.amount')}: {expense ? formatAmountLocal(expense.amount) : ''}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 16 }}>
              {t('expenses.date')}: {expense ? new Date(expense.date).toLocaleDateString() : ''}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {t('actions.cannotUndo')}
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => setShowDeleteDialog(false)}
              contentStyle={{ paddingVertical: 4 }}
            >
              {t('actions.cancel')}
            </Button>
            <Button
              onPress={handleConfirmDelete}
              textColor={theme.colors.error}
              loading={deleting}
              disabled={deleting}
              contentStyle={{ paddingVertical: 4 }}
            >
              {t('common.delete')}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </BottomSheetModal>
  );
} 