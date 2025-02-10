"use client"; // Add this line at the top
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";


export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [analysisResult, setAnalysisResult] = useState<string>("");  // New state for analysis result
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);  // Loading state for analysis

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Toggle Theme
  const toggleTheme = () => {
    setDarkMode(!darkMode);
    if (darkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
  };

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setUploadStatus("upload successful!");
      } else {
        setUploadStatus("upload failed. please try again.");
      }
    } catch (error) {
      setUploadStatus("an error occurred.");
      console.error(error);
    }
  };

  const handleAnalyze = async (files = []) => {
    setLoadingAnalysis(true);
    setAnalysisResult("");
  
    try {
      const formData = new FormData();
      files.forEach(file => formData.append("files", file));
  
      const response = await fetch("http://localhost:8000/analyze-files", {
        method: "POST",
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error("Analysis failed. Please try again.");
      }
  
      const data = await response.json();
      setAnalysisResult("Analysis complete: " + JSON.stringify(data.progress, null, 2));
    } catch (error) {
      setAnalysisResult("Error during analysis: " + (error as Error).message);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-white text-gray-900 dark:bg-[#0D1117] dark:text-gray-300 transition-colors">
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 px-3 py-2 text-sm rounded-md bg-gray-200 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 transition"
      >
        {darkMode ? "☀️ light" : "🌙 dark"}
      </button>

      {/* Header Logo */}
      <div className="mb-8">
        <Image 
          src="/snailfly.png" 
          alt="Next.js logo" 
          width={120}
          height={28}
          className="dark:invert"
        />
      </div>

      {/* Main Content */}
      <main className="w-full max-w-sm text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            snailFly
          </h1>
          <p className="text-gray-700 dark:text-gray-400 text-sm leading-relaxed">
            track writing progress, share scholarly work, and collaborate within an academic community.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          {/* File Upload Section */}
          <input
            type="file"
            onChange={handleFileChange}
            className="block p-2 border border-gray-300 rounded-md"
          />
          <button
            onClick={handleUpload}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
          >
            upload paper
          </button>
          {uploadStatus && <p className="mt-4 text-gray-700">{uploadStatus}</p>}

          {/* Browse Library Button */}
          <Link
            href="/browse-library"
            className="px-6 py-3 text-sm font-medium rounded-md transition-colors border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-[#161B22]"
          >
            browse library
          </Link>

          {/* Analyze Button */}
          <button
            onClick={() => handleAnalyze()}
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors"
          >
            analyze document
          </button>
          {loadingAnalysis && <p className="mt-4 text-gray-700">Analyzing...</p>}
          {analysisResult && <p className="mt-4 text-gray-700">{analysisResult}</p>}
        </div>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-6 text-xs text-gray-500 dark:text-gray-400 mt-12">
        <p>© {new Date().getFullYear()} snailFly</p>
      </footer>
    </div>
  );
}