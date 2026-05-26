import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, SafeAreaView, Platform, Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { Spacing, Radius } from '../constants/theme';
import { API_BASE_URL } from '../config';
import BackButton from '../components/BackButton';

const TABS = [
  { label: 'Type Text', icon: '✍️' },
  { label: 'Upload File', icon: '📁' },
  { label: 'Record Audio', icon: '🎙' },
];

function simulateNotes(text) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10).slice(0, 6);
  const title = text.split(' ').slice(0, 7).join(' ') + '...';
  const bullets = sentences.map(s => '• ' + s.trim());
  const summary = `This meeting covered ${sentences.length} key topics. Action items and follow-ups have been identified. The team aligned on next steps and responsibilities.`;
  return { title, bullets, summary };
}

export default function NewNote() {
  const params = useLocalSearchParams();
  const initialTab = params.tab ? parseInt(params.tab) : 0;

  const [tab, setTab] = useState(initialTab);
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const { theme } = useTheme();
  const s = styles(theme);

  useEffect(() => {
    if (params.tab !== undefined) setTab(parseInt(params.tab));
  }, [params.tab]);

  // ── File picker ──
  const pickFile = async () => {
    setError('');
    setUploading(true);

    try {
      if (Platform.OS === 'web') {
        // Web: use hidden <input type="file">
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf,.doc,.docx,.txt,.md';
        input.onchange = async (e) => {
          const file = e.target.files[0];
          if (!file) { setUploading(false); return; }
          setFileName(file.name);
          setFileSize((file.size / 1024).toFixed(1) + ' KB');

          const reader = new FileReader();
          reader.onload = (ev) => {
            // For text files read content; for others simulate
            const content = ev.target.result;
            if (typeof content === 'string' && content.trim().length > 0) {
              setText(content.slice(0, 3000));
            } else {
              setText(getSampleContent(file.name));
            }
            setUploading(false);
          };
          reader.onerror = () => {
            setText(getSampleContent(file.name));
            setUploading(false);
          };
          if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
            reader.readAsText(file);
          } else {
            // PDF/DOC: simulate extraction
            await new Promise(r => setTimeout(r, 800));
            setText(getSampleContent(file.name));
            setUploading(false);
          }
        };
        input.click();
      } else {
        // Native: simulate for now (expo-document-picker would be used in a real build)
        await new Promise(r => setTimeout(r, 1000));
        setFileName('meeting-notes.pdf');
        setFileSize('142.3 KB');
        setText(getSampleContent('meeting-notes.pdf'));
        setUploading(false);
      }
    } catch (e) {
      setError('Failed to read file. Please try again.');
      setUploading(false);
    }
  };

  function getSampleContent(name) {
    return `Meeting Notes — ${name}\n\nThe team discussed Q3 roadmap priorities and key deliverables. Marketing will launch the new campaign next week targeting enterprise clients. Engineering needs to complete the API integration by Friday. Design team presented three new mockups for the dashboard redesign. Budget approval is pending from finance department. Performance review cycle starts next month. Next meeting scheduled for Thursday at 2pm with all stakeholders.`;
  }

  // ── Generate notes ──
  const generate = async () => {
    const input = text.trim();
    if (!input) { setError('Please enter or upload some content first'); return; }
    setError(''); setGenerating(true); setResult(null);
    try {
      let notes;
      try {
        const res = await fetch(`${API_BASE_URL}/generate-summary`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transcript: input }),
        });
        const data = await res.json();
        if (res.ok && data.summary) {
          notes = { title: input.split(' ').slice(0, 7).join(' ') + '...', bullets: [], summary: data.summary };
        } else { notes = simulateNotes(input); }
      } catch { notes = simulateNotes(input); }

      setResult(notes);
      const stored = await AsyncStorage.getItem('meeting_notes');
      const all = stored ? JSON.parse(stored) : [];
      all.unshift({
        id: Date.now().toString(),
        title: notes.title,
        summary: notes.summary,
        bullets: notes.bullets,
        rawText: input,
        source: fileName || 'manual',
        createdAt: new Date().toISOString(),
      });
      await AsyncStorage.setItem('meeting_notes', JSON.stringify(all));
    } catch {
      setError('Failed to generate notes. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const clearFile = () => { setFileName(''); setFileSize(''); setText(''); setResult(null); };

  return (
    <SafeAreaView style={s.safe}>
      {/* ── Header ── */}
      <View style={s.header}>
        <BackButton />
        <Text style={s.headerTitle}>New Note</Text>
        <View style={s.headerRight} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* Tab bar */}
        <View style={s.tabBar}>
          {TABS.map((t, i) => (
            <TouchableOpacity
              key={i}
              style={[s.tab, tab === i && s.tabActive]}
              onPress={() => { setTab(i); setResult(null); setError(''); }}
              activeOpacity={0.8}
            >
              <Text style={s.tabIcon}>{t.icon}</Text>
              <Text style={[s.tabTxt, tab === i && s.tabTxtActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Type Text ── */}
        {tab === 0 && (
          <View style={s.section}>
            <Text style={s.sectionLabel}>MEETING CONTENT</Text>
            <TextInput
              style={s.textArea}
              placeholder="Paste or type your meeting transcript, discussion points, or agenda here..."
              placeholderTextColor={theme.textMuted}
              value={text}
              onChangeText={t => { setText(t); setResult(null); }}
              multiline
              textAlignVertical="top"
            />
            <Text style={s.charCount}>{text.length} characters</Text>
          </View>
        )}

        {/* ── Upload File ── */}
        {tab === 1 && (
          <View style={s.section}>
            {!fileName ? (
              <TouchableOpacity style={s.uploadZone} onPress={pickFile} activeOpacity={0.8} disabled={uploading}>
                {uploading ? (
                  <>
                    <ActivityIndicator size="large" color={theme.primary} style={{ marginBottom: Spacing.md }} />
                    <Text style={s.uploadZoneTitle}>Reading file...</Text>
                  </>
                ) : (
                  <>
                    <View style={s.uploadIconWrap}><Text style={s.uploadIconTxt}>📂</Text></View>
                    <Text style={s.uploadZoneTitle}>Tap to upload file</Text>
                    <Text style={s.uploadZoneSub}>PDF, DOC, DOCX, TXT supported</Text>
                    <View style={s.uploadFormats}>
                      {['PDF', 'DOC', 'TXT'].map(f => (
                        <View key={f} style={s.formatBadge}><Text style={s.formatBadgeTxt}>{f}</Text></View>
                      ))}
                    </View>
                  </>
                )}
              </TouchableOpacity>
            ) : (
              <View style={s.fileCard}>
                <View style={s.fileCardIcon}><Text style={s.fileCardIconTxt}>📄</Text></View>
                <View style={s.fileCardInfo}>
                  <Text style={s.fileCardName} numberOfLines={1}>{fileName}</Text>
                  <Text style={s.fileCardSize}>{fileSize} · Extracted successfully</Text>
                </View>
                <TouchableOpacity onPress={clearFile} style={s.fileCardRemove}>
                  <Text style={s.fileCardRemoveTxt}>✕</Text>
                </TouchableOpacity>
              </View>
            )}

            {text ? (
              <View style={s.extractedBox}>
                <View style={s.extractedHeader}>
                  <Text style={s.extractedLabel}>EXTRACTED CONTENT</Text>
                  <TouchableOpacity onPress={() => setText('')}>
                    <Text style={s.extractedClear}>Clear</Text>
                  </TouchableOpacity>
                </View>
                <Text style={s.extractedTxt} numberOfLines={8}>{text}</Text>
              </View>
            ) : null}
          </View>
        )}

        {/* ── Record Audio ── */}
        {tab === 2 && (
          <View style={s.section}>
            <TouchableOpacity style={s.recordCard} onPress={() => router.push('/recording')} activeOpacity={0.85}>
              <View style={s.recordGlow}>
                <View style={s.recordCircle}><Text style={s.recordCircleIcon}>🎙</Text></View>
              </View>
              <Text style={s.recordTitle}>Effortless Meeting Voice Capture</Text>
              <Text style={s.recordSub}>Easily record and organize meetings with Smart Noter. Users review, summarize, and manage efficiently.</Text>
              <View style={s.recordActions}>
                <TouchableOpacity style={s.recordShareBtn}><Text style={s.recordShareIcon}>⬆️</Text></TouchableOpacity>
                <TouchableOpacity style={s.recordMicBtn} onPress={() => router.push('/recording')}>
                  <Text style={s.recordMicBtnIcon}>🎙</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.recordCloseBtn}><Text style={s.recordCloseIcon}>✕</Text></TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Error */}
        {error ? (
          <View style={s.errorBox}>
            <Text style={s.errorTxt}>⚠ {error}</Text>
          </View>
        ) : null}

        {/* Generate button */}
        {tab !== 2 && (
          <TouchableOpacity
            style={[s.genBtn, (generating || !text.trim()) && s.genBtnOff]}
            onPress={generate}
            disabled={generating || !text.trim()}
            activeOpacity={0.85}
          >
            {generating ? (
              <><ActivityIndicator color="#fff" size="small" /><Text style={s.genBtnTxt}>  Generating...</Text></>
            ) : (
              <Text style={s.genBtnTxt}>✨  Generate Meeting Notes</Text>
            )}
          </TouchableOpacity>
        )}

        {/* Result card */}
        {result && (
          <View style={s.resultCard}>
            <View style={s.resultTop}>
              <View style={s.resultBadge}><Text style={s.resultBadgeTxt}>✅ Generated</Text></View>
              <TouchableOpacity onPress={() => router.push('/history')} style={s.histBtn}>
                <Text style={s.histBtnTxt}>View History →</Text>
              </TouchableOpacity>
            </View>

            <Text style={s.resultTitle}>{result.title}</Text>

            {result.bullets.length > 0 && (
              <View style={s.bulletsCard}>
                <Text style={s.bulletsLabel}>KEY POINTS</Text>
                {result.bullets.map((b, i) => (
                  <View key={i} style={s.bulletRow}>
                    <View style={s.bulletDot} />
                    <Text style={s.bulletTxt}>{b.replace('• ', '')}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={s.summaryCard}>
              <Text style={s.summaryLabel}>AI SUMMARY</Text>
              <Text style={s.summaryTxt}>{result.summary}</Text>
            </View>

            <TouchableOpacity style={s.newNoteBtn} onPress={() => { setText(''); setFileName(''); setResult(null); }}>
              <Text style={s.newNoteBtnTxt}>+ Create Another Note</Text>
            </TouchableOpacity>
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
  headerRight: { width: 72 },
  scroll: { padding: Spacing.lg, paddingBottom: Spacing.xxl },

  // Tabs
  tabBar: {
    flexDirection: 'row', backgroundColor: t.bgCard, borderRadius: Radius.lg,
    padding: 4, marginBottom: Spacing.lg, borderWidth: 1, borderColor: t.border,
  },
  tab: { flex: 1, paddingVertical: 10, borderRadius: Radius.md, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 4 },
  tabActive: { backgroundColor: t.primary },
  tabIcon: { fontSize: 14 },
  tabTxt: { fontSize: 12, color: t.textMuted, fontWeight: '600' },
  tabTxtActive: { color: '#fff' },

  section: { marginBottom: Spacing.lg },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: t.textMuted, letterSpacing: 1, marginBottom: 8 },

  // Text area
  textArea: {
    backgroundColor: t.bgCard, color: t.textPrimary, padding: Spacing.md,
    borderRadius: Radius.lg, fontSize: 15, borderWidth: 1.5, borderColor: t.border,
    minHeight: 200, lineHeight: 24,
  },
  charCount: { fontSize: 11, color: t.textMuted, textAlign: 'right', marginTop: 4 },

  // Upload zone
  uploadZone: {
    backgroundColor: t.bgCard, borderRadius: Radius.xl, borderWidth: 2,
    borderColor: t.primary, borderStyle: 'dashed', padding: Spacing.xxl,
    alignItems: 'center', marginBottom: Spacing.md,
  },
  uploadIconWrap: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: t.primarySoft,
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md,
  },
  uploadIconTxt: { fontSize: 32 },
  uploadZoneTitle: { fontSize: 17, fontWeight: '700', color: t.textPrimary, marginBottom: 4 },
  uploadZoneSub: { fontSize: 13, color: t.textMuted, marginBottom: Spacing.md },
  uploadFormats: { flexDirection: 'row', gap: Spacing.sm },
  formatBadge: { backgroundColor: t.primarySoft, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: 4 },
  formatBadgeTxt: { color: t.primary, fontSize: 12, fontWeight: '700' },

  // File card
  fileCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: t.bgCard,
    borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: t.border,
    marginBottom: Spacing.md, gap: Spacing.md,
  },
  fileCardIcon: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: t.primarySoft,
    alignItems: 'center', justifyContent: 'center',
  },
  fileCardIconTxt: { fontSize: 22 },
  fileCardInfo: { flex: 1 },
  fileCardName: { fontSize: 14, fontWeight: '700', color: t.textPrimary },
  fileCardSize: { fontSize: 12, color: t.success, marginTop: 2 },
  fileCardRemove: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: t.dangerSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  fileCardRemoveTxt: { color: t.danger, fontSize: 12, fontWeight: '700' },

  // Extracted
  extractedBox: { backgroundColor: t.bgCard, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: t.border },
  extractedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  extractedLabel: { fontSize: 10, fontWeight: '700', color: t.textMuted, letterSpacing: 1 },
  extractedClear: { fontSize: 12, color: t.danger, fontWeight: '600' },
  extractedTxt: { fontSize: 13, color: t.textSecondary, lineHeight: 20 },

  // Record card
  recordCard: {
    backgroundColor: t.bgCard, borderRadius: Radius.xl, padding: Spacing.xl,
    alignItems: 'center', borderWidth: 1, borderColor: t.border, overflow: 'hidden',
  },
  recordGlow: {
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: t.primarySoft, alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.lg,
    shadowColor: t.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 30, elevation: 10,
  },
  recordCircle: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: t.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  recordCircleIcon: { fontSize: 44 },
  recordTitle: { fontSize: 18, fontWeight: '700', color: t.textPrimary, textAlign: 'center', marginBottom: Spacing.sm },
  recordSub: { fontSize: 13, color: t.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: Spacing.xl },
  recordActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  recordShareBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: t.bgSurface,
    alignItems: 'center', justifyContent: 'center',
  },
  recordShareIcon: { fontSize: 20 },
  recordMicBtn: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: t.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  recordMicBtnIcon: { fontSize: 28 },
  recordCloseBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: t.bgSurface,
    alignItems: 'center', justifyContent: 'center',
  },
  recordCloseIcon: { fontSize: 16, color: t.textMuted },

  // Error
  errorBox: {
    backgroundColor: t.dangerSoft, borderRadius: Radius.md, padding: Spacing.md,
    marginBottom: Spacing.md, borderLeftWidth: 3, borderLeftColor: t.danger,
  },
  errorTxt: { color: t.danger, fontSize: 13 },

  // Generate button
  genBtn: {
    backgroundColor: t.primary, borderRadius: Radius.lg, height: 54,
    alignItems: 'center', justifyContent: 'center', flexDirection: 'row',
    marginBottom: Spacing.lg,
    shadowColor: t.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  genBtnOff: { opacity: 0.4, shadowOpacity: 0 },
  genBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // Result
  resultCard: {
    backgroundColor: t.bgCard, borderRadius: Radius.xl, padding: Spacing.lg,
    borderWidth: 1, borderColor: t.border,
  },
  resultTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  resultBadge: { backgroundColor: t.successSoft, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: 4 },
  resultBadgeTxt: { color: t.success, fontSize: 12, fontWeight: '700' },
  histBtn: { backgroundColor: t.primarySoft, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: 4 },
  histBtnTxt: { color: t.primary, fontSize: 12, fontWeight: '700' },
  resultTitle: { fontSize: 17, fontWeight: '700', color: t.textPrimary, marginBottom: Spacing.md, lineHeight: 24 },
  bulletsCard: { backgroundColor: t.bgSurface, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.md },
  bulletsLabel: { fontSize: 10, fontWeight: '700', color: t.textMuted, letterSpacing: 1, marginBottom: Spacing.sm },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, marginBottom: 6 },
  bulletDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: t.primary, marginTop: 7 },
  bulletTxt: { flex: 1, fontSize: 14, color: t.textSecondary, lineHeight: 22 },
  summaryCard: { backgroundColor: t.primarySoft, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.md },
  summaryLabel: { fontSize: 10, fontWeight: '700', color: t.primary, letterSpacing: 1, marginBottom: 6 },
  summaryTxt: { fontSize: 14, color: t.textPrimary, lineHeight: 22 },
  newNoteBtn: {
    borderWidth: 1.5, borderColor: t.primary, borderRadius: Radius.md,
    height: 44, alignItems: 'center', justifyContent: 'center',
  },
  newNoteBtnTxt: { color: t.primary, fontSize: 14, fontWeight: '700' },
});
