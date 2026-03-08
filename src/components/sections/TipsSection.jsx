import { useState } from 'react';
import { CheckCircle2, Lightbulb, Target } from 'lucide-react';
import SectionTitle from '../common/SectionTitle';
import { challengeTips } from '../../services/kitchenService';

function getErrorMessage(error, fallback) {
  if (!error) return fallback;
  if (typeof error === 'string') return error;
  if (typeof error.message === 'string' && error.message.trim()) return error.message;
  return fallback;
}

export default function TipsSection({ challenges, onToggleChallenge, readOnly = false }) {
  const tips = challengeTips();
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [updatingChallenge, setUpdatingChallenge] = useState('');

  async function handleToggle(challenge) {
    if (readOnly) return;

    try {
      setUpdatingChallenge(challenge);
      setFeedback({ type: '', text: '' });
      await onToggleChallenge(challenge);
    } catch (error) {
      setFeedback({ type: 'error', text: getErrorMessage(error, 'Nao foi possivel atualizar o desafio agora.') });
    } finally {
      setUpdatingChallenge('');
    }
  }

  return (
    <div>
      <SectionTitle
        eyebrow="Dicas e desafios"
        title="Educacao operacional e disciplina de rotina"
        text="Este modulo aumenta o engajamento e ajuda a transformar a plataforma em habito."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-300">
              <Lightbulb size={18} />
            </div>
            <div className="text-xl font-bold">Dicas praticas</div>
          </div>

          <div className="space-y-3">
            {tips.map((tip) => (
              <div key={tip} className="rounded-2xl bg-neutral-900 p-4 text-white/76">
                {tip}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-2xl bg-amber-500/10 p-3 text-amber-200">
              <Target size={18} />
            </div>
            <div className="text-xl font-bold">Desafios atuais</div>
          </div>

          {feedback.text ? (
            <div
              className={`mb-4 rounded-2xl px-4 py-3 text-sm ${
                feedback.type === 'error'
                  ? 'border border-amber-500/20 bg-amber-500/10 text-amber-100'
                  : 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-100'
              }`}
            >
              {feedback.text}
            </div>
          ) : null}

          <div className="space-y-3">
            {challenges.current.map((challenge) => {
              const done = challenges.completed.includes(challenge);

              return (
                <button
                  key={challenge}
                  disabled={readOnly || updatingChallenge === challenge}
                  onClick={() => handleToggle(challenge)}
                  className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left transition ${
                    done
                      ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-100'
                      : 'border-white/10 bg-neutral-900 text-white/78 hover:bg-white/[0.04]'
                  } disabled:cursor-default disabled:opacity-80`}
                >
                  <span>{challenge}</span>
                  {done ? (
                    <CheckCircle2 size={18} />
                  ) : (
                    <span className="text-xs text-white/45">
                      {readOnly ? 'somente leitura' : updatingChallenge === challenge ? 'salvando' : 'marcar'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
