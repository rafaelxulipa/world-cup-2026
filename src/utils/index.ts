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
  const get3rd = (i: number) => thirds[i]?.code
  return [
    { home: winners['E'], away: get3rd(0) },
    { home: winners['I'], away: get3rd(1) },
    { home: runners['A'], away: runners['B'] },
    { home: winners['F'], away: runners['C'] },
    { home: winners['C'], away: runners['F'] },
    { home: runners['E'], away: runners['I'] },
    { home: winners['A'], away: get3rd(2) },
    { home: winners['L'], away: get3rd(3) },
    { home: runners['K'], away: runners['L'] },
    { home: winners['H'], away: runners['J'] },
    { home: winners['D'], away: get3rd(4) },
    { home: winners['G'], away: get3rd(5) },
    { home: winners['J'], away: runners['H'] },
    { home: runners['D'], away: runners['G'] },
    { home: winners['B'], away: get3rd(6) },
    { home: winners['K'], away: get3rd(7) },
  ]
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
  const { homeScore, awayScore, penaltyWinner } = scoreState
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
    homeScore, awayScore, penaltyWinner,
    winner, loser,
    date, time,
    stadium: stadiumFull.split(', ')[0],
    stadiumCity: stadiumFull.split(', ')[1],
  }
}
