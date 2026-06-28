<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { X, RefreshCw, Trophy, Calendar, Users, Crown } from '@lucide/vue'
import type { Match, KnockoutMatchState, Scorer, Language, BracketRound } from '../types'
import {
  TEAMS, GROUPS_CONFIG, STAR_PLAYERS, STAR_PLAYER_CLUBS, INITIAL_SCORERS,
} from '../data/constants'
import {
  generateAllMatches, simulateMatchScore, getTeamName,
  calculateAllStandings, calculateBestThirdPlaces, resolveR32Matchups, buildKnockoutTree,
} from '../utils'
import KnockoutMatchItem from './KnockoutMatchItem.vue'
import TeamFlag from './TeamFlag.vue'

const props = defineProps<{
  mode: 'groups' | 'full'
  language: Language
}>()

const emit = defineEmits<{ close: [] }>()

// ── Estado 100% isolado — nunca toca localStorage ─────────────────────────────
const simMatches = ref<Record<string, Match>>(generateAllMatches())
const simKnockout = ref<Record<string, KnockoutMatchState>>({})
const simScorers = ref<Scorer[]>([...INITIAL_SCORERS])
const activeTab = ref<'groups' | 'bracket' | 'scorers'>('groups')
const mobileBracketRound = ref<BracketRound>('R32')

// ── Computed ──────────────────────────────────────────────────────────────────
const standings = computed(() => calculateAllStandings(simMatches.value))
const thirds = computed(() => calculateBestThirdPlaces(standings.value))
const qualifiedThirds = computed(() => thirds.value.slice(0, 8).map(x => x.code))
const tree = computed(() => buildKnockoutTree(simKnockout.value, standings.value, thirds.value))
const topScorers = computed(() => [...simScorers.value].sort((a, b) => b.goals - a.goals).slice(0, 20))

const bracketRounds = computed(() => [
  { id: 'R32' as BracketRound, label: props.language === 'en' ? '16th' : props.language === 'es' ? '16ºs' : '16 avos' },
  { id: 'R16' as BracketRound, label: props.language === 'en' ? '8th'  : props.language === 'es' ? '8ºs'  : 'Oitavas' },
  { id: 'QF'  as BracketRound, label: props.language === 'en' ? 'QF'   : props.language === 'es' ? 'Cuartos' : 'Quartas' },
  { id: 'SF'  as BracketRound, label: props.language === 'en' ? 'Semi' : props.language === 'es' ? 'Semi' : 'Semi' },
  { id: 'F'   as BracketRound, label: props.language === 'en' ? 'Final': props.language === 'es' ? 'Final' : 'Finais' },
])

// ── Lógica de simulação ───────────────────────────────────────────────────────
function addGoals(teamCode: string, amount: number) {
  const name = STAR_PLAYERS[teamCode] || `${teamCode} Star`
  const club = STAR_PLAYER_CLUBS[teamCode] || '—'
  const idx = simScorers.value.findIndex(s => s.name === name && s.team === teamCode)
  if (idx !== -1) simScorers.value[idx].goals += amount
  else simScorers.value.push({ name, team: teamCode, goals: amount, club })
}

function simulateGroups() {
  simMatches.value = generateAllMatches()
  simScorers.value = [...INITIAL_SCORERS]
  simKnockout.value = {}
  Object.keys(simMatches.value).forEach(id => {
    const m = simMatches.value[id]
    const [h, a] = simulateMatchScore(TEAMS[m.home]?.ranking ?? 50, TEAMS[m.away]?.ranking ?? 50)
    m.homeScore = h; m.awayScore = a
    if (h > 0) addGoals(m.home, h)
    if (a > 0) addGoals(m.away, a)
  })
}

