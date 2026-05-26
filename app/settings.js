import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Switch, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Spacing, Radius } from '../constants/theme';
import { router } from 'expo-router';
import BackButton from '../components/BackButton';

export default function Settings() {
  const { user, logout, updateProfile } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();
  const s = styles(theme);

  const [name, setName]         = useState(user?.name || '');
  const [email, setEmail]       = useState(user?.email || '');
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw]       = useState('');
  const [notifs, setNotifs]     = useState(true);
  const [saving, setSaving]     = useState(false);
  const [success, setSuccess]   = useState('');
  const [error, setError]       = useState('');
  const [tab, setTab]           = useState('profile');

  const saveProfile = async () => {
    if (!name.trim() || !email.trim()) { setError('Name and email are required'); return; }
    setSaving(true); setError(''); setSuccess('');
    const res = await updateProfile({ name: name.trim(), email: email.trim() });
    setSaving(false);
    res.success ? setSuccess('Profile updated!') : setError(res.error || 'Failed');
  };

  const savePassword = async () => {
    if (!currentPw || !newPw) { setError('Fill in both fields'); return; }
    if (currentPw !== user?.password) { setError('Current password is incorrect'); return; }
    if (newPw.length < 8) { setError('New password must be at least 8 characters'); return; }
    setSaving(true); setError(''); setSuccess('');
    const res = await updateProfile({ password: newPw });
    setSaving(false);
    if (res.success) { setSuccess('Password updated!'); setCurrentPw(''); setNewPw(''); }
    else setError(res.error || 'Failed');
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => { logout(); router.replace('/login'); } },
    ]);
  };

  const TABS = [
    { key: 'profile',  label: 'Profile',  icon: '👤' },
    { key: 'security', label: 'Security', icon: '🔒' },
    { key: 'app',      label: 'App',      icon: '⚙️' },
  ];

  return (
    <SafeAreaView style={s.safe}>
      {/* ── Header ── */}
      <View style={s.header}>
        <BackButton />
        <Text style={s.headerTitle}>Settings</Text>
        <View style={s.headerRight} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

        {/* User card */}
        <View style={s.userCard}>
          <View style={s.userAvatar}><Text style={s.userAvatarTxt}>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={s.userName}>{user?.name}</Text>
            <Text style={s.userEmail}>{user?.email}</Text>
          </View>
          <View style={s.userBadge}><Text style={s.userBadgeTxt}>Active</Text></View>
        </View>

        {/* Tabs */}
        <View style={s.tabBar}>
          {TABS.map(t => (
            <TouchableOpacity key={t.key} style={[s.tabItem, tab === t.key && s.tabItemActive]}
              onPress={() => { setTab(t.key); setError(''); setSuccess(''); }}>
              <Text style={s.tabIcon}>{t.icon}</Text>
              <Text style={[s.tabTxt, tab === t.key && s.tabTxtActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {error  ? <View style={s.errorBox}><Text style={s.errorTxt}>⚠  {error}</Text></View>  : null}
        {success? <View style={s.successBox}><Text style={s.successTxt}>✓  {success}</Text></View>: null}

        {/* Profile */}
        {tab === 'profile' && (
          <View style={s.card}>
            <Text style={s.cardTitle}>Update Profile</Text>
            <Text style={s.label}>FULL NAME</Text>
            <TextInput style={s.input} value={name} onChangeText={setName} placeholderTextColor={theme.textMuted} placeholder="Your name" />
            <Text style={s.label}>EMAIL ADDRESS</Text>
            <TextInput style={s.input} value={email} onChangeText={setEmail} placeholderTextColor={theme.textMuted} placeholder="your@email.com" autoCapitalize="none" keyboardType="email-address" />
            <TouchableOpacity style={[s.btn, saving && s.btnOff]} onPress={saveProfile} disabled={saving} activeOpacity={0.88}>
              {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.btnTxt}>Save Changes</Text>}
            </TouchableOpacity>
          </View>
        )}

        {/* Security */}
        {tab === 'security' && (
          <View style={s.card}>
            <Text style={s.cardTitle}>Change Password</Text>
            <Text style={s.label}>CURRENT PASSWORD</Text>
            <TextInput style={s.input} value={currentPw} onChangeText={setCurrentPw} secureTextEntry placeholderTextColor={theme.textMuted} placeholder="••••••••" />
            <Text style={s.label}>NEW PASSWORD</Text>
            <TextInput style={s.input} value={newPw} onChangeText={setNewPw} secureTextEntry placeholderTextColor={theme.textMuted} placeholder="Min. 8 characters" />
            <TouchableOpacity style={[s.btn, saving && s.btnOff]} onPress={savePassword} disabled={saving} activeOpacity={0.88}>
              {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.btnTxt}>Update Password</Text>}
            </TouchableOpacity>
          </View>
        )}

        {/* App */}
        {tab === 'app' && (
          <>
            <View style={s.card}>
              <Text style={s.cardTitle}>Appearance</Text>
              <View style={s.toggleRow}>
                <View style={s.toggleLeft}>
                  <View style={[s.toggleIconWrap, { backgroundColor: isDark ? '#1A2332' : '#FEF9EC' }]}>
                    <Text style={s.toggleIconTxt}>{isDark ? '🌙' : '☀️'}</Text>
                  </View>
                  <View>
                    <Text style={s.toggleLabel}>Dark Mode</Text>
                    <Text style={s.toggleSub}>{isDark ? 'Dark theme active' : 'Light theme active'}</Text>
                  </View>
                </View>
                <Switch value={isDark} onValueChange={toggleTheme}
                  trackColor={{ false: theme.border, true: theme.primary }} thumbColor="#fff" />
              </View>
            </View>

            <View style={s.card}>
              <Text style={s.cardTitle}>Notifications</Text>
              <View style={s.toggleRow}>
                <View style={s.toggleLeft}>
                  <View style={[s.toggleIconWrap, { backgroundColor: theme.primarySoft }]}>
                    <Text style={s.toggleIconTxt}>🔔</Text>
                  </View>
                  <View>
                    <Text style={s.toggleLabel}>Push Notifications</Text>
                    <Text style={s.toggleSub}>{notifs ? 'Enabled' : 'Disabled'}</Text>
                  </View>
                </View>
                <Switch value={notifs} onValueChange={setNotifs}
                  trackColor={{ false: theme.border, true: theme.primary }} thumbColor="#fff" />
              </View>
            </View>

            <View style={s.card}>
              <Text style={s.cardTitle}>About</Text>
              {[['Version', '1.0.0'], ['Build', '2026.04'], ['Platform', 'React Native']].map(([k, v]) => (
                <View key={k} style={s.aboutRow}>
                  <Text style={s.aboutKey}>{k}</Text>
                  <Text style={s.aboutVal}>{v}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={s.logoutTxt}>🚪  Sign Out</Text>
        </TouchableOpacity>
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
  userCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: t.bgCard, borderRadius: Radius.xl, padding: Spacing.lg,
    marginBottom: Spacing.lg, borderWidth: 1, borderColor: t.border,
  },
  userAvatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: t.primary, alignItems: 'center', justifyContent: 'center' },
  userAvatarTxt: { color: '#fff', fontSize: 22, fontWeight: '700' },
  userName: { fontSize: 17, fontWeight: '700', color: t.textPrimary },
  userEmail: { fontSize: 13, color: t.textMuted, marginTop: 2 },
  userBadge: { backgroundColor: t.successSoft, borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 4 },
  userBadgeTxt: { color: t.success, fontSize: 11, fontWeight: '700' },
  tabBar: { flexDirection: 'row', backgroundColor: t.bgCard, borderRadius: Radius.lg, padding: 4, marginBottom: Spacing.lg, borderWidth: 1, borderColor: t.border },
  tabItem: { flex: 1, paddingVertical: 10, borderRadius: Radius.md, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 4 },
  tabItemActive: { backgroundColor: t.primary },
  tabIcon: { fontSize: 14 },
  tabTxt: { fontSize: 13, color: t.textMuted, fontWeight: '600' },
  tabTxtActive: { color: '#fff' },
  errorBox: { backgroundColor: t.dangerSoft, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.md, borderLeftWidth: 3, borderLeftColor: t.danger },
  errorTxt: { color: t.danger, fontSize: 13, fontWeight: '500' },
  successBox: { backgroundColor: t.successSoft, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.md, borderLeftWidth: 3, borderLeftColor: t.success },
  successTxt: { color: t.success, fontSize: 13, fontWeight: '500' },
  card: { backgroundColor: t.bgCard, borderRadius: Radius.xl, padding: Spacing.lg, marginBottom: Spacing.md, borderWidth: 1, borderColor: t.border },
  cardTitle: { fontSize: 16, fontWeight: '700', color: t.textPrimary, marginBottom: Spacing.md },
  label: { fontSize: 11, fontWeight: '700', color: t.textMuted, letterSpacing: 1.2, marginBottom: 6 },
  input: { backgroundColor: t.bgInput, color: t.textPrimary, paddingHorizontal: Spacing.md, paddingVertical: 14, borderRadius: Radius.md, fontSize: 15, borderWidth: 1.5, borderColor: t.border, marginBottom: Spacing.md },
  btn: { backgroundColor: t.primary, borderRadius: Radius.md, height: 48, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.sm },
  btnOff: { opacity: 0.6 },
  btnTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toggleLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  toggleIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  toggleIconTxt: { fontSize: 20 },
  toggleLabel: { fontSize: 15, fontWeight: '600', color: t.textPrimary },
  toggleSub: { fontSize: 12, color: t.textMuted, marginTop: 2 },
  aboutRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: t.borderLight },
  aboutKey: { fontSize: 14, color: t.textSecondary },
  aboutVal: { fontSize: 14, color: t.textMuted, fontWeight: '600' },
  logoutBtn: { borderWidth: 1.5, borderColor: t.danger, borderRadius: Radius.md, height: 52, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.md },
  logoutTxt: { color: t.danger, fontSize: 15, fontWeight: '700' },
});
