<template>
  <span
    class="minecraft-player-model"
    :class="{
      'is-idle': props.activity === 'idle',
      'is-wave': props.activity === 'wave',
      'is-walk': props.activity === 'walk',
      'is-jump': props.activity === 'jump',
      'is-cheer': props.activity === 'cheer',
      'is-point': props.activity === 'point',
    }"
    aria-hidden="true"
  >
    <span class="minecraft-player-model__stage">
      <span
        v-for="part in playerParts"
        :key="`${part.key}-${part.layer ? 'outer' : 'base'}`"
        class="minecraft-player-model__part"
        :class="[`minecraft-player-model__part--${part.key}`, { 'is-outer-layer': part.layer }]"
        :style="partStyle(part)"
      >
        <span
          v-for="face in part.faces"
          :key="face.name"
          class="minecraft-player-model__face"
          :class="`minecraft-player-model__face--${face.name}`"
          :style="faceStyle(part, face)"
        ></span>
      </span>
    </span>
  </span>
</template>

<script setup lang="ts">
import type { CSSProperties } from 'vue'

type FaceName = 'front' | 'back' | 'right' | 'left' | 'top' | 'bottom'

interface SkinFace {
  name: FaceName
  uvX: number
  uvY: number
}

interface SkinPart {
  key: 'head' | 'body' | 'right-arm' | 'left-arm' | 'right-leg' | 'left-leg'
  width: number
  height: number
  depth: number
  x: number
  y: number
  z: number
  layer?: boolean
  faces: SkinFace[]
}

const props = withDefaults(
  defineProps<{
    activity?: 'idle' | 'wave' | 'walk' | 'jump' | 'cheer' | 'point'
  }>(),
  { activity: 'idle' },
)

const face = (name: FaceName, uvX: number, uvY: number): SkinFace => ({ name, uvX, uvY })

const boxFaces = (coordinates: Record<FaceName, [number, number]>) =>
  (Object.entries(coordinates) as [FaceName, [number, number]][]).map(([name, [uvX, uvY]]) =>
    face(name, uvX, uvY),
  )

const createPart = (
  part: Omit<SkinPart, 'faces'> & { coordinates: Record<FaceName, [number, number]> },
): SkinPart => ({
  ...part,
  faces: boxFaces(part.coordinates),
})

const baseParts: SkinPart[] = [
  createPart({
    key: 'head',
    width: 8,
    height: 8,
    depth: 8,
    x: 0,
    y: 0,
    z: 0,
    coordinates: {
      top: [8, 0],
      bottom: [16, 0],
      right: [0, 8],
      front: [8, 8],
      left: [16, 8],
      back: [24, 8],
    },
  }),
  createPart({
    key: 'body',
    width: 8,
    height: 12,
    depth: 4,
    x: 0,
    y: 8,
    z: 0,
    coordinates: {
      top: [20, 16],
      bottom: [28, 16],
      right: [16, 20],
      front: [20, 20],
      left: [28, 20],
      back: [32, 20],
    },
  }),
  createPart({
    key: 'right-arm',
    width: 4,
    height: 12,
    depth: 4,
    x: 6,
    y: 8,
    z: 0,
    coordinates: {
      top: [44, 16],
      bottom: [48, 16],
      right: [40, 20],
      front: [44, 20],
      left: [48, 20],
      back: [52, 20],
    },
  }),
  createPart({
    key: 'left-arm',
    width: 4,
    height: 12,
    depth: 4,
    x: -6,
    y: 8,
    z: 0,
    coordinates: {
      top: [36, 48],
      bottom: [40, 48],
      right: [32, 52],
      front: [36, 52],
      left: [40, 52],
      back: [44, 52],
    },
  }),
  createPart({
    key: 'right-leg',
    width: 4,
    height: 12,
    depth: 4,
    x: 2,
    y: 20,
    z: 0,
    coordinates: {
      top: [4, 16],
      bottom: [8, 16],
      right: [0, 20],
      front: [4, 20],
      left: [8, 20],
      back: [12, 20],
    },
  }),
  createPart({
    key: 'left-leg',
    width: 4,
    height: 12,
    depth: 4,
    x: -2,
    y: 20,
    z: 0,
    coordinates: {
      top: [20, 48],
      bottom: [24, 48],
      right: [16, 52],
      front: [20, 52],
      left: [24, 52],
      back: [28, 52],
    },
  }),
]

