# Hold'em, free — hosted test

The test branch adds external accounts and online tables using Supabase.

## 1. Create a Supabase project
Use a free Supabase project. The browser uses the public publishable key; account data is protected with RLS.

## 2. Run the database setup
Open Supabase SQL Editor and run supabase.sql.

The SQL creates the holdem_saves table and Realtime authorization policies. Do not put a service-role/secret key in this repository.

## 3. Add the project keys
Open supabase-config.js and set:
- url to your Supabase project URL
- key to the project's publishable key (legacy anon also works)

## 4. Configure Auth
In Supabase Authentication, add this GitHub Pages address to the allowed site/redirect URLs:
https://buglord10.github.io/holdem-free/

Email/password accounts support sign-up, login, password reset and display names. Game progress is automatically saved to the holdem_saves row for the signed-in user.

## 5. Online play
Players must be signed in. One player creates a 5-character table code; friends enter the code and join. The host is authoritative for the poker state, while Supabase Realtime carries actions and synchronized state.

test is the development branch. Keep main unchanged until the hosted version has been tested.