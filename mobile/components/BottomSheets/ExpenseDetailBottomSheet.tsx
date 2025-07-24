import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, View } from 'react-native';
import { Button, Dialog, Divider, Portal, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  softDeleteExpenseById,
  unverifyExpenseById,
  verifyExpenseById,
} from '../../db/mutation/expense';
import { getExpenseFullById } from '../../db/repository/expense';
import type { ExpenseFull } from '../../db/repository/types';
import type { Expense } from '../../db/schema';
import { formatAmount } from '../../db/utils';
import { formatDateWithLocale } from '../../utils/datetime';
import { useRefreshKey } from '../contexts/RefreshKeyContext';
import { useUser } from '../contexts/UserContext';

interface ExpenseDetailBottomSheetProps {
  visible: boolean;
  expenseId: string | null;
  onDismiss: () => void;
  onEdit: (expense: Expense) => void;
  onDeleted: () => void;
}

export default function ExpenseDetailBottomSheet({
  visible,
  expenseId,
  onDismiss,
  onEdit,
  onDeleted,
}: ExpenseDetailBottomSheetProps) {
  const [targetExpense, setTargetExpense] = useState<ExpenseFull | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [updating, setUpdating] = useState(false);
  const theme = useTheme();
  const { t } = useTranslation();
  const { userSetting } = useUser();
  const { refreshKeys, triggerRefresh } = useRefreshKey();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: refreshKeys are intentionally used to trigger re-fetching
  useEffect(() => {
    if (!expenseId) {
      setTargetExpense(null);
      return;
    }

    const expense = getExpenseFullById(expenseId);
    setTargetExpense(expense);
  }, [expenseId, refreshKeys.expenses]);

  useEffect(() => {
    if (visible && expenseId && targetExpense) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [visible, expenseId, targetExpense]);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onDismiss();
      }
    },
    [onDismiss],
  );

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        onPress={onDismiss}
      />
    ),
    [onDismiss],
  );

  const formatAmountLocal = (amount: number) => {
    return formatAmount(amount, userSetting?.currency ?? 'USD');
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!expenseId || !targetExpense) return;

    setDeleting(true);
    setShowDeleteDialog(false);

    try {
      await softDeleteExpenseById(targetExpense.id);
      onDismiss();
      onDeleted();
      triggerRefresh('expenses');
    } catch (error) {
      console.error('Error deleting expense:', error);
      // Could add error toast here if needed
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = () => {
    if (targetExpense) {
      onEdit(targetExpense);
    }
  };

  const handleToggleVerification = async () => {
    if (!targetExpense) return;

    setUpdating(true);
    try {
      if (targetExpense.verifiedAt) {
        await unverifyExpenseById(targetExpense.id);
      } else {
        await verifyExpenseById(targetExpense.id);
      }

      triggerRefresh('expenses');
    } catch (error) {
      console.error('Error toggling verification:', error);
    } finally {
      setUpdating(false);
    }
  };

  if (!expenseId || !targetExpense) {
    return null;
  }

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
      maxDynamicContentSize={Dimensions.get('window').height * 0.9}
      enableContentPanningGesture
    >
      <BottomSheetScrollView
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <SafeAreaView
          edges={['bottom']}
          style={{ flex: 1 }}
        >
          <View
            style={{
              padding: 8,
              backgroundColor: theme.colors.surface,
            }}
          >
            {/* Expense Details */}
            <View style={{ gap: 24 }}>
              {/* Title */}
              <Text
                variant="titleLarge"
                style={{
                  color: theme.colors.onSurface,
                  fontWeight: '600',
                }}
              >
                {targetExpense.title}
              </Text>

              {/* Description */}
              {targetExpense.description && (
                <View>
                  <Text
                    variant="labelLarge"
                    style={{
                      color: theme.colors.onSurfaceVariant,
                      marginBottom: 8,
                      fontWeight: '600',
                    }}
                  >
                    {t('forms.description')}
                  </Text>
                  <Text
                    variant="bodyLarge"
                    style={{
                      color: theme.colors.onSurface,
                      lineHeight: 24,
                    }}
                  >
                    {targetExpense.description}
                  </Text>
                </View>
              )}

              {/* Amount */}
              <View>
                <Text
                  variant="labelLarge"
                  style={{
                    color: theme.colors.onSurfaceVariant,
                    marginBottom: 8,
                    fontWeight: '600',
                  }}
                >
                  {t('forms.amount')}
                </Text>
                <Text
                  variant="headlineSmall"
                  style={{
                    color: theme.colors.primary,
                    fontWeight: '700',
                  }}
                >
                  {formatAmountLocal(targetExpense.amount)}
                </Text>
              </View>

              <Divider style={{ backgroundColor: theme.colors.outline }} />

              {/* Date */}
              <View>
                <Text
                  variant="labelLarge"
                  style={{
                    color: theme.colors.onSurfaceVariant,
                    marginBottom: 8,
                    fontWeight: '600',
                  }}
                >
                  {t('expenses.date')}
                </Text>
                <Text
                  variant="titleMedium"
                  style={{
                    color: theme.colors.onSurface,
                    fontWeight: '600',
                  }}
                >
                  {formatDateWithLocale(
                    new Date(targetExpense.incurredAt),
                    userSetting?.preferredLanguage || 'en',
                  )}
                </Text>
              </View>

              {/* Metadata */}
              <View>
                <Text
                  variant="labelLarge"
                  style={{
                    color: theme.colors.onSurfaceVariant,
                    marginBottom: 8,
                    fontWeight: '600',
                  }}
                >
                  {t('expenses.categoryAndPaymentMethod')}
                </Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <View
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      backgroundColor: theme.colors.primaryContainer,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: theme.colors.outline,
                      alignSelf: 'flex-start',
                    }}
                  >
                    <Text
                      variant="bodySmall"
                      style={{
                        color: theme.colors.onPrimaryContainer,
                        fontWeight: '600',
                      }}
                    >
                      {targetExpense.category?.name || t('common.unknown')}
                    </Text>
                  </View>
                  {targetExpense.paymentMethod?.name && (
                    <View
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        backgroundColor: theme.colors.surfaceVariant,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: theme.colors.outline,
                        alignSelf: 'flex-start',
                      }}
                    >
                      <Text
                        variant="bodySmall"
                        style={{
                          color: theme.colors.onSurfaceVariant,
                          fontWeight: '600',
                        }}
                      >
                        {targetExpense.paymentMethod.name}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Verification Status */}
              <View>
                <Text
                  variant="labelLarge"
                  style={{
                    color: theme.colors.onSurfaceVariant,
                    marginBottom: 8,
                    fontWeight: '600',
                  }}
                >
                  {t('expenses.verificationStatus')}
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    backgroundColor: targetExpense.verifiedAt
                      ? theme.colors.primaryContainer
                      : theme.colors.surfaceVariant,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: theme.colors.outline,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      variant="titleMedium"
                      style={{
                        color: targetExpense.verifiedAt
                          ? theme.colors.onPrimaryContainer
                          : theme.colors.onSurfaceVariant,
                        fontWeight: '600',
                        marginBottom: 4,
                      }}
                    >
                      {targetExpense.verifiedAt ? t('status.verified') : t('status.unverified')}
                    </Text>
                    {targetExpense.verifiedAt && (
                      <Text
                        variant="bodySmall"
                        style={{
                          color: targetExpense.verifiedAt
                            ? theme.colors.onPrimaryContainer
                            : theme.colors.onSurfaceVariant,
                          opacity: 0.8,
                        }}
                      >
                        {t('status.verifiedOn', {
                          date: formatDateWithLocale(
                            new Date(targetExpense.verifiedAt),
                            userSetting?.preferredLanguage || 'en',
                          ),
                        })}
                      </Text>
                    )}
                  </View>
                  <Button
                    mode={targetExpense.verifiedAt ? 'outlined' : 'contained'}
                    onPress={handleToggleVerification}
                    loading={updating}
                    disabled={updating}
                    contentStyle={{ paddingVertical: 4, paddingHorizontal: 12 }}
                    labelStyle={{ fontSize: 14, fontWeight: '600' }}
                    style={{
                      borderRadius: 6,
                      ...(targetExpense.verifiedAt
                        ? {
                            borderColor: theme.colors.onPrimaryContainer,
                          }
                        : {}),
                    }}
                    textColor={
                      targetExpense.verifiedAt ? theme.colors.onPrimaryContainer : undefined
                    }
                  >
                    {targetExpense.verifiedAt ? t('actions.unverify') : t('actions.verify')}
                  </Button>
                </View>
              </View>

              {/* Action Buttons */}
              <View
                style={{
                  flexDirection: 'row',
                  gap: 16,
                  marginTop: 16,
                  paddingTop: 16,
                  borderTopWidth: 1,
                  borderTopColor: theme.colors.outline,
                }}
              >
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
                    letterSpacing: 0.25,
                  }}
                  style={{
                    flex: 1,
                    borderRadius: 6,
                    borderColor: theme.colors.error,
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
                    letterSpacing: 0.25,
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
            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.onSurface, marginBottom: 16 }}
            >
              {t('actions.deleteConfirmMessage', { name: targetExpense.title })}
            </Text>
            <Text
              variant="bodySmall"
              style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}
            >
              {t('forms.amount')}: {targetExpense ? formatAmountLocal(targetExpense.amount) : ''}
            </Text>
            <Text
              variant="bodySmall"
              style={{ color: theme.colors.onSurfaceVariant, marginBottom: 16 }}
            >
              {t('expenses.date')}:{' '}
              {targetExpense ? new Date(targetExpense.createdAt).toLocaleDateString() : ''}
            </Text>
            <Text
              variant="bodySmall"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
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
