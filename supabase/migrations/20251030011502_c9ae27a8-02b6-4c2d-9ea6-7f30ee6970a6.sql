-- Create enum types
CREATE TYPE user_role AS ENUM ('resident', 'owner');
CREATE TYPE residence_type AS ENUM ('residence', 'hotel', 'apartment');
CREATE TYPE residence_gender AS ENUM ('male', 'female', 'mixed');
CREATE TYPE residence_status AS ENUM ('available', 'occupied');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'resident',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create residences table
CREATE TABLE public.residences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  price_per_month DECIMAL(10, 2) NOT NULL,
  residence_type residence_type NOT NULL,
  gender_preference residence_gender NOT NULL,
  status residence_status DEFAULT 'available' NOT NULL,
  capacity INTEGER DEFAULT 1 NOT NULL,
  current_occupants INTEGER DEFAULT 0 NOT NULL,
  amenities TEXT[],
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create residence_photos table
CREATE TABLE public.residence_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  residence_id UUID REFERENCES public.residences(id) ON DELETE CASCADE NOT NULL,
  photo_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create ratings table
CREATE TABLE public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  residence_id UUID REFERENCES public.residences(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(residence_id, user_id)
);

-- Create residence_applications table
CREATE TABLE public.residence_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  residence_id UUID REFERENCES public.residences(id) ON DELETE CASCADE NOT NULL,
  applicant_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create messages table for chat
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  residence_id UUID REFERENCES public.residences(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.residences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.residence_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.residence_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- RLS Policies for residences
CREATE POLICY "Anyone can view available residences" ON public.residences FOR SELECT TO authenticated USING (true);
CREATE POLICY "Owners can insert residences" ON public.residences FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = owner_id AND user_id = auth.uid() AND role = 'owner'));
CREATE POLICY "Owners can update own residences" ON public.residences FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = owner_id AND user_id = auth.uid()));
CREATE POLICY "Owners can delete own residences" ON public.residences FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = owner_id AND user_id = auth.uid()));

-- RLS Policies for residence_photos
CREATE POLICY "Anyone can view residence photos" ON public.residence_photos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Owners can insert photos for own residences" ON public.residence_photos FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.residences r JOIN public.profiles p ON r.owner_id = p.id WHERE r.id = residence_id AND p.user_id = auth.uid()));
CREATE POLICY "Owners can delete photos from own residences" ON public.residence_photos FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.residences r JOIN public.profiles p ON r.owner_id = p.id WHERE r.id = residence_id AND p.user_id = auth.uid()));

-- RLS Policies for ratings
CREATE POLICY "Anyone can view ratings" ON public.ratings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own ratings" ON public.ratings FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = user_id AND user_id = auth.uid()));
CREATE POLICY "Users can update own ratings" ON public.ratings FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = user_id AND user_id = auth.uid()));

-- RLS Policies for residence_applications
CREATE POLICY "Users can view own applications" ON public.residence_applications FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = applicant_id AND user_id = auth.uid()) OR EXISTS (SELECT 1 FROM public.residences r JOIN public.profiles p ON r.owner_id = p.id WHERE r.id = residence_id AND p.user_id = auth.uid()));
CREATE POLICY "Users can insert own applications" ON public.residence_applications FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = applicant_id AND user_id = auth.uid()));
CREATE POLICY "Owners can update applications for own residences" ON public.residence_applications FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.residences r JOIN public.profiles p ON r.owner_id = p.id WHERE r.id = residence_id AND p.user_id = auth.uid()));

-- RLS Policies for messages
CREATE POLICY "Users can view messages for their residences" ON public.messages FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = sender_id AND user_id = auth.uid()) OR EXISTS (SELECT 1 FROM public.residences r JOIN public.profiles p ON r.owner_id = p.id WHERE r.id = residence_id AND p.user_id = auth.uid()));
CREATE POLICY "Users can insert messages" ON public.messages FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = sender_id AND user_id = auth.uid()));

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = user_id AND profiles.user_id = auth.uid()));
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = user_id AND profiles.user_id = auth.uid()));

-- Create function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'resident')
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_residences_updated_at BEFORE UPDATE ON public.residences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_residence_applications_updated_at BEFORE UPDATE ON public.residence_applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;