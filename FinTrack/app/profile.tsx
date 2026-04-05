import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '@/store/useStore';
import { supabase } from '@/lib/supabase';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { usePullRefresh } from '@/hooks/use-pull-refresh';
import PrimaryButton from '@/components/ui/primary-button';

export default function ProfileScreen() {
  const user = useStore((state) => state.user);
  const fetchUser = useStore((state) => state.fetchUser);
  const refreshAllData = useStore((state) => state.refreshAllData);
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);

  const refreshProfile = useCallback(async () => {
    await Promise.all([fetchUser(), refreshAllData()]);
  }, [fetchUser, refreshAllData]);
  const { refreshing, onRefresh } = usePullRefresh(refreshProfile);

  const handleSignOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    setLoading(false);
    if (error) {
      Alert.alert('Error signing out', error.message);
    } else {
      router.replace('/(auth)/login');
    }
  };

  const name = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'User';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={15}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Profile</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView
        contentContainerStyle={[styles.content, styles.scrollContentGrow]}
        alwaysBounceVertical
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
            progressBackgroundColor={theme.card}
          />
        }>
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Ionicons name="person" size={48} color={theme.primary} />
          </View>
          <Text style={[styles.name, { color: theme.text }]}>{name}</Text>
          <Text style={[styles.email, { color: theme.muted }]}>{user?.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.muted }]}>Account Settings</Text>
          
          <Pressable style={[styles.row, { borderBottomColor: theme.border }]} onPress={() => Alert.alert('Coming Soon', 'This feature is under development.')}>
            <Ionicons name="mail-outline" size={22} color={theme.text} />
            <Text style={[styles.rowText, { color: theme.text }]}>Edit Profile Details</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.muted} />
          </Pressable>

          <Pressable style={[styles.row, { borderBottomColor: theme.border }]} onPress={() => Alert.alert('Coming Soon', 'This feature is under development.')}>
            <Ionicons name="lock-closed-outline" size={22} color={theme.text} />
            <Text style={[styles.rowText, { color: theme.text }]}>Change Password</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.muted} />
          </Pressable>
        </View>

        <View style={styles.buttonContainer}>
          <PrimaryButton title="Sign Out" onPress={handleSignOut} loading={loading} disabled={loading} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontFamily: Fonts.bold,
    fontSize: 18,
  },
  content: {
    padding: 24,
  },
  scrollContentGrow: { flexGrow: 1 },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  name: {
    fontFamily: Fonts.bold,
    fontSize: 24,
    marginBottom: 4,
  },
  email: {
    fontFamily: Fonts.sans,
    fontSize: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowText: {
    flex: 1,
    fontFamily: Fonts.sans,
    fontSize: 16,
    marginLeft: 12,
  },
  buttonContainer: {
    marginTop: 20,
  },
});
