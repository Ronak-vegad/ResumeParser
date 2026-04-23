import { useRef, useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/context/AuthContext';

interface UploadScreenProps {
  onAnalyze: (file: File) => Promise<void>;
}

export default function UploadScreen({ onAnalyze }: UploadScreenProps) {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const requireLogin = useCallback((): boolean => {
    if (authLoading) {
      return false;
    }
    if (user) {
      return true;
    }
    setErrorMessage('Log in to upload and parse your resume.');
    navigate('/login?from=/');
    return false;
  }, [authLoading, user, navigate]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 KB';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);
      if (!requireLogin()) return;

      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile && (droppedFile.type === 'application/pdf' || droppedFile.name.toLowerCase().endsWith('.docx'))) {
        setErrorMessage('');
        setFile(droppedFile);
      } else {
        setErrorMessage('Please upload a PDF or DOCX resume.');
      }
    },
    [requireLogin]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!requireLogin()) {
        e.target.value = '';
        return;
      }
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        if (!(selectedFile.type === 'application/pdf' || selectedFile.name.toLowerCase().endsWith('.docx'))) {
          setErrorMessage('Please upload a PDF or DOCX resume.');
          return;
        }
        setErrorMessage('');
        setFile(selectedFile);
      }
    },
    [requireLogin]
  );

  const handleBrowse = useCallback(() => {
    if (!requireLogin()) return;
    fileInputRef.current?.click();
  }, [requireLogin]);

  const handleRemoveFile = useCallback(() => {
    setFile(null);
    setErrorMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!file) return;
    if (!requireLogin()) return;
    setIsAnalyzing(true);
    setErrorMessage('');
    try {
      await onAnalyze(file);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to parse resume.';
      setErrorMessage(message);
    } finally {
      setIsAnalyzing(false);
    }
  }, [file, onAnalyze, requireLogin]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleBrowse();
      }
    },
    [handleBrowse]
  );

  return (
    <div className="min-h-screen relative z-10 text-white bg-[#080808]">
      <div className="mx-auto max-w-[1680px] px-5 sm:px-8 lg:px-14 pt-4 lg:pt-6">
        <div className="mt-6 lg:mt-8 grid grid-cols-1 lg:grid-cols-[1.1fr_460px] gap-10 lg:gap-16 items-start">
          <section className="pt-2">
            <h1 className="font-body text-[52px] sm:text-[72px] lg:text-[122px] leading-[0.88] tracking-[-0.045em] font-extrabold max-w-[920px]">
              <span className="block">Drop</span>
              <span className="block">YourResume.</span>
            </h1>

            <p className="mt-7 text-sm sm:text-base text-white/55 max-w-[560px]">
              AI extracts every field instantly and accurately with a premium editing workflow built for modern teams.
            </p>

            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-[520px]">
              <div className="rounded-2xl border border-white/10 bg-[#111111] px-6 py-7">
                <div className="mb-6 text-white/65">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <path d="M9 15h6" />
                    <path d="M9 11h6" />
                  </svg>
                </div>
                <p className="text-xs uppercase tracking-[0.18em] text-white/70">AI Extraction</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#111111] px-6 py-7">
                <div className="mb-6 text-white/65">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z" />
                  </svg>
                </div>
                <p className="text-xs uppercase tracking-[0.18em] text-white/70">Inline Editing</p>
              </div>
            </div>
          </section>

          <aside className="lg:pt-12">
            <div className="rounded-2xl border border-white/10 p-6 sm:p-7 bg-[#111111] shadow-[0_24px_80px_rgba(0,0,0,0.65)]">
              <h2 className="text-[30px] leading-none font-semibold tracking-[-0.02em]">Upload Resume</h2>
              <p className="mt-2 text-sm text-white/50">PDF format supported · Max 10 MB</p>

              {!file ? (
                <div
                  ref={dropZoneRef}
                  role="button"
                  tabIndex={0}
                  aria-label="Drop zone for resume upload"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
              onClick={handleBrowse}
              onKeyDown={handleKeyDown}
              className="mt-6 min-h-[220px] rounded-xl border border-dashed flex flex-col items-center justify-center px-5 text-center cursor-pointer transition-all duration-200"
                  style={{
                    borderColor: isDragActive ? '#6AA7FF' : 'rgba(255,255,255,0.14)',
                    background: isDragActive ? 'rgba(106, 167, 255, 0.10)' : '#0E0E0E',
                  }}
                >
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <path d="M12 18v-7" />
                    <path d="m8.5 14.5 3.5-3.5 3.5 3.5" />
                  </svg>

                  <p className="mt-5 text-[15px] text-white/80">Drag &amp; drop your resume here</p>
                  <p className="mt-3 text-xs uppercase tracking-[0.16em] text-white/35">or</p>

                  <button
                    type="button"
                    className="mt-4 h-10 px-5 rounded-md border border-white/25 text-sm font-semibold tracking-[0.08em] uppercase hover:border-white/40 hover:bg-white/[0.05] transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBrowse();
                    }}
                  >
                    Browse Files
                  </button>
                </div>
              ) : (
                <div className="mt-6 rounded-xl border border-white/15 bg-[#0E0E0E] px-4 py-3.5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#6AA7FF1A] border border-[#6AA7FF4D] flex items-center justify-center text-[#7FB3FF]">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-white/45">{formatFileSize(file.size)}</p>
                  </div>
                  <button
                    onClick={handleRemoveFile}
                    className="w-7 h-7 rounded-full border border-white/15 text-white/60 hover:text-white hover:border-white/30 transition-colors"
                    aria-label="Remove file"
                  >
                    ×
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx"
                hidden
                onChange={handleFileSelect}
              />

              <button
                onClick={handleAnalyze}
                disabled={!file || isAnalyzing}
                className="mt-4 w-full h-12 rounded-lg text-sm font-semibold tracking-[0.06em] uppercase transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(180deg, #3A4A64 0%, #2C3A52 100%)',
                  boxShadow: '0 14px 30px rgba(76, 128, 214, 0.22)',
                }}
              >
                {isAnalyzing ? 'Analyzing Resume...' : 'Analyze Resume'}
              </button>

              <p className="mt-4 text-center text-xs text-white/45">
                {isAnalyzing ? 'Parsing with AI engine...' : file ? 'Ready to parse' : 'Upload a PDF/DOCX to begin'}
              </p>

              {errorMessage && (
                <p className="mt-3 text-xs text-center text-[#FF8F8F]">
                  {errorMessage}
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
