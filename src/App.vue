<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  Trophy, Calendar, Users, Search, RefreshCw, Info, Crown, Award,
  MapPin, Plus, Trash2, HelpCircle, Compass, Save, Printer, Download, Upload,
} from '@lucide/vue'
import type { Match, KnockoutMatchState, Scorer, TabId, Language, BracketRound, KnockoutSlot } from './types'
import { TEAMS, GROUPS_CONFIG, STADIUMS, INITIAL_SCORERS, TRANSLATIONS, STAR_PLAYERS, STAR_PLAYER_CLUBS } from './data/constants'
import {
  generateAllMatches, getTeamName,
  calculateAllStandings, calculateBestThirdPlaces, resolveKnockoutSlot, buildKnockoutTree,
} from './utils'
import TeamFlag from './components/TeamFlag.vue'
import KnockoutMatchItem from './components/KnockoutMatchItem.vue'
import SimulationPage from './components/SimulationPage.vue'

// ─── State initializers ───────────────────────────────────────────────────────

function loadLanguage(): Language {
  const saved = localStorage.getItem('wc2026_language')
  return (saved === 'en' || saved === 'es' || saved === 'pt') ? saved : 'pt'
}

function loadMatches(): Record<string, Match> {
  const base = generateAllMatches()
  const raw = localStorage.getItem('wc2026_user_saved_matches') || localStorage.getItem('wc2026_matches')
  if (raw) {
    try {
      const parsed = JSON.parse(raw)
      Object.keys(parsed).forEach(id => {
        if (base[id]) { base[id].homeScore = parsed[id].homeScore; base[id].awayScore = parsed[id].awayScore }
      })
    } catch { /* ignore */ }
  }
  return base
}

function loadKnockoutScores(): Record<string, KnockoutMatchState> {
  const raw = localStorage.getItem('wc2026_user_saved_knockout') || localStorage.getItem('wc2026_knockout')
  if (raw) { try { return JSON.parse(raw) } catch { /* ignore */ } }
  return {}
}

function loadScorers(): Scorer[] {
  const raw = localStorage.getItem('wc2026_user_saved_scorers') || localStorage.getItem('wc2026_scorers')
  if (raw) { try { return JSON.parse(raw) } catch { /* ignore */ } }
  return [...INITIAL_SCORERS]
}

// ─── State ────────────────────────────────────────────────────────────────────

const activeTab = ref<TabId>('groups')
const language = ref<Language>(loadLanguage())
const playerAlertMessage = ref<string | null>(null)
const importFileRef = ref<HTMLInputElement | null>(null)
const importSuccessMsg = ref<string | null>(null)
const showSimulation = ref(false)
const simulationMode = ref<'groups' | 'full'>('full')
const confirmDialog = ref<{
  show: boolean
  title: string
  desc: string
  confirmLabel: string
  confirmClass: string
  onConfirm: () => void
}>({ show: false, title: '', desc: '', confirmLabel: '', confirmClass: '', onConfirm: () => {} })

function openConfirm(opts: { title: string; desc: string; confirmLabel: string; confirmClass: string; onConfirm: () => void }) {
  confirmDialog.value = { show: true, ...opts }
}
function closeConfirm() { confirmDialog.value.show = false }
const activeGroupFilter = ref('TODOS')
const mobileBracketRound = ref<BracketRound>('R32')
const searchScorerQuery = ref('')
const unsavedMatchIds = ref<Record<string, boolean>>({})
const unsavedKnockoutIds = ref<Record<string, boolean>>({})
const customPlayerName = ref('')
const customPlayerTeam = ref('BRA')
const customPlayerClub = ref('')
const matches = ref<Record<string, Match>>(loadMatches())
const knockoutScores = ref<Record<string, KnockoutMatchState>>(loadKnockoutScores())
const scorers = ref<Scorer[]>(loadScorers())

// ─── Computed ─────────────────────────────────────────────────────────────────

const t = computed(() => TRANSLATIONS[language.value])

const currentStandings = computed(() => calculateAllStandings(matches.value))

const bestThirdPlaces = computed(() => calculateBestThirdPlaces(currentStandings.value))

const qualifiedThirdCodes = computed(() => bestThirdPlaces.value.slice(0, 8).map(x => x.code))

const filteredGroups = computed(() =>
  Object.keys(GROUPS_CONFIG).filter(l => activeGroupFilter.value === 'TODOS' || l === activeGroupFilter.value),
)

const sortedScorers = computed(() => {
  const q = searchScorerQuery.value.toLowerCase().trim()
  return scorers.value
    .filter(s => {
      if (!q) return true
      return s.name.toLowerCase().includes(q) ||
        TEAMS[s.team]?.name.toLowerCase().includes(q) ||
        s.team.toLowerCase().includes(q)
    })
    .sort((a, b) => b.goals - a.goals || a.name.localeCompare(b.name))
})

const knockoutTree = computed(() =>
  buildKnockoutTree(knockoutScores.value, currentStandings.value, bestThirdPlaces.value)
)

// ─── Navigation tabs data ─────────────────────────────────────────────────────

const tabs = computed(() => [
  { id: 'groups' as TabId, label: t.value.groupsTab, icon: Calendar },
  { id: 'knockout' as TabId, label: t.value.knockoutTab, icon: Trophy },
  { id: 'scorers' as TabId, label: t.value.scorersTab, icon: Users },
])

const bracketRounds = computed(() => [
  { id: 'R32' as BracketRound, label: language.value === 'en' ? '16th' : language.value === 'es' ? '16ºs' : '16 avos' },
  { id: 'R16' as BracketRound, label: language.value === 'en' ? '8th'  : language.value === 'es' ? '8ºs'  : 'Oitavas' },
  { id: 'QF'  as BracketRound, label: language.value === 'en' ? 'QF'   : language.value === 'es' ? 'Cuartos' : 'Quartas' },
  { id: 'SF'  as BracketRound, label: language.value === 'en' ? 'Semi' : language.value === 'es' ? 'Semi' : 'Semi' },
  { id: 'F'   as BracketRound, label: language.value === 'en' ? 'Final': language.value === 'es' ? 'Final' : 'Finais' },
])

// ─── Helpers ──────────────────────────────────────────────────────────────────

function teamName(code: string) { return getTeamName(code, language.value) }

function groupMatches(letter: string): Match[] {
  return Object.values(matches.value).filter(m => m.group === letter)
}

function rowBadgeClass(index: number, code: string): string {
  if (index < 2) return 'bg-emerald-500 text-white font-extrabold'
  if (index === 2) {
    return qualifiedThirdCodes.value.includes(code)
      ? 'bg-yellow-500 text-slate-950 font-extrabold'
      : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500 font-extrabold'
  }
  return 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300'
}

function rowBgClass(index: number, code: string): string {
  if (index < 2) return 'bg-emerald-50/30 dark:bg-emerald-900/5 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10'
  if (index === 2) {
    return qualifiedThirdCodes.value.includes(code)
      ? 'bg-yellow-500/5 hover:bg-yellow-500/10'
      : 'bg-amber-500/5 hover:bg-yellow-500/10'
  }
  return 'hover:bg-slate-50/50 dark:hover:bg-slate-700/10'
}

// ─── State mutations ──────────────────────────────────────────────────────────

onMounted(() => {
  const saved = localStorage.getItem('wc2026_language')
  if (saved === 'en' || saved === 'es' || saved === 'pt') language.value = saved
  localStorage.setItem('wc2026_dark_mode', 'false')
  document.documentElement.classList.remove('dark')
})

function changeLanguage(lang: Language) {
  language.value = lang
  localStorage.setItem('wc2026_language', lang)
}

function addSimulatedGoals(teamCode: string, amount: number) {
  const playerName = STAR_PLAYERS[teamCode] || `${teamCode} Star`
  const playerClub = STAR_PLAYER_CLUBS[teamCode] || 'Nenhum'
  const idx = scorers.value.findIndex(s => s.name === playerName && s.team === teamCode)
  if (idx !== -1) scorers.value[idx].goals += amount
  else scorers.value.push({ name: playerName, team: teamCode, goals: amount, club: playerClub })
}

