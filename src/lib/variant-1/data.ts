import type { Perspective } from './types';

export const images = [
  '/widget1.jpg',
  '/widget2.jpg',
  '/widget3.jpg',
  '/widget4.jpg',
  '/widget5.jpg',
  '/widget6.jpg',
  '/widget7.jpg',
  '/widget8.jpg',
  '/widget9.jpg',
  '/widget10.jpg',
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
