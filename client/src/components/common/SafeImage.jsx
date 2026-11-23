import { useEffect, useState } from "react";
import { Package } from "lucide-react";

export default function SafeImage({
  src,
  alt = "Product image",
  className = "",
  fallbackClassName = "",
  fallbackSize = 50,
  ...imageProps
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex h-full w-full items-center justify-center ${fallbackClassName}`}
      >
        <Package size={fallbackSize} strokeWidth={1.2} className="text-[#b9c3ba]" />
      </div>
    );
  }

  return (
    <img
      {...imageProps}
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
