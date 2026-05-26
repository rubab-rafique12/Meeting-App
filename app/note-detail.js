import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { Spacing, Radius } from '../constants/theme';
import BackButton from '../components/BackButton';

export default function NoteDetail() {
  const { id } = useLocalSearchParams();
  const [note, setNote] = useState(null);
  const { theme } = useTheme();
  const s = styles(theme);

  useEffect(() => {
    AsyncStorage.getItem('meeting_notes').then(v => {
      if (v) {
        const all = JSON.parse(v);
        setNote(all.find(n => n.id === id) || null);
      }
    });
  }, [id]);

  const deleteNote = () => {
    Alert.alert('Delete Note', 'Delete this note permanently?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          const v = await AsyncStorage.getItem('meeting_notes');
          const all = v ? JSON.parse(v) : [];
          await AsyncStorage.setItem('meeting_notes', JSON.stringify(all.filter(n => n.id !== id)));
          router.back();
        }
      }
    ]);
  };

  if (!note) return (
    <View style={s.loading}><Text style={s.loadingTxt}>Loading...</Text></View>
  );

  return (
    <SafeAreaView style={s.safe}>
      {/* ── Header ── */}
      <View style={s.header}>
        <BackButton />
        <Text style={s.headerTitle}>Note Detail</Text>
        <TouchableOpacity onPress={deleteNote} style={s.headerDeleteBtn}>
          <Text style={s.headerDeleteTxt}>🗑</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Meta */}
        <View style={s.metaRow}>
          <View style={s.dateBadge}>
            <Text style={s.dateTxt}>{new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
          </View>
        </View>

        <Text style={s.title}>{note.title}</Text>

        {/* Bullets */}
        {note.bullets?.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionLabel}>KEY POINTS</Text>
            <View style={s.card}>
              {note.bullets.map((b, i) => (
                <Text key={i} style={s.bulletTxt}>{b}</Text>
              ))}
            </View>
          </View>
        )}

        {/* Summary */}
        {note.summary && (
          <View style={s.section}>
            <Text style={s.sectionLabel}>AI SUMMARY</Text>
            <View style={[s.card, s.summaryCard]}>
              <Text style={s.summaryTxt}>{note.summary}</Text>
            </View>
          </View>
        )}

        {/* Raw */}
        {note.rawText && (
          <View style={s.section}>
            <Text style={s.sectionLabel}>ORIGINAL TRANSCRIPT</Text>
            <View style={s.card}>
              <Text style={s.rawTxt}>{note.rawText}</Text>
            </View>
          </View>
        )}

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
  headerTitle: { fontSize: 16, fontWeight: '700', color: t.textPrimary },
  headerDeleteBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: t.dangerSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  headerDeleteTxt: { fontSize: 16 },
  scroll: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  loading: { flex: 1, backgroundColor: t.bg, alignItems: 'center', justifyContent: 'center' },
  loadingTxt: { color: t.textMuted, fontSize: 16 },
  metaRow: { flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginBottom: Spacing.md },
  dateBadge: { backgroundColor: t.primarySoft, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: 4 },
  dateTxt: { color: t.primary, fontSize: 12, fontWeight: '700' },
  title: { fontSize: 22, fontWeight: '800', color: t.textPrimary, marginBottom: Spacing.xl, lineHeight: 30 },
  section: { marginBottom: Spacing.lg },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: t.textMuted, letterSpacing: 1, marginBottom: 8 },
  card: { backgroundColor: t.bgCard, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: t.border },
  summaryCard: { backgroundColor: t.primarySoft, borderColor: t.primaryLight },
  bulletTxt: { fontSize: 14, color: t.textSecondary, lineHeight: 26 },
  summaryTxt: { fontSize: 15, color: t.textPrimary, lineHeight: 24 },
  rawTxt: { fontSize: 14, color: t.textSecondary, lineHeight: 24 },
});
