"use client";
import React, { useRef, useState } from "react";
import Image, { StaticImageData } from "next/image";
import Image1 from "../../public/assets/hotel_lobby.jpg";
import Image2 from "../../public/assets/office_lobby.jpg";
import Image3 from "../../public/assets/retail_lobby.jpg";
import {
  motion,
  MotionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "motion/react";
import ClipImageCard from "./ClipImageCard";
import useMaskImage from "@/hooks/useMaskImage";
import CustomCursor from "./Cursor";
import { useCursor } from "@/hooks/useCursor";
import NavigateSVG from "@/components/SVGComponents/NavigateSVG";
import { cubicBezier } from "motion";
import { useIsMobile } from "@/app/providers";

function Innovation() {
  const isMobile = useIsMobile();
  const [state, setState] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const { handlers, cursorProps } = useCursor();

  const { scrollYProgress: parentProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(parentProgress, "change", (latest) => {
    if (latest <= 0.5) {
      setState(0);
    } else {
      setState(1);
    }
  });

  const imgs = [Image1, Image2, Image3];

  return (
    <div
      className="relative z-20 h-[300vh] cursor-pointer overflow-clip bg-[#2b3530] select-none"
      style={{ marginTop: "500vh" }}
      ref={ref}
    >
      <motion.div
        {...handlers}
        className="sticky -top-[5vh] h-[110vh] md:top-0 md:h-[100vh]"
      >
        <ClipImageCard
          scrollYProgress={parentProgress}
          images={imgs}
          className="relative z-10"
        />
        {Array.from({ length: 2 }, (_, i) => state + i)
          .filter((elementIndex) => elementIndex < imgs.length)
          .map((validElementIndex, i) => {
            return (
              <Innovation.Container
                key={"Innovation.Container-" + (i + 1)}
                isMobile={isMobile}
                scrollYProgress={parentProgress}
                index={validElementIndex}
              >
                {imgs[validElementIndex]}
              </Innovation.Container>
            );
          })}
      </motion.div>
      {!isMobile && (
        <CustomCursor
          {...cursorProps}
          className="flex -translate-x-1/2 translate-y-1/4 items-center justify-center gap-2 rounded-full px-5 py-2 text-white"
        >
          Discover More
          <NavigateSVG style={{ fill: "white" }} className="size-2.5" />
        </CustomCursor>
      )}
    </div>
  );
}

Innovation.Container = function Container({
  scrollYProgress,
  index,
  children,
  isMobile,
}: {
  scrollYProgress: MotionValue<number>;
  index: number;
  children: StaticImageData;
  isMobile: boolean | null;
}) {
  // With 3 images, the transition is split in 2 steps (step size = 0.5)
  const stepSize = 0.5;

  const localScrollYProgress = useTransform(
    scrollYProgress,
    [index * stepSize, (index + 1) * stepSize],
    [0, 1],
    {
      ease: cubicBezier(0, 0, 1, 1),
    },
  );
  const maskImage = useMaskImage(localScrollYProgress, isMobile);
  const scaleProgress = useTransform(
    scrollYProgress,
    [Math.max(0, (index - 1) * stepSize), (index + 1) * stepSize],
    [1.075, 1],
  );
  return (
    <motion.div
      className="absolute inset-0 grid place-items-center text-white"
      style={{ zIndex: -index, maskImage, scale: scaleProgress }}
    >
      <Image
        src={children}
        alt={`image-${index + 1}`}
        className="h-full w-full origin-bottom object-cover"
      />
    </motion.div>
  );
};

export default Innovation;
