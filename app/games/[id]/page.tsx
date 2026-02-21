import GameDetailsClient from "./game-details-client"

export default function GameDetailsPage({ params }: { params: { id: string } }) {
  const { id } = params
  return <GameDetailsClient gameId={id} />
}
