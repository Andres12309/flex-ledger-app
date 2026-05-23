import { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AmountKeypad } from '@/src/components/expense/amount-keypad';
import {
  ExpenseDateChips,
  occurredAtFromPreset,
  presetFromOccurredAt,
  type ExpenseDatePreset,
} from '@/src/components/expense/expense-date-chips';
import {
  buildCategoryOptions,
  CategoryPicker,
} from '@/src/components/expense/category-picker';
import type { GroupWithCategories } from '@/src/repositories/groups';
import { formatMoney } from '@/src/utils/currency';
import { useAppColors } from '@/hooks/use-app-colors';

export type ExpenseFormValues = {
  amountCents: number;
  categoryId: string | null;
  groupId: string | null;
  note: string;
  datePreset: ExpenseDatePreset;
};

type ExpenseFormBodyProps = {
  groups: GroupWithCategories[];
  recentCategoryIds: string[];
  currency: string;
  initial: Partial<ExpenseFormValues> & { occurredAt?: number };
  onChange: (values: ExpenseFormValues) => void;
};

export function ExpenseFormBody({
  groups,
  recentCategoryIds,
  currency,
  initial,
  onChange,
}: ExpenseFormBodyProps) {
  const colors = useAppColors();
  const [amountCents, setAmountCents] = useState(initial.amountCents ?? 0);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    initial.categoryId ?? null,
  );
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(
    initial.groupId ?? groups[0]?.id ?? null,
  );
  const [note, setNote] = useState(initial.note ?? '');
  const [datePreset, setDatePreset] = useState<ExpenseDatePreset>(
    initial.datePreset ??
      (initial.occurredAt != null ? presetFromOccurredAt(initial.occurredAt) : 'today'),
  );
  const activeGroupId = selectedGroupId ?? groups[0]?.id ?? null;
  const allOptions = useMemo(() => buildCategoryOptions(groups), [groups]);

  const selectedOption = useMemo(
    () => allOptions.find((o) => o.id === selectedCategoryId) ?? null,
    [allOptions, selectedCategoryId],
  );

  const emit = (patch: Partial<ExpenseFormValues>) => {
    const next = {
      amountCents: patch.amountCents ?? amountCents,
      categoryId: patch.categoryId !== undefined ? patch.categoryId : selectedCategoryId,
      groupId: patch.groupId !== undefined ? patch.groupId : selectedGroupId,
      note: patch.note ?? note,
      datePreset: patch.datePreset ?? datePreset,
    };
    onChange(next);
  };

  const handleSelectCategory = (categoryId: string, groupId: string) => {
    const id = categoryId.length > 0 ? categoryId : null;
    setSelectedCategoryId(id);
    setSelectedGroupId(groupId);
    emit({ categoryId: id, groupId });
  };

  useEffect(() => {
    if (initial.categoryId || recentCategoryIds.length === 0) return;
    const opt = allOptions.find((o) => o.id === recentCategoryIds[0]);
    if (!opt) return;
    setSelectedCategoryId(opt.id);
    setSelectedGroupId(opt.groupId);
    onChange({
      amountCents: initial.amountCents ?? 0,
      categoryId: opt.id,
      groupId: opt.groupId,
      note: initial.note ?? '',
      datePreset:
        initial.datePreset ??
        (initial.occurredAt != null ? presetFromOccurredAt(initial.occurredAt) : 'today'),
    });
    // Solo al abrir formulario nuevo, sin categoría previa
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <ThemedText type="title" style={styles.amount}>
          {formatMoney(amountCents, currency)}
        </ThemedText>

        <AmountKeypad
          amountCents={amountCents}
          onChange={(v) => {
            setAmountCents(v);
            emit({ amountCents: v });
          }}
        />

        <View style={styles.inlineRow}>
          <ExpenseDateChips
            preset={datePreset}
            onChange={(p) => {
              setDatePreset(p);
              emit({ datePreset: p });
            }}
          />
        </View>

        <ThemedView variant="card" style={[styles.categoryCard, { borderColor: colors.cardBorder }]}>
          <View style={styles.categoryHeader}>
            <ThemedText type="defaultSemiBold">Categoría</ThemedText>
            {selectedOption ? (
              <ThemedText type="muted" style={styles.selectedTag}>
                {selectedOption.name}
              </ThemedText>
            ) : (
              <ThemedText type="muted" style={styles.selectedTag}>
                Elige una
              </ThemedText>
            )}
          </View>
          {activeGroupId ? (
            <CategoryPicker
              groups={groups}
              selectedGroupId={activeGroupId}
              selectedCategoryId={selectedCategoryId}
              onSelectGroup={(id) => {
                setSelectedGroupId(id);
                emit({ groupId: id });
              }}
              onSelectCategory={handleSelectCategory}
            />
          ) : null}
        </ThemedView>

        <TextInput
          value={note}
          onChangeText={(t) => {
            setNote(t);
            emit({ note: t });
          }}
          placeholder="Nota opcional"
          style={[
            styles.noteInput,
            { color: colors.text, borderColor: colors.cardBorder, backgroundColor: colors.card },
          ]}
          placeholderTextColor={colors.textMuted}
          maxLength={120}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export function getOccurredAtFromForm(values: ExpenseFormValues): number {
  return occurredAtFromPreset(values.datePreset);
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: {
    paddingHorizontal: 16,
    gap: 14,
    paddingBottom: 20,
  },
  amount: {
    fontSize: 38,
    lineHeight: 42,
    textAlign: 'center',
  },
  inlineRow: {
    alignItems: 'center',
  },
  categoryCard: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedTag: {
    fontSize: 13,
    fontWeight: '600',
  },
  noteInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
  },
});
