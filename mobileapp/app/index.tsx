import { View, Text, Image, Pressable, Animated, Dimensions, TouchableOpacity } from "react-native";
import { useState, useRef } from "react";
import { StatusBar } from "expo-status-bar";
import Auth from '../components/Auth'

const { width } = Dimensions.get('window');

const onboardingData = [
  {
    title: "Healthcare for Everyone",
    quote: "Quality healthcare is not a privilege, it's a fundamental right for all.",
    image: require("../assets/doctor-patient.png"),
  },
  {
    title: "Community Support",
    quote: "Together we can build a healthier and stronger community.",
    image: require("../assets/community-health.png"),
  },
  {
    title: "Easy Access",
    quote: "Your well-being is just a tap away. Join us in making healthcare accessible.",
    image: require("../assets/easy-access.png"),
  },
];

export default function Index() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const animateContent = (newIndex: number) => {
    // Fade out and scale down current content
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentIndex(newIndex);
      // Fade in and scale up new content
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      animateContent(currentIndex + 1);
    }
  };

  const handleDotPress = (index: number) => {
    if (index !== currentIndex) {
      animateContent(index);
    }
  };

  return (
    <View className="flex-1 bg-green-500">
      <StatusBar style="light" />

      {/* Gradient Background */}
      <View className="absolute inset-0 bg-[#07A996]" />

      {/* Content Container */}
      <View className="flex-1 px-6">
        {/* Image Container */}
        <Animated.View
          className="items-center justify-center flex-1 pt-16"
          style={{
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim }
            ],
          }}
        >
          <Image
            source={onboardingData[currentIndex].image}
            className="h-90 w-90"
            resizeMode="contain"
          />
        </Animated.View>

        {/* Text Content */}
        <Animated.View
          className="items-center mb-8"
          style={{
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim }
            ],
          }}
        >
          <Text className="text-3xl font-bold text-white mb-4 text-center">
            {onboardingData[currentIndex].title}
          </Text>
          <Text className="text-center text-white text-lg px-4 leading-relaxed">
            {onboardingData[currentIndex].quote}
          </Text>
        </Animated.View>

        {/* Progress Dots */}
        <View className="flex-row justify-center space-x-5 mb-8">
          {onboardingData.map((_, index) => (
            <Pressable
              key={index}
              onPress={() => handleDotPress(index)}
              className="p-2"
            >
              <Animated.View
                className={`h-2.5 rounded-full ${currentIndex === index
                    ? "bg-white w-5"
                    : "bg-white/40 w-2.5"
                  }`}
                style={{
                  transform: [
                    { scale: currentIndex === index ? 1.1 : 1 }
                  ]
                }}
              />
            </Pressable>
          ))}
        </View>

        {/* Bottom Section */}
        <Animated.View 
          className="mb-12"
          style={{
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim }
            ],
          }}
        >
          {currentIndex < onboardingData.length - 1 ? (
            <Pressable
              onPress={handleNext}
              className="bg-white h-14 rounded-full items-center justify-center shadow-lg"
            >
              <Text className="text-green-600 font-semibold text-lg">
                Continue
              </Text>
            </Pressable>
          ) : (
            <Auth />
          )}
        </Animated.View>
      </View>
    </View>
  );
}