import TipsSection from '../../components/sections/TipsSection';
import { useAppStore } from '../../hooks/useAppStore';

export default function DemoTips() {
  const { demoChallenges } = useAppStore();

  return (
    <TipsSection
      challenges={demoChallenges}
      readOnly
      onToggleChallenge={() => {}}
    />
  );
}