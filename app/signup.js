import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Spacing, Radius } from '../constants/theme';

function getStrength(pw) {
  if (!pw) return null;
  if (pw.length < 6) return { label: 'Weak', color: '#D93025', pct: '28%' };
  if (pw.length < 10 || !/[A-Z]/.test(pw) || !/[0-9]/.test(pw))
    return { label: 'Medium', color: '#E8A838', pct: '62%' };
  return { label: 'Strong', color: '#0A8754', pct: '100%' };
}
const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

export default function Signup() {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [focused, setFocused]   = useState(null);
  const router = useRouter();
  const { signup } = useAuth();
  const { theme } = useTheme();
  const s = styles(theme);
  const strength = getStrength(password);

  const handle = async () => {
    if (!name.trim() || !email.trim() || !password) { setError('All fields are required'); return; }
    if (!validateEmail(email)) { setError('Enter a valid email address'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setError(''); setLoading(true);
    const res = await signup(name.trim(), email.trim(), password);
    setLoading(false);
    if (res.success) router.replace('/');
    else setError(res.error || 'Signup failed');
  };

  return (
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">

        <View style={s.brand}>
          <View style={s.logoWrap}><Text style={s.logoLetter}>M</Text></View>
          <Text style={s.appName}>MeetingNotes</Text>
          <Text style={s.tagline}>Create your free account</Text>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Get started</Text>
          <Text style={s.cardSub}>Fill in your details to create an account</Text>

          {error ? <View style={s.errorBox}><Text style={s.errorTxt}>⚠  {error}</Text></View> : null}

          <Text style={s.label}>FULL NAME</Text>
          <TextInput
            style={[s.input, focused === 'name' && s.inputFocused]}
            placeholder="John Smith" placeholderTextColor={theme.textMuted}
            value={name} onChangeText={setName}
            onFocus={() => setFocused('name')} onBlur={() => setFocused(null)}
          />

          <Text style={s.label}>EMAIL ADDRESS</Text>
          <TextInput
            style={[s.input, focused === 'email' && s.inputFocused]}
            placeholder="you@company.com" placeholderTextColor={theme.textMuted}
            value={email} onChangeText={setEmail}
            autoCapitalize="none" keyboardType="email-address"
            onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
          />

          <Text style={s.label}>PASSWORD</Text>
          <View style={[s.passRow, focused === 'pass' && s.inputFocused]}>
            <TextInput
              style={s.passInput}
              placeholder="Minimum 8 characters" placeholderTextColor={theme.textMuted}
              value={password} onChangeText={setPassword} secureTextEntry={!showPass}
              onFocus={() => setFocused('pass')} onBlur={() => setFocused(null)}
            />
            <TouchableOpacity onPress={() => setShowPass(!showPass)} style={s.eyeBtn}>
              <Text style={s.eyeTxt}>{showPass ? '🙈' : '👁'}</Text>
            </TouchableOpacity>
          </View>

          {strength && (
            <View style={s.strengthRow}>
              <View style={s.strengthTrack}>
                <View style={[s.strengthFill, { width: strength.pct, backgroundColor: strength.color }]} />
              </View>
              <Text style={[s.strengthLabel, { color: strength.color }]}>{strength.label}</Text>
            </View>
          )}

          <TouchableOpacity style={[s.btn, loading && s.btnOff]} onPress={handle} disabled={loading} activeOpacity={0.88}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnTxt}>Create Account</Text>}
          </TouchableOpacity>
        </View>

        <View style={s.footer}>
          <Text style={s.footerTxt}>Already have an account?  </Text>
          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text style={s.footerLink}>Sign In</Text>
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
    width: 68, height: 68, borderRadius: 20, backgroundColor: t.primary,
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md,
    shadowColor: t.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 8,
  },
  logoLetter: { fontSize: 30, fontWeight: '800', color: '#fff' },
  appName: { fontSize: 24, fontWeight: '800', color: t.textPrimary, letterSpacing: -0.5 },
  tagline: { fontSize: 13, color: t.textMuted, marginTop: 4 },
  card: {
    backgroundColor: t.bgCard, borderRadius: Radius.xl, padding: Spacing.lg, marginBottom: Spacing.lg,
    borderWidth: 1, borderColor: t.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 4,
  },
  cardTitle: { fontSize: 22, fontWeight: '700', color: t.textPrimary, marginBottom: 4 },
  cardSub: { fontSize: 14, color: t.textMuted, marginBottom: Spacing.lg },
  errorBox: { backgroundColor: t.dangerSoft, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.md, borderLeftWidth: 3, borderLeftColor: t.danger },
  errorTxt: { color: t.danger, fontSize: 13, fontWeight: '500' },
  label: { fontSize: 11, fontWeight: '700', color: t.textMuted, letterSpacing: 1.2, marginBottom: 6 },
  input: {
    backgroundColor: t.bgInput, color: t.textPrimary, paddingHorizontal: Spacing.md, paddingVertical: 14,
    borderRadius: Radius.md, fontSize: 15, borderWidth: 1.5, borderColor: t.border, marginBottom: Spacing.md,
  },
  inputFocused: { borderColor: t.primary, backgroundColor: t.bgCard },
  passRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: t.bgInput,
    borderRadius: Radius.md, borderWidth: 1.5, borderColor: t.border, marginBottom: Spacing.sm, paddingRight: Spacing.md,
  },
  passInput: { flex: 1, color: t.textPrimary, paddingHorizontal: Spacing.md, paddingVertical: 14, fontSize: 15 },
  eyeBtn: { padding: 4 },
  eyeTxt: { fontSize: 17 },
  strengthRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  strengthTrack: { flex: 1, height: 5, backgroundColor: t.border, borderRadius: Radius.full, overflow: 'hidden' },
  strengthFill: { height: '100%', borderRadius: Radius.full },
  strengthLabel: { fontSize: 12, fontWeight: '700', width: 52 },
  btn: {
    backgroundColor: t.primary, borderRadius: Radius.md, height: 52,
    alignItems: 'center', justifyContent: 'center', marginTop: Spacing.sm,
    shadowColor: t.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
  },
  btnOff: { opacity: 0.6, shadowOpacity: 0 },
  btnTxt: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerTxt: { color: t.textSecondary, fontSize: 14 },
  footerLink: { color: t.primary, fontSize: 14, fontWeight: '700' },
});
