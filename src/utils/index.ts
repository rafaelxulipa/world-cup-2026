import type { Match, GroupStanding, KnockoutSlot, KnockoutMatchState, ThirdPlaceRank, Language } from '../types'
import { TEAMS, GROUPS_CONFIG, STADIUMS, TEAM_NAMES } from '../data/constants'
import { OFFICIAL_GROUP_MATCHES } from '../data/officialMatches'

export function getTeamName(code: string, lang: Language): string {
  return TEAM_NAMES[code]?.[lang] || TEAMS[code]?.name || code
}

export function simulateMatchScore(homeRank: number, awayRank: number): [number, number] {
  const rankDiff = awayRank - homeRank
  let scaleHome = Math.max(0.4, Math.min(3.8, 1.4 + rankDiff * 0.015))
  let scaleAway = Math.max(0.4, Math.min(3.8, 1.4 - rankDiff * 0.015))

  const simulatePoisson = (lambda: number): number => {
    let L = Math.exp(-lambda), k = 0, p = 1.0
    do { k++; p *= Math.random() } while (p > L)
    return Math.max(0, k - 1)
  }

  let homeScore = simulatePoisson(scaleHome)
  let awayScore = simulatePoisson(scaleAway)
  if (homeScore > 8) homeScore = Math.floor(Math.random() * 3) + 4
  if (awayScore > 8) awayScore = Math.floor(Math.random() * 3) + 4
  return [homeScore, awayScore]
}

export function generateAllMatches(): Record<string, Match> {
  const matches: Record<string, Match> = {}
  OFFICIAL_GROUP_MATCHES.forEach(m => {
    matches[m.id] = { ...m }
  })
  return matches
}

export function calculateAllStandings(matchesObj: Record<string, Match>): Record<string, GroupStanding[]> {
  const standings: Record<string, GroupStanding[]> = {}
  Object.keys(GROUPS_CONFIG).forEach(groupLetter => {
    const initial: GroupStanding[] = GROUPS_CONFIG[groupLetter].map(code => ({
      code, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0, pts: 0,
    }))
    Object.values(matchesObj)
      .filter(m => m.group === groupLetter)
      .forEach(m => {
        if (m.homeScore !== '' && m.awayScore !== '') {
          const h = initial.find(t => t.code === m.home)
          const a = initial.find(t => t.code === m.away)
          if (h && a) {
            const hSc = typeof m.homeScore === 'number' ? m.homeScore : 0
            const aSc = typeof m.awayScore === 'number' ? m.awayScore : 0
            h.j++; a.j++
            h.gp += hSc; h.gc += aSc; a.gp += aSc; a.gc += hSc
            if (hSc > aSc) { h.v++; h.pts += 3; a.d++ }
            else if (hSc < aSc) { a.v++; a.pts += 3; h.d++ }
            else { h.e++; a.e++; h.pts++; a.pts++ }
            h.sg = h.gp - h.gc; a.sg = a.gp - a.gc
          }
        }
      })
    standings[groupLetter] = initial.sort((a, b) =>
      b.pts !== a.pts ? b.pts - a.pts :
      b.sg !== a.sg ? b.sg - a.sg :
      b.gp !== a.gp ? b.gp - a.gp :
      a.code.localeCompare(b.code)
    )
  })
  return standings
}

export function calculateBestThirdPlaces(allStandings: Record<string, GroupStanding[]>): ThirdPlaceRank[] {
  const list: ThirdPlaceRank[] = []
  Object.entries(allStandings).forEach(([groupLetter, arr]) => {
    const t3 = arr[2]
    if (t3) list.push({ code: t3.code, group: groupLetter, pts: t3.pts, sg: t3.sg, gp: t3.gp })
  })
  return list.sort((a, b) =>
    b.pts !== a.pts ? b.pts - a.pts :
    b.sg !== a.sg ? b.sg - a.sg :
    b.gp !== a.gp ? b.gp - a.gp :
    a.code.localeCompare(b.code)
  )
}

