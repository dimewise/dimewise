import type React from 'react';
import { Text, View } from 'react-native';
import type { PaymentMethodBreakdown } from '@/generated/api/api';

type Props = { items: PaymentMethodBreakdown[] };

export const PaymentBlock: React.FC<Props> = ({ items }) => (
  <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
    <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>Payment methods</Text>

    {items.map((p) => (
      <View
        key={p.payment_method_id}
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
        <Text style={{ fontSize: 15, fontWeight: '500' }}>{p.payment_method_title}</Text>

        <Text style={{ fontSize: 14, color: '#555' }}>
          {(p.total_spent / 100).toLocaleString('en-US', {
            style: 'currency',
            currency: p.currency,
          })}
        </Text>
      </View>
    ))}
  </View>
);
