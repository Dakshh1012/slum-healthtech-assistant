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

// Update the API URL based on platform
const API_URL = Platform.select({
  ios: "http://localhost:5000",
  android: "https://7223-136-232-248-186.ngrok-free.app", // Special IP for Android emulator
  default: "https://7223-136-232-248-186.ngrok-free.app",
});

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

interface Doctor {
  name: string;
  specialization: string;
  fees: number;
  location: string;
}

interface BotResponse {
  doctor_response?: string;
  doctor_response_en?: string;
  voice_output?: string;
  recommended_doctors?: Doctor[];
  transcription?: string;
  user_input?: string;
}

interface FormDataValue {
  uri: string;
  name: string;
  type: string;
}

const generateUniqueId = (() => {
  let counter = 0;
  return () => {
    const timestamp = Date.now();
    counter = (counter + 1) % 1000; // Reset counter after 999
    return `msg_${timestamp}_${counter}`;
  };
})();

const initialMessages: Message[] = [
  {
    id: generateUniqueId(),
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
    { label: "TheraBuddy", value: "ai_doctor" },
  ]);
  const [recentChats, setRecentChats] = useState<Message[]>([]);
  const [ngos, setNgos] = useState<NGO[]>([]);

  useEffect(() => {
    const initialMsg = getInitialMessage(selectedModel)[0];
    setMessages([initialMsg]);
  }, [selectedModel]);

  useEffect(() => {
    // Set up audio mode when component mounts
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          interruptionModeIOS: 1,  // DoNotMix = 1
          interruptionModeAndroid: 1,  // DoNotMix = 1
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (error) {
        console.error("Error setting up audio:", error);
      }
    };

    setupAudio();

    // Cleanup function
    return () => {
      if (sound instanceof Audio.Sound) {  // Type check
        sound.unloadAsync();
      }
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, []);

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
        id: generateUniqueId(),
        sender: "assistant",
        text: botResponseText,
        timestamp: new Date(),
      };
      
      setMessages((prevMessages) => [...prevMessages, botResponse]);
      
      // Save this chat to recent chats (simplified)
      const chatPreview: Message = {
        id: generateUniqueId(),
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
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        setShowMediaOptions(false);

        // Create form data
        const formData = new FormData();
        formData.append('image', {
          uri: result.assets[0].uri,
          type: 'image/jpeg',
          name: 'image.jpg',
        } as unknown as Blob);

        // Add user message with image
        const userMessage: Message = {
          id: generateUniqueId(),
          sender: "user",
          text: "",
          timestamp: new Date(),
          media: {
            type: "image",
            uri: result.assets[0].uri,
          },
        };
        setMessages(prev => [...prev, userMessage]);

        // Make API call
        const response = await fetch(`${API_URL}/doctor_image`, {
          method: 'POST',
          body: formData,
        });

        const data: BotResponse = await response.json();

        // Add bot response
        const botMessage: Message = {
          id: generateUniqueId(),
          sender: "assistant",
          text: data.doctor_response || "",
          timestamp: new Date(),
          media: data.voice_output ? {
            type: "audio",
            uri: data.voice_output
          } : undefined
        };
        setMessages(prev => [...prev, botMessage]);

        // Add recommended doctors message
        if (data.recommended_doctors && Array.isArray(data.recommended_doctors) && data.recommended_doctors.length > 0) {
          const uniqueDoctors = [...new Map(data.recommended_doctors.map((doc: Doctor) => 
            [doc.name, doc]
          )).values()] as Doctor[];

          const doctorsMessage: Message = {
            id: generateUniqueId(),
            sender: "assistant",
            text: `Recommended Doctors:\n${uniqueDoctors.map((doc) => 
              `• ${doc.name} (${doc.specialization})\n  Location: ${doc.location}\n  Fees: ₹${doc.fees}`
            ).join('\n\n')}`,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, doctorsMessage]);
        }

        scrollToBottom();
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to process image. Please try again.");
    }
  };

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission required', 'Please grant microphone permission to record audio.');
        return;
      }

      // Create recording instance with high quality preset
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording:', err);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      if (!uri) {
        throw new Error('No recording URI available');
      }

      // Verify the audio file exists and has content
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists || fileInfo.size === 0) {
        throw new Error('Recording file is empty or does not exist');
      }

      // Create form data
      const formData = new FormData();
      formData.append('audio', {
        uri: uri,
        type: 'audio/mp4', // Change back to mp4 since that's what expo-av uses
        name: 'recording.m4a',
      } as unknown as Blob);

      // Add user voice message
      const userMessage: Message = {
        id: generateUniqueId(),
        sender: "user",
        text: "🎤 Voice message",
        timestamp: new Date(),
        media: {
          type: "audio",
          uri: uri,
        },
      };
      setMessages(prev => [...prev, userMessage]);

      // Make API call
      console.log('Sending audio to:', `${API_URL}/doctor_audio`);
      const response = await fetch(`${API_URL}/doctor_audio`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', response.status, errorText);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data: BotResponse = await response.json();
      console.log('Received response:', data);

      // Add transcription message if available
      if (data.transcription) {
        const transcriptionMessage: Message = {
          id: generateUniqueId(),
          sender: "user",
          text: `Transcription: ${data.transcription}`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, transcriptionMessage]);
      }

      // Add bot response
      const botMessage: Message = {
        id: generateUniqueId(),
        sender: "assistant",
        text: data.doctor_response || "",
        timestamp: new Date(),
        media: data.voice_output ? {
          type: "audio",
          uri: data.voice_output
        } : undefined
      };
      setMessages(prev => [...prev, botMessage]);

      // Add recommended doctors message
      if (data.recommended_doctors && Array.isArray(data.recommended_doctors) && data.recommended_doctors.length > 0) {
        const uniqueDoctors = [...new Map(data.recommended_doctors.map((doc: Doctor) => 
          [doc.name, doc]
        )).values()] as Doctor[];

        const doctorsMessage: Message = {
          id: generateUniqueId(),
          sender: "assistant",
          text: `Recommended Doctors:\n${uniqueDoctors.map((doc) => 
            `• ${doc.name} (${doc.specialization})\n  Location: ${doc.location}\n  Fees: ₹${doc.fees}`
          ).join('\n\n')}`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, doctorsMessage]);
      }

      scrollToBottom();
    } catch (error) {
      console.error("Error processing audio:", error);
      Alert.alert("Error", "Failed to process audio. Please try again.");
    }
  };

  const handleSendMessage = async () => {
    if (inputText.trim()) {
      try {
        // Add user message to chat
        const userMessage: Message = {
          id: generateUniqueId(),
          sender: "user",
          text: inputText.trim(),
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMessage]);
        
        // Clear input text immediately to improve UX
        setInputText("");

        const endpoint = selectedModel === "medibuddy" ? "doctor_text" : "therapist";
        const url = `${API_URL}/${endpoint}`;
        
        console.log('Sending request to:', url);
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({ 
            text: userMessage.text,
            lang: 'en' // Add language parameter if needed
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Server response:', response.status, errorText);
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Received response:', data);

        // Add bot response to chat
        const botMessage: Message = {
          id: generateUniqueId(),
          sender: "assistant",
          text: selectedModel === "medibuddy" ? data.doctor_response : data.therapist_response,
          timestamp: new Date(),
          media: data.voice_output ? {
            type: "audio",
            uri: data.voice_output
          } : undefined
        };
        setMessages(prev => [...prev, botMessage]);

        // Add recommended doctors message if available
        if (data.recommended_doctors && Array.isArray(data.recommended_doctors) && data.recommended_doctors.length > 0) {
          const uniqueDoctors = [...new Map(data.recommended_doctors.map((doc: Doctor) => 
            [doc.name, doc]
          )).values()] as Doctor[];

          const doctorsMessage: Message = {
            id: generateUniqueId(),
            sender: "assistant",
            text: `Recommended Doctors:\n${uniqueDoctors.map((doc) => 
              `• ${doc.name} (${doc.specialization})\n  Location: ${doc.location}\n  Fees: ₹${doc.fees}`
            ).join('\n\n')}`,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, doctorsMessage]);
        }

        scrollToBottom();
      } catch (error) {
        console.error("Error sending message:", error);
        
        // More detailed error message
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        Alert.alert(
          "Error", 
          `Failed to send message: ${errorMessage}\nPlease check your network connection and try again.`
        );
        
        // Add error message to chat
        const errorChatMessage: Message = {
          id: generateUniqueId(),
          sender: "assistant",
          text: "Sorry, I encountered an error. Please check your network connection and try again.",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorChatMessage]);
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
        // If the same sound is playing, toggle play/pause
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
        }
      } else {
        // Unload any previous sound
        // if (sound) {
        //   await sound.unloadAsync();
        // }

        console.log('Loading audio from:', uri);
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri },
          { shouldPlay: true },
          (status) => {
            if (!status.isLoaded) {
              console.log('Error loading sound:', status);
              return;
            }
            console.log('Sound status:', status);
            if (status.didJustFinish) {
              setIsPlaying(false);
              setSound(null);
            }
          },
          true
        );

        setSound(newSound);
        setIsPlaying(true);

        // Handle playback completion
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
        id: generateUniqueId(),
        sender: "assistant",
        text: "Hello! I'm your MediBuddy, your personal healthcare assistant. How can I help you today?",
        timestamp: new Date(),
      }];
    } else {
      return [{
        id: generateUniqueId(),
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
        id: generateUniqueId(),
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
