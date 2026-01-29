"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, Image as ImageIcon, X, Loader2, AlertTriangle, Shield } from "lucide-react";

interface FileUploadProps {
  onTextExtracted: (text: string) => void;
  disabled?: boolean;
}

interface OCRProgress {
  status: string;
  progress: number;
}

export function FileUpload({ onTextExtracted, disabled = false }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [ocrProgress, setOcrProgress] = useState<OCRProgress | null>(null);
  const [processingType, setProcessingType] = useState<'pdf' | 'ocr' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
const ocrWorkerRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  // Extract text from PDF via server API
  const extractPdfText = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/extract-text', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.details || data.error || 'Failed to extract text from PDF');
    }

    return data.text;
  };

  // Run OCR on image using Tesseract.js (client-side)
  const runOCR = async (file: File): Promise<string> => {
    setOcrProgress({ status: 'Loading OCR engine...', progress: 0 });

    try {
      // Dynamic import of Tesseract.js
      const Tesseract = await import('tesseract.js');
      
      // Create worker
      const worker = await Tesseract.createWorker('eng', 1, {
        logger: (m: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
          if (m.status === 'recognizing text') {
            setOcrProgress({
              status: 'Recognizing text...',
              progress: Math.round(m.progress * 100),
            });
          } else if (m.status === 'loading language traineddata') {
            setOcrProgress({
              status: 'Loading language data...',
              progress: Math.round(m.progress * 100),
            });
          }
        },
      });

      ocrWorkerRef.current = worker;

      setOcrProgress({ status: 'Processing image...', progress: 0 });

      // Convert file to data URL
      const imageUrl = URL.createObjectURL(file);

      // Recognize text
      const { data: { text } } = await worker.recognize(imageUrl);

      // Cleanup
      URL.revokeObjectURL(imageUrl);
      await worker.terminate();
      ocrWorkerRef.current = null;

      return text.trim();
    } catch (e) {
      // Check if Tesseract is not installed
      if (e instanceof Error && e.message.includes('Cannot find module')) {
        throw new Error(
          'OCR support not available. Please install tesseract.js: npm install tesseract.js'
        );
      }
      throw e;
    }
  };

  // Cancel OCR processing
  const cancelOCR = async () => {
    if (ocrWorkerRef.current) {
      try {
        await ocrWorkerRef.current.terminate();
      } catch {
        // Ignore termination errors
      }
      ocrWorkerRef.current = null;
    }
    setIsProcessing(false);
    setOcrProgress(null);
    setProcessingType(null);
    setSelectedFile(null);
  };

  const processFile = async (file: File) => {
    setError(null);
    setSelectedFile(file);
    setIsProcessing(true);
    setOcrProgress(null);

    try {
      const isPDF = file.type === 'application/pdf';
      const isImage = file.type.startsWith('image/');
      const isText = file.type === 'text/plain';

      if (isText) {
        // Plain text file - read directly
        const text = await file.text();
        onTextExtracted(text);
        setIsProcessing(false);
        return;
      }

      if (isPDF) {
        setProcessingType('pdf');
        // Extract text via server API
        const text = await extractPdfText(file);
        
        if (!text || text.trim().length === 0) {
          throw new Error('No text could be extracted from this PDF. It may contain only images.');
        }
        
        onTextExtracted(text);
        setIsProcessing(false);
        setProcessingType(null);
        return;
      }

      if (isImage) {
        setProcessingType('ocr');
        // Run OCR client-side
        const text = await runOCR(file);
        
        if (!text || text.trim().length === 0) {
          throw new Error('No text could be recognized in this image. Please try a clearer image or paste the text manually.');
        }
        
        onTextExtracted(text);
        setIsProcessing(false);
        setOcrProgress(null);
        setProcessingType(null);
        return;
      }

      setError(`Unsupported file type: ${file.type || 'unknown'}. Please use PDF, image (PNG, JPG), or text files.`);
      
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to process file');
    } finally {
      setIsProcessing(false);
      setOcrProgress(null);
      setProcessingType(null);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleClick = () => {
    if (!isProcessing) {
      fileInputRef.current?.click();
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.txt,.png,.jpg,.jpeg,.webp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isProcessing}
      />

      <Card
        className={`border-2 border-dashed transition-colors ${
          isProcessing ? 'cursor-wait' : 'cursor-pointer'
        } ${
          isDragging 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-primary/50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={disabled ? undefined : handleClick}
      >
        <CardContent className="py-8">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            {isProcessing ? (
              <>
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
                {processingType === 'ocr' && ocrProgress ? (
                  <div className="space-y-2 w-full max-w-xs">
                    <p className="text-sm font-medium">{ocrProgress.status}</p>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${ocrProgress.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{ocrProgress.progress}%</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        cancelOCR();
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : processingType === 'pdf' ? (
                  <p className="text-sm text-muted-foreground">Extracting text from PDF...</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Processing file...</p>
                )}
              </>
            ) : selectedFile ? (
              <>
                <div className="flex items-center gap-2">
                  {selectedFile.type === 'application/pdf' ? (
                    <FileText className="h-8 w-8 text-destructive/80" />
                  ) : selectedFile.type.startsWith('image/') ? (
                    <ImageIcon className="h-8 w-8 text-primary" />
                  ) : (
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  )}
                  <span className="font-medium">{selectedFile.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearFile();
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </>
            ) : (
              <>
                <Upload className="h-12 w-12 text-muted-foreground" />
                <div>
                  <p className="font-medium">Drop a file here or click to browse</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Supports PDF, images (PNG, JPG), and text files
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Alert variant="warning" className="text-sm">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Privacy reminder:</strong> After extraction, review the text and consider redacting your name, date of birth, or other identifiers before analysis. All processing is done locally or in-memory - we do not store your files.
        </AlertDescription>
      </Alert>
    </div>
  );
}
