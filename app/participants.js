import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { Spacing, Radius } from '../constants/theme';
import BackButton from '../components/BackButton';

export default function Participants() {
  const [name, setName] = useState('');
  const [participants, setParticipants] = useState([]);
  const [focused, setFocused] = useState(false);
  const { theme } = useTheme();
  const s = styles(theme);

  const add = () => {
    if (!name.trim()) return;
    setParticipants([...participants, { id: Date.now().toString(), name: name.trim() }]);
    setName('');
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* ── Header ── */}
      <View style={s.header}>
        <BackButton />
        <Text style={s.headerTitle}>Participants</Text>
        <View style={s.headerRight} />
      </View>

      <View style={s.container}>
        <Text style={s.sub}>Who's in this meeting?</Text>

        <View style={s.inputRow}>
          <TextInput
            style={[s.input, focused && s.inputFocused]}
            placeholder="Enter participant name" placeholderTextColor={theme.textMuted}
            value={name} onChangeText={setName}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            onSubmitEditing={add} returnKeyType="done"
          />
          <TouchableOpacity onPress={add} style={[s.addBtn, !name.trim() && s.addBtnOff]} disabled={!name.trim()}>
            <Text style={s.addBtnTxt}>Add</Text>
          </TouchableOpacity>
        </View>

        {participants.length > 0 && (
          <View style={s.countBadge}>
            <Text style={s.countTxt}>{participants.length} participant{participants.length !== 1 ? 's' : ''}</Text>
          </View>
        )}

        <FlatList
          data={participants} keyExtractor={i => i.id} style={s.list}
          contentContainerStyle={participants.length === 0 && s.emptyContainer}
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={s.emptyIcon}>👥</Text>
              <Text style={s.emptyTxt}>Add people who are in this meeting</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={s.row}>
              <View style={s.avatar}><Text style={s.avatarTxt}>{item.name.charAt(0).toUpperCase()}</Text></View>
              <Text style={s.rowName}>{item.name}</Text>
              <TouchableOpacity onPress={() => setParticipants(participants.filter(p => p.id !== item.id))} style={s.removeBtn}>
                <Text style={s.removeTxt}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
        />

        <TouchableOpacity onPress={() => router.push('/recording')} style={s.continueBtn} activeOpacity={0.85}>
          <Text style={s.continueTxt}>Continue to Recording →</Text>
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
  sub: { fontSize: 14, color: t.textMuted, marginBottom: Spacing.lg },
  inputRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  input: { flex: 1, backgroundColor: t.bgInput, color: t.textPrimary, padding: Spacing.md, borderRadius: Radius.md, fontSize: 15, borderWidth: 1.5, borderColor: t.border },
  inputFocused: { borderColor: t.primary },
  addBtn: { backgroundColor: t.primary, paddingHorizontal: Spacing.lg, borderRadius: Radius.md, justifyContent: 'center' },
  addBtnOff: { opacity: 0.4 },
  addBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 15 },
  countBadge: { alignSelf: 'flex-start', backgroundColor: t.primarySoft, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: 4, marginBottom: Spacing.sm },
  countTxt: { color: t.primary, fontSize: 12, fontWeight: '700' },
  list: { flex: 1 },
  emptyContainer: { flex: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.xxl },
  emptyIcon: { fontSize: 48, marginBottom: Spacing.md },
  emptyTxt: { fontSize: 14, color: t.textMuted },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: t.bgCard, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1, borderColor: t.border, gap: Spacing.md },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: t.primary, alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { color: '#fff', fontWeight: '700', fontSize: 16 },
  rowName: { flex: 1, fontSize: 15, color: t.textPrimary, fontWeight: '500' },
  removeBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: t.bgSurface, alignItems: 'center', justifyContent: 'center' },
  removeTxt: { color: t.textMuted, fontSize: 12 },
  continueBtn: { backgroundColor: t.primary, borderRadius: Radius.md, height: 52, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.md },
  continueTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
