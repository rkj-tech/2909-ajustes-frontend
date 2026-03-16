"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface BannerSlide {
  id: string;
  image: string;
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
}

const slides: BannerSlide[] = [
  {
    id: "1",
    image: "/banners/prefeitura-resolve.png",
    title: "Baixe o App\nPhizChat",
    description:
      "Navegue no universo PhizChat e resolva suas demandas de forma rápida e fácil.",
    ctaText: "Baixar App",
    ctaLink: "/phiz",
  },
  {
    id: "2",
    image: "/banners/poda-de-arvore.png",
    title: "Prefeitura\nna Sua Casa",
    description:
      "Agora você pode resolver diversas demandas sem sair de casa, pelo computador ou celular.",
    ctaText: "Ver serviços",
    ctaLink: "/",
  },
  {
    id: "3",
    image: "/banners/buraco-na-rua.png",
    title: "IPTU\n2026",
    description:
      "Aproveite os descontos para pagamento antecipado do IPTU de Belford Roxo.",
    ctaText: "Acessar IPTU",
    ctaLink: "https://e-gov.prefeituradebelfordroxo.rj.gov.br/",
  },
];

export default function Banner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevSlide = () => {
    goToSlide(currentSlide === 0 ? slides.length - 1 : currentSlide - 1);
  };

  const nextSlide = () => {
    goToSlide((currentSlide + 1) % slides.length);
  };

  const slide = slides[currentSlide];

  return (
    <div className="relative overflow-hidden rounded-xl shadow-lg">
      <div className="relative text-white h-[320px] md:h-[380px] flex items-center transition-all duration-500">
        {/* Background image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={slide.image}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Blue gradient overlay — left half only, matching the reference images */}
        <div
          className="absolute inset-y-0 left-0 w-[55%] md:w-[50%]"
          style={{
            background:
              "linear-gradient(to right, rgba(18, 50, 120, 0.95) 0%, rgba(18, 50, 120, 0.85) 65%, transparent 100%)",
          }}
        />

        {/* Text content — matching Rectangle 1/2/3 layout */}
        <div className="relative z-10 flex flex-col justify-center gap-5 px-8 md:px-10 py-8 max-w-[50%] md:max-w-[45%] h-full">
          {/* Big bold title */}
          <h2 className="text-3xl md:text-4xl lg:text-[2.8rem] font-extrabold leading-[1.1] whitespace-pre-line drop-shadow-md">
            {slide.title}
          </h2>

          {/* Accent bar + description */}
          <div className="flex items-start gap-3">
            <div className="w-[3px] self-stretch rounded-full bg-cyan-400 shrink-0" />
            <p className="text-sm md:text-base lg:text-lg font-semibold leading-snug text-white/95">
              {slide.description}
            </p>
          </div>

          {/* CTA button */}
          <div>
            <Link
              href={slide.ctaLink}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white font-bold rounded-lg hover:bg-gray-100 transition-colors shadow-md text-sm"
              style={{ color: "#1748ae" }}
            >
              {slide.ctaText}
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation controls */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-black/20 hover:bg-black/40 rounded-full flex items-center justify-center text-white transition-colors backdrop-blur-sm cursor-pointer"
        aria-label="Slide anterior"
        type="button"
      >
        <ChevronLeft size={26} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-black/20 hover:bg-black/40 rounded-full flex items-center justify-center text-white transition-colors backdrop-blur-sm cursor-pointer"
        aria-label="Próximo slide"
        type="button"
      >
        <ChevronRight size={26} />
      </button>

      {/* Slide indicators */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((s, index) => (
          <button
            key={s.id}
            onClick={() => goToSlide(index)}
            type="button"
            className={`h-2.5 rounded-full transition-all cursor-pointer ${
              index === currentSlide
                ? "bg-white w-7"
                : "bg-white/50 w-2.5 hover:bg-white/70"
            }`}
            aria-label={`Ir para slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
