"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, FileText } from "lucide-react";
import { cn } from "@/lib/cn";

export function CsvUploader({ onParsed }: { onParsed: (csvText: string) => void }) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => onParsed(String(reader.result ?? ""));
      reader.readAsText(file);
    },
    [onParsed],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"], "text/plain": [".csv", ".txt"] },
    maxFiles: 1,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors",
        isDragActive ? "border-accent-600 bg-accent-100/40" : "border-ink-900/20 hover:border-ink-900/40",
      )}
    >
      <input {...getInputProps()} />
      <div className="flex size-12 items-center justify-center rounded-full bg-ink-900/5 text-ink-700">
        {isDragActive ? <FileText className="size-5" /> : <UploadCloud className="size-5" />}
      </div>
      <div>
        <p className="text-sm font-medium text-ink-900">
          {isDragActive ? "Drop the CSV here" : "Drag a CSV, or click to browse"}
        </p>
        <p className="mt-1 font-mono text-xs text-ink-500">address,amount — one per line</p>
      </div>
    </div>
  );
}
