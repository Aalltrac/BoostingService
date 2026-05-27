import { useState } from "react";
import { ChevronLeft, ChevronRight, Image as ImageIcon, X } from "lucide-react";

/**
 * Image carousel with optional lightbox.
 * - images: string[]   (base64 or URLs)
 * - aspect: tailwind class for ratio (default "aspect-video")
 * - allowLightbox: boolean (default true)
 */
const ImageCarousel = ({
  images = [],
  aspect = "aspect-video",
  allowLightbox = true,
  testid = "carousel",
  badge,
}) => {
  const [idx, setIdx] = useState(0);
  const [lightbox, setLightbox] = useState(null);
  const list = Array.isArray(images) ? images.filter(Boolean) : [];
  const has = list.length > 0;
  const current = has ? list[Math.min(idx, list.length - 1)] : null;

  const prev = (e) => {
    e?.stopPropagation?.();
    setIdx((i) => (i - 1 + list.length) % list.length);
  };
  const next = (e) => {
    e?.stopPropagation?.();
    setIdx((i) => (i + 1) % list.length);
  };

  return (
    <div data-testid={`${testid}-root`}>
      <div
        className={`relative ${aspect} bg-ink-700 overflow-hidden rounded-sm border border-white/10`}
      >
        {has ? (
          <button
            type="button"
            onClick={() => allowLightbox && setLightbox(current)}
            data-testid={`${testid}-image`}
            className="block w-full h-full cursor-zoom-in"
          >
            <img
              src={current}
              alt={`Image ${idx + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-700">
            <ImageIcon className="w-10 h-10" />
          </div>
        )}

        {badge && (
          <div className="absolute top-3 left-3 bg-ink-900/90 backdrop-blur-sm border border-white/10 px-2.5 py-1 rounded-sm">
            <span className="font-mono-label text-[10px] text-brand">{badge}</span>
          </div>
        )}

        {list.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Image précédente"
              data-testid={`${testid}-prev`}
              className="absolute top-1/2 left-2 -translate-y-1/2 bg-ink-950/80 hover:bg-ink-950 border border-white/15 hover:border-brand/60 text-white p-1.5 rounded-sm transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Image suivante"
              data-testid={`${testid}-next`}
              className="absolute top-1/2 right-2 -translate-y-1/2 bg-ink-950/80 hover:bg-ink-950 border border-white/15 hover:border-brand/60 text-white p-1.5 rounded-sm transition-colors"
            >
              <ChevronRight size={16} />
            </button>
            <div className="absolute bottom-2 right-2 bg-ink-950/80 border border-white/10 font-mono-label text-[10px] text-white/80 px-2 py-0.5 rounded-sm">
              {idx + 1}/{list.length}
            </div>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
              {list.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIdx(i);
                  }}
                  data-testid={`${testid}-dot-${i}`}
                  aria-label={`Aller à l'image ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    i === idx
                      ? "bg-brand w-4"
                      : "bg-white/30 w-1.5 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {list.length > 1 && (
        <div
          className="mt-3 flex gap-2 overflow-x-auto pb-1"
          data-testid={`${testid}-thumbs`}
        >
          {list.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIdx(i)}
              data-testid={`${testid}-thumb-${i}`}
              className={`shrink-0 w-16 h-12 rounded-sm overflow-hidden border transition-all ${
                i === idx
                  ? "border-brand opacity-100"
                  : "border-white/10 opacity-60 hover:opacity-100 hover:border-white/30"
              }`}
            >
              <img
                src={src}
                alt={`Vignette ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {lightbox && (
        <div
          data-testid={`${testid}-lightbox`}
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-50 bg-black/92 flex items-center justify-center p-4 cursor-zoom-out"
        >
          <img
            src={lightbox}
            alt="Aperçu plein écran"
            className="max-h-[92vh] max-w-[92vw] object-contain"
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLightbox(null);
            }}
            className="absolute top-4 right-4 p-2 bg-ink-950/80 border border-white/20 rounded-sm text-white"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageCarousel;
