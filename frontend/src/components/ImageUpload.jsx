import { useRef, useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";

// Resize image to max 800px width/height and return base64 JPEG (quality 0.75)
export const fileToCompressedBase64 = (file, maxSize = 800, quality = 0.75) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        if (width > height && width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        } else if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

const ImageUpload = ({ value, onChange, testid = "image-upload", label }) => {
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErr("Format invalide. Utilise une image.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setErr("Image trop lourde (max 8 Mo).");
      return;
    }
    setErr("");
    setBusy(true);
    try {
      const b64 = await fileToCompressedBase64(file);
      onChange(b64);
    } catch (e) {
      setErr("Erreur de lecture de l'image.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      {label && (
        <label className="font-mono-label text-[10px] text-slate-400 block mb-2">{label}</label>
      )}
      {value ? (
        <div className="relative border border-white/10 rounded-sm overflow-hidden bg-ink-950" data-testid={`${testid}-preview`}>
          <img src={value} alt="Aperçu" className="w-full max-h-64 object-contain" />
          <button
            type="button"
            onClick={() => onChange("")}
            data-testid={`${testid}-remove`}
            className="absolute top-2 right-2 bg-ink-950/80 border border-white/20 hover:border-red-500/50 p-1.5 rounded-sm"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={busy}
          data-testid={testid}
          className="w-full border border-dashed border-white/15 hover:border-brand/50 transition-colors p-6 rounded-sm flex flex-col items-center gap-2 text-slate-400 hover:text-white"
        >
          {busy ? (
            <div className="font-mono-label text-xs">Compression…</div>
          ) : (
            <>
              <Upload size={20} />
              <div className="font-mono-label text-[10px]">Cliquer pour importer une image</div>
              <div className="text-[10px] text-slate-600">JPG · PNG · WEBP (max 8 Mo, auto-compressé)</div>
            </>
          )}
        </button>
      )}
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
        data-testid={`${testid}-input`}
      />
      {err && <div className="text-xs text-red-400 mt-2">{err}</div>}
    </div>
  );
};

export default ImageUpload;
