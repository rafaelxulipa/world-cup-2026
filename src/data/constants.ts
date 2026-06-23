import type { Team, Scorer, Language } from '../types'

export const TEAMS: Record<string, Team> = {
  "MEX": {
    "name": "M\u00e9xico",
    "flag": "\ud83c\uddf2\ud83c\uddfd",
    "code": "MEX",
    "ranking": 15
  },
  "RSA": {
    "name": "\u00c1frica do Sul",
    "flag": "\ud83c\uddff\ud83c\udde6",
    "code": "RSA",
    "ranking": 59
  },
  "KOR": {
    "name": "Coreia do Sul",
    "flag": "\ud83c\uddf0\ud83c\uddf7",
    "code": "KOR",
    "ranking": 22
  },
  "CZE": {
    "name": "Rep\u00fablica Tcheca",
    "flag": "\ud83c\udde8\ud83c\uddff",
    "code": "CZE",
    "ranking": 35
  },
  "CAN": {
    "name": "Canad\u00e1",
    "flag": "\ud83c\udde8\ud83c\udde6",
    "code": "CAN",
    "ranking": 40
  },
  "BIH": {
    "name": "B\u00f3snia e Herzegovina",
    "flag": "\ud83c\udde7\ud83c\udde6",
    "code": "BIH",
    "ranking": 70
  },
  "QAT": {
    "name": "Qatar",
    "flag": "\ud83c\uddf6\ud83c\udde6",
    "code": "QAT",
    "ranking": 34
  },
  "SUI": {
    "name": "Su\u00ed\u00e7a",
    "flag": "\ud83c\udde8\ud83c\udded",
    "code": "SUI",
    "ranking": 19
  },
  "BRA": {
    "name": "Brasil",
    "flag": "\ud83c\udde7\ud83c\uddf7",
    "code": "BRA",
    "ranking": 5
  },
  "MAR": {
    "name": "Marrocos",
    "flag": "\ud83c\uddf2\ud83c\udde6",
    "code": "MAR",
    "ranking": 12
  },
  "HAI": {
    "name": "Haiti",
    "flag": "\ud83c\udded\ud83c\uddf9",
    "code": "HAI",
    "ranking": 85
  },
  "SCO": {
    "name": "Esc\u00f3cia",
    "flag": "\ud83c\udff4\udb40\udc67\udb40\udc62\udb40\udc73\udb40\udc63\udb40\udc74\udb40\udc7f",
    "code": "SCO",
    "ranking": 39
  },
  "USA": {
    "name": "EUA",
    "flag": "\ud83c\uddfa\ud83c\uddf8",
    "code": "USA",
    "ranking": 11
  },
  "PAR": {
    "name": "Paraguai",
    "flag": "\ud83c\uddf5\ud83c\uddfe",
    "code": "PAR",
    "ranking": 56
  },
  "AUS": {
    "name": "Austr\u00e1lia",
    "flag": "\ud83c\udde6\ud83c\uddfa",
    "code": "AUS",
    "ranking": 24
  },
  "TUR": {
    "name": "Turquia",
    "flag": "\ud83c\uddf9\ud83c\uddf7",
    "code": "TUR",
    "ranking": 35
  },
  "GER": {
    "name": "Alemanha",
    "flag": "\ud83c\udde9\ud83c\uddea",
    "code": "GER",
    "ranking": 12
  },
  "CUW": {
    "name": "Cura\u00e7ao",
    "flag": "\ud83c\udde8\ud83c\uddfc",
    "code": "CUW",
    "ranking": 90
  },
  "CIV": {
    "name": "Costa do Marfim",
    "flag": "\ud83c\udde8\ud83c\uddee",
    "code": "CIV",
    "ranking": 39
  },
  "ECU": {
    "name": "Equador",
    "flag": "\ud83c\uddea\ud83c\udde8",
    "code": "ECU",
    "ranking": 31
  },
  "NED": {
    "name": "Holanda",
    "flag": "\ud83c\uddf3\ud83c\uddf1",
    "code": "NED",
    "ranking": 8
  },
  "JPN": {
    "name": "Jap\u00e3o",
    "flag": "\ud83c\uddef\ud83c\uddf5",
    "code": "JPN",
    "ranking": 18
  },
  "SWE": {
    "name": "Su\u00e9cia",
    "flag": "\ud83c\uddf8\ud83c\uddea",
    "code": "SWE",
    "ranking": 27
  },
  "TUN": {
    "name": "Tun\u00edsia",
    "flag": "\ud83c\uddf9\ud83c\uddf3",
    "code": "TUN",
    "ranking": 29
  },
  "BEL": {
    "name": "B\u00e9lgica",
    "flag": "\ud83c\udde7\ud83c\uddea",
    "code": "BEL",
    "ranking": 6
  },
  "EGY": {
    "name": "Egito",
    "flag": "\ud83c\uddea\ud83c\uddec",
    "code": "EGY",
    "ranking": 36
  },
  "IRN": {
    "name": "Ir\u00e3",
    "flag": "\ud83c\uddee\ud83c\uddf7",
    "code": "IRN",
    "ranking": 20
  },
  "NZL": {
    "name": "Nova Zel\u00e2ndia",
    "flag": "\ud83c\uddf3\ud83c\uddff",
    "code": "NZL",
    "ranking": 80
  },
  "ESP": {
    "name": "Espanha",
    "flag": "\ud83c\uddea\ud83c\uddf8",
    "code": "ESP",
    "ranking": 3
  },
  "CPV": {
    "name": "Cabo Verde",
    "flag": "\ud83c\udde8\ud83c\uddfb",
    "code": "CPV",
    "ranking": 65
  },
  "KSA": {
    "name": "Ar\u00e1bia Saudita",
    "flag": "\ud83c\uddf8\ud83c\udde6",
    "code": "KSA",
    "ranking": 53
  },
  "URU": {
    "name": "Uruguai",
    "flag": "\ud83c\uddfa\ud83c\uddfe",
    "code": "URU",
    "ranking": 14
  },
  "FRA": {
    "name": "Fran\u00e7a",
    "flag": "\ud83c\uddeb\ud83c\uddf7",
    "code": "FRA",
    "ranking": 2
  },
  "SEN": {
    "name": "Senegal",
    "flag": "\ud83c\uddf8\ud83c\uddf3",
    "code": "SEN",
    "ranking": 17
  },
  "IRQ": {
    "name": "Iraque",
    "flag": "\ud83c\uddee\ud83c\uddf6",
    "code": "IRQ",
    "ranking": 58
  },
  "NOR": {
    "name": "Noruega",
    "flag": "\ud83c\uddf3\ud83c\uddf4",
    "code": "NOR",
    "ranking": 47
  },
  "ARG": {
    "name": "Argentina",
    "flag": "\ud83c\udde6\ud83c\uddf7",
    "code": "ARG",
    "ranking": 1
  },
  "ALG": {
    "name": "Arg\u00e9lia",
    "flag": "\ud83c\udde9\ud83c\uddff",
    "code": "ALG",
    "ranking": 43
  },
  "AUT": {
    "name": "\u00c1ustria",
    "flag": "\ud83c\udde6\ud83c\uddf9",
    "code": "AUT",
    "ranking": 25
  },
  "JOR": {
    "name": "Jord\u00e2nia",
    "flag": "\ud83c\uddef\ud83c\uddf4",
    "code": "JOR",
    "ranking": 71
  },
  "POR": {
    "name": "Portugal",
    "flag": "\ud83c\uddf5\ud83c\uddf9",
    "code": "POR",
    "ranking": 7
  },
  "COD": {
    "name": "RD Congo",
    "flag": "\ud83c\udde8\ud83c\udde9",
    "code": "COD",
    "ranking": 60
  },
  "UZB": {
    "name": "Uzbequist\u00e3o",
    "flag": "\ud83c\uddfa\ud83c\uddff",
    "code": "UZB",
    "ranking": 66
  },
  "COL": {
    "name": "Col\u00f4mbia",
    "flag": "\ud83c\udde8\ud83c\uddf4",
    "code": "COL",
    "ranking": 13
  },
  "ENG": {
    "name": "Inglaterra",
    "flag": "\ud83c\udff4\udb40\udc67\udb40\udc62\udb40\udc65\udb40\udc6e\udb40\udc67\udb40\udc7f",
    "code": "ENG",
    "ranking": 4
  },
  "CRO": {
    "name": "Cro\u00e1cia",
    "flag": "\ud83c\udded\ud83c\uddf7",
    "code": "CRO",
    "ranking": 10
  },
  "GHA": {
    "name": "Gana",
    "flag": "\ud83c\uddec\ud83c\udded",
    "code": "GHA",
    "ranking": 64
  },
  "PAN": {
    "name": "Panam\u00e1",
    "flag": "\ud83c\uddf5\ud83c\udde6",
    "code": "PAN",
    "ranking": 41
  }
}