const outerParts: SkinPart[] = [
  createPart({
    key: 'head',
    width: 8.5,
    height: 8.5,
    depth: 8.5,
    x: 0,
    y: -0.25,
    z: 0,
    layer: true,
    coordinates: {
      top: [40, 0],
      bottom: [48, 0],
      right: [32, 8],
      front: [40, 8],
      left: [48, 8],
      back: [56, 8],
    },
  }),
  createPart({
    key: 'body',
    width: 8.5,
    height: 12.5,
    depth: 4.5,
    x: 0,
    y: 7.75,
    z: 0,
    layer: true,
    coordinates: {
      top: [20, 32],
      bottom: [28, 32],
      right: [16, 36],
      front: [20, 36],
      left: [28, 36],
      back: [32, 36],
    },
  }),
  createPart({
    key: 'right-arm',
    width: 4.5,
    height: 12.5,
    depth: 4.5,
    x: 6,
    y: 7.75,
    z: 0,
    layer: true,
    coordinates: {
      top: [44, 32],
      bottom: [48, 32],
      right: [40, 36],
      front: [44, 36],
      left: [48, 36],
      back: [52, 36],
    },
  }),
  createPart({
    key: 'left-arm',
    width: 4.5,
    height: 12.5,
    depth: 4.5,
    x: -6,
    y: 7.75,
    z: 0,
    layer: true,
    coordinates: {
      top: [52, 48],
      bottom: [56, 48],
      right: [48, 52],
      front: [52, 52],
      left: [56, 52],
      back: [60, 52],
    },
  }),
  createPart({
    key: 'right-leg',
    width: 4.5,
    height: 12.5,
    depth: 4.5,
    x: 2,
    y: 19.75,
    z: 0,
    layer: true,
    coordinates: {
      top: [4, 32],
      bottom: [8, 32],
      right: [0, 36],
      front: [4, 36],
      left: [8, 36],
      back: [12, 36],
    },
  }),
  createPart({
    key: 'left-leg',
    width: 4.5,
    height: 12.5,
    depth: 4.5,
    x: -2,
    y: 19.75,
    z: 0,
    layer: true,
    coordinates: {
      top: [4, 48],
      bottom: [8, 48],
      right: [0, 52],
      front: [4, 52],
      left: [8, 52],
      back: [12, 52],
    },
  }),
]

const playerParts = [...baseParts, ...outerParts]

function partStyle(part: SkinPart): CSSProperties {
  return {
    '--part-width': `${part.width}`,
    '--part-height': `${part.height}`,
    '--part-depth': `${part.depth}`,
    '--part-x': `${part.x}`,
    '--part-y': `${part.y}`,
    '--part-z': `${part.z}`,
  } as CSSProperties
}

function faceStyle(part: SkinPart, skinFace: SkinFace): CSSProperties {
  const width = ['top', 'bottom', 'front', 'back'].includes(skinFace.name) ? part.width : part.depth
  const height = ['top', 'bottom'].includes(skinFace.name) ? part.depth : part.height

  return {
    '--face-width': `${width}`,
    '--face-height': `${height}`,
    '--uv-x': `${skinFace.uvX}`,
    '--uv-y': `${skinFace.uvY}`,
  } as CSSProperties
}
</script>

<style scoped>
.minecraft-player-model {
  --skin-pixel: 3.35px;
  display: block;
  width: 6rem;
  height: 8.8rem;
  pointer-events: none;
  filter: drop-shadow(1px 1.5px 0 rgb(15 23 42 / 0.18)) drop-shadow(0 0 1px rgb(15 23 42 / 0.14));
}

.minecraft-player-model__stage {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  perspective: 360px;
  transform-style: preserve-3d;
}

.minecraft-player-model__stage::before {
  position: absolute;
  inset: 0.7rem 0.25rem 0.45rem;
  content: '';
  background: radial-gradient(ellipse, rgb(15 23 42 / 0.23), transparent 68%);
  filter: blur(3px);
  opacity: 0.62;
  transform: translateY(1.2rem) rotateX(70deg);
}

.minecraft-player-model__part {
  position: absolute;
  top: 0;
  left: 50%;
  display: block;
  width: calc(var(--part-width) * var(--skin-pixel));
  height: calc(var(--part-height) * var(--skin-pixel));
  margin-top: calc(var(--part-height) * var(--skin-pixel) * -0.5);
  margin-left: calc(var(--part-width) * var(--skin-pixel) * -0.5);
  --part-transform: translate3d(
    calc(var(--part-x) * var(--skin-pixel)),
    calc((var(--part-y) + var(--part-height) / 2) * var(--skin-pixel)),
    calc(var(--part-z) * var(--skin-pixel))
  );
  transform: var(--part-transform);
  transform-origin: center top;
  transform-style: preserve-3d;
}

.minecraft-player-model__part.is-outer-layer {
  z-index: 2;
}

.minecraft-player-model__face {
  position: absolute;
  display: block;
  width: calc(var(--face-width) * var(--skin-pixel));
  height: calc(var(--face-height) * var(--skin-pixel));
  background-image: url('/imgs/wulian233.png');
  background-repeat: no-repeat;
  background-size: calc(64 * var(--skin-pixel)) calc(64 * var(--skin-pixel));
  background-position: calc(var(--uv-x) * var(--skin-pixel) * -1)
    calc(var(--uv-y) * var(--skin-pixel) * -1);
  image-rendering: pixelated;
  backface-visibility: hidden;
}

.minecraft-player-model__face--front,
.minecraft-player-model__face--back {
  top: 50%;
  left: 50%;
  margin-top: calc(var(--face-height) * var(--skin-pixel) * -0.5);
  margin-left: calc(var(--face-width) * var(--skin-pixel) * -0.5);
}