// Cada uma das 8 vagas de "3º colocado" nos 16-avos só pode ser ocupada por um
// terceiro de um subconjunto fixo de grupos (regra oficial da FIFA, Anexo C do
// regulamento). Ex.: a vaga que enfrenta o 1ºE só aceita um 3º dos grupos
// A, B, C, D ou F — nunca o 3º de qualquer outro grupo.
const R32_THIRD_SLOTS: Array<{ idx: number; winnerGroup: string; allowed: string[] }> = [
  { idx: 0, winnerGroup: 'E', allowed: ['A', 'B', 'C', 'D', 'F'] },   // R32-1
  { idx: 1, winnerGroup: 'I', allowed: ['C', 'D', 'F', 'G', 'H'] },   // R32-2
  { idx: 6, winnerGroup: 'D', allowed: ['B', 'E', 'F', 'I', 'J'] },   // R32-7
  { idx: 7, winnerGroup: 'G', allowed: ['A', 'E', 'H', 'I', 'J'] },   // R32-8
  { idx: 10, winnerGroup: 'A', allowed: ['C', 'E', 'F', 'H', 'I'] },  // R32-11
  { idx: 11, winnerGroup: 'L', allowed: ['E', 'H', 'I', 'J', 'K'] },  // R32-12
  { idx: 14, winnerGroup: 'B', allowed: ['E', 'F', 'G', 'I', 'J'] },  // R32-15
  { idx: 15, winnerGroup: 'K', allowed: ['D', 'E', 'I', 'J', 'L'] },  // R32-16
]

// A FIFA nunca divulgou a tabela completa das 495 combinações (Anexo C) em
// formato reaproveitável; o que existe é uma tabela fixa "combinação → vagas".
// Essa é a combinação que de fato ocorreu na Copa de 2026 (grupos B,D,E,F,I,J,K,L
// como os 8 melhores terceiros), confirmada com os jogos reais dos 16-avos:
// Alemanha×Paraguai, França×Suécia, EUA×Bósnia, Bélgica×Senegal, México×Equador,
// Inglaterra×RD Congo, Suíça×Argélia, Colômbia×Gana. Mapeia grupo do 3º → grupo do adversário (1º).
const KNOWN_REAL_THIRDS_ASSIGNMENT: Record<string, string> = {
  D: 'E', F: 'I', B: 'D', I: 'G', E: 'A', K: 'L', J: 'B', L: 'K',
}
const KNOWN_REAL_THIRDS_COMBO = ['B', 'D', 'E', 'F', 'I', 'J', 'K', 'L'].join('')

function assignThirdsToSlots(qualifiedGroups: string[]): Record<string, string> {
  const sortedCombo = [...qualifiedGroups].sort().join('')
  if (sortedCombo === KNOWN_REAL_THIRDS_COMBO) {
    const result: Record<string, string> = {}
    Object.entries(KNOWN_REAL_THIRDS_ASSIGNMENT).forEach(([thirdGroup, winnerGroup]) => {
      result[winnerGroup] = thirdGroup
    })
    return result
  }
  // Sem a tabela oficial completa, resolve por backtracking (vaga mais restrita
  // primeiro) para garantir só que nenhum 3º cai contra o próprio grupo — não
  // há garantia de bater exatamente com o sorteio real da FIFA nesse cenário.
  const used = new Set<string>()
  const out: (string | null)[] = Array(R32_THIRD_SLOTS.length).fill(null)
  const order = R32_THIRD_SLOTS
    .map((slot, i) => ({ i, allowed: slot.allowed.filter(g => qualifiedGroups.includes(g)) }))
    .sort((a, b) => a.allowed.length - b.allowed.length)
  const backtrack = (k: number): boolean => {
    if (k === order.length) return true
    const { i, allowed } = order[k]
    for (const g of allowed) {
      if (used.has(g)) continue
      used.add(g); out[i] = g
      if (backtrack(k + 1)) return true
      used.delete(g); out[i] = null
    }
    return false
  }
  backtrack(0)
  const result: Record<string, string> = {}
  R32_THIRD_SLOTS.forEach((slot, i) => {
    if (out[i]) result[slot.winnerGroup] = out[i] as string
  })
  return result
}

