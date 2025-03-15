import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../lib/supabase';
import { NGO, Request, RequestMedia } from '../../lib/types';
import { MessageCircle, Paperclip, Camera, ChevronDown, X } from 'lucide-react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import TranslatedText from '../../components/TranslatedText';

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

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return {
          color: '#FF9800',
          backgroundColor: '#FFF3E0',
          borderColor: '#FFE0B2',
          icon: '⏳'
        };
      case 'accepted':
        return {
          color: '#00BFA6',
          backgroundColor: '#E0F2F1',
          borderColor: '#B2DFDB',
          icon: '✓'
        };
      case 'rejected':
        return {
          color: '#FF5252',
          backgroundColor: '#FFEBEE',
          borderColor: '#FFCDD2',
          icon: '✕'
        };
      default:
        return {
          color: THEME.text.secondary,
          backgroundColor: '#F5F5F5',
          borderColor: '#E0E0E0',
          icon: '•'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <View style={[styles.statusBadge, { backgroundColor: config.backgroundColor, borderColor: config.borderColor }]}>
      <TranslatedText style={[styles.statusIcon]} textKey={`status.icon.${status.toLowerCase()}`} fallback={config.icon} />
      <TranslatedText 
        style={[styles.statusText, { color: config.color }]} 
        textKey={`status.${status.toLowerCase()}`}
        fallback={status.charAt(0).toUpperCase() + status.slice(1)}
      />
    </View>
  );
};

const NGODropdownPicker = ({ selectedNgo, ngos, onSelect } : {
  selectedNgo: NGO | null;
  ngos: NGO[];
  onSelect: (ngo: NGO | null) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(selectedNgo?.id || null);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    console.log("Updating dropdown items with NGOs:", ngos);
    const formattedItems = ngos.map(ngo => ({
      label: ngo.name,
      value: ngo.id,
      ngo: ngo
    }));
    console.log("Formatted items:", formattedItems);
    setItems(formattedItems);
  }, [ngos]);

  useEffect(() => {
    if (value) {
      const selected = ngos.find(ngo => ngo.id === value);
      console.log("Selected NGO:", selected);
      onSelect(selected || null);
    } else {
      onSelect(null);
    }
  }, [value, ngos]);

  return (
    <View style={{ zIndex: 2000 }}> 
      <DropDownPicker
        open={open}
        value={value}
        items={items}
        setOpen={setOpen}
        setValue={setValue}
        setItems={setItems}
        placeholder="Select NGO"
        style={styles.dropdownPicker}
        textStyle={styles.dropdownPickerText}
        dropDownContainerStyle={styles.dropdownContainer}
        listItemContainerStyle={styles.dropdownItemContainer}
        selectedItemContainerStyle={styles.dropdownSelectedItem}
        searchable={true}
        searchPlaceholder="Search NGO..."
        loading={items.length === 0}
        listMode="SCROLLVIEW"
      />
    </View>
  );
};

const SeverityButton = ({
  level,
  selected,
  onPress,
  color,
}: {
  level: any;
  selected: any;
  onPress: any;
  color: any;
}) => (
  <TouchableOpacity
    style={[
      styles.severityButton,
      selected && { backgroundColor: color },
      selected && styles.selectedSeverityButton,
      !selected && { borderWidth: 1, borderColor: color },
    ]}
    onPress={onPress}
  >
    <TranslatedText
      style={[
        styles.severityButtonText,
        selected && styles.selectedSeverityButtonText,
        !selected && { color },
      ]}
      textKey={`severity.${level}`}
      fallback={level.charAt(0).toUpperCase() + level.slice(1)}
    />
  </TouchableOpacity>
);

