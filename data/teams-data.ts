export interface TeamMember {
  name: string
}

export interface Team {
  name: string
  members: TeamMember[]
  day: number
}

// Empty teams array - will be populated with real data from database
export const teamsData: Team[] = []

export function getTeamByName(name: string): Team | undefined {
  // Normalize team names to handle inconsistencies like spaces
  const normalizedSearchName = name.replace(/\s+/g, "")

  return teamsData.find((team) => {
    const normalizedTeamName = team.name.replace(/\s+/g, "")
    return normalizedTeamName === normalizedSearchName
  })
}

export function getTeamsByDay(day: number): Team[] {
  return teamsData.filter((team) => team.day === day)
}
