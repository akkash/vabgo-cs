import React from 'react'
import { Upload } from 'lucide-react'
import Image from 'next/image'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'sonner'

function FileUpload({ setImages, imageList }) {
  const supabase = createClientComponentClient()

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file size and type
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 20 * 1024 * 1024; // 20MB limit
      
      if (!isValidType) toast.error(`${file.name} is not an image file`);
      if (!isValidSize) toast.error(`${file.name} is too large (max 20MB)`);
      
      return isValidType && isValidSize;
    });

    if (validFiles.length === 0) return;

    // Show loading toast
    const loadingToast = toast.loading('Uploading images...');

    try {
      const uploadPromises = validFiles.map(async (file) => {
        try {
          // Create a unique file path
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          
          // Upload to Supabase storage
          const { data, error: uploadError } = await supabase.storage
            .from('listingImages') // Changed from 'listings' to 'listingImages'
            .upload(`property-images/${fileName}`, file, {
              cacheControl: '3600',
              upsert: false,
              contentType: file.type
            });

          if (uploadError) {
            console.error('Upload error:', uploadError);
            throw uploadError;
          }

          // Get the public URL
          const { data: { publicUrl } } = supabase.storage
            .from('listingImages') // Changed from 'listings' to 'listingImages'
            .getPublicUrl(`property-images/${fileName}`);

          return {
            url: publicUrl,
            name: file.name,
            path: `property-images/${fileName}`
          };
        } catch (error) {
          console.error('Individual file upload error:', error);
          toast.error(`Failed to upload ${file.name}`);
          return null;
        }
      });

      // Wait for all uploads to complete and filter out failed uploads
      const results = await Promise.all(uploadPromises);
      const uploadedFiles = results.filter(Boolean);

      if (uploadedFiles.length > 0) {
        // Update images state with new URLs
        setImages(prevImages => [...prevImages, ...uploadedFiles]);
        toast.success(`Successfully uploaded ${uploadedFiles.length} images`);
      } else {
        toast.error('No images were uploaded successfully');
      }

    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Failed to upload images');
    } finally {
      toast.dismiss(loadingToast);
    }
  }

  const handleRemoveImage = async (index) => {
    try {
      const imageToRemove = imageList[index];
      
      // If the image has a path property, use it to delete from storage
      if (imageToRemove?.path) {
        const { error } = await supabase.storage
          .from('listingImages') // Changed from 'listings' to 'listingImages'
          .remove([imageToRemove.path]);

        if (error) {
          console.error('Error deleting file:', error);
          throw error;
        }
      }

      // Remove from state
      setImages(prevImages => prevImages.filter((_, i) => i !== index));
      toast.success('Image removed successfully');
      
    } catch (error) {
      console.error('Error removing image:', error);
      toast.error('Failed to remove image');
    }
  }

  return (
    <div>
      <label htmlFor="file-upload" className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
        <Upload />
        Upload Images
      </label>
      <input
        id="file-upload"
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {Array.isArray(imageList) && imageList.length > 0 && (
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-10 gap-3 mt-3'>
          {imageList.map((image, index) => (
            <div key={index} className="relative">
              <Image 
                src={image.url} 
                width={100} 
                height={100}
                alt={`Uploaded image ${index + 1}`}
                className='rounded-lg object-cover h-[100px] w-[100px]'
              />
              <button
                onClick={() => handleRemoveImage(index)}
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default FileUpload