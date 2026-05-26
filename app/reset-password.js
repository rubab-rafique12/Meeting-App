import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Spacing, Radius } from '../constants/theme';
import BackButton from '../components/BackButton';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showP, setShowP] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const { resetPassword } = useAuth();
  const { theme } = useTheme();
  const s = styles(theme);

  const handle = async () => {
    if (!password || !confirm) { setError('All fields required'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }
    setError(''); setLoading(true);
    const res = await resetPassword(email, password);
    setLoading(false);
    if (res.success) {
      router.replace('/login');
    } else {
      setError(res.error || 'Failed to reset password');
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* ── Header ── */}
      <View style={s.header}>
        <BackButton />
        <View style={s.headerRight} />
      </View>

      <View style={s.container}>
        <View style={s.iconWrap}><Text style={s.icon}>🔑</Text></View>
        <Text style={s.title}>New Password</Text>
        <Text style={s.sub}>Create a strong new password for your account.</Text>

        {error ? <View style={s.errorBox}><Text style={s.errorTxt}>⚠ {error}</Text></View> : null}

        <Text style={s.label}>NEW PASSWORD</Text>
        <View style={s.passWrap}>
          <TextInput
            style={s.passInput} placeholder="Min. 8 characters"
            placeholderTextColor={theme.textMuted}
            value={password} onChangeText={setPassword} secureTextEntry={!showP}
          />
          <TouchableOpacity onPress={() => setShowP(!showP)} style={s.eyeBtn}>
            <Text style={s.eyeTxt}>{showP ? '🙈' : '👁'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.label}>CONFIRM PASSWORD</Text>
        <TextInput
          style={s.input} placeholder="Re-enter password"
          placeholderTextColor={theme.textMuted}
          value={confirm} onChangeText={setConfirm} secureTextEntry
        />

        <TouchableOpacity style={[s.btn, loading && s.btnOff]} onPress={handle} disabled={loading} activeOpacity={0.85}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnTxt}>Reset Password</Text>}
        </TouchableOpacity>
      </View>
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
  container: { flex: 1, padding: Spacing.lg, justifyContent: 'center' },
  iconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: t.primarySoft, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: Spacing.lg },
  icon: { fontSize: 36 },
  title: { fontSize: 24, fontWeight: '700', color: t.textPrimary, textAlign: 'center', marginBottom: Spacing.sm },
  sub: { fontSize: 14, color: t.textSecondary, textAlign: 'center', marginBottom: Spacing.xl, lineHeight: 22 },
  errorBox: { backgroundColor: t.dangerSoft, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.md, borderLeftWidth: 3, borderLeftColor: t.danger },
  errorTxt: { color: t.danger, fontSize: 13 },
  label: { fontSize: 11, fontWeight: '700', color: t.textMuted, letterSpacing: 1, marginBottom: 6 },
  input: { backgroundColor: t.bgInput, color: t.textPrimary, padding: Spacing.md, borderRadius: Radius.md, fontSize: 15, borderWidth: 1.5, borderColor: t.border, marginBottom: Spacing.md },
  passWrap: { flexDirection: 'row', marginBottom: Spacing.md },
  passInput: { flex: 1, backgroundColor: t.bgInput, color: t.textPrimary, padding: Spacing.md, borderRadius: Radius.md, fontSize: 15, borderWidth: 1.5, borderColor: t.border },
  eyeBtn: { position: 'absolute', right: 14, top: 14 },
  eyeTxt: { fontSize: 18 },
  btn: { backgroundColor: t.primary, borderRadius: Radius.md, height: 52, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.sm },
  btnOff: { opacity: 0.6 },
  btnTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
