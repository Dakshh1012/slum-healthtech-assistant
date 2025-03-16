import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';

const MOOD_THEMES = {
  'very-happy': {
    background: '#FFD93D',
    text: '#4A4A4A',
    feedback: "You're radiating positivity! Keep spreading that sunshine! ✨"
  },
  'happy': {
    background: '#98D8AA',
    text: '#4A4A4A',
    feedback: "That's the spirit! Life is beautiful! 🌟"
  },
  'neutral': {
    background: '#8B6B61',
    text: '#FFFFFF',
    feedback: "Taking it easy today? That's perfectly fine! 🌅"
  },
  'sad': {
    background: '#7286D3',
    text: '#FFFFFF',
    feedback: "Tomorrow will be better. Take care of yourself! 💙"
  },
  'very-sad': {
    background: '#4B527E',
    text: '#FFFFFF',
    feedback: "It's okay not to be okay. We're here for you! 🤗"
  },
};

const moods = [
  { id: 'very-happy', emoji: '😊', label: 'Very Happy' },
  { id: 'happy', emoji: '🙂', label: 'Happy' },
  { id: 'neutral', emoji: '😐', label: 'Neutral' },
  { id: 'sad', emoji: '😔', label: 'Sad' },
  { id: 'very-sad', emoji: '😢', label: 'Very Sad' },
];

// Helper function to interpolate colors
const interpolateColor = (animValue: Animated.Value, inputRange: number[], colors: string[]) => {
  const rgb = colors.map(color => {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return [r, g, b];
  });

  const r = animValue.interpolate({
    inputRange,
    outputRange: rgb.map(c => c[0]),
  });
  const g = animValue.interpolate({
    inputRange,
    outputRange: rgb.map(c => c[1]),
  });
  const b = animValue.interpolate({
    inputRange,
    outputRange: rgb.map(c => c[2]),
  });

  return Animated.createAnimatedComponent(View);
};

export default function MoodScreen() {
  const [selectedMood, setSelectedMood] = useState('neutral');
  const colorAnimation = useState(new Animated.Value(2))[0]; // Start at neutral (index 2)
  const currentTheme = MOOD_THEMES[selectedMood as keyof typeof MOOD_THEMES];

  const handleSetMood = (moodId: string) => {
    const newIndex = moods.findIndex(mood => mood.id === moodId);
    Animated.timing(colorAnimation, {
      toValue: newIndex,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setSelectedMood(moodId);
  };

  const interpolatedBackground = colorAnimation.interpolate({
    inputRange: [0, 1, 2, 3, 4],
    outputRange: [
      MOOD_THEMES['very-happy'].background,
      MOOD_THEMES['happy'].background,
      MOOD_THEMES['neutral'].background,
      MOOD_THEMES['sad'].background,
      MOOD_THEMES['very-sad'].background,
    ],
  });

  const interpolatedText = colorAnimation.interpolate({
    inputRange: [0, 1, 2, 3, 4],
    outputRange: [
      MOOD_THEMES['very-happy'].text,
      MOOD_THEMES['happy'].text,
      MOOD_THEMES['neutral'].text,
      MOOD_THEMES['sad'].text,
      MOOD_THEMES['very-sad'].text,
    ],
  });

  const renderCurvePath = () => {
    const width = Dimensions.get('window').width - 40; // Adjust for padding
    const height = 50;
    const segments = moods.length - 1;
    const segmentWidth = width / segments;
    
    let path = `M 0,${height/2}`;
    for (let i = 1; i <= segments; i++) {
      const x = i * segmentWidth;
      const y = height/2 + (Math.sin(i * Math.PI / segments) * 15);
      path += ` Q ${x - segmentWidth/2},${height/2 + (Math.sin((i - 0.5) * Math.PI / segments) * 30)} ${x},${y}`;
    }
    
    return path;
  };

  return (
    <Animated.View style={[styles.container, { backgroundColor: interpolatedBackground }]}>
      <SafeAreaView style={{ flex: 1 }}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>

        <View style={styles.content}>
          <View style={styles.header}>
            <Animated.Text style={[styles.greeting, { color: interpolatedText }]}>
              👋 Hey Rahul!
            </Animated.Text>
            <Animated.Text style={[styles.question, { color: interpolatedText }]}>
              How are you feeling this day?
            </Animated.Text>
          </View>

          <View style={styles.moodDisplay}>
            <Text style={styles.moodEmoji}>
              {moods.find(mood => mood.id === selectedMood)?.emoji || '😐'}
            </Text>
            <Animated.Text style={[styles.moodText, { color: interpolatedText }]}>
              I'm Feeling {moods.find(mood => mood.id === selectedMood)?.label || 'Neutral'}
            </Animated.Text>
            <Animated.Text style={[styles.feedbackText, { color: interpolatedText }]}>
              {currentTheme.feedback}
            </Animated.Text>
          </View>

          <View style={styles.moodSlider}>
            <Svg height="50" width={Dimensions.get('window').width - 40} style={styles.moodCurve}>
              <Path
                d={renderCurvePath()}
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="2"
                fill="none"
              />
            </Svg>
            {moods.map((mood, index) => (
              <View key={mood.id} style={styles.moodDotContainer}>
                <TouchableOpacity
                  style={[
                    styles.moodDot,
                    selectedMood === mood.id && styles.moodDotSelected,
                    index < moods.findIndex(m => m.id === selectedMood) && styles.moodDotPast,
                  ]}
                  onPress={() => handleSetMood(mood.id)}
                />
              </View>
            ))}
          </View>

          <TouchableOpacity 
            style={[styles.setMoodButton, { backgroundColor: currentTheme.text }]}
            onPress={() => {
              // Save mood logic here
              router.back();
            }}
          >
            <Animated.Text style={[styles.setMoodButtonText, { color: interpolatedBackground }]}>
              Set Mood ✓
            </Animated.Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginTop: 100,
  },
  greeting: {
    fontSize: 24,
    color: MOOD_THEMES.neutral.text,
    marginBottom: 10,
  },
  question: {
    fontSize: 28,
    color: MOOD_THEMES.neutral.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  moodDisplay: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 60,
  },
  moodEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  moodText: {
    fontSize: 24,
    color: MOOD_THEMES.neutral.text,
    fontWeight: '500',
  },
  feedbackText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 15,
    opacity: 0.9,
    fontStyle: 'italic',
  },
  moodSlider: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    paddingHorizontal: 20,
    marginBottom: 40,
    height: 50,
  },
  moodCurve: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: -1,
  },
  moodDotContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  moodDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'white',
    opacity: 0.5,
  },
  moodDotSelected: {
    opacity: 1,
    transform: [{ scale: 1.2 }],
  },
  moodDotPast: {
    opacity: 1,
  },
  setMoodButton: {
    backgroundColor: MOOD_THEMES.neutral.text,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 40,
  },
  setMoodButtonText: {
    color: MOOD_THEMES.neutral.background,
    fontSize: 18,
    fontWeight: '600',
  },
}); 