import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, TextInput, SafeAreaView, Alert } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { Spacing, Radius } from '../constants/theme';
import BackButton from '../components/BackButton';

export default function History() {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState('');
  const [focused, setFocused] = useState(false);
  const { theme } = useTheme();
  const s = styles(theme);

  useFocusEffect(useCallback(() => {
    AsyncStorage.getItem('meeting_notes').then(v => setNotes(v ? JSON.parse(v) : []));
  }, []));

  const filtered = notes.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.summary?.toLowerCase().includes(search.toLowerCase())
  );

  const deleteNote = (id) => {
    Alert.alert('Delete Note', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        const updated = notes.filter(n => n.id !== id);
        setNotes(updated);
        await AsyncStorage.setItem('meeting_notes', JSON.stringify(updated));
      }},
    ]);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={s.card}
      onPress={() => router.push({ pathname: '/note-detail', params: { id: item.id } })} activeOpacity={0.8}>
      <View style={s.cardTop}>
        <View style={s.cardDot} />
        <Text style={s.cardTitle} numberOfLines={1}>{item.title}</Text>
        <TouchableOpacity onPress={() => deleteNote(item.id)} style={s.delBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={s.delTxt}>🗑</Text>
        </TouchableOpacity>
      </View>
      <Text style={s.cardDate}>
        {new Date(item.createdAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
      </Text>
      <Text style={s.cardPreview} numberOfLines={2}>{item.summary || item.rawText}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={s.safe}>
      {/* ── Header ── */}
      <View style={s.header}>
        <BackButton />
        <Text style={s.headerTitle}>History</Text>
        <View style={s.headerRight} />
      </View>

      <View style={s.container}>
        <View style={[s.searchBox, focused && s.searchFocused]}>
          <Text style={s.searchIcon}>🔍</Text>
          <TextInput
            style={s.searchInput} placeholder="Search notes..."
            placeholderTextColor={theme.textMuted} value={search} onChangeText={setSearch}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          />
          {search ? <TouchableOpacity onPress={() => setSearch('')}><Text style={s.clearTxt}>✕</Text></TouchableOpacity> : null}
        </View>

        <View style={s.countRow}>
          <Text style={s.countTxt}>{filtered.length} note{filtered.length !== 1 ? 's' : ''}</Text>
          {filtered.length > 0 && (
            <TouchableOpacity onPress={() => router.push('/new-note')} style={s.newBtn}>
              <Text style={s.newBtnTxt}>+ New</Text>
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={filtered} keyExtractor={i => i.id} renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={filtered.length === 0 ? s.emptyWrap : null}
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={s.emptyIcon}>📭</Text>
              <Text style={s.emptyTitle}>{search ? 'No results found' : 'No notes yet'}</Text>
              <Text style={s.emptySub}>{search ? 'Try a different search term' : 'Create your first meeting note'}</Text>
              {!search && (
                <TouchableOpacity style={s.emptyBtn} onPress={() => router.push('/new-note')}>
                  <Text style={s.emptyBtnTxt}>+ Create Note</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
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
  container: { flex: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: t.bgCard,
    borderRadius: Radius.lg, paddingHorizontal: Spacing.md, paddingVertical: 12,
    borderWidth: 1.5, borderColor: t.border, marginBottom: Spacing.sm, gap: Spacing.sm,
  },
  searchFocused: { borderColor: t.primary },
  searchIcon: { fontSize: 15 },
  searchInput: { flex: 1, fontSize: 15, color: t.textPrimary },
  clearTxt: { color: t.textMuted, fontSize: 14 },
  countRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  countTxt: { fontSize: 12, color: t.textMuted, fontWeight: '600' },
  newBtn: { backgroundColor: t.primary, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: 5 },
  newBtnTxt: { color: '#fff', fontSize: 12, fontWeight: '700' },
  card: {
    backgroundColor: t.bgCard, borderRadius: Radius.lg, padding: Spacing.md,
    marginBottom: Spacing.sm, borderWidth: 1, borderColor: t.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: Spacing.sm },
  cardDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: t.primary, flexShrink: 0 },
  cardTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: t.textPrimary },
  delBtn: { padding: 2 },
  delTxt: { fontSize: 15 },
  cardDate: { fontSize: 11, color: t.textMuted, marginBottom: 6, marginLeft: 16 },
  cardPreview: { fontSize: 13, color: t.textSecondary, lineHeight: 20, marginLeft: 16 },
  emptyWrap: { flex: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.xxl },
  emptyIcon: { fontSize: 52, marginBottom: Spacing.md },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: t.textSecondary, marginBottom: 4 },
  emptySub: { fontSize: 14, color: t.textMuted, marginBottom: Spacing.lg },
  emptyBtn: { backgroundColor: t.primary, borderRadius: Radius.md, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md },
  emptyBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