export const GROUPS_CONFIG: Record<string, string[]> = {
  "A": [
    "MEX",
    "RSA",
    "KOR",
    "CZE"
  ],
  "B": [
    "CAN",
    "BIH",
    "QAT",
    "SUI"
  ],
  "C": [
    "BRA",
    "MAR",
    "HAI",
    "SCO"
  ],
  "D": [
    "USA",
    "PAR",
    "AUS",
    "TUR"
  ],
  "E": [
    "GER",
    "CUW",
    "CIV",
    "ECU"
  ],
  "F": [
    "NED",
    "JPN",
    "SWE",
    "TUN"
  ],
  "G": [
    "BEL",
    "EGY",
    "IRN",
    "NZL"
  ],
  "H": [
    "ESP",
    "CPV",
    "KSA",
    "URU"
  ],
  "I": [
    "FRA",
    "SEN",
    "IRQ",
    "NOR"
  ],
  "J": [
    "ARG",
    "ALG",
    "AUT",
    "JOR"
  ],
  "K": [
    "POR",
    "COD",
    "UZB",
    "COL"
  ],
  "L": [
    "ENG",
    "CRO",
    "GHA",
    "PAN"
  ]
}

export const STADIUMS = [
  {
    "city": "New York/New Jersey",
    "stadium": "MetLife Stadium",
    "country": "USA"
  },
  {
    "city": "Mexico City",
    "stadium": "Estadio Azteca",
    "country": "MEX"
  },
  {
    "city": "Los Angeles",
    "stadium": "SoFi Stadium",
    "country": "USA"
  },
  {
    "city": "Vancouver",
    "stadium": "BC Place",
    "country": "CAN"
  },
  {
    "city": "Miami",
    "stadium": "Hard Rock Stadium",
    "country": "USA"
  },
  {
    "city": "Dallas",
    "stadium": "AT&T Stadium",
    "country": "USA"
  },
  {
    "city": "Atlanta",
    "stadium": "Mercedes-Benz Stadium",
    "country": "USA"
  },
  {
    "city": "Seattle",
    "stadium": "Lumen Field",
    "country": "USA"
  },
  {
    "city": "Toronto",
    "stadium": "BMO Field",
    "country": "CAN"
  },
  {
    "city": "San Francisco",
    "stadium": "Levi's Stadium",
    "country": "USA"
  },
  {
    "city": "Boston",
    "stadium": "Gillette Stadium",
    "country": "USA"
  },
  {
    "city": "Philadelphia",
    "stadium": "Lincoln Financial Field",
    "country": "USA"
  },
  {
    "city": "Houston",
    "stadium": "NRG Stadium",
    "country": "USA"
  },
  {
    "city": "Kansas City",
    "stadium": "Arrowhead Stadium",
    "country": "USA"
  },
  {
    "city": "Monterrey",
    "stadium": "Estadio BBVA",
    "country": "MEX"
  },
  {
    "city": "Guadalajara",
    "stadium": "Estadio Akron",
    "country": "MEX"
  }
]

