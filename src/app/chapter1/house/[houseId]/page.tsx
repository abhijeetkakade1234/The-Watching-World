import { redirect } from 'next/navigation';
import { Chapter1GameClient } from '@/components/chapter1/Chapter1GameClient';
import {
  CHAPTER1_BASE_ROUTE,
  CHAPTER1_VILLAGE_ROUTE,
  chapter1HouseSegmentForMap,
  chapter1MapFromHouseSegment,
} from '@/chapters/chapter1/routes';

interface Chapter1HousePageProps {
  params: Promise<{ houseId: string }>;
}

export default async function Chapter1HousePage({ params }: Chapter1HousePageProps) {
  const { houseId } = await params;
  const mapId = chapter1MapFromHouseSegment(houseId);

  if (!mapId) {
    redirect(CHAPTER1_VILLAGE_ROUTE);
  }

  const canonicalSegment = chapter1HouseSegmentForMap(mapId);
  if (canonicalSegment && houseId !== canonicalSegment) {
    redirect(`${CHAPTER1_BASE_ROUTE}/house/${canonicalSegment}`);
  }

  return <Chapter1GameClient routeMapId={mapId} />;
}
