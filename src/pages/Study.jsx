import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { saveQuizResult } from '../utils/firestore';
import { generatePredictedQuestions } from '../utils/ai';
import { GCSE_SUBJECTS, ALEVEL_SUBJECTS, ASLEVEL_SUBJECTS } from '../data/subjects';
import { useIsPro, ProBadge } from '../components/ProGate';
import AIOutput from '../components/AIOutput';

const SAMPLE_FLASHCARDS = [
  { id: '1', question: 'What is the equation for Kinetic Energy?', answer: 'Ek = 0.5 * m * v^2 (where m is mass in kg, v is velocity in m/s)', topic: 'Energy' },
  { id: '2', question: 'Define specific heat capacity.', answer: 'The amount of energy required to raise the temperature of 1kg of a substance by 1°C.', topic: 'Energy' },
  { id: '3', question: 'What is Newton\'s First Law of Motion?', answer: 'An object remains at rest or continues at constant velocity unless acted upon by a net external force.', topic: 'Forces' },
  { id: '4', question: 'State the difference between vectors and scalars.', answer: 'Vector quantities have both magnitude and direction; scalar quantities have magnitude only.', topic: 'Forces' }
];

const SAMPLE_QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'Which energy store increases when an object is lifted above the ground?',
    options: [
      { a: 'Gravitational Potential Energy', correct: true },
      { a: 'Elastic Potential Energy', correct: false },
      { a: 'Kinetic Energy', correct: false },
      { a: 'Thermal Energy', correct: false }
    ],
    explanation: 'Lifting an object against gravity transfers energy into its gravitational potential energy store.'
  },
  {
    id: 'q2',
    question: 'What is the unit of power?',
    options: [
      { a: 'Joule (J)', correct: false },
      { a: 'Watt (W)', correct: true },
      { a: 'Newton (N)', correct: false },
      { a: 'Pascal (Pa)', correct: false }
    ],
    explanation: 'Power is the rate of energy transfer and is measured in Watts (1 Watt = 1 Joule per second).'
  }
];

