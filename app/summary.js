import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, SafeAreaView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { API_BASE_URL } from '../config';
import { useTheme } from '../context/ThemeContext';
import { Spacing, Radius } from '../constants/theme';
import BackButton from '../components/BackButton';

export default function Summary() {
  const { transcript } = useLocalSearchParams();
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { theme } = useTheme();
  const s = styles(theme);

  useEffect(() => { if (transcript) generate(); }, []);

  async function generate() {
    try {
      setLoading(true); setError(''); setSummary('');
      const res = await fetch(`${API_BASE_URL}/generate-summary`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Server error');
      setSummary(data.summary);
    } catch (e) {
      setError(e.message || 'Failed to generate summary.');
    } finally { setLoading(false); }
  }

  return (
    <SafeAreaView style={s.safe}>
      {/* ── Header ── */}
      <View style={s.header}>
        <BackButton />
        <Text style={s.headerTitle}>AI Summary</Text>
        <View style={s.headerRight} />
      </View>

      <View style={s.container}>
        <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
          {loading && (
            <View style={s.loadCard}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={s.loadTitle}>Generating Summary</Text>
              <Text style={s.loadSub}>AI is analysing your meeting...</Text>
            </View>
          )}
          {!loading && error ? (
            <View style={s.errorCard}>
              <Text style={s.errorIcon}>⚠</Text>
              <Text style={s.errorTitle}>Something went wrong</Text>
              <Text style={s.errorDesc}>{error}</Text>
            </View>
          ) : null}
          {!loading && summary ? (
            <View style={s.summaryCard}>
              <View style={s.cardHead}><Text style={s.cardHeadIcon}>✨</Text><Text style={s.cardHeadTxt}>AI Summary</Text></View>
              <View style={s.divider} />
              <Text style={s.summaryTxt}>{summary}</Text>
            </View>
          ) : null}
          {!loading && !summary && !error && !transcript && (
            <View style={s.emptyCard}>
              <Text style={s.emptyIcon}>📋</Text>
              <Text style={s.emptyTitle}>No transcript available</Text>
              <Text style={s.emptySub}>Record a meeting first.</Text>
            </View>
          )}
        </ScrollView>
        <TouchableOpacity
          onPress={generate} disabled={loading || !transcript}
          style={[s.btn, (loading || !transcript) && s.btnOff]} activeOpacity={0.85}>
          {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.btnTxt}>{summary ? '↺  Regenerate' : '✨  Generate Summary'}</Text>}
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
  headerTitle: { fontSize: 16, fontWeight: '700', color: t.textPrimary },
  headerRight: { width: 72 },
  container: { flex: 1, padding: Spacing.lg },
  scroll: { flex: 1 },
  loadCard: { backgroundColor: t.bgCard, borderRadius: Radius.xl, borderWidth: 1, borderColor: t.border, padding: Spacing.xxl, alignItems: 'center', marginBottom: Spacing.md },
  loadTitle: { fontSize: 18, fontWeight: '700', color: t.textPrimary, marginTop: Spacing.lg, marginBottom: 4 },
  loadSub: { fontSize: 14, color: t.textMuted },
  errorCard: { backgroundColor: t.dangerSoft, borderRadius: Radius.lg, borderWidth: 1, borderColor: t.danger, padding: Spacing.lg, alignItems: 'center' },
  errorIcon: { fontSize: 32, marginBottom: Spacing.sm },
  errorTitle: { fontSize: 16, fontWeight: '700', color: t.danger, marginBottom: 4 },
  errorDesc: { fontSize: 14, color: t.danger, textAlign: 'center', lineHeight: 22 },
  summaryCard: { backgroundColor: t.bgCard, borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: t.border },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  cardHeadIcon: { fontSize: 18 },
  cardHeadTxt: { fontSize: 16, fontWeight: '700', color: t.textPrimary },
  divider: { height: 1, backgroundColor: t.border, marginBottom: Spacing.md },
  summaryTxt: { fontSize: 15, color: t.textSecondary, lineHeight: 26 },
  emptyCard: { backgroundColor: t.bgCard, borderRadius: Radius.xl, borderWidth: 1, borderColor: t.border, padding: Spacing.xxl, alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: Spacing.md },
  emptyTitle: { fontSize: 17, fontWeight: '600', color: t.textSecondary, marginBottom: 4 },
  emptySub: { fontSize: 14, color: t.textMuted },
  btn: { backgroundColor: t.primary, borderRadius: Radius.md, height: 52, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.md },
  btnOff: { opacity: 0.35 },
  btnTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
