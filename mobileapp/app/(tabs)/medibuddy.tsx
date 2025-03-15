import React, { useState, useRef } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
} from 'lucide-react-native'; // Added Play and Pause icons
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';

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

const initialMessages: Message[] = [
  {
    id: 1,
    sender: 'bot',
    text: 'Hello! I\'m your MediBuddy, your personal healthcare assistant. How can I help you today?',
    timestamp: new Date(),
  },
];

interface Message {
  id: number;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
  media?: {
    type: 'image' | 'audio';
    uri: string;
    duration?: number;
  };
}

export default function MediBuddyScreen() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [showMediaOptions, setShowMediaOptions] = useState(false);
  const [selectedModel, setSelectedModel] = useState('Therapist');
  const [previewImage, setPreviewImage] = useState<string | null>(null); // State for image preview
  const [sound, setSound] = useState<Audio.Sound | null>(null); // State for audio playback
  const [isPlaying, setIsPlaying] = useState(false); // State to track if audio is playing
  const scrollViewRef = useRef<ScrollView>(null);

  // Dummy data for past chats
  const [pastChats, setPastChats] = useState([
    {
      id: '1',
      model: 'Therapist',
      lastMessage: 'I received your message. Let me analyze it.',
      timestamp: '2023-10-01T10:00:00Z',
    },
    {
      id: '2',
      model: 'Doctor',
      lastMessage: 'With what I see, I think you have...',
      timestamp: '2023-10-02T12:30:00Z',
    },
  ]);

  // Function to handle model selection
  const handleModelSelection = () => {
    Alert.alert(
      'Select Model',
      '',
      [
        { text: 'Therapist', onPress: () => setSelectedModel('Therapist') },
        { text: 'Doctor', onPress: () => setSelectedModel('Doctor') },
      ],
      { cancelable: true }
    );
  };

  // Function to simulate bot response
  const simulateBotResponse = () => {
    setTimeout(() => {
      const botResponse: Message = {
        id: Date.now(),
        sender: 'bot',
        text: `I'm the ${selectedModel}. I've received your message.`,
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, botResponse]);
      scrollToBottom();
    }, 1000);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      const newMessage: Message = {
        id: Date.now(),
        sender: 'user',
        text: '',
        timestamp: new Date(),
        media: {
          type: 'image',
          uri: result.assets[0].uri,
        },
      };
      setMessages([...messages, newMessage]);
      simulateBotResponse();
    }

    setShowMediaOptions(false);
  };

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      Alert.alert('Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      if (uri) {
        const newMessage: Message = {
          id: Date.now(),
          sender: 'user',
          text: '🎤 Voice message',
          timestamp: new Date(),
          media: {
            type: 'audio',
            uri,
          },
        };
        setMessages([...messages, newMessage]);
        simulateBotResponse();
      }
    } catch (err) {
      Alert.alert('Failed to stop recording');
    }

    setRecording(null);
    setIsRecording(false);
  };

  const handleSendMessage = () => {
    if (inputText.trim()) {
      const newMessage: Message = {
        id: Date.now(),
        sender: 'user',
        text: inputText.trim(),
        timestamp: new Date(),
      };
      setMessages([...messages, newMessage]);
      setInputText('');
      simulateBotResponse();
    }
  };

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
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
    if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
      }
    } else {
      const { sound: newSound } = await Audio.Sound.createAsync({ uri });
      setSound(newSound);
      await newSound.playAsync();
      setIsPlaying(true);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>MediBuddy</Text>
          <Text style={styles.headerSubtitle}>Your Personal Health Assistant</Text>
        </View>

        {/* Chat Dialog */}
        <View style={styles.chatCard}>
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.chatContainer}
            onContentSizeChange={scrollToBottom}
          >
            {messages.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.messageBubble,
                  message.sender === 'user' ? styles.userMessage : styles.botMessage,
                ]}
              >
                {message.media?.type === 'image' && (
                  <TouchableOpacity onPress={() => message.media && openImagePreview(message.media.uri)}>
                    <Image source={{ uri: message.media.uri }} style={styles.messageImage} />
                  </TouchableOpacity>
                )}
                {message.media?.type === 'audio' && (
                  <View style={styles.audioContainer}>
                    <TouchableOpacity onPress={() => message.media && handleAudioPlayback(message.media.uri)}>
                      {isPlaying ? (
                        <Pause size={20} color={message.sender === 'user' ? '#fff' : THEME.primary} />
                      ) : (
                        <Play size={20} color={message.sender === 'user' ? '#fff' : THEME.primary} />
                      )}
                    </TouchableOpacity>
                    <Text style={[styles.messageText, message.sender === 'user' && styles.userMessageText]}>
                      Voice Message
                    </Text>
                  </View>
                )}
                {message.text && (
                  <Text style={[styles.messageText, message.sender === 'user' && styles.userMessageText]}>
                    {message.text}
                  </Text>
                )}
                <Text style={[styles.messageTime, message.sender === 'user' && styles.userMessageTime]}>
                  {formatTime(message.timestamp)}
                </Text>
              </View>
            ))}
          </ScrollView>
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
              style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
              onPress={handleSendMessage}
              disabled={!inputText.trim()}
            >
              <Send size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Input Section */}


        {/* Past Chats Section */}
        <ScrollView>
        <View style={styles.pastChatsSection}>
          <Text style={styles.pastChatsTitle}>Past Chats</Text>
          {pastChats.map((chat) => (
            <View key={chat.id} style={styles.pastChatCard}>
              <Text style={styles.pastChatModel}>{chat.model}</Text>
              <Text style={styles.pastChatMessage}>{chat.lastMessage}</Text>
              <Text style={styles.pastChatTimestamp}>
                {new Date(chat.timestamp).toLocaleString()}
              </Text>
            </View>
          ))}
        </View>
        </ScrollView>
        

        {/* Model Selection Dropdown */}
        <TouchableOpacity style={styles.modelSelector} onPress={handleModelSelection}>
          <Text style={styles.modelSelectorText}>{selectedModel}</Text>
          <ChevronDown size={20} color={THEME.text.secondary} />
        </TouchableOpacity>

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
        <Modal visible={!!previewImage} transparent onRequestClose={closeImagePreview}>
          <View style={styles.imagePreviewOverlay}>
            <TouchableOpacity style={styles.closePreviewButton} onPress={closeImagePreview}>
              <X size={24} color="#fff" />
            </TouchableOpacity>
            <Image
              source={{ uri: previewImage || '' }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          </View>
        </Modal>
      </KeyboardAvoidingView>
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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: THEME.text.primary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: THEME.text.secondary,
    marginTop: 4,
  },
  chatCard: {
    flex: 1,
    margin: 20,
    borderRadius: 20,
    backgroundColor: THEME.card,
    shadowColor: '#000',
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
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: THEME.card,
    borderBottomLeftRadius: 4,
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
  messageTime: {
    fontSize: 11,
    color: THEME.text.light,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  userMessageTime: {
    color: 'rgba(255,255,255,0.8)',
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 8,
  },
  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: THEME.card,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: THEME.text.light,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: THEME.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME.text.primary,
  },
  closeButton: {
    padding: 4,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
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
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  closePreviewButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
  },
  fullScreenImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  pastChatsSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  pastChatsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.text.primary,
    marginBottom: 10,
  },
  pastChatCard: {
    backgroundColor: THEME.card,
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  pastChatModel: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.text.primary,
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
  modelSelector: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 20,
    backgroundColor: THEME.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  modelSelectorText: {
    fontSize: 16,
    color: THEME.text.primary,
    marginRight: 8,
  },
});