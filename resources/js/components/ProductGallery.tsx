import React, { useState } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails'
import 'yet-another-react-lightbox/styles.css'
import 'yet-another-react-lightbox/plugins/thumbnails.css'

interface Image {
  id: number
  path: string
  is_primary: boolean
}

interface Props {
  images: Image[]
  productName: string
}

export default function ProductGallery({ images, productName }: Props) {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)

  const slides = images.map(img => ({
    src: `/storage/${img.path}`,
    alt: productName,
  }))

  return (
    <div className="max-w-[600px] mx-auto">
   {/* Image principale */}
<img
  src={slides[index]?.src}
  alt={productName}
  className="w-full h-[400px] object-contain cursor-pointer rounded-lg"
  onClick={() => setOpen(true)}
/>

{/* Séparateur */}
<hr className="my-4 border-gray-300" />

{/* Miniatures sous l'image principale */}
<div className="flex gap-2 overflow-x-auto justify-center">
  {slides.map((slide, i) => (
    <img
      key={i}
      src={slide.src}
      alt={slide.alt}
      onClick={() => setIndex(i)}
      className={`h-16 w-20 object-cover rounded cursor-pointer border-2 ${
        i === index
          ? 'border-blue-500'
          : 'border-transparent hover:border-gray-300'
      }`}
    />
  ))}
</div>



      {/* Lightbox fullscreen */}
      <Lightbox
        open={open}
        close={() => setOpen(false)}
        slides={slides}
        plugins={[Thumbnails]}
        thumbnails={{ vignetteHeight: 80, vignetteWidth: 100 }}
        index={index}
        onIndexChange={setIndex}
        styles={{
          container: { backgroundColor: 'rgba(0,0,0,0.9)' },
          slide: { borderRadius: 8 },
        }}
      />
    </div>
  )
}
