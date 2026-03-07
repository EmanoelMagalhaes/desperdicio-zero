import TipsSection from '../../components/sections/TipsSection';
import { useAppStore } from '../../hooks/useAppStore';

export default function TipsPage() {
  const { challengeState, toggleChallenge } = useAppStore();

  return <TipsSection challenges={challengeState} onToggleChallenge={toggleChallenge} />;
}