function simulateFull() {
  simulateGroups()

  const freshStandings = calculateAllStandings(simMatches.value)
  const freshThirds = calculateBestThirdPlaces(freshStandings)
  const r32Teams = resolveR32Matchups(freshStandings, freshThirds)
  const next: Record<string, KnockoutMatchState> = {}

  const getWinner = (id: string, home?: string, away?: string) => {
    const m = next[id]; if (!m || !home || !away) return undefined
    const { homeScore: h, awayScore: a, penaltyWinner: p } = m
    if (h === '' || a === '') return undefined
    return h > a ? home : h < a ? away : p === 'home' ? home : p === 'away' ? away : undefined
  }
  const getLoser = (id: string, home?: string, away?: string) => {
    const m = next[id]; if (!m || !home || !away) return undefined
    const { homeScore: h, awayScore: a, penaltyWinner: p } = m
    if (h === '' || a === '') return undefined
    return h > a ? away : h < a ? home : p === 'home' ? away : p === 'away' ? home : undefined
  }
  const simMatch = (id: string, home?: string, away?: string) => {
    if (!home || !away) return
    const [h, a] = simulateMatchScore(TEAMS[home]?.ranking ?? 50, TEAMS[away]?.ranking ?? 50)
    const pen = h === a ? (Math.random() > 0.5 ? 'home' : 'away') as 'home' | 'away' : null
    next[id] = { homeScore: h, awayScore: a, penaltyWinner: pen }
    if (h > 0) addGoals(home, h)
    if (a > 0) addGoals(away, a)
  }

  for (let i = 0; i < 16; i++) simMatch(`R32-${i + 1}`, r32Teams[i]?.home, r32Teams[i]?.away)

  const r16Teams = Array.from({ length: 8 }, (_, i) => ({
    home: getWinner(`R32-${2*i+1}`, r32Teams[2*i]?.home, r32Teams[2*i]?.away),
    away: getWinner(`R32-${2*i+2}`, r32Teams[2*i+1]?.home, r32Teams[2*i+1]?.away),
  }))
  for (let i = 0; i < 8; i++) simMatch(`R16-${i + 1}`, r16Teams[i].home, r16Teams[i].away)

  const qfTeams = Array.from({ length: 4 }, (_, i) => ({
    home: getWinner(`R16-${2*i+1}`, r16Teams[2*i]?.home, r16Teams[2*i]?.away),
    away: getWinner(`R16-${2*i+2}`, r16Teams[2*i+1]?.home, r16Teams[2*i+1]?.away),
  }))
  for (let i = 0; i < 4; i++) simMatch(`QF-${i + 1}`, qfTeams[i].home, qfTeams[i].away)

  const sfTeams = Array.from({ length: 2 }, (_, i) => ({
    home: getWinner(`QF-${2*i+1}`, qfTeams[2*i]?.home, qfTeams[2*i]?.away),
    away: getWinner(`QF-${2*i+2}`, qfTeams[2*i+1]?.home, qfTeams[2*i+1]?.away),
  }))
  for (let i = 0; i < 2; i++) simMatch(`SF-${i + 1}`, sfTeams[i].home, sfTeams[i].away)

  simMatch('F-1',
    getWinner('SF-1', sfTeams[0]?.home, sfTeams[0]?.away),
    getWinner('SF-2', sfTeams[1]?.home, sfTeams[1]?.away),
  )
  simMatch('TP-1',
    getLoser('SF-1', sfTeams[0]?.home, sfTeams[0]?.away),
    getLoser('SF-2', sfTeams[1]?.home, sfTeams[1]?.away),
  )

  simKnockout.value = next
}

function run() {
  if (props.mode === 'full') { simulateFull(); activeTab.value = 'bracket' }
  else { simulateGroups(); activeTab.value = 'groups' }
}

onMounted(run)

function teamName(code: string) { return getTeamName(code, props.language) }

function rowBadge(index: number, code: string) {
  if (index < 2) return 'bg-emerald-500 text-white'
  if (index === 2 && qualifiedThirds.value.includes(code)) return 'bg-yellow-500 text-slate-950'
  return 'bg-slate-200 text-slate-500'
}
</script>

