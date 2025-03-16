import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Bell } from 'lucide-react-native';
import TranslatedText from '@/components/TranslatedText';
import { supabase } from '@/lib/supabase';

// Theme Configuration (same as in index.tsx)
const THEME = {
  primary: '#00BFA6',
  secondary: '#4C5DF4',
  warning: '#FF9800',
  danger: '#FF5252',
  background: '#F7FAFA',
  card: '#FFFFFF',
  text: {
    primary: '#2D3142',
    secondary: '#4F5565',
    light: '#9BA3AF',
  },
};

interface Notification {
  id: number;
  title: string;
  cause: string;
  description: string;
  address: string;
  created_at: string;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }

  const NotificationItem = ({ item }: { item: Notification }) => (
    <View style={styles.notificationItem}>
      <Bell size={24} color={THEME.primary} />
      <View style={styles.notificationContent}>
        <TranslatedText textKey={item.title} style={styles.notificationTitle} />
        <View style={styles.causeContainer}>
          <TranslatedText textKey={item.cause} style={styles.causeBadge} />
        </View>
        <TranslatedText textKey={item.description} style={styles.notificationMessage} />
        <View style={styles.footerContainer}>
          <TranslatedText textKey={item.address} style={styles.addressText} />
          <TranslatedText 
            textKey={new Date(item.created_at).toLocaleDateString()} 
            style={styles.notificationDate} 
          />
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={THEME.text.primary} />
        </TouchableOpacity>
        <TranslatedText textKey="Notifications" style={styles.headerTitle} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={THEME.primary} />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Bell size={48} color={THEME.text.light} />
          <TranslatedText 
            textKey="No notifications yet" 
            style={styles.emptyText} 
          />
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={({ item }) => <NotificationItem item={item} />}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: THEME.card,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: THEME.text.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: THEME.text.secondary,
  },
  listContainer: {
    padding: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: THEME.card,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationContent: {
    marginLeft: 16,
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.text.primary,
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: THEME.text.secondary,
    marginBottom: 8,
  },
  notificationDate: {
    fontSize: 12,
    color: THEME.text.light,
  },
  causeContainer: {
    marginBottom: 8,
  },
  causeBadge: {
    backgroundColor: THEME.primary,
    color: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 12,
    alignSelf: 'flex-start',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  addressText: {
    fontSize: 12,
    color: THEME.text.secondary,
    flex: 1,
    marginRight: 8,
  },
}); 