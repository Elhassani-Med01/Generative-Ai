import React from 'react';
import { Upload, Box } from 'lucide-react';

const ThreeDGeneration = ({ uploadedImage, handleImageUpload, fileInputRef }) => (
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">Upload Reference Image</label>
      <div
        onClick={() => fileInputRef.current?.click()}
        className="w-full h-32 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-purple-500 transition-colors bg-gray-700/30"
      >
        {uploadedImage ? (
          <img src={uploadedImage} alt="Reference" className="h-full object-contain rounded" />
        ) : (
          <div className="text-center">
            <Box className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-400">Upload reference for 3D</p>
          </div>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
    <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-3">
      <p className="text-yellow-300 text-sm">
        3D generation creates a 3D model from your 2D image. The process may take longer than other workflows, and the output will be a downloadable GLB file, not an image preview.
      </p>
    </div>
  </div>
);

export default ThreeDGeneration;