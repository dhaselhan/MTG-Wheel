<template>
  <div class="flex flex-col items-center min-h-screen py-8 px-4">
    <div class="mb-8 w-full flex flex-col items-center text-center">
      <div class="text-4xl font-bold text-primary drop-shadow-lg">
        MTG Wheel
      </div>

      <p class="mt-2 text-slate-300">
        Player {{ currentPlayer }} · Pack {{ currentPackForPlayer }} of {{ packsPerPlayer }}
      </p>

      <p class="text-sm text-slate-500">
        {{ modeLabel }}
      </p>
    </div>

    <div class="relative w-full max-w-5xl flex flex-col items-center">
      <div
        ref="carouselViewport"
        class="relative w-full overflow-hidden rounded-2xl border-4 border-primary bg-slate-950/90 shadow-2xl"
      >
        <div class="pointer-events-none absolute left-1/2 top-0 z-20 h-full w-1 -translate-x-1/2 bg-yellow-400 shadow-[0_0_24px_rgba(250,204,21,0.9)]" />

        <div class="pointer-events-none absolute left-1/2 top-0 z-30 -translate-x-1/2 border-l-[18px] border-r-[18px] border-t-[26px] border-l-transparent border-r-transparent border-t-yellow-400" />

        <div class="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-slate-950 to-transparent" />
        <div class="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-slate-950 to-transparent" />

        <div
          class="flex transform-gpu gap-6 px-8 py-10 will-change-transform"
          :class="isSpinning ? 'transition-none' : 'transition-transform duration-500 ease-out'"
          :style="{ transform: `translate3d(${wheelOffset}px, 0, 0)` }"
        >
          <div
            v-for="(pack, idx) in wheelPacks"
            :key="`${pack.code}-${idx}`"
            class="shrink-0 transition-all duration-300"
            :class="!isSpinning && idx === visualSelectedIndex ? 'scale-110 z-10' : 'scale-95 opacity-70'"
          >
            <div
              class="relative flex h-[336px] w-[240px] flex-col justify-between overflow-hidden rounded-xl border shadow-xl"
              :class="!isSpinning && idx === visualSelectedIndex ? 'border-yellow-400 shadow-yellow-400/30' : 'border-slate-700'"
            >
              <div class="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-900 to-black" />
              <div class="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,_white,_transparent_35%)]" />

              <div class="relative z-10 p-4 text-center">
                <div class="rounded-md border border-white/20 bg-black/30 px-2 py-1 text-xs font-bold uppercase tracking-widest text-slate-300">
                  Booster Pack
                </div>
              </div>

              <div class="relative z-10 flex flex-1 flex-col items-center justify-center px-4 text-center">
                <div class="mb-4 flex h-36 w-36 items-center justify-center rounded-full border-4 border-primary/70 bg-black/40 px-3 shadow-lg">
                  <span class="break-all text-center text-4xl font-black leading-none text-white">
                    {{ pack.code }}
                  </span>
                </div>

                <div class="w-full text-center text-xl font-black leading-tight text-white drop-shadow">
                  {{ pack.set }}
                </div>
              </div>

              <div class="relative z-10 border-t border-white/10 bg-black/40 p-3 text-center">
                <div class="text-sm font-semibold text-slate-300">
                  {{ pack.code }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <UButton
        class="mt-8"
        size="xl"
        color="primary"
        icon="i-lucide-rotate-ccw"
        :disabled="isLoadingPacks || isSpinning || availablePacks.length === 0 || isComplete"
        @click="spinWheel"
      >
        {{ spinButtonLabel }}
      </UButton>
    </div>

    <div class="mt-10 w-full max-w-5xl">
      <div class="flex items-center justify-between gap-4">
        <h2 class="text-xl font-bold text-white">
          Picks
        </h2>

        <UButton
          color="neutral"
          variant="soft"
          icon="i-lucide-arrow-left"
          @click="goBack"
        >
          Back
        </UButton>
      </div>

      <div
        v-if="pickedPacks.length"
        class="mt-4 grid gap-4 md:grid-cols-2"
      >
        <div
          v-for="pick in pickedPacks"
          :key="pick.pickNumber"
          class="rounded-xl border border-slate-700 bg-slate-900/70 p-4"
        >
          <div class="text-sm text-slate-400">
            Pick {{ pick.pickNumber }} · Player {{ pick.player }} · Pack {{ pick.packNumber }}
          </div>

          <div class="mt-1 text-lg font-bold text-white">
            {{ pick.pack.set }}
          </div>

          <div class="text-primary font-mono">
            {{ pick.pack.code }}
          </div>
        </div>
      </div>

      <p
        v-else
        class="mt-4 text-slate-400"
      >
        Spin the wheel to start assigning packs.
      </p>

      <div
        v-if="isComplete"
        class="mt-6 rounded-xl border border-green-500/40 bg-green-500/10 p-4 text-green-200"
      >
        Draft setup complete. All players have received {{ packsPerPlayer }} pack(s).
      </div>
    </div>

    <Transition name="pack-modal">
      <div
        v-if="isPackModalOpen && selectedPackModal"
        class="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/80 px-4 py-8 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="selected-pack-title"
        @click.self="closePackModal"
      >
        <div
          v-if="confettiPieces.length"
          class="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden="true"
        >
          <span
            v-for="piece in confettiPieces"
            :key="piece.id"
            class="confetti-piece"
            :style="{
              '--confetti-x': `${piece.x}px`,
              '--confetti-y': `${piece.y}px`,
              '--confetti-rotation': `${piece.rotation}deg`,
              '--confetti-duration': `${piece.duration}ms`,
              '--confetti-delay': `${piece.delay}ms`,
              '--confetti-color': piece.color,
              '--confetti-width': `${piece.width}px`,
              '--confetti-height': `${piece.height}px`
            }"
          />
        </div>

        <div class="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-primary/50 bg-slate-950 shadow-2xl shadow-primary/20">
          <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(250,204,21,0.28),_transparent_32%),linear-gradient(135deg,_rgba(34,197,94,0.22),_transparent_45%)]" />

          <div class="relative p-6 sm:p-8">
            <div class="mx-auto flex h-28 w-28 items-center justify-center rounded-full border-4 border-yellow-300 bg-slate-900 px-3 shadow-xl shadow-yellow-400/20">
              <span class="break-all text-center text-3xl font-black leading-none text-yellow-200">
                {{ selectedPackModal.code }}
              </span>
            </div>

            <div class="mt-6 text-center">
              <p class="text-sm font-bold uppercase tracking-widest text-primary">
                Pack selected
              </p>

              <h2
                id="selected-pack-title"
                class="mx-auto mt-2 max-w-md text-center text-3xl font-black leading-tight text-white sm:text-4xl"
              >
                {{ selectedPackModal.set }}
              </h2>

              <p class="mt-3 text-slate-300">
                Player {{ selectedPickDetails?.player }} gets pack {{ selectedPickDetails?.packNumber }}.
              </p>
            </div>

            <div class="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <UButton
                size="lg"
                color="primary"
                icon="i-lucide-check"
                @click="closePackModal"
              >
                Continue
              </UButton>

              <UButton
                size="lg"
                color="neutral"
                variant="soft"
                icon="i-lucide-arrow-left"
                @click="goBack"
              >
                Back
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRoute, useRouter } from '#imports'

