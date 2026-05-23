import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppColors } from '@/hooks/use-app-colors';
import type { GroupWithCategories } from '@/src/repositories/groups';
import { CategoryMaterialIcon } from '@/src/utils/category-icon';
import { hapticSelection } from '@/src/utils/haptics';

export type CategoryOption = {
  id: string;
  name: string;
  icon: string;
  groupId: string;
  groupName: string;
  groupColor: string;
};

type CategoryPickerProps = {
  groups: GroupWithCategories[];
  selectedGroupId: string;
  selectedCategoryId: string | null;
  onSelectGroup: (groupId: string) => void;
  onSelectCategory: (categoryId: string, groupId: string) => void;
};

export function buildCategoryOptions(groups: GroupWithCategories[]): CategoryOption[] {
  return groups.flatMap((group) =>
    group.categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      groupId: group.id,
      groupName: group.name,
      groupColor: group.color,
    })),
  );
}

export function CategoryPicker({
  groups,
  selectedGroupId,
  selectedCategoryId,
  onSelectGroup,
  onSelectCategory,
}: CategoryPickerProps) {
  const colors = useAppColors();
  const activeGroup = groups.find((g) => g.id === selectedGroupId) ?? groups[0];

  const pickCategory = (option: CategoryOption) => {
    void hapticSelection();
    onSelectGroup(option.groupId);
    onSelectCategory(option.id, option.groupId);
  };

  const pickGroup = (groupId: string) => {
    void hapticSelection();
    const group = groups.find((g) => g.id === groupId);
    const categoryStillValid = group?.categories.some((c) => c.id === selectedCategoryId);
    onSelectGroup(groupId);
    if (!categoryStillValid && selectedCategoryId) {
      onSelectCategory('', groupId);
    }
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.groupRow}>
        {groups.map((group) => {
          const active = group.id === selectedGroupId;
          return (
            <Pressable key={group.id} onPress={() => pickGroup(group.id)}>
              <ThemedView
                style={[
                  styles.groupTab,
                  { borderColor: colors.cardBorder },
                  active && { backgroundColor: group.color, borderColor: group.color },
                ]}>
                <ThemedText
                  style={styles.groupTabText}
                  lightColor={active ? colors.primaryForeground : colors.text}
                  darkColor={active ? colors.primaryForeground : colors.text}>
                  {group.name}
                </ThemedText>
              </ThemedView>
            </Pressable>
          );
        })}
      </ScrollView>

      {activeGroup ? (
        <View style={styles.categoriesGrid}>
          {activeGroup.categories.map((category) => {
            const selected = selectedCategoryId === category.id;
            return (
              <Pressable
                key={category.id}
                onPress={() =>
                  pickCategory({
                    id: category.id,
                    name: category.name,
                    icon: category.icon,
                    groupId: activeGroup.id,
                    groupName: activeGroup.name,
                    groupColor: activeGroup.color,
                  })
                }>
                <ThemedView
                  style={[
                    styles.chip,
                    { borderColor: colors.cardBorder },
                    selected && {
                      borderColor: activeGroup.color,
                      backgroundColor: `${activeGroup.color}20`,
                      borderWidth: 2,
                    },
                  ]}>
                  <CategoryMaterialIcon icon={category.icon} color={activeGroup.color} size={16} />
                  <ThemedText type="defaultSemiBold" style={styles.chipText}>
                    {category.name}
                  </ThemedText>
                </ThemedView>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 10,
  },
  groupRow: {
    gap: 8,
    paddingVertical: 2,
  },
  groupTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  groupTabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
  },
});
