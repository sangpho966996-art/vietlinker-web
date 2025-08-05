// Supabase configuration
const SUPABASE_URL = 'https://wwlmvcsozavqfvwlxkrt.supabase.co';
const SUPABASE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3bG12Y3NvemF2cWZ2d2x4a3J0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNzUyMTMsImV4cCI6MjA2OTk1MTIxM30.HdxvLlqJgdntVUQDVtVlkjJJa7bn9CoIVUG8yn3WkLQ

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Test connection
console.log('Supabase connected to VietLinker!');
