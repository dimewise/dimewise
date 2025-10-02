import type React from 'react';
import { Text, View } from 'react-native';
import type { CategoryBreakdown } from '@/generated/api/api';

type Props = { items: CategoryBreakdown[] };
export const CategoryBlock: React.FC<Props> = ({ items }) => (
  <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
    <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>Categories</Text>
    {items.map((c) => (
      <View
        key={c.category_id}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 10,
          backgroundColor: '#fff',
          borderRadius: 8,
          padding: 12,
          elevation: 1,
          shadowColor: '#000',
          shadowOpacity: 0.05,
          shadowRadius: 2,
          shadowOffset: { width: 0, height: 1 },
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: '500' }}>{c.category_title}</Text>
          <Text style={{ fontSize: 13, color: '#555' }}>
            {(c.spent / 100).toLocaleString('en-US', {
              style: 'currency',
              currency: c.currency,
            })}
          </Text>
        </View>

        {/* tiny progress bar */}
        <View style={{ width: 80, height: 6, backgroundColor: '#e5e7eb', borderRadius: 3 }}>
          <View
            style={{
              height: '100%',
              backgroundColor: '#6366f1', // swap with colors.primary
              borderRadius: 3,
              width: `${Math.min((c.spent / c.budget) * 100, 100)}%`,
            }}
          />
        </View>
        <Text style={{ marginLeft: 8, fontSize: 12, fontWeight: '600', color: '#6366f1' }}>
          {Math.round((c.spent / c.budget) * 100)}%
        </Text>
      </View>
    ))}
  </View>
);