type Pack = {
  set: string
  code: string
}

type PickedPack = {
  pickNumber: number
  player: number
  packNumber: number
  pack: Pack
}

type ConfettiPiece = {
  id: number
  x: number
  y: number
  rotation: number
  duration: number
  delay: number
  color: string
  width: number
  height: number
}

const route = useRoute()
const router = useRouter()

const packs = ref<Pack[]>([])
const randomizedPackCodes = ref<string[]>([])

const selectedPackCodes = computed(() => {
  const rawPacks = route.query.packs
  const values = Array.isArray(rawPacks) ? rawPacks : [rawPacks]

  return values
    .filter((value): value is string => typeof value === 'string')
    .flatMap(value => value.split(','))
    .map(code => code.trim().toUpperCase())
    .filter(Boolean)
})

const selectedPacks = computed<Pack[]>(() => {
  const packsByCode = new Map(packs.value.map(pack => [pack.code, pack]))
  const packCodes = randomizedPackCodes.value.length
    ? randomizedPackCodes.value
    : selectedPackCodes.value

  return packCodes
    .map(code => packsByCode.get(code))
    .filter((pack): pack is Pack => Boolean(pack))
})

const numPlayers = computed(() => {
  const value = Number(route.query.numPlayers)
  return Number.isFinite(value) && value >= 2 ? value : 4
})

const packsPerPlayer = computed(() => {
  const value = Number(route.query.packsPerPlayer)
  return Number.isFinite(value) && value >= 1 ? value : 3
})

const mode = computed<'deplete' | 'replenish'>(() => {
  return route.query.mode === 'replenish' ? 'replenish' : 'deplete'
})

const modeLabel = computed(() => {
  return mode.value === 'deplete'
    ? 'Deplete mode: packs are removed after selection'
    : 'Replenish mode: packs can be selected more than once'
})

