
import { createClient } from '@supabase/supabase-js'

export const supabaseUrl = 'https://osfxlrmxaifoehvxztqv.supabase.co'
export const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zZnhscm14YWlmb2Vodnh6dHF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYwODU1ODgsImV4cCI6MjA1MTY2MTU4OH0.xOW2YW1s5eMRZ23baAwBL2B1Rwx8bVkt3JTyLJdLRKg'
export  const supabase = createClient(supabaseUrl, supabaseKey)