"use client";

import { useEffect, useRef, useState } from "react";
import { Tool, SizeUnit } from "@/types/tool";
import { UploadBox } from "@/components/ui/UploadBox";
import { FilePreview } from "@/components/ui/FilePreview";
import { CompressionSettings } from "@/components/ui/CompressionSettings";
import { ProgressState } from "@/components/ui/ProgressState";
import { ResultCard } from "@/components/ui/ResultCard";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { toBytes, generateOutputFilename } from "@/lib/format";
import { trackEvent } from "@/lib/analytics";

export function PdfCompressorTool({ tool }: { tool: Tool }) {
  const [file, setFile] = useState<File | null>(null);
  const [targetValue, setTargetValue] = useState<number>(tool.defaultTargetSize ?? 500);
  const [targetUnit, setTargetUnit] = useState<SizeUnit>(tool.defaultTargetUnit ?? "KB");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [stageLabel, setStageLabel] = useState<string | null>(null);
  const [result, setResult] = useState<{ blob: Blob; metTarget: boolean } | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const objectUrls = useRef<string[]>([]);

  useEffect(() => {
    const urls = objectUrls.current;
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, []);
  function track(url: string) {
    objectUrls.current.push(url);
    return url;
  }

  function reset() {
    setFile(null);
    setResult(null);
    setResultUrl(null);
    setError(null);
    setValidationError(null);
  }

  function handleFiles(files: File[]) {
    const f = files[0];
    if (!f) return;
    if (f.type !== "application/pdf") {
      setError("Unsupported file type. Please upload a PDF.");
      return;
    }
    if (f.size > tool.maxFileSizeMB * 1024 * 1024) {
      setError(`This file is too large. The maximum allowed size is ${tool.maxFileSizeMB} MB.`);
      return;
    }
    setError(null);
    setFile(f);
    trackEvent("file_selected", { tool_slug: tool.slug, file_type: f.type });
  }

  async function handleCompress() {
    if (!file) return;
    const targetBytes = toBytes(targetValue, targetUnit);
    if (targetBytes < 1024) {
      setValidationError("Target must be greater than 1 KB.");
      return;
    }
    setValidationError(null);
    setError(null);
    setIsRunning(true);
    setStageLabel("Uploading securely...");
    trackEvent("compression_started", { tool_slug: tool.slug, target_size_kb: targetUnit === "MB" ? targetValue * 1024 : targetValue });

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("targetBytes", String(targetBytes));

      setStageLabel("Optimizing embedded images...");
      const res = await fetch("/api/compress-pdf", { method: "POST", body: form });

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "Compression failed." }));
        throw new Error(body.error || "Compression failed.");
      }

      setStageLabel("Almost done...");
      const blob = await res.blob();
      const metTarget = res.headers.get("X-Target-Met") === "true";
      setResult({ blob, metTarget });
      setResultUrl(track(URL.createObjectURL(blob)));
      trackEvent("compression_completed", {
        tool_slug: tool.slug,
        reduced_percent: Math.round(((file.size - blob.size) / file.size) * 100),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while compressing your PDF. Please try another file or a larger target size.");
      trackEvent("compression_failed", { tool_slug: tool.slug });
    } finally {
      setIsRunning(false);
      setStageLabel(null);
    }
  }

  const targetLabel = `${targetValue} ${targetUnit}`;
  const outputName = file ? generateOutputFilename(file.name, `compressed-${targetValue}${targetUnit.toLowerCase()}`, "application/pdf") : "";

  return (
    <div className="space-y-4">
      {!file && <UploadBox accept={tool.acceptedFileTypes} maxFileSizeMB={tool.maxFileSizeMB} onFiles={handleFiles} />}
      {error && <ErrorMessage message={error} />}

      {file && !result && !isRunning && (
        <div className="card space-y-5 p-5 sm:p-6">
          <FilePreview fileName={file.name} fileType={file.type} fileSize={file.size} onRemove={reset} />
          <CompressionSettings value={targetValue} unit={targetUnit} onValueChange={setTargetValue} onUnitChange={setTargetUnit} error={validationError} />
          <p className="text-xs text-[var(--color-text-subtle)]">
            PDF compression requires secure server-side processing. Your file is held only in temporary memory during compression and is automatically discarded immediately afterward — it is never stored or shared.
          </p>
          <button onClick={handleCompress} className="btn-primary w-full px-5 py-3 text-sm sm:w-auto">
            Compress File
          </button>
        </div>
      )}

      {isRunning && stageLabel && <ProgressState label={stageLabel} />}

      {result && resultUrl && file && (
        <ResultCard
          originalBytes={file.size}
          compressedBytes={result.blob.size}
          targetLabel={targetLabel}
          targetMet={result.metTarget}
          downloadUrl={resultUrl}
          downloadName={outputName}
          onReset={reset}
        />
      )}
    </div>
  );
}