const pickedPacks = ref<PickedPack[]>([])
const usedPackCodes = ref<string[]>([])
const isSpinning = ref(false)
const isLoadingPacks = ref(true)
const visualSelectedIndex = ref(0)
const wheelOffset = ref(0)
const restingIndex = ref(0)
const carouselViewport = ref<HTMLElement | null>(null)
const confettiPieces = ref<ConfettiPiece[]>([])
const selectedPackModal = ref<Pack | null>(null)
const selectedPickDetails = ref<PickedPack | null>(null)
const isPackModalOpen = ref(false)

const cardWidth = 240
const cardGap = 24
const cardStep = cardWidth + cardGap
const startingLoop = 10
const minSpinLoops = 6
const spinLoopVariance = 3
const spinDurationMs = 8600
const confettiColors = ['#22c55e', '#84cc16', '#facc15', '#38bdf8', '#f472b6', '#f97316', '#e2e8f0']

const totalPicksNeeded = computed(() => {
  return numPlayers.value * packsPerPlayer.value
})

const loopCopies = computed(() => {
  return Math.max(80, startingLoop + totalPicksNeeded.value * 18 + 20)
})

const isComplete = computed(() => {
  return pickedPacks.value.length >= totalPicksNeeded.value
})

const currentPlayer = computed(() => {
  if (isComplete.value) return numPlayers.value

  return (pickedPacks.value.length % numPlayers.value) + 1
})

const currentPackForPlayer = computed(() => {
  if (isComplete.value) return packsPerPlayer.value

  return Math.floor(pickedPacks.value.length / numPlayers.value) + 1
})

const availablePacks = computed(() => {
  if (mode.value === 'replenish') {
    return selectedPacks.value
  }

  return selectedPacks.value.filter(pack => !usedPackCodes.value.includes(pack.code))
})

const wheelPacks = computed(() => {
  const packs = availablePacks.value

  if (packs.length === 0) return []

  return Array.from({ length: loopCopies.value }).flatMap(() => packs)
})

const spinButtonLabel = computed(() => {
  if (isLoadingPacks.value) return 'Loading Packs'
  if (isComplete.value) return 'Complete'
  if (availablePacks.value.length === 0) return 'No Packs Left'
  return 'Spin'
})

onMounted(async () => {
  await loadPacks()
  randomizePackCodes()
  initializeWheelPosition()
})

function shuffleArray<T>(values: T[]) {
  const shuffled = [...values]

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    const currentValue = shuffled[index]!

    shuffled[index] = shuffled[swapIndex]!
    shuffled[swapIndex] = currentValue
  }

  return shuffled
}

function randomizePackCodes() {
  randomizedPackCodes.value = shuffleArray(selectedPackCodes.value)
}

async function loadPacks() {
  isLoadingPacks.value = true

  try {
    const res = await fetch('/mtg_sets.csv')
    if (!res.ok) throw new Error('Could not load packs list')

    const text = await res.text()

    packs.value = text
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .slice(1)
      .map((line) => {
        const [set = '', code = ''] = line.split(',').map(value => value.trim())

        return {
          set,
          code
        }
      })
      .filter(pack => pack.set && pack.code)
  } catch {
    packs.value = []
  } finally {
    isLoadingPacks.value = false
  }
}

function getWheelCenterOffset() {
  const viewportWidth = carouselViewport.value?.clientWidth ?? 960
  return viewportWidth / 2 - cardWidth / 2
}

function getOffsetForIndex(index: number) {
  return -(index * cardStep) + getWheelCenterOffset()
}

function initializeWheelPosition() {
  const available = availablePacks.value

  if (available.length === 0) {
    visualSelectedIndex.value = 0
    wheelOffset.value = 0
    restingIndex.value = 0
    return
  }

  const initialIndex = available.length * startingLoop

  restingIndex.value = initialIndex
  visualSelectedIndex.value = initialIndex
  wheelOffset.value = getOffsetForIndex(initialIndex)
}

function createConfettiBurst() {
  const modalWidth = Math.min(window.innerWidth - 32, 512)
  const modalHeight = 430
  const centerSafeRadius = Math.max(modalWidth, modalHeight) * 0.36

  confettiPieces.value = Array.from({ length: 180 }, (_, index) => ({
    id: Date.now() + index,
    ...getConfettiVector(centerSafeRadius),
    rotation: Math.round(Math.random() * 1440 - 720),
    duration: Math.round(1800 + Math.random() * 1700),
    delay: Math.round(Math.random() * 180),
    color: confettiColors[Math.floor(Math.random() * confettiColors.length)]!,
    width: Math.round(8 + Math.random() * 11),
    height: Math.round(13 + Math.random() * 20)
  }))

  window.setTimeout(() => {
    confettiPieces.value = []
  }, 4200)
}

