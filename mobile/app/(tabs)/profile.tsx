import { useEffect, useState } from 'react';
import { Button, H2, Input, ScrollView, Text, YStack, XStack, View, H3, H4 } from 'tamagui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToastController } from '@tamagui/toast';
import { getCategories, getSettings, saveSettings, deleteCategory } from '../../utils/storage';
import { Category, Settings } from '../../utils/storage';
import { Trash, Plus } from '@tamagui/lucide-icons';
import CategorySheet from '../../components/CategorySheet';

export default function ProfileScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<Settings>({ currency: 'USD' });
  const [currency, setCurrency] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCategorySheet, setShowCategorySheet] = useState(false);
  const [error, setError] = useState('');
  const insets = useSafeAreaInsets();
  const toast = useToastController();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allCategories, appSettings] = await Promise.all([
        getCategories(),
        getSettings(),
      ]);

      setCategories(allCategories);
      setSettings(appSettings);
      setCurrency(appSettings.currency);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryAdded = () => {
    loadData(); // Refresh data when category is added
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await deleteCategory(categoryId);
      toast.show('Category deleted successfully!', {
        message: 'Your category has been removed.',
      });
      // Refresh categories
      loadData();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.show('Error', {
        message: 'Failed to delete category. Please try again.',
        type: 'error',
      });
    }
  };

  const handleSaveSettings = async () => {
    if (!currency.trim()) {
      setError('Currency is required');
      return;
    }

    try {
      await saveSettings({ currency: currency.trim() });
      setError('');
      toast.show('Settings saved successfully!', {
        message: 'Your currency has been updated.',
      });
      // Refresh settings
      const updatedSettings = await getSettings();
      setSettings(updatedSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Failed to save settings');
      toast.show('Error', {
        message: 'Failed to save settings. Please try again.',
        type: 'error',
      });
    }
  };

  return (
    <View flex={1} bg="$background">
      <ScrollView>
        <YStack p="$4" pt={insets.top + 16} space="$6">
          <H3 fontWeight="600">Profile</H3>

          {loading ? (
            <Text>Loading...</Text>
          ) : (
            <YStack gap="$7">
              <YStack gap="$4">
                <H4>Settings</H4>

                {error ? <Text color="$red10">{error}</Text> : null}

                <Text>Currency</Text>
                <Input
                  value={currency}
                  onChangeText={setCurrency}
                  placeholder="e.g. USD, EUR, JPY"
                />

                <Button onPress={handleSaveSettings}>
                  Save Settings
                </Button>
              </YStack>

              <YStack gap="$4">
                <XStack justify="space-between" verticalAlign="center" >
                  <H4>Categories</H4>
                  <Button icon={<Plus size={16} />} onPress={() => setShowCategorySheet(true)}>
                    Add Category
                  </Button>
                </XStack>

                {categories.length > 0 ? (
                  <YStack gap="$3">
                    {categories.map(category => (
                      <XStack key={category.id} gap="$3">
                        <YStack flex={1}>
                          <Text fontWeight="bold">{category.name}</Text>
                          <Text>{category.budget.toFixed(2)} {settings.currency}</Text>
                        </YStack>
                        <Button
                          size="$2"
                          circular
                          onPress={() => handleDeleteCategory(category.id)}
                          icon={<Trash size={16} />}
                        />
                      </XStack>
                    ))}
                  </YStack>
                ) : (
                  <Text>No categories yet. Add your first one above.</Text>
                )}
              </YStack>
            </YStack>
          )}
        </YStack>
      </ScrollView>

      <CategorySheet
        open={showCategorySheet}
        onOpenChange={setShowCategorySheet}
        onCategoryAdded={handleCategoryAdded}
      />
    </View>
  );
} 