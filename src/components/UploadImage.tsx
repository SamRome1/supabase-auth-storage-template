'use client';

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';

interface UploadImageProps {
  userId: string;
  onImageUploaded: () => void;
}

export default function UploadImage({ userId, onImageUploaded }: UploadImageProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploading(true);
      setError(null);

      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${userId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Save image metadata to database
        const { error: dbError } = await supabase.from('images').insert({
          user_id: userId,
          file_path: filePath,
          file_name: file.name,
        });

        if (dbError) throw dbError;

        onImageUploaded();
        e.target.value = '';
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed');
      } finally {
        setUploading(false);
      }
    },
    [userId, onImageUploaded]
  );

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow">
      <h3 className="text-xl font-bold mb-4">Upload Image</h3>

      <label className="block cursor-pointer">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
          <div className="text-gray-500">
            {uploading ? 'Uploading...' : 'Click to upload an image'}
          </div>
        </div>
      </label>

      {error && <div className="mt-3 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
    </div>
  );
}
