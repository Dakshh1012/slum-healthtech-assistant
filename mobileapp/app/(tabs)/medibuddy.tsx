import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Modal,
  Alert,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  MessageCircle,
  Mic,
  Paperclip,
  Image as ImageIcon,
  Camera,
  X,
  Send,
  ChevronDown,
  Play,
  Pause,
} from "lucide-react-native"; // Added Play and Pause icons
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { Audio } from "expo-av";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import DropDownPicker from "react-native-dropdown-picker";
import { NGO } from '../../lib/types';

const THEME = {
  primary: "#00BFA6",
  secondary: "#4C5DF4",
  warning: "#FF9800",
  danger: "#FF5252",
  background: "#F7FAFA",
  card: "#FFFFFF",
  text: {
    primary: "#2D3142",
    secondary: "#4F5565",
    light: "#9BA3AF",
  },
};

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: Date;
  media?: {
    type: "image" | "audio";
    uri: string;
    duration?: number;
  };
}

interface ChatHistory {
  id: string;
  model_type: string;
  message_content: string;
  created_at: string;
  media_url?: string;
  message_type: "text" | "image" | "audio";
}


const initialMessages: Message[] = [
  {
    id: "1",
    sender: "assistant",
    text: "Hello! I'm your MediBuddy, your personal healthcare assistant. How can I help you today?",
    timestamp: new Date(),
  },
];

