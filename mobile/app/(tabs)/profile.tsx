import { useEffect, useState } from 'react';
import { Button, H2, Input, ScrollView, Text, YStack, XStack, View, H3, H4, Select, Adapt, Sheet } from 'tamagui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToastController } from '@tamagui/toast';
import { getCategories, getSettings, saveSettings, deleteCategory, SUPPORTED_CURRENCIES, formatAmount } from '../../utils/storage';
import { Category, Settings, Currency } from '../../utils/storage';
import { Trash, Plus, ChevronDown } from '@tamagui/lucide-icons';
import CategorySheet from '../../components/CategorySheet';

export default function ProfileScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<Settings>({ currency: 'JPY' });
  const [currency, setCurrency] = useState<Currency>('JPY');
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
      setCurrency(appSettings.currency as Currency);
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
    if (!currency) {
      setError('Currency is required');
      return;
    }

    try {
      await saveSettings({ currency });
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
      <YStack p="$4" pt={insets.top + 16}>
        <H3 fontWeight="600">Profile</H3>
      </YStack>
      <ScrollView flex={1}>
        <YStack p="$4" gap="$7">
          {loading ? (
            <Text>Loading...</Text>
          ) : (
            <>
              <YStack gap="$4">
                <H4>Settings</H4>

                {error ? <Text color="$red10">{error}</Text> : null}

                <Text>Currency</Text>
                <Select value={currency} onValueChange={(value) => setCurrency(value as Currency)}>
                  <Select.Trigger iconAfter={<ChevronDown />}>
                    <Select.Value placeholder="Select currency">
                      {currency || "Select currency"}
                    </Select.Value>
                  </Select.Trigger>

                  <Adapt when="maxMd" platform="touch">
                    <Sheet native={false} modal dismissOnSnapToBottom animation="medium">
                      <Sheet.Frame bg="$black2" pt="$5" pb="$8" px="$4" gap="$4">
                        <Sheet.ScrollView>
                          <Adapt.Contents />
                        </Sheet.ScrollView>
                      </Sheet.Frame>
                      <Sheet.Overlay
                        opacity={0.8}
                        animation="200ms"
                        enterStyle={{ opacity: 0 }}
                        exitStyle={{ opacity: 0 }}
                      />
                    </Sheet>
                  </Adapt>

                  <Select.Content zIndex={200000}>
                    <Select.Viewport>
                      <Select.Group>
                        {SUPPORTED_CURRENCIES.map((curr, index) => (
                          <Select.Item key={curr} index={index} value={curr} bg="$black2">
                            <Select.ItemText fontSize="$5">{curr}</Select.ItemText>
                          </Select.Item>
                        ))}
                      </Select.Group>
                    </Select.Viewport>
                  </Select.Content>
                </Select>
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
                          <Text>{formatAmount(category.budget, settings.currency)}</Text>
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
            </>
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