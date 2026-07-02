export type Language = 'pt' | 'en' | 'es'
export type TabId = 'groups' | 'knockout' | 'scorers'
export type BracketRound = 'R32' | 'R16' | 'QF' | 'SF' | 'F'
export type PenaltySide = 'home' | 'away' | null

export interface Team {
  name: string
  flag: string
  code: string
  ranking: number
}

export interface Match {
  id: string
  group: string
  home: string
  away: string
  homeScore: number | ''
  awayScore: number | ''
  date: string
  time: string
  stadium: string
  stadiumCity: string
}

export interface GroupStanding {
  code: string
  j: number
  v: number
  e: number
  d: number
  gp: number
  gc: number
  sg: number
  pts: number
}

export interface KnockoutMatchState {
  homeScore: number | ''
  awayScore: number | ''
  penaltyWinner: PenaltySide
  penaltyHomeScore: number | ''
  penaltyAwayScore: number | ''
}

export interface KnockoutSlot {
  matchId: string
  homeLabel: string
  awayLabel: string
  home?: string
  away?: string
  homeScore: number | ''
  awayScore: number | ''
  penaltyWinner: PenaltySide
  penaltyHomeScore: number | ''
  penaltyAwayScore: number | ''
  winner?: string
  loser?: string
  date: string
  stadium: string
  stadiumCity: string
  time: string
}

export interface Scorer {
  name: string
  team: string
  goals: number
  club: string
}

export interface ThirdPlaceRank {
  code: string
  group: string
  pts: number
  sg: number
  gp: number
}

export interface KnockoutTree {
  R32: KnockoutSlot[]
  R16: KnockoutSlot[]
  QF: KnockoutSlot[]
  SF: KnockoutSlot[]
  TP: KnockoutSlot
  F: KnockoutSlot
}