export const STAR_PLAYERS: Record<string, string> = {
  "USA": "Christian Pulisic",
  "MEX": "Santiago Gim\u00e9nez",
  "CAN": "Jonathan David",
  "BRA": "Vin\u00edcius J\u00fanior",
  "ARG": "Lionel Messi",
  "FRA": "Kylian Mbapp\u00e9",
  "ENG": "Jude Bellingham",
  "GER": "Jamal Musiala",
  "ESP": "Lamine Yamal",
  "POR": "Cristiano Ronaldo",
  "NED": "Cody Gakpo",
  "BEL": "Kevin De Bruyne",
  "CRO": "Luka Modri\u0107",
  "URU": "Darwin N\u00fa\u00f1ez",
  "COL": "Luis D\u00edaz",
  "MAR": "Achraf Hakimi",
  "SEN": "Sadio Man\u00e9",
  "JPN": "Kaoru Mitoma",
  "KOR": "Heung-min Son",
  "AUS": "Martin Boyle",
  "KSA": "Salem Al-Dawsari",
  "EGY": "Mohamed Salah",
  "ECU": "Enner Valencia",
  "PAR": "Miguel Almir\u00f3n",
  "SUI": "Granit Xhaka",
  "SWE": "Alexander Isak",
  "NOR": "Erling Haaland",
  "TUR": "Arda G\u00fcler",
  "ALG": "Riyad Mahrez",
  "GHA": "Mohammed Kudus",
  "CIV": "S\u00e9bastien Haller",
  "PAN": "Adalberto Carrasquilla",
  "TUN": "Youssef Msakni",
  "IRQ": "Aymen Hussein",
  "UZB": "Eldor Shomurodov",
  "CZE": "Tomas Soucek",
  "BIH": "Edin Dzeko",
  "QAT": "Akram Afif",
  "RSA": "Percy Tau",
  "HAI": "Frantzdy Pierrot",
  "SCO": "Andrew Robertson",
  "CUW": "Juninho Bacuna",
  "IRN": "Mehdi Taremi",
  "NZL": "Chris Wood",
  "CPV": "Ryan Mendes",
  "AUT": "David Alaba",
  "JOR": "Mousa Al-Tamari",
  "COD": "Yoane Wissa"
}

