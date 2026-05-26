import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { Spacing, Radius } from '../constants/theme';

/**
 * Reusable back button component.
 * Props:
 *   onPress  – custom handler (defaults to router.back())
 *   label    – text label (defaults to 'Back')
 *   style    – extra container style
 */
export default function BackButton({ onPress, label = 'Back', style }) {
  const { theme } = useTheme();
  const s = styles(theme);

  return (
    <TouchableOpacity
      style={[s.btn, style]}
      onPress={onPress ?? (() => router.back())}
      activeOpacity={0.75}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <View style={s.inner}>
        <Text style={s.arrow}>‹</Text>
        {label ? <Text style={s.label}>{label}</Text> : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = (t) => StyleSheet.create({
  btn: {
    alignSelf: 'flex-start',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: t.bgCard,
    borderRadius: Radius.full,
    paddingVertical: 7,
    paddingLeft: 10,
    paddingRight: 14,
    borderWidth: 1,
    borderColor: t.border,
    gap: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  arrow: {
    fontSize: 22,
    color: t.primary,
    fontWeight: '600',
    lineHeight: 24,
    marginTop: -1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: t.textPrimary,
  },
});
