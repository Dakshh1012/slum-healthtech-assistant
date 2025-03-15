import { StyleSheet, View, Text, TouchableOpacity, Linking, Platform } from 'react-native';
import { CircleAlert as AlertCircle, Phone, MessageCircle } from 'lucide-react-native';

export default function SOSScreen() {
  const emergencyNumber = '108'; // Indian emergency number

  const handleEmergencyCall = () => {
    const phoneNumber = Platform.OS === 'android' ? `tel:${emergencyNumber}` : `telprompt:${emergencyNumber}`;
    Linking.openURL(phoneNumber);
  };

  const handleWhatsAppSOS = () => {
    Linking.openURL('whatsapp://send?text=Emergency! I need immediate medical assistance!');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Emergency SOS</Text>
        <AlertCircle size={50} color="#00BFA6" />
      </View>

      <TouchableOpacity style={styles.emergencyButton} onPress={handleEmergencyCall}>
        <Phone size={24} color="white" />
        <Text style={styles.buttonText}>Call Emergency Services</Text>
        <Text style={styles.subText}>{emergencyNumber}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.emergencyButton, styles.messageButton]} onPress={handleWhatsAppSOS}>
        <MessageCircle size={24} color="white" />
        <Text style={styles.buttonText}>Send Emergency Message</Text>
        <Text style={styles.subText}>Alert Emergency Contacts</Text>
      </TouchableOpacity>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>Important Guidelines</Text>
        <View style={styles.infoItem}>
          <Text style={styles.infoDetail}>• Stay calm and provide clear information</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoDetail}>• Share your exact location</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoDetail}>• Follow emergency operator instructions</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F7FAFA',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2D3142',
    marginBottom: 15,
  },
  emergencyButton: {
    backgroundColor: '#00BFA6',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  messageButton: {
    backgroundColor: '#4C5DF4',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  subText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13,
    marginTop: 4,
  },
  infoContainer: {
    marginTop: 24,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#2D3142',
  },
  infoItem: {
    marginBottom: 12,
  },
  infoDetail: {
    fontSize: 14,
    color: '#4F5565',
    lineHeight: 20,
  },
});