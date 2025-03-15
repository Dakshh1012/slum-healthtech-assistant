import { StyleSheet, View, Text } from 'react-native';

export default function MediBuddyScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>MediBuddy</Text>
      <Text style={styles.subtitle}>Your personal medical assistant</Text>
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