export function resolveR32Matchups(
  standings: Record<string, GroupStanding[]>,
  thirds: ThirdPlaceRank[],
): Array<{ home?: string; away?: string }> {
  const winners: Record<string, string> = {}
  const runners: Record<string, string> = {}
  Object.entries(standings).forEach(([g, arr]) => {
    winners[g] = arr[0]?.code
    runners[g] = arr[1]?.code
  })
  const qualifiedThirds = thirds.slice(0, 8)
  const codeByGroup: Record<string, string> = {}
  qualifiedThirds.forEach(t => { codeByGroup[t.group] = t.code })
  const winnerGroupToThirdGroup = assignThirdsToSlots(qualifiedThirds.map(t => t.group))
  const get3rdFor = (winnerGroup: string) => {
    const thirdGroup = winnerGroupToThirdGroup[winnerGroup]
    return thirdGroup ? codeByGroup[thirdGroup] : undefined
  }
  return [
    { home: winners['E'], away: get3rdFor('E') },  // R32-1:  Alemanha × 3º (grupos A,B,C,D,F)
    { home: winners['I'], away: get3rdFor('I') },  // R32-2:  França × 3º (grupos C,D,F,G,H)
    { home: runners['A'], away: runners['B'] },    // R32-3:  2ºA × 2ºB
    { home: winners['F'], away: runners['C'] },    // R32-4:  1ºF × 2ºC
    { home: runners['K'], away: runners['L'] },    // R32-5:  2ºK × 2ºL
    { home: winners['H'], away: runners['J'] },    // R32-6:  1ºH × 2ºJ
    { home: winners['D'], away: get3rdFor('D') },  // R32-7:  1ºD × 3º (grupos B,E,F,I,J)
    { home: winners['G'], away: get3rdFor('G') },  // R32-8:  1ºG × 3º (grupos A,E,H,I,J)
    { home: winners['C'], away: runners['F'] },    // R32-9:  1ºC × 2ºF
    { home: runners['E'], away: runners['I'] },    // R32-10: 2ºE × 2ºI
    { home: winners['A'], away: get3rdFor('A') },  // R32-11: 1ºA × 3º (grupos C,E,F,H,I)
    { home: winners['L'], away: get3rdFor('L') },  // R32-12: 1ºL × 3º (grupos E,H,I,J,K)
    { home: winners['J'], away: runners['H'] },    // R32-13: 1ºJ × 2ºH
    { home: runners['D'], away: runners['G'] },    // R32-14: 2ºD × 2ºG
    { home: winners['B'], away: get3rdFor('B') },  // R32-15: 1ºB × 3º (grupos E,F,G,I,J)
    { home: winners['K'], away: get3rdFor('K') },  // R32-16: 1ºK × 3º (grupos D,E,I,J,L)
  ]
}

