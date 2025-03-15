import { Tabs } from 'expo-router';
import { StyleSheet, Platform, View, TouchableOpacity, Text } from 'react-native';
import { Home, Heart, MessageCircle, Newspaper } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const TEAL_COLOR = '#00BFA6';
const INACTIVE_COLOR = '#9E9E9E';
const SOS_COLOR = '#FF0000';

export default function TabLayout() {
  const router = useRouter(); 

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: TEAL_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabBarItem,
        tabBarBackground: () => <View style={styles.tabBarBackground} />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="medibuddy"
        options={{
          title: 'MediBuddy',
          tabBarIcon: ({ color }) => <Heart size={24} color={color} />,
        }}
      />

      {/* Custom SOS Button */}
      <Tabs.Screen
        name="SOS"
        options={{
          tabBarButton: (props) => (
            <TouchableOpacity
              style={styles.sosButton}
              onPress={() => router.push('/SOS')} // ✅ Corrected navigation
              disabled={undefined}
              delayLongPress={undefined}
            >
              <Text style={styles.sosText}>SOS</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <Tabs.Screen
        name="ai_therapist"
        options={{
          title: 'AI Therapy',
          tabBarIcon: ({ color }) => <MessageCircle size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="news"
        options={{
          title: 'Petitions',
          tabBarIcon: ({ color }) => <Newspaper size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: 16,
    right: 16,
    height: 64,
    borderRadius: 32,
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0,
    elevation: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    shadowColor: '#07A997',
    shadowOffset: {
      width: 10,
      height: 10,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  tabBarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    ...Platform.select({
      ios: {
        shadowColor: '#07A996',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 12,
        shadowColor: '#07A996',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 2,
      },
    }),
  },
  tabBarItem: {
    height: 64,
    padding: 8,
  },
  sosButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: SOS_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: -27,
    bottom: 24,
    alignSelf: 'center',
    shadowColor: '#FF0000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
  },
  sosText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
