import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { Spacing, Radius } from '../constants/theme';
import BackButton from '../components/BackButton';

export default function Notes() {
  const { transcript } = useLocalSearchParams();
  const wordCount = transcript ? transcript.trim().split(/\s+/).length : 0;
  const { theme } = useTheme();
  const s = styles(theme);

  return (
    <SafeAreaView style={s.safe}>
      {/* ── Header ── */}
      <View style={s.header}>
        <BackButton />
        <Text style={s.headerTitle}>Transcript</Text>
        <View style={s.headerRight} />
      </View>

      <View style={s.container}>
        {transcript ? (
          <View style={s.statsRow}>
            <View style={s.stat}><Text style={s.statVal}>{wordCount}</Text><Text style={s.statLbl}>Words</Text></View>
            <View style={s.stat}><Text style={s.statVal}>{Math.ceil(wordCount / 130)}</Text><Text style={s.statLbl}>Min read</Text></View>
            <View style={s.stat}><Text style={s.statVal}>✓</Text><Text style={s.statLbl}>Transcribed</Text></View>
          </View>
        ) : null}
        <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
          <View style={s.card}>
            <View style={s.cardHead}><Text style={s.cardHeadIcon}>📄</Text><Text style={s.cardHeadTxt}>Transcript</Text></View>
            <View style={s.divider} />
            <Text style={s.transcript}>{transcript || 'No transcript available.\nPlease record a meeting first.'}</Text>
          </View>
        </ScrollView>
        <TouchableOpacity
          onPress={() => router.push({ pathname: '/summary', params: { transcript } })}
          disabled={!transcript} style={[s.btn, !transcript && s.btnOff]} activeOpacity={0.85}>
          <Text style={s.btnTxt}>✨  Generate AI Summary</Text>
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
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  stat: { flex: 1, backgroundColor: t.bgCard, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center', borderWidth: 1, borderColor: t.border },
  statVal: { fontSize: 20, fontWeight: '700', color: t.primary },
  statLbl: { fontSize: 11, color: t.textMuted, marginTop: 2 },
  scroll: { flex: 1 },
  card: { backgroundColor: t.bgCard, borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: t.border },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  cardHeadIcon: { fontSize: 18 },
  cardHeadTxt: { fontSize: 16, fontWeight: '700', color: t.textPrimary },
  divider: { height: 1, backgroundColor: t.border, marginBottom: Spacing.md },
  transcript: { fontSize: 15, color: t.textSecondary, lineHeight: 26 },
  btn: { backgroundColor: t.primary, borderRadius: Radius.md, height: 52, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.md },
  btnOff: { opacity: 0.35 },
  btnTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
