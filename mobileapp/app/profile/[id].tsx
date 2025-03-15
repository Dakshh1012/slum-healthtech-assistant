import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Mail, Phone, MapPin, Award, Heart, Brain, Smile } from 'lucide-react-native';

// Theme Configuration
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

const { width } = Dimensions.get('window');

// Mock data for charts
const moodData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  data: [0.7, 0.8, 0.5, 0.9, 0.6, 0.8, 0.7], // Values between 0-1 represent mood percentages
};

const healthData = {
  labels: ['Air Quality', 'Exercise', 'Sleep', 'Hydration'],
  data: [0.65, 0.8, 0.9, 0.75], // Values between 0-1 represent health metrics
};

// Chart components
const BarChart = ({ data, labels, color }: { data: number[], labels: string[], color: string }) => {
  return (
    <View style={styles.chartContainer}>
      <View style={styles.barContainer}>
        {data.map((value, index) => (
          <View key={index} style={styles.barGroup}>
            <View style={styles.barLabelContainer}>
              <Text style={styles.barLabel}>{labels[index]}</Text>
            </View>
            <View style={styles.barWrapper}>
              <View 
                style={[
                  styles.bar, 
                  { width: `${value * 100}%`, backgroundColor: color }
                ]} 
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const LineChart = ({ data, labels, color }: { data: number[], labels: string[], color: string }) => {
  return (
    <View style={styles.lineChartContainer}>
      <View style={styles.lineDataContainer}>
        {data.map((value, index) => (
          <View 
            key={index} 
            style={[
              styles.lineDataPoint, 
              { 
                height: value * 100, 
                backgroundColor: color
              }
            ]} 
          />
        ))}
      </View>
      <View style={styles.lineLabelContainer}>
        {labels.map((label, index) => (
          <Text key={index} style={styles.lineLabel}>{label}</Text>
        ))}
      </View>
    </View>
  );
};

// Info Card Component
const InfoCard = ({ icon, title, value }: { icon: JSX.Element, title: string, value: string }) => (
  <View style={styles.infoCard}>
    {icon}
    <View style={styles.infoCardContent}>
      <Text style={styles.infoCardTitle}>{title}</Text>
      <Text style={styles.infoCardValue}>{value}</Text>
    </View>
  </View>
);

// Achievement Badge Component
const AchievementBadge = ({ title, points, color }: { title: string, points: number, color: string }) => (
  <View style={[styles.achievementBadge, { borderColor: color }]}>
    <View style={[styles.badgeCircle, { backgroundColor: color }]}>
      <Award size={20} color="white" />
    </View>
    <Text style={styles.badgeTitle}>{title}</Text>
    <Text style={[styles.badgePoints, { color }]}>+{points}</Text>
  </View>
);

export default function ProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  // User data would normally come from Supabase
  const userData = {
    id: id || 'rahul',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    phone: '+91 98765 43210',
    address: '123 Green Park, New Delhi, India',
    coins: 750,
    profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={THEME.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.profileHeader}>
          <Image 
            source={{ uri: userData.profileImage }} 
            style={styles.profileImage} 
          />
          <Text style={styles.userName}>{userData.name}</Text>
          
          <View style={styles.coinsContainer}>
            <Award size={20} color={THEME.warning} />
            <Text style={styles.coinsText}>{userData.coins} Eco Coins</Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.infoCardContainer}>
            <InfoCard 
              icon={<Mail size={20} color={THEME.primary} />} 
              title="Email" 
              value={userData.email} 
            />
            <InfoCard 
              icon={<Phone size={20} color={THEME.primary} />} 
              title="Phone" 
              value={userData.phone} 
            />
            <InfoCard 
              icon={<MapPin size={20} color={THEME.primary} />} 
              title="Address" 
              value={userData.address} 
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mood Analysis</Text>
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Smile size={20} color={THEME.secondary} />
              <Text style={styles.chartTitle}>Weekly Mood Pattern</Text>
            </View>
            <LineChart 
              data={moodData.data} 
              labels={moodData.labels} 
              color={THEME.secondary}
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Analysis</Text>
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Heart size={20} color={THEME.primary} />
              <Text style={styles.chartTitle}>Health Indicators</Text>
            </View>
            <BarChart 
              data={healthData.data} 
              labels={healthData.labels} 
              color={THEME.primary} 
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Achievements</Text>
          <View style={styles.achievementsContainer}>
            <AchievementBadge title="Daily Air Check" points={50} color={THEME.primary} />
            <AchievementBadge title="Pollution Report" points={100} color={THEME.secondary} />
            <AchievementBadge title="Community Alert" points={75} color={THEME.warning} />
          </View>
        </View>
        
        <TouchableOpacity style={styles.redeemButton}>
          <Text style={styles.redeemButtonText}>Redeem Eco Coins</Text>
        </TouchableOpacity>
      </ScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: THEME.card,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: THEME.card,
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: THEME.primary,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THEME.text.primary,
    marginTop: 12,
  },
  coinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginTop: 12,
  },
  coinsText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.warning,
    marginLeft: 6,
  },
  section: {
    marginVertical: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME.text.primary,
    marginBottom: 16,
  },
  infoCardContainer: {
    gap: 12,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: THEME.card,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoCardContent: {
    marginLeft: 12,
  },
  infoCardTitle: {
    fontSize: 14,
    color: THEME.text.secondary,
  },
  infoCardValue: {
    fontSize: 16,
    fontWeight: '500',
    color: THEME.text.primary,
  },
  chartCard: {
    backgroundColor: THEME.card,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: THEME.text.primary,
    marginLeft: 8,
  },
  chartContainer: {
    marginTop: 8,
  },
  barContainer: {
    gap: 12,
  },
  barGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  barLabelContainer: {
    width: 80,
  },
  barLabel: {
    fontSize: 12,
    color: THEME.text.secondary,
  },
  barWrapper: {
    flex: 1,
    height: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 8,
  },
  lineChartContainer: {
    height: 180,
    marginTop: 8,
  },
  lineDataContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 150,
  },
  lineDataPoint: {
    width: 24,
    borderRadius: 4,
    marginHorizontal: 8,
  },
  lineLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  lineLabel: {
    fontSize: 12,
    color: THEME.text.secondary,
    textAlign: 'center',
    width: 40,
  },
  achievementsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  achievementBadge: {
    width: '30%',
    backgroundColor: THEME.card,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: 12,
  },
  badgeCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  badgeTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: THEME.text.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  badgePoints: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  redeemButton: {
    backgroundColor: THEME.secondary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    margin: 16,
    marginTop: 8,
  },
  redeemButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});
