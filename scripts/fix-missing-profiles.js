/**
 * Migration Script: Fix Missing Profiles
 * 
 * This script identifies users who don't have corresponding profiles and creates them.
 * 
 * Usage:
 * 1. Set environment variables (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
 * 2. Run with: node scripts/fix-missing-profiles.js
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Validate environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  process.exit(1);
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  process.exit(1);
}

// Initialize Supabase admin client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  try {
    console.log('Starting migration: Fix missing profiles');
    
    // Get all users
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('Error fetching users:', usersError);
      process.exit(1);
    }
    
    console.log(`Found ${users.users.length} users in auth.users`);
    
    // Get all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id');
    
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      process.exit(1);
    }
    
    console.log(`Found ${profiles?.length || 0} profiles in public.profiles`);
    
    // Create a set of existing profile user_ids
    const existingProfileIds = new Set(profiles?.map(profile => profile.user_id));
    
    // Find users without profiles
    const usersWithoutProfiles = users.users.filter(user => !existingProfileIds.has(user.id));
    
    console.log(`Found ${usersWithoutProfiles.length} users without profiles`);
    
    if (usersWithoutProfiles.length === 0) {
      console.log('No users need profile creation. Migration complete!');
      return;
    }
    
    // Create profiles for users without them
    const profilesToCreate = usersWithoutProfiles.map(user => ({
      user_id: user.id,
      email: user.email,
      first_name: user.user_metadata?.first_name || null,
      last_name: user.user_metadata?.last_name || null,
      phone_number: null,
      location: null,
      website: null,
      linkedin_url: null,
      github_url: null,
      work_experience: [],
      education: [],
      skills: [],
      projects: [],
      certifications: [],
    }));
    
    const { data: createdProfiles, error: createError } = await supabase
      .from('profiles')
      .insert(profilesToCreate)
      .select();
    
    if (createError) {
      console.error('Error creating profiles:', createError);
      process.exit(1);
    }
    
    console.log(`Successfully created ${createdProfiles?.length || 0} profiles`);
    console.log('Migration complete!');
    
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

main(); 