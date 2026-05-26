import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';

export default function ModalScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Modal</Text>
      <TouchableOpacity onPress={() => router.back()} style={styles.btn}>
        <Text style={styles.btnTxt}>Close</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 20 },
  btn: { backgroundColor: '#0D7377', borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12 },
  btnTxt: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
