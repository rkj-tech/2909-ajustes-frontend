"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Download,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Paperclip,
  PlayCircle,
  X,
} from "lucide-react";
import type { RequestAttachment } from "@/types";

type AttachmentKind = "image" | "video" | "file";

const IMAGE_EXTENSIONS = /\.(avif|bmp|gif|heic|heif|jpe?g|png|svg|webp)$/i;
const VIDEO_EXTENSIONS = /\.(m4v|mov|mp4|mpeg|ogg|ogv|webm)$/i;

function getAttachmentKind(attachment: RequestAttachment): AttachmentKind {
  const normalizedType = attachment.fileType?.toLowerCase() ?? "";
  const fileTarget = `${attachment.fileName} ${attachment.fileUrl}`;

  if (normalizedType.startsWith("image/") || IMAGE_EXTENSIONS.test(fileTarget)) {
    return "image";
  }

  if (normalizedType.startsWith("video/") || VIDEO_EXTENSIONS.test(fileTarget)) {
    return "video";
  }

  return "file";
}

function formatFileSize(sizeInBytes: number): string {
  if (!Number.isFinite(sizeInBytes) || sizeInBytes <= 0) {
    return "0 KB";
  }

  if (sizeInBytes < 1024 * 1024) {
    return `${(sizeInBytes / 1024).toFixed(1)} KB`;
  }

  return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function RequestAttachmentsPreview({
  attachments,
}: {
  attachments?: RequestAttachment[];
}) {
  const [selectedAttachment, setSelectedAttachment] = useState<RequestAttachment | null>(null);

  const safeAttachments = useMemo(() => attachments ?? [], [attachments]);

  useEffect(() => {
    if (!selectedAttachment) {
      return undefined;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedAttachment(null);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [selectedAttachment]);

  if (safeAttachments.length === 0) {
    return null;
  }

  const selectedKind = selectedAttachment ? getAttachmentKind(selectedAttachment) : null;

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Paperclip size={20} />
          Anexos ({safeAttachments.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {safeAttachments.map((attachment) => {
            const kind = getAttachmentKind(attachment);
            const canPreview = kind !== "file";

            return (
              <div
                key={attachment.id}
                className="rounded-2xl border border-gray-200 bg-gray-50 overflow-hidden"
              >
                {canPreview ? (
                  <button
                    type="button"
                    onClick={() => setSelectedAttachment(attachment)}
                    className="group relative block w-full bg-slate-900 aspect-video overflow-hidden text-left"
                  >
                    {kind === "image" ? (
                      // Attachments come from dynamic remote URLs, so a plain img keeps the preview flexible.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={attachment.fileUrl}
                        alt={attachment.fileName}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <video
                        src={attachment.fileUrl}
                        className="h-full w-full object-cover"
                        muted
                        playsInline
                        preload="metadata"
                      />
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/20 to-transparent opacity-90 transition-opacity group-hover:opacity-100" />
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-4 py-3 text-white">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        {kind === "image" ? <ImageIcon size={16} /> : <PlayCircle size={16} />}
                        {kind === "image" ? "Visualizar imagem" : "Visualizar vídeo"}
                      </div>
                      <span className="text-xs text-white/80">Clique para ampliar</span>
                    </div>
                  </button>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                    <div className="text-center text-slate-500">
                      <FileText size={30} className="mx-auto mb-2" />
                      <p className="text-sm font-medium">Arquivo sem preview</p>
                    </div>
                  </div>
                )}

                <div className="p-4 space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-800 break-all">
                      {attachment.fileName}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {attachment.fileType || "Arquivo"} • {formatFileSize(attachment.fileSize)}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {canPreview && (
                      <button
                        type="button"
                        onClick={() => setSelectedAttachment(attachment)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
                      >
                        {kind === "image" ? <ImageIcon size={14} /> : <PlayCircle size={14} />}
                        Visualizar
                      </button>
                    )}

                    <a
                      href={attachment.fileUrl}
                      download={attachment.fileName}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-white transition-colors"
                    >
                      <Download size={14} />
                      Baixar
                    </a>

                    <a
                      href={attachment.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-white transition-colors"
                    >
                      <ExternalLink size={14} />
                      Abrir
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedAttachment && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm p-4 sm:p-6"
          onClick={() => setSelectedAttachment(null)}
          role="presentation"
        >
          <div
            className="mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={`Preview do anexo ${selectedAttachment.fileName}`}
          >
            <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-5 py-4">
              <div className="min-w-0">
                <p className="text-base font-semibold text-gray-900 break-all">
                  {selectedAttachment.fileName}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedAttachment.fileType || "Arquivo"} • {formatFileSize(selectedAttachment.fileSize)}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={selectedAttachment.fileUrl}
                  download={selectedAttachment.fileName}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  <Download size={14} />
                  Baixar
                </a>
                <a
                  href={selectedAttachment.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  <ExternalLink size={14} />
                  Abrir
                </a>
                <button
                  type="button"
                  onClick={() => setSelectedAttachment(null)}
                  className="inline-flex items-center justify-center h-10 w-10 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
                  aria-label="Fechar preview"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-slate-950 p-4 sm:p-6 flex items-center justify-center overflow-auto">
              {selectedKind === "image" && (
                // The expanded preview also uses the original remote attachment URL.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedAttachment.fileUrl}
                  alt={selectedAttachment.fileName}
                  className="max-h-full w-auto rounded-2xl object-contain"
                />
              )}

              {selectedKind === "video" && (
                <video
                  src={selectedAttachment.fileUrl}
                  controls
                  playsInline
                  className="max-h-full w-full rounded-2xl bg-black"
                />
              )}

              {selectedKind === "file" && (
                <div className="text-center text-white">
                  <FileText size={40} className="mx-auto mb-4 text-white/70" />
                  <p className="text-lg font-medium">Esse arquivo não possui preview embutido.</p>
                  <p className="text-sm text-white/70 mt-2">
                    Use os botões acima para abrir ou baixar o anexo.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
