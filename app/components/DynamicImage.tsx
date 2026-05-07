import { useState } from "react"

type DynamicImageProps = {
  src: string,
  alt?: string,
  className: string,
  priority?: 'high' | 'low' | 'auto',
  style?: React.CSSProperties 
}

export default function DynamicImage({ src, alt, className, priority, style }: DynamicImageProps) {
  const [isSmall, setIsSmall] = useState<boolean>(false)

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    console.log(img.naturalWidth)
    setIsSmall(img.naturalWidth <= 250 || img.naturalHeight <= 250)
  }

  return <img
    src={src}
    alt={alt}
    className={className}
    onLoad={handleImageLoad}
    fetchPriority={priority}
    style={{...style, imageRendering: isSmall ? 'pixelated' : 'auto' }}
  />
}
