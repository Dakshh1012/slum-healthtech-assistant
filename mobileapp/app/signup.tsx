import React, { useState, useEffect } from 'react'
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

export default function SignUpScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [focusedInput, setFocusedInput] = useState<string | null>(null)
  const [passwordStrength, setPasswordStrength] = useState(0)

  useEffect(() => {
    calculatePasswordStrength(password)
  }, [password])

  const calculatePasswordStrength = (pass: string) => {
    let strength = 0
    if (pass.length >= 8) strength++
    if (pass.match(/[A-Z]/)) strength++
    if (pass.match(/[0-9]/)) strength++
    if (pass.match(/[^A-Za-z0-9]/)) strength++
    setPasswordStrength(strength)
  }

  const getStrengthColor = (index: number) => {
    if (passwordStrength >= index + 1) {
      switch (passwordStrength) {
        case 1: return '#FF4444'
        case 2: return '#FFA534'
        case 3: return '#7ACC29'
        case 4: return '#07A996'
        default: return '#ddd'
      }
    }
    return '#ddd'
  }

  async function signUpWithEmail() {
    if (!email || !password || !name) {
      Alert.alert('Error', 'Please fill in all fields')
      return
    }
    if (passwordStrength < 3) {
      Alert.alert('Error', 'Please choose a stronger password')
      return
    }

    setLoading(true)
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      })

      if (error) throw error
      if (!session) {
        Alert.alert('Success', 'Please check your inbox for email verification!')
      } else {
        router.replace('/(tabs)')
      }
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
              source={require('../assets/image2.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animatable.View>

          <Animatable.View 
            style={styles.header}
            animation="fadeIn"
            duration={1000}
          >
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join us on your wellness journey</Text>
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
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={[
                  styles.input,
                  focusedInput === 'name' && styles.inputFocused
                ]}
                placeholder="Full Name"
                value={name}
                onChangeText={setName}
                onFocus={() => setFocusedInput('name')}
                onBlur={() => setFocusedInput(null)}
              />
              <Ionicons 
                name="person-outline" 
                size={20} 
                color="#666"
                style={styles.inputIcon}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={[
                  styles.input,
                  focusedInput === 'email' && styles.inputFocused
                ]}
                placeholder="Email"
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

            <View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password</Text>
                <TextInput
                  style={[
                    styles.input,
                    focusedInput === 'password' && styles.inputFocused
                  ]}
                  placeholder="Password"
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
              
              <View style={styles.passwordStrength}>
                {[...Array(4)].map((_, i) => (
                  <Animatable.View
                    key={i}
                    style={[
                      styles.strengthIndicator,
                      { backgroundColor: getStrengthColor(i) }
                    ]}
                    animation={passwordStrength > i ? "fadeIn" : undefined}
                  />
                ))}
              </View>
            </View>

            <Animatable.View animation="fadeIn" delay={400}>
              <Pressable
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={signUpWithEmail}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>Create Account</Text>
                )}
              </Pressable>
            </Animatable.View>
          </Animatable.View>

          <Pressable onPress={() => router.push('./signin')}>
            <Text style={styles.footerText}>
              Already have an account? <Text style={styles.link}>Sign In</Text>
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
} 