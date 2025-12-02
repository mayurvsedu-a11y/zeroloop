import React, { useState } from "react";
import { ImageUploader } from "./components/ImageUploader";
import { AnalysisReport } from "./components/AnalysisReport";
import { analyzeWasteImage } from "./services/geminiService";
import { AnalysisResult, AppState } from "./types";
import { Sprout, AlertCircle } from "lucide-react";

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const handleImageSelected = async (base64: string) => {
    setUploadedImage(base64);
    setAppState(AppState.ANALYZING);
    setError(null);
    try {
      const result = await analyzeWasteImage(base64);
      setAnalysisData(result);
      setAppState(AppState.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
      setAppState(AppState.ERROR);
    }
  };

  const handleReset = () => {
    setAnalysisData(null);
    setUploadedImage(null);
    setAppState(AppState.IDLE);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="bg-green-100 p-2 rounded-lg mr-3">
                <Sprout className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                  EcoWaste <span className="text-green-600">AI</span>
                </h1>
                <p className="text-xs text-gray-500 font-medium hidden sm:block">
                  Smart Restaurant Waste Consultant
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded text-gray-600">
                v1.0.0
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow bg-[#f0fdf4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          {appState === AppState.IDLE || appState === AppState.ANALYZING || appState === AppState.ERROR ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-fade-in">
              <div className="text-center max-w-2xl mx-auto mb-4">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Turn Waste into <span className="text-green-600">Savings</span>
                </h2>
                <p className="text-lg text-gray-600">
                  Upload a photo of your restaurant's food waste. Our AI Consultant will analyze contents, 
                  estimate financial loss, and provide actionable reduction strategies in seconds.
                </p>
              </div>

              {appState === AppState.ERROR && (
                <div className="w-full max-w-2xl bg-red-50 border border-red-200 rounded-lg p-4 flex items-center text-red-700 mb-4">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <span>{error}</span>
                </div>
              )}

              <ImageUploader 
                onImageSelected={handleImageSelected} 
                isLoading={appState === AppState.ANALYZING} 
              />
            </div>
          ) : (
            analysisData && (
              <AnalysisReport 
                data={analysisData} 
                image={uploadedImage}
                onReset={handleReset} 
              />
            )
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} EcoWaste AI Solutions. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <span className="text-gray-400 text-sm">Powered by Gemini 2.5 Flash</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;