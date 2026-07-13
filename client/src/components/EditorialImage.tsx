type EditorialImageProps = {
  src: string;
  alt: string;
  creditName: string;
  creditUrl: string;
  className?: string;
  imageClassName?: string;
  eager?: boolean;
};

export function EditorialImage({
  src,
  alt,
  creditName,
  creditUrl,
  className = "",
  imageClassName = "",
  eager = false,
}: EditorialImageProps) {
  return (
    <figure data-source-url={creditUrl} className={`group relative overflow-hidden bg-slate-900 ${className}`}>
      <img
        src={src}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        className={`h-full w-full object-cover transition duration-700 group-hover:scale-[1.025] ${imageClassName}`}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
      <figcaption className="absolute bottom-2.5 right-3 text-[10px] text-white/65">
        Photo by {creditName} / Unsplash
      </figcaption>
    </figure>
  );
}
