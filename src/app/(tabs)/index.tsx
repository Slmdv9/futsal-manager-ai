import { createBundledContentRepository, ExploreScreen } from '@/modules/content';

const repository = createBundledContentRepository();

export default function ExplorarRoute() {
  return <ExploreScreen repository={repository} />;
}
