import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp, SlideInRight } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppButton } from '@/components/ui/app-button';
import { ScreenShell } from '@/components/ui/screen-shell';
import { OnboardingProgress } from '@/src/components/onboarding/onboarding-progress';
import { AccentThemePicker } from '@/src/components/settings/accent-theme-picker';
import { LifecyclePicker } from '@/src/components/settings/lifecycle-picker';
import { ACCENT_THEMES, type AccentThemeId } from '@/src/constants/accent-themes';
import { APP_NAME } from '@/src/constants/app';
import { buildAppColors } from '@/src/domain/app-colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useDatabase } from '@/src/providers/database-context';
import { completeOnboarding } from '@/src/repositories/user-settings';
import {
  ensureNotificationPermissions,
  syncScheduledNotifications,
} from '@/src/services/notifications-scheduler';
import type { LifecycleType } from '@/src/types';
import { hapticSelection, hapticSuccess } from '@/src/utils/haptics';

const STEPS = 5;

const FEATURES = [
  { emoji: '⚡', title: 'Registro en segundos', desc: 'Monto con teclado rápido y categorías a un toque.' },
  { emoji: '📊', title: 'Dashboard claro', desc: 'Ve tu mes, semana o año sin hojas de cálculo.' },
  { emoji: '🔔', title: 'Recordatorios suaves', desc: 'Solo lo útil, según tu ritmo de vida.' },
  { emoji: '📤', title: 'Exporta a Excel', desc: 'Lleva tus datos cuando los necesites.' },
] as const;

