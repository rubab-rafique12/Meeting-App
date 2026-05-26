import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, Animated, Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Spacing, Radius } from '../constants/theme';

const { width } = Dimensions.get('window');

const PRIMARY    = '#0D7377';
const PRIMARY_S  = '#E0F5F5';
const ACCENT     = '#E8A838';
const RIU_BLUE   = '#2B5EA7';
const TEXT_DARK  = '#0D1B2A';
const TEXT_MID   = '#4A5568';
const BORDER     = '#DDE3EC';
const BG         = '#F0F4F8';

export default function Splash() {
  const logoScale   = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textY       = useRef(new Animated.Value(28)).current;
  const btnOpacity  = useRef(new Animated.Value(0)).current;
  const btnY        = useRef(new Animated.Value(20)).current;
  const ring1       = useRef(new Animated.Value(0.85)).current;
  const ring2       = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    // Breathing rings
    Animated.loop(Animated.sequence([
      Animated.timing(ring1, { toValue: 1.1,  duration: 2200, useNativeDriver: true }),
      Animated.timing(ring1, { toValue: 0.92, duration: 2200, useNativeDriver: true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(ring2, { toValue: 1.15, duration: 2800, useNativeDriver: true }),
      Animated.timing(ring2, { toValue: 0.85, duration: 2800, useNativeDriver: true }),
    ])).start();

    // Entrance
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale,   { toValue: 1, tension: 55, friction: 7, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(textOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(textY,       { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(btnOpacity,  { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(btnY,        { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const proceed = async (path = '/login') => {
    await AsyncStorage.setItem('splash_seen', 'true');
    router.replace(path);
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* Decorative blobs */}
      <View style={s.blobTR} />
      <View style={s.blobBL} />

      <View style={s.root}>

        {/* ── Dual Logo Header ── */}
        <View style={s.header}>
          {/* RIO */}
          <View style={s.rioRow}>
            <Text style={s.rioR}>R</Text>
            <Text style={s.rioLeaf}>🌿</Text>
            <Text style={s.rioO}>O</Text>
            <View style={s.rioTextCol}>
              <Text style={s.rioName}>RIPHAH INTERNATIONAL OFFICE</Text>
              <Text style={s.rioTag}>Branching Beyond Borders</Text>
            </View>
          </View>
          <View style={s.hDivider} />
          {/* RIU */}
          <View style={s.riuRow}>
            <View style={s.riuEmblem}><Text style={s.riuSym}>✦</Text></View>
            <View>
              <Text style={s.riuName}>RIPHAH</Text>
              <Text style={s.riuSub}>INTERNATIONAL UNIVERSITY</Text>
            </View>
          </View>
        </View>

        {/* ── Orb illustration ── */}
        <View style={s.orbArea}>
          <Animated.View style={[s.ring2, { transform: [{ scale: ring2 }] }]} />
          <Animated.View style={[s.ring1, { transform: [{ scale: ring1 }] }]} />
          <Animated.View style={[s.orbWrap, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
            <View style={s.orbOuter}>
              <View style={s.orbMid}>
                <View style={s.orbCore}>
                  <Text style={s.orbIcon}>🎙</Text>
                </View>
              </View>
            </View>
          </Animated.View>
        </View>

        {/* ── App name + description ── */}
        <Animated.View style={[s.textBlock, { opacity: textOpacity, transform: [{ translateY: textY }] }]}>
          <Text style={s.appName}>MeetingNotes</Text>
          <Text style={s.appTagline}>AI-Powered Meeting Intelligence</Text>
          <Text style={s.appDesc}>
            Record, transcribe, and summarize your meetings instantly.{'\n'}
            Never miss an important detail again.
          </Text>

          {/* Feature pills */}
          <View style={s.pills}>
            {['🎙  Record', '📄  Transcribe', '✨  Summarize'].map((p, i) => (
              <View key={i} style={s.pill}>
                <Text style={s.pillTxt}>{p}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* ── CTA buttons ── */}
        <Animated.View style={[s.cta, { opacity: btnOpacity, transform: [{ translateY: btnY }] }]}>
          <TouchableOpacity style={s.getStartedBtn} onPress={() => proceed('/login')} activeOpacity={0.88}>
            <Text style={s.getStartedTxt}>Get Started  →</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.signInRow} onPress={() => proceed('/login')} activeOpacity={0.7}>
            <Text style={s.signInTxt}>
              Already have an account?{'  '}
              <Text style={s.signInAccent}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>

      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },

  blobTR: {
    position: 'absolute', top: -90, right: -90,
    width: 280, height: 280, borderRadius: 140,
    backgroundColor: PRIMARY_S, opacity: 0.65,
  },
  blobBL: {
    position: 'absolute', bottom: -70, left: -70,
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: '#FEF3DC', opacity: 0.75,
  },

  root: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
    justifyContent: 'space-between',
  },

  // ── Header ──
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 10,
    backgroundColor: '#fff',
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderWidth: 1, borderColor: BORDER,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  rioRow:    { flexDirection: 'row', alignItems: 'center', gap: 3 },
  rioR:      { fontSize: 22, fontWeight: '800', fontStyle: 'italic', color: RIU_BLUE },
  rioLeaf:   { fontSize: 17 },
  rioO:      { fontSize: 22, fontWeight: '800', fontStyle: 'italic', color: RIU_BLUE },
  rioTextCol:{ marginLeft: 5 },
  rioName:   { fontSize: 7, fontWeight: '700', color: RIU_BLUE, letterSpacing: 0.5 },
  rioTag:    { fontSize: 6.5, fontWeight: '600', color: ACCENT, letterSpacing: 0.3 },
  hDivider:  { width: 1, height: 32, backgroundColor: BORDER, marginHorizontal: 4 },
  riuRow:    { flexDirection: 'row', alignItems: 'center', gap: 7 },
  riuEmblem: {
    width: 32, height: 36, borderRadius: 16,
    borderWidth: 2, borderColor: RIU_BLUE,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#EBF3FD',
  },
  riuSym:    { fontSize: 14, color: ACCENT },
  riuName:   { fontSize: 15, fontWeight: '800', color: RIU_BLUE, letterSpacing: 1 },
  riuSub:    { fontSize: 7, fontWeight: '600', color: TEXT_MID, letterSpacing: 1.2 },

  // ── Orb ──
  orbArea: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    marginVertical: Spacing.md,
  },
  ring2: {
    position: 'absolute',
    width: 290, height: 290, borderRadius: 145,
    borderWidth: 1.5, borderColor: PRIMARY + '18',
    backgroundColor: PRIMARY_S + '28',
  },
  ring1: {
    position: 'absolute',
    width: 220, height: 220, borderRadius: 110,
    borderWidth: 1.5, borderColor: PRIMARY + '35',
    backgroundColor: PRIMARY_S + '55',
  },
  orbWrap: { alignItems: 'center', justifyContent: 'center' },
  orbOuter: {
    width: 168, height: 168, borderRadius: 84,
    backgroundColor: PRIMARY_S,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: PRIMARY, shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28, shadowRadius: 28, elevation: 12,
  },
  orbMid: {
    width: 130, height: 130, borderRadius: 65,
    backgroundColor: PRIMARY + '22',
    alignItems: 'center', justifyContent: 'center',
  },
  orbCore: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: PRIMARY,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: PRIMARY, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45, shadowRadius: 14, elevation: 8,
  },
  orbIcon: { fontSize: 44 },

  // ── Text ──
  textBlock: { alignItems: 'center', paddingHorizontal: Spacing.sm },
  appName: {
    fontSize: 34, fontWeight: '800', color: TEXT_DARK,
    letterSpacing: -1, marginBottom: 6,
  },
  appTagline: {
    fontSize: 14, fontWeight: '700', color: PRIMARY,
    letterSpacing: 0.4, marginBottom: Spacing.md,
  },
  appDesc: {
    fontSize: 15, color: TEXT_MID, textAlign: 'center',
    lineHeight: 24, marginBottom: Spacing.lg,
  },
  pills: {
    flexDirection: 'row', gap: Spacing.sm,
    flexWrap: 'wrap', justifyContent: 'center',
  },
  pill: {
    backgroundColor: '#fff', borderRadius: Radius.full,
    paddingHorizontal: Spacing.md, paddingVertical: 8,
    borderWidth: 1, borderColor: BORDER,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  pillTxt: { fontSize: 13, fontWeight: '600', color: TEXT_DARK },

  // ── CTA ──
  cta: { gap: Spacing.md },
  getStartedBtn: {
    backgroundColor: PRIMARY,
    borderRadius: Radius.md,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.38,
    shadowRadius: 16,
    elevation: 8,
  },
  getStartedTxt: {
    color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: 0.4,
  },
  signInRow: { alignItems: 'center', paddingVertical: 4 },
  signInTxt: { fontSize: 14, color: TEXT_MID },
  signInAccent: { color: PRIMARY, fontWeight: '700' },
});
