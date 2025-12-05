# Supabase Auth & Storage Template

A fully working starter that shows how to implement user authentication, secure image uploads, row-level security, and a public image feed using Supabase. Built with Next.js and Tailwind, this template gives you everything you need to create an image-based app—from personal galleries to community walls—with clean, extendable code.

## Features

- 🔐 **User Authentication** - Sign up and sign in with email/password
- 📸 **Secure Image Uploads** - Upload images with Supabase Storage
- 🔒 **Row-Level Security** - Database policies ensure users can only manage their own images
- 🌍 **Public Image Feed** - View all uploaded images from the community
- ⚡ **Real-time Updates** - Live feed updates using Supabase subscriptions
- 💻 **Modern Stack** - Next.js 14, React 18, Tailwind CSS, TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm/yarn
- A [Supabase](https://supabase.com) account

### Setup

1. **Clone and install**
   ```bash
   npm install
   ```

2. **Set up Supabase**

   Create a new Supabase project and get your credentials from the project settings.

3. **Create environment variables**

   Create a `.env.local` file in the root:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up the database**

   Run these SQL commands in your Supabase SQL editor:

   ```sql
   -- Create profiles table
   create table profiles (
     id uuid primary key references auth.users(id) on delete cascade,
     username text unique,
     created_at timestamp default now()
   );

   -- Create images table
   create table images (
     id uuid primary key default gen_random_uuid(),
     user_id uuid not null references auth.users(id) on delete cascade,
     file_path text not null,
     file_name text not null,
     created_at timestamp default now()
   );

   -- Create storage bucket
   insert into storage.buckets (id, name, public) 
   values ('images', 'images', true);

   -- Enable RLS
   alter table profiles enable row level security;
   alter table images enable row level security;

   -- RLS Policies for profiles
   create policy "Users can view all profiles"
     on profiles for select using (true);

   create policy "Users can update their own profile"
     on profiles for update using (auth.uid() = id);

   create policy "Users can create their profile"
     on profiles for insert with check (auth.uid() = id);

   -- RLS Policies for images
   create policy "Anyone can view images"
     on images for select using (true);

   create policy "Users can insert their own images"
     on images for insert with check (auth.uid() = user_id);

   create policy "Users can delete their own images"
     on images for delete using (auth.uid() = user_id);

   -- Storage policies
   create policy "Anyone can view images"
     on storage.objects for select using (bucket_id = 'images');

   create policy "Users can upload images"
     on storage.objects for insert with check (
       bucket_id = 'images' and auth.uid()::text = (storage.foldername(name))[1]
     );

   create policy "Users can delete their own images"
     on storage.objects for delete using (
       bucket_id = 'images' and auth.uid()::text = (storage.foldername(name))[1]
     );
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── AuthForm.tsx       # Sign in/up form
│   ├── UploadImage.tsx    # Image upload component
│   └── ImageFeed.tsx      # Public image feed
└── lib/
    └── supabaseClient.ts  # Supabase client initialization
```

## Key Features Explained

### Authentication
- Email/password authentication using Supabase Auth
- Real-time auth state management with `onAuthStateChange`
- Simple sign in/sign up form in `AuthForm.tsx`

### Image Upload
- Secure uploads to Supabase Storage
- File stored in user-specific folders using row-level security
- Metadata saved to database for tracking

### Row-Level Security
- Users can only view all images (read access)
- Users can only upload images to their own folder
- Users can only delete their own images

### Real-time Feed
- Live updates using Supabase Realtime subscriptions
- Automatic refresh when new images are uploaded
- Optimistic UI updates

## Customization

### Styling
The project uses Tailwind CSS. Customize colors and styles in `tailwind.config.js`.

### Adding More Fields
- Extend the `profiles` table with additional user info
- Add metadata fields to the `images` table
- Update TypeScript interfaces accordingly

### Image Processing
- Consider adding image resizing/optimization
- Use Supabase Edge Functions for thumbnail generation
- Implement image moderation if needed

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

Make sure to set the following environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Troubleshooting

### Images not loading
- Check that the storage bucket is public
- Verify the CORS settings in Supabase
- Ensure `NEXT_PUBLIC_SUPABASE_URL` is correct

### Auth not working
- Check that auth policies are enabled
- Verify email confirmation settings if required
- Check browser console for error messages

### Upload failing
- Ensure RLS policies are correctly set
- Check that the storage bucket exists
- Verify file permissions

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)

## License

MIT
