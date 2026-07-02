<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { KnockoutSlot } from '../types'
import { TEAMS } from '../data/constants'
import TeamFlag from './TeamFlag.vue'
import { Save, Pencil } from '@lucide/vue'

const props = withDefaults(defineProps<{
  match: KnockoutSlot
  isEmphasized?: boolean
  isUnsaved?: boolean
  readOnly?: boolean
}>(), {
  isEmphasized: false,
  isUnsaved: false,
  readOnly: false,
})

const emit = defineEmits<{
  scoreChange: [id: string, side: 'homeScore' | 'awayScore', value: string]
  setPenalty: [id: string, side: 'home' | 'away']
  penaltyScoreChange: [id: string, side: 'penaltyHomeScore' | 'penaltyAwayScore', value: string]
  save: [id: string]
}>()

const isTied = computed(() =>
  props.match.homeScore !== '' &&
  props.match.awayScore !== '' &&
  props.match.homeScore === props.match.awayScore,
)

const hasPenaltyScore = computed(() =>
  typeof props.match.penaltyHomeScore === 'number' && typeof props.match.penaltyAwayScore === 'number',
)

const editingPenalty = ref(false)

watch(() => props.isUnsaved, (isUnsaved, wasUnsaved) => {
  if (wasUnsaved && !isUnsaved) editingPenalty.value = false
})

const showPenaltyInputs = computed(() =>
  !props.readOnly && isTied.value && (editingPenalty.value || props.isUnsaved || !hasPenaltyScore.value),
)
const showPenaltyDisplay = computed(() => isTied.value && hasPenaltyScore.value && !showPenaltyInputs.value)

const borderClass = computed(() =>
  props.isEmphasized
    ? 'border-yellow-400 ring-2 ring-yellow-400/25 dark:bg-slate-900 shadow-xl'
    : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-sm',
)

function homeAriaLabel() {
  return props.match.home
    ? `Gols ${TEAMS[props.match.home]?.name || props.match.home}`
    : 'Placar mandante'
}

function awayAriaLabel() {
  return props.match.away
    ? `Gols ${TEAMS[props.match.away]?.name || props.match.away}`
    : 'Placar visitante'
}
</script>