export function buildKnockoutTree(
  knockoutScores: Record<string, KnockoutMatchState>,
  standings: Record<string, GroupStanding[]>,
  thirds: ThirdPlaceRank[],
) {
  const r32Pairings = resolveR32Matchups(standings, thirds)
  const emptyState = (): KnockoutMatchState => ({
    homeScore: '', awayScore: '', penaltyWinner: null, penaltyHomeScore: '', penaltyAwayScore: '',
  })

  const r32Stadiums = [
    'Gillette Stadium, Boston', 'NRG Stadium, Houston', 'Estadio BBVA, Monterrey',
    'SoFi Stadium, Los Angeles', 'Lumen Field, Seattle', "Levi's Stadium, San Francisco",
    'SoFi Stadium, Los Angeles', 'BMO Field, Toronto', 'AT&T Stadium, Dallas',
    'MetLife Stadium, New Jersey', 'Estadio Azteca, Mexico City', 'Mercedes-Benz Stadium, Atlanta',
    'BC Place, Vancouver', 'AT&T Stadium, Dallas', 'Hard Rock Stadium, Miami',
    'Arrowhead Stadium, Kansas City',
  ]
  const r32Dates = [
    '29/06/2026', '30/06/2026', '28/06/2026', '29/06/2026',
    '02/07/2026', '02/07/2026', '01/07/2026', '01/07/2026',
    '29/06/2026', '30/06/2026', '30/06/2026', '01/07/2026',
    '03/07/2026', '03/07/2026', '03/07/2026', '03/07/2026',
  ]
  const r32Times = [
    '17:30', '18:00', '16:00', '22:00', '20:00', '16:00', '21:00', '17:00',
    '14:00', '14:00', '22:00', '13:00', '19:00', '15:00', '00:00', '22:30',
  ]
  const resolvedR32: KnockoutSlot[] = Array.from({ length: 16 }, (_, i) => {
    const { home, away } = r32Pairings[i] ?? {}
    return resolveKnockoutSlot(
      `R32-${i + 1}`, home, away, knockoutScores[`R32-${i + 1}`] ?? emptyState(),
      '1º Grupo', 'Classificado 3º',
      r32Dates[i] ?? '28/06/2026', r32Stadiums[i] ?? 'MetLife Stadium, New Jersey', r32Times[i] ?? '18:00',
    )
  })

  const r16Stadiums = [
    'Lincoln Financial Field, Philadelphia', 'NRG Stadium, Houston',
    'AT&T Stadium, Dallas', 'Lumen Field, Seattle',
    'MetLife Stadium, New Jersey', 'Estadio Azteca, Mexico City',
    'Mercedes-Benz Stadium, Atlanta', 'BC Place, Vancouver',
  ]
  const r16Dates = [
    '04/07/2026', '04/07/2026', '06/07/2026', '06/07/2026',
    '05/07/2026', '05/07/2026', '07/07/2026', '07/07/2026',
  ]
  const r16Times = ['18:00', '14:00', '16:00', '21:00', '17:00', '21:00', '13:00', '17:00']
  const resolvedR16: KnockoutSlot[] = Array.from({ length: 8 }, (_, i) =>
    resolveKnockoutSlot(
      `R16-${i + 1}`,
      resolvedR32[2 * i]?.winner, resolvedR32[2 * i + 1]?.winner,
      knockoutScores[`R16-${i + 1}`] ?? emptyState(),
      `Venc. R32 M${2 * i + 1}`, `Venc. R32 M${2 * i + 2}`,
      r16Dates[i] ?? '04/07/2026', r16Stadiums[i] ?? 'MetLife Stadium, New Jersey', r16Times[i] ?? '18:00',
    ),
  )

  const qfStadiums = [
    'Gillette Stadium, Boston', 'SoFi Stadium, Los Angeles',
    'Hard Rock Stadium, Miami', 'Arrowhead Stadium, Kansas City',
  ]
  const qfDates = ['09/07/2026', '10/07/2026', '11/07/2026', '11/07/2026']
  const qfTimes = ['17:00', '16:00', '18:00', '22:00']
  const resolvedQF: KnockoutSlot[] = Array.from({ length: 4 }, (_, i) =>
    resolveKnockoutSlot(
      `QF-${i + 1}`,
      resolvedR16[2 * i]?.winner, resolvedR16[2 * i + 1]?.winner,
      knockoutScores[`QF-${i + 1}`] ?? emptyState(),
      `Venc. Oitavas M${2 * i + 1}`, `Venc. Oitavas M${2 * i + 2}`,
      qfDates[i] ?? '09/07/2026', qfStadiums[i] ?? 'MetLife Stadium, New Jersey', qfTimes[i] ?? '18:00',
    ),
  )

  const sfStadiums = ['AT&T Stadium, Dallas', 'Mercedes-Benz Stadium, Atlanta']
  const resolvedSF: KnockoutSlot[] = Array.from({ length: 2 }, (_, i) =>
    resolveKnockoutSlot(
      `SF-${i + 1}`,
      resolvedQF[2 * i]?.winner, resolvedQF[2 * i + 1]?.winner,
      knockoutScores[`SF-${i + 1}`] ?? emptyState(),
      `Venc. Quartas M${2 * i + 1}`, `Venc. Quartas M${2 * i + 2}`,
      i === 0 ? '14/07/2026' : '15/07/2026', sfStadiums[i], '16:00',
    ),
  )

  const resolvedTP = resolveKnockoutSlot(
    'TP-1', resolvedSF[0]?.loser, resolvedSF[1]?.loser,
    knockoutScores['TP-1'] ?? emptyState(),
    'Perdedor Semifinal 1', 'Perdedor Semifinal 2',
    '18/07/2026', 'Hard Rock Stadium, Miami', '18:00',
  )

  const resolvedF = resolveKnockoutSlot(
    'F-1', resolvedSF[0]?.winner, resolvedSF[1]?.winner,
    knockoutScores['F-1'] ?? emptyState(),
    'Vencedor Semifinal 1', 'Vencedor Semifinal 2',
    '19/07/2026', 'MetLife Stadium, New York/New Jersey', '16:00',
  )

  return { R32: resolvedR32, R16: resolvedR16, QF: resolvedQF, SF: resolvedSF, TP: resolvedTP, F: resolvedF }
}

