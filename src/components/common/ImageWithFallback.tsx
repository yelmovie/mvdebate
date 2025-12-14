"use client";

import { useState, useEffect } from "react";
import Image, { ImageProps } from "next/image";
import { CommonIcons } from "../../lib/icons";

interface Props extends ImageProps {
  fallbackSrc?: string;
  fallbackIcon?: React.ElementType; // Icon to show if no fallback image
}

export default function ImageWithFallback({ 
  src, 
  alt, 
  fallbackSrc = "/images/logo/profile.png", 
  fallbackIcon,
  ...props 
}: Props) {
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [src]);

  if (error) {
    if (fallbackIcon) {
        const Icon = fallbackIcon;
        return (
            <div style={{ 
                width: props.width || "100%", 
                height: props.height || "100%", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                background: "#f3f4f6", 
                borderRadius: props.style?.borderRadius || "8px"
            }}>
                <Icon size={24} color="#9ca3af" />
            </div>
        );
    }
    // Fallback to default image (ensure it's a valid path, or loop might occur if fallback also fails)
    return <img src={fallbackSrc} alt={alt} {...props as any} onError={(e) => e.currentTarget.style.display='none'} />;
  }

  return (
    <img
      src={src as string}
      alt={alt}
      onError={() => setError(true)}
      {...props as any}
    />
  );
}
