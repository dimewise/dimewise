import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, View } from 'react-native';
import {
  Text,
  Button,
  useTheme,
  Dialog,
  Portal,
  Appbar,
  FAB,
  IconButton
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { usePaymentMethods } from '../../../storage';
import { PaymentMethod } from '../../../storage';
import PaymentMethodBottomSheet from '../../../components/PaymentMethodBottomSheet';
import EditPaymentMethodBottomSheet from '../../../components/EditPaymentMethodBottomSheet';

const formatPaymentTypeForDisplay = (type: string, t: any): string => {
  const typeMap: Record<string, string> = {
    'credit_card': t('paymentMethods.creditCard'),
    'debit_card': t('paymentMethods.debitCard'),
    'cash': t('paymentMethods.cash'),
    'bank_transfer': t('paymentMethods.bankTransfer'),
    'digital_wallet': t('paymentMethods.digitalWallet'),
    'other': t('paymentMethods.other')
  };
  return typeMap[type] || type;
};

export default function PaymentMethodsScreen() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentMethodSheet, setShowPaymentMethodSheet] = useState(false);
  const [showEditPaymentMethodSheet, setShowEditPaymentMethodSheet] = useState(false);
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<PaymentMethod | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string, name: string } | null>(null);
  const theme = useTheme();
  const { t } = useTranslation();

  // Storage hooks
  const paymentMethodOps = usePaymentMethods();

  useEffect(() => {
    loadData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
      // Close all bottom sheets when navigating to this screen
      setShowPaymentMethodSheet(false);
      setShowEditPaymentMethodSheet(false);
    }, [])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const allPaymentMethods = await paymentMethodOps.getPaymentMethods();
      setPaymentMethods(allPaymentMethods);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentMethodAdded = () => {
    loadData();
  };

  const handlePaymentMethodUpdated = () => {
    loadData();
  };

  const handleDeletePaymentMethod = async (paymentMethodId: string) => {
    try {
      await paymentMethodOps.deletePaymentMethod(paymentMethodId);
      loadData();
    } catch (error) {
      console.error('Error deleting payment method:', error);
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      await handleDeletePaymentMethod(itemToDelete.id);
    } catch (error) {
      console.error('Error deleting item:', error);
    } finally {
      setShowDeleteDialog(false);
      setItemToDelete(null);
    }
  };

  const showDeleteConfirmation = (id: string, name: string) => {
    setItemToDelete({ id, name });
    setShowDeleteDialog(true);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={[]}>
      <Appbar.Header style={{ backgroundColor: theme.colors.background }}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={t('paymentMethods.title')} titleStyle={{ fontWeight: '700' }} />
      </Appbar.Header>

      <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
        {loading ? (
          <View style={{
            padding: 32,
            alignItems: 'center',
            backgroundColor: theme.colors.surface,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: theme.colors.outline,
          }}>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>{t('status.loading')}</Text>
          </View>
        ) : paymentMethods.length > 0 ? (
          paymentMethods.map((method) => (
            <View key={method.id} style={{
              marginVertical: 4,
              paddingVertical: 16,
              paddingHorizontal: 24,
              backgroundColor: theme.colors.surface,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: theme.colors.outline,
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 1,
            }}>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <View style={{ flex: 1 }}>
                  <Text variant="titleMedium" style={{ fontWeight: '600', marginBottom: 6, color: theme.colors.onSurface }}>{method.name}</Text>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, fontWeight: '500' }}>
                    {formatPaymentTypeForDisplay(method.type, t)}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <IconButton
                    icon="pencil"
                    size={24}
                    onPress={() => {
                      setEditingPaymentMethod(method);
                      setShowEditPaymentMethodSheet(true);
                    }}
                    iconColor={theme.colors.primary}
                    style={{
                      margin: 0,
                    }}
                  />
                  <IconButton
                    icon="delete"
                    size={24}
                    onPress={() => showDeleteConfirmation(method.id, method.name)}
                    iconColor={theme.colors.error}
                    style={{
                      margin: 0,
                    }}
                  />
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={{
            padding: 48,
            alignItems: 'center',
            backgroundColor: theme.colors.surface,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: theme.colors.outline,
          }}>
            <Text variant="titleLarge" style={{ textAlign: 'center', marginBottom: 16, fontWeight: '600', color: theme.colors.onSurface }}>
              {t('paymentMethods.noPaymentMethods')}
            </Text>
            <Text variant="bodyMedium" style={{
              textAlign: 'center',
              color: theme.colors.onSurfaceVariant,
              lineHeight: 24,
            }}>
              {t('paymentMethods.addToTrack')}
            </Text>
          </View>
        )}
      </ScrollView>

      <FAB
        icon="plus"
        label={t('paymentMethods.addPaymentMethod')}
        onPress={() => setShowPaymentMethodSheet(true)}
        style={{
          position: 'absolute',
          bottom: 16,
          right: 16,
        }}
      />

      <PaymentMethodBottomSheet
        visible={showPaymentMethodSheet}
        onDismiss={() => setShowPaymentMethodSheet(false)}
        onPaymentMethodAdded={handlePaymentMethodAdded}
      />

      <EditPaymentMethodBottomSheet
        visible={showEditPaymentMethodSheet}
        onDismiss={() => {
          setShowEditPaymentMethodSheet(false);
          setEditingPaymentMethod(null);
        }}
        paymentMethod={editingPaymentMethod}
        onPaymentMethodUpdated={handlePaymentMethodUpdated}
      />

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
            {t('actions.deleteConfirm')}
          </Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
              {t('actions.deleteConfirmMessage', { name: itemToDelete?.name })}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
              {t('actions.cannotUndo')}
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDeleteDialog(false)}>{t('actions.cancel')}</Button>
            <Button
              onPress={handleConfirmDelete}
              textColor={theme.colors.error}
            >
              {t('common.delete')}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
} 