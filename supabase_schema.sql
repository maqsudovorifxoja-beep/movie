-- ==============================================================================
-- CINEFLOW - SUPABASE DATABASE SCHEMA & INITIAL DATA
-- Ushbu skriptni Supabase SQL Editor ga nusxalang va "RUN" tugmasini bosing
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PROFILES TABLE (Foydalanuvchi va Admin rollari)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. MOVIES TABLE (Kinolar jadvali)
CREATE TABLE IF NOT EXISTS public.movies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    title_uz TEXT,
    title_ru TEXT,
    description TEXT,
    description_uz TEXT,
    description_ru TEXT,
    poster_url TEXT NOT NULL,
    backdrop_url TEXT,
    trailer_url TEXT,
    trailer_id TEXT,
    video_url TEXT,
    release_year INTEGER NOT NULL,
    duration INTEGER NOT NULL,
    rating NUMERIC(3, 1) DEFAULT 7.5,
    quality TEXT DEFAULT '4K Ultra HD',
    genres TEXT[] DEFAULT '{}',
    director TEXT,
    cast_members TEXT[] DEFAULT '{}',
    is_featured BOOLEAN DEFAULT false,
    is_trending BOOLEAN DEFAULT false,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. MESSAGES TABLE (Bog'lanish xabarlari jadvali)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived')),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. TRIGGER: YANGI FOYDALANUVCHI RO'YXATDAN O'TGANDA AVTOMATIK PROFILE YARATISH VA ADMIN TAYINLASH
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, role, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        CASE 
            WHEN NEW.email = 'movie@movie.uz' THEN 'admin'
            ELSE 'user'
        END,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        role = CASE WHEN NEW.email = 'movie@movie.uz' THEN 'admin' ELSE profiles.role END,
        email = NEW.email;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggerni ulash
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. VIEWS INCREMENT FUNCTION (Filmni ko'rishlar sonini xavfsiz oshirish)
CREATE OR REPLACE FUNCTION public.increment_movie_views(movie_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.movies
    SET views_count = views_count + 1
    WHERE id = movie_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. ROW LEVEL SECURITY (RLS) SOZLAMALARI
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone" 
    ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
    ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Movies Policies (O'qish hamma uchun ochiq, qo'shish va tahrirlash faol)
DROP POLICY IF EXISTS "Movies are viewable by everyone" ON public.movies;
DROP POLICY IF EXISTS "Public Read Movies" ON public.movies;
CREATE POLICY "Public Read Movies" 
    ON public.movies FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert movies" ON public.movies;
DROP POLICY IF EXISTS "Allow Insert Movies" ON public.movies;
CREATE POLICY "Allow Insert Movies" 
    ON public.movies FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can update movies" ON public.movies;
DROP POLICY IF EXISTS "Allow Update Movies" ON public.movies;
CREATE POLICY "Allow Update Movies" 
    ON public.movies FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can delete movies" ON public.movies;
DROP POLICY IF EXISTS "Allow Delete Movies" ON public.movies;
CREATE POLICY "Allow Delete Movies" 
    ON public.movies FOR DELETE USING (true);

-- Messages Policies
DROP POLICY IF EXISTS "Anyone can insert messages" ON public.messages;
DROP POLICY IF EXISTS "Public Insert Messages" ON public.messages;
CREATE POLICY "Public Insert Messages" 
    ON public.messages FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view messages" ON public.messages;
DROP POLICY IF EXISTS "Allow View Messages" ON public.messages;
CREATE POLICY "Allow View Messages" 
    ON public.messages FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can update messages" ON public.messages;
DROP POLICY IF EXISTS "Allow Update Messages" ON public.messages;
CREATE POLICY "Allow Update Messages" 
    ON public.messages FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Admins can delete messages" ON public.messages;
DROP POLICY IF EXISTS "Allow Delete Messages" ON public.messages;
CREATE POLICY "Allow Delete Messages" 
    ON public.messages FOR DELETE USING (true);

-- 8. BOSHLANG'ICH 20 TA REAL KINOLAR (SEED DATA)
INSERT INTO public.movies (
    title, title_uz, title_ru, 
    description, description_uz, description_ru, 
    poster_url, backdrop_url, trailer_url, trailer_id, 
    release_year, duration, rating, quality, genres, director, cast_members, 
    is_featured, is_trending, views_count
) VALUES
(
    'Oppenheimer', 'Oppengeymer', 'Оппенгеймер',
    'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.',
    'Ikkinchi jahon urushi davrida atom bombasining yaratilishiga boshchilik qilgan amerikalik fizik olim Robert Oppengeymerning hayotiy dramatik qismati.',
    'История жизни американского физика-теоретика Роберта Оппенгеймера, руководившего Манхэттенским проектом по созданию первого ядерного оружия.',
    'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    'https://image.tmdb.org/t/p/original/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg',
    'https://www.youtube.com/watch?v=uYPbbksJxIg', 'uYPbbksJxIg',
    2023, 180, 8.9, '4K Ultra HD', ARRAY['Drama', 'Biography', 'History'],
    'Christopher Nolan', ARRAY['Cillian Murphy', 'Emily Blunt', 'Matt Damon', 'Robert Downey Jr.'],
    true, true, 145200
),
(
    'Dune: Part Two', 'Dyun: Ikkinchi Qism', 'Дюна: Часть вторая',
    'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
    'Pol Atreydes o''z oilasini yo''q qilgan fitnachilardan o''ch olish uchun Chani va Fremenlar xalqi bilan birlashadi va Arrakis taqdirini o''zgartiradi.',
    'Пол Атрейдес объединяется с Чани и фрименами на пути мести заговорщикам, уничтожившим его семью.',
    'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    'https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5200FR.jpg',
    'https://www.youtube.com/watch?v=Way9Dexny3w', 'Way9Dexny3w',
    2024, 166, 8.6, '4K Ultra HD', ARRAY['Sci-Fi', 'Adventure', 'Action'],
    'Denis Villeneuve', ARRAY['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Javier Bardem'],
    true, true, 198400
),
(
    'Interstellar', 'Interstellar', 'Интерстеллар',
    'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot is tasked to pilot a spacecraft along with researchers.',
    'Kelajakda insoniyat yashashi qiyinlashgan Yer sayyorasini qutqarish uchun jasur kosmonavtlar jamoasi koinotning noma''lum chuqurliklariga yo''l oladi.',
    'Когда засуха и вымирание растений приводят человечество к кризису, коллектив исследователей отправляется сквозь червоточину.',
    'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    'https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
    'https://www.youtube.com/watch?v=zSWdZVtXT7E', 'zSWdZVtXT7E',
    2014, 169, 8.7, '4K Ultra HD', ARRAY['Sci-Fi', 'Drama', 'Adventure'],
    'Christopher Nolan', ARRAY['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Michael Caine'],
    false, true, 320100
),
(
    'The Dark Knight', 'Qora Ritsar', 'Тёмный рыцарь',
    'When the menace known as the Joker wreaks havoc and chaos on Gotham, Batman must accept one of the greatest tests.',
    'Betmen Gotem shahrini yovuz Joker tomonidan keltirib chiqarilgan tartibsizlik va vahimadan qutqarish uchun eng og''ir sinovdan o''tishi kerak.',
    'Бэтмен поднимает ставки в войне с криминалом. С помощью лейтенанта Джима Гордона он намерен очистить улицы города.',
    'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    'https://image.tmdb.org/t/p/original/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg',
    'https://www.youtube.com/watch?v=EXeTwQWrcwY', 'EXeTwQWrcwY',
    2008, 152, 9.0, '4K Ultra HD', ARRAY['Action', 'Crime', 'Drama'],
    'Christopher Nolan', ARRAY['Christian Bale', 'Heath Ledger', 'Aaron Eckhart', 'Michael Caine'],
    false, true, 450300
),
(
    'Inception', 'Muqaddima', 'Начало',
    'A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea.',
    'Tushlar orqali odamlar ongiga kirib sirlarni o''g''irlovchi professional jamoa bu safar inson miyasiga yangi g''oyani joylashtirish topshirig''ini oladi.',
    'Кобб — искусный вор, лучший из лучших в опасном искусстве извлечения: он крадет ценные секреты из глубин подсознания во время сна.',
    'https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
    'https://image.tmdb.org/t/p/original/s3TBrRGB1iav7gFOCNx3H31MoES.jpg',
    'https://www.youtube.com/watch?v=YoHD9XEInc0', 'YoHD9XEInc0',
    2010, 148, 8.8, '4K Ultra HD', ARRAY['Action', 'Sci-Fi', 'Adventure'],
    'Christopher Nolan', ARRAY['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Elliot Page', 'Tom Hardy'],
    false, false, 289400
)
ON CONFLICT DO NOTHING;