export const STAR_PLAYER_CLUBS: Record<string, string> = {
  "USA": "AC Milan",
  "MEX": "Feyenoord",
  "CAN": "Lille OSC",
  "BRA": "Real Madrid",
  "ARG": "Inter Miami",
  "FRA": "Real Madrid",
  "ENG": "Real Madrid",
  "GER": "Bayern Munich",
  "ESP": "FC Barcelona",
  "POR": "Al Nassr",
  "NED": "Liverpool",
  "BEL": "Manchester City",
  "CRO": "Real Madrid",
  "URU": "Liverpool",
  "COL": "Liverpool",
  "MAR": "PSG",
  "SEN": "Al Nassr",
  "JPN": "Brighton",
  "KOR": "Tottenham",
  "AUS": "Hibernian",
  "KSA": "Al Hilal",
  "EGY": "Liverpool",
  "ECU": "Internacional",
  "PAR": "Newcastle",
  "SUI": "Bayer Leverkusen",
  "SWE": "Newcastle",
  "NOR": "Manchester City",
  "TUR": "Real Madrid",
  "ALG": "Al Ahli",
  "GHA": "West Ham",
  "CIV": "Legan\u00e9s",
  "PAN": "Houston Dynamo",
  "TUN": "Al-Arabi",
  "IRQ": "Al-Khor",
  "UZB": "Cagliari",
  "CZE": "West Ham",
  "BIH": "Fenerbahce",
  "QAT": "Al Sadd",
  "RSA": "Al Ahly",
  "HAI": "AEK Athens",
  "SCO": "Liverpool",
  "CUW": "Al-Okhdood",
  "IRN": "Inter Milan",
  "NZL": "Nottingham Forest",
  "CPV": "Karag\u00fcmr\u00fck",
  "AUT": "Real Madrid",
  "JOR": "Montpellier",
  "COD": "Brentford"
}

export const INITIAL_SCORERS: Scorer[] = [
  {
    "name": "Kylian Mbapp\u00e9",
    "team": "FRA",
    "goals": 5,
    "club": "Real Madrid"
  },
  {
    "name": "Vin\u00edcius J\u00fanior",
    "team": "BRA",
    "goals": 4,
    "club": "Real Madrid"
  },
  {
    "name": "Erling Haaland",
    "team": "NOR",
    "goals": 4,
    "club": "Manchester City"
  },
  {
    "name": "Lionel Messi",
    "team": "ARG",
    "goals": 3,
    "club": "Inter Miami"
  },
  {
    "name": "Jude Bellingham",
    "team": "ENG",
    "goals": 3,
    "club": "Real Madrid"
  },
  {
    "name": "Lamine Yamal",
    "team": "ESP",
    "goals": 3,
    "club": "FC Barcelona"
  },
  {
    "name": "Luis D\u00edaz",
    "team": "COL",
    "goals": 2,
    "club": "Liverpool"
  },
  {
    "name": "Christian Pulisic",
    "team": "USA",
    "goals": 2,
    "club": "AC Milan"
  }
]

