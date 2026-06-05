import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { BookOpen, Award, CheckCircle2, Play, Lock, Eye, AlertCircle, HelpCircle } from 'lucide-react';
import Button from '../../components/common/Button';
import { useToast } from '../../hooks/useToast';

const UserTraining = () => {
  const toast = useToast();
  const { trainingModules, quizzes, updateModuleProgress, certificates } = useAppContext();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal / Study / Quiz states
  const [selectedModule, setSelectedModule] = useState(null);
  const [activeLessonIdx, setActiveLessonIdx] = useState(null);
  const [activeQuiz, setActiveQuiz] = useState(null);
  
  // Quiz progress states
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizPassed, setQuizPassed] = useState(false);

  // Filter modules
  const filteredModules = trainingModules.filter((mod) => {
    const matchesSearch = mod.name.toLowerCase().includes(searchQuery.toLowerCase());
    let matchesStatus = true;
    if (statusFilter === 'Completed') matchesStatus = mod.isCompleted;
    else if (statusFilter === 'In Progress') matchesStatus = !mod.isCompleted && mod.progress > 0;
    else if (statusFilter === 'Not Started') matchesStatus = mod.progress === 0;
    
    return matchesSearch && matchesStatus;
  });

  const handleStudyLesson = (lessonIdx) => {
    setActiveLessonIdx(lessonIdx);
  };

  const handleCompleteLessonReading = () => {
    if (!selectedModule) return;
    
    // Simulate advancing progress
    const totalLessons = selectedModule.lessons.length;
    const currentProgress = selectedModule.progress;
    
    // Advance progress by proportion
    const increment = Math.ceil(100 / totalLessons);
    const nextProgress = Math.min(currentProgress + increment, 100);
    
    updateModuleProgress(selectedModule.id, nextProgress);
    
    // Sync local selected module copy
    selectedModule.progress = nextProgress;
    if (nextProgress >= 100) {
      selectedModule.isCompleted = false; // completed only after passing quiz!
    }

    setActiveLessonIdx(null);
  };

  const handleOpenQuiz = (module) => {
    // Find tied quiz
    const tiedQuiz = quizzes.find(q => q.quizName.toLowerCase().includes(module.name.toLowerCase()) || module.name.toLowerCase().includes(q.quizName.replace(' Quiz', '').toLowerCase()));
    
    if (tiedQuiz) {
      setActiveQuiz(tiedQuiz);
      setQuizAnswers({});
      setQuizSubmitted(false);
      setQuizScore(0);
      setQuizPassed(false);
      setSelectedModule(null); // Close module details
    } else {
      toast.info('No evaluation quiz configured for this module. Marking course completed.');
      updateModuleProgress(module.id, 100);
      setSelectedModule(null);
    }
  };

  const handleSelectAnswer = (qIdx, optIdx) => {
    setQuizAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleSubmitQuiz = () => {
    if (!activeQuiz) return;

    // Verify all answered
    const unanswered = activeQuiz.questions.some((_, idx) => quizAnswers[idx] === undefined);
    if (unanswered) {
      toast.error('Please answer all questions before submitting.');
      return;
    }

    // Grade answers
    let correctCount = 0;
    activeQuiz.questions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctIndex) {
        correctCount++;
      }
    });

    const scorePercent = Math.round((correctCount / activeQuiz.questions.length) * 100);
    const passed = scorePercent >= activeQuiz.passingScore;

    setQuizScore(scorePercent);
    setQuizPassed(passed);
    setQuizSubmitted(true);

    if (passed) {
      // Find course module ID
      const targetMod = trainingModules.find(m => m.name.toLowerCase().includes(activeQuiz.quizName.replace(' Quiz', '').toLowerCase()) || activeQuiz.quizName.toLowerCase().includes(m.name.toLowerCase()));
      if (targetMod) {
        updateModuleProgress(targetMod.id, 100);
      }
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="saas-header">
        <div className="saas-title-group">
          <h1>Security Awareness Academy</h1>
          <p>Access assigned micro-modules, finish lessons, and pass evaluation quizzes to claim certificates.</p>
        </div>
      </div>

      {/* Toolbar filters */}
      <div className="saas-card" style={{ padding: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          
          {/* Keyword Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search training modules by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
            <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)', display: 'flex' }}>
              <BookOpen size={16} />
            </div>
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <select
              className="form-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ minWidth: '160px', padding: '8px 12px' }}
            >
              <option value="All">All Courses</option>
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

        </div>
      </div>

      {/* Courses List */}
      {filteredModules.length === 0 ? (
        <div className="saas-card" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-light)' }}>
          <BookOpen size={48} style={{ color: 'var(--border-hover)', marginBottom: '16px' }} />
          <h3>No assigned modules</h3>
          <p style={{ fontSize: '14px', marginTop: '4px' }}>Excellent work! All courses cleared or no match found.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '24px'
        }}>
          {filteredModules.map((mod) => {
            const hasCert = certificates.some(c => c.courseName === mod.name);
            const isCompleted = mod.isCompleted || hasCert;
            
            return (
              <div key={mod.id} className="saas-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <span className={`badge badge-${mod.difficulty.toLowerCase()}`}>{mod.difficulty} Lvl</span>
                  <span className={`badge badge-${isCompleted ? 'completed' : mod.progress > 0 ? 'in-progress' : 'not-started'}`}>
                    {isCompleted ? 'Completed' : mod.progress > 0 ? `${mod.progress}% Progress` : 'Not Started'}
                  </span>
                </div>

                <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px' }}>{mod.name}</h3>
                
                <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--text-light)', marginBottom: '16px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    🕒 {mod.duration}
                  </span>
                  <span>&bull;</span>
                  <span>{mod.lessons?.length || 4} lessons</span>
                </div>

                {/* Progress bar */}
                <div style={{ flex: 1, marginBottom: '20px' }}>
                  <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${isCompleted ? 100 : mod.progress}%`, 
                      height: '100%', 
                      backgroundColor: isCompleted ? 'var(--color-success)' : 'var(--color-teal)' 
                    }} />
                  </div>
                </div>

                {/* Main Action Trigger */}
                <Button
                  variant={isCompleted ? 'secondary' : 'teal'}
                  icon={isCompleted ? Eye : Play}
                  onClick={() => setSelectedModule(mod)}
                  style={{ width: '100%' }}
                >
                  {isCompleted ? 'Review course' : mod.progress > 0 ? 'Resume Training' : 'Start Module'}
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* 1. Course Details Modal */}
      {selectedModule && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <h2>Course Study Plan</h2>
              <button onClick={() => setSelectedModule(null)} className="close-btn">&times;</button>
            </div>
            
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <span className={`badge badge-${selectedModule.difficulty.toLowerCase()}`} style={{ float: 'right' }}>
                  {selectedModule.difficulty} Lvl
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: '700' }}>{selectedModule.name}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-light)', marginTop: '4px' }}>Estimate: {selectedModule.duration} | progress: {selectedModule.isCompleted ? 100 : selectedModule.progress}%</p>
              </div>

              {/* Course Progress */}
              <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ 
                  width: `${selectedModule.isCompleted ? 100 : selectedModule.progress}%`, 
                  height: '100%', 
                  backgroundColor: selectedModule.isCompleted ? 'var(--color-success)' : 'var(--color-teal)' 
                }} />
              </div>

              {/* Lessons checklist */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '12px' }}>Lessons Syllabus</h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedModule.lessons ? selectedModule.lessons.map((lesson, idx) => {
                    // Check if lesson is studied based on progress index
                    const totalLessons = selectedModule.lessons.length;
                    const increment = 100 / totalLessons;
                    const isStudied = selectedModule.isCompleted || (selectedModule.progress >= (idx + 1) * increment);
                    
                    return (
                      <div 
                        key={lesson}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          padding: '12px 16px',
                          backgroundColor: isStudied ? 'var(--color-teal-light)' : '#ffffff'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <CheckCircle2 size={16} style={{ color: isStudied ? 'var(--color-success)' : 'var(--border-hover)' }} />
                          <span style={{ fontSize: '13px', fontWeight: '500', color: isStudied ? 'var(--color-teal)' : 'var(--text-muted)' }}>
                            {idx + 1}. {lesson}
                          </span>
                        </div>

                        {!isStudied && !selectedModule.isCompleted && (
                          <Button 
                            variant="secondary"
                            size="sm"
                            onClick={() => handleStudyLesson(idx)}
                            style={{ padding: '4px 10px', fontSize: '11px' }}
                          >
                            Study Lesson
                          </Button>
                        )}
                      </div>
                    );
                  }) : <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>No syllabus found.</span>}
                </div>
              </div>

              {/* Unlock Quiz call to action */}
              {((selectedModule.progress >= 100 && !selectedModule.isCompleted) || selectedModule.progress === 100) && !certificates.some(c=>c.courseName===selectedModule.name) && (
                <div style={{
                  backgroundColor: 'var(--color-primary-light)',
                  border: '1px solid #bfdbfe',
                  borderRadius: '8px',
                  padding: '16px',
                  textAlign: 'center',
                  marginTop: '12px'
                }}>
                  <strong style={{ fontSize: '14px', color: 'var(--color-primary-hover)', display: 'block' }}>All Lessons Studied!</strong>
                  <p style={{ fontSize: '12px', color: 'var(--color-primary-hover)', marginTop: '4px', marginBottom: '12px' }}>Complete the evaluation quiz and score 80%+ to unlock your completion certificate.</p>
                  <Button 
                    variant="teal"
                    size="sm"
                    onClick={() => handleOpenQuiz(selectedModule)}
                    style={{ width: '100%', fontWeight: '600' }}
                  >
                    Take Certification Quiz
                  </Button>
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <Button variant="secondary" onClick={() => setSelectedModule(null)}>Close Portal</Button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Slide study Modal */}
      {activeLessonIdx !== null && (
        <div className="modal-overlay" style={{ zIndex: 1001 }}>
          <div className="modal-content animate-fade-in" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>Study Module slide</h2>
              <button onClick={() => setActiveLessonIdx(null)} className="close-btn">&times;</button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center', padding: '32px 24px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto'
              }}>
                <BookOpen size={24} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)' }}>
                Lesson {activeLessonIdx + 1}: {selectedModule?.lessons[activeLessonIdx]}
              </h3>
              
              <div style={{
                backgroundColor: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '20px',
                fontSize: '13px',
                color: 'var(--text-muted)',
                lineHeight: '1.6',
                textAlign: 'left',
                margin: '20px 0',
                minHeight: '120px'
              }}>
                {activeLessonIdx === 0 && "Phishing is a deceptive social engineering threat where attackers pretend to be reputable institutions via digital communication to harvest passwords, security tokens, or credit cards."}
                {activeLessonIdx === 1 && "Always double check spelling typos (typo-squatting) inside domains, look out for extreme urgency, generic greetings, and verify redirect URLs before tapping on hyperlinks."}
                {activeLessonIdx === 2 && "Corporate executive spear phishing (Spear/Whaling) manipulates authority roles. For example, a fake email appearing to be from the CEO asking for immediate bank updates."}
                {activeLessonIdx === 3 && "If you spot a suspicious communication, use the designated report button to alert corporate security immediately. Do not ignore it or forward it to other teammates."}
              </div>

              <p style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>Please read the notes carefully. Click complete below to advance progress.</p>
            </div>
            <div className="modal-footer">
              <Button variant="secondary" onClick={() => setActiveLessonIdx(null)}>Close</Button>
              <Button variant="primary" onClick={handleCompleteLessonReading}>Complete Lesson</Button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Quiz Interface modal */}
      {activeQuiz && (
        <div className="modal-overlay" style={{ zIndex: 1002 }}>
          <div className="modal-content animate-fade-in" style={{ maxWidth: '600px', maxHeight: '90vh' }}>
            <div className="modal-header">
              <h2>Evaluation: {activeQuiz.quizName}</h2>
              <button onClick={() => setActiveQuiz(null)} className="close-btn">&times;</button>
            </div>
            
            <div className="modal-body" style={{ overflowY: 'auto' }}>
              {quizSubmitted ? (
                /* Quiz submission results display */
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: quizPassed ? 'var(--color-success-light)' : 'var(--color-danger-light)',
                    color: quizPassed ? 'var(--color-success)' : 'var(--color-danger)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px auto',
                    boxShadow: quizPassed ? '0 4px 10px rgba(16,185,129,0.15)' : '0 4px 10px rgba(239,68,68,0.15)'
                  }}>
                    {quizPassed ? <CheckCircle2 size={32} /> : <AlertCircle size={32} />}
                  </div>

                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-main)' }}>
                    {quizPassed ? 'Evaluation Passed!' : 'Evaluation Failed'}
                  </h3>
                  <p style={{ fontSize: '28px', fontWeight: '800', margin: '14px 0', color: quizPassed ? 'var(--color-teal)' : 'var(--color-danger)' }}>
                    {quizScore}% Score
                  </p>
                  
                  <p style={{ fontSize: '13px', color: 'var(--text-light)', maxWidth: '340px', margin: '0 auto 24px auto', lineHeight: '1.5' }}>
                    {quizPassed ? 
                      'Awesome! You successfully satisfied the passing criteria (80%+). Your completion certificate has been generated.' : 
                      'You did not satisfy the minimum passing criteria of 80%. Please review the slides and attempt again.'}
                  </p>

                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    {quizPassed ? (
                      <Button variant="primary" onClick={() => setActiveQuiz(null)}>Close Evaluation</Button>
                    ) : (
                      <>
                        <Button variant="secondary" onClick={() => setActiveQuiz(null)}>Close</Button>
                        <Button variant="teal" onClick={() => { setQuizSubmitted(false); setQuizAnswers({}); }}>Retry Quiz</Button>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                /* Active Quiz sheet questions rendering */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>Quiz Rules: Answer all multiple choice questions. Pass threshold is {activeQuiz.passingScore}%.</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {activeQuiz.questions.map((q, qIdx) => (
                      <div key={qIdx} style={{
                        border: '1px solid var(--border-hover)',
                        borderRadius: '8px',
                        padding: '16px',
                        backgroundColor: 'var(--bg-main)'
                      }}>
                        <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '12px', display: 'flex', gap: '8px' }}>
                          <HelpCircle size={16} style={{ color: 'var(--color-teal)', flexShrink: 0, marginTop: '2px' }} />
                          <span>{qIdx + 1}. {q.questionText}</span>
                        </h4>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {q.options.map((opt, oIdx) => {
                            const isSelected = quizAnswers[qIdx] === oIdx;
                            return (
                              <label 
                                key={oIdx}
                                style={{
                                  border: isSelected ? '1px solid var(--color-teal)' : '1px solid var(--border-hover)',
                                  borderRadius: '6px',
                                  padding: '10px 14px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '10px',
                                  fontSize: '13px',
                                  fontWeight: isSelected ? '600' : '400',
                                  backgroundColor: isSelected ? 'var(--color-teal-light)' : '#ffffff',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                <input
                                  type="radio"
                                  name={`question-ans-${qIdx}`}
                                  checked={isSelected}
                                  onChange={() => handleSelectAnswer(qIdx, oIdx)}
                                  style={{ cursor: 'pointer' }}
                                />
                                <span style={{ color: isSelected ? 'var(--color-teal)' : 'var(--text-muted)' }}>{opt}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {!quizSubmitted && (
              <div className="modal-footer">
                <Button variant="secondary" onClick={() => setActiveQuiz(null)}>Close</Button>
                <Button variant="teal" onClick={handleSubmitQuiz}>Submit Answers</Button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default UserTraining;
