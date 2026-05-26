import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, Modal, Pressable } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Spacing, Radius } from '../constants/theme';

const NOTE_OPTIONS = [
  { icon: '🔗', label: 'Meeting Link',       sub: 'Record via link',           color: 'cardPurple', route: '/recording' },
  { icon: '🎙', label: 'Record Audio',        sub: 'Use microphone',            color: 'cardYellow', route: '/recording' },
  { icon: '📂', label: 'Upload Audio File',   sub: 'Audio & video files',       color: 'cardOrange', route: '/new-note', tab: '1' },
  { icon: '📄', label: 'Upload Document',     sub: 'PDF, DOC, TXT',             color: 'cardMint',   route: '/new-note', tab: '1' },
  { icon: '✍️', label: 'Type or Paste Text',  sub: 'Manual entry',              color: 'cardPink',   route: '/new-note', tab: '0' },
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [recent, setRecent] = useState([]);
  const s = styles(theme);
  const firstName = user?.name?.split(' ')[0] || 'there';

  useFocusEffect(useCallback(() => {
    AsyncStorage.getItem('meeting_notes').then(v => {
      setRecent(v ? JSON.parse(v).slice(0, 3) : []);
    });
  }, []));

  const handleLogout = () => {
    setDropdownVisible(false);
    logout();
    router.replace('/login');
  };

  return (
    <SafeAreaView style={s.safe}>

      {/* ── Top bar ── */}
      <View style={s.topBar}>
        <View style={s.logoRow}>
          <View style={s.logoMark}><Text style={s.logoMarkTxt}>M</Text></View>
          <Text style={s.logoTxt}>MeetingNotes</Text>
        </View>
        <View style={s.topRight}>
          <TouchableOpacity style={s.iconBtn}>
            <Text style={s.iconBtnTxt}>🔔</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setDropdownVisible(true)} activeOpacity={0.85}>
            <View style={s.avatar}>
              <Text style={s.avatarTxt}>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Dropdown ── */}
      <Modal visible={dropdownVisible} transparent animationType="fade" onRequestClose={() => setDropdownVisible(false)}>
        <Pressable style={s.overlay} onPress={() => setDropdownVisible(false)}>
          <View style={s.dropdown}>
            <View style={s.ddHeader}>
              <View style={s.ddAvatar}><Text style={s.ddAvatarTxt}>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={s.ddName}>{user?.name}</Text>
                <Text style={s.ddEmail}>{user?.email}</Text>
              </View>
            </View>
            <View style={s.ddDivider} />
            <TouchableOpacity style={s.ddItem} onPress={() => { setDropdownVisible(false); router.push('/settings'); }} activeOpacity={0.7}>
              <Text style={s.ddItemIcon}>⚙️</Text>
              <Text style={s.ddItemTxt}>Settings</Text>
              <Text style={s.ddArrow}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.ddItem} onPress={() => { setDropdownVisible(false); router.push('/history'); }} activeOpacity={0.7}>
              <Text style={s.ddItemIcon}>🕐</Text>
              <Text style={s.ddItemTxt}>History</Text>
              <Text style={s.ddArrow}>›</Text>
            </TouchableOpacity>
            <View style={s.ddDivider} />
            <TouchableOpacity style={[s.ddItem, s.ddLogout]} onPress={handleLogout} activeOpacity={0.7}>
              <Text style={s.ddItemIcon}>🚪</Text>
              <Text style={s.ddLogoutTxt}>Logout</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Greeting */}
        <View style={s.greetRow}>
          <View>
            <Text style={s.greetSub}>Good day,</Text>
            <Text style={s.greetName}>Hi, <Text style={s.greetBold}>{firstName}</Text> 👋</Text>
          </View>
          <View style={s.statsBadge}>
            <Text style={s.statsBadgeTxt}>{recent.length} notes</Text>
          </View>
        </View>

        {/* Hero banner */}
        <View style={s.hero}>
          <View style={s.heroLeft}>
            <Text style={s.heroLabel}>NEW MEETING</Text>
            <Text style={s.heroTitle}>Capture Your{'\n'}Audio Note</Text>
            <TouchableOpacity style={s.heroBtn} onPress={() => router.push('/recording')} activeOpacity={0.88}>
              <Text style={s.heroBtnTxt}>▶  Start Recording</Text>
            </TouchableOpacity>
          </View>
          <View style={s.heroRight}>
            <View style={s.heroOrb}><Text style={s.heroOrbIcon}>🎙</Text></View>
          </View>
        </View>

        {/* Quick stats */}
        <View style={s.statsRow}>
          <TouchableOpacity style={[s.statCard, { backgroundColor: theme.primarySoft }]} onPress={() => router.push('/new-note')} activeOpacity={0.8}>
            <Text style={s.statCardIcon}>✍️</Text>
            <Text style={[s.statCardLabel, { color: theme.primary }]}>New Note</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.statCard, { backgroundColor: theme.accentSoft }]} onPress={() => router.push({ pathname: '/new-note', params: { tab: '1' } })} activeOpacity={0.8}>
            <Text style={s.statCardIcon}>📁</Text>
            <Text style={[s.statCardLabel, { color: theme.accent }]}>Upload</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.statCard, { backgroundColor: theme.successSoft }]} onPress={() => router.push('/history')} activeOpacity={0.8}>
            <Text style={s.statCardIcon}>🕐</Text>
            <Text style={[s.statCardLabel, { color: theme.success }]}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.statCard, { backgroundColor: theme.bgSurface }]} onPress={() => router.push('/settings')} activeOpacity={0.8}>
            <Text style={s.statCardIcon}>⚙️</Text>
            <Text style={[s.statCardLabel, { color: theme.textSecondary }]}>Settings</Text>
          </TouchableOpacity>
        </View>

        {/* All Notes list */}
        <View style={s.sectionRow}>
          <Text style={s.sectionTitle}>All Notes</Text>
          <TouchableOpacity onPress={() => router.push('/history')}><Text style={s.viewAll}>View all →</Text></TouchableOpacity>
        </View>

        {NOTE_OPTIONS.map((opt, i) => (
          <TouchableOpacity
            key={i}
            style={[s.noteRow, { backgroundColor: theme[opt.color] }]}
            onPress={() => router.push({ pathname: opt.route, params: opt.tab ? { tab: opt.tab } : {} })}
            activeOpacity={0.8}
          >
            <View style={s.noteIcon}><Text style={s.noteIconTxt}>{opt.icon}</Text></View>
            <View style={s.noteText}>
              <Text style={s.noteLabel}>{opt.label}</Text>
              <Text style={s.noteSub}>{opt.sub}</Text>
            </View>
            <View style={s.notePlus}><Text style={s.notePlusTxt}>+</Text></View>
          </TouchableOpacity>
        ))}

        {/* Recent */}
        {recent.length > 0 && (
          <>
            <View style={[s.sectionRow, { marginTop: Spacing.lg }]}>
              <Text style={s.sectionTitle}>Recent</Text>
            </View>
            {recent.map((n, i) => (
              <TouchableOpacity key={i} style={s.recentCard}
                onPress={() => router.push({ pathname: '/note-detail', params: { id: n.id } })} activeOpacity={0.8}>
                <View style={s.recentDot} />
                <View style={{ flex: 1 }}>
                  <Text style={s.recentTitle} numberOfLines={1}>{n.title}</Text>
                  <Text style={s.recentDate}>{new Date(n.createdAt).toLocaleDateString()}</Text>
                </View>
                <Text style={s.recentArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>

      {/* Bottom nav */}
      <View style={s.bottomNav}>
        {[
          { icon: '🏠', active: true,  action: () => {} },
          { icon: '📝', active: false, action: () => router.push('/new-note') },
          { icon: '🕐', active: false, action: () => router.push('/history') },
          { icon: '👤', active: false, action: () => setDropdownVisible(true) },
        ].map((item, i) => (
          <TouchableOpacity key={i} style={s.navItem} onPress={item.action} activeOpacity={0.7}>
            {item.active
              ? <View style={s.navActive}><Text style={s.navActiveIcon}>{item.icon}</Text></View>
              : <Text style={s.navIcon}>{item.icon}</Text>
            }
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = (t) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: t.bg },

  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    backgroundColor: t.bgCard, borderBottomWidth: 1, borderBottomColor: t.border,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  logoMark: { width: 34, height: 34, borderRadius: 10, backgroundColor: t.primary, alignItems: 'center', justifyContent: 'center' },
  logoMarkTxt: { color: '#fff', fontWeight: '800', fontSize: 17 },
  logoTxt: { fontSize: 17, fontWeight: '700', color: t.textPrimary, letterSpacing: -0.3 },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: t.bgSurface, alignItems: 'center', justifyContent: 'center' },
  iconBtnTxt: { fontSize: 16 },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: t.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: t.primaryLight },
  avatarTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  dropdown: {
    position: 'absolute', top: 68, right: Spacing.lg, width: 248,
    backgroundColor: t.bgCard, borderRadius: Radius.xl, overflow: 'hidden',
    borderWidth: 1, borderColor: t.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 14,
  },
  ddHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md },
  ddAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: t.primary, alignItems: 'center', justifyContent: 'center' },
  ddAvatarTxt: { color: '#fff', fontSize: 18, fontWeight: '700' },
  ddName: { fontSize: 14, fontWeight: '700', color: t.textPrimary },
  ddEmail: { fontSize: 12, color: t.textMuted, marginTop: 1 },
  ddDivider: { height: 1, backgroundColor: t.border },
  ddItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingHorizontal: Spacing.md, paddingVertical: 14 },
  ddItemIcon: { fontSize: 18, width: 24, textAlign: 'center' },
  ddItemTxt: { flex: 1, fontSize: 14, fontWeight: '600', color: t.textPrimary },
  ddArrow: { fontSize: 18, color: t.textMuted },
  ddLogout: { backgroundColor: t.dangerSoft },
  ddLogoutTxt: { flex: 1, fontSize: 14, fontWeight: '700', color: t.danger },

  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg },

  greetRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  greetSub: { fontSize: 13, color: t.textMuted },
  greetName: { fontSize: 22, color: t.textPrimary, marginTop: 2 },
  greetBold: { fontWeight: '800', color: t.textPrimary },
  statsBadge: { backgroundColor: t.primarySoft, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: 6 },
  statsBadgeTxt: { color: t.primary, fontSize: 13, fontWeight: '700' },

  hero: {
    backgroundColor: t.primary, borderRadius: Radius.xl, padding: Spacing.lg,
    flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg,
    shadowColor: t.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8,
  },
  heroLeft: { flex: 1 },
  heroLabel: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.6)', letterSpacing: 1.5, marginBottom: 6 },
  heroTitle: { fontSize: 20, fontWeight: '800', color: '#fff', lineHeight: 28, marginBottom: Spacing.md },
  heroBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: Radius.full,
    paddingHorizontal: Spacing.md, paddingVertical: 8, alignSelf: 'flex-start',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  heroBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 13 },
  heroRight: { marginLeft: Spacing.md },
  heroOrb: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  heroOrbIcon: { fontSize: 34 },

  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  statCard: { flex: 1, borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'center', gap: 4 },
  statCardIcon: { fontSize: 22 },
  statCardLabel: { fontSize: 11, fontWeight: '700' },

  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: t.textPrimary },
  viewAll: { fontSize: 13, color: t.primary, fontWeight: '600' },

  noteRow: {
    flexDirection: 'row', alignItems: 'center', borderRadius: Radius.lg,
    padding: Spacing.md, marginBottom: Spacing.sm, gap: Spacing.md,
  },
  noteIcon: { width: 42, height: 42, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.65)', alignItems: 'center', justifyContent: 'center' },
  noteIconTxt: { fontSize: 20 },
  noteText: { flex: 1 },
  noteLabel: { fontSize: 14, fontWeight: '700', color: t.textPrimary },
  noteSub: { fontSize: 12, color: t.textSecondary, marginTop: 1 },
  notePlus: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.7)', alignItems: 'center', justifyContent: 'center' },
  notePlusTxt: { fontSize: 18, color: t.textPrimary, fontWeight: '300', lineHeight: 22 },

  recentCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: t.bgCard,
    borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: t.border, gap: Spacing.sm,
  },
  recentDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: t.primary },
  recentTitle: { fontSize: 14, fontWeight: '600', color: t.textPrimary },
  recentDate: { fontSize: 11, color: t.textMuted, marginTop: 2 },
  recentArrow: { fontSize: 20, color: t.textMuted },

  bottomNav: {
    flexDirection: 'row', backgroundColor: t.bgCard,
    borderTopWidth: 1, borderTopColor: t.border,
    paddingVertical: Spacing.sm, paddingHorizontal: Spacing.xl,
    justifyContent: 'space-between', alignItems: 'center',
  },
  navItem: { alignItems: 'center', justifyContent: 'center', padding: Spacing.sm },
  navActive: { width: 44, height: 44, borderRadius: 22, backgroundColor: t.primary, alignItems: 'center', justifyContent: 'center' },
  navActiveIcon: { fontSize: 20 },
  navIcon: { fontSize: 22 },
});
