import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

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

import { MessageCircle, Paperclip, Camera } from 'lucide-react-native';

export default function NewsScreen() {
  const [complaintText, setComplaintText] = useState('');
  const [severity, setSeverity] = useState('moderate');
  const [images, setImages] = useState<string[]>([]);

  // Dummy data for past complaints
  const initialPastRequests = [
    {
      id: 1,
      text: 'Water leakage in the kitchen sink.',
      severity: 'high',
      images: [
        'https://via.placeholder.com/150',
        'https://via.placeholder.com/150',
      ],
      status: 'Resolved',
    },
    {
      id: 2,
      text: 'Broken streetlight outside the building.',
      severity: 'low',
      images: ['https://via.placeholder.com/150'],
      status: 'Pending',
    },
    {
      id: 3,
      text: 'Power outage in the basement.',
      severity: 'moderate',
      images: [],
      status: 'In Progress',
    },
  ];

  const [pastRequests, setPastRequests] = useState(initialPastRequests);

  // Function to pick images
  const pickImages = async () => {
    if (images.length >= 5) {
      Alert.alert('Limit Reached', 'You can only upload up to 5 images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      const selectedImages = result.assets.map((asset) => asset.uri);
      setImages((prevImages) => [...prevImages, ...selectedImages].slice(0, 5));
    }
  };

  // Function to remove an image
  const removeImage = (index: number) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  // Function to handle submitting a complaint
  const handleSubmit = () => {
    if (!complaintText.trim()) {
      Alert.alert('Error', 'Please enter your complaint.');
      return;
    }

    // Add the new complaint to the past requests list
    const newRequest = {
      id: Date.now(),
      text: complaintText,
      severity,
      images,
      status: 'Pending',
    };

    setPastRequests((prevRequests) => [newRequest, ...prevRequests]);
    setComplaintText('');
    setSeverity('moderate');
    setImages([]);

    Alert.alert('Success', 'Your complaint has been submitted successfully!');
  };

  // Helper function to get status styles
  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return { color: '#FF9800' }; // Orange
      case 'in progress':
        return { color: '#00BFA6' }; // Teal
      case 'resolved':
        return { color: '#4CAF50' }; // Green
      default:
        return { color: THEME.text.secondary };
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Headline */}
      <Text style={styles.headline}>Let your voice be heard!</Text>

      {/* Complaint Input */}
      <TextInput
        style={styles.input}
        placeholder="Describe your issue..."
        placeholderTextColor={THEME.text.light}
        multiline
        numberOfLines={4}
        value={complaintText}
        onChangeText={setComplaintText}
      />

      {/* Severity Dropdown */}
      <View style={styles.dropdownContainer}>
        <Text style={styles.dropdownLabel}>Severity:</Text>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() =>
            Alert.alert('Select Severity', '', [
              { text: 'Low', onPress: () => setSeverity('low') },
              { text: 'Moderate', onPress: () => setSeverity('moderate') },
              { text: 'High', onPress: () => setSeverity('high') },
            ])
          }
        >
          <Text style={styles.dropdownText}>
            {severity.charAt(0).toUpperCase() + severity.slice(1)}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Image Upload Section */}
      <View style={styles.imageUploadContainer}>
        <Text style={styles.imageUploadLabel}>Add Images (Max 5):</Text>
        <View style={styles.imagePreviewContainer}>
          {images.map((uri, index) => (
            <View key={index} style={styles.imagePreviewWrapper}>
              <Image source={{ uri }} style={styles.imagePreview} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => removeImage(index)}
              >
                <Text style={styles.removeImageText}>X</Text>
              </TouchableOpacity>
            </View>
          ))}
          {images.length < 5 && (
            <TouchableOpacity style={styles.addImageButton} onPress={pickImages}>
              <Paperclip size={24} color={THEME.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit Complaint</Text>
      </TouchableOpacity>

      {/* Past Requests Section */}
      {pastRequests.length > 0 && (
        <View style={styles.pastRequestsContainer}>
          <Text style={styles.pastRequestsTitle}>Your Past Requests</Text>
          {pastRequests.map((request) => (
            <View key={request.id} style={styles.requestCard}>
              <Text style={styles.requestText}>{request.text}</Text>
              <Text style={styles.requestSeverity}>
                Severity:{' '}
                {request.severity.charAt(0).toUpperCase() + request.severity.slice(1)}
              </Text>
              {request.images.length > 0 && (
                <View style={styles.requestImagesContainer}>
                  <Text style={styles.requestImagesLabel}>Attached Images:</Text>
                  <View style={styles.requestImagesPreview}>
                    {request.images.map((uri, index) => (
                      <Image key={index} source={{ uri }} style={styles.requestImagePreview} />
                    ))}
                  </View>
                </View>
              )}
              <Text style={[styles.requestStatus, getStatusStyle(request.status)]}>
                Status: {request.status}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: THEME.background,
  },
  headline: {
    fontSize: 28,
    fontWeight: 'bold',
    color: THEME.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: THEME.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    fontSize: 16,
    color: THEME.text.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dropdownLabel: {
    fontSize: 16,
    color: THEME.text.secondary,
    marginRight: 10,
  },
  dropdownButton: {
    backgroundColor: THEME.card,
    padding: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dropdownText: {
    fontSize: 16,
    color: THEME.text.primary,
  },
  imageUploadContainer: {
    marginBottom: 20,
  },
  imageUploadLabel: {
    fontSize: 16,
    color: THEME.text.secondary,
    marginBottom: 10,
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  imagePreviewWrapper: {
    position: 'relative',
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: THEME.danger,
    borderRadius: 12,
    padding: 4,
  },
  removeImageText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  addImageButton: {
    width: 80,
    height: 80,
    backgroundColor: THEME.card,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  submitButton: {
    backgroundColor: THEME.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  pastRequestsContainer: {
    marginTop: 20,
  },
  pastRequestsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.text.primary,
    marginBottom: 10,
  },
  requestCard: {
    backgroundColor: THEME.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  requestText: {
    fontSize: 16,
    color: THEME.text.primary,
    marginBottom: 8,
  },
  requestSeverity: {
    fontSize: 14,
    color: THEME.text.secondary,
    marginBottom: 8,
  },
  requestImagesContainer: {
    marginBottom: 8,
  },
  requestImagesLabel: {
    fontSize: 14,
    color: THEME.text.secondary,
    marginBottom: 4,
  },
  requestImagesPreview: {
    flexDirection: 'row',
    gap: 8,
  },
  requestImagePreview: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  requestStatus: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});