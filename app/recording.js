import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView, Animated, Easing } from 'react-native';
import { Audio } from 'expo-av';
import { router } from 'expo-router';
import { API_BASE_URL } from '../config';
import { useTheme } from '../context/ThemeContext';
import { Spacing, Radius } from '../constants/theme';
import BackButton from '../components/BackButton';

const BARS = [14, 22, 34, 26, 42, 30, 46, 38, 32, 50, 36, 28, 44, 40, 24, 48, 34, 30, 42, 22, 38, 46, 32, 26, 40];

export default function Recording() {
  const [recording, setRecording]   = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [elapsed, setElapsed]       = useState(0);
  const timerRef  = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const { theme } = useTheme();
  const s = styles(theme);

  useEffect(() => {
    if (isRecording) {
      Animated.loop(Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.07, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.96, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])).start();
    } else { pulseAnim.setValue(1); }
  }, [isRecording]);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else { clearInterval(timerRef.current); if (!isUploading) setElapsed(0); }
    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  const fmt = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  async function startRecording() {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (perm.status !== 'granted') { alert('Microphone permission required'); return; }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await rec.startAsync();
      setRecording(rec); setIsRecording(true);
    } catch { alert('Could not start recording.'); }
  }

  async function stopRecording() {
    try {
      if (!recording) return;
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null); setIsRecording(false); setIsUploading(true);
      const fd = new FormData();
      if (typeof window !== 'undefined') {
        const blob = await (await fetch(uri)).blob();
        fd.append('audio', blob, 'meeting.m4a');
      } else { fd.append('audio', { uri, type: 'audio/m4a', name: 'meeting.m4a' }); }
      const res = await fetch(`${API_BASE_URL}/upload-audio`, { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Server error');
      setIsUploading(false);
      router.push({ pathname: '/notes', params: { transcript: data.transcript } });
    } catch (e) { setIsUploading(false); alert('Error: ' + (e.message || 'Could not process audio.')); }
  }

  return (
    <SafeAreaView style={s.safe}>
      {/* ── Header ── */}
      <View style={s.header}>
        <BackButton />
        <Text style={s.headerTitle}>Record Meeting</Text>
        <View style={s.headerRight} />
      </View>

      <View style={s.container}>

        <Text style={s.subtitle}>Effortless Meeting Voice Capture</Text>

        {/* Orb */}
        <Animated.View style={[s.orbOuter, { transform: [{ scale: pulseAnim }] }]}>
          <View style={s.orbMid}>
            <View style={[s.orbCore, isRecording && s.orbCoreActive]}>
              {isUploading
                ? <ActivityIndicator size="large" color="#fff" />
                : <Text style={s.orbIcon}>🎙</Text>
              }
            </View>
          </View>
        </Animated.View>

        {/* Waveform */}
        <View style={s.wave}>
          {BARS.map((h, i) => (
            <View key={i} style={[s.waveBar, {
              height: isRecording ? h : h * 0.25,
              backgroundColor: isRecording
                ? (i % 4 === 0 ? theme.accent : theme.primary)
                : theme.border,
            }]} />
          ))}
        </View>

        {(isRecording || isUploading) && (
          <Text style={s.timer}>{isUploading ? 'Processing...' : fmt(elapsed)}</Text>
        )}

        <Text style={s.desc}>
          {isUploading ? 'Uploading and transcribing your recording...'
            : isRecording ? 'Recording in progress — speak clearly.'
            : 'Tap the microphone to start recording your meeting. We\'ll transcribe and summarize it automatically.'}
        </Text>

        {/* Controls */}
        <View style={s.controls}>
          <TouchableOpacity style={s.sideBtn}
            onPress={() => router.push({ pathname: '/new-note', params: { tab: '1' } })} activeOpacity={0.8}>
            <Text style={s.sideBtnIcon}>⬆️</Text>
            <Text style={s.sideBtnTxt}>Upload</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.micBtn, isRecording && s.micBtnRec]}
            onPress={isRecording ? stopRecording : startRecording}
            disabled={isUploading} activeOpacity={0.88}
          >
            {isUploading
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.micBtnIcon}>{isRecording ? '■' : '🎙'}</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity style={s.sideBtn} onPress={() => router.back()} activeOpacity={0.8}>
            <Text style={s.sideBtnIcon}>✕</Text>
            <Text style={s.sideBtnTxt}>Close</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.hint}>
          {isRecording ? 'Tap ■ to stop' : isUploading ? 'Please wait...' : 'Tap 🎙 to begin'}
        </Text>
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
  container: { flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.xl },
  subtitle: { fontSize: 13, color: t.textMuted, fontWeight: '600', letterSpacing: 0.3, textAlign: 'center' },
  orbOuter: {
    width: 210, height: 210, borderRadius: 105, backgroundColor: t.primarySoft,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: t.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.25, shadowRadius: 40, elevation: 10,
  },
  orbMid: { width: 168, height: 168, borderRadius: 84, backgroundColor: t.primary + '22', alignItems: 'center', justifyContent: 'center' },
  orbCore: {
    width: 120, height: 120, borderRadius: 60, backgroundColor: t.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: t.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8,
  },
  orbCoreActive: { backgroundColor: t.danger },
  orbIcon: { fontSize: 50 },
  wave: { flexDirection: 'row', alignItems: 'center', gap: 3, height: 56 },
  waveBar: { width: 4, borderRadius: 2, minHeight: 3 },
  timer: { fontSize: 36, fontWeight: '700', color: t.textPrimary, letterSpacing: 3 },
  desc: { fontSize: 14, color: t.textSecondary, textAlign: 'center', lineHeight: 22, paddingHorizontal: Spacing.lg, maxWidth: 320 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xl },
  sideBtn: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: t.bgCard,
    borderWidth: 1, borderColor: t.border, alignItems: 'center', justifyContent: 'center',
  },
  sideBtnIcon: { fontSize: 18 },
  sideBtnTxt: { fontSize: 9, color: t.textMuted, fontWeight: '600', marginTop: 1 },
  micBtn: {
    width: 76, height: 76, borderRadius: 38, backgroundColor: t.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: t.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 10,
  },
  micBtnRec: { backgroundColor: t.danger, shadowColor: t.danger },
  micBtnIcon: { fontSize: 30, color: '#fff' },
  hint: { fontSize: 12, color: t.textMuted, textAlign: 'center', fontWeight: '500' },
});