export default function ComplaintsScreen() {
  const [complaintText, setComplaintText] = useState("");
  const [address, setAddress] = useState("");
  const [severity, setSeverity] = useState<"low" | "moderate" | "high">(
    "moderate"
  );
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [ngos, setNgos] = useState<NGO[]>([]);
  const [selectedNgo, setSelectedNgo] = useState<NGO | null>(null);
  const [pastRequests, setPastRequests] = useState<
    (Request & { media: RequestMedia[] })[]
  >([]);
  const [showNgoModal, setShowNgoModal] = useState(false);

  useEffect(() => {
    fetchNGOs();
    fetchPastRequests();
  }, []);

  useEffect(() => {
    console.log("NGOs state updated:", ngos);
  }, [ngos]);

  const fetchNGOs = async () => {
    try {
      const { data, error } = await supabase
        .from("ngo")
        .select("*");

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      console.log("Fetched NGOs:", data);
      setNgos(data || []);
    } catch (error) {
      console.error("Error fetching NGOs:", error);
      Alert.alert("Error", "Failed to fetch NGOs. Please check your connection and try again.");
    }
  };

  const fetchPastRequests = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: requests, error: requestsError } = await supabase
        .from("requests")
        .select(
          `
          *,
          media:request_media(*)
        `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (requestsError) throw requestsError;
      setPastRequests(requests || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
      Alert.alert("Error", "Failed to fetch past requests");
    }
  };

  const uploadImage = async (uri: string): Promise<string> => {
    try {
      // Create form data
      const formData = new FormData();
      const filename = uri.split("/").pop() || `${Date.now()}.jpg`;

      // @ts-ignore: React Native's type definitions for FormData are incomplete
      formData.append("file", {
        uri,
        name: filename,
        type: "image/jpeg",
      });

      const { data, error } = await supabase.storage
        .from("request-media")
        .upload(filename, formData, {
          contentType: "multipart/form-data",
        });

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from("request-media").getPublicUrl(filename);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (!complaintText.trim() || !selectedNgo || !address.trim()) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create request with ngo_id from the ngo table
      const { data: request, error: requestError } = await supabase
        .from("requests")
        .insert({
          user_id: user.id,
          ngo_id: selectedNgo.id, // This will now reference the ngo table
          message: complaintText,
          address,
          severity,
        })
        .select()
        .single();

      if (requestError) {
        console.error("Request Error:", requestError);
        throw requestError;
      }

      // Upload images
      if (images.length > 0) {
        const uploadPromises = images.map(async (uri) => {
          const publicUrl = await uploadImage(uri);
          return supabase.from("request_media").insert({
            request_id: request.id,
            media_url: publicUrl,
          });
        });

        await Promise.all(uploadPromises);
      }

      // Reset form
      setComplaintText("");
      setAddress("");
      setSeverity("moderate");
      setImages([]);
      setSelectedNgo(null);

      Alert.alert("Success", "Your complaint has been submitted successfully!");
      fetchPastRequests();
    } catch (error) {
      console.error("Error submitting complaint:", error);
      Alert.alert("Error", "Failed to submit complaint. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Function to pick images
  const pickImages = async () => {
    if (images.length >= 5) {
      Alert.alert("Limit Reached", "You can only upload up to 5 images.");
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

  // Helper function to get status styles
  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return { color: "#FF9800" }; // Orange
      case "in progress":
        return { color: "#00BFA6" }; // Teal
      case "resolved":
        return { color: "#4CAF50" }; // Green
      default:
        return { color: THEME.text.secondary };
    }
  };

  // Function to upload complaint media
  const uploadComplaintMedia = async (uri: string, type: 'image' | 'audio') => {
    try {
      const extension = uri.split('.').pop();
      const fileName = `${Date.now()}.${extension}`;
      const filePath = `complaints/${type}s/${fileName}`;

      const response = await fetch(uri);
      const blob = await response.blob();

      const { data, error } = await supabase.storage
        .from('chat-media')
        .upload(filePath, blob);

      if (error) throw error;

      const mediaUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/chat-media/${filePath}`;
      return mediaUrl;
    } catch (error) {
      console.error('Error uploading complaint media:', error);
      return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Main content */}
      <View style={styles.mainContent}>
        {/* Form Section - Always visible */}
        <View style={[styles.formSection, { zIndex: 1000 }]}>
          <TranslatedText style={styles.headline} textKey="complaints.headline" fallback="Let your voice be heard!" />

          <View style={styles.formGroup}>
            <TranslatedText style={styles.label} textKey="complaints.selectNgo" fallback="Select NGO:" />
            <NGODropdownPicker
              selectedNgo={selectedNgo}
              ngos={ngos}
              onSelect={setSelectedNgo}
            />
          </View>

          <TextInput
            style={styles.input}
            placeholder="Describe your issue..."
            placeholderTextColor={THEME.text.light}
            multiline
            numberOfLines={4}
            value={complaintText}
            onChangeText={setComplaintText}
          />

          <TextInput
            style={styles.input}
            placeholder="Enter address..."
            placeholderTextColor={THEME.text.light}
            value={address}
            onChangeText={setAddress}
          />

          <View style={styles.severityContainer}>
            <TranslatedText style={styles.dropdownLabel} textKey="complaints.severity" fallback="Severity:" />
            <View style={styles.severityButtonsContainer}>
              <SeverityButton
                level="low"
                selected={severity === "low"}
                onPress={() => setSeverity("low")}
                color="#4CAF50"
              />
              <SeverityButton
                level="moderate"
                selected={severity === "moderate"}
                onPress={() => setSeverity("moderate")}
                color="#FF9800"
              />
              <SeverityButton
                level="high"
                selected={severity === "high"}
                onPress={() => setSeverity("high")}
                color="#FF5252"
              />
            </View>
          </View>

          <View style={styles.imageUploadContainer}>
            <TranslatedText style={styles.imageUploadLabel} textKey="complaints.addImages" fallback="Add Images (Max 5):" />
            <View style={styles.imagePreviewContainer}>
              {images.map((uri, index) => (
                <View key={index} style={styles.imagePreviewWrapper}>
                  <Image source={{ uri }} style={styles.imagePreview} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeImage(index)}
                  >
                    <TranslatedText style={styles.removeImageText} textKey="complaints.removeImage" fallback="X" />
                  </TouchableOpacity>
                </View>
              ))}
              {images.length < 5 && (
                <TouchableOpacity
                  style={styles.addImageButton}
                  onPress={pickImages}
                >
                  <Paperclip size={24} color={THEME.primary} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <TranslatedText style={styles.submitButtonText} textKey="complaints.submit" fallback="Submit Complaint" />
            )}
          </TouchableOpacity>
        </View>

        {/* Past Requests Section - Scrollable */}
        <View style={styles.pastRequestsSection}>
          <TranslatedText style={styles.pastRequestsTitle} textKey="complaints.pastRequests" fallback="Your Past Requests" />
          <FlatList
            data={pastRequests}
            keyExtractor={(item) => item.id}
            renderItem={({ item: request }) => (
              <View style={styles.requestCard}>
                <View style={styles.requestHeader}>
                  <TranslatedText style={styles.requestDate} textKey="complaints.date" fallback={new Date(request.created_at).toLocaleDateString()} />
                  <StatusBadge status={request.status} />
                </View>
                <TranslatedText style={styles.requestText} textKey={`request.${request.id}.message`} fallback={request.message} />
                <TranslatedText 
                  style={styles.requestText} 
                  textKey="complaints.address" 
                  fallback={`Address: ${request.address}`} 
                />
                <TranslatedText 
                  style={styles.requestSeverity} 
                  textKey={`complaints.severityLabel`}
                  fallback={`Severity: ${request.severity.charAt(0).toUpperCase() + request.severity.slice(1)}`} 
                />
                {request.media && request.media.length > 0 && (
                  <View style={styles.requestImagesContainer}>
                    <TranslatedText 
                      style={styles.requestImagesLabel} 
                      textKey="complaints.attachedImages" 
                      fallback="Attached Images:" 
                    />
                    <View style={styles.requestImagesPreview}>
                      {request.media.map((media, index) => (
                        <Image
                          key={index}
                          source={{ uri: media.media_url }}
                          style={styles.requestImagePreview}
                        />
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  mainContent: {
    flex: 1,
  },
  formSection: {
    padding: 20,
  },
  headline: {
    fontSize: 28,
    fontWeight: "bold",
    color: THEME.primary,
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    backgroundColor: THEME.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    fontSize: 16,
    color: THEME.text.primary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dropdownButton: {
    backgroundColor: THEME.card,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  dropdownModal: {
    backgroundColor: THEME.card,
    borderRadius: 16,
    maxHeight: '80%',
    width: '100%',
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.text.primary,
  },
  dropdownList: {
    padding: 8,
  },
  dropdownItem: {
    padding: 16,
    borderRadius: 8,
    marginVertical: 4,
  },
  dropdownItemSelected: {
    backgroundColor: '#E0F2F1',
  },
  dropdownItemText: {
    fontSize: 16,
    color: THEME.text.primary,
  },
  dropdownItemTextSelected: {
    color: THEME.primary,
    fontWeight: 'bold',
  },

  // Status badge styles
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  requestDate: {
    fontSize: 14,
    color: THEME.text.secondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusIcon: {
    marginRight: 4,
    fontSize: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },

  dropdownPicker: {
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: THEME.card,
    minHeight: 50,
    borderWidth: 1,
  },
  dropdownContainer: {
    borderColor: '#E5E7EB',
    backgroundColor: THEME.card,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dropdownItemContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    padding: 10,
  },
  dropdownPickerText: {
    fontSize: 16,
    color: THEME.text.primary,
  },
  dropdownSelectedItem: {
    backgroundColor: '#E0F2F1',
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
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  imagePreviewWrapper: {
    position: "relative",
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: THEME.danger,
    borderRadius: 12,
    padding: 4,
  },
  removeImageText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  addImageButton: {
    width: 80,
    height: 80,
    backgroundColor: THEME.card,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  submitButton: {
    backgroundColor: THEME.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  pastRequestsSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  pastRequestsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: THEME.text.primary,
    marginBottom: 10,
  },
  requestCard: {
    backgroundColor: THEME.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
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
    flexDirection: "row",
    gap: 8,
  },
  requestImagePreview: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  requestStatus: {
    fontSize: 14,
    fontWeight: "bold",
  },
  disabledButton: {
    opacity: 0.7,
  },
  severityContainer: {
    marginBottom: 20,
  },
  severityButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  severityButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: THEME.card,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedSeverityButton: {
    shadowOpacity: 0.2,
    elevation: 4,
    transform: [{ scale: 1.02 }],
  },
  severityButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  selectedSeverityButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: THEME.text.secondary,
    marginBottom: 8,
  },
  dropdownLabel: {
    fontSize: 16,
    color: THEME.text.secondary,
    marginBottom: 8,
  },
});
