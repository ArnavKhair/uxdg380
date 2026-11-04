import { useSearchParams } from 'react-router-dom';
import { DEFAULT_SCENARIO, screenScenarios } from '../data/scenarios';

/** The edge-case state the current screen should render, from `?state=`. */
export function useScenario(screen: keyof typeof screenScenarios): string {
  const [params] = useSearchParams();
  const requested = params.get('state');
  const known = screenScenarios[screen]?.some((s) => s.id === requested);
  return known && requested ? requested : DEFAULT_SCENARIO;
}
