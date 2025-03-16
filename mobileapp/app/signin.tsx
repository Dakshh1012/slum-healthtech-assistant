import React, { useState } from 'react'
import { 
  Alert, 
  View, 
  Text, 
  TextInput, 
  Pressable, 
  ActivityIndicator,
  Dimensions,
  Image
} from 'react-native'
import { supabase } from '../lib/supabase'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { authStyles as styles } from '../styles/auth'
import * as Animatable from 'react-native-animatable'
import { LinearGradient } from 'expo-linear-gradient'

const { width } = Dimensions.get('window')

export default function SignInScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [focusedInput, setFocusedInput] = useState<string | null>(null)

  async function signInWithEmail() {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields')
      return
    }
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.replace('/(tabs)')
    } catch (error: any) {
      Alert.alert('Error', error.message)
    } finally {
      setLoading(false)
    }
  }

  async function signInWithProvider(provider: 'google' | 'apple') {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
      })
      if (error) throw error
    } catch (error: any) {
      Alert.alert('Error', error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#07A996', '#0A8185', '#1A6477']}
        style={styles.gradientBackground}
      />
      
      <Animatable.View 
        style={[styles.decorationCircle, { top: -width * 0.4, right: -width * 0.4 }]}
        animation="fadeIn"
        duration={1000}
      />
      <Animatable.View 
        style={[styles.decorationCircle, { bottom: -width * 0.4, left: -width * 0.4 }]}
        animation="fadeIn"
        duration={1000}
      />

      <View style={styles.content}>
        <View style={styles.topSection}>
          <Animatable.View 
            style={styles.logoContainer}
            animation="fadeIn"
            duration={1000}
          >
            <Image
              source={require('../assets/image1.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animatable.View>

          <Animatable.View 
            style={styles.header} 
            animation="fadeIn" 
            duration={1000}
          >
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue your journey</Text>
          </Animatable.View>
        </View>

        <View style={styles.bottomSection}>
          <Animatable.View 
            style={styles.form}
            animation="fadeInUp"
            delay={200}
            duration={1000}
          >
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={[
                  styles.input,
                  focusedInput === 'email' && styles.inputFocused
                ]}
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput(null)}
              />
              <Ionicons 
                name="mail-outline" 
                size={20} 
                color="#666"
                style={styles.inputIcon}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={[
                  styles.input,
                  focusedInput === 'password' && styles.inputFocused
                ]}
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
              />
              <Pressable 
                onPress={() => setShowPassword(!showPassword)}
                style={styles.inputIcon}
              >
                <Ionicons 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color="#666"
                />
              </Pressable>
            </View>

            <Animatable.View
              animation="fadeIn"
              delay={400}
            >
              <Pressable
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={signInWithEmail}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>Sign In</Text>
                )}
              </Pressable>
            </Animatable.View>
          </Animatable.View>

          <Pressable onPress={() => router.push('./signup')}>
            <Text style={styles.footerText}>
              Don't have an account? <Text style={styles.link}>Sign Up</Text>
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
} 