export default function Study() {
  const isPro = useIsPro();
  const [activeTab, setActiveTab] = useState('flashcards'); // 'flashcards' | 'quiz' | 'exam'
  
  // Qualification & Subject Filters
  const [qualification, setQualification] = useState('GCSE');
  const [subject, setSubject] = useState('Physics');
  const [board, setBoard] = useState('AQA');

  // Flashcards state
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardMastery, setCardMastery] = useState({});

  // Quiz state
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // Exam Question AI state
  const [isGeneratingExam, setIsGeneratingExam] = useState(false);
  const [examOutput, setExamOutput] = useState('');
  const [userExamAnswer, setUserExamAnswer] = useState('');

  // Reset quiz state on tab/subject change
  const handleSubjectChange = (newSub) => {
    setSubject(newSub);
    setCardIndex(0);
    setIsFlipped(false);
    setQuizIndex(0);
    setSelectedOption(null);
    setIsAnswerChecked(false);
    setQuizScore(0);
    setQuizFinished(false);
  };

  const handleNextCard = () => {
    setIsFlipped(false);
    setCardIndex((prev) => (prev + 1) % SAMPLE_FLASHCARDS.length);
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    setCardIndex((prev) => (prev - 1 + SAMPLE_FLASHCARDS.length) % SAMPLE_FLASHCARDS.length);
  };

  const markCardConfidence = (level) => {
    const currentCard = SAMPLE_FLASHCARDS[cardIndex];
    setCardMastery((prev) => ({ ...prev, [currentCard.id]: level }));
    handleNextCard();
  };

  // Quiz Option Click
  const handleSelectOption = (idx) => {
    if (isAnswerChecked) return;
    setSelectedOption(idx);
  };

  const handleCheckQuizAnswer = () => {
    if (selectedOption === null || isAnswerChecked) return;
    setIsAnswerChecked(true);

    const currentQ = SAMPLE_QUIZ_QUESTIONS[quizIndex];
    if (currentQ.options[selectedOption].correct) {
      setQuizScore((prev) => prev + 1);
    }
  };

  const handleNextQuizQuestion = async () => {
    if (quizIndex + 1 < SAMPLE_QUIZ_QUESTIONS.length) {
      setQuizIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerChecked(false);
    } else {
      setQuizFinished(true);
      if (auth.currentUser) {
        await saveQuizResult(auth.currentUser.uid, {
          qualification,
          subject,
          board,
          score: quizScore + (SAMPLE_QUIZ_QUESTIONS[quizIndex]?.options[selectedOption]?.correct ? 1 : 0),
          total: SAMPLE_QUIZ_QUESTIONS.length,
          timestamp: new Date().toISOString()
        });
      }
    }
  };

  const handleGenerateExamQuestion = async () => {
    setIsGeneratingExam(true);
    setExamOutput('');
    try {
      const result = await generatePredictedQuestions({
        qualification,
        subject,
        board,
        topicName: 'General Core Revision'
      });
      setExamOutput(result);
    } catch (err) {
      setExamOutput("Error generating exam question: " + err.message);
    } finally {
      setIsGeneratingExam(false);
    }
  };

  const currentCard = SAMPLE_FLASHCARDS[cardIndex];
  const currentQuizQ = SAMPLE_QUIZ_QUESTIONS[quizIndex];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 16px' }}>
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>Interactive Study Suite</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Revise board-specific material, test your recall, and practice real exam questions.
        </p>
      </header>

      {/* Qualification & Subject Selector Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '24px', background: 'var(--bg-card)', padding: '16px', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, uppercase: 'true', color: 'var(--text-muted)', marginBottom: '4px' }}>Qualification</label>
          <select
            value={qualification}
            onChange={(e) => {
              setQualification(e.target.value);
              setSubject(e.target.value === 'GCSE' ? 'Physics' : 'Mathematics');
            }}
            style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--r-md)', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-primary)' }}
          >
            <option value="GCSE">GCSE</option>
            <option value="AS-Level">AS-Level</option>
            <option value="A-Level">A-Level</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, uppercase: 'true', color: 'var(--text-muted)', marginBottom: '4px' }}>Subject</label>
          <select
            value={subject}
            onChange={(e) => handleSubjectChange(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--r-md)', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-primary)' }}
          >
            {(qualification === 'GCSE' ? GCSE_SUBJECTS : qualification === 'AS-Level' ? ASLEVEL_SUBJECTS : ALEVEL_SUBJECTS).map((sub) => (
              <option key={sub.name} value={sub.name}>{sub.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, uppercase: 'true', color: 'var(--text-muted)', marginBottom: '4px' }}>Exam Board</label>
          <select
            value={board}
            onChange={(e) => setBoard(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--r-md)', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-primary)' }}
          >
            <option value="AQA">AQA</option>
            <option value="Edexcel">Edexcel</option>
            <option value="OCR">OCR</option>
            <option value="WJEC">WJEC</option>
            <option value="Eduqas">Eduqas</option>
            <option value="CCEA">CCEA</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <nav style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', marginBottom: '24px', paddingBottom: '8px' }}>
        <button
          onClick={() => setActiveTab('flashcards')}
          style={{ padding: '8px 16px', borderRadius: 'var(--r-full)', border: 'none', background: activeTab === 'flashcards' ? 'var(--accent)' : 'transparent', color: activeTab === 'flashcards' ? '#fff' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer' }}
        >
          Flashcards
        </button>
        <button
          onClick={() => setActiveTab('quiz')}
          style={{ padding: '8px 16px', borderRadius: 'var(--r-full)', border: 'none', background: activeTab === 'quiz' ? 'var(--accent)' : 'transparent', color: activeTab === 'quiz' ? '#fff' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer' }}
        >
          Multiple Choice Quiz
        </button>
        <button
          onClick={() => setActiveTab('exam')}
          style={{ padding: '8px 16px', borderRadius: 'var(--r-full)', border: 'none', background: activeTab === 'exam' ? 'var(--accent)' : 'transparent', color: activeTab === 'exam' ? '#fff' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          Exam Generator <ProBadge />
        </button>
      </nav>

      {/* TAB 1: FLASHCARDS */}
      {activeTab === 'flashcards' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '12px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Card {cardIndex + 1} of {SAMPLE_FLASHCARDS.length} — Topic: {currentCard.topic}
          </div>

          <div
            onClick={() => setIsFlipped(!isFlipped)}
            style={{
              minHeight: '220px',
              background: isFlipped ? 'var(--bg-card)' : 'var(--accent-light, #f3e8ff)',
              border: '2px solid var(--accent)',
              borderRadius: 'var(--r-xl)',
              padding: '32px 24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
              marginBottom: '20px',
              transition: 'transform 0.2s, background 0.2s',
              boxShadow: 'var(--shadow-md, 0 4px 12px rgba(0,0,0,0.05))'
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '8px' }}>
              {isFlipped ? 'ANSWER' : 'QUESTION (Click to flip)'}
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', maxWidth: '600px' }}>
              {isFlipped ? currentCard.answer : currentCard.question}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '24px' }}>
            <button
              onClick={() => markCardConfidence('hard')}
              style={{ padding: '10px 20px', borderRadius: 'var(--r-full)', border: '1px solid var(--danger, #ef4444)', background: 'transparent', color: 'var(--danger, #ef4444)', fontWeight: 600, cursor: 'pointer' }}
            >
              Hard (Review Soon)
            </button>
            <button
              onClick={() => markCardConfidence('easy')}
              style={{ padding: '10px 20px', borderRadius: 'var(--r-full)', border: '1px solid var(--success, #10b981)', background: 'transparent', color: 'var(--success, #10b981)', fontWeight: 600, cursor: 'pointer' }}
            >
              Easy (Mastered)
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={handlePrevCard}
              style={{ padding: '8px 16px', borderRadius: 'var(--r-full)', border: '1px solid var(--border)', background: 'var(--bg-card)', cursor: 'pointer', fontWeight: 600 }}
            >
              &larr; Previous
            </button>
            <button
              onClick={handleNextCard}
              style={{ padding: '8px 16px', borderRadius: 'var(--r-full)', border: '1px solid var(--border)', background: 'var(--bg-card)', cursor: 'pointer', fontWeight: 600 }}
            >
              Next &rarr;
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: MULTIPLE CHOICE QUIZ */}
      {activeTab === 'quiz' && (
        <div>
          {quizFinished ? (
            <div style={{ textAlign: 'center', padding: '32px', background: 'var(--bg-card)', borderRadius: 'var(--r-xl)', border: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>Quiz Completed!</h2>
              <p style={{ fontSize: '1.1rem', marginBottom: '16px' }}>
                Your Score: <strong style={{ color: 'var(--accent)' }}>{quizScore} / {SAMPLE_QUIZ_QUESTIONS.length}</strong>
              </p>
              <button
                onClick={() => {
                  setQuizIndex(0);
                  setSelectedOption(null);
                  setIsAnswerChecked(false);
                  setQuizScore(0);
                  setQuizFinished(false);
                }}
                style={{ padding: '10px 24px', borderRadius: 'var(--r-full)', border: 'none', background: 'var(--accent)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
              >
                Restart Quiz
              </button>
            </div>
          ) : (
            <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: 'var(--r-xl)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                <span>Question {quizIndex + 1} of {SAMPLE_QUIZ_QUESTIONS.length}</span>
                <span>Subject: {subject}</span>
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>
                {currentQuizQ.question}
              </h3>

              <div style={{ display: 'grid', gap: '10px', marginBottom: '20px' }}>
                {currentQuizQ.options.map((opt, i) => {
                  const isSel = selectedOption === i;
                  const isC = opt.correct;
                  const ch = isAnswerChecked;

                  return (
                    <button
                      key={i}
                      onClick={() => handleSelectOption(i)}
                      style={{
                        padding: '12px 16px',
                        borderRadius: 'var(--r-md)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontSize: '0.88rem',
                        lineHeight: 1.4,
                        fontWeight: isSel ? 700 : 500,
                        transition: 'all 0.2s',
                        background: !ch
                          ? (isSel ? 'rgba(124,58,237,0.15)' : 'var(--bg-hover)')
                          : isC
                          ? 'rgba(16,185,129,0.15)'
                          : isSel
                          ? 'rgba(239,68,68,0.15)'
                          : 'var(--bg-hover)',
                        border: `1.5px solid ${
                          !ch
                            ? (isSel ? 'var(--accent)' : 'var(--border)')
                            : isC
                            ? 'rgba(16,185,129,0.5)'
                            : isSel
                            ? 'rgba(239,68,68,0.5)'
                            : 'var(--border)'
                        }`,
                        color: !ch
                          ? 'var(--text-primary)'
                          : isC
                          ? 'var(--success, #10b981)'
                          : isSel
                          ? 'var(--danger, #ef4444)'
                          : 'var(--text-muted)'
                      }}
                    >
                      <span style={{ marginRight: '8px', opacity: 0.6 }}>{['A','B','C','D'][i]}.</span>
                      {opt.a}
                    </button>
                  );
                })}
              </div>

              {isAnswerChecked && (
                <div style={{ padding: '12px 16px', background: 'var(--bg-hover)', borderRadius: 'var(--r-md)', marginBottom: '20px', fontSize: '0.88rem' }}>
                  <strong>Explanation:</strong> {currentQuizQ.explanation}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                {!isAnswerChecked ? (
                  <button
                    onClick={handleCheckQuizAnswer}
                    disabled={selectedOption === null}
                    style={{ padding: '10px 20px', borderRadius: 'var(--r-full)', border: 'none', background: 'var(--accent)', color: '#fff', fontWeight: 700, cursor: 'pointer', opacity: selectedOption === null ? 0.5 : 1 }}
                  >
                    Check Answer
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuizQuestion}
                    style={{ padding: '10px 20px', borderRadius: 'var(--r-full)', border: 'none', background: 'var(--accent)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
                  >
                    {quizIndex + 1 < SAMPLE_QUIZ_QUESTIONS.length ? 'Next Question' : 'View Results'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: EXAM GENERATOR */}
      {activeTab === 'exam' && (
        <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: 'var(--r-xl)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>AI Exam Question Generator</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Specification: {qualification} {subject} ({board})</span>
          </div>

          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Generates realistic exam questions complete with mark schemes and examiner tips strictly modeled after {board} criteria.
          </p>

          <button
            onClick={handleGenerateExamQuestion}
            disabled={isGeneratingExam}
            style={{ width: '100%', padding: '12px', borderRadius: 'var(--r-full)', border: 'none', background: 'var(--accent)', color: '#fff', fontWeight: 700, cursor: 'pointer', marginBottom: '24px', opacity: isGeneratingExam ? 0.6 : 1 }}
          >
            {isGeneratingExam ? 'Generating Board Question...' : 'Generate New Exam Question'}
          </button>

          {examOutput && (
            <div style={{ spaceY: '16px' }}>
              <div style={{ background: 'var(--bg-main)', padding: '16px', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)', marginBottom: '16px' }}>
                <AIOutput content={examOutput} />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>Your Answer:</label>
                <textarea
                  rows={4}
                  value={userExamAnswer}
                  onChange={(e) => setUserExamAnswer(e.target.value)}
                  placeholder="Write your answer here before revealing the mark scheme..."
                  style={{ width: '100%', padding: '12px', borderRadius: 'var(--r-md)', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-primary)', fontSize: '0.9rem' }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
