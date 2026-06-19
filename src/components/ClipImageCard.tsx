"use client";
import { motion, MotionValue, useMotionValueEvent } from "motion/react";
import Image, { StaticImageData } from "next/image";
import { CSSProperties, ReactNode, useState } from "react";
import AnimatedMaskText from "./MaskTextClient";
import ClipImageContainer from "./ClipImageContainer";
import SectionTitle from "./SectionTitle";
import cn from "@/utils/cn";
import { AnimatePresence } from "motion/react";

interface ClipImageCardProps {
  scrollYProgress: MotionValue<number>;
  images: StaticImageData[];
  className?: string;
  style?: CSSProperties;
}

interface DataItem {
  num: string;
  title: ReactNode[];
  keywords: string;
  colorClass: string;
  effects: string[];
}

export default function ClipImageCard({
  scrollYProgress,
  images,
  className,
  style,
}: ClipImageCardProps) {
  const [currentState, setCurrentState] = useState(1);

  const data: DataItem[] = [
    {
      num: "01",
      title: [<>Hotels &</>, <>Hospitality</>],
      keywords: "Comfort • Relaxation • Luxury • Lasting Memories",
      colorClass: "text-purple-700",
      effects: [
        "Amygdala — Emotional Comfort",
        "Hippocampus — Memory Formation",
        "Orbitofrontal Cortex — Luxury Perception",
      ],
    },
    {
      num: "02",
      title: [<>Corporate</>, <>Offices</>],
      keywords: "Focus • Productivity • Stress Reduction • Clarity",
      colorClass: "text-emerald-700",
      effects: [
        "Prefrontal Cortex — Enhanced Focus",
        "Amygdala — Stress Alleviation",
        "Temporal Lobe — Cognitive Endurance",
      ],
    },
    {
      num: "03",
      title: [<>Luxury</>, <>Retail</>],
      keywords: "Brand Affinity • Engagement • Dwell Time • Ambience",
      colorClass: "text-orange-700",
      effects: [
        "Amygdala — Positive Affect",
        "Hippocampus — Brand Association",
        "Striatum — Reward Processing",
      ],
    },
  ];

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    // 3 slides, so 2 midpoints: 0.25 and 0.75
    if (latest < 0.25) {
      setCurrentState(1);
    } else if (latest <= 0.75) {
      setCurrentState(2);
    } else {
      setCurrentState(3);
    }
  });

  const prependZero = (num: number) => (num < 10 ? `0${num}` : `${num}`);

  return (
    <motion.div
      initial="initial"
      whileInView="inView"
      viewport={{ amount: 0.5, once: true }}
      style={{ ...style }}
      className={cn(
        "relative z-10 flex h-full flex-col items-center justify-between py-[8vh] text-[#d1ccbf] backdrop-brightness-[60%] md:flex-row md:px-16 md:py-[15vh]",
        className,
      )}
    >
      <SectionTitle className="">Scent Experience</SectionTitle>

      <motion.div
        variants={{
          initial: { y: "50%" },
          inView: { y: "0%" },
        }}
        transition={{
          ease: [0.24, 0.43, 0.15, 0.97],
          duration: 0.8,
        }}
        className="relative z-20 my-[5vh] flex h-[82vh] min-h-fit w-[90%] flex-col items-center justify-between bg-[#D1CCBF] p-6 text-[#2B3530] md:h-full md:max-h-[85vh] md:w-full md:max-w-118 md:px-8 md:py-6 rounded-md shadow-2xl"
      >
        <div className="flex items-center gap-1 text-2xs md:text-sm font-mono font-medium">
          <AnimatedMaskText
            state={currentState}
            lines={[<>{prependZero(currentState)}</>]}
            className="[line-height:1]"
          />
          <span className="opacity-60">-</span>
          <span className="opacity-60">{prependZero(images.length)}</span>
        </div>

        <AnimatedMaskText
          state={currentState}
          lines={data[currentState - 1].title}
          className="-space-y-1 text-center text-[1.65rem] [line-height:1.1] font-bold md:text-[2.2rem] tracking-tight uppercase"
        />

        <div className="relative aspect-[1.62] w-full overflow-hidden md:aspect-[1.85] border border-black/5 rounded-sm my-3">
          {images.map((eachImage: StaticImageData, index: number) => (
            <ClipImageContainer
              key={"card-image-container-" + (index + 1)}
              index={index}
              scrollYProgress={scrollYProgress}
            >
              <Image
                src={eachImage}
                alt={"card-image-" + (index + 1)}
                className="size-full object-cover"
              />
            </ClipImageContainer>
          ))}
        </div>

        <div className="w-full flex flex-col items-center gap-2">
          {/* Keywords */}
          <div className="h-10 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={currentState}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className={cn("text-center font-cormorant italic text-sm md:text-base font-semibold leading-snug", data[currentState - 1].colorClass)}
              >
                {data[currentState - 1].keywords}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Neurological Activation List */}
          <div className="w-full border-t border-black/10 pt-3 flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-[0.15em] text-black/50 mb-2 font-semibold">
              Neurological Activation
            </span>
            <div className="h-20 flex flex-col justify-start">
              <AnimatePresence mode="wait">
                <motion.ul
                  key={currentState}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col gap-1.5"
                >
                  {data[currentState - 1].effects.map((effect, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-2 text-xs md:text-sm font-sans text-black/80 font-light justify-center"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-black/20 shrink-0"></span>
                      <span className="leading-tight text-center">{effect}</span>
                    </li>
                  ))}
                </motion.ul>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>

      <span className="text-base [line-height:1] md:text-xl font-light">
        ( Keep Scrolling ){" "}
      </span>
    </motion.div>
  );
}
