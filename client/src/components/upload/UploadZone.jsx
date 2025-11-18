import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FolderOpen, Loader2, ShieldCheck } from 'lucide-react';

const acceptedFormats = [
  '.zip',
  '.rar',
  '.7z',
  '.tar',
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.py',
  '.rb',
  '.java',
  '.cs',
  '.html',
  '.css',
  '.json',
  '.md',
];

const UploadZone = ({ onFileAccepted, isUploading, progress, statusMessage, onFolderRequest, selectedFile }) => {
  const handleDrop = useCallback(
    (files) => {
      if (!files?.length || !onFileAccepted) return;
      onFileAccepted(files[0]);
    },
    [onFileAccepted],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    multiple: false,
    disabled: isUploading,
    accept: acceptedFormats.reduce((acc, ext) => {
      acc['application/octet-stream'] = [...(acc['application/octet-stream'] || []), ext];
      return acc;
    }, {}),
  });

  return (
    <div className="card-surface relative overflow-hidden">
      <div className="absolute inset-0 opacity-60 blur-3xl" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/20" />
      </div>

      <div className="relative flex flex-col gap-6 p-8">
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.3em] text-text-muted">Upload</p>
          <h2 className="text-3xl font-semibold text-white">Project Intake</h2>
          <p className="text-text-muted">
            Drop a ZIP, folder bundle, or single project file. Krimson AI will map your structure, detect gaps, and
            prepare a strategic execution plan.
          </p>
        </div>

        <div
          {...getRootProps()}
          className={`group relative flex min-h-[210px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition ${
            isDragActive ? 'border-accent bg-white/5' : isUploading ? 'border-primary/50 bg-white/5' : 'border-white/10 hover:border-accent/40'
          } ${isUploading ? 'cursor-wait' : ''}`}
        >
          <input {...getInputProps()} />

          <div className="flex flex-col items-center gap-4 text-center">
            <span className="rounded-full bg-primary/40 p-4 text-white shadow-crimson-soft transition group-hover:-translate-y-2">
              {isUploading ? <Loader2 className="h-8 w-8 animate-spin" /> : <UploadCloud className="h-8 w-8" />}
            </span>
            <div>
              <p className="text-lg font-medium">
                {isUploading ? (statusMessage || 'Analyzing your repository…') : selectedFile ? `Selected: ${selectedFile.name}` : 'Drag & drop your project or browse files'}
              </p>
              <p className="text-sm text-text-muted">
                {isUploading ? 'Please wait while we process your project' : 'Supports ZIPs, folders, and standalone project files'}
              </p>
            </div>
            {(isUploading || progress > 0) && (
              <div className="flex w-full max-w-xs flex-col gap-2">
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-accent to-primary transition-all duration-300"
                    style={{ width: `${Math.max(progress ?? 0, 5)}%` }}
                  />
                </div>
                <p className="text-xs uppercase tracking-[0.4em] text-text-muted">{statusMessage || 'Processing...'}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/5 bg-white/5 p-4 text-sm text-text-muted">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-success" />
            <span>Client-side packaging ensures your code never leaves your machine unencrypted.</span>
          </div>
          <button
            type="button"
            onClick={onFolderRequest}
            className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/20"
          >
            <FolderOpen className="h-4 w-4" />
            Upload folder
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadZone;