.minecraft-player-model__face--front {
  transform: translateZ(calc(var(--part-depth) * var(--skin-pixel) / 2));
}

.minecraft-player-model__face--back {
  transform: rotateY(180deg) translateZ(calc(var(--part-depth) * var(--skin-pixel) / 2));
}

.minecraft-player-model__face--right,
.minecraft-player-model__face--left {
  top: 50%;
  left: 50%;
  margin-top: calc(var(--face-height) * var(--skin-pixel) * -0.5);
  margin-left: calc(var(--face-width) * var(--skin-pixel) * -0.5);
}

.minecraft-player-model__face--right {
  transform: rotateY(90deg) translateZ(calc(var(--part-width) * var(--skin-pixel) / 2));
}

.minecraft-player-model__face--left {
  transform: rotateY(-90deg) translateZ(calc(var(--part-width) * var(--skin-pixel) / 2));
}

.minecraft-player-model__face--top,
.minecraft-player-model__face--bottom {
  top: 50%;
  left: 50%;
  margin-top: calc(var(--face-height) * var(--skin-pixel) * -0.5);
  margin-left: calc(var(--face-width) * var(--skin-pixel) * -0.5);
}

.minecraft-player-model__face--top {
  transform: rotateX(90deg) translateZ(calc(var(--part-height) * var(--skin-pixel) / 2));
}

.minecraft-player-model__face--bottom {
  transform: rotateX(-90deg) translateZ(calc(var(--part-height) * var(--skin-pixel) / 2));
}

.minecraft-player-model.is-idle .minecraft-player-model__stage,
.minecraft-player-model.is-walk .minecraft-player-model__stage,
.minecraft-player-model.is-jump .minecraft-player-model__stage,
.minecraft-player-model.is-cheer .minecraft-player-model__stage {
  --bob-y: -1px;
  --bob-yaw: -12deg;
  animation: minecraft-player-bob 1.2s ease-in-out 1 both;
}

.minecraft-player-model.is-idle .minecraft-player-model__stage {
  animation-iteration-count: infinite;
  animation-duration: 3.6s;
}

.minecraft-player-model.is-walk .minecraft-player-model__stage {
  --bob-y: -2px;
  --bob-yaw: -14deg;
  animation-duration: 2.6s;
}

.minecraft-player-model.is-jump .minecraft-player-model__stage {
  --bob-y: -7px;
  --bob-yaw: 8deg;
}

.minecraft-player-model.is-cheer .minecraft-player-model__stage {
  --bob-y: -3px;
  --bob-yaw: 5deg;
}

.minecraft-player-model.is-wave .minecraft-player-model__part--left-arm {
  --limb-start: rotateZ(8deg);
  --limb-end: rotateZ(140deg);
  animation: minecraft-player-limb 1.35s ease-in-out 1 both;
}

.minecraft-player-model.is-walk .minecraft-player-model__part--right-arm,
.minecraft-player-model.is-walk .minecraft-player-model__part--left-leg {
  --limb-start: rotateX(26deg) rotateZ(18deg);
  --limb-end: rotateX(-26deg) rotateZ(-18deg);
  animation: minecraft-player-limb 0.65s linear 4 both;
}

.minecraft-player-model.is-walk .minecraft-player-model__part--left-arm,
.minecraft-player-model.is-walk .minecraft-player-model__part--right-leg {
  --limb-start: rotateX(-26deg) rotateZ(-18deg);
  --limb-end: rotateX(26deg) rotateZ(18deg);
  animation: minecraft-player-limb 0.65s linear 4 both;
}

.minecraft-player-model.is-point .minecraft-player-model__part--right-arm {
  --limb-start: rotateZ(-8deg);
  --limb-end: rotateZ(-78deg);
  animation: minecraft-player-limb 1.5s ease-in-out 1 both;
}

.minecraft-player-model.is-cheer .minecraft-player-model__part--right-arm {
  --limb-start: rotateZ(-8deg);
  --limb-end: rotateZ(-132deg);
  animation: minecraft-player-limb 1.2s ease-in-out 1 both;
}

.minecraft-player-model.is-cheer .minecraft-player-model__part--left-arm {
  --limb-start: rotateZ(8deg);
  --limb-end: rotateZ(132deg);
  animation: minecraft-player-limb 1.2s ease-in-out 1 both;
}

@keyframes minecraft-player-bob {
  0%,
  100% {
    transform: translateY(0) rotateY(-12deg) rotateX(1deg);
  }

  50% {
    transform: translateY(var(--bob-y)) rotateY(var(--bob-yaw)) rotateX(1deg);
  }
}

@keyframes minecraft-player-limb {
  0%,
  100% {
    transform: var(--part-transform) var(--limb-start);
  }

  50% {
    transform: var(--part-transform) var(--limb-end);
  }
}

@media (max-width: 640px) {
  .minecraft-player-model {
    --skin-pixel: 2.95px;
    width: 5.5rem;
    height: 8rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .minecraft-player-model__stage,
  .minecraft-player-model__part {
    animation: none !important;
  }
}
</style>