function updateGroupMatchScore(id: string, side: 'homeScore' | 'awayScore', value: string) {
  const numValue = value === '' ? '' : Math.max(0, parseInt(value, 10))
  const prev = matches.value[id]?.[side]
  const prevNum = typeof prev === 'number' ? prev : 0
  const nextNum = typeof numValue === 'number' ? numValue : 0
  const diff = nextNum - prevNum
  if (diff > 0) addSimulatedGoals(side === 'homeScore' ? matches.value[id].home : matches.value[id].away, diff)
  matches.value[id][side] = numValue as number | ''
  unsavedMatchIds.value[id] = true
}

function saveMatchScore(id: string) {
  const match = matches.value[id]
  if (!match) return
  try {
    const saved = localStorage.getItem('wc2026_user_saved_matches')
    const obj = saved ? JSON.parse(saved) : {}
    obj[id] = { homeScore: match.homeScore, awayScore: match.awayScore }
    localStorage.setItem('wc2026_user_saved_matches', JSON.stringify(obj))
  } catch { /* ignore */ }
  delete unsavedMatchIds.value[id]
}

function updateKnockoutScore(id: string, side: 'homeScore' | 'awayScore', value: string) {
  const numValue = value === '' ? '' : Math.max(0, parseInt(value, 10))
  const current = knockoutScores.value[id] ?? { homeScore: '', awayScore: '', penaltyWinner: null }
  const other = side === 'homeScore' ? current.awayScore : current.homeScore
  const penalty = numValue !== '' && other !== '' && numValue !== other ? null : current.penaltyWinner
  knockoutScores.value[id] = { ...current, [side]: numValue as number | '', penaltyWinner: penalty }
  unsavedKnockoutIds.value[id] = true
}

function setKnockoutPenalty(id: string, side: 'home' | 'away') {
  const current = knockoutScores.value[id] ?? { homeScore: '', awayScore: '', penaltyWinner: null }
  knockoutScores.value[id] = { ...current, penaltyWinner: current.penaltyWinner === side ? null : side }
  unsavedKnockoutIds.value[id] = true
}

function saveKnockoutScore(id: string) {
  const match = knockoutScores.value[id] ?? { homeScore: '', awayScore: '', penaltyWinner: null }
  try {
    const saved = localStorage.getItem('wc2026_user_saved_knockout')
    const obj = saved ? JSON.parse(saved) : {}
    obj[id] = { homeScore: match.homeScore, awayScore: match.awayScore, penaltyWinner: match.penaltyWinner }
    localStorage.setItem('wc2026_user_saved_knockout', JSON.stringify(obj))
  } catch { /* ignore */ }
  delete unsavedKnockoutIds.value[id]
}

function confirmSimulateGroups() {
  openConfirm({
    title: t.value.simGroupsTitle,
    desc: t.value.simGroupsDesc,
    confirmLabel: t.value.simGroupsBtn,
    confirmClass: 'bg-blue-600 hover:bg-blue-700 text-white',
    onConfirm: () => { simulationMode.value = 'groups'; showSimulation.value = true; closeConfirm() },
  })
}

function confirmSimulateFull() {
  openConfirm({
    title: t.value.simFullTitle,
    desc: t.value.simFullDesc,
    confirmLabel: t.value.simFullBtn,
    confirmClass: 'gradient-gold-bg hover:opacity-90 text-slate-950',
    onConfirm: () => { simulationMode.value = 'full'; showSimulation.value = true; closeConfirm() },
  })
}

function confirmReset() {
  openConfirm({
    title: t.value.resetTitle,
    desc: t.value.resetConfirm,
    confirmLabel: t.value.yesReset,
    confirmClass: 'bg-red-600 hover:bg-red-700 text-white',
    onConfirm: () => { executeReset(); closeConfirm() },
  })
}

function confirmPdf() {
  openConfirm({
    title: t.value.pdfTitle,
    desc: t.value.pdfDesc,
    confirmLabel: t.value.pdfBtn,
    confirmClass: 'bg-amber-500 hover:bg-amber-600 text-slate-950',
    onConfirm: () => {
      const a = document.createElement('a')
      a.href = '/tabela_copa_2026.pdf'
      a.download = 'tabela_copa_2026.pdf'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      closeConfirm()
    },
  })
}

function confirmExport() {
  openConfirm({
    title: t.value.exportTitle,
    desc: t.value.exportDesc,
    confirmLabel: t.value.exportConfirmBtn,
    confirmClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    onConfirm: () => { exportData(); closeConfirm() },
  })
}

function confirmImport() {
  openConfirm({
    title: t.value.importTitle,
    desc: t.value.importDesc,
    confirmLabel: t.value.importConfirmBtn,
    confirmClass: 'bg-blue-600 hover:bg-blue-700 text-white',
    onConfirm: () => { closeConfirm(); importFileRef.value?.click() },
  })
}

