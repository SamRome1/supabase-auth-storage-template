'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';

interface ImageItem {
  id: string;
  file_path: string;
  file_name: string;
  created_at: string;
  user_id: string;
}

interface MyImagesProps {
  userId: string;
}

export default function MyImages({ userId }: MyImagesProps) {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const { data, error } = await supabase
          .from('images')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setImages(data || []);
      } catch (err) {
        console.error('Error fetching images:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel(`my-images-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'images',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchImages();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  if (loading) return <div className="text-center py-8">Loading your images...</div>;

  if (images.length === 0) {
    return <div className="text-center py-8 text-gray-500">No images uploaded yet</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {images.map((image) => (
        <div key={image.id} className="bg-white rounded-lg shadow overflow-hidden">
          <div className="relative w-full aspect-square">
            <Image
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${image.file_path}`}
              alt={image.file_name}
              fill
              className="object-cover"
            />
          </div>
          <div className="p-4">
            <p className="font-semibold text-sm truncate">{image.file_name}</p>
            <p className="text-xs text-gray-400">
              {new Date(image.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
