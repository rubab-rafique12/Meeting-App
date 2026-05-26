import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Spacing, Radius } from '../constants/theme';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [focused, setFocused]   = useState(null);
  const router = useRouter();
  const { login } = useAuth();
  const { theme } = useTheme();
  const s = styles(theme);

  const handle = async () => {
    if (!email.trim() || !password.trim()) { setError('All fields are required'); return; }
    setError(''); setLoading(true);
    const res = await login(email.trim(), password);
    setLoading(false);
    if (res.success) router.replace('/');
    else setError(res.error || 'Login failed');
  };

  return (
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">

        {/* Brand */}
        <View style={s.brand}>
          <View style={s.logoWrap}>
            <Text style={s.logoLetter}>M</Text>
          </View>
          <Text style={s.appName}>MeetingNotes</Text>
          <Text style={s.tagline}>AI-powered meeting intelligence</Text>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Welcome back</Text>
          <Text style={s.cardSub}>Sign in to continue</Text>

          {error ? <View style={s.errorBox}><Text style={s.errorTxt}>⚠  {error}</Text></View> : null}

          <Text style={s.label}>EMAIL ADDRESS</Text>
          <TextInput
            style={[s.input, focused === 'email' && s.inputFocused]}
            placeholder="you@company.com"
            placeholderTextColor={theme.textMuted}
            value={email} onChangeText={setEmail}
            autoCapitalize="none" keyboardType="email-address"
            onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
          />

          <Text style={s.label}>PASSWORD</Text>
          <View style={[s.passRow, focused === 'pass' && s.inputFocused]}>
            <TextInput
              style={s.passInput}
              placeholder="Enter your password"
              placeholderTextColor={theme.textMuted}
              value={password} onChangeText={setPassword}
              secureTextEntry={!showPass}
              onFocus={() => setFocused('pass')} onBlur={() => setFocused(null)}
            />
            <TouchableOpacity onPress={() => setShowPass(!showPass)} style={s.eyeBtn}>
              <Text style={s.eyeTxt}>{showPass ? '🙈' : '👁'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => router.push('/forgot-password')} style={s.forgotRow}>
            <Text style={s.forgotTxt}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[s.btn, loading && s.btnOff]} onPress={handle} disabled={loading} activeOpacity={0.88}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnTxt}>Sign In</Text>}
          </TouchableOpacity>
        </View>

        <View style={s.footer}>
          <Text style={s.footerTxt}>Don't have an account?  </Text>
          <TouchableOpacity onPress={() => router.push('/signup')}>
            <Text style={s.footerLink}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = (t) => StyleSheet.create({
  flex: { flex: 1, backgroundColor: t.bg },
  container: { flexGrow: 1, justifyContent: 'center', padding: Spacing.lg },
  brand: { alignItems: 'center', marginBottom: Spacing.xl },
  logoWrap: {
    width: 68, height: 68, borderRadius: 20,
    backgroundColor: t.primary, alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.md,
    shadowColor: t.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 8,
  },
  logoLetter: { fontSize: 30, fontWeight: '800', color: '#fff' },
  appName: { fontSize: 24, fontWeight: '800', color: t.textPrimary, letterSpacing: -0.5 },
  tagline: { fontSize: 13, color: t.textMuted, marginTop: 4, letterSpacing: 0.2 },
  card: {
    backgroundColor: t.bgCard, borderRadius: Radius.xl, padding: Spacing.lg,
    marginBottom: Spacing.lg, borderWidth: 1, borderColor: t.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 4,
  },
  cardTitle: { fontSize: 22, fontWeight: '700', color: t.textPrimary, marginBottom: 4 },
  cardSub: { fontSize: 14, color: t.textMuted, marginBottom: Spacing.lg },
  errorBox: {
    backgroundColor: t.dangerSoft, borderRadius: Radius.md, padding: Spacing.md,
    marginBottom: Spacing.md, borderLeftWidth: 3, borderLeftColor: t.danger,
  },
  errorTxt: { color: t.danger, fontSize: 13, fontWeight: '500' },
  label: { fontSize: 11, fontWeight: '700', color: t.textMuted, letterSpacing: 1.2, marginBottom: 6, textTransform: 'uppercase' },
  input: {
    backgroundColor: t.bgInput, color: t.textPrimary, paddingHorizontal: Spacing.md, paddingVertical: 14,
    borderRadius: Radius.md, fontSize: 15, borderWidth: 1.5, borderColor: t.border, marginBottom: Spacing.md,
  },
  inputFocused: { borderColor: t.primary, backgroundColor: t.bgCard },
  passRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: t.bgInput, borderRadius: Radius.md, borderWidth: 1.5, borderColor: t.border,
    marginBottom: Spacing.sm, paddingRight: Spacing.md,
  },
  passInput: { flex: 1, color: t.textPrimary, paddingHorizontal: Spacing.md, paddingVertical: 14, fontSize: 15 },
  eyeBtn: { padding: 4 },
  eyeTxt: { fontSize: 17 },
  forgotRow: { alignItems: 'flex-end', marginBottom: Spacing.lg, marginTop: 4 },
  forgotTxt: { color: t.primary, fontSize: 13, fontWeight: '600' },
  btn: {
    backgroundColor: t.primary, borderRadius: Radius.md, height: 52,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: t.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
  },
  btnOff: { opacity: 0.6, shadowOpacity: 0 },
  btnTxt: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerTxt: { color: t.textSecondary, fontSize: 14 },
  footerLink: { color: t.primary, fontSize: 14, fontWeight: '700' },
});
