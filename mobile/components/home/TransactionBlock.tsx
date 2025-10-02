import { DateTime } from 'luxon';
import type React from 'react';
import { Text, View } from 'react-native';
import type { ExpenseWithDetails } from '@/generated/api/api';

type Props = { items: ExpenseWithDetails[] };

export const TransactionBlock: React.FC<Props> = ({ items }) => (
  <View style={{ paddingHorizontal: 16, marginBottom: 32 }}>
    <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>Recent transactions</Text>

    {items.map((t) => (
      <View
        key={t.id}
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#fff',
          borderRadius: 8,
          padding: 12,
          marginBottom: 8,
          elevation: 1,
          shadowColor: '#000',
          shadowOpacity: 0.05,
          shadowRadius: 2,
          shadowOffset: { width: 0, height: 1 },
        }}
      >
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={{ fontSize: 15, fontWeight: '500' }}>{t.title}</Text>
          <Text style={{ fontSize: 12, color: '#6b7280' }}>
            {DateTime.fromISO(t.incurred_at).toLocaleString(DateTime.DATE_MED)} · {t.category.title}{' '}
            · {t.payment_method.title}
          </Text>
        </View>

        <Text
          style={{
            fontSize: 15,
            fontWeight: '600',
            color: '#ef4444', // expenses are outflow → red
          }}
        >
          {(t.amount / 100).toLocaleString('en-US', {
            style: 'currency',
            currency: t.currency,
          })}
        </Text>
      </View>
    ))}
  </View>
);
