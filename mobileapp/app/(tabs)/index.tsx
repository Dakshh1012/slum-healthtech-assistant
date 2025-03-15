import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Bell, TriangleAlert as AlertTriangle, Shield, Wind, Map as MapIcon } from 'lucide-react-native';
import * as Location from 'expo-location';
import { WebView } from 'react-native-webview';

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

// Screen width for responsive design
const { width } = Dimensions.get('window');

// Interfaces
interface AirQualityParameterProps {
  title: string;
  value: string;
  unit: string;
  status: 'good' | 'moderate' | 'poor';
}

interface LocationData {
  latitude: number;
  longitude: number;
}

// Helper Function to Get Status Color
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

// Air Quality Parameter Component
const AirQualityParameter: React.FC<AirQualityParameterProps> = ({ title, value, unit, status }) => (
  <View style={[styles.parameter, { borderLeftColor: getStatusColor(status), borderLeftWidth: 4 }]}>
    <Text style={styles.parameterTitle}>{title}</Text>
    <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
      <Text style={styles.parameterValue}>{value}</Text>
      <Text style={styles.parameterUnit}>{unit}</Text>
    </View>
    <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(status) }]}>
      <Text style={styles.statusText}>{status.toUpperCase()}</Text>
    </View>
  </View>
);

// Health Advisory Component
const HealthAdvisory = ({ level, message }: { level: string; message: string }) => (
  <View style={styles.advisoryCard}>
    <AlertTriangle size={24} color={THEME.warning} />
    <View style={styles.advisoryContent}>
      <Text style={styles.advisoryLevel}>{level}</Text>
      <Text style={styles.advisoryMessage}>{message}</Text>
    </View>
  </View>
);

