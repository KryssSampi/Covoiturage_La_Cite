/**
 * DocumentCard — Composant dumb pour l'affichage d'une carte de document
 */

"use client";

import { useRef } from "react";
import { FaCircleCheck, FaUpload } from "react-icons/fa6";

interface DocumentCardProps {
  doc: { type: string; labelFR: string; labelEN: string; descriptionFR: string; descriptionEN: string; requiresExpiry: boolean };
  isFR: boolean;
  submitted?: { fileUrl: string; expiryDate?: string };
  onUpload: (docType: string, fileUrl: string, expiryDate?: string) => void;
}

export function DocumentCard({ doc, isFR, submitted, onUpload }: DocumentCardProps) {
  const t = isFR ? { replace: "Remplacer", upload: "Téléverser", expiryDate: "Date d'expiration", submitted: "Soumis" } : { replace: "Replace", upload: "Upload", expiryDate: "Expiry Date", submitted: "Submitted" };
  const fileInputRef = useRef<HTMLInputElement>(null);
  const expiryRef = useRef<HTMLInputElement>(null);
  const isSubmitted = !!submitted;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const fileUrl = ev.target?.result as string;
      const expiry = expiryRef.current?.value || undefined;
      onUpload(doc.type, fileUrl, expiry);
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = "";
  };

  return (
    <div className={`rounded-xl border-2 p-4 transition-all ${isSubmitted ? "border-green-300 bg-green-50" : "border-gray-200 bg-white"}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-lg">{isSubmitted ? <FaCircleCheck color="#34D399" /> : <FaUpload color="#08316e" />}</span>
            <h3 className="text-sm font-semibold text-gray-900">{isFR ? doc.labelFR : doc.labelEN}</h3>
          </div>
          <p className="mt-1 text-xs text-gray-500">{isFR ? doc.descriptionFR : doc.descriptionEN}</p>
        </div>
      </div>
      {doc.requiresExpiry && (
        <div className="mt-3">
          <label className="mb-1 block text-xs font-medium text-gray-600">{t.expiryDate}</label>
          <input ref={expiryRef} type="date" defaultValue={submitted?.expiryDate} disabled={isSubmitted}
            className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed" />
        </div>
      )}
      <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isSubmitted}
        className={`mt-3 w-full rounded-lg px-3 py-2 text-xs font-medium transition-colors ${isSubmitted ? "bg-green-100 text-green-700 cursor-not-allowed opacity-60" : "bg-blue-50 text-blue-700 hover:bg-blue-100"} disabled:cursor-not-allowed`}>
        {isSubmitted ? ` ${t.replace} (${t.submitted})` : t.upload}
      </button>
      <input ref={fileInputRef} type="file" accept="image/*,application/pdf" onChange={handleFileChange} disabled={isSubmitted} className="hidden" />
    </div>
  );
}
