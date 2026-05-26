import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { Spacing, Radius } from '../constants/theme';
import BackButton from '../components/BackButton';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();
  const s = styles(theme);

  const handle = async () => {
    if (!email.trim()) { setError('Please enter your email'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Enter a valid email'); return; }
    setError(''); setLoading(true);
    // Simulate OTP send
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    router.push({ pathname: '/verify-otp', params: { email: email.trim() } });
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <BackButton />
        <View style={s.headerRight} />
      </View>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
      <View style={s.iconWrap}><Text style={s.icon}>🔐</Text></View>
      <Text style={s.title}>Forgot Password?</Text>
      <Text style={s.sub}>Enter your email and we'll send you a verification code.</Text>

      {error ? <View style={s.errorBox}><Text style={s.errorTxt}>⚠ {error}</Text></View> : null}

      <Text style={s.label}>EMAIL ADDRESS</Text>
      <TextInput
        style={[s.input, focused && s.inputFocused]}
        placeholder="you@example.com" placeholderTextColor={theme.textMuted}
        value={email} onChangeText={setEmail}
        autoCapitalize="none" keyboardType="email-address"
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      />

      <TouchableOpacity style={[s.btn, loading && s.btnOff]} onPress={handle} disabled={loading} activeOpacity={0.85}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnTxt}>Send OTP</Text>}
      </TouchableOpacity>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = (t) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: t.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    backgroundColor: t.bgCard, borderBottomWidth: 1, borderBottomColor: t.border,
  },
  headerRight: { width: 72 },
  container: { flexGrow: 1, backgroundColor: t.bg, padding: Spacing.lg, justifyContent: 'center' },
  iconWrap: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: t.primarySoft,
    alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: Spacing.lg,
  },
  icon: { fontSize: 36 },
  title: { fontSize: 24, fontWeight: '700', color: t.textPrimary, textAlign: 'center', marginBottom: Spacing.sm },
  sub: { fontSize: 14, color: t.textSecondary, textAlign: 'center', marginBottom: Spacing.xl, lineHeight: 22 },
  errorBox: { backgroundColor: t.dangerSoft, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.md, borderLeftWidth: 3, borderLeftColor: t.danger },
  errorTxt: { color: t.danger, fontSize: 13 },
  label: { fontSize: 11, fontWeight: '700', color: t.textMuted, letterSpacing: 1, marginBottom: 6 },
  input: { backgroundColor: t.bgInput, color: t.textPrimary, padding: Spacing.md, borderRadius: Radius.md, fontSize: 15, borderWidth: 1.5, borderColor: t.border, marginBottom: Spacing.lg },
  inputFocused: { borderColor: t.primary },
  btn: { backgroundColor: t.primary, borderRadius: Radius.md, height: 52, alignItems: 'center', justifyContent: 'center' },
  btnOff: { opacity: 0.6 },
  btnTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