// Preventive Measure Component
const PreventiveMeasure = ({ title, description }: { title: string; description: string }) => (
  <View style={styles.measureCard}>
    <Shield size={20} color={THEME.primary} />
    <View style={styles.measureContent}>
      <Text style={styles.measureTitle}>{title}</Text>
      <Text style={styles.measureDescription}>{description}</Text>
    </View>
  </View>
);
// Map Component Using WebView
const LocationMap = ({ location, errorMsg }: { location: LocationData | null, errorMsg: string | null }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Generate map HTML directly when component renders instead of storing in state
  let mapHtml = '';
  if (location) {
    const latitude = location.latitude;
    const longitude = location.longitude;

    // Example data points for heatmap circles
    const aqiPoints = [
      { lat: latitude + 0.005, lng: longitude + 0.005, aqi: 145, color: '#FF5252', status: 'Poor' }, // Red
      { lat: latitude - 0.005, lng: longitude - 0.005, aqi: 120, color: '#FF9800', status: 'Moderate' }, // Yellow
      { lat: latitude + 0.008, lng: longitude - 0.003, aqi: 85, color: '#00C853', status: 'Good' }, // Green
    ];

    // Inside the LocationMap component, replace the existing mapHtml variable with this improved version:

mapHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
  <style>
    html, body { margin: 0; padding: 0; height: 100%; width: 100%; }
    #map { height: 100%; width: 100%; position: absolute; top: 0; left: 0; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    // Use window.onload instead of DOMContentLoaded for better WebView compatibility
    window.onload = function() {
      try {
        // Create the map
        const map = L.map('map').setView([${latitude}, ${longitude}], 13);
        
        // Add the base map layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Add user location marker
        L.marker([${latitude}, ${longitude}])
          .addTo(map)
          .bindPopup('Your location')
          .openPopup();

        // Define AQI points directly (avoid JSON.stringify which can cause issues)
        const points = [
          { lat: ${latitude + 0.005}, lng: ${longitude + 0.005}, aqi: 145, color: '#FF5252', status: 'Poor' },
          { lat: ${latitude - 0.005}, lng: ${longitude - 0.005}, aqi: 120, color: '#FF9800', status: 'Moderate' },
          { lat: ${latitude + 0.008}, lng: ${longitude - 0.003}, aqi: 85, color: '#00C853', status: 'Good' },
        ];
        
        // Add each point to the map
        points.forEach(point => {
          L.circle([point.lat, point.lng], {
            color: point.color,
            fillColor: point.color,
            fillOpacity: 0.5,
            radius: 500
          }).addTo(map).bindPopup('AQI: ' + point.aqi + '<br>Status: ' + point.status);
        });
        
        // Force a map repaint after a slight delay to ensure proper rendering
        setTimeout(() => {
          map.invalidateSize();
        }, 300);
      } catch (error) {
        document.body.innerHTML = '<div style="padding: 20px; color: red;">Error loading map: ' + error.message + '</div>';
      }
    };
  </script>
</body>
</html>
`;

    // Turn off loading once we have location data
    if (isLoading) {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    // Just for logging purposes
    if (location) {
      console.log('LocationMap received location:', location);
    }
  }, [location]);

  // Display loading indicator while waiting for location data
  if (isLoading) {
    return (
      <View style={styles.mapLoadingContainer}>
        <ActivityIndicator size="large" color={THEME.primary} />
        <Text style={styles.mapLoadingText}>Fetching location...</Text>
      </View>
    );
  }

  // If no location data is available
  if (!location) {
    return (
      <View style={styles.mapLoadingContainer}>
        <Text style={styles.errorText}>No location data available</Text>
      </View>
    );
  }

  return (
    <View style={styles.mapContainer}>
      <WebView
        source={{ html: mapHtml }}
        style={{ width: '100%', height: 250 }}
        originWhitelist={['*']}
        scrollEnabled={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView error:', nativeEvent.description);
        }}
        onLoadEnd={() => console.log('WebView loaded')}
      />
    </View>
  );
};
// Main Home Screen Component
export default function HomeScreen() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const currentDate = new Date().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      console.log("location", location);
      setLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, []);

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
          <ProfileAvatar />
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
        {/* Map section - always visible */}
        <View style={styles.mapWrapper}>
          <View style={styles.mapCard}>
            <View style={styles.mapHeader}>
              <MapIcon size={22} color={THEME.primary} />
              <Text style={styles.mapTitle}>Air Quality Map</Text>
            </View>
            {errorMsg ? (
              <Text style={styles.errorText}>{errorMsg}</Text>
            ) : (
              <LocationMap location={location} errorMsg={errorMsg} />
            )}
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
      </ScrollView>
    </SafeAreaView>
  );
}

// Styles
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
    flex: 1,
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
  mapWrapper: {
    margin: 20,
    marginTop: 0,
  },
  mapCard: {
    backgroundColor: THEME.card,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  mapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME.text.primary,
    marginLeft: 8,
  },
  mapContainer: {
    height: 250,
  },
  map: {
    flex: 1,
  },
  mapLoadingContainer: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.background,
  },
  mapLoadingText: {
    fontSize: 16,
    color: THEME.text.secondary,
  },
  debugLogTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.text.primary,
    marginBottom: 8,
  },
  debugLogText: {
    fontSize: 14,
    color: THEME.text.secondary,
  },
  debugLogContainer: {
    padding: 10,
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    margin: 20,
  },
  errorText: {
    fontSize: 14,
    color: THEME.danger,
    textAlign: 'center',
    padding: 20,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',
  },
  parametersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    gap: 10,
  },
  parameter: {
    width: '48%',
    padding: 16,
    borderRadius: 8,
    backgroundColor: THEME.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  parameterTitle: {
    fontSize: 16,
    color: THEME.text.primary,
  },
  parameterValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THEME.text.primary,
  },
  parameterUnit: {
    fontSize: 14,
    color: THEME.text.secondary,
    marginLeft: 4,
  },
  statusIndicator: {
    padding: 4,
    borderRadius: 4,
    marginTop: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  section: {
    margin: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME.text.primary,
    marginBottom: 16,
  },
  advisoryCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#FFFBEB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  advisoryContent: {
    marginLeft: 16,
  },
  advisoryLevel: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.warning,
  },
  advisoryMessage: {
    fontSize: 14,
    color: THEME.text.primary,
  },
  measureCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#F0F9F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  measureContent: {
    marginLeft: 16,
  },
  measureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.primary,
  },
  measureDescription: {
    fontSize: 14,
    color: THEME.text.primary,
  },
  emergencyButton: {
    backgroundColor: THEME.primary,
    padding: 16,
    borderRadius: 8,
    margin: 20,
    alignItems: 'center',
  },
  emergencyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});