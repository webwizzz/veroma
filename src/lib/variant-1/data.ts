import type { Perspective } from './types';

export const images = [
  '/widget1.png',
  '/widget2.png',
  '/widget3.png',
  '/widget4.png',
  '/widget5.png',
  '/widget6.png',
  '/widget7.jpg',
  '/widget8.png',
  '/widget9.png',
  '/widget10.png',
];

export const perspectives: Perspective[] = [
  {
    title: 'Velvet',
    description: 'Minimalistic luxury design',
    position: 'center',
  },
  {
    title: 'Glass Relay',
    description: 'Refracted translucent interfaces',
    position: 'center',
  },
  {
    title: 'Noir-17',
    description: 'Deep high-contrast aesthetics',
    position: 'center',
  },
  {
    title: 'Driftline',
    description: 'Dynamic flowing layouts',
    position: 'center',
  },
  {
    title: 'Pulse 9',
    description: 'Rhythmic interactive pulses',
    position: 'center',
  },
  {
    title: 'Cold Meridian',
    description: 'Sleek dark-mode grids',
    position: 'center',
  },
  {
    title: 'Astra',
    description: 'Nebula-inspired gradients',
    position: 'center',
  },
  {
    title: 'Mono Circuit',
    description: 'Structured wireframe design',
    position: 'center',
  },
  {
    title: 'Lumen-04',
    description: 'Soft glows and micro-animations',
    position: 'center',
  },
  {
    title: 'Shadow Bloom',
    description: 'Elegant depth and transitions',
    position: 'center',
  },
];

export const cylinderConfig = {
  radius: typeof window !== 'undefined' && window.innerWidth > 768 ? 2.5 : 2.2,
  height: typeof window !== 'undefined' && window.innerWidth > 768 ? 2 : 1.2,
  radialSegments: 64,
  heightSegments: 1,
};

export const particleConfig = {
  numParticles: 12,
  particleRadius: 3.3, // cylinderRadius + 0.8
  segments: 20,
  angleSpan: 0.3,
};

export const imageConfig = {
  width: 1024,
  height: 1024,
};

export const widgets = [
  {
    image: "/widget1.png",
    name: "Velvet Orchid",
    desc: "A rare tropical orchid featuring rich, velvet-textured petals of deep violet. It thrives in high-humidity rainforest environments and releases an exotic, captivating fragrance under the canopy at nightfall."
  },
  {
    image: "/widget2.png",
    name: "Glass Lily",
    desc: "A stunning architectural lily with translucent, crystalline petals that catch and refract natural sunlight. Symbolizing purity and grace, this delicate flower blooms in cool highland waters and glows softly at dawn."
  },
  {
    image: "/widget3.png",
    video: "/musk.mp4",
    name: "Noir Rose",
    desc: "An exceptionally rare obsidian rose cultivated in rich volcanic soil, displaying velvet black petals with subtle crimson undertones. Its deep, mysterious scent is highly prized by perfumers around the globe."
  },
  {
    image: "/widget4.png",
    name: "Driftwood",
    desc: "A wild, rustic peony with soft, ruffled cream petals that appear to drift like silk. Possessing a warm, woody fragrance, it naturally adapts to sandy coastal dunes and rocky shoreline cliffs."
  },
  {
    image: "/widget5.png",
    name: "Pulse Lotus",
    desc: "A magnificent aquatic flower with layered, glowing pink petals that open in sync with solar rays. Celebrated for its rhythmic beauty, it floats gracefully on still ponds and purifies its surrounding ecosystem."
  },
  {
    image: "/widget6.png",
    name: " Hibiscus",
    desc: "A vibrant, fire-hued hibiscus that flourishes along tropical coastlines under intense equatorial heat. Its bold, flared petals and prominent stamen make it a striking emblem of summer warmth and energy."
  },
  {
    image: "/widget7.jpg",
    name: "Astra Tulip",
    desc: "A stellar tulip with deep violet and midnight blue gradients resembling a celestial nebula. This rare cold-tolerant hybrid blooms in early spring, standing tall and resilient against the morning frost."
  },
  {
    image: "/widget8.png",
    name: "Circuit Dahlia",
    desc: "A mathematically perfect dahlia showcasing spiral geometric patterns in its golden-orange petals. This mesmerizing symmetry makes it a prime example of natural sacred geometry in modern botany."
  },
  {
    image: "/widget9.png",
    name: "Lumen Jasmine",
    desc: "Delicate, star-shaped white flowers that release a soothing, sweet aroma under moonlight. Historically revered for its calming properties, it climbs elegant garden trellises with ease."
  },
  {
    image: "/widget10.png",
    name: "Sakura",
    desc: "A mystical dark-purple cherry blossom that uniquely blooms during the cool night hours. Its delicate petals drift softly on the evening breeze, creating a magical, dreamlike atmosphere under the stars."
  },
];

