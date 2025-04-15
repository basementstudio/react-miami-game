import { Room } from "./room";

export interface RoomPageProps {
  params: Promise<{ "room-id": string }>;
}

export default async function RoomPage({ params }: RoomPageProps) {
  const { "room-id": roomId } = await params;

  return <Room roomId={roomId} />;
}
