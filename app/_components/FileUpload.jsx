import React from 'react'
import { Upload } from 'lucide-react'
import Image from 'next/image'

function FileUpload({ setImages, imageList }) {
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(prevImages => [...prevImages, ...files]);
  }

  const handleRemoveImage = (index) => {
    setImages(prevImages => prevImages.filter((_, i) => i !== index));
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
                src={image?.url || URL.createObjectURL(image)} 
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