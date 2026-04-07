import { redirect } from 'next/navigation';
import { CHAPTER1_VILLAGE_ROUTE } from '@/chapters/chapter1/routes';

export default function Chapter1IndexPage() {
  redirect(CHAPTER1_VILLAGE_ROUTE);
}