<template>
  <div
    :class="`p-3 rounded-2xl border text-xs relative ${borderClass} transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md`"
  >
    <!-- Metadata bar -->
    <div class="flex justify-between items-center text-[9px] text-slate-400 dark:text-slate-500 uppercase font-mono tracking-wider border-b border-slate-100 dark:border-slate-700/50 pb-2 mb-2.5">
      <span class="font-black bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded text-[8px] border dark:border-slate-800 text-slate-500">
        MATA {{ match.matchId }}
      </span>
      <button
        v-if="isUnsaved"
        type="button"
        @click="emit('save', match.matchId)"
        class="flex items-center gap-1 px-2 py-0.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-md text-[9px] font-extrabold shadow animate-pulse cursor-pointer shrink-0"
        title="Salvar resultado"
      >
        <Save class="w-2.5 h-2.5 text-slate-950" :stroke-width="3" aria-hidden="true" />
        <span>SALVAR</span>
      </button>
      <span v-else class="truncate max-w-[120px] text-right" :title="`${match.stadium}, ${match.stadiumCity}`">
        {{ match.stadiumCity }}
      </span>
    </div>

    <div class="space-y-3">
      <!-- Home team row -->
      <div class="flex items-center justify-between gap-1.5">
        <button
          type="button"
          @click="() => { if (!readOnly && isTied && match.home) emit('setPenalty', match.matchId, 'home') }"
          :class="`flex items-center gap-1.5 pr-1.5 rounded-lg transition-all overflow-hidden text-left max-w-[70%] shrink
            ${!readOnly && isTied && match.home ? 'hover:bg-yellow-500/10 p-1 cursor-pointer' : 'cursor-default'}
            ${match.winner === match.home && match.home ? 'opacity-100 font-extrabold' : !match.winner && match.home ? 'opacity-100' : 'opacity-50'}`"
          :aria-label="!readOnly && isTied && match.home ? `Definir ${TEAMS[match.home]?.name || match.home} como vencedor nos pênaltis` : undefined"
        >
          <TeamFlag :code="match.home || ''" text-class="text-xs truncate" />
          <span
            v-if="isTied && match.penaltyWinner === 'home'"
            class="text-[9px] font-extrabold bg-yellow-500 text-slate-950 px-1 py-0.5 rounded-md uppercase tracking-tighter shrink-0"
          >PEN 👑</span>
        </button>
        <span v-if="readOnly" :class="`w-9 h-8 inline-flex items-center justify-center font-mono font-black text-sm rounded-lg shrink-0 ${match.winner === match.home ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100'}`">
          {{ match.homeScore !== '' ? match.homeScore : '-' }}
        </span>
        <input
          v-else
          type="number"
          min="0"
          :disabled="!match.home || !match.away"
          :value="match.homeScore"
          @input="(e: Event) => emit('scoreChange', match.matchId, 'homeScore', (e.target as HTMLInputElement).value)"
          :aria-label="homeAriaLabel()"
          placeholder="-"
          :class="`w-9 h-8 text-center font-mono font-black text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-yellow-500 transition-all shrink-0 ${match.home && match.away ? 'bg-slate-100 dark:bg-slate-900 cursor-text' : 'bg-slate-200/30 dark:bg-slate-900/10 cursor-not-allowed text-slate-400'}`"
        />
      </div>

      <!-- Away team row -->
      <div class="flex items-center justify-between gap-1.5">
        <button
          type="button"
          @click="() => { if (!readOnly && isTied && match.away) emit('setPenalty', match.matchId, 'away') }"
          :class="`flex items-center gap-1.5 pr-1.5 rounded-lg transition-all overflow-hidden text-left max-w-[70%] shrink
            ${!readOnly && isTied && match.away ? 'hover:bg-yellow-500/10 p-1 cursor-pointer' : 'cursor-default'}
            ${match.winner === match.away && match.away ? 'opacity-100 font-extrabold' : !match.winner && match.away ? 'opacity-100' : 'opacity-50'}`"
          :aria-label="!readOnly && isTied && match.away ? `Definir ${TEAMS[match.away]?.name || match.away} como vencedor nos pênaltis` : undefined"
        >
          <TeamFlag :code="match.away || ''" text-class="text-xs truncate" />
          <span
            v-if="isTied && match.penaltyWinner === 'away'"
            class="text-[9px] font-extrabold bg-yellow-500 text-slate-950 px-1 py-0.5 rounded-md uppercase tracking-tighter shrink-0"
          >PEN 👑</span>
        </button>
        <span v-if="readOnly" :class="`w-9 h-8 inline-flex items-center justify-center font-mono font-black text-sm rounded-lg shrink-0 ${match.winner === match.away ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100'}`">
          {{ match.awayScore !== '' ? match.awayScore : '-' }}
        </span>
        <input
          v-else
          type="number"
          min="0"
          :disabled="!match.home || !match.away"
          :value="match.awayScore"
          @input="(e: Event) => emit('scoreChange', match.matchId, 'awayScore', (e.target as HTMLInputElement).value)"
          :aria-label="awayAriaLabel()"
          placeholder="-"
          :class="`w-9 h-8 text-center font-mono font-black text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-yellow-500 transition-all ${match.home && match.away ? 'bg-slate-100 dark:bg-slate-900 cursor-text' : 'bg-slate-200/30 dark:bg-slate-900/10 cursor-not-allowed text-slate-400'}`"
        />
      </div>
    </div>

    <!-- Penalty score display -->
    <div
      v-if="showPenaltyDisplay"
      class="mt-3.5 pt-2.5 border-t border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5 text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide"
    >
      <span class="mr-0.5 normal-case tracking-normal">Pênaltis</span>
      <TeamFlag :code="match.home || ''" :hide-name="true" flag-class="text-xs" />
      <span>{{ match.penaltyHomeScore }}</span>
      <span class="text-slate-400">×</span>
      <span>{{ match.penaltyAwayScore }}</span>
      <TeamFlag :code="match.away || ''" :hide-name="true" flag-class="text-xs" />
      <button
        v-if="!readOnly"
        type="button"
        @click="editingPenalty = true"
        class="ml-1 p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer shrink-0"
        title="Editar placar dos pênaltis"
        aria-label="Editar placar dos pênaltis"
      >
        <Pencil class="w-2.5 h-2.5" :stroke-width="2.5" aria-hidden="true" />
      </button>
    </div>

    <!-- Penalty score input -->
    <div
      v-if="showPenaltyInputs"
      class="mt-3.5 pt-2.5 border-t border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5"
    >
      <span class="text-[9px] font-bold uppercase text-slate-400 tracking-wide mr-0.5">Pênaltis</span>
      <TeamFlag :code="match.home || ''" :hide-name="true" flag-class="text-xs" />
      <input
        type="number"
        min="0"
        :value="match.penaltyHomeScore"
        @input="(e: Event) => emit('penaltyScoreChange', match.matchId, 'penaltyHomeScore', (e.target as HTMLInputElement).value)"
        :aria-label="`Pênaltis ${match.home ? (TEAMS[match.home]?.name || match.home) : 'mandante'}`"
        placeholder="-"
        class="w-7 h-6 text-center font-mono font-black text-[11px] rounded bg-slate-100 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-yellow-500"
      />
      <span class="text-[9px] text-slate-400">×</span>
      <input
        type="number"
        min="0"
        :value="match.penaltyAwayScore"
        @input="(e: Event) => emit('penaltyScoreChange', match.matchId, 'penaltyAwayScore', (e.target as HTMLInputElement).value)"
        :aria-label="`Pênaltis ${match.away ? (TEAMS[match.away]?.name || match.away) : 'visitante'}`"
        placeholder="-"
        class="w-7 h-6 text-center font-mono font-black text-[11px] rounded bg-slate-100 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-yellow-500"
      />
      <TeamFlag :code="match.away || ''" :hide-name="true" flag-class="text-xs" />
    </div>

    <!-- Penalty prompt -->
    <div
      v-if="isTied && !match.penaltyWinner"
      class="mt-3.5 pt-2.5 border-t border-dashed border-red-500/20 text-[9px] text-red-500 dark:text-red-400 font-bold uppercase text-center animate-pulse tracking-wide"
    >
      ⚠️ Toque na bandeira ou informe o placar dos pênaltis
    </div>

    <!-- Footer date/time -->
    <div class="mt-3 px-1 border-t border-slate-100 dark:border-slate-700/50 pt-2 text-[9px] text-slate-400 flex justify-between">
      <span>{{ match.date }}</span>
      <span>{{ match.time }}</span>
    </div>
  </div>
</template>
