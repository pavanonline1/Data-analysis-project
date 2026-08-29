const { supabaseAdmin } = require('../config/supabaseClient');

/**
 * Checks for required tables and creates them if they don't exist.
 * Requires a SUPABASE_SERVICE_ROLE_KEY in .env.
 *
 * IMPORTANT: This uses an 'exec_sql' RPC function in Supabase.
 * If you haven't created it, run the following once in your Supabase SQL editor:
 *
 *   CREATE OR REPLACE FUNCTION exec_sql(sql_query TEXT)
 *   RETURNS VOID AS $$
 *   BEGIN
 *     EXECUTE sql_query;
 *   END;
 *   $$ LANGUAGE plpgsql SECURITY DEFINER;
 *
 * If automatic creation fails, run supabase_schema.sql manually from the backend root.
 */
const createTablesIfNotExist = async () => {
  if (!supabaseAdmin) {
    console.warn('[DB Init] SUPABASE_SERVICE_ROLE_KEY not set. Skipping automatic table creation.');
    return;
  }

  const tables = [
    {
      name: 'tours',
      sql: [
        `CREATE TABLE IF NOT EXISTS public.tours (`,
        `  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,`,
        `  title TEXT NOT NULL,`,
        `  description TEXT,`,
        `  image_url TEXT,`,
        `  price NUMERIC(10,2),`,
        `  duration TEXT,`,
        `  location TEXT,`,
        `  featured BOOLEAN DEFAULT false,`,
        `  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`,
        `);`,
        `ALTER TABLE public.tours ENABLE ROW LEVEL SECURITY;`,
        `DO $do$ BEGIN`,
        `  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='tours' AND policyname='Public can view tours') THEN`,
        `    CREATE POLICY "Public can view tours" ON public.tours FOR SELECT USING (true);`,
        `  END IF;`,
        `END $do$;`
      ].join('\n')
    },
    {
      name: 'testimonials',
      sql: [
        `CREATE TABLE IF NOT EXISTS public.testimonials (`,
        `  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,`,
        `  author_name TEXT NOT NULL,`,
        `  author_location TEXT,`,
        `  content TEXT NOT NULL,`,
        `  rating INTEGER CHECK (rating >= 1 AND rating <= 5),`,
        `  tour_id BIGINT REFERENCES public.tours(id) ON DELETE SET NULL,`,
        `  image_url TEXT,`,
        `  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`,
        `);`,
        `ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;`,
        `DO $do$ BEGIN`,
        `  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='testimonials' AND policyname='Public can view testimonials') THEN`,
        `    CREATE POLICY "Public can view testimonials" ON public.testimonials FOR SELECT USING (true);`,
        `  END IF;`,
        `END $do$;`
      ].join('\n')
    },
    {
      name: 'faqs',
      sql: [
        `CREATE TABLE IF NOT EXISTS public.faqs (`,
        `  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,`,
        `  question TEXT NOT NULL,`,
        `  answer TEXT NOT NULL,`,
        `  category TEXT,`,
        `  display_order INTEGER DEFAULT 0,`,
        `  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`,
        `);`,
        `ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;`,
        `DO $do$ BEGIN`,
        `  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='faqs' AND policyname='Public can view faqs') THEN`,
        `    CREATE POLICY "Public can view faqs" ON public.faqs FOR SELECT USING (true);`,
        `  END IF;`,
        `END $do$;`
      ].join('\n')
    },
    {
      name: 'contacts',
      sql: [
        `CREATE TABLE IF NOT EXISTS public.contacts (`,
        `  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,`,
        `  name TEXT NOT NULL,`,
        `  email TEXT NOT NULL,`,
        `  message TEXT NOT NULL,`,
        `  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`,
        `);`,
        `ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;`,
        `DO $do$ BEGIN`,
        `  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='contacts' AND policyname='Anyone can insert contacts') THEN`,
        `    CREATE POLICY "Anyone can insert contacts" ON public.contacts FOR INSERT WITH CHECK (true);`,
        `  END IF;`,
        `END $do$;`
      ].join('\n')
    },
    {
      name: 'profiles',
      sql: [
        `CREATE TABLE IF NOT EXISTS public.profiles (`,
        `  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,`,
        `  full_name TEXT,`,
        `  avatar_url TEXT,`,
        `  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`,
        `);`,
        `ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;`,
        `DO $do$ BEGIN`,
        `  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='Users can view own profile') THEN`,
        `    CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);`,
        `  END IF;`,
        `  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='Users can update own profile') THEN`,
        `    CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);`,
        `  END IF;`,
        `END $do$;`
      ].join('\n')
    }
  ];

  console.log('[DB Init] Checking tables...');

  for (const table of tables) {
    try {
      // Try selecting from the table; if it fails, it likely does not exist
      const { error: checkError } = await supabaseAdmin
        .from(table.name)
        .select('id')
        .limit(1);

      if (checkError && checkError.code === '42P01') {
        // Table doesn't exist — try to create it via exec_sql RPC
        console.log('[DB Init] Table "' + table.name + '" missing. Creating...');
        const { error: createError } = await supabaseAdmin.rpc('exec_sql', { sql_query: table.sql });

        if (createError) {
          console.error('[DB Init] Could not auto-create "' + table.name + '":', createError.message);
          console.error('[DB Init] Please run supabase_schema.sql manually in the Supabase SQL editor.');
        } else {
          console.log('[DB Init] Table "' + table.name + '" created.');
        }
      } else if (!checkError) {
        console.log('[DB Init] Table "' + table.name + '" OK.');
      } else {
        console.error('[DB Init] Unexpected error for "' + table.name + '":', checkError.message);
      }
    } catch (err) {
      console.error('[DB Init] Exception for "' + table.name + '":', err.message);
    }
  }

  console.log('[DB Init] Done.');
};

module.exports = { createTablesIfNotExist };
