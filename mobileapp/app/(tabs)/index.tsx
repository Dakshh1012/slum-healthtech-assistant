import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// import { Search, Bell } from 'lucide-react-native';
// import { AnimatedCircularProgress } from 'react-native-circular-progress';

const TEAL_COLOR = '#00BFA6';

interface AirQualityParameterProps {
  title: string;
  value: string;
  unit: string;
}

const AirQualityParameter: React.FC<AirQualityParameterProps> = ({ title, value, unit }) => (
  <View style={styles.parameterCard}>
    <Text style={styles.parameterTitle}>{String(title)}</Text>
    <Text style={styles.parameterValue}>{String(value)}</Text>
    <Text style={styles.parameterUnit}>{String(unit)}</Text>
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
      <ScrollView>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, User</Text>
            <Text style={styles.date}>{currentDate}</Text>
          </View>
          <View style={styles.headerIcons}>
            {/* <Search size={24} color="#333" style={styles.icon} />
            <Bell size={24} color="#333" /> */}
          </View>
        </View>

        {/* <View style={styles.aqiContainer}>
          <AnimatedCircularProgress
            size={150}
            width={15}
            fill={75}
            tintColor={TEAL_COLOR}
            backgroundColor="#eee"
            rotation={0}
            lineCap="round">
            {(fill) => (
              <View style={styles.aqiTextContainer}>
                <Text style={styles.aqiValue}>75</Text>
                <Text style={styles.aqiLabel}>AQI</Text>
              </View>
            )}
          </AnimatedCircularProgress>
        </View> */}

        <View style={styles.parametersGrid}>
          <AirQualityParameter title="Temperature" value="24°" unit="Celsius" />
          <AirQualityParameter title="Humidity" value="65" unit="%" />
          <AirQualityParameter title="PM2.5" value="15" unit="µg/m³" />
          <AirQualityParameter title="PM10" value="45" unit="µg/m³" />
          <AirQualityParameter title="O₃" value="35" unit="ppb" />
          <AirQualityParameter title="NO₂" value="25" unit="ppb" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  icon: {
    marginRight: 8,
  },
  aqiContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'white',
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  aqiTextContainer: {
    alignItems: 'center',
  },
  aqiValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: TEAL_COLOR,
  },
  aqiLabel: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  parametersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    gap: 10,
    marginTop: 20,
  },
  parameterCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    width: '47%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  parameterTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  parameterValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  parameterUnit: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});