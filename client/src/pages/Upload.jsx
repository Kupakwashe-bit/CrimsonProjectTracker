import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import JSZip from 'jszip';
import UploadZone from '../components/upload/UploadZone';
import { useAnalysis } from '../context/AnalysisContext';
import { uploadProject, fetchAnalysisHistory } from '../utils/api';
import { useVoiceFeedback } from '../hooks/useVoiceFeedback';

const Upload = () => {
  const folderInputRef = useRef(null);
  const navigate = useNavigate();
  const { setAnalysis, setHistory, setUploading } = useAnalysis();
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { speak } = useVoiceFeedback({ rate: 1.05, pitch: 1.05 });

  const handleAnalysis = async (file) => {
    if (!file) return;

    // Immediate feedback
    setSelectedFile(file);
    setError('');
    setIsProcessing(true);
    setUploading(true);
    setProgress(5);
    setStatusMessage('Preparing file...');

    try {
      // Small delay to show immediate feedback
      await new Promise((resolve) => setTimeout(resolve, 300));

      setProgress(15);
      setStatusMessage('Packaging project...');
      console.log('Uploading file:', file.name, file.size);

      const result = await uploadProject({ 
        file,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const uploadProgress = Math.round((progressEvent.loaded * 50) / progressEvent.total) + 15;
            setProgress(uploadProgress);
            setStatusMessage(`Uploading... ${Math.round((progressEvent.loaded * 100) / progressEvent.total)}%`);
          }
        }
      });

      console.log('Upload successful, received analysis:', result);
      setProgress(70);
      setStatusMessage('Generating AI insights...');
      setAnalysis(result);

      if (result.projectId) {
        try {
          const history = await fetchAnalysisHistory(result.projectId);
          setHistory(history);
        } catch (historyErr) {
          console.warn('Failed to fetch history:', historyErr);
        }
      }

      setProgress(100);
      setStatusMessage('Complete! Redirecting...');
      speak(`Analysis ready. ${result.summary || 'Insights prepared.'}`);
      
      // Small delay before navigation to show completion
      setTimeout(() => {
        navigate('/dashboard');
      }, 800);
    } catch (err) {
      console.error('Upload error:', err);
      let message = 'Failed to analyze project';
      
      if (err.message) {
        message = err.message;
      } else if (err.response?.data?.error) {
        message = err.response.data.error;
      } else if (err.code === 'ERR_NETWORK' || err.message?.includes('Network')) {
        message = 'Network error: Could not connect to server. Please check if the server is running on port 5000.';
      } else if (err.message?.includes('timeout')) {
        message = 'Request timed out. The file might be too large or the server is not responding.';
      }
      
      setError(message);
      setUploading(false);
      setIsProcessing(false);
      setProgress(0);
      setStatusMessage('');
      setSelectedFile(null);
    }
  };

  const handleFolderClick = () => {
    folderInputRef.current?.click();
  };

  const handleFolderChange = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    setError('');
    setIsProcessing(true);
    setUploading(true);
    setProgress(5);
    setStatusMessage('Preparing folder...');

    try {
      setProgress(10);
      setStatusMessage(`Compressing ${files.length} files...`);
      
      const zip = new JSZip();
      let processed = 0;
      const totalFiles = files.length;

      // Process files with progress tracking
      for (const file of files) {
        const path = file.webkitRelativePath || file.name;
        const buffer = await file.arrayBuffer();
        zip.file(path, buffer);
        processed++;
        const compressionProgress = 10 + Math.round((processed / totalFiles) * 20);
        setProgress(compressionProgress);
        setStatusMessage(`Compressing... ${processed}/${totalFiles} files`);
      }

      setProgress(30);
      setStatusMessage('Finalizing package...');
      const blob = await zip.generateAsync({ type: 'blob' });
      const folderName = files[0].webkitRelativePath?.split('/')[0] || 'krimson-project';
      const zippedFile = new File([blob], `${folderName}.zip`, { type: 'application/zip' });
      setSelectedFile(zippedFile);

      await handleAnalysis(zippedFile);
    } catch (err) {
      console.error('Folder compression error:', err);
      setError('Unable to compress folder. Try zipping manually and re-uploading.');
      setUploading(false);
      setIsProcessing(false);
      setProgress(0);
      setStatusMessage('');
      setSelectedFile(null);
    } finally {
      event.target.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <section className="card-surface p-6">
        <div className="flex flex-col gap-3">
          <p className="text-xs uppercase tracking-[0.4em] text-text-muted">Upload</p>
          <h1 className="text-3xl font-semibold text-white">Upload a project for deep analysis</h1>
          <p className="text-sm text-text-muted">
            ZIPs, folders, or raw project files. Krimson will map the architecture, surface risks, estimate completion, and generate spoken
            insights.
          </p>
        </div>
      </section>

      <UploadZone
        isUploading={isProcessing || (progress > 0 && progress < 100)}
        progress={progress}
        statusMessage={statusMessage}
        selectedFile={selectedFile}
        onFileAccepted={handleAnalysis}
        onFolderRequest={handleFolderClick}
      />

      {selectedFile && !isProcessing && !error && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-text-muted">Selected file:</p>
          <p className="mt-1 text-sm font-medium text-white">{selectedFile.name}</p>
          <p className="mt-1 text-xs text-text-muted">
            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border-2 border-danger/50 bg-danger/20 p-6">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex-shrink-0">
              <svg className="h-5 w-5 text-danger" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-danger">Upload Failed</h3>
              <p className="mt-1 text-sm text-danger/90">{error}</p>
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setSelectedFile(null);
                  setProgress(0);
                  setStatusMessage('');
                }}
                className="mt-3 text-xs text-danger underline hover:text-danger/80"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      <input
        type="file"
        ref={folderInputRef}
        onChange={handleFolderChange}
        webkitdirectory="true"
        directory=""
        multiple
        className="hidden"
      />
    </div>
  );
};

export default Upload;

