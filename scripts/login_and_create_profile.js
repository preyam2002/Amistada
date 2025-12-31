const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const email = 'testuser2@gmail.com';
  const password = 'password123';

  console.log(`Logging in as ${email}...`);

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Login failed:', error.message);
    return;
  }

  const user = data.user;
  console.log('Login successful, user ID:', user.id);

  console.log('Inserting profile...');
  const { error: profileError } = await supabase.from('profiles').insert({
    id: user.id,
    display_name: 'TestUser2',
    avatar_color: 'bg-blue-500',
    email: email // Note: email column might not exist in profiles, but let's try or remove it if it fails
  });

  if (profileError) {
    console.error('Error inserting profile:', profileError.message);
    // If it fails because column doesn't exist, try without email
    if (profileError.message.includes('column "email" of relation "profiles" does not exist')) {
        console.log('Retrying without email column...');
        const { error: retryError } = await supabase.from('profiles').insert({
            id: user.id,
            display_name: 'TestUser2',
            avatar_color: 'bg-blue-500'
        });
        if (retryError) {
             console.error('Retry failed:', retryError.message);
        } else {
            console.log('Profile inserted successfully (retry).');
        }
    }
  } else {
    console.log('Profile inserted successfully.');
  }
}

main();
