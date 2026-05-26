import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ThemeProvider, useTheme } from '../context/ThemeContext';

// ─────────────────────────────────────────────
// Dual-logo shown in every inner screen header
// ─────────────────────────────────────────────
function DualLogo() {
  const { theme } = useTheme();
  return (
    <View style={logo.wrap}>
      {/* RIO */}
      <View style={logo.rioRow}>
        <Text style={logo.rioR}>R</Text>
        <Text style={logo.rioLeaf}>🌿</Text>
        <Text style={logo.rioO}>O</Text>
        <View style={logo.rioTextCol}>
          <Text style={logo.rioName}>RIPHAH INT'L OFFICE</Text>
          <Text style={logo.rioTag}>Branching Beyond Borders</Text>
        </View>
      </View>
      {/* Divider */}
      <View style={[logo.divider, { backgroundColor: theme.border }]} />
      {/* RIU */}
      <View style={logo.riuRow}>
        <View style={logo.riuEmblem}><Text style={logo.riuSymbol}>✦</Text></View>
        <View>
          <Text style={logo.riuName}>RIPHAH</Text>
          <Text style={logo.riuSub}>INT'L UNIVERSITY</Text>
        </View>
      </View>
    </View>
  );
}

const logo = StyleSheet.create({
  wrap:       { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rioRow:     { flexDirection: 'row', alignItems: 'center', gap: 2 },
  rioR:       { fontSize: 18, fontWeight: '800', color: '#2B5EA7' },
  rioLeaf:    { fontSize: 14, marginHorizontal: 1 },
  rioO:       { fontSize: 18, fontWeight: '800', color: '#2B5EA7' },
  rioTextCol: { marginLeft: 4 },
  rioName:    { fontSize: 7,  fontWeight: '700', color: '#2B5EA7', letterSpacing: 0.4 },
  rioTag:     { fontSize: 7,  fontWeight: '600', color: '#C8922A', letterSpacing: 0.3 },
  divider:    { width: 1, height: 26, marginHorizontal: 2 },
  riuRow:     { flexDirection: 'row', alignItems: 'center', gap: 5 },
  riuEmblem:  {
    width: 26, height: 30, borderRadius: 13,
    borderWidth: 2, borderColor: '#2B5EA7',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#EBF3FD',
  },
  riuSymbol:  { fontSize: 11, color: '#C8922A' },
  riuName:    { fontSize: 12, fontWeight: '800', color: '#2B5EA7', letterSpacing: 0.8 },
  riuSub:     { fontSize: 7,  fontWeight: '600', color: '#4A5568', letterSpacing: 1 },
});

// ─────────────────────────────────────────────
// Routing guard — Splash → Login/Signup → Dashboard
// ─────────────────────────────────────────────
function RootLayoutNav() {
  const { user, loading } = useAuth();
  const { theme, isDark } = useTheme();
  const segments = useSegments();
  const router   = useRouter();

  useEffect(() => {
    if (loading) return;

    const seg = segments[0];
    const authScreens = ['login', 'signup', 'forgot-password', 'reset-password', 'verify-otp'];
    const inAuth   = authScreens.includes(seg);
    const inSplash = seg === 'splash';

    if (inSplash) return; // splash handles its own nav

    if (!user && !inAuth) {
      router.replace('/splash');
      return;
    }

    if (user && inAuth) {
      router.replace('/');
    }
  }, [user, loading, segments]);

  const headerLeft = () => <DualLogo />;

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle:         { backgroundColor: theme.bgCard },
          headerTintColor:     theme.primary,
          headerTitleStyle:    { fontWeight: '700', fontSize: 15, color: theme.textPrimary },
          headerShadowVisible: false,
          contentStyle:        { backgroundColor: theme.bg },
          animation:           'slide_from_right',
        }}
      >
        <Stack.Screen name="splash"          options={{ headerShown: false }} />
        <Stack.Screen name="index"           options={{ headerShown: false }} />
        <Stack.Screen name="login"           options={{ headerShown: false }} />
        <Stack.Screen name="signup"          options={{ headerShown: false }} />
        <Stack.Screen name="forgot-password" options={{ headerLeft, headerTitle: () => null }} />
        <Stack.Screen name="verify-otp"      options={{ headerLeft, headerTitle: () => null }} />
        <Stack.Screen name="reset-password"  options={{ headerLeft, headerTitle: () => null }} />
        <Stack.Screen name="new-note"        options={{ headerLeft, headerTitle: () => null }} />
        <Stack.Screen name="history"         options={{ headerLeft, headerTitle: () => null }} />
        <Stack.Screen name="note-detail"     options={{ headerLeft, headerTitle: () => null }} />
        <Stack.Screen name="settings"        options={{ headerLeft, headerTitle: () => null }} />
        <Stack.Screen name="participants"    options={{ headerLeft, headerTitle: () => null }} />
        <Stack.Screen name="recording"       options={{ headerLeft, headerTitle: () => null }} />
        <Stack.Screen name="notes"           options={{ headerLeft, headerTitle: () => null }} />
        <Stack.Screen name="summary"         options={{ headerLeft, headerTitle: () => null }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </ThemeProvider>
  );
}
