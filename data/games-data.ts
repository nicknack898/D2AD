export interface Game {
  id: string
  time: string
  court: string
  team1: string
  team2: string
  group?: string
  stage?: string
  day: number
}

// Empty games array - will be populated with real data from database
export const gamesData: Game[] = []

export function getGamesByTeam(teamName: string): Game[] {
  return gamesData.filter((game) => game.team1 === teamName || game.team2 === teamName)
}

export function getGamesByDay(day: number): Game[] {
  return gamesData.filter((game) => game.day === day)
}
