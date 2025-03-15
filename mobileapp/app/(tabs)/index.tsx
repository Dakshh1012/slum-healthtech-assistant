import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Bell, TriangleAlert as AlertTriangle, Shield, Wind, Map as MapIcon } from 'lucide-react-native';
import * as Location from 'expo-location';
import { WebView } from 'react-native-webview';
import { useRouter } from 'expo-router';

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

interface AQIInfo {
  id: number;              // AQI level (1-5)
  category: string;        // Text description of air quality
  color: string;           // Color code for visual representation
  healthAdvisory: {
    level: string;         // Advisory level name
    message: string;       // Detailed health advisory message
  };
  preventiveMeasures: {
    title: string;         // Short title for the measure
    description: string;   // Detailed description of the preventive measure
  }[];
}

interface LocationData {
  latitude: number;
  longitude: number;
}

const aqiData: AQIInfo[] = [
  {
      id: 1,
      category: "Good",
      color: "#00C853", // Green
      healthAdvisory: {
          level: "Safe",
          message: "Air quality is considered satisfactory, and air pollution poses little or no risk to public health."
      },
      preventiveMeasures: [
          {
              title: "Enjoy Outdoor Activities",
              description: "It's a great day to be active outside and enjoy the fresh air."
          },
          {
              title: "Monitor Changes",
              description: "Keep an eye on air quality updates if you have respiratory sensitivities."
          },
          {
              title: "Regular Ventilation",
              description: "Open windows to let fresh air circulate through your home."
          }
      ]
  },
  {
      id: 2,
      category: "Moderate",
      color: "#FFEB3B", // Yellow
      healthAdvisory: {
          level: "Moderate Concern",
          message: "Air quality is acceptable; however, there may be a moderate health concern for a very small number of people who are unusually sensitive to air pollution."
      },
      preventiveMeasures: [
          {
              title: "Sensitive Groups Caution",
              description: "If you have respiratory issues, consider reducing prolonged outdoor exertion."
          },
          {
              title: "Windows Management",
              description: "Consider closing windows during peak traffic hours when pollution may increase."
          },
          {
              title: "Air Quality Monitoring",
              description: "Keep track of air quality forecasts, especially if you have respiratory conditions."
          }
      ]
  },
  {
      id: 3,
      category: "Unhealthy for Sensitive Groups",
      color: "#FF9800", // Orange
      healthAdvisory: {
          level: "Health Alert",
          message: "Members of sensitive groups may experience health effects. The general public is less likely to be affected. Children, older adults, and people with heart or lung disease should reduce prolonged outdoor exposure."
      },
      preventiveMeasures: [
          {
              title: "Limit Outdoor Activities",
              description: "Sensitive individuals should limit strenuous outdoor activities, especially during peak pollution hours."
          },
          {
              title: "Keep Windows Closed",
              description: "Keep windows closed during the day and use air conditioning if available."
          },
          {
              title: "Consider Indoor Air Purifiers",
              description: "Use HEPA air purifiers indoors to maintain better air quality at home."
          },
          {
              title: "Air-Purifying Plants",
              description: "Place air-purifying plants like Snake Plant or Peace Lily in your living spaces."
          }
      ]
  },
  {
      id: 4,
      category: "Unhealthy",
      color: "#FF5252", // Red
      healthAdvisory: {
          level: "High Risk Alert",
          message: "Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects. People with respiratory conditions should avoid outdoor activities, and the general public should limit prolonged exertion."
      },
      preventiveMeasures: [
          {
              title: "Wear Masks Outdoors",
              description: "Use N95 masks when going outside to protect from harmful particles."
          },
          {
              title: "Avoid Outdoor Exercise",
              description: "Everyone should avoid strenuous outdoor activities, especially during peak pollution times."
          },
          {
              title: "Keep Windows Sealed",
              description: "Keep windows and doors tightly closed at all times."
          },
          {
              title: "Use Air Purifiers",
              description: "Run HEPA air purifiers in main living spaces continuously."
          },
          {
              title: "Hydrate Well",
              description: "Drink plenty of water to help your body clear toxins more efficiently."
          }
      ]
  },
  {
      id: 5,
      category: "Hazardous",
      color: "#7E0023", // Deep red/purple
      healthAdvisory: {
          level: "Emergency Condition",
          message: "Health warnings of emergency conditions. The entire population is more likely to be affected. Everyone should avoid all outdoor exertion. If you must go outdoors, wear appropriate respiratory protection. Consider temporary relocation if possible."
      },
      preventiveMeasures: [
          {
              title: "Stay Indoors",
              description: "Remain indoors with windows and doors sealed. Create a clean air room if possible."
          },
          {
              title: "Proper Mask Protection",
              description: "Use N95 or higher-rated masks whenever outdoor exposure is unavoidable."
          },
          {
              title: "Multiple Air Purifiers",
              description: "Use multiple air purifiers throughout your home, focusing on bedrooms and main living areas."
          },
          {
              title: "Seal Gaps",
              description: "Use tape or towels to seal gaps around windows and doors to prevent polluted air from entering."
          },
          {
              title: "Monitor Health Symptoms",
              description: "Watch for symptoms like coughing, shortness of breath, or unusual fatigue and seek medical help immediately if they occur."
          },
          {
              title: "Consider Evacuation",
              description: "If possible, consider temporary relocation to an area with better air quality, especially for vulnerable individuals."
          }
      ]
  }
];

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
const HealthAdvisory = ({ aqiLevel }: { aqiLevel: number }) => {
  const advisory = aqiData.find((data) => data.id === aqiLevel);

  if (!advisory) {
    return null;
  }

  return (
    <View style={styles.advisoryCard}>
      <AlertTriangle size={24} color={THEME.warning} />
      <View style={styles.advisoryContent}>
        <Text style={styles.advisoryLevel}>{advisory.healthAdvisory.level}</Text>
        <Text style={styles.advisoryMessage}>{advisory.healthAdvisory.message}</Text>
      </View>
    </View>
  );
};

