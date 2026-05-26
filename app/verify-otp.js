import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { Spacing, Radius } from '../constants/theme';
import BackButton from '../components/BackButton';

const FAKE_OTP = '123456';

export default function VerifyOTP() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const refs = useRef([]);
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const { theme } = useTheme();
  const s = styles(theme);

  const handleChange = (val, idx) => {
    const next = [...otp];
    next[idx] = val.replace(/[^0-9]/g, '').slice(-1);
    setOtp(next);
    if (val && idx < 5) refs.current[idx + 1]?.focus();
  };

  const handleKey = (e, idx) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[idx] && idx > 0) refs.current[idx - 1]?.focus();
  };

  const verify = async () => {
    const code = otp.join('');
    if (code.length < 6) { setError('Enter the 6-digit code'); return; }
    setError(''); setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    if (code === FAKE_OTP) {
      router.push({ pathname: '/reset-password', params: { email } });
    } else {
      setError('Invalid OTP. Use 123456 for demo.');
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
        <View style={s.iconWrap}><Text style={s.icon}>📩</Text></View>
        <Text style={s.title}>Check your email</Text>
        <Text style={s.sub}>We sent a 6-digit code to{'\n'}<Text style={s.emailTxt}>{email}</Text></Text>
        <Text style={s.hint}>Demo OTP: 123456</Text>

        {error ? <View style={s.errorBox}><Text style={s.errorTxt}>⚠ {error}</Text></View> : null}

        <View style={s.otpRow}>
          {otp.map((digit, i) => (
            <TextInput
              key={i}
              ref={r => refs.current[i] = r}
              style={[s.otpBox, digit && s.otpFilled]}
              value={digit}
              onChangeText={v => handleChange(v, i)}
              onKeyPress={e => handleKey(e, i)}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
            />
          ))}
        </View>

        <TouchableOpacity style={[s.btn, loading && s.btnOff]} onPress={verify} disabled={loading} activeOpacity={0.85}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnTxt}>Verify OTP</Text>}
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
  sub: { fontSize: 14, color: t.textSecondary, textAlign: 'center', marginBottom: Spacing.sm, lineHeight: 22 },
  emailTxt: { color: t.primary, fontWeight: '700' },
  hint: { fontSize: 12, color: t.textMuted, textAlign: 'center', marginBottom: Spacing.lg },
  errorBox: { backgroundColor: t.dangerSoft, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.md, borderLeftWidth: 3, borderLeftColor: t.danger },
  errorTxt: { color: t.danger, fontSize: 13 },
  otpRow: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.sm, marginBottom: Spacing.xl },
  otpBox: {
    width: 48, height: 56, borderRadius: Radius.md, borderWidth: 1.5,
    borderColor: t.border, backgroundColor: t.bgInput, fontSize: 22,
    fontWeight: '700', color: t.textPrimary,
  },
  otpFilled: { borderColor: t.primary, backgroundColor: t.primarySoft },
  btn: { backgroundColor: t.primary, borderRadius: Radius.md, height: 52, alignItems: 'center', justifyContent: 'center' },
  btnOff: { opacity: 0.6 },
  btnTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