export const TEAM_NAMES: Record<string, Record<Language, string>> = {
  "MEX": {
    "pt": "M\u00e9xico",
    "en": "Mexico",
    "es": "M\u00e9xico"
  },
  "RSA": {
    "pt": "\u00c1frica do Sul",
    "en": "South Africa",
    "es": "Sud\u00e1frica"
  },
  "KOR": {
    "pt": "Coreia do Sul",
    "en": "Korea Republic",
    "es": "Corea del Sur"
  },
  "CZE": {
    "pt": "Rep\u00fablica Tcheca",
    "en": "Czechia",
    "es": "Rep\u00fablica Checa"
  },
  "CAN": {
    "pt": "Canad\u00e1",
    "en": "Canada",
    "es": "Canad\u00e1"
  },
  "BIH": {
    "pt": "B\u00f3snia e Herzegovina",
    "en": "Bosnia & Herzegovina",
    "es": "Bosnia y Herzegovina"
  },
  "QAT": {
    "pt": "Qatar",
    "en": "Qatar",
    "es": "Catar"
  },
  "SUI": {
    "pt": "Su\u00ed\u00e7a",
    "en": "Switzerland",
    "es": "Suiza"
  },
  "BRA": {
    "pt": "Brasil",
    "en": "Brazil",
    "es": "Brasil"
  },
  "MAR": {
    "pt": "Marrocos",
    "en": "Morocco",
    "es": "Marruecos"
  },
  "HAI": {
    "pt": "Haiti",
    "en": "Haiti",
    "es": "Hait\u00ed"
  },
  "SCO": {
    "pt": "Esc\u00f3cia",
    "en": "Scotland",
    "es": "Escocia"
  },
  "USA": {
    "pt": "EUA",
    "en": "USA",
    "es": "EE.UU."
  },
  "PAR": {
    "pt": "Paraguai",
    "en": "Paraguay",
    "es": "Paraguay"
  },
  "AUS": {
    "pt": "Austr\u00e1lia",
    "en": "Australia",
    "es": "Australia"
  },
  "TUR": {
    "pt": "Turquia",
    "en": "Turkey",
    "es": "Turqu\u00eda"
  },
  "GER": {
    "pt": "Alemanha",
    "en": "Germany",
    "es": "Alemania"
  },
  "CUW": {
    "pt": "Cura\u00e7ao",
    "en": "Cura\u00e7ao",
    "es": "Curazao"
  },
  "CIV": {
    "pt": "Costa do Marfim",
    "en": "Ivory Coast",
    "es": "Costa de Marfil"
  },
  "ECU": {
    "pt": "Equador",
    "en": "Ecuador",
    "es": "Ecuador"
  },
  "NED": {
    "pt": "Holanda",
    "en": "Netherlands",
    "es": "Pa\u00edses Bajos"
  },
  "JPN": {
    "pt": "Jap\u00e3o",
    "en": "Japan",
    "es": "Jap\u00f3n"
  },
  "SWE": {
    "pt": "Su\u00e9cia",
    "en": "Sweden",
    "es": "Suecia"
  },
  "TUN": {
    "pt": "Tun\u00edsia",
    "en": "Tunisia",
    "es": "T\u00fanez"
  },
  "BEL": {
    "pt": "B\u00e9lgica",
    "en": "Belgium",
    "es": "B\u00e9lgica"
  },
  "EGY": {
    "pt": "Egito",
    "en": "Egypt",
    "es": "Egipto"
  },
  "IRN": {
    "pt": "Ir\u00e3",
    "en": "Iran",
    "es": "Ir\u00e1n"
  },
  "NZL": {
    "pt": "Nova Zel\u00e2ndia",
    "en": "New Zealand",
    "es": "Nueva Zelanda"
  },
  "ESP": {
    "pt": "Espanha",
    "en": "Spain",
    "es": "Espa\u00f1a"
  },
  "CPV": {
    "pt": "Cabo Verde",
    "en": "Cabo Verde",
    "es": "Cabo Verde"
  },
  "KSA": {
    "pt": "Ar\u00e1bia Saudita",
    "en": "Saudi Arabia",
    "es": "Arabia Saudita"
  },
  "URU": {
    "pt": "Uruguai",
    "en": "Uruguay",
    "es": "Uruguay"
  },
  "FRA": {
    "pt": "Fran\u00e7a",
    "en": "France",
    "es": "Francia"
  },
  "SEN": {
    "pt": "Senegal",
    "en": "Senegal",
    "es": "Senegal"
  },
  "IRQ": {
    "pt": "Iraque",
    "en": "Iraq",
    "es": "Irak"
  },
  "NOR": {
    "pt": "Noruega",
    "en": "Norway",
    "es": "Noruega"
  },
  "ARG": {
    "pt": "Argentina",
    "en": "Argentina",
    "es": "Argentina"
  },
  "ALG": {
    "pt": "Arg\u00e9lia",
    "en": "Algeria",
    "es": "Argelia"
  },
  "AUT": {
    "pt": "\u00c1ustria",
    "en": "Austria",
    "es": "Austria"
  },
  "JOR": {
    "pt": "Jord\u00e2nia",
    "en": "Jordan",
    "es": "Jordania"
  },
  "POR": {
    "pt": "Portugal",
    "en": "Portugal",
    "es": "Portugal"
  },
  "COD": {
    "pt": "RD Congo",
    "en": "DR Congo",
    "es": "RD Congo"
  },
  "UZB": {
    "pt": "Uzbequist\u00e3o",
    "en": "Uzbekistan",
    "es": "Uzbekist\u00e1n"
  },
  "COL": {
    "pt": "Col\u00f4mbia",
    "en": "Colombia",
    "es": "Colombia"
  },
  "ENG": {
    "pt": "Inglaterra",
    "en": "England",
    "es": "Inglaterra"
  },
  "CRO": {
    "pt": "Cro\u00e1cia",
    "en": "Croatia",
    "es": "Croacia"
  },
  "GHA": {
    "pt": "Gana",
    "en": "Ghana",
    "es": "Ghana"
  },
  "PAN": {
    "pt": "Panam\u00e1",
    "en": "Panama",
    "es": "Panam\u00e1"
  }
}

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  pt: {
    title: 'Copa do Mundo FIFA 2026',
    simGroups: 'Simular Grupos', simFull: 'Simular Copa Completa', resetBtn: 'Resetar',
    groupsTab: 'Fase de Grupos', knockoutTab: 'Chaveamento', scorersTab: 'Artilharia / Jogadores',
    filterGroup: 'Filtrar por:', all: 'Ver Todos', groupLabel: 'Grupo',
    liveTracker: 'Live Tracker • 104 Jogos', qualified: 'Classificados',
    standings: 'Classificação', matches: 'Jogos',
    t_team: 'Seleção', t_j: 'J', t_v: 'V', t_e: 'E', t_d: 'D',
    t_gp: 'GP', t_gc: 'GC', t_sg: 'SG', t_pts: 'Pts',
    r32: '16-avos', r16: 'Oitavas', qf: 'Quartas', sf: 'Semifinais',
    f: 'Grande Final', tp: 'Decisão 3º Lugar',
    winnerHeading: 'Vencedor', runnerUpHeading: 'Vice-Campeão',
    addPlayer: 'Adicionar Jogador Customizado', playerName: 'Nome do Jogador',
    club: 'Clube', add: 'Adicionar', searchScorer: 'Buscar artilheiro ou país...',
    resetTitle: 'Resetar Todos os Dados?',
    resetConfirm: 'Tem certeza que deseja limpar definitivamente todos os placares, grupos e artilharia? Isso fará os dados começarem do zero.',
    yesReset: 'Sim, Resetar', cancel: 'Cancelar', save_btn: 'SALVAR', goals: 'Gols',
    stats: 'Dados Científicos', totalMatches: 'Total de Partidas', totalGoals: 'Total de Gols',
    goalsPerMatch: 'Gols por Jogo', customScorers: 'Artilharia Geral / Jogadores',
    penalties: 'Pênaltis', home: 'Mandante', away: 'Visitante',
    backToGroups: 'Voltar para grupos', favoritePath: 'Semifinais Atuais',
    stadium: 'Estádio', date: 'Data', hour: 'Hora', countryLabel: 'País',
    emptyScores: 'Alguns placares ainda não foram inseridos.',
    addScorerError: 'Este jogador já está na lista!',
    finalist_1: 'Vencer Semi 1', finalist_2: 'Vencer Semi 2',
    quarter_1: 'Venc Q1', quarter_2: 'Venc Q2', quarter_3: 'Venc Q3', quarter_4: 'Venc Q4',
    stadiumCityLabel: 'Cidades Sedes', citySedeLabel: 'Cidades-Sede', arenasLabel: 'Arenas Principais',
    ruleTitle: 'Classificação dos Melhores 3º Colocados',
    ruleDesc: 'Os 8 melhores terceiros colocados (entre os 12 grupos de A a L) ganham vaga nas Finais de 16-avos.',
    ruleFIFA: 'Regras Gerais da FIFA', noUnsaved: 'Sem placares com pendência.',
    addScorerPlaceholder: 'Ex: Neymar Jr', clubPlaceholder: 'Ex: Santos FC',
    registeredSec: 'Seleções Inscritas', registeredFiliados: 'Países Filiados',
    historyMatches: 'Histórico & Jogos do Grupo',
    tapPenaltyHelp: '⚠️ Toque na bandeira para decidir pênaltis',
    searchPlaceholder: 'Buscar jogador ou país...',
    privacyDisclaimer: 'Este é um simulador NÃO OFICIAL criado por fãs para fins de simulação e entretenimento, não possuindo nenhuma afiliação, associação ou fim lucrativo com a FIFA. Todos os dados de simulação são salvos localmente no seu navegador (LocalStorage) e podem ser apagados a qualquer momento pelo botão Resetar.',
  },
  en: {
    title: 'FIFA World Cup 2026',
    simGroups: 'Simulate Groups', simFull: 'Simulate Full Cup', resetBtn: 'Reset',
    groupsTab: 'Group Stage', knockoutTab: 'Knockout Stage', scorersTab: 'Top Scorers / Players',
    filterGroup: 'Filter by:', all: 'All Groups', groupLabel: 'Group',
    liveTracker: 'Live Tracker • 104 Matches', qualified: 'Qualified',
    standings: 'Standings Table', matches: 'Matches',
    t_team: 'Team', t_j: 'P', t_v: 'W', t_e: 'D', t_d: 'L',
    t_gp: 'GF', t_gc: 'GA', t_sg: 'GD', t_pts: 'Pts',
    r32: 'Round of 32', r16: 'Round of 16', qf: 'Quarterfinals', sf: 'Semifinals',
    f: 'Grand Final', tp: '3rd Place Match',
    winnerHeading: 'Winner', runnerUpHeading: 'Runner-up',
    addPlayer: 'Add Custom Player', playerName: 'Player Name',
    club: 'Club Name', add: 'Add Player', searchScorer: 'Search scorer or country...',
    resetTitle: 'Reset All App Data?',
    resetConfirm: 'Are you sure you want to permanently clear all scores, standings and top scorers? This resets the tournament from scratch.',
    yesReset: 'Yes, Reset', cancel: 'Cancel', save_btn: 'SAVE', goals: 'Goals',
    stats: 'Scientific Data', totalMatches: 'Total Matches', totalGoals: 'Total Goals',
    goalsPerMatch: 'Goals / Match', customScorers: 'General Scorers / Players',
    penalties: 'Penalties', home: 'Home', away: 'Away',
    backToGroups: 'Back to Groups', favoritePath: 'Current Semifinals',
    stadium: 'Stadium', date: 'Date', hour: 'Time', countryLabel: 'Country',
    emptyScores: 'Some match scores are not simulated yet.',
    addScorerError: 'This player is already in the list!',
    finalist_1: 'Winner Semi 1', finalist_2: 'Winner Semi 2',
    quarter_1: 'Winner Q1', quarter_2: 'Winner Q2', quarter_3: 'Winner Q3', quarter_4: 'Winner Q4',
    stadiumCityLabel: 'Host Cities', citySedeLabel: 'Host Cities', arenasLabel: 'Main Arenas',
    ruleTitle: 'Ranking of Best 3rd Placed Teams',
    ruleDesc: 'The 8 best third-placed teams (among all 12 groups A to L) advance to the Round of 32.',
    ruleFIFA: 'FIFA Official Rules', noUnsaved: 'No unsaved scores.',
    addScorerPlaceholder: 'e.g., Kane', clubPlaceholder: 'e.g., Real Madrid',
    registeredSec: 'Inscribed Teams', registeredFiliados: 'FA Countries',
    historyMatches: 'Group Matches Schedule',
    tapPenaltyHelp: '⚠️ Tap team flag to set penalty winner',
    searchPlaceholder: 'Search player or country...',
    privacyDisclaimer: 'This is an UNOFFICIAL fan simulator made purely for entertainment and simulation purposes, with zero official association or endorsement by FIFA. All simulation data runs entirely in your browser (LocalStorage) and can be cleared at any time using the Reset button.',
  },
  es: {
    title: 'Copa Mundial de la FIFA 2026',
    simGroups: 'Simular Grupos', simFull: 'Simular Copa Completa', resetBtn: 'Reiniciar',
    groupsTab: 'Fase de Grupos', knockoutTab: 'Fase Eliminatoria', scorersTab: 'Goleadores / Jugadores',
    filterGroup: 'Filtrar por:', all: 'Todos', groupLabel: 'Grupo',
    liveTracker: 'Live Tracker • 104 Partidos', qualified: 'Clasificados',
    standings: 'Tabla de Clasificación', matches: 'Partidos',
    t_team: 'Equipo', t_j: 'PJ', t_v: 'PG', t_e: 'PE', t_d: 'PP',
    t_gp: 'GF', t_gc: 'GC', t_sg: 'DG', t_pts: 'Pts',
    r32: 'Dieciseisavos', r16: 'Octavos', qf: 'Cuartos', sf: 'Semifinales',
    f: 'Gran Final', tp: 'Tercer Puesto',
    winnerHeading: 'Ganador', runnerUpHeading: 'Subcampeón',
    addPlayer: 'Agregar Jugador Personalizado', playerName: 'Nombre del Jugador',
    club: 'Club / Equipo', add: 'Agregar', searchScorer: 'Buscar goleador o país...',
    resetTitle: '¿Reestablecer torneo?',
    resetConfirm: '¿Está seguro de que desea limpiar permanentemente todos los puntajes, tablas y goleadores? Esto restablecerá los datos desde cero.',
    yesReset: 'Sí, Reiniciar', cancel: 'Cancelar', save_btn: 'GUARDAR', goals: 'Goles',
    stats: 'Datos Científicos', totalMatches: 'Total de Partidos', totalGoals: 'Total de Goles',
    goalsPerMatch: 'Goles por Partido', customScorers: 'Tabla de Goleadores / Jugadores',
    penalties: 'Penales', home: 'Local', away: 'Visitante',
    backToGroups: 'Volver a grupos', favoritePath: 'Semifinales Actuales',
    stadium: 'Estadio', date: 'Fecha', hour: 'Hora', countryLabel: 'País',
    emptyScores: 'Algunos marcadores aún no se han simulado.',
    addScorerError: '¡Este jugador ya está en la lista!',
    finalist_1: 'Ganador Semi 1', finalist_2: 'Ganador Semi 2',
    quarter_1: 'Venc Q1', quarter_2: 'Venc Q2', quarter_3: 'Venc Q3', quarter_4: 'Venc Q4',
    stadiumCityLabel: 'Ciudades Sedes', citySedeLabel: 'Ciudades Sede', arenasLabel: 'Arenas Principales',
    ruleTitle: 'Clasificación de Mejores 3º Puestos',
    ruleDesc: 'Los 8 mejores terceros clasificados (entre los 12 grupos de A a L) ganan el pase a dieciseisavos.',
    ruleFIFA: 'Reglas Oficiales de FIFA', noUnsaved: 'Sin marcadores pendientes.',
    addScorerPlaceholder: 'Ej: Rodrygo', clubPlaceholder: 'Ej: Real Madrid',
    registeredSec: 'Selecciones Inscritas', registeredFiliados: 'Países Miembros',
    historyMatches: 'Historial de Partidos',
    tapPenaltyHelp: '⚠️ Toca la bandera para decidir penaltis',
    searchPlaceholder: 'Buscar jugador o país...',
    privacyDisclaimer: 'Este simulador es un sitio web NO OFICIAL desarrollado por aficionados sin fines lucrativos, sin ninguna afiliación o patrocinio de la FIFA. Todos los resultados se guardan exclusivamente en el almacenamiento local de su navegador (LocalStorage) y pueden reiniciarse en cualquier momento con el botón Reiniciar.',
  },
}