const PreventiveMeasures = ({ aqiLevel }: { aqiLevel: number }) => {
  const advisory = aqiData.find((data) => data.id === aqiLevel);

  if (!advisory) {
    return null;
  }

  return (
    <View>
      {advisory.preventiveMeasures.map((measure, index) => (
        <View key={index} style={styles.measureCard}>
          <Shield size={20} color={THEME.primary} />
          <View style={styles.measureContent}>
            <Text style={styles.measureTitle}>{measure.title}</Text>
            <Text style={styles.measureDescription}>{measure.description}</Text>
          </View>
        </View>
      ))}
    </View>
  );
};
// Map Component Using WebView
const LocationMap = ({ location, nearbyLocations, errorMsg }: { location: LocationData | null, nearbyLocations: any[], errorMsg: string | null }) => {
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



  const generateNearbyLocations = (latitude: number, longitude: number, radiusKm: any) => {
    const locations = [];
    for (let i = 0; i < 5; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const distance = Math.random() * radiusKm;
      const dx = distance * Math.cos(angle) / 111; // Convert km to degrees
      const dy = distance * Math.sin(angle) / 111;
      locations.push({
        lat: latitude + dy,
        lng: longitude + dx,
      });
    }
    return locations;
  };

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
// ProfileAvatar Component
const ProfileAvatar = () => {
  const router = useRouter();
  
  return (
    <TouchableOpacity 
      onPress={() => router.push('/profile/rahul')}
      style={styles.avatarContainer}
    >
      <Image 
        source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} 
        style={styles.avatar} 
      />
    </TouchableOpacity>
  );
};

// Main Home Screen Component
export default function HomeScreen() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  interface AqiData {
    latitude: number;
    longitude: number;
    aqi: number;
    components: {
      co: number;
      no: number;
      no2: number;
      o3: number;
      so2: number;
      pm2_5: number;
      pm10: number;
      nh3: number;
    };
  }

  const [aqiData, setAqiData] = useState<AqiData | null>(null);
  const [nearbyLocations, setNearbyLocations] = useState([]);
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

      // Fetch AQI data after setting the location
      const aqiData = await fetchAqiData(location.coords.latitude, location.coords.longitude);
      setAqiData(aqiData);
    })();
  }, []);

  const fetchAqiData = async (latitude: number, longitude: number) => {
    const API_KEY = 'e1065fe7bbad2662e76077c32272468b'; // Replace with your API key
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`
    );
    const data = await response.json();
    return {
      latitude,
      longitude,
      aqi: data.list[0].main.aqi,
      components: data.list[0].components,
    };
  };

  // Generate random locations within a given radius
  const generateNearbyLocations = (latitude: number, longitude: number, radiusKm: number) => {
    const locations = [];
    for (let i = 0; i < 5; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const distance = Math.random() * radiusKm;
      const dx = distance * Math.cos(angle) / 111; // Convert km to degrees
      const dy = distance * Math.sin(angle) / 111;
      locations.push({
        lat: latitude + dy,
        lng: longitude + dx,
      });
    }
    return locations;
  };


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
            {aqiData ? (
              <Text style={styles.aqiValue}>{aqiData.aqi + "/ 5" || "N/A"}
                {/* <Text>5 - Very Bad</Text> */}
              </Text>

            ) : (
              <ActivityIndicator size="small" color={THEME.primary} 
              
              />
            )}
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
              <LocationMap 
              location={location} 
              nearbyLocations={nearbyLocations}
              errorMsg={errorMsg} />
            )}
          </View>
        </View>
        <View style={styles.parametersGrid}>
          {aqiData && (
            <>
              <AirQualityParameter title="PM2.5" value={aqiData.components.pm2_5.toString()} unit="µg/m³" status="poor" />
              <AirQualityParameter title="PM10" value={aqiData.components.pm10.toString()} unit="µg/m³" status="moderate" />
              <AirQualityParameter title="O₃" value={aqiData.components.o3.toString()} unit="ppb" status="good" />
              <AirQualityParameter title="NO₂" value={aqiData.components.no2.toString()} unit="ppb" status="moderate" />
            </>
          )}
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Advisory</Text>
          <HealthAdvisory
            aqiLevel={aqiData?.aqi || 1}
          />
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preventive Measures</Text>
          <PreventiveMeasures
            aqiLevel={aqiData?.aqi || 1}
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
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: THEME.primary,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
});