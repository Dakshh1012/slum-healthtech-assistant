import { StyleSheet, View, Text, TouchableOpacity, Linking, Platform } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

export default function SOSScreen() {
  const emergencyNumber = '108'; // Indian emergency number

  const handleEmergencyCall = () => {
    const phoneNumber = Platform.OS === 'android' ? `tel:${emergencyNumber}` : `telprompt:${emergencyNumber}`;
    Linking.openURL(phoneNumber);
  };

  const handleWhatsAppSOS = () => {
    // You can customize this with emergency contact numbers
    Linking.openURL('whatsapp://send?text=Emergency! I need immediate medical assistance!');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Emergency SOS</Text>
        <FontAwesome name="exclamation-triangle" size={50} color="red" />
      </View>

      <TouchableOpacity style={styles.emergencyButton} onPress={handleEmergencyCall}>
        <FontAwesome name="phone" size={30} color="white" />
        <Text style={styles.buttonText}>Call Emergency Services</Text>
        <Text style={styles.subText}>{emergencyNumber}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.emergencyButton, styles.whatsappButton]} onPress={handleWhatsAppSOS}>
        <FontAwesome name="whatsapp" size={30} color="white" />
        <Text style={styles.buttonText}>Send WhatsApp SOS</Text>
        <Text style={styles.subText}>Alert Emergency Contacts</Text>
      </TouchableOpacity>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>Important:</Text>
        <Text style={styles.infoDetail}>• Stay calm and provide clear information</Text>
        <Text style={styles.infoDetail}>• Share your exact location</Text>
        <Text style={styles.infoDetail}>• Follow emergency operator instructions</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 15,
  },
  emergencyButton: {
    backgroundColor: '#FF3B30',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  subText: {
    color: 'white',
    fontSize: 14,
    marginTop: 5,
  },
  infoContainer: {
    marginTop: 30,
    padding: 20,
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
  },
  infoText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  infoDetail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
});