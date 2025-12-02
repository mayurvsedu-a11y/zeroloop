import React, { useRef, useState } from "react";
import { Upload, Loader2 } from "lucide-react";

interface Props {
  onImageSelected: (base64: string) => void;
  isLoading: boolean;
}

export const ImageUploader: React.FC<Props> = ({ onImageSelected, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      onImageSelected(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`relative group border-2 border-dashed rounded-2xl p-12 transition-all duration-300 ease-in-out text-center ${
          dragActive
            ? "border-green-500 bg-green-50 scale-102"
            : "border-gray-300 bg-white hover:border-green-400 hover:bg-gray-50"
        } ${isLoading ? "opacity-50 pointer-events-none" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={isLoading}
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="p-4 bg-green-100 rounded-full text-green-600 group-hover:scale-110 transition-transform">
            {isLoading ? (
              <Loader2 className="w-10 h-10 animate-spin" />
            ) : (
              <Upload className="w-10 h-10" />
            )}
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-700">
              {isLoading ? "Analyzing Waste..." : "Upload Waste Photo"}
            </h3>
            <p className="text-gray-500 text-sm max-w-sm mx-auto">
              Drag and drop your image here, or click to browse. We accept JPEG and PNG.
            </p>
          </div>

          <div className="flex items-center gap-4 pt-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-md active:transform active:scale-95"
            >
              Select File
            </button>
          </div>
        </div>
      </div>
      
      {!isLoading && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
                <span className="block text-2xl mb-1">📸</span>
                <p className="text-sm font-medium text-gray-600">Snap a Photo</p>
                <p className="text-xs text-gray-400">Capture the full waste bin</p>
            </div>
            <div className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
                <span className="block text-2xl mb-1">🤖</span>
                <p className="text-sm font-medium text-gray-600">AI Analysis</p>
                <p className="text-xs text-gray-400">Identify items & weights</p>
            </div>
             <div className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
                <span className="block text-2xl mb-1">💰</span>
                <p className="text-sm font-medium text-gray-600">Get Report</p>
                <p className="text-xs text-gray-400">View costs & tips</p>
            </div>
        </div>
      )}
    </div>
  );
};