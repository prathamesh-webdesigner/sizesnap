"use client";

import { useEffect, useRef, useState } from "react";
import { Tool, SizeUnit } from "@/types/tool";
import { UploadBox } from "@/components/ui/UploadBox";
import { FilePreview } from "@/components/ui/FilePreview";
import { CompressionSettings } from "@/components/ui/CompressionSettings";
import { ProgressState } from "@/components/ui/ProgressState";
import { ResultCard } from "@/components/ui/ResultCard";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { useImageCompressor } from "@/hooks/useImageCompressor";
import { useToast } from "@/components/ui/Toast";
import { toBytes, formatBytes, generateOutputFilename } from "@/lib/format";
import { trackEvent } from "@/lib/analytics";

export function ImageCompressorTool({ tool }: { tool: Tool }) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [targetValue, setTargetValue] = useState<number>(tool.defaultTargetSize ?? 100);
  const [targetUnit, setTargetUnit] = useState<SizeUnit>(tool.defaultTargetUnit ?? "KB");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [runError, setRunError] = useState<string | null>(null);
  const [result, setResult] = useState<Awaited<ReturnType<typeof run>> | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const { run, isRunning, stageLabel } = useImageCompressor();
  const { push } = useToast();
  const objectUrls = useRef<string[]>([]);

  useEffect(() => {
    const urls = objectUrls.current;
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, []);

  function trackObjectUrl(url: string) {
    objectUrls.current.push(url);
    return url;
  }

  function reset() {
    setFile(null);
    setPreviewUrl(null);
    setDimensions(null);
    setResult(null);
    setResultUrl(null);
    setRunError(null);
    setValidationError(null);
  }

  async function handleFiles(files: File[]) {
    const f = files[0];
    if (!f) return;
    if (!tool.acceptedMime.includes(f.type)) {
      setRunError(`Unsupported file type. Please upload one of: ${tool.acceptedFileTypes.join(", ")}.`);
      return;
    }
    if (f.size > tool.maxFileSizeMB * 1024 * 1024) {
      setRunError(`This file is too large. The maximum allowed size is ${tool.maxFileSizeMB} MB.`);
      return;
    }
    setRunError(null);
    setResult(null);
    setResultUrl(null);
    setFile(f);
    const url = trackObjectUrl(URL.createObjectURL(f));
    setPreviewUrl(url);
    trackEvent("file_selected", { tool_slug: tool.slug, file_type: f.type });

    try {
      const bitmap = await createImageBitmap(f);
      setDimensions({ width: bitmap.width, height: bitmap.height });
      bitmap.close?.();
    } catch {
      setRunError("This file could not be read as an image. It may be corrupted — please try another file.");
      setFile(null);
    }
  }

  function validateTarget(): boolean {
    const targetBytes = toBytes(targetValue, targetUnit);
    if (!targetValue || targetValue <= 0) {
      setValidationError("Enter a target size greater than 0.");
      return false;
    }
    if (targetBytes < 1024) {
      setValidationError("Target must be greater than 1 KB.");
      return false;
    }
    if (file && targetBytes >= file.size) {
      setValidationError(null); // allowed, but compression will simply keep the original
    } else {
      setValidationError(null);
    }
    return true;
  }

  async function handleCompress() {
    if (!file) return;
    if (!validateTarget()) return;
    setRunError(null);
    trackEvent("compression_started", { tool_slug: tool.slug, target_size_kb: targetUnit === "MB" ? targetValue * 1024 : targetValue });

    const targetBytes = toBytes(targetValue, targetUnit);

    if (targetBytes >= file.size) {
      // Nothing to do — the file already meets the target.
      const url = trackObjectUrl(URL.createObjectURL(file));
      setResultUrl(url);
      setResult({
        blob: file,
        mimeType: file.type,
        width: dimensions?.width ?? 0,
        height: dimensions?.height ?? 0,
        originalWidth: dimensions?.width ?? 0,
        originalHeight: dimensions?.height ?? 0,
        qualityUsed: null,
        metTarget: true,
        formatChanged: false,
        dimensionsChanged: false,
      });
      trackEvent("compression_completed", { tool_slug: tool.slug, reduced_percent: 0 });
      return;
    }

    try {
      const outcome = await run(file, targetBytes, tool.outputFormat === "keep" ? "keep" : (tool.outputFormat as "jpeg" | "png" | "webp"));
      const url = trackObjectUrl(URL.createObjectURL(outcome.blob));
      setResult(outcome);
      setResultUrl(url);
      trackEvent("compression_completed", {
        tool_slug: tool.slug,
        reduced_percent: Math.round(((file.size - outcome.blob.size) / file.size) * 100),
      });
      if (!outcome.metTarget) {
        push("info", "Your requested size was very tight — we got as close as possible without extreme quality loss.");
      }
    } catch {
      setRunError("Something went wrong while processing your file. Please try another file or a larger target size.");
      trackEvent("compression_failed", { tool_slug: tool.slug });
    }
  }

  const targetLabel = `${targetValue} ${targetUnit}`;
  const outputName = file ? generateOutputFilename(file.name, `compressed-${targetValue}${targetUnit.toLowerCase()}`, result?.mimeType || file.type) : "";

  return (
    <div className="space-y-4">
      {!file && (
        <UploadBox accept={tool.acceptedFileTypes} maxFileSizeMB={tool.maxFileSizeMB} onFiles={handleFiles} />
      )}

      {runError && <ErrorMessage message={runError} />}

      {file && !result && !isRunning && (
        <div className="card space-y-5 p-5 sm:p-6">
          <FilePreview
            fileName={file.name}
            fileType={file.type}
            fileSize={file.size}
            dimensions={dimensions || undefined}
            previewUrl={previewUrl}
            onRemove={reset}
          />
          <CompressionSettings
            value={targetValue}
            unit={targetUnit}
            onValueChange={setTargetValue}
            onUnitChange={setTargetUnit}
            error={validationError}
          />
          <p className="text-xs text-[var(--color-text-subtle)]">
            Your file is processed in your browser and is not uploaded to our servers.
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
          beforePreviewUrl={previewUrl}
          afterPreviewUrl={resultUrl}
          formatNote={
            result.formatChanged
              ? `Format changed from ${file.type.split("/")[1].toUpperCase()} to ${result.mimeType.split("/")[1].toUpperCase()} to reach your target size.`
              : null
          }
          dimensionsNote={
            result.dimensionsChanged
              ? `Dimensions reduced from ${result.originalWidth}×${result.originalHeight} to ${result.width}×${result.height} to reach your target size.`
              : `Original dimensions preserved: ${result.width}×${result.height}px.`
          }
          onReset={reset}
        />
      )}

      {file && result && (
        <p className="text-center text-xs text-[var(--color-text-subtle)]">
          Original was {formatBytes(file.size)}.
        </p>
      )}
    </div>
  );
}