export default function OnboardingScreen() {
  const router = useRouter();
  const { db } = useDatabase();
  const queryClient = useQueryClient();
  const scheme = useColorScheme() ?? 'light';

  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState('');
  const [familyLabel, setFamilyLabel] = useState('');
  const [familySize, setFamilySize] = useState('');
  const [accentId, setAccentId] = useState<AccentThemeId>('teal');
  const [lifecycle, setLifecycle] = useState<LifecycleType>('daily');

  const previewColors = useMemo(
    () => buildAppColors(scheme, accentId),
    [scheme, accentId],
  );

  const finishMutation = useMutation({
    mutationFn: async () => {
      const size = familySize.trim() ? parseInt(familySize, 10) : null;
      await completeOnboarding(db, {
        displayName: displayName.trim() || null,
        familyLabel: familyLabel.trim() || null,
        familySize: size && !Number.isNaN(size) ? size : null,
        accentThemeId: accentId,
        lifecycleType: lifecycle,
        currency: 'USD',
      });
      await ensureNotificationPermissions();
      await syncScheduledNotifications(db);
    },
    onSuccess: async () => {
      await hapticSuccess();
      await queryClient.invalidateQueries({ queryKey: ['user-settings'] });
      router.replace('/(tabs)');
    },
  });

  const goNext = () => {
    void hapticSelection();
    if (step < STEPS - 1) setStep((s) => s + 1);
    else finishMutation.mutate();
  };

  const goSkipProfile = () => {
    void hapticSelection();
    setStep(2);
  };

  const primaryBtnTitle =
    step === STEPS - 1
      ? finishMutation.isPending
        ? 'Abriendo tu espacio…'
        : '¡Empezar!'
      : step === 1
        ? 'Continuar'
        : 'Siguiente';

  return (
    <ScreenShell safeBottom bottomInset={12} scroll={false}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <OnboardingProgress step={step} total={STEPS} />
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {step === 0 ? (
            <Animated.View entering={FadeInUp.duration(500)} style={styles.step}>
              <Animated.View entering={FadeInDown.delay(80).duration(450)} style={styles.hero}>
                <ThemedView
                  style={[
                    styles.heroBadge,
                    { backgroundColor: previewColors.primary },
                  ]}>
                  <ThemedText
                    style={styles.heroEmoji}
                    lightColor={previewColors.primaryForeground}
                    darkColor={previewColors.primaryForeground}>
                    💰
                  </ThemedText>
                </ThemedView>
                <ThemedText type="title" style={styles.heroTitle}>
                  Bienvenido a {APP_NAME}
                </ThemedText>
                <ThemedText type="muted" style={styles.heroSub}>
                  Control de gastos offline, bonito y sin complicarte la vida.
                </ThemedText>
              </Animated.View>
              {FEATURES.map((f, i) => (
                <Animated.View
                  key={f.title}
                  entering={FadeInDown.delay(120 + i * 70).duration(400)}
                  style={[styles.feature, { borderColor: previewColors.primary + '44' }]}>
                  <ThemedText style={styles.featureEmoji}>{f.emoji}</ThemedText>
                  <View style={styles.featureBody}>
                    <ThemedText type="defaultSemiBold">{f.title}</ThemedText>
                    <ThemedText type="muted">{f.desc}</ThemedText>
                  </View>
                </Animated.View>
              ))}
            </Animated.View>
          ) : null}

          {step === 1 ? (
            <Animated.View entering={SlideInRight.duration(380)} style={styles.step}>
              <ThemedText type="title">¿Cómo te llamamos?</ThemedText>
              <ThemedText type="muted" style={styles.stepSub}>
                Opcional — personaliza saludos y exportaciones. Puedes omitir este paso.
              </ThemedText>
              <TextInput
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Tu nombre o alias"
                placeholderTextColor={previewColors.textMuted}
                style={[
                  styles.input,
                  {
                    color: previewColors.text,
                    borderColor: previewColors.cardBorder,
                    backgroundColor: previewColors.card,
                  },
                ]}
                maxLength={40}
              />
              <ThemedText type="defaultSemiBold" style={styles.sectionLabel}>
                Familia (opcional)
              </ThemedText>
              <TextInput
                value={familyLabel}
                onChangeText={setFamilyLabel}
                placeholder="Ej. Familia López"
                placeholderTextColor={previewColors.textMuted}
                style={[
                  styles.input,
                  {
                    color: previewColors.text,
                    borderColor: previewColors.cardBorder,
                    backgroundColor: previewColors.card,
                  },
                ]}
                maxLength={60}
              />
              <TextInput
                value={familySize}
                onChangeText={setFamilySize}
                placeholder="¿Cuántos en el hogar? (número, opcional)"
                placeholderTextColor={previewColors.textMuted}
                keyboardType="number-pad"
                style={[
                  styles.input,
                  {
                    color: previewColors.text,
                    borderColor: previewColors.cardBorder,
                    backgroundColor: previewColors.card,
                  },
                ]}
                maxLength={2}
              />
              <Pressable onPress={goSkipProfile} style={styles.skip}>
                <ThemedText type="link">Omitir por ahora</ThemedText>
              </Pressable>
            </Animated.View>
          ) : null}

          {step === 2 ? (
            <Animated.View entering={SlideInRight.duration(380)} style={styles.step}>
              <ThemedText type="title">Elige tu color</ThemedText>
              <ThemedText type="muted" style={styles.stepSub}>
                Toda la app se vestirá así. Cámbialo cuando quieras en Ajustes.
              </ThemedText>
              <View
                style={[
                  styles.previewCard,
                  {
                    borderColor: previewColors.primary,
                    backgroundColor: ACCENT_THEMES[accentId].glow,
                  },
                ]}>
                <ThemedText type="defaultSemiBold">
                  {ACCENT_THEMES[accentId].emoji} {ACCENT_THEMES[accentId].label}
                </ThemedText>
                <View
                  style={[styles.previewChip, { backgroundColor: previewColors.primary }]}>
                  <ThemedText
                    lightColor={previewColors.primaryForeground}
                    darkColor={previewColors.primaryForeground}>
                    Vista previa
                  </ThemedText>
                </View>
              </View>
              <AccentThemePicker selected={accentId} onSelect={setAccentId} />
            </Animated.View>
          ) : null}

          {step === 3 ? (
            <Animated.View entering={SlideInRight.duration(380)} style={styles.step}>
              <ThemedText type="title">Tu ritmo</ThemedText>
              <ThemedText type="muted" style={styles.stepSub}>
                Define recordatorios y cómo verás el resumen.
              </ThemedText>
              <LifecyclePicker selected={lifecycle} onSelect={setLifecycle} />
            </Animated.View>
          ) : null}

          {step === 4 ? (
            <Animated.View entering={FadeInUp.duration(450)} style={styles.step}>
              <Animated.View
                style={[
                  styles.fabPreview,
                  { backgroundColor: previewColors.primary },
                ]}>
                <ThemedText
                  style={styles.fabPlus}
                  lightColor={previewColors.primaryForeground}
                  darkColor={previewColors.primaryForeground}>
                  +
                </ThemedText>
              </Animated.View>
              <ThemedText type="title" style={styles.centerTitle}>
                Listo para registrar
              </ThemedText>
              <ThemedText type="muted" style={[styles.stepSub, styles.centerText]}>
                Al entrar verás el botón + flotante. Un toque y guardas monto, categoría y listo.
                {displayName.trim() ? ` ¡Nos vemos, ${displayName.trim()}!` : ''}
              </ThemedText>
            </Animated.View>
          ) : null}
        </ScrollView>

        <View style={styles.footer}>
          <AppButton
            title={primaryBtnTitle}
            loading={finishMutation.isPending}
            onPress={goNext}
          />
        </View>
      </KeyboardAvoidingView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 16, gap: 4 },
  step: { gap: 14 },
  hero: { alignItems: 'center', gap: 10, marginBottom: 8 },
  heroBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEmoji: { fontSize: 36 },
  heroTitle: { textAlign: 'center' },
  heroSub: { textAlign: 'center', lineHeight: 22, paddingHorizontal: 8 },
  feature: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  featureEmoji: { fontSize: 28 },
  featureBody: { flex: 1, gap: 2 },
  stepSub: { lineHeight: 22 },
  sectionLabel: { marginTop: 4 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  skip: { alignItems: 'center', paddingVertical: 8 },
  previewCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  previewChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  fabPreview: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  fabPlus: { fontSize: 40, fontWeight: '200' },
  centerTitle: { textAlign: 'center' },
  centerText: { textAlign: 'center' },
  footer: { paddingTop: 8 },
});
