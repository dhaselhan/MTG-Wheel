<template>
  <div class="w-full">
    <UPageSection
      title="Set Players"
      :ui="sectionUi"
    >
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-4">
          <label class="text-white font-semibold">Number of Players:</label>
          <UInput
            v-model.number="numPlayers"
            type="number"
            min="2"
            max="12"
            class="w-24"
          />
        </div>

        <div class="flex items-center gap-4">
          <label class="text-white font-semibold">Packs per Player:</label>
          <UInput
            v-model.number="packsPerPlayer"
            type="number"
            min="1"
            max="12"
            class="w-24"
          />
        </div>

        <p class="text-slate-400 text-sm">
          Total packs needed: {{ totalPacksNeeded }}
        </p>

        <p
          v-if="selectedPacks.length > 0 && selectedPacks.length < totalPacksNeeded"
          class="text-yellow-300 text-sm"
        >
          You have selected {{ selectedPacks.length }} packs, but this setup needs
          {{ totalPacksNeeded }} packs.
        </p>
      </div>
    </UPageSection>

    <UPageSection
      title="Select Packs"
      :ui="sectionUi"
    >
      <div class="grid gap-4 rounded-lg border bg-slate-900/60 p-4 lg:grid-cols-2">
        <div>
          <div class="mb-2 flex items-center justify-between gap-3">
            <h3 class="text-white font-semibold">
              Selected Packs
            </h3>

            <span class="rounded-md bg-slate-800 px-2 py-1 text-xs font-semibold text-slate-300">
              {{ selectedPacks.length }}/{{ totalPacksNeeded }}
            </span>
          </div>

          <div
            v-if="selectedPacks.length"
            class="flex flex-col gap-2"
          >
            <button
              v-for="pack in selectedPacks"
              :key="pack.code"
              type="button"
              class="flex w-full items-center justify-between gap-3 rounded-md border border-slate-700 bg-slate-900/70 px-3 py-2 text-left text-sm text-white transition hover:border-primary/60 hover:bg-primary/10"
              @click="removePack(pack.code)"
            >
              <span class="min-w-0">
                <span class="block truncate font-medium">{{ pack.set }}</span>
                <span class="block font-mono text-xs text-slate-400">{{ pack.code }}</span>
              </span>

              <UIcon
                name="i-lucide-x"
                class="size-4 shrink-0 text-slate-400"
                aria-hidden="true"
              />
            </button>
          </div>

          <p
            v-else
            class="text-slate-400 text-sm"
          >
            No packs selected yet.
          </p>
        </div>

        <div class="border-t border-slate-700 pt-4 lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
          <label class="text-white font-semibold block mb-2">
            Search Packs
          </label>

          <UInput
            v-model="packSearch"
            class="w-full"
            placeholder="Search by set or code, e.g. Tarkir or TDM"
            icon="i-lucide-search"
          />

          <div class="mt-2 max-h-64 overflow-y-auto flex flex-col gap-2">
            <button
              v-for="pack in filteredPacks"
              :key="pack.code"
              type="button"
              class="flex items-center justify-between gap-3 cursor-pointer hover:bg-primary/10 rounded px-3 py-2 text-left"
              @click="selectPack(pack)"
            >
              <span class="text-white">{{ pack.set }}</span>
              <span class="text-slate-300 font-mono text-sm">{{ pack.code }}</span>
            </button>

            <p
              v-if="packSearch.trim() && filteredPacks.length === 0"
              class="text-slate-400 text-sm px-1"
            >
              No matching packs found.
            </p>
          </div>
        </div>
      </div>
    </UPageSection>

    <UPageSection
      title="Extras"
      :ui="sectionUi"
    >
      <div class="flex flex-col gap-3">
        <label class="text-white font-semibold">Wheel Mode:</label>

        <div class="grid grid-cols-2 gap-2 rounded-lg bg-slate-900/60 border p-1">
          <button
            type="button"
            class="rounded-md px-4 py-2 text-sm font-semibold transition"
            :class="mode === 'deplete'
              ? 'bg-primary text-white'
              : 'text-slate-300 hover:bg-primary/10'"
            @click="mode = 'deplete'"
          >
            Deplete
          </button>

          <button
            type="button"
            class="rounded-md px-4 py-2 text-sm font-semibold transition"
            :class="mode === 'replenish'
              ? 'bg-primary text-white'
              : 'text-slate-300 hover:bg-primary/10'"
            @click="mode = 'replenish'"
          >
            Replenish
          </button>
        </div>

        <p class="text-slate-400 text-sm">
          <span v-if="mode === 'deplete'">
            Selected packs are removed from the wheel after they are chosen.
          </span>

          <span v-else>
            Selected packs stay in the wheel and can be chosen again.
          </span>
        </p>
      </div>
    </UPageSection>

    <div class="flex justify-end mt-6 px-4 sm:px-6 lg:px-8">
      <UButton
        :disabled="!canContinue"
        size="xl"
        color="primary"
        icon="i-lucide-arrow-right"
        @click="goToWheel"
      >
        Next: Spin Wheel
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from '#imports'

type Pack = {
  set: string
  code: string
}

const packs = ref<Pack[]>([])
const selectedPacks = ref<Pack[]>([])
const packSearch = ref('')

const numPlayers = ref(4)
const packsPerPlayer = ref(3)

const mode = ref<'deplete' | 'replenish'>('deplete')

const sectionUi = {
  container: 'py-6 sm:py-8 lg:py-10 gap-4 sm:gap-5 max-w-none'
}

const totalPacksNeeded = computed(() => {
  return numPlayers.value * packsPerPlayer.value
})

const canContinue = computed(() => {
  return (
    selectedPacks.value.length > 0
    && numPlayers.value >= 2
    && packsPerPlayer.value >= 1
  )
})

const filteredPacks = computed(() => {
  const search = packSearch.value.trim().toLowerCase()

  return packs.value
    .filter((pack) => {
      const isAlreadySelected = selectedPacks.value.some(
        selectedPack => selectedPack.code === pack.code
      )

      if (isAlreadySelected) return false

      if (!search) return true

      return (
        pack.set.toLowerCase().includes(search)
        || pack.code.toLowerCase().includes(search)
      )
    })
    .slice(0, 20)
})

onMounted(async () => {
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
    packs.value = [
      {
        set: 'Error loading packs list',
        code: ''
      }
    ]
  }
})

function selectPack(pack: Pack) {
  const alreadySelected = selectedPacks.value.some(
    selectedPack => selectedPack.code === pack.code
  )

  if (alreadySelected) return

  selectedPacks.value.push(pack)
  packSearch.value = ''
}

function removePack(code: string) {
  selectedPacks.value = selectedPacks.value.filter(pack => pack.code !== code)
}

const router = useRouter()

function goToWheel() {
  const packCodes = selectedPacks.value.map(pack => pack.code).join(',')

  router.push({
    path: '/wheel',
    query: {
      packs: packCodes,
      numPlayers: String(numPlayers.value),
      packsPerPlayer: String(packsPerPlayer.value),
      mode: mode.value
    }
  })
}
</script>

<style>
/* Add any additional styles here */
</style>