<template>
  <!-- Overlay fullscreen -->
  <div class="fixed inset-0 z-[80] flex flex-col bg-slate-100 overflow-hidden">

    <!-- ── Header da simulação ───────────────────────────────────────────── -->
    <header class="bg-indigo-950 text-white shadow-xl shrink-0">
      <div class="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">

        <!-- Identidade -->
        <div class="flex items-center gap-3">
          <span class="bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
            {{ language === 'en' ? 'SIMULATION MODE' : language === 'es' ? 'MODO SIMULACIÓN' : 'MODO SIMULAÇÃO' }}
          </span>
          <span class="text-sm font-extrabold text-slate-200 hidden sm:block">
            {{ mode === 'full'
              ? (language === 'en' ? 'Full Tournament' : language === 'es' ? 'Copa Completa' : 'Copa Completa')
              : (language === 'en' ? 'Group Stage' : language === 'es' ? 'Fase de Grupos' : 'Fase de Grupos') }}
          </span>
        </div>

        <p class="text-[10px] text-indigo-300/80 text-center sm:text-left">
          {{ language === 'en'
            ? 'Sandbox — your saved data is not affected'
            : language === 'es'
            ? 'Sandbox — tus datos guardados no se ven afectados'
            : 'Sandbox — seus dados salvos não são afetados' }}
        </p>

        <!-- Ações -->
        <div class="flex items-center gap-2">
          <button
            @click="run"
            class="flex items-center gap-1.5 px-3 py-2 bg-indigo-700 hover:bg-indigo-600 border border-indigo-500/40 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <RefreshCw class="w-3.5 h-3.5" aria-hidden="true" />
            <span>{{ language === 'en' ? 'Re-simulate' : language === 'es' ? 'Volver a simular' : 'Simular Novamente' }}</span>
          </button>
          <button
            @click="emit('close')"
            class="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
            :title="language === 'en' ? 'Close simulation' : 'Fechar simulação'"
          >
            <X class="w-3.5 h-3.5" aria-hidden="true" />
            <span>{{ language === 'en' ? 'Close' : language === 'es' ? 'Cerrar' : 'Fechar' }}</span>
          </button>
        </div>
      </div>

      <!-- Tabs -->
      <div class="border-t border-indigo-900/60 bg-indigo-950/40">
        <nav class="max-w-7xl mx-auto px-4 flex gap-1">
          <button
            v-for="tab in ([
              { id: 'groups', icon: Calendar, label: language === 'en' ? 'Groups' : language === 'es' ? 'Grupos' : 'Grupos' },
              { id: 'bracket', icon: Trophy, label: language === 'en' ? 'Bracket' : 'Chaveamento' },
              { id: 'scorers', icon: Users, label: language === 'en' ? 'Scorers' : language === 'es' ? 'Goleadores' : 'Artilheiros' },
            ] as const)"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="`flex items-center gap-1.5 px-4 py-3.5 border-b-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${activeTab === tab.id ? 'border-indigo-400 text-white' : 'border-transparent text-indigo-300/60 hover:text-white'}`"
          >
            <component :is="tab.icon" class="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>{{ tab.label }}</span>
          </button>
        </nav>
      </div>
    </header>

    <!-- ── Conteúdo scrollável ────────────────────────────────────────────── -->
    <main class="flex-1 overflow-y-auto">
      <div class="max-w-7xl mx-auto px-4 py-8 pb-12 space-y-8">

        <!-- Campeão (modo full) -->
        <div
          v-if="mode === 'full' && tree.F.winner"
          class="bg-gradient-to-r from-indigo-950 to-slate-900 border border-indigo-800/40 rounded-3xl p-6 flex flex-col sm:flex-row items-center gap-6 shadow-xl"
        >
          <div class="flex items-center justify-center w-20 h-20 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 shrink-0">
            <Crown class="w-10 h-10 text-yellow-500" aria-hidden="true" />
          </div>
          <div class="text-center sm:text-left">
            <p class="text-[10px] font-black uppercase tracking-widest text-yellow-500 mb-1">
              {{ language === 'en' ? 'World Champion' : language === 'es' ? 'Campeón Mundial' : 'Campeão Mundial' }}
            </p>
            <div class="flex items-center justify-center sm:justify-start gap-3">
              <span class="text-4xl">{{ TEAMS[tree.F.winner]?.flag }}</span>
              <span class="text-2xl font-black text-white">{{ teamName(tree.F.winner) }}</span>
            </div>
            <p class="text-xs text-slate-400 mt-1">
              {{ language === 'en' ? 'Final' : 'Grande Final' }} •
              {{ tree.F.homeScore }} × {{ tree.F.awayScore }}
              <span v-if="tree.F.penaltyWinner"> (PEN)</span>
              • MetLife Stadium
            </p>
          </div>
          <div v-if="tree.TP.winner" class="sm:ml-auto text-center sm:text-right border-t sm:border-t-0 sm:border-l border-slate-800 pt-4 sm:pt-0 sm:pl-6 w-full sm:w-auto">
            <p class="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1">
              {{ language === 'en' ? '3rd Place' : '3º Lugar' }}
            </p>
            <div class="flex items-center justify-center sm:justify-end gap-2">
              <span class="text-xl">{{ TEAMS[tree.TP.winner]?.flag }}</span>
              <span class="text-sm font-extrabold text-slate-300">{{ teamName(tree.TP.winner) }}</span>
            </div>
          </div>
        </div>

        <!-- ── GRUPOS ───────────────────────────────────────────────────── -->
        <div v-if="activeTab === 'groups'" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <div
            v-for="groupLetter in Object.keys(GROUPS_CONFIG)"
            :key="groupLetter"
            class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
          >
            <div class="px-4 py-3 bg-indigo-900 text-white flex items-center gap-2">
              <span class="w-7 h-7 rounded-lg bg-indigo-500/40 flex items-center justify-center font-black text-sm">{{ groupLetter }}</span>
              <span class="font-bold text-sm uppercase tracking-wide">
                {{ language === 'en' ? 'Group' : 'Grupo' }} {{ groupLetter }}
              </span>
            </div>
            <table class="w-full text-xs">
              <thead class="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-wider">
                <tr>
                  <th class="py-2 px-2 text-center w-6">#</th>
                  <th class="py-2 px-2 text-left">{{ language === 'en' ? 'Team' : 'Seleção' }}</th>
                  <th class="py-2 px-1 text-center">Pts</th>
                  <th class="py-2 px-1 text-center">{{ language === 'en' ? 'GD' : 'SG' }}</th>
                  <th class="py-2 px-1 text-center">{{ language === 'en' ? 'GF' : 'GP' }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50">
                <tr v-for="(row, i) in standings[groupLetter]" :key="row.code" class="hover:bg-slate-50/50">
                  <td class="py-2.5 px-2 text-center">
                    <span :class="`w-5 h-5 rounded-full inline-flex items-center justify-center text-[9px] font-black ${rowBadge(i, row.code)}`">{{ i + 1 }}</span>
                  </td>
                  <td class="py-2.5 px-2">
                    <TeamFlag :code="row.code" :lang="language" text-class="text-xs font-semibold" />
                  </td>
                  <td class="py-2.5 px-1 text-center font-black font-mono text-blue-700">{{ row.pts }}</td>
                  <td :class="`py-2.5 px-1 text-center font-mono font-semibold ${row.sg > 0 ? 'text-emerald-600' : row.sg < 0 ? 'text-red-500' : 'text-slate-400'}`">
                    {{ row.sg > 0 ? `+${row.sg}` : row.sg }}
                  </td>
                  <td class="py-2.5 px-1 text-center font-mono text-slate-500">{{ row.gp }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ── CHAVEAMENTO ──────────────────────────────────────────────── -->
        <div v-else-if="activeTab === 'bracket'">
          <!-- Mobile selector -->
          <div class="flex md:hidden bg-slate-200/60 p-1 rounded-2xl border border-slate-200 gap-0.5 mb-5 shadow-sm">
            <button
              v-for="round in bracketRounds"
              :key="round.id"
              @click="mobileBracketRound = round.id"
              :class="`flex-1 text-center py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${mobileBracketRound === round.id ? 'bg-indigo-700 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200/30'}`"
            >{{ round.label }}</button>
          </div>

          <div class="overflow-x-auto md:pb-10 cursor-grab active:cursor-grabbing">
            <div class="md:min-w-[1300px] w-full flex flex-col md:flex-row gap-10 items-stretch">

              <div :class="`w-full md:w-80 flex flex-col gap-4 ${mobileBracketRound === 'R32' ? 'block' : 'hidden md:flex'}`">
                <div class="sticky top-0 bg-slate-100 py-2.5 z-10 border-b border-slate-200/60 mb-2">
                  <p class="font-black text-xs uppercase tracking-widest text-indigo-700 flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0"></span>
                    {{ language === 'en' ? 'Round of 32' : '16-avos' }}
                  </p>
                </div>
                <div class="space-y-4">
                  <KnockoutMatchItem v-for="match in tree.R32" :key="match.matchId" :match="match" :read-only="true" />
                </div>
              </div>

              <div :class="`w-full md:w-80 flex flex-col gap-4 justify-around md:mt-8 ${mobileBracketRound === 'R16' ? 'block' : 'hidden md:flex'}`">
                <div class="sticky top-0 bg-slate-100 py-2.5 z-10 border-b border-slate-200/60 mb-2">
                  <p class="font-black text-xs uppercase tracking-widest text-purple-600 flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0"></span>
                    {{ language === 'en' ? 'Round of 16' : 'Oitavas' }}
                  </p>
                </div>
                <div class="space-y-4 md:space-y-24">
                  <KnockoutMatchItem v-for="match in tree.R16" :key="match.matchId" :match="match" :read-only="true" />
                </div>
              </div>

              <div :class="`w-full md:w-80 flex flex-col gap-4 justify-around md:mt-12 ${mobileBracketRound === 'QF' ? 'block' : 'hidden md:flex'}`">
                <div class="sticky top-0 bg-slate-100 py-2.5 z-10 border-b border-slate-200/60 mb-2">
                  <p class="font-black text-xs uppercase tracking-widest text-amber-600 flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
                    {{ language === 'en' ? 'Quarterfinals' : 'Quartas' }}
                  </p>
                </div>
                <div class="space-y-4 md:space-y-64">
                  <KnockoutMatchItem v-for="match in tree.QF" :key="match.matchId" :match="match" :read-only="true" />
                </div>
              </div>

              <div :class="`w-full md:w-80 flex flex-col gap-4 justify-around md:mt-16 ${mobileBracketRound === 'SF' ? 'block' : 'hidden md:flex'}`">
                <div class="sticky top-0 bg-slate-100 py-2.5 z-10 border-b border-slate-200/60 mb-2">
                  <p class="font-black text-xs uppercase tracking-widest text-red-600 flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-red-400 shrink-0"></span>
                    {{ language === 'en' ? 'Semifinals' : 'Semifinais' }}
                  </p>
                </div>
                <div class="space-y-4 md:space-y-[450px]">
                  <KnockoutMatchItem v-for="match in tree.SF" :key="match.matchId" :match="match" :read-only="true" />
                </div>
              </div>

              <div :class="`w-full md:w-80 flex flex-col gap-6 justify-center md:mt-20 ${mobileBracketRound === 'F' ? 'block' : 'hidden md:flex'}`">
                <div class="space-y-3 border-b border-slate-200/50 pb-5 mb-2">
                  <div class="bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 text-[10px] text-center font-extrabold uppercase py-1.5 px-3 rounded-xl tracking-widest">
                    🏆 {{ language === 'en' ? 'Grand Final' : 'Grande Final' }}
                  </div>
                  <KnockoutMatchItem :match="tree.F" :is-emphasized="true" :read-only="true" />
                </div>
                <div class="space-y-3">
                  <div class="bg-slate-100 border border-slate-200 text-slate-500 text-[10px] text-center font-bold uppercase py-1.5 px-3 rounded-xl tracking-widest">
                    🥉 {{ language === 'en' ? '3rd Place' : '3º Lugar' }}
                  </div>
                  <KnockoutMatchItem :match="tree.TP" :read-only="true" />
                </div>
              </div>

            </div>
          </div>
        </div>

        <!-- ── ARTILHEIROS ─────────────────────────────────────────────── -->
        <div v-else class="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm max-w-2xl mx-auto">
          <div class="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {{ language === 'en' ? 'Top Scorers — Simulation' : 'Artilheiros — Simulação' }}
            </span>
            <span class="text-xs font-bold bg-indigo-500/10 text-indigo-600 py-1 px-3 rounded-full">
              {{ topScorers.length }} {{ language === 'en' ? 'players' : 'atletas' }}
            </span>
          </div>
          <div class="divide-y divide-slate-50">
            <div
              v-for="(player, idx) in topScorers"
              :key="`${player.name}-${player.team}`"
              class="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50/40 transition-all"
            >
              <div class="flex items-center gap-4">
                <span class="w-6 text-center text-slate-400 font-mono font-bold text-xs">{{ idx + 1 }}</span>
                <div>
                  <div class="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                    {{ player.name }}
                    <TeamFlag :code="player.team" :lang="language" :hide-name="true" />
                  </div>
                  <div class="text-[10px] text-slate-400 mt-0.5">
                    {{ TEAMS[player.team]?.name }} • {{ player.club }}
                  </div>
                </div>
              </div>
              <span class="font-mono font-black text-lg text-indigo-600 w-8 text-right">{{ player.goals }}</span>
            </div>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>
