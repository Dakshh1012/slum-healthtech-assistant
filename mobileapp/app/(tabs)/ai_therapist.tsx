import { StyleSheet, View, Text } from 'react-native';

export default function AITherapistScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Therapist</Text>
      <Text style={styles.subtitle}>Your mental wellness companion</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});