function exportData() {
  const matchesExport: Record<string, { homeScore: number | ''; awayScore: number | '' }> = {}
  Object.entries(matches.value).forEach(([id, m]) => {
    if (m.homeScore !== '' || m.awayScore !== '')
      matchesExport[id] = { homeScore: m.homeScore, awayScore: m.awayScore }
  })
  const data = {
    version: '1',
    exportedAt: new Date().toISOString(),
    matches: JSON.stringify(matchesExport),
    knockout: JSON.stringify(knockoutScores.value),
    scorers: JSON.stringify(scorers.value),
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `wc2026_backup_${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function handleImport(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    try {
      const data = JSON.parse(ev.target?.result as string)
      if (data.matches) localStorage.setItem('wc2026_user_saved_matches', data.matches)
      if (data.knockout) localStorage.setItem('wc2026_user_saved_knockout', data.knockout)
      if (data.scorers) localStorage.setItem('wc2026_user_saved_scorers', data.scorers)
      matches.value = loadMatches()
      knockoutScores.value = loadKnockoutScores()
      scorers.value = loadScorers()
      importSuccessMsg.value = t.value.importSuccess
      setTimeout(() => (importSuccessMsg.value = null), 3000)
    } catch { /* ignore */ }
    ;(e.target as HTMLInputElement).value = ''
  }
  reader.readAsText(file)
}

function executeReset() {
  ['wc2026_user_saved_matches', 'wc2026_user_saved_knockout', 'wc2026_user_saved_scorers',
   'wc2026_matches', 'wc2026_knockout', 'wc2026_scorers'].forEach(k => localStorage.removeItem(k))
  matches.value = generateAllMatches()
  knockoutScores.value = {}
  scorers.value = [...INITIAL_SCORERS]
  customPlayerName.value = ''
  customPlayerClub.value = ''
  activeGroupFilter.value = 'TODOS'
  unsavedMatchIds.value = {}
  unsavedKnockoutIds.value = {}
}

function handleAddPlayer(e: Event) {
  e.preventDefault()
  if (!customPlayerName.value.trim()) return
  const newScorer = {
    name: customPlayerName.value.trim(),
    team: customPlayerTeam.value,
    goals: 0,
    club: customPlayerClub.value.trim() || 'Nenhum',
  }
  if (scorers.value.some(s => s.name === newScorer.name && s.team === newScorer.team)) {
    playerAlertMessage.value = t.value.addScorerError
    setTimeout(() => (playerAlertMessage.value = null), 4000)
    return
  }
  scorers.value.push(newScorer)
  localStorage.setItem('wc2026_user_saved_scorers', JSON.stringify(scorers.value))
  customPlayerName.value = ''
  customPlayerClub.value = ''
}

function incrementGoals(player: { name: string; team: string }) {
  const idx = scorers.value.findIndex(s => s.name === player.name && s.team === player.team)
  if (idx !== -1) {
    scorers.value[idx].goals++
    localStorage.setItem('wc2026_user_saved_scorers', JSON.stringify(scorers.value))
  }
}

function decrementGoals(player: { name: string; team: string }) {
  const idx = scorers.value.findIndex(s => s.name === player.name && s.team === player.team)
  if (idx !== -1) {
    scorers.value[idx].goals = Math.max(0, scorers.value[idx].goals - 1)
    localStorage.setItem('wc2026_user_saved_scorers', JSON.stringify(scorers.value))
  }
}

function deleteScorer(player: { name: string; team: string }) {
  scorers.value = scorers.value.filter(s => !(s.name === player.name && s.team === player.team))
  localStorage.setItem('wc2026_user_saved_scorers', JSON.stringify(scorers.value))
}
</script>

<template>
  <div class="font-sans antialiased selection:bg-yellow-500/30">

    <!-- Skip to content -->
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:bg-white focus:text-blue-900 focus:font-bold focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg"
    >
      Pular para o conteúdo principal
    </a>

    <!-- aria-live para alertas -->
    <div role="status" aria-live="polite" aria-atomic="true" class="sr-only">
      {{ playerAlertMessage }}{{ importSuccessMsg }}
    </div>

    <!-- Toast de importação -->
    <transition enter-active-class="transition-all duration-300" enter-from-class="opacity-0 translate-y-2" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition-all duration-200" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="importSuccessMsg" class="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2 bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xl border border-emerald-500/50 whitespace-nowrap">
        <span class="text-base" aria-hidden="true">✓</span>
        {{ importSuccessMsg }}
      </div>
    </transition>

    <!-- ─── HEADER ──────────────────────────────────────────────────────────── -->
    <header class="fifa-blue-bg border-b-4 fifa-gold-border text-white shadow-xl">
      <div class="max-w-7xl mx-auto px-4 py-3 sm:py-5 flex flex-col lg:flex-row justify-between items-center gap-4 lg:gap-6">

        <!-- Logo + Title -->
        <div class="flex items-center gap-4">
          <div class="bg-white text-blue-900 font-black px-4 py-1.5 rounded italic text-2xl tracking-tighter shadow-lg select-none">
            FIFA
          </div>
          <div class="h-8 w-[2px] bg-blue-400 opacity-50 hidden lg:block" aria-hidden="true"></div>
          <div class="text-center lg:text-left">
            <h1 class="font-display font-black text-lg sm:text-xl uppercase tracking-tight text-white mb-0.5">
              {{ t.title }}
            </h1>
            <div class="flex items-center justify-center lg:justify-start gap-4 text-[10px] uppercase font-semibold text-blue-200 tracking-wider" aria-hidden="true">
              <span>🇺🇸 EUA</span><span class="opacity-50">•</span>
              <span>🇨🇦 Canadá</span><span class="opacity-50">•</span>
              <span>🇲🇽 México</span>
            </div>
          </div>
        </div>

        <!-- Action buttons + Language -->
        <div class="flex flex-col items-center justify-center gap-2 w-full lg:w-auto select-none mt-2 lg:mt-0 sm:flex-row sm:flex-wrap lg:flex-nowrap">

          <!-- Row 1: Simulate buttons -->
          <div class="flex items-center justify-center gap-1.5 w-full sm:w-auto">
            <button @click="confirmSimulateGroups" class="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/15 rounded-lg text-xs font-bold transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-sm whitespace-nowrap" :title="t.simGroups">
              <Compass class="w-3.5 h-3.5 text-blue-300" aria-hidden="true" />
              <span>{{ t.simGroups }}</span>
            </button>
            <button @click="confirmSimulateFull" class="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 sm:py-1.5 gradient-gold-bg hover:opacity-90 text-slate-950 rounded-lg text-xs font-extrabold transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-lg cursor-pointer whitespace-nowrap shadow-amber-500/10" :title="t.simFull">
              <Trophy class="w-3.5 h-3.5 text-blue-900" aria-hidden="true" />
              <span class="text-blue-950">{{ t.simFull }}</span>
            </button>
          </div>

          <!-- Row 2: Reset + PDF + Export + Import -->
          <div class="flex items-center justify-center gap-1.5 w-full sm:w-auto">
            <button @click="confirmReset" class="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 bg-white/5 hover:bg-red-500/20 hover:text-red-200 border border-white/10 rounded-lg text-xs font-bold transition-all active:scale-95 whitespace-nowrap" :title="t.resetBtn">
              <RefreshCw class="w-3.5 h-3.5 text-red-400" aria-hidden="true" />
              <span>{{ t.resetBtn }}</span>
            </button>
            <button @click="confirmPdf" class="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold border border-amber-400 rounded-lg text-xs transition-all hover:scale-105 active:scale-95 shadow-sm whitespace-nowrap" :title="t.pdfTitle">
              <Printer class="w-3.5 h-3.5 text-slate-950" aria-hidden="true" />
              <span>PDF</span>
            </button>
            <button @click="confirmExport" class="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-500 rounded-lg text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-sm whitespace-nowrap" :title="t.exportBtn">
              <Download class="w-3.5 h-3.5" aria-hidden="true" />
              <span>{{ t.exportBtn }}</span>
            </button>
            <button @click="confirmImport" class="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/15 rounded-lg text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-sm whitespace-nowrap" :title="t.importBtn">
              <Upload class="w-3.5 h-3.5" aria-hidden="true" />
              <span>{{ t.importBtn }}</span>
            </button>
            <input ref="importFileRef" type="file" accept=".json" class="hidden" @change="handleImport" aria-hidden="true" />
          </div>

          <!-- Row 3: Language selector — sua própria linha no mobile, inline no sm+ -->
          <div role="group" aria-label="Idioma" class="flex bg-blue-950/40 p-1 rounded-lg border border-white/10 gap-0.5 sm:gap-1 shrink-0">
            <button v-for="lang in (['pt','en','es'] as Language[])" :key="lang" @click="changeLanguage(lang)" :aria-pressed="language === lang" :class="`px-1.5 sm:px-2 py-1 rounded text-[9px] sm:text-[10px] font-black transition-all cursor-pointer ${language === lang ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:text-white hover:bg-white/5'}`" :title="lang === 'pt' ? 'Português' : lang === 'en' ? 'English' : 'Español'">
              {{ lang.toUpperCase() }}
            </button>
          </div>

        </div>
      </div>

      <!-- Desktop tab nav -->
      <div class="hidden md:block border-t border-blue-900/50 bg-blue-950/30 backdrop-blur-md">
        <div class="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <nav role="tablist" aria-label="Seções do simulador" class="flex -mb-px gap-1 sm:gap-2 w-full justify-between sm:justify-start">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              role="tab"
              :aria-selected="activeTab === tab.id"
              :aria-controls="`tabpanel-${tab.id}`"
              :id="`tab-${tab.id}`"
              @click="activeTab = tab.id"
              :class="`flex-1 sm:flex-initial flex items-center justify-center gap-1 sm:gap-2 px-1.5 sm:px-5 py-3.5 sm:py-4 border-b-4 font-display text-[10px] sm:text-xs font-bold uppercase tracking-wider sm:tracking-widest transition-all cursor-pointer whitespace-nowrap ${activeTab === tab.id ? 'border-[#c5a059] text-white bg-white/5' : 'border-transparent text-blue-200 hover:text-white hover:bg-white/5'}`"
            >
              <component :is="tab.icon" :class="`w-3.5 h-3.5 shrink-0 ${activeTab === tab.id ? 'text-[#c5a059]' : 'text-blue-300/75'}`" aria-hidden="true" />
              <span>{{ tab.label }}</span>
            </button>
          </nav>
          <div class="hidden md:flex items-center gap-1.5 text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full uppercase font-bold tracking-wider animate-pulse shrink-0" aria-hidden="true">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span class="font-mono">{{ t.liveTracker }}</span>
          </div>
        </div>
      </div>
    </header>

    <!-- ─── MAIN ────────────────────────────────────────────────────────────── -->
    <main id="main-content" class="max-w-7xl mx-auto px-4 py-8 pb-32 md:pb-12">

      <!-- VIEW: GROUPS ──────────────────────────────────────────────────────── -->
      <div v-if="activeTab === 'groups'" role="tabpanel" id="tabpanel-groups" aria-labelledby="tab-groups" class="space-y-8 animate-fadeIn">

        <!-- Filter bar -->
        <div class="bento-card p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 class="font-display font-extrabold text-2xl text-slate-800 flex items-center gap-2">
              <span class="fifa-gold-color">12</span>
              {{ language === 'en' ? 'Official Groups' : language === 'es' ? 'Grupos Oficiales' : 'Grupos Oficiais' }}
            </h2>
            <p class="text-xs text-slate-400 mt-1">
              {{ language === 'en' ? 'Top two teams advance. Eight best third-placed teams join in the Round of 32.' : language === 'es' ? 'Los dos mejores avanzan. Los ocho mejores terceros clasifican a dieciseisavos.' : 'Os dois melhores avançam direto. Os oito melhores terceiros colocados passam para a próxima etapa.' }}
            </p>
          </div>
          <div class="flex items-center gap-2 w-full md:w-auto">
            <label for="group-filter" class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{{ t.filterGroup }}</label>
            <select id="group-filter" v-model="activeGroupFilter" class="bg-slate-50 text-slate-700 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-[#c5a059] w-full md:w-40 transition-all">
              <option value="TODOS">{{ language === 'en' ? 'All Groups' : 'Ver Todos' }}</option>
              <option v-for="l in Object.keys(GROUPS_CONFIG)" :key="l" :value="l">{{ t.groupLabel }} {{ l }}</option>
            </select>
          </div>
        </div>

        <!-- Bento dashboard (shown only when All groups) -->
        <div v-if="activeGroupFilter === 'TODOS'" class="grid grid-cols-1 lg:grid-cols-12 gap-6">

          <!-- Grand Final banner -->
          <div class="lg:col-span-6 bento-card overflow-hidden flex flex-col justify-between">
            <div class="gradient-gold-bg p-6 text-white flex-1 flex flex-col items-center justify-center gap-4 text-center min-h-[170px]">
              <span class="text-[10px] font-black tracking-widest uppercase opacity-85 bg-black/10 px-2.5 py-1 rounded-full">{{ t.f }}</span>
              <div class="flex items-center gap-2 sm:gap-6 justify-center w-full">
                <div class="text-center w-24 sm:w-28">
                  <div class="text-3xl sm:text-4xl mb-1">{{ knockoutTree.F.home ? TEAMS[knockoutTree.F.home]?.flag : '❓' }}</div>
                  <div class="text-[10px] sm:text-xs font-black tracking-wide uppercase truncate">
                    {{ knockoutTree.F.home ? teamName(knockoutTree.F.home) : t.finalist_1 }}
                  </div>
                </div>
                <div class="text-xl sm:text-2xl font-black italic text-blue-950 opacity-80 select-none" aria-hidden="true">VS</div>
                <div class="text-center w-24 sm:w-28">
                  <div class="text-3xl sm:text-4xl mb-1">{{ knockoutTree.F.away ? TEAMS[knockoutTree.F.away]?.flag : '❓' }}</div>
                  <div class="text-[10px] sm:text-xs font-black tracking-wide uppercase truncate">
                    {{ knockoutTree.F.away ? teamName(knockoutTree.F.away) : t.finalist_2 }}
                  </div>
                </div>
              </div>
              <div class="text-center">
                <div class="font-extrabold text-[#111827] text-[11px] sm:text-xs">MetLife Stadium, New Jersey</div>
                <div class="text-[8px] sm:text-[9px] text-[#111827] opacity-80 font-bold uppercase tracking-wider">19 {{ language === 'en' ? 'July' : language === 'es' ? 'Julio' : 'Julho' }} 2026 • 20:00</div>
              </div>
            </div>
            <!-- Semifinals preview -->
            <div class="p-4 bg-white flex flex-col gap-2 border-t border-slate-100">
              <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{{ t.favoritePath }}</div>
              <div class="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-0 text-xs">
                <div class="flex flex-col gap-1 w-full sm:w-28 text-left">
                  <div class="bg-slate-50 p-1.5 rounded text-[9px] flex justify-between items-center">
                    <span class="font-semibold text-slate-700 truncate max-w-[120px] sm:max-w-[70px]">{{ knockoutTree.SF[0]?.home ? teamName(knockoutTree.SF[0].home) : t.quarter_1 }}</span>
                    <span class="font-bold text-slate-900 font-mono">{{ knockoutTree.SF[0]?.homeScore !== '' ? knockoutTree.SF[0]?.homeScore : '-' }}</span>
                  </div>
                  <div class="bg-slate-50 p-1.5 rounded text-[9px] flex justify-between items-center">
                    <span class="font-semibold text-slate-700 truncate max-w-[120px] sm:max-w-[70px]">{{ knockoutTree.SF[0]?.away ? teamName(knockoutTree.SF[0].away) : t.quarter_2 }}</span>
                    <span class="font-bold text-slate-900 font-mono">{{ knockoutTree.SF[0]?.awayScore !== '' ? knockoutTree.SF[0]?.awayScore : '-' }}</span>
                  </div>
                </div>
                <div class="hidden sm:block h-[1px] flex-1 bg-slate-200 mx-2" aria-hidden="true"></div>
                <div class="self-center bg-slate-100 text-slate-500 py-1 px-3 sm:px-2 rounded-md text-[8px] font-bold text-center uppercase tracking-wider">SF</div>
                <div class="hidden sm:block h-[1px] flex-1 bg-slate-200 mx-2" aria-hidden="true"></div>
                <div class="flex flex-col gap-1 w-full sm:w-28 text-left">
                  <div class="bg-slate-50 p-1.5 rounded text-[9px] flex justify-between items-center">
                    <span class="font-semibold text-slate-700 truncate max-w-[120px] sm:max-w-[70px]">{{ knockoutTree.SF[1]?.home ? teamName(knockoutTree.SF[1].home) : t.quarter_3 }}</span>
                    <span class="font-bold text-slate-900 font-mono">{{ knockoutTree.SF[1]?.homeScore !== '' ? knockoutTree.SF[1]?.homeScore : '-' }}</span>
                  </div>
                  <div class="bg-slate-50 p-1.5 rounded text-[9px] flex justify-between items-center">
                    <span class="font-semibold text-slate-700 truncate max-w-[120px] sm:max-w-[70px]">{{ knockoutTree.SF[1]?.away ? teamName(knockoutTree.SF[1].away) : t.quarter_4 }}</span>
                    <span class="font-bold text-slate-900 font-mono">{{ knockoutTree.SF[1]?.awayScore !== '' ? knockoutTree.SF[1]?.awayScore : '-' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Stats + Arenas -->
          <div class="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div class="bento-card p-5 bg-slate-900 text-white flex flex-col justify-between relative overflow-hidden select-none min-h-[170px]">
              <div class="absolute top-0 right-0 p-4 opacity-10 text-6xl font-black text-white/50 pointer-events-none" aria-hidden="true">STATS</div>
              <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-[#c5a059]" aria-hidden="true"></span>
                {{ t.stats }}
              </div>
              <div class="space-y-3.5">
                <div class="flex justify-between items-center border-b border-white/5 pb-1.5">
                  <span class="text-xs text-slate-400">{{ t.totalMatches }}</span>
                  <div class="text-right"><span class="text-xl font-black text-[#c5a059] block leading-none">104</span><span class="text-[8px] text-slate-500 uppercase font-bold tracking-tight">{{ language === 'en' ? 'Official Games' : language === 'es' ? 'Partidos Oficiales' : 'Jogos Oficiais' }}</span></div>
                </div>
                <div class="flex justify-between items-center border-b border-white/5 pb-1.5">
                  <span class="text-xs text-slate-400">{{ t.registeredSec }}</span>
                  <div class="text-right"><span class="text-xl font-black text-[#c5a059] block leading-none">48</span><span class="text-[8px] text-slate-500 uppercase font-bold tracking-tight">{{ t.registeredFiliados }}</span></div>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-xs text-slate-400">{{ t.citySedeLabel }}</span>
                  <div class="text-right"><span class="text-xl font-black text-[#c5a059] block leading-none">16</span><span class="text-[8px] text-slate-500 uppercase font-bold tracking-tight">{{ t.stadiumCityLabel }}</span></div>
                </div>
              </div>
            </div>
            <div class="bento-card p-5 bg-white flex flex-col justify-between min-h-[170px]">
              <div>
                <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-blue-500" aria-hidden="true"></span>
                  {{ t.arenasLabel }}
                </div>
                <div class="space-y-3">
                  <div v-for="arena in [['Estadio Azteca', language === 'en' ? 'Mexico City, MEX' : language === 'es' ? 'Ciudad de México, MEX' : 'Cidade do México, MEX'], ['SoFi Stadium', 'Los Angeles, USA'], ['BC Place', 'Vancouver, CAN']]" :key="arena[0]" class="flex items-center gap-2.5">
                    <div class="w-1.5 h-1.5 rounded-full bg-[#0033a0] shrink-0" aria-hidden="true"></div>
                    <div class="truncate">
                      <div class="text-xs font-extrabold text-slate-800">{{ arena[0] }}</div>
                      <div class="text-[9px] text-slate-400">{{ arena[1] }}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-2 border-t pt-2 border-slate-100 text-right">
                {{ language === 'en' ? 'Canada • Mexico • USA' : language === 'es' ? 'Canadá • México • EE.UU.' : 'Canadá • México • EUA' }}
              </div>
            </div>
          </div>
        </div>

        <!-- Groups grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div v-for="groupLetter in filteredGroups" :key="groupLetter" class="bento-card overflow-hidden flex flex-col flex-1">

            <!-- Group header -->
            <div class="px-6 py-4 bg-[#0033a0] text-white flex justify-between items-center border-b border-blue-950/20">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-lg bg-[#c5a059] flex items-center justify-center text-white font-black text-lg shadow-sm" aria-hidden="true">{{ groupLetter }}</div>
                <span class="font-display font-extrabold text-lg tracking-wide uppercase">{{ t.groupLabel }} {{ groupLetter }}</span>
              </div>
              <span class="text-xs font-mono text-blue-200/80 tracking-wider" aria-hidden="true">FIFA WC 2026</span>
            </div>

            <div class="p-5 space-y-6 flex-1">
              <!-- Standings table -->
              <div class="overflow-x-auto border border-slate-100 rounded-2xl max-w-full shadow-inner">
                <table :aria-label="`${t.standings} — ${t.groupLabel} ${groupLetter}`" class="w-full min-w-[540px] sm:min-w-full text-left text-xs">
                  <thead class="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100 text-[10px]">
                    <tr>
                      <th scope="col" class="py-3 px-3 text-center w-8">#</th>
                      <th scope="col" class="py-3 px-3">{{ t.t_team }}</th>
                      <th scope="col" class="py-3 px-1 text-center w-7">{{ t.t_j }}</th>
                      <th scope="col" class="py-3 px-1 text-center w-7">{{ t.t_v }}</th>
                      <th scope="col" class="py-3 px-1 text-center w-7 text-slate-400">{{ t.t_e }}</th>
                      <th scope="col" class="py-3 px-1 text-center w-7 text-slate-400 border-r border-slate-200/50">{{ t.t_d }}</th>
                      <th scope="col" class="py-3 px-1.5 text-center w-7">{{ t.t_gp }}</th>
                      <th scope="col" class="py-3 px-1.5 text-center w-7">{{ t.t_gc }}</th>
                      <th scope="col" class="py-3 px-2 text-center w-9 font-medium">{{ t.t_sg }}</th>
                      <th scope="col" class="py-3 px-4 text-center w-12 font-black bg-blue-100/50 text-blue-600">{{ t.t_pts }}</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    <tr v-for="(row, index) in currentStandings[groupLetter]" :key="row.code" :class="`${rowBgClass(index, row.code)} transition-all duration-150`">
                      <td class="py-3 px-2 text-center">
                        <span :class="`w-5 h-5 rounded-full inline-flex items-center justify-center text-[10px] ${rowBadgeClass(index, row.code)}`">{{ index + 1 }}</span>
                      </td>
                      <td class="py-3 px-3"><TeamFlag :code="row.code" :lang="language" class="max-w-[130px]" /></td>
                      <td class="py-3 px-1 text-center font-semibold font-mono">{{ row.j }}</td>
                      <td class="py-3 px-1 text-center font-mono">{{ row.v }}</td>
                      <td class="py-3 px-1 text-center font-mono text-slate-400">{{ row.e }}</td>
                      <td class="py-3 px-1 text-center font-mono text-slate-400 border-r border-slate-100">{{ row.d }}</td>
                      <td class="py-3 px-1.5 text-center font-mono">{{ row.gp }}</td>
                      <td class="py-3 px-1.5 text-center font-mono text-slate-400">{{ row.gc }}</td>
                      <td :class="`py-3 px-2 text-center font-bold font-mono ${row.sg > 0 ? 'text-emerald-500' : row.sg < 0 ? 'text-red-500' : ''}`">{{ row.sg > 0 ? `+${row.sg}` : row.sg }}</td>
                      <td class="py-3 px-4 text-center font-extrabold bg-blue-100/30 text-blue-700 text-sm font-mono border-l border-slate-100">{{ row.pts }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Match list -->
              <div class="space-y-3.5">
                <div class="flex justify-between items-center">
                  <span class="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Calendar class="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                    {{ t.historyMatches }}
                  </span>
                </div>
                <div class="space-y-2.5">
                  <div v-for="m in groupMatches(groupLetter)" :key="m.id" class="bg-slate-50 border border-slate-100 rounded-2xl p-3 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
                    <div class="flex-1 flex items-center justify-center md:justify-end gap-2.5 w-full md:w-auto">
                      <TeamFlag :code="m.home" :lang="language" class="md:flex-row-reverse md:text-right" flag-class="hidden md:inline" />
                    </div>
                    <div class="flex items-center gap-2 w-full md:w-auto justify-center">
                      <div class="flex items-center gap-1.5 px-3 py-1 bg-white rounded-xl border border-slate-200/60 pl-4 w-full md:w-auto justify-center shadow-inner">
                        <TeamFlag :code="m.home" :lang="language" hide-name class="md:hidden" />
                        <input type="number" min="0" :value="m.homeScore" @input="(e: Event) => updateGroupMatchScore(m.id, 'homeScore', (e.target as HTMLInputElement).value)" :aria-label="`Gols ${TEAMS[m.home]?.name || m.home}`" placeholder="-" class="w-11 h-8 text-center font-mono font-black text-base text-slate-800 bg-slate-100/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 border border-slate-200" />
                        <span aria-hidden="true" class="font-bold text-slate-400 text-sm">×</span>
                        <input type="number" min="0" :value="m.awayScore" @input="(e: Event) => updateGroupMatchScore(m.id, 'awayScore', (e.target as HTMLInputElement).value)" :aria-label="`Gols ${TEAMS[m.away]?.name || m.away}`" placeholder="-" class="w-11 h-8 text-center font-mono font-black text-base text-slate-800 bg-slate-100/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 border border-slate-200" />
                        <TeamFlag :code="m.away" :lang="language" hide-name class="md:hidden" />
                      </div>
                      <button v-if="unsavedMatchIds[m.id]" @click="saveMatchScore(m.id)" class="flex items-center justify-center w-9 h-9 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl hover:scale-105 active:scale-95 shadow transition-all cursor-pointer animate-pulse shrink-0 font-bold" title="Salvar resultado">
                        <Save class="w-4 h-4 text-slate-950" :stroke-width="3" aria-hidden="true" />
                      </button>
                    </div>
                    <div class="flex-1 flex items-center justify-center md:justify-start gap-2.5 w-full md:w-auto">
                      <TeamFlag :code="m.away" :lang="language" flag-class="hidden md:inline" />
                    </div>
                    <div class="w-full md:w-auto md:min-w-[120px] text-center md:text-right flex md:flex-col justify-between items-center md:items-end text-[10px] text-slate-400 md:border-l md:border-slate-200/50 md:pl-3 pt-2 md:pt-0 border-t border-dashed md:border-t-0 border-slate-200/50">
                      <div class="flex items-center gap-1"><Calendar class="w-3 h-3 text-slate-400" aria-hidden="true" /><span>{{ m.date }} - {{ m.time }}</span></div>
                      <div class="flex items-center gap-0.5 mt-0.5"><MapPin class="w-3 h-3 text-yellow-600/60" aria-hidden="true" /><span class="truncate max-w-[100px]" :title="`${m.stadium}, ${m.stadiumCity}`">{{ m.stadiumCity }}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Best 3rd places -->
        <div class="bg-white border border-slate-150 p-6 rounded-3xl shadow-sm">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5 border-b border-slate-100 pb-4">
            <div class="flex items-center gap-3">
              <div class="p-2 py-1 bg-yellow-500/10 text-yellow-600 rounded-xl"><Trophy class="w-6 h-6" aria-hidden="true" /></div>
              <div>
                <h3 class="font-display font-extrabold text-lg text-slate-800 flex items-center gap-2">{{ t.ruleTitle }}</h3>
                <p class="text-xs text-slate-400 mt-0.5">{{ t.ruleDesc }}</p>
              </div>
            </div>
            <div class="px-3.5 py-1.5 bg-slate-50 border text-[10px] font-mono rounded-lg uppercase tracking-wider text-slate-500">{{ t.ruleFIFA }}</div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div v-for="(rank, idx) in bestThirdPlaces" :key="rank.code" :class="`border p-4 rounded-2xl flex items-center justify-between text-xs transition-all relative overflow-hidden ${idx < 8 ? 'border-emerald-500/30 bg-emerald-500/5 text-slate-800' : 'border-slate-200/50 bg-slate-50/50 text-slate-400'}`">
              <div :class="`absolute top-0 bottom-0 left-0 w-1.5 ${idx < 8 ? 'bg-emerald-500' : 'bg-slate-300'}`" aria-hidden="true"></div>
              <div class="flex items-center gap-3.5 pl-2">
                <span :class="`font-mono text-xs font-bold ${idx < 8 ? 'text-emerald-500' : 'text-slate-400'}`">{{ idx + 1 }}º</span>
                <div>
                  <TeamFlag :code="rank.code" :lang="language" text-class="text-xs font-extrabold" />
                  <div class="text-[10px] text-slate-400 mt-0.5">{{ t.groupLabel }} {{ rank.group }}</div>
                </div>
              </div>
              <div class="flex items-center gap-4 text-right pr-1">
                <div>
                  <p class="text-[10px] text-slate-400 uppercase font-mono">Pts / SG</p>
                  <p class="font-mono text-xs font-bold leading-none mt-1">
                    <span class="text-xs font-black">{{ rank.pts }}</span>
                    <span class="mx-1 text-slate-400">/</span>
                    <span :class="rank.sg > 0 ? 'text-emerald-500' : rank.sg < 0 ? 'text-red-500' : ''">{{ rank.sg > 0 ? `+${rank.sg}` : rank.sg }}</span>
                  </p>
                </div>
                <div>
                  <span v-if="idx < 8" class="text-emerald-500 text-xs shadow-sm bg-emerald-500/10 py-0.5 px-2 rounded-full font-extrabold font-mono tracking-tighter">Oitavas-32</span>
                  <span v-else class="text-slate-400 text-xs py-0.5 px-2 bg-slate-100 rounded-full font-mono font-extrabold">Eliminado</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- VIEW: KNOCKOUT ────────────────────────────────────────────────────── -->
      <div v-else-if="activeTab === 'knockout'" role="tabpanel" id="tabpanel-knockout" aria-labelledby="tab-knockout" class="space-y-8 animate-fadeIn">

        <!-- Hero banner -->
        <div class="relative bg-gradient-to-r from-blue-900 to-indigo-950 p-6 md:p-8 rounded-3xl text-white shadow-xl overflow-hidden border border-indigo-950/20">
          <div class="absolute top-0 right-0 p-4 opacity-10 text-9xl font-black italic select-none pointer-events-none transform translate-x-12 translate-y-2" aria-hidden="true">FINAL</div>
          <div class="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div class="flex items-center gap-2 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-widest uppercase w-max">
                <Crown class="w-3 h-3 text-yellow-500 animate-pulse" aria-hidden="true" />
                Grande Final • New Jersey
              </div>
              <h2 class="font-display font-black text-3xl mt-3 tracking-wide leading-none uppercase md:text-4xl text-slate-100">
                {{ language === 'en' ? 'Knockout Stage' : language === 'es' ? 'Fase Eliminatoria' : 'Chaveamento do Mata-Mata' }}
              </h2>
              <p class="text-sm text-indigo-200/80 mt-2 max-w-xl">
                {{ language === 'en' ? 'Fill in the scores for each match. On draws, click the team flag to decide the penalty winner.' : language === 'es' ? 'Complete los marcadores de cada partido. En empates, haga clic en la bandera para decidir el ganador por penales.' : 'Preencha os placares de cada partida. Em caso de empates, clique na bandeira para decidir nos pênaltis.' }}
              </p>
            </div>
            <div class="p-4 bg-slate-950/50 backdrop-blur-sm border border-slate-800 rounded-2xl flex items-center gap-4 text-xs">
              <div class="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/25 flex items-center justify-center text-yellow-500 text-xl font-bold" aria-hidden="true">🏟️</div>
              <div>
                <p class="font-bold text-slate-100">MetLife Stadium</p>
                <p class="text-[10px] text-slate-400 mt-0.5">East Rutherford, New Jersey</p>
                <p class="text-[10px] text-yellow-500 font-extrabold mt-0.5 uppercase tracking-widest">19 de Julho de 2026</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Mobile round selector -->
        <div class="flex md:hidden bg-slate-100 p-1 rounded-2xl border border-slate-200/80 gap-0.5 sm:gap-1 mb-5 select-none shadow-sm">
          <button v-for="round in bracketRounds" :key="round.id" type="button" @click="mobileBracketRound = round.id" :aria-pressed="mobileBracketRound === round.id" :class="`flex-1 text-center py-2.5 rounded-xl text-[9px] min-[360px]:text-[10px] min-[400px]:text-xs font-black uppercase tracking-tight min-[400px]:tracking-wider transition-all cursor-pointer ${mobileBracketRound === round.id ? 'bg-[#0033a0] text-white shadow-md' : 'text-slate-500 hover:bg-slate-200/30'}`">
            {{ round.label }}
          </button>
        </div>

        <!-- Bracket -->
        <div class="overflow-x-auto md:pb-10 cursor-grab active:cursor-grabbing">
          <div class="md:min-w-[1300px] w-full flex flex-col md:flex-row gap-10 items-stretch">

            <!-- R32 -->
            <div :class="`w-full md:w-80 flex flex-col gap-4 ${mobileBracketRound === 'R32' ? 'block' : 'hidden md:flex'}`">
              <div class="sticky top-0 bg-slate-50 py-2.5 z-10 border-b border-slate-200/60 mb-2">
                <p class="font-display font-black text-xs uppercase tracking-widest text-[#0033a0] flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" aria-hidden="true"></span>
                  {{ t.r32 }}
                </p>
                <span class="text-[10px] text-slate-400 mt-0.5 block">16 {{ language === 'en' ? 'matches' : 'partidas' }} • 30 {{ language === 'en' ? 'June' : language === 'es' ? 'Junio' : 'Junho' }}</span>
              </div>
              <div class="space-y-4">
                <KnockoutMatchItem v-for="match in knockoutTree.R32" :key="match.matchId" :match="match" :is-unsaved="!!unsavedKnockoutIds[match.matchId]" @score-change="updateKnockoutScore" @set-penalty="setKnockoutPenalty" @save="saveKnockoutScore" />
              </div>
            </div>

            <!-- R16 -->
            <div :class="`w-full md:w-80 flex flex-col gap-4 justify-around md:mt-8 ${mobileBracketRound === 'R16' ? 'block' : 'hidden md:flex'}`">
              <div class="sticky top-0 bg-slate-50 py-2.5 z-10 border-b border-slate-200/60 mb-2">
                <p class="font-display font-black text-xs uppercase tracking-widest text-purple-600 flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" aria-hidden="true"></span>
                  {{ t.r16 }}
                </p>
                <span class="text-[10px] text-slate-400 mt-0.5 block">8 {{ language === 'en' ? 'matches' : 'partidas' }} • 05 {{ language === 'en' ? 'July' : language === 'es' ? 'Julio' : 'Julho' }}</span>
              </div>
              <div class="space-y-4 md:space-y-24">
                <KnockoutMatchItem v-for="match in knockoutTree.R16" :key="match.matchId" :match="match" :is-unsaved="!!unsavedKnockoutIds[match.matchId]" @score-change="updateKnockoutScore" @set-penalty="setKnockoutPenalty" @save="saveKnockoutScore" />
              </div>
            </div>

            <!-- QF -->
            <div :class="`w-full md:w-80 flex flex-col gap-4 justify-around md:mt-12 ${mobileBracketRound === 'QF' ? 'block' : 'hidden md:flex'}`">
              <div class="sticky top-0 bg-slate-50 py-2.5 z-10 border-b border-slate-200/60 mb-2">
                <p class="font-display font-black text-xs uppercase tracking-widest text-amber-600 flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" aria-hidden="true"></span>
                  {{ t.qf }}
                </p>
                <span class="text-[10px] text-slate-400 mt-0.5 block">4 {{ language === 'en' ? 'matches' : 'partidas' }} • 09 {{ language === 'en' ? 'July' : language === 'es' ? 'Julio' : 'Julho' }}</span>
              </div>
              <div class="space-y-4 md:space-y-64">
                <KnockoutMatchItem v-for="match in knockoutTree.QF" :key="match.matchId" :match="match" :is-unsaved="!!unsavedKnockoutIds[match.matchId]" @score-change="updateKnockoutScore" @set-penalty="setKnockoutPenalty" @save="saveKnockoutScore" />
              </div>
            </div>

            <!-- SF -->
            <div :class="`w-full md:w-80 flex flex-col gap-4 justify-around md:mt-16 ${mobileBracketRound === 'SF' ? 'block' : 'hidden md:flex'}`">
              <div class="sticky top-0 bg-slate-50 py-2.5 z-10 border-b border-slate-200/60 mb-2">
                <p class="font-display font-black text-xs uppercase tracking-widest text-red-600 flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-red-400 shrink-0" aria-hidden="true"></span>
                  {{ t.sf }}
                </p>
                <span class="text-[10px] text-slate-400 mt-0.5 block">2 {{ language === 'en' ? 'matches' : 'partidas' }} • 14 {{ language === 'en' ? 'July' : language === 'es' ? 'Julio' : 'Julho' }}</span>
              </div>
              <div class="space-y-4 md:space-y-[450px]">
                <KnockoutMatchItem v-for="match in knockoutTree.SF" :key="match.matchId" :match="match" :is-unsaved="!!unsavedKnockoutIds[match.matchId]" @score-change="updateKnockoutScore" @set-penalty="setKnockoutPenalty" @save="saveKnockoutScore" />
              </div>
            </div>

            <!-- Finals -->
            <div :class="`w-full md:w-80 flex flex-col gap-6 justify-center md:mt-20 ${mobileBracketRound === 'F' ? 'block' : 'hidden md:flex'}`">
              <!-- Champion -->
              <div v-if="knockoutTree.F.winner" class="bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 p-0.5 rounded-3xl shadow-xl flex flex-col items-center justify-center mb-6 border border-slate-900/10">
                <div class="bg-slate-950 px-5 py-6 rounded-[22px] w-full text-center flex flex-col items-center">
                  <Crown class="w-10 h-10 text-yellow-500 animate-pulse mb-2" aria-hidden="true" />
                  <span class="font-display font-black text-[10px] tracking-widest text-yellow-500 uppercase block">Campeão Mundial</span>
                  <div class="mt-2.5 scale-125 transform">
                    <TeamFlag :code="knockoutTree.F.winner" :lang="language" text-class="font-black text-xl text-white" />
                  </div>
                  <span class="text-[9px] text-slate-500 mt-2 font-mono">FIFA WORLD CUP 2026™</span>
                </div>
              </div>
              <!-- Grand Final -->
              <div class="space-y-3 border-b border-slate-200/50 pb-5 mb-5">
                <div class="bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 text-[10px] text-center font-extrabold uppercase py-1.5 px-3 rounded-xl tracking-widest shadow-sm">🏆 {{ t.f }}</div>
                <KnockoutMatchItem :match="knockoutTree.F" :is-emphasized="true" :is-unsaved="!!unsavedKnockoutIds['F-1']" @score-change="updateKnockoutScore" @set-penalty="setKnockoutPenalty" @save="saveKnockoutScore" />
              </div>
              <!-- 3rd Place -->
              <div class="space-y-3">
                <div class="bg-slate-100 border border-slate-200 text-slate-500 text-[10px] text-center font-bold uppercase py-1.5 px-3 rounded-xl tracking-widest">🥉 {{ t.tp }}</div>
                <KnockoutMatchItem :match="knockoutTree.TP" :is-unsaved="!!unsavedKnockoutIds['TP-1']" @score-change="updateKnockoutScore" @set-penalty="setKnockoutPenalty" @save="saveKnockoutScore" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- VIEW: SCORERS ─────────────────────────────────────────────────────── -->
      <div v-else role="tabpanel" id="tabpanel-scorers" aria-labelledby="tab-scorers" class="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-fadeIn">

        <!-- Left panel -->
        <div class="lg:col-span-1 space-y-6">
          <div class="bg-gradient-to-br from-indigo-950 to-slate-900 border border-indigo-950 p-6 rounded-3xl text-white shadow-md relative overflow-hidden">
            <div class="absolute top-0 right-0 p-4 font-black opacity-10 text-7xl select-none italic" aria-hidden="true">GOALS</div>
            <div class="relative z-10">
              <h3 class="font-display font-extrabold text-lg text-slate-100 flex items-center gap-2">
                <Award class="w-5 h-5 text-yellow-500" aria-hidden="true" />
                {{ language === 'en' ? 'Golden Boot' : language === 'es' ? 'Bota de Oro' : 'Chuteira de Ouro' }}
              </h3>
              <p class="text-xs text-slate-300 mt-2 leading-relaxed">
                {{ language === 'en' ? 'Track and edit the top scorers of the 2026 World Cup in real time.' : language === 'es' ? 'Sigue y edita los goleadores de la Copa 2026 en tiempo real.' : 'Acompanhe em tempo real e edite os principais goleadores da Copa de 2026.' }}
              </p>
            </div>
          </div>

          <!-- Search -->
          <div class="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-4">
            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-widest">{{ language === 'en' ? 'Filter Players' : language === 'es' ? 'Filtrar Jugadores' : 'Filtrar Atletas' }}</h4>
            <div class="relative">
              <input type="text" v-model="searchScorerQuery" :placeholder="t.searchPlaceholder" :aria-label="t.searchPlaceholder" class="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all font-semibold" />
              <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" aria-hidden="true" />
            </div>
          </div>

          <!-- Add player form -->
          <div class="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-4">
            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
              <Plus class="w-4 h-4 text-slate-400" aria-hidden="true" />
              {{ language === 'en' ? 'Register New Player' : language === 'es' ? 'Registrar Jugador' : 'Cadastrar Novo Atleta' }}
            </h4>
            <form @submit="handleAddPlayer" class="space-y-4">
              <div>
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5" for="player-name">{{ t.playerName }}</label>
                <input id="player-name" type="text" required v-model="customPlayerName" :placeholder="t.addScorerPlaceholder" class="w-full px-3.5 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 font-semibold" />
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5" for="player-team">{{ t.countryLabel }}</label>
                  <select id="player-team" v-model="customPlayerTeam" class="w-full px-3.5 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 font-bold">
                    <option v-for="[code, team] in Object.entries(TEAMS)" :key="code" :value="code">{{ team.flag }} {{ team.name }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5" for="player-club">{{ t.club }}</label>
                  <input id="player-club" type="text" v-model="customPlayerClub" :placeholder="t.clubPlaceholder" class="w-full px-3.5 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 font-semibold" />
                </div>
              </div>
              <div v-if="playerAlertMessage" role="alert" class="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 font-semibold">
                {{ playerAlertMessage }}
              </div>
              <button type="submit" class="w-full py-2.5 bg-yellow-500 hover:bg-yellow-400 active:bg-yellow-600 text-slate-950 rounded-xl text-xs font-extrabold transition-all hover:-translate-y-0.5 shadow-md flex items-center justify-center gap-1.5 cursor-pointer">
                <Plus class="w-4 h-4" aria-hidden="true" />
                <span>{{ t.add }}</span>
              </button>
            </form>
          </div>
        </div>

        <!-- Scorer list -->
        <div class="lg:col-span-2">
          <div class="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
            <div class="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <span class="text-xs font-bold text-slate-400 uppercase tracking-widest">{{ language === 'en' ? 'Ranking Results' : language === 'es' ? 'Tabla de Resultados' : 'Resultado do Ranking' }}</span>
              <span class="text-xs font-bold bg-yellow-500/10 text-yellow-600 py-1 px-3 rounded-full">{{ sortedScorers.length }} {{ language === 'en' ? 'Players' : language === 'es' ? 'Jugadores' : 'Atletas' }}</span>
            </div>
            <div v-if="sortedScorers.length === 0" class="p-16 text-center text-slate-400 font-semibold flex flex-col items-center">
              <HelpCircle class="w-12 h-12 text-slate-300 mb-3" aria-hidden="true" />
              <p class="text-sm">{{ language === 'en' ? 'No players found.' : language === 'es' ? 'No se encontraron jugadores.' : 'Nenhum jogador encontrado com os termos digitados.' }}</p>
            </div>
            <div v-else class="divide-y divide-slate-100">
              <div v-for="(player, idx) in sortedScorers" :key="`${player.name}-${player.team}`" class="px-6 py-4 flex items-center justify-between hover:bg-slate-50/40 transition-all duration-150">
                <div class="flex items-center gap-4">
                  <div class="w-6 text-center text-slate-400 font-mono font-bold text-xs">{{ idx + 1 }}</div>
                  <div>
                    <div class="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                      {{ player.name }}
                      <TeamFlag :code="player.team" :lang="language" :hide-name="true" />
                    </div>
                    <div class="text-[10px] text-slate-400 flex items-center gap-1.5 mt-1 font-medium">
                      <span>{{ TEAMS[player.team]?.name || player.team }}</span>
                      <span aria-hidden="true">•</span>
                      <span>{{ player.club }}</span>
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-4">
                  <div class="flex items-center gap-1 bg-slate-100/60 border p-1.5 rounded-xl">
                    <button @click="decrementGoals(player)" :aria-label="`Remover gol de ${player.name}`" class="w-7 h-7 rounded-lg hover:bg-slate-200 active:scale-95 text-slate-500 font-bold flex items-center justify-center text-sm transition-all">
                      <span aria-hidden="true">−</span>
                    </button>
                    <span :aria-label="`${player.goals} gols`" class="w-8 text-center font-mono font-black text-sm text-slate-800">{{ player.goals }}</span>
                    <button @click="incrementGoals(player)" :aria-label="`Adicionar gol para ${player.name}`" class="w-7 h-7 rounded-lg hover:bg-slate-200 active:scale-95 text-slate-500 font-bold flex items-center justify-center text-sm transition-all">
                      <span aria-hidden="true">+</span>
                    </button>
                  </div>
                  <button @click="deleteScorer(player)" :aria-label="`Remover ${player.name} da lista`" class="p-2 hover:text-red-500 active:scale-95 rounded-lg transition-all text-slate-400">
                    <Trash2 class="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer disclaimer -->
      <div class="max-w-7xl mx-auto px-4 pt-12 pb-24 lg:pb-12 border-t border-slate-200/50 text-center mt-8">
        <div class="inline-flex items-center gap-2 px-3 py-1 bg-slate-100/50 rounded-full border border-slate-200/50 text-[10px] font-black text-slate-500 mb-3.5 uppercase tracking-widest leading-none">
          <Info class="w-3.5 h-3.5 text-blue-500" aria-hidden="true" />
          <span>{{ language === 'en' ? 'Data Privacy & Control' : language === 'es' ? 'Uso de Datos' : 'Uso de Dados & Privacidade' }}</span>
        </div>
        <p class="max-w-3xl mx-auto text-[11px] text-slate-400 leading-relaxed font-normal">{{ t.privacyDisclaimer }}</p>
        <div class="mt-3.5 text-[9px] text-slate-400 font-mono">FIFA Cup Simulator 2026 • Local Persistence Storage </div>
      </div>
    </main>

    <!-- ─── MOBILE FOOTER ──────────────────────────────────────────────────── -->
    <footer aria-label="Navegação mobile" class="fixed bottom-0 inset-x-0 bg-white/95 border-t border-slate-200 backdrop-blur-md py-3.5 px-6 md:hidden flex justify-around items-center z-50 shadow-2xl">
      <button @click="activeTab = 'groups'" :aria-current="activeTab === 'groups' ? 'page' : undefined" :class="`flex flex-col items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'groups' ? 'text-yellow-500' : 'text-slate-400'}`">
        <Calendar class="w-5 h-5" aria-hidden="true" />
        <span>{{ t.groupsTab }}</span>
      </button>
      <button @click="activeTab = 'knockout'" :aria-current="activeTab === 'knockout' ? 'page' : undefined" :class="`flex flex-col items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'knockout' ? 'text-yellow-500' : 'text-slate-400'}`">
        <Trophy class="w-5 h-5" aria-hidden="true" />
        <span>Bracket</span>
      </button>
      <button @click="activeTab = 'scorers'" :aria-current="activeTab === 'scorers' ? 'page' : undefined" :class="`flex flex-col items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'scorers' ? 'text-yellow-500' : 'text-slate-400'}`">
        <Users class="w-5 h-5" aria-hidden="true" />
        <span>{{ language === 'en' ? 'Scorers' : 'Goleadores' }}</span>
      </button>
    </footer>

    <!-- ─── CONFIRM MODAL (genérico) ───────────────────────────────────────── -->
    <Transition
      enter-active-class="transition-all duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="confirmDialog.show"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-desc"
        class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-sm"
        @click.self="closeConfirm"
      >
        <Transition
          enter-active-class="transition-all duration-200"
          enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          enter-to-class="opacity-100 translate-y-0 sm:scale-100"
          appear
        >
          <div class="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h3 id="confirm-modal-title" class="text-lg font-display font-extrabold text-slate-900 mb-2 tracking-tight">
              {{ confirmDialog.title }}
            </h3>
            <p id="confirm-modal-desc" class="text-sm text-slate-500 leading-relaxed mb-6">
              {{ confirmDialog.desc }}
            </p>
            <div class="flex justify-end gap-3">
              <button
                type="button"
                @click="closeConfirm"
                class="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                {{ t.cancel }}
              </button>
              <button
                type="button"
                @click="confirmDialog.onConfirm()"
                :class="`px-5 py-2.5 rounded-xl text-xs font-black shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer ${confirmDialog.confirmClass}`"
              >
                {{ confirmDialog.confirmLabel }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>

    <!-- ─── SIMULATION PAGE ─────────────────────────────────────────────────── -->
    <Transition
      enter-active-class="transition-all duration-300"
      enter-from-class="opacity-0 translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <SimulationPage
        v-if="showSimulation"
        :mode="simulationMode"
        :language="language"
        @close="showSimulation = false"
      />
    </Transition>

  </div>
</template>