export function resolveKnockoutSlot(
  matchId: string,
  homeTeam: string | undefined,
  awayTeam: string | undefined,
  scoreState: KnockoutMatchState,
  homeLabel: string,
  awayLabel: string,
  date: string,
  stadiumFull: string,
  time = '20:00',
): KnockoutSlot {
  const { homeScore, awayScore, penaltyWinner, penaltyHomeScore, penaltyAwayScore } = scoreState
  let winner: string | undefined
  let loser: string | undefined

  if (homeScore !== '' && awayScore !== '' && homeTeam && awayTeam) {
    if (homeScore > awayScore) { winner = homeTeam; loser = awayTeam }
    else if (homeScore < awayScore) { winner = awayTeam; loser = homeTeam }
    else {
      winner = penaltyWinner === 'home' ? homeTeam : penaltyWinner === 'away' ? awayTeam : undefined
      loser  = penaltyWinner === 'home' ? awayTeam : penaltyWinner === 'away' ? homeTeam : undefined
    }
  }

  return {
    matchId, homeLabel, awayLabel,
    home: homeTeam, away: awayTeam,
    homeScore, awayScore, penaltyWinner, penaltyHomeScore, penaltyAwayScore,
    winner, loser,
    date, time,
    stadium: stadiumFull.split(', ')[0],
    stadiumCity: stadiumFull.split(', ')[1],
  }
}

export function simulatePenaltyShootout(): { homeScore: number; awayScore: number; winner: 'home' | 'away' } {
  const winner: 'home' | 'away' = Math.random() > 0.5 ? 'home' : 'away'
  let winnerGoals = Math.floor(Math.random() * 3) + 3
  let loserGoals = Math.floor(Math.random() * winnerGoals)
  if (Math.random() < 0.15) {
    const base = Math.floor(Math.random() * 3) + 5
    winnerGoals = base + 1
    loserGoals = base
  }
  return winner === 'home'
    ? { homeScore: winnerGoals, awayScore: loserGoals, winner }
    : { homeScore: loserGoals, awayScore: winnerGoals, winner }
}
