import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://fdujeektyxhydzoyqmvd.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkdWplZWt0eXhoeWR6b3lxbXZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAwNzkxMDUsImV4cCI6MjA1NTY1NTEwNX0.KFBOUtFzBT2ZO5xPFBWKLYDiRYc3yDlsrkv5chD0xM4"

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})