import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ask, availableInterrogations, availableTopics, questionsFor, transcriptOf, type Line } from '@deadline/core';
import { useCase } from '../../cases/CaseProvider.tsx';
import { evidenceTitle } from '../../cases/labels.ts';
import { Portrait } from '../../ui/Portrait.tsx';
import { portraitUrl } from '../../cases/contentRepo.ts';
import { sound } from '../../audio/sound.ts';
import { haptic } from '../../audio/haptics.ts';
import s from './case.module.css';

const KIND_LABEL = { ask: '', press: 'Insistir', confront: 'Confrontar', present: 'Mostrar', contradiction: 'Contradicción' } as const;

/** Interrogatorio: temas, preguntas que dependen de lo que sabes y transcripción. */
export function InterrogationView() {
  const { characterId = '' } = useParams();
  const { c, k, inv, closed, revealed, run, base } = useCase();
  const it = availableInterrogations(c, k, inv?.role).find((x) => x.characterId === characterId) ?? (revealed ? c.interrogations.find((x) => x.characterId === characterId) : undefined);
  const [topicId, setTopicId] = useState<string | null>(null);
  const [fresh, setFresh] = useState<number>(-1);
  const logRef = useRef<HTMLDivElement>(null);
  const transcript = it && inv ? transcriptOf(it, inv) : [];

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' });
  }, [transcript.length]);

  if (!it) {
    return (
      <div className={s.sheet}>
        <p className={s.hand}>No hay motivo para interrogar a esa persona.</p>
        <Link to={`${base}/personas`} className={s.link}>
          Volver a personas
        </Link>
      </div>
    );
  }
  const subject = c.characters.find((x) => x.id === it.characterId)!;
  const topics = availableTopics(it, k);
  const topic = topics.find((t) => t.id === topicId) ?? topics[0];
  const questions = topic ? questionsFor(topic, k) : [];
  const pendingIn = (tid: string) => questionsFor(topics.find((t) => t.id === tid)!, k).filter((q) => q.askable).length;

  const doAsk = (qid: string) => {
    sound.play('key');
    haptic('light');
    const r = run((cf, i, now) => ask(cf, i, qid, now));
    if (r?.lines.length) setFresh(transcript.length);
  };

  const line = (l: Line, i: number, animate: boolean) => (
    <p key={i} className={l.speaker === 'narration' ? s.narration : s.answer} style={animate ? { animationDelay: `${i * 220}ms` } : undefined} data-animate={animate || undefined}>
      {l.text}
    </p>
  );

  return (
    <div className={s.interrogation}>
      <aside className={s.subject}>
        <Link to={`${base}/personas/${subject.id}`} className={s.link}>
          ← Ficha
        </Link>
        <Portrait character={subject} size={96} src={portraitUrl(c, subject)} recreation={c.origin === 'real'} />
        <h1 className={s.subjectName}>{subject.name}</h1>
        {it.setting && <p className={s.setting}>{it.setting}</p>}
      </aside>
      <div className={`${s.transcript} ${s.scroll}`} ref={logRef} aria-live="polite">
        {it.opening.map((l, i) => line(l, i, false))}
        {transcript.map((entry, idx) => (
          <div key={`${entry.question.id}-${idx}`} className={s.exchange}>
            <p className={s.questionLine}>
              {entry.question.presentEvidence && <span className={s.presentChip}>Muestra: {evidenceTitle(c, entry.question.presentEvidence)}</span>}
              {entry.question.prompt}
            </p>
            {entry.lines.map((l, i) => line(l, i, idx === fresh))}
          </div>
        ))}
      </div>
      {!closed && (
        <aside className={s.questions}>
          <div className={s.topicTabs} role="tablist" aria-label="Temas">
            {topics.map((t) => (
              <button key={t.id} role="tab" aria-selected={t.id === topic?.id} onClick={() => setTopicId(t.id)}>
                {t.label}
                {pendingIn(t.id) > 0 && <span className={s.dot} aria-label="Preguntas sin formular" />}
              </button>
            ))}
          </div>
          <ul className={`${s.questionList} ${s.scroll}`}>
            {questions.map(({ question: q, asked, askable }) => (
              <li key={q.id}>
                <button className={s.question} data-kind={q.kind} data-asked={asked || undefined} disabled={!askable} onClick={() => doAsk(q.id)}>
                  {KIND_LABEL[q.kind] && <span className={s.qKind}>{KIND_LABEL[q.kind]}</span>}
                  {q.presentEvidence && <span className={s.presentChip}>{evidenceTitle(c, q.presentEvidence)}</span>}
                  <span>{q.prompt}</span>
                </button>
              </li>
            ))}
            {questions.length === 0 && <li className={s.hand}>Nada más que preguntar sobre esto, por ahora.</li>}
          </ul>
        </aside>
      )}
    </div>
  );
}
