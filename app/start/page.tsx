'use client';

import { useState } from 'react';
import { WIZARD_STEPS } from '@/lib/wizard-steps';
import { ChevronRight, ChevronLeft, Check, Loader2 } from 'lucide-react';

type Answers = Record<string, string | string[]>;

export default function StartPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [currentValue, setCurrentValue] = useState<string | string[]>('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const current = WIZARD_STEPS[step];
  const progress = ((step) / WIZARD_STEPS.length) * 100;
  const isLast = step === WIZARD_STEPS.length - 1;

  function handleSelect(option: string) {
    if (current.type === 'multiselect') {
      const arr = Array.isArray(currentValue) ? currentValue : [];
      setCurrentValue(
        arr.includes(option) ? arr.filter((v) => v !== option) : [...arr, option]
      );
    } else {
      setCurrentValue(option);
    }
  }

  function canAdvance() {
    if (!current.required) return true;
    if (Array.isArray(currentValue)) return currentValue.length > 0;
    return currentValue.toString().trim().length > 0;
  }

  function advance() {
    const newAnswers = { ...answers, [current.id]: currentValue };
    setAnswers(newAnswers);
    if (isLast) {
      handleSubmit(newAnswers);
    } else {
      setStep(step + 1);
      setCurrentValue(answers[WIZARD_STEPS[step + 1]?.id] ?? '');
    }
  }

  function back() {
    setAnswers((a) => ({ ...a, [current.id]: currentValue }));
    setStep(step - 1);
    setCurrentValue(answers[WIZARD_STEPS[step - 1]?.id] ?? '');
  }

  async function handleSubmit(finalAnswers: Answers) {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_name: finalAnswers.business_name,
          contact_email: finalAnswers.contact_email,
          answers: finalAnswers,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setDone(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--navy)' }}>
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center mx-auto glow-blue">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">You're in!</h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            We've received your brief. Our AI agents are already getting to work.
            Check your email — your client portal link is on its way.
          </p>
          <p className="text-slate-500 text-sm">
            Questions? Reply to the confirmation email anytime.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--navy)' }}>
      {/* Header */}
      <div className="px-6 pt-8 pb-4">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-400">
              Step {step + 1} of {WIZARD_STEPS.length}
            </span>
            <span className="text-sm font-medium text-blue-400">
              {Math.round(progress)}% complete
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #2563EB, #3B82F6)' }}
            />
          </div>
        </div>
      </div>

      {/* Step dots */}
      <div className="px-6 py-4">
        <div className="max-w-xl mx-auto flex gap-1.5 justify-center">
          {WIZARD_STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i < step ? 'bg-blue-500' : i === step ? 'bg-blue-400 w-6' : 'bg-slate-700'
              }`}
              style={{ width: i === step ? 24 : 8 }}
            />
          ))}
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-xl w-full space-y-8">
          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
              {current.question}
            </h2>
            {current.subtext && (
              <p className="text-slate-400 leading-relaxed">{current.subtext}</p>
            )}
          </div>

          {/* Input */}
          {(current.type === 'text' || current.type === 'email') && (
            <input
              type={current.type}
              value={currentValue as string}
              onChange={(e) => setCurrentValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && canAdvance() && advance()}
              placeholder={current.placeholder}
              autoFocus
              className="w-full px-5 py-4 rounded-xl text-white text-lg placeholder-slate-600 outline-none transition-all
                border border-slate-700 bg-slate-900/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          )}

          {current.type === 'textarea' && (
            <textarea
              value={currentValue as string}
              onChange={(e) => setCurrentValue(e.target.value)}
              placeholder={current.placeholder}
              rows={4}
              autoFocus
              className="w-full px-5 py-4 rounded-xl text-white placeholder-slate-600 outline-none resize-none transition-all
                border border-slate-700 bg-slate-900/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-base leading-relaxed"
            />
          )}

          {current.type === 'select' && current.options && (
            <div className="grid gap-3">
              {current.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setCurrentValue(opt)}
                  className={`w-full text-left px-5 py-4 rounded-xl border text-base font-medium transition-all duration-150 ${
                    currentValue === opt
                      ? 'border-blue-500 bg-blue-600/20 text-white glow-blue'
                      : 'border-slate-700 bg-slate-900/50 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {current.type === 'multiselect' && current.options && (
            <div className="grid grid-cols-2 gap-3">
              {current.options.map((opt) => {
                const selected = Array.isArray(currentValue) && currentValue.includes(opt);
                return (
                  <button
                    key={opt}
                    onClick={() => handleSelect(opt)}
                    className={`text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-150 flex items-center gap-2 ${
                      selected
                        ? 'border-blue-500 bg-blue-600/20 text-white'
                        : 'border-slate-700 bg-slate-900/50 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded flex items-center justify-center border flex-shrink-0 ${
                      selected ? 'bg-blue-500 border-blue-500' : 'border-slate-600'
                    }`}>
                      {selected && <Check className="w-2.5 h-2.5 text-white" />}
                    </div>
                    {opt}
                  </button>
                );
              })}
            </div>
          )}

          {error && (
            <p className="text-red-400 text-sm bg-red-900/20 border border-red-800/50 rounded-lg px-4 py-3">
              {error}
            </p>
          )}

          {/* Navigation */}
          <div className="flex items-center gap-4">
            {step > 0 && (
              <button
                onClick={back}
                className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-all text-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            )}
            <button
              onClick={advance}
              disabled={!canAdvance() || submitting}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white text-base transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #2563EB, #3B82F6)' }}
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
              ) : isLast ? (
                <><Check className="w-4 h-4" /> Submit</>
              ) : (
                <>Continue <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </div>

          {!current.required && (
            <button
              onClick={advance}
              className="w-full text-center text-slate-500 text-sm hover:text-slate-400 transition-colors"
            >
              Skip this question →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
