"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Upload,
    File,
    FileText,
    X,
    AlertCircle,
    CheckCircle,
    Loader2,
    Trash2,
} from "lucide-react";

interface UploadedFile {
    id: string;
    name: string;
    size: number;
    type: string;
    uploadedAt: Date;
    status: "uploading" | "processing" | "ready" | "error";
    error?: string;
}

interface FileUploadProps {
    isOpen: boolean;
    onClose: () => void;
    onFileUploaded?: (file: UploadedFile) => void;
}

export default function FileUpload({
    isOpen,
    onClose,
    onFileUploaded,
}: FileUploadProps) {
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const acceptedTypes = [
        ".pdf",
        ".txt",
        ".doc",
        ".docx",
        ".md",
        ".csv",
        ".json",
    ];

    const maxFileSize = 10 * 1024 * 1024; // 10MB

    const validateFile = (file: File): string | null => {
        if (file.size > maxFileSize) {
            return "File size must be less than 10MB";
        }

        const extension = "." + file.name.split(".").pop()?.toLowerCase();
        if (!acceptedTypes.includes(extension)) {
            return `File type not supported. Accepted types: ${acceptedTypes.join(", ")}`;
        }

        return null;
    };

    const generateFileId = (): string => {
        return Math.random().toString(36).substr(2, 9);
    };

    const handleFileUpload = async (files: FileList) => {
        setError(null);
        const filesToUpload = Array.from(files);

        for (const file of filesToUpload) {
            const validationError = validateFile(file);
            if (validationError) {
                setError(validationError);
                continue;
            }

            const fileId = generateFileId();
            const uploadedFile: UploadedFile = {
                id: fileId,
                name: file.name,
                size: file.size,
                type: file.type,
                uploadedAt: new Date(),
                status: "uploading",
            };

            setUploadedFiles((prev) => [...prev, uploadedFile]);

            try {
                // Update status to processing
                setUploadedFiles((prev) =>
                    prev.map((f) =>
                        f.id === fileId ? { ...f, status: "processing" } : f,
                    ),
                );

                // Upload file (currently disabled in the API)
                // const success = await chatService.uploadFile(file);

                // Simulate upload process for now
                await new Promise((resolve) => setTimeout(resolve, 2000));
                const success = true; // Simulate success

                if (success) {
                    setUploadedFiles((prev) =>
                        prev.map((f) =>
                            f.id === fileId ? { ...f, status: "ready" } : f,
                        ),
                    );
                    onFileUploaded?.(uploadedFile);
                } else {
                    throw new Error("Upload failed");
                }
            } catch (error) {
                const errorMessage =
                    error instanceof Error ? error.message : "Upload failed";
                setUploadedFiles((prev) =>
                    prev.map((f) =>
                        f.id === fileId
                            ? { ...f, status: "error", error: errorMessage }
                            : f,
                    ),
                );
            }
        }
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileUpload(files);
        }
    }, [handleFileUpload]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFileUpload(files);
        }
        // Reset input
        e.target.value = "";
    };

    const removeFile = (fileId: string) => {
        setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const getFileIcon = (fileName: string) => {
        const extension = fileName.split(".").pop()?.toLowerCase();
        switch (extension) {
            case "pdf":
                return <FileText className="w-5 h-5 text-red-400" />;
            case "doc":
            case "docx":
                return <FileText className="w-5 h-5 text-blue-400" />;
            case "txt":
            case "md":
                return <File className="w-5 h-5 text-gray-400" />;
            default:
                return <File className="w-5 h-5 text-slate-400" />;
        }
    };

    const getStatusIcon = (status: UploadedFile["status"]) => {
        switch (status) {
            case "uploading":
            case "processing":
                return (
                    <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                );
            case "ready":
                return <CheckCircle className="w-4 h-4 text-green-400" />;
            case "error":
                return <AlertCircle className="w-4 h-4 text-red-400" />;
        }
    };

    const getStatusText = (status: UploadedFile["status"]) => {
        switch (status) {
            case "uploading":
                return "Uploading...";
            case "processing":
                return "Processing...";
            case "ready":
                return "Ready";
            case "error":
                return "Error";
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-4xl max-h-[90vh] bg-slate-900 border-slate-700 flex flex-col">
                <CardHeader className="pb-4 border-b border-slate-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                                <Upload className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <CardTitle className="text-xl text-slate-100">
                                    File Upload
                                </CardTitle>
                                <p className="text-sm text-slate-400 mt-1">
                                    Upload documents to enhance your
                                    conversations
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-100"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="flex-1 p-6 overflow-hidden flex flex-col">
                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-900/20 border border-red-500/30">
                            <div className="flex items-center gap-2 text-red-400">
                                <AlertCircle className="w-4 h-4" />
                                <span className="text-sm">{error}</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setError(null)}
                                    className="ml-auto text-red-400 hover:text-red-300"
                                >
                                    <X className="w-3 h-3" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Upload Area */}
                    <div
                        className={`
              relative border-2 border-dashed rounded-lg p-8 mb-6 transition-colors
              ${isDragging
                                ? "border-blue-400 bg-blue-900/20"
                                : "border-slate-600 hover:border-slate-500"
                            }
            `}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                    >
                        <div className="text-center">
                            <Upload
                                className={`w-12 h-12 mx-auto mb-4 ${isDragging
                                        ? "text-blue-400"
                                        : "text-slate-400"
                                    }`}
                            />

                            <h3 className="text-lg font-semibold text-slate-200 mb-2">
                                {isDragging
                                    ? "Drop files here"
                                    : "Upload Documents"}
                            </h3>

                            <p className="text-slate-400 mb-4">
                                Drag and drop files here, or click to browse
                            </p>

                            <input
                                type="file"
                                multiple
                                accept={acceptedTypes.join(",")}
                                onChange={handleFileInput}
                                className="hidden"
                                id="file-upload"
                            />

                            <Button
                                onClick={() =>
                                    document
                                        .getElementById("file-upload")
                                        ?.click()
                                }
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            >
                                Browse Files
                            </Button>

                            <div className="mt-4 text-xs text-slate-500">
                                <p>
                                    Supported formats:{" "}
                                    {acceptedTypes.join(", ")}
                                </p>
                                <p>
                                    Maximum file size:{" "}
                                    {formatFileSize(maxFileSize)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* File List */}
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-slate-100">
                                Uploaded Files ({uploadedFiles.length})
                            </h3>
                            {uploadedFiles.length > 0 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setUploadedFiles([])}
                                    className="text-slate-400 border-slate-600 hover:bg-slate-700"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Clear All
                                </Button>
                            )}
                        </div>

                        <ScrollArea className="flex-1">
                            {uploadedFiles.length === 0 ? (
                                <div className="text-center py-12">
                                    <File className="w-12 h-12 mx-auto mb-4 text-slate-500" />
                                    <p className="text-slate-400 mb-2">
                                        No files uploaded yet
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        Upload documents to get started
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {uploadedFiles.map((file) => (
                                        <Card
                                            key={file.id}
                                            className={`p-4 border transition-colors ${file.status === "error"
                                                    ? "bg-red-900/10 border-red-500/30"
                                                    : file.status === "ready"
                                                        ? "bg-green-900/10 border-green-500/30"
                                                        : "bg-slate-800/30 border-slate-700"
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    {getFileIcon(file.name)}
                                                    <div className="min-w-0 flex-1">
                                                        <p className="font-medium text-slate-200 truncate">
                                                            {file.name}
                                                        </p>
                                                        <div className="flex items-center gap-4 text-sm text-slate-400">
                                                            <span>
                                                                {formatFileSize(
                                                                    file.size,
                                                                )}
                                                            </span>
                                                            <span>
                                                                {file.uploadedAt.toLocaleTimeString()}
                                                            </span>
                                                        </div>
                                                        {file.error && (
                                                            <p className="text-xs text-red-400 mt-1">
                                                                {file.error}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center gap-2">
                                                        {getStatusIcon(
                                                            file.status,
                                                        )}
                                                        <span
                                                            className={`text-sm font-medium ${file.status ===
                                                                    "error"
                                                                    ? "text-red-400"
                                                                    : file.status ===
                                                                        "ready"
                                                                        ? "text-green-400"
                                                                        : "text-blue-400"
                                                                }`}
                                                        >
                                                            {getStatusText(
                                                                file.status,
                                                            )}
                                                        </span>
                                                    </div>

                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            removeFile(file.id)
                                                        }
                                                        className="h-8 w-8 text-slate-400 hover:text-red-400"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </div>

                    {/* Footer */}
                    <div className="mt-6 pt-4 border-t border-slate-700">
                        <div className="flex items-center justify-between">
                            <p className="text-xs text-slate-500">
                                Files are processed and indexed for better
                                conversation context
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={onClose}
                                    className="text-slate-200 border-slate-600 hover:bg-slate-700"
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