function getConfettiVector(centerSafeRadius: number) {
  const angle = Math.random() * Math.PI * 2
  const distance = centerSafeRadius + Math.random() * 540

  return {
    x: Math.round(Math.cos(angle) * distance),
    y: Math.round(Math.sin(angle) * distance)
  }
}

function showPackModal(pick: PickedPack) {
  selectedPackModal.value = pick.pack
  selectedPickDetails.value = pick
  isPackModalOpen.value = true
  createConfettiBurst()
}

function closePackModal() {
  isPackModalOpen.value = false
}

async function spinWheel() {
  const available = availablePacks.value

  if (isLoadingPacks.value || isSpinning.value || available.length === 0 || isComplete.value) return

  const winningPackIndex = Math.floor(Math.random() * available.length)
  const winningPack = available[winningPackIndex]!

  isSpinning.value = true

  await nextTick()

  let startIndex = restingIndex.value

  if (startIndex === 0) {
    startIndex = available.length * startingLoop
    restingIndex.value = startIndex
    visualSelectedIndex.value = startIndex
    wheelOffset.value = getOffsetForIndex(startIndex)
    await nextTick()
  }

  const currentPackPosition = ((startIndex % available.length) + available.length) % available.length
  const distanceToWinningPack
    = (winningPackIndex - currentPackPosition + available.length) % available.length

  const spinLoops = minSpinLoops + Math.floor(Math.random() * spinLoopVariance)
  const targetIndex = startIndex + available.length * spinLoops + distanceToWinningPack

  const startOffset = getOffsetForIndex(startIndex)
  const endOffset = getOffsetForIndex(targetIndex)

  const duration = spinDurationMs
  const startTime = performance.now()

  function easeOutCubic(t: number) {
    return 1 - Math.pow(1 - t, 3)
  }

  function animate(now: number) {
    const elapsed = now - startTime
    const progress = Math.min(elapsed / duration, 1)
    const easedProgress = easeOutCubic(progress)

    wheelOffset.value = startOffset + (endOffset - startOffset) * easedProgress

    const currentIndex = Math.round((getWheelCenterOffset() - wheelOffset.value) / cardStep)
    visualSelectedIndex.value = Math.max(0, Math.min(currentIndex, wheelPacks.value.length - 1))

    if (progress < 1) {
      window.requestAnimationFrame(animate)
      return
    }

    wheelOffset.value = endOffset
    visualSelectedIndex.value = targetIndex
    restingIndex.value = targetIndex

    const pick = {
      pickNumber: pickedPacks.value.length + 1,
      player: currentPlayer.value,
      packNumber: currentPackForPlayer.value,
      pack: winningPack
    }

    pickedPacks.value.push(pick)

    if (mode.value === 'deplete') {
      usedPackCodes.value.push(winningPack.code)
    }

    isSpinning.value = false
    showPackModal(pick)
  }

  window.requestAnimationFrame(animate)
}

function goBack() {
  router.push('/')
}
</script>

<style scoped>
.confetti-piece {
  position: absolute;
  top: 50%;
  left: 50%;
  width: var(--confetti-width);
  height: var(--confetti-height);
  border-radius: 2px;
  background: var(--confetti-color);
  opacity: 0;
  transform: translate3d(-50%, -50%, 0) scale(0.2) rotate(0deg);
  animation: confetti-burst var(--confetti-duration) cubic-bezier(0.16, 1, 0.3, 1) var(--confetti-delay) forwards;
}

.confetti-piece:nth-child(3n) {
  border-radius: 999px;
}

.confetti-piece:nth-child(4n) {
  clip-path: polygon(50% 0, 100% 100%, 0 100%);
}

.pack-modal-enter-active,
.pack-modal-leave-active {
  transition: opacity 220ms ease, transform 220ms ease;
}

.pack-modal-enter-from,
.pack-modal-leave-to {
  opacity: 0;
}

.pack-modal-enter-from > div,
.pack-modal-leave-to > div {
  transform: translateY(16px) scale(0.96);
}

.pack-modal-enter-active > div,
.pack-modal-leave-active > div {
  transition: transform 220ms ease;
}

@keyframes confetti-burst {
  0% {
    opacity: 0;
    transform: translate3d(-50%, -50%, 0) scale(0.2) rotate(0deg);
  }

  10% {
    opacity: 1;
  }

  70% {
    opacity: 1;
  }

  100% {
    opacity: 0;
    transform: translate3d(calc(-50% + var(--confetti-x)), calc(-50% + var(--confetti-y)), 0) scale(1) rotate(var(--confetti-rotation));
  }
}
</style>