export default function MediBuddyScreen() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [showMediaOptions, setShowMediaOptions] = useState(false);
  const [selectedModel, setSelectedModel] = useState("medibuddy");
  const [previewImage, setPreviewImage] = useState<string | null>(null); // State for image preview
  const [sound, setSound] = useState<Audio.Sound | null>(null); // State for audio playback
  const [isPlaying, setIsPlaying] = useState(false); // State to track if audio is playing
  const scrollViewRef = useRef<FlatList<Message>>(null);
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([
    { label: "MediBuddy", value: "medibuddy" },
    { label: "AI Doctor", value: "ai_doctor" },
  ]);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [ngos, setNgos] = useState<NGO[]>([]);

  useEffect(() => {
    fetchChatHistory();
  }, [selectedModel]);

  const fetchChatHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("chats")
        .select("*")
        .eq("user_id", user?.id)
        .eq("model_type", selectedModel)
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) throw error;
      setChatHistory(data || []);
    } catch (error) {
      console.error("Error fetching chat history:", error);
    }
  };

  // Function to handle model selection
  const handleModelSelection = () => {
    Alert.alert(
      "Select Model",
      "",
      [
        { text: "Therapist", onPress: () => setSelectedModel("Therapist") },
        { text: "Doctor", onPress: () => setSelectedModel("Doctor") },
      ],
      { cancelable: true }
    );
  };

  // Function to simulate bot response
  const simulateBotResponse = () => {
    setTimeout(() => {
      const botResponse: Message = {
        id: Date.now().toString(),
        sender: "assistant",
        text: `I'm the ${selectedModel}. I've received your message.`,
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, botResponse]);
      scrollToBottom();
    }, 1000);
  };

  // Function to upload media to Supabase storage
  const uploadMedia = async (uri: string, type: "image" | "audio") => {
    try {
      console.log("Starting media upload function");

      if (!uri) {
        console.log("Error: No URI provided");
        throw new Error("No URI provided");
      }
      console.log(`URI provided: ${uri}, type: ${type}`);

      // Read the file
      console.log("Fetching file content");
      const response = await fetch(uri);
      console.log(`Fetch response status: ${response.status}`);

      if (!response.ok) {
        console.log(`Error: Failed to read file, status: ${response.status}`);
        throw new Error("Failed to read file");
      }

      console.log("Creating blob from response");
      const blob = await response.blob();
      console.log(`Blob created, size: ${blob.size}, type: ${blob.type}`);

      if (!blob) {
        console.log("Error: Failed to create blob");
        throw new Error("Failed to create blob");
      }

      // Generate a unique filename with appropriate extension
      const extension = type === "image" ? ".jpg" : ".m4a";
      const fileName = `${Date.now()}${extension}`;
      const filePath = `${user?.id}/${type}s/${fileName}`;
      console.log(`Generated file path: ${filePath}`);

      // Upload to Supabase storage
      console.log("Starting Supabase upload");
      const { data, error } = await supabase.storage
        .from("chat-media")
        .upload(filePath, blob, {
          contentType: type === "image" ? "image/jpeg" : "audio/m4a",
          cacheControl: "3600",
          upsert: true,
        });

      console.log("Supabase upload response:", { data, error });

      if (error) {
        console.error("Supabase storage error:", error);
        throw new Error(`Upload failed: ${error.message}`);
      }

      // Get the public URL
      console.log("Getting public URL");
      const {
        data: { publicUrl },
      } = supabase.storage.from("chat-media").getPublicUrl(filePath);

      console.log(`Public URL generated: ${publicUrl}`);
      return publicUrl;
    } catch (error) {
      console.error("Error in uploadMedia:", error);
      Alert.alert(
        "Upload Error",
        "Failed to upload media. Please check your internet connection and try again."
      );
      return null;
    }
  };

  // Function to store message in database
  const storeMessage = async (
    content: string,
    senderType: "user" | "assistant",
    messageType: "text" | "audio" | "image",
    mediaUrl?: string
  ) => {
    try {
      const { data, error } = await supabase.from("chats").insert({
        user_id: user?.id,
        model_type: selectedModel,
        sender_type: senderType,
        message_type: messageType,
        message_content: content,
        media_url: mediaUrl,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error storing message:", error);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // This will be deprecated but still works
        allowsEditing: true,
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        setShowMediaOptions(false);

        // Show loading indicator or some feedback
        const mediaUrl = await uploadMedia(result.assets[0].uri, "image");

        if (mediaUrl) {
          const newMessage: Message = {
            id: Date.now().toString(),
            sender: "user",
            text: "",
            timestamp: new Date(),
            media: {
              type: "image",
              uri: mediaUrl,
            },
          };
          setMessages((prev) => [...prev, newMessage]);
          await storeMessage("", "user", "image", mediaUrl);
          simulateBotResponse();
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      Alert.alert("Failed to start recording");
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      if (uri) {
        // Upload the audio file to Supabase
        const mediaUrl = await uploadMedia(uri, "audio");

        if (mediaUrl) {
          const newMessage: Message = {
            id: Date.now().toString(),
            sender: "user",
            text: "🎤 Voice message",
            timestamp: new Date(),
            media: {
              type: "audio",
              uri: mediaUrl,
            },
          };
          setMessages([...messages, newMessage]);
          await storeMessage("🎤 Voice message", "user", "audio", mediaUrl);
          simulateBotResponse();
        }
      }
    } catch (err) {
      console.error("Error stopping recording:", err);
      Alert.alert("Failed to stop recording");
    }

    setRecording(null);
    setIsRecording(false);
  };

  const handleSendMessage = async () => {
    if (inputText.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        sender: "user",
        text: inputText.trim(),
        timestamp: new Date(),
      };
      setMessages([...messages, newMessage]);
      setInputText("");

      // Store message in database
      await storeMessage(inputText.trim(), "user", "text");
      simulateBotResponse();
    }
  };

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Function to open image preview
  const openImagePreview = (uri: string) => {
    setPreviewImage(uri);
  };

  // Function to close image preview
  const closeImagePreview = () => {
    setPreviewImage(null);
  };

  // Function to handle audio playback
  const handleAudioPlayback = async (uri: string) => {
    try {
      if (sound) {
        // If sound is already loaded
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
        }
      } else {
        // Load and play new sound
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri },
          { shouldPlay: true },
          (status) => {
            if (status.isLoaded && status.didJustFinish) {
              setIsPlaying(false);
              setSound(null);
            }
          }
        );
        setSound(newSound);
        setIsPlaying(true);

        // Unload sound when finished
        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            setIsPlaying(false);
            setSound(null);
            newSound.unloadAsync();
          }
        });
      }
    } catch (error) {
      console.error("Error playing audio:", error);
      Alert.alert("Error", "Failed to play audio. Please try again.");
    }
  };

  // Modify the ModelSelector component
  const ModelSelector = () => (
    <View style={styles.modelSelectorContainer}>
      <DropDownPicker
        open={open}
        value={selectedModel}
        items={items}
        setOpen={setOpen}
        setValue={setSelectedModel}
        setItems={setItems}
        style={styles.dropdown}
        containerStyle={styles.dropdownContainer}
        labelStyle={styles.dropdownLabel}
      />
    </View>
  );

  // Add this function inside MediBuddyScreen component
  const handlePastChatClick = (chat: ChatHistory) => {
    // Add the selected chat message to current messages
    const newMessage: Message = {
      id: chat.id,
      sender: "user",
      text: chat.message_content,
      timestamp: new Date(chat.created_at),
      ...(chat.media_url && {
        media: {
          type: chat.message_type as "image" | "audio",
          uri: chat.media_url,
        },
      }),
    };
    setMessages([...initialMessages, newMessage]);
  };

  const fetchNGOs = async () => {
    try {
      const { data, error } = await supabase
        .from("ngo")
        .select("id, name, email, phone, address");

      console.log("Fetched NGOs:", data); // Add this line to debug

      if (error) throw error;
      setNgos(data || []);
    } catch (error) {
      console.error("Error fetching NGOs:", error);
      Alert.alert("Error", "Failed to fetch NGOs");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.newChatButton}
          onPress={() => {
            setMessages(initialMessages);
            fetchChatHistory();
          }}
        >
          <MessageCircle size={20} color={THEME.primary} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>
            {selectedModel === "medibuddy" ? "MediBuddy" : "AI Doctor"}
          </Text>
        </View>
        <View style={styles.modelSelectorContainer}>
          <DropDownPicker
            open={open}
            value={selectedModel}
            items={items}
            setOpen={setOpen}
            setValue={setSelectedModel}
            setItems={setItems}
            style={styles.dropdown}
            containerStyle={styles.dropdownContainer}
            labelStyle={styles.dropdownLabel}
          />
        </View>
      </View>

      <View style={styles.mainContainer}>
        <View style={styles.chatCard}>
          <FlatList
            ref={scrollViewRef}
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.chatContainer}
            onContentSizeChange={() => scrollToBottom()}
            renderItem={({ item: message }) => (
              <View
                style={[
                  styles.messageBubble,
                  message.sender === "user"
                    ? styles.userMessage
                    : styles.botMessage,
                ]}
              >
                {message.media?.type === "image" && (
                  <TouchableOpacity
                    onPress={() =>
                      message.media && openImagePreview(message.media.uri)
                    }
                  >
                    <Image
                      source={{ uri: message.media.uri }}
                      style={styles.messageImage}
                    />
                  </TouchableOpacity>
                )}
                {message.media?.type === "audio" && (
                  <View style={styles.audioContainer}>
                    <TouchableOpacity
                      onPress={() =>
                        message.media && handleAudioPlayback(message.media.uri)
                      }
                    >
                      {isPlaying ? (
                        <Pause
                          size={20}
                          color={
                            message.sender === "user" ? "#fff" : THEME.primary
                          }
                        />
                      ) : (
                        <Play
                          size={20}
                          color={
                            message.sender === "user" ? "#fff" : THEME.primary
                          }
                        />
                      )}
                    </TouchableOpacity>
                    <Text
                      style={[
                        styles.messageText,
                        message.sender === "user" && styles.userMessageText,
                      ]}
                    >
                      Voice Message
                    </Text>
                  </View>
                )}
                {message.text && (
                  <Text
                    style={[
                      styles.messageText,
                      message.sender === "user" && styles.userMessageText,
                    ]}
                  >
                    {message.text}
                  </Text>
                )}
                <Text
                  style={[
                    styles.messageTime,
                    message.sender === "user" && styles.userMessageTime,
                  ]}
                >
                  {formatTime(message.timestamp)}
                </Text>
              </View>
            )}
          />

          <View style={styles.inputContainer}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setShowMediaOptions(true)}
            >
              <Paperclip size={24} color={THEME.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={isRecording ? stopRecording : startRecording}
            >
              <Mic
                size={24}
                color={isRecording ? THEME.danger : THEME.primary}
              />
            </TouchableOpacity>
            <TextInput
              style={styles.textInput}
              placeholder="Type your message..."
              placeholderTextColor={THEME.text.light}
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                !inputText.trim() && styles.sendButtonDisabled,
              ]}
              onPress={handleSendMessage}
              disabled={!inputText.trim()}
            >
              <Send size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Past Chats Section */}
        <FlatList
          data={chatHistory}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={() => (
            <Text style={styles.pastChatsTitle}>Recent Chats</Text>
          )}
          renderItem={({ item: chat }) => (
            <TouchableOpacity
              style={styles.pastChatCard}
              onPress={() => handlePastChatClick(chat)}
            >
              <Text style={styles.pastChatMessage}>{chat.message_content}</Text>
              {chat.media_url && (
                <View style={styles.pastChatMediaIndicator}>
                  {chat.message_type === "image" && (
                    <ImageIcon size={16} color={THEME.text.light} />
                  )}
                  {chat.message_type === "audio" && (
                    <Mic size={16} color={THEME.text.light} />
                  )}
                </View>
              )}
              <Text style={styles.pastChatTimestamp}>
                {new Date(chat.created_at).toLocaleString()}
              </Text>
            </TouchableOpacity>
          )}
          style={styles.pastChatsSection}
        />
      </View>

      {/* Media Options Modal */}
      <Modal
        visible={showMediaOptions}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMediaOptions(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowMediaOptions(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Media</Text>
              <TouchableOpacity
                onPress={() => setShowMediaOptions(false)}
                style={styles.closeButton}
              >
                <X size={24} color={THEME.text.primary} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.modalOption} onPress={pickImage}>
              <ImageIcon size={24} color={THEME.primary} />
              <Text style={styles.modalOptionText}>Choose from Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalOption}>
              <Camera size={24} color={THEME.primary} />
              <Text style={styles.modalOptionText}>Take Photo</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Image Preview Modal */}
      <Modal
        visible={!!previewImage}
        transparent
        onRequestClose={closeImagePreview}
      >
        <View style={styles.imagePreviewOverlay}>
          <TouchableOpacity
            style={styles.closePreviewButton}
            onPress={closeImagePreview}
          >
            <X size={24} color="#fff" />
          </TouchableOpacity>
          <Image
            source={{ uri: previewImage || "" }}
            style={styles.fullScreenImage}
            resizeMode="contain"
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  header: {
    backgroundColor: THEME.card,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
    height: 60,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: THEME.text.primary,
  },
  newChatButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.background,
    justifyContent: "center",
    alignItems: "center",
  },
  mainContainer: {
    flex: 1,
  },
  chatCard: {
    flex: 1,
    margin: 20,
    borderRadius: 20,
    backgroundColor: THEME.card,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    minHeight: "60%",
  },
  chatContainer: {
    flexGrow: 1,
    padding: 16,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: THEME.primary,
    borderBottomRightRadius: 4,
  },
  botMessage: {
    alignSelf: "flex-start",
    backgroundColor: THEME.card,
    borderBottomLeftRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 15,
    color: THEME.text.primary,
    lineHeight: 20,
  },
  userMessageText: {
    color: "#fff",
  },
  messageTime: {
    fontSize: 11,
    color: THEME.text.light,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  userMessageTime: {
    color: "rgba(255,255,255,0.8)",
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 8,
  },
  audioContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: THEME.card,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
  },
  textInput: {
    flex: 1,
    marginHorizontal: 8,
    padding: 10,
    backgroundColor: THEME.background,
    borderRadius: 20,
    maxHeight: 100,
    fontSize: 15,
    color: THEME.text.primary,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: THEME.text.light,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: THEME.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: THEME.text.primary,
  },
  closeButton: {
    padding: 4,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    backgroundColor: THEME.background,
    marginBottom: 12,
  },
  modalOptionText: {
    marginLeft: 12,
    fontSize: 16,
    color: THEME.text.primary,
  },
  imagePreviewOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  closePreviewButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 1,
  },
  fullScreenImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  pastChatsSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  pastChatsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: THEME.text.primary,
    marginBottom: 10,
  },
  pastChatCard: {
    backgroundColor: THEME.card,
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  pastChatMessage: {
    fontSize: 14,
    color: THEME.text.secondary,
    marginTop: 4,
  },
  pastChatTimestamp: {
    fontSize: 12,
    color: THEME.text.light,
    marginTop: 4,
  },
  modelSelectorContainer: {
    width: 150,
    zIndex: 1000,
  },
  dropdown: {
    backgroundColor: THEME.card,
    borderColor: "rgba(0,0,0,0.1)",
    minHeight: 30,
    height: 40,
  },
  dropdownContainer: {
    width: "100%",
  },
  dropdownLabel: {
    color: THEME.text.primary,
    fontSize: 14,
  },
  pastChatMediaIndicator: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
});
