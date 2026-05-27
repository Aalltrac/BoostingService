import { useRef, useState } from "react";
import { Upload, X, Plus } from "lucide-react";
import { fileToCompressedBase64 } from "./ImageUpload";

/**
 * Multi-image uploader.
 * - value: string[] (base64 images)
 * - onChange: (string[]) => void
 * - max:    maximum number of images (default 10)
 * - maxFileSizeMB: per-file size limit before compression (default 10)
 */
const ImageMultiUpload = ({
  value = [],
  onChange,
  testid = "image-multi-upload",
  label,
  max = 10,
  maxFileSizeMB = 10,
}) => {
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const images = Array.isArray(value) ? value : [];

  const handleFiles = async (filesList) => {
    if (!filesList || filesList.length === 0) return;
    setErr("");
    const files = Array.from(filesList);
    const remaining = max - images.length;
    if (remaining <= 0) {
      setErr(`Maximum ${max} images.`);
      return;
    }
    const toProcess = files.slice(0, remaining);
    setBusy(true);
    try {
      const next = [...images];
      for (const f of toProcess) {
        if (!f.type.startsWith("image/")) {
          setErr("Un fichier ignoré (format invalide).");
          continue;
        }
        if (f.size > maxFileSizeMB * 1024 * 1024) {
          setErr(`Une image dépasse ${maxFileSizeMB} Mo, ignorée.`);
          continue;
        }
        const b64 = await fileToCompressedBase64(f, 900, 0.72);
        next.push(b64);
      }
      onChange(next.slice(0, max));
    } catch (e) {
      setErr("Erreur de lecture d'une image.");
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  };

  const removeAt = (idx) => {
    const next = images.filter((_, i) => i !== idx);
    onChange(next);
  };

  return (
    <div data-testid={`${testid}-root`}>
      {label && (
        <label className="font-mono-label text-[10px] text-slate-400 block mb-2">
          {label}{" "}
          <span className="text-slate-600">
            ({images.length}/{max})
          </span>
        </label>
      )}

      {images.length > 0 && (
        <div
          className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3"
          data-testid={`${testid}-thumbs`}
        >
          {images.map((src, i) => (
            <div
              key={i}
              className="relative aspect-square border border-white/10 rounded-sm overflow-hidden bg-ink-950"
              data-testid={`${testid}-thumb-${i}`}
            >
              <img
                src={src}
                alt={`#${i + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeAt(i)}
                data-testid={`${testid}-remove-${i}`}
                className="absolute top-1 right-1 bg-ink-950/85 border border-white/20 hover:border-red-500/60 p-1 rounded-sm"
                aria-label="Retirer"
              >
                <X size={11} />
              </button>
              <div className="absolute bottom-1 left-1 font-mono-label text-[9px] text-white/80 bg-ink-950/70 px-1 rounded-sm">
                {i + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length < max && (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={busy}
          data-testid={testid}
          className="w-full border border-dashed border-white/15 hover:border-brand/50 transition-colors p-5 rounded-sm flex flex-col items-center gap-1.5 text-slate-400 hover:text-white disabled:opacity-50"
        >
          {busy ? (
            <div className="font-mono-label text-xs">Compression…</div>
          ) : (
            <>
              {images.length === 0 ? <Upload size={18} /> : <Plus size={18} />}
              <div className="font-mono-label text-[10px]">
                {images.length === 0
                  ? "Cliquer pour importer des images"
                  : "Ajouter une image"}
              </div>
              <div className="text-[10px] text-slate-600">
                JPG · PNG · WEBP — jusqu'à {max} images (max {maxFileSizeMB} Mo)
              </div>
            </>
          )}
        </button>
      )}

      <input
        ref={ref}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
        data-testid={`${testid}-input`}
      />
      {err && <div className="text-xs text-red-400 mt-2">{err}</div>}
    </div>
  );
};

export default ImageMultiUpload;
