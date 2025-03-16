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

// Flask API endpoint
const API_URL = "http://127.0.0.1:5000";

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
    { label: "ThereBuddy", value: "ai_doctor" },
  ]);
  const [recentChats, setRecentChats] = useState<Message[]>([]);
  const [ngos, setNgos] = useState<NGO[]>([]);

  useEffect(() => {
    const initialMsg = getInitialMessage(selectedModel)[0];
    setMessages([initialMsg]);
  }, [selectedModel]);

  // Function to handle API call for therapy response
  const getBotResponse = async (userText: string, lang = "en") => {
    try {
      // Determine which endpoint to use based on selectedModel
      const endpoint = selectedModel === "medibuddy" ? "doctor" : "therapist";
      
      let response;
      
      if (endpoint === "therapist") {
        // Call therapist endpoint with text input
        response = await fetch(`${API_URL}/therapist`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            text: userText, 
            lang: lang 
          }),
        });
      } else {
        // Note: Doctor endpoint requires both audio and image files
        // This is a simplified implementation that would need more work
        // This would typically be called with audio recording and image
        Alert.alert("Info", "Doctor endpoint requires audio and image files");
        return "I need both audio and image to provide a proper medical assessment.";
      }

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      
      // Return the appropriate response field based on the endpoint
      return endpoint === "therapist" ? data.therapist_response : data.doctor_response;
    } catch (error) {
      console.error("Error getting bot response:", error);
      return "I'm sorry, I'm having trouble connecting to my knowledge base right now.";
    }
  };

  // Function to handle model selection
  const handleModelSelection = (value: string) => {
    setSelectedModel(value);
  };

  // Function to get bot response
  const simulateBotResponse = async (userText: string) => {
    try {
      const botResponseText = await getBotResponse(userText);
      
      const botResponse: Message = {
        id: Date.now().toString(),
        sender: "assistant",
        text: botResponseText,
        timestamp: new Date(),
      };
      
      setMessages((prevMessages) => [...prevMessages, botResponse]);
      
      // Save this chat to recent chats (simplified)
      const chatPreview: Message = {
        id: Date.now().toString(),
        sender: "assistant",
        text: botResponseText.substring(0, 50) + (botResponseText.length > 50 ? "..." : ""),
        timestamp: new Date(),
      };
      setRecentChats(prev => [chatPreview, ...prev.slice(0, 4)]); // Keep only 5 recent chats
      
      scrollToBottom();
    } catch (error) {
      console.error("Error getting bot response:", error);
      Alert.alert("Error", "Failed to get response from the assistant");
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

        // Here we would typically upload the image and call an API
        // For now, we'll just add it to the messages
        const newMessage: Message = {
          id: Date.now().toString(),
          sender: "user",
          text: "",
          timestamp: new Date(),
          media: {
            type: "image",
            uri: result.assets[0].uri,
          },
        };
        
        setMessages((prev) => [...prev, newMessage]);
        
        // Add placeholder text for now - in a real app, you'd analyze the image
        await simulateBotResponse("I'm examining the image you sent.");
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
        // Add voice message to chat
        const newMessage: Message = {
          id: Date.now().toString(),
          sender: "user",
          text: "🎤 Voice message",
          timestamp: new Date(),
          media: {
            type: "audio",
            uri: uri,
          },
        };
        
        setMessages([...messages, newMessage]);
        
        // In a real app, you would send this audio to your backend
        // For now, just respond with a placeholder
        await simulateBotResponse("I've received your voice message.");
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
      try {
        const newMessage: Message = {
          id: Date.now().toString(),
          sender: "user",
          text: inputText.trim(),
          timestamp: new Date(),
        };
        setMessages([...messages, newMessage]);
        
        const userText = inputText.trim();
        setInputText("");

        // Get bot response
        await simulateBotResponse(userText);
      } catch (error) {
        console.error("Error sending message:", error);
        Alert.alert(
          "Error",
          "Failed to send message. Please try again."
        );
      }
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
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

  // Create a function to get initial message based on selected model
  const getInitialMessage = (modelType: string): Message[] => {
    if (modelType === "medibuddy") {
      return [{
        id: "1",
        sender: "assistant",
        text: "Hello! I'm your MediBuddy, your personal healthcare assistant. How can I help you today?",
        timestamp: new Date(),
      }];
    } else {
      return [{
        id: "1",
        sender: "assistant",
        text: "Hi! I'm ThereBuddy, your mental health companion. I'm here to listen and support you. How are you feeling today?",
        timestamp: new Date(),
      }];
    }
  };

  // Function to handle past chat selection
  const handlePastChatClick = (message: Message) => {
    // In a real app, you would fetch the full conversation
    // For now, just start a new chat with this message as context
    const initialMsg = getInitialMessage(selectedModel)[0];
    setMessages([initialMsg]);
    
    // Add a message that references the past conversation
    setTimeout(() => {
      const contextMessage: Message = {
        id: Date.now().toString(),
        sender: "assistant",
        text: `Continuing our previous conversation about "${message.text}"...`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, contextMessage]);
    }, 500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.newChatButton}
          onPress={() => {
            setMessages(getInitialMessage(selectedModel));
          }}
        >
          <MessageCircle size={20} color={THEME.primary} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>
            {selectedModel === "medibuddy" ? "MediBuddy" : "ThereBuddy"}
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
                  message.sender === "user" ? styles.userMessage : styles.botMessage,
                ]}
              >
                {message.media?.type === "image" && (
                  <TouchableOpacity
                    onPress={() => message.media && openImagePreview(message.media.uri)}
                  >
                    <Image
                      source={{ uri: message.media.uri }}
                      style={[
                        styles.messageImage,
                        message.sender === "user" ? styles.userMessageImage : styles.botMessageImage
                      ]}
                    />
                  </TouchableOpacity>
                )}
                {message.media?.type === "audio" && (
                  <View style={[
                    styles.audioContainer,
                    message.sender === "user" ? styles.userAudioContainer : styles.botAudioContainer
                  ]}>
                    <TouchableOpacity
                      onPress={() => message.media && handleAudioPlayback(message.media.uri)}
                    >
                      {isPlaying ? (
                        <Pause size={20} color={message.sender === "user" ? "#fff" : THEME.primary} />
                      ) : (
                        <Play size={20} color={message.sender === "user" ? "#fff" : THEME.primary} />
                      )}
                    </TouchableOpacity>
                    <Text
                      style={[
                        styles.messageText,
                        message.sender === "user" ? styles.userMessageText : styles.botMessageText,
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
                      message.sender === "user" ? styles.userMessageText : styles.botMessageText,
                    ]}
                  >
                    {message.text}
                  </Text>
                )}
                <Text
                  style={[
                    styles.messageTime,
                    message.sender === "user" ? styles.userMessageTime : styles.botMessageTime,
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

        {/* Recent Chats Section */}
        <FlatList
          data={recentChats}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={() => (
            <Text style={styles.pastChatsTitle}>Recent Chats</Text>
          )}
          renderItem={({ item: chat }) => (
            <TouchableOpacity
              style={styles.pastChatCard}
              onPress={() => handlePastChatClick(chat)}
            >
              <Text style={styles.pastChatTimestamp}>
                {chat.timestamp.toLocaleDateString()}
              </Text>
              <Text style={styles.pastChatMessage} numberOfLines={2}>
                {chat.text}
              </Text>
              {chat.media && (
                <View style={styles.pastChatMediaIndicator}>
                  {chat.media.type === "image" && (
                    <ImageIcon size={16} color={THEME.text.light} />
                  )}
                  {chat.media.type === "audio" && (
                    <Mic size={16} color={THEME.text.light} />
                  )}
                </View>
              )}
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
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: THEME.primary,
    borderBottomRightRadius: 4,
    marginLeft: '20%',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: THEME.card,
    borderBottomLeftRadius: 4,
    marginRight: '20%',
    shadowColor: '#000',
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
    color: '#fff',
  },
  botMessageText: {
    color: THEME.text.primary,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  userMessageTime: {
    color: 'rgba(255,255,255,0.8)',
  },
  botMessageTime: {
    color: THEME.text.light,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 8,
  },
  userMessageImage: {
    alignSelf: 'flex-end',
  },
  botMessageImage: {
    alignSelf: 'flex-start',
  },
  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userAudioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  botAudioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
