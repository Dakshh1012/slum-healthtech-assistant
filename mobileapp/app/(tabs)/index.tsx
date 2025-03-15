import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Bell, TriangleAlert as AlertTriangle, Shield, Wind } from 'lucide-react-native';

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
  }
};

interface AirQualityParameterProps {
  title: string;
  value: string;
  unit: string;
  status: 'good' | 'moderate' | 'poor';
}

const getStatusColor = (status: 'good' | 'moderate' | 'poor') => {
  switch (status) {
    case 'good':
      return '#00C853';
    case 'moderate':
      return '#FF9800';
    case 'poor':
      return '#FF5252';
    default:
      return THEME.primary;
  }
};

const AirQualityParameter: React.FC<AirQualityParameterProps> = ({ title, value, unit, status }) => (
  <View style={[styles.parameterCard, { borderLeftColor: getStatusColor(status), borderLeftWidth: 4 }]}>
    <Text style={styles.parameterTitle}>{title}</Text>
    <Text style={styles.parameterValue}>{value}</Text>
    <Text style={styles.parameterUnit}>{unit}</Text>
    <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(status) }]}>
      <Text style={styles.statusText}>{status.toUpperCase()}</Text>
    </View>
  </View>
);

const HealthAdvisory = ({ level, message }: { level: string; message: string }) => (
  <View style={styles.advisoryCard}>
    <AlertTriangle size={24} color={THEME.warning} />
    <View style={styles.advisoryContent}>
      <Text style={styles.advisoryLevel}>{level}</Text>
      <Text style={styles.advisoryMessage}>{message}</Text>
    </View>
  </View>
);

const PreventiveMeasure = ({ title, description }: { title: string; description: string }) => (
  <View style={styles.measureCard}>
    <Shield size={20} color={THEME.primary} />
    <View style={styles.measureContent}>
      <Text style={styles.measureTitle}>{title}</Text>
      <Text style={styles.measureDescription}>{description}</Text>
    </View>
  </View>
);

export default function HomeScreen() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, Rahul</Text>
          <Text style={styles.date}>{currentDate}</Text>
        </View>
        <View style={styles.headerIcons}>
          <Search size={24} color={THEME.text.primary} style={styles.icon} />
          <Bell size={24} color={THEME.text.primary} />
        </View>
      </View>
      <ScrollView>

        <View style={styles.airQualityCard}>
          <View style={styles.aqiHeader}>
            <Wind size={24} color={THEME.primary} />
            <Text style={styles.aqiTitle}>Air Quality Index</Text>
          </View>
          <View style={styles.aqiContent}>
            <Text style={styles.aqiValue}>156</Text>
            <Text style={styles.aqiCategory}>Unhealthy</Text>
            <View style={styles.aqiScale}>
              <View style={[styles.aqiIndicator, { width: '65%' }]} />
            </View>
          </View>
        </View>

        <View style={styles.parametersGrid}>
          <AirQualityParameter title="PM2.5" value="85" unit="µg/m³" status="poor" />
          <AirQualityParameter title="PM10" value="120" unit="µg/m³" status="moderate" />
          <AirQualityParameter title="O₃" value="45" unit="ppb" status="good" />
          <AirQualityParameter title="NO₂" value="80" unit="ppb" status="moderate" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Advisory</Text>
          <HealthAdvisory
            level="High Risk Alert"
            message="Current air quality is unhealthy. People with respiratory conditions should avoid outdoor activities."
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preventive Measures</Text>
          <PreventiveMeasure
            title="Wear Masks Outdoors"
            description="Use N95 masks when going outside to protect from harmful particles."
          />
          <PreventiveMeasure
            title="Keep Windows Closed"
            description="During peak pollution hours (morning and evening), keep windows closed."
          />
          <PreventiveMeasure
            title="Use Air Purifying Plants"
            description="Place air-purifying plants like Snake Plant or Peace Lily in your home."
          />
        </View>

        <TouchableOpacity style={styles.emergencyButton}>
          <Text style={styles.emergencyButtonText}>Get Medical Help</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomGradient}>
          
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
    position: 'relative',
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: THEME.card,
    position: 'sticky',
    top: 0,
    zIndex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '600',
    color: THEME.text.primary,
  },
  date: {
    fontSize: 14,
    color: THEME.text.secondary,
    marginTop: 4,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  icon: {
    marginRight: 8,
  },
  airQualityCard: {
    backgroundColor: THEME.card,
    margin: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  aqiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  aqiTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME.text.primary,
    marginLeft: 8,
  },
  aqiContent: {
    alignItems: 'center',
  },
  aqiValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: THEME.danger,
  },
  aqiCategory: {
    fontSize: 16,
    color: THEME.danger,
    marginTop: 4,
  },
  aqiScale: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginTop: 16,
    overflow: 'hidden',
  },
  aqiIndicator: {
    height: '100%',
    backgroundColor: THEME.danger,
    borderRadius: 4,
  },
  parametersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    gap: 10,
  },
  parameterCard: {
    backgroundColor: THEME.card,
    borderRadius: 12,
    padding: 16,
    width: '47%',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  parameterTitle: {
    fontSize: 14,
    color: THEME.text.secondary,
    marginBottom: 8,
  },
  parameterValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THEME.text.primary,
  },
  parameterUnit: {
    fontSize: 12,
    color: THEME.text.light,
    marginTop: 4,
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME.text.primary,
    marginBottom: 16,
  },
  advisoryCard: {
    backgroundColor: THEME.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  advisoryContent: {
    marginLeft: 12,
    flex: 1,
  },
  advisoryLevel: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.text.primary,
    marginBottom: 4,
  },
  advisoryMessage: {
    fontSize: 14,
    color: THEME.text.secondary,
    lineHeight: 20,
  },
  measureCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: THEME.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  measureContent: {
    marginLeft: 12,
    flex: 1,
  },
  measureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.text.primary,
    marginBottom: 4,
  },
  measureDescription: {
    fontSize: 14,
    color: THEME.text.secondary,
    lineHeight: 20,
  },
  emergencyButton: {
    backgroundColor: THEME.danger,
    margin: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emergencyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120, // Height of the gradient overlay
    zIndex: 2, // Ensure it stays above the scroll content
  },
});