"use client";
import { useEffect, useState } from "react";

export default function BrowseLibrary() {
  const [files, setFiles] = useState<string[]>([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchFiles() {
      try {
        const response = await fetch("http://localhost:8000/files");
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setFiles(data.files); // Assuming 'files' is the key in the response
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchFiles();
  }, []);

  const handleGoHome = () => {
    window.location.href = '/'; // Redirect to the home page
  };

  if (loading) return <p className="text-center text-gray-600">loading papers...</p>;
  if (error) return <p className="text-center text-red-600">error: {error}</p>;
  if (files.length === 0) return <p className="text-center text-gray-600">no papers found.</p>;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-semibold text-center text-white-600 mb-6">browse papers</h1>
      <button
        onClick={handleGoHome}
        className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors mb-4"
      >
        go back to home
      </button>
      <ul className="space-y-4">
        {files.map((file, index) => (
          <li key={index} className="border border-gray-300 p-4 rounded-lg shadow-sm hover:shadow-lg transition-shadow">
            <a 
              href={`http://localhost:8000/files/${file}`} 
              className="text-blue-500 hover:text-blue-700 font-medium text-lg"
            >
              {file}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}