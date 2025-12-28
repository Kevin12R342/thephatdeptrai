import React, { useState, useEffect, useMemo, useRef } from 'react';
import { QUESTION_BANK } from './constants';
import { Question, QuizMode, QuizState } from './types';

// Helper to shuffle array
const shuffle = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Helper to build exam set
const buildExamSet = (allQuestions: Question[]): Question[] => {
  const t1 = allQuestions.filter(q => q.theme.startsWith("1.") && q.type === "mcq");
  const t2 = allQuestions.filter(q => q.theme.startsWith("2.") && q.type === "mcq");
  const t3 = allQuestions.filter(q => q.theme.startsWith("3.") && q.type === "mcq");
  const t4mcq = allQuestions.filter(q => q.theme.startsWith("4.") && q.type === "mcq");
  const tf4Key = allQuestions.filter(q => q.type === "tf4" && Array.isArray(q.a));

  const pick = (arr: Question[], k: number) => shuffle(arr).slice(0, Math.min(k, arr.length));

  return shuffle([
    ...pick(t1, 2),
    ...pick(t2, 3),
    ...pick(t3, 2),
    ...pick(t4mcq, 19),
    ...pick(tf4Key, 4),
  ]);
};

// Components
const StartScreen = ({ onStart, hasSavedData, onContinue }: { onStart: (mode: QuizMode, options: any) => void, hasSavedData: boolean, onContinue: () => void }) => {
  const themes = useMemo(() => Array.from(new Set(QUESTION_BANK.map(q => q.theme))).sort(), []);
  const [selectedTheme, setSelectedTheme] = useState("ALL");
  const [selectedLesson, setSelectedLesson] = useState("ALL");
  const [numQuestions, setNumQuestions] = useState(30);
  const [includeTF4, setIncludeTF4] = useState(true);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const lessons = useMemo(() => {
    return Array.from(new Set(
      QUESTION_BANK
        .filter(q => selectedTheme === "ALL" ? true : q.theme === selectedTheme)
        .map(q => q.lesson)
    )).sort();
  }, [selectedTheme]);

  const validateAndStart = (mode: QuizMode) => {
      if (!name.trim()) {
          setError("Vui lòng nhập họ tên thí sinh để bắt đầu!");
          return;
      }
      setError("");
      
      if (mode === 'practice') {
          onStart('practice', { theme: selectedTheme, lesson: selectedLesson, num: numQuestions, includeTF4, name: name });
      } else {
          onStart(mode, { name: name });
      }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      <div className="bg-[#16162ba6] backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-white/10 pb-4">
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-500">
              Ôn tập Tin học 11/12
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Ngân hàng câu hỏi: <strong className="text-white">{QUESTION_BANK.length}</strong> câu
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
             <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">
                Phiên bản <strong className="text-white">v2.3 (Final Fix)</strong>
             </div>
          </div>
        </div>

        {/* Input Name Section */}
        <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-300 mb-2">Họ và tên thí sinh <span className="text-red-500">*</span></label>
            <input 
                type="text" 
                value={name}
                onChange={(e) => {
                    setName(e.target.value);
                    if(e.target.value) setError("");
                }}
                placeholder="Nhập tên của bạn..."
                className={`w-full bg-white/5 border ${error ? 'border-red-500 animate-pulse' : 'border-white/20'} rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors text-lg`}
            />
            {error && <p className="text-red-400 text-sm mt-2 font-medium">⚠️ {error}</p>}
        </div>

        {hasSavedData && (
            <div className="mb-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex justify-between items-center animate-fade-in">
                <div>
                    <h3 className="text-yellow-400 font-bold text-sm">Phát hiện bài làm chưa xong</h3>
                    <p className="text-gray-400 text-xs">Bạn có muốn tiếp tục bài làm trước đó không?</p>
                </div>
                <button 
                    onClick={onContinue}
                    className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg text-sm transition-all"
                >
                    Tiếp tục
                </button>
            </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Chọn chế độ</h2>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => validateAndStart('exam')}
                className="group relative p-4 rounded-xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 transition-all text-left active:scale-[0.98]"
              >
                <div className="font-bold text-cyan-400 mb-1">Thi thử (30 câu)</div>
                <div className="text-xs text-gray-400">Ngẫu nhiên theo cấu trúc đề, chấm điểm /10, có đồng hồ đếm ngược.</div>
              </button>
              <button
                onClick={() => validateAndStart('full')}
                className="group relative p-4 rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/10 hover:bg-fuchsia-500/20 transition-all text-left active:scale-[0.98]"
              >
                <div className="font-bold text-fuchsia-400 mb-1">FULL {QUESTION_BANK.length} Câu</div>
                <div className="text-xs text-gray-400">Làm toàn bộ ngân hàng câu hỏi, hiện đáp án ngay lập tức.</div>
              </button>
            </div>
          </div>

          <div className="space-y-4 border-t md:border-t-0 md:border-l border-white/10 md:pl-8 pt-4 md:pt-0">
            <h2 className="text-lg font-semibold text-white">Luyện tập tùy chỉnh</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Chủ đề</label>
                <select
                  value={selectedTheme}
                  onChange={(e) => setSelectedTheme(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                  style={{ backgroundColor: '#1e1e2e' }}
                >
                  <option value="ALL">Tất cả</option>
                  {themes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Bài học</label>
                <select
                  value={selectedLesson}
                  onChange={(e) => setSelectedLesson(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                  style={{ backgroundColor: '#1e1e2e' }}
                >
                  <option value="ALL">Tất cả</option>
                  {lessons.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs text-gray-400 mb-1">Số câu</label>
                  <input
                    type="number"
                    min="5"
                    max={QUESTION_BANK.length}
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeTF4}
                      onChange={(e) => setIncludeTF4(e.target.checked)}
                      className="accent-cyan-400 w-4 h-4"
                    />
                    <span className="text-sm text-gray-300">Gồm Đ/S</span>
                  </label>
                </div>
              </div>
              <button
                onClick={() => validateAndStart('practice')}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold text-white shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                Bắt đầu luyện
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const QuizScreen = ({ state, dispatch }: { state: QuizState, dispatch: any }) => {
  const q = state.questions[state.currentIndex];
  const total = state.questions.length;
  const currentAnswer = state.answers.get(q.id);
  const isRevealed = state.revealed.has(q.id);
  const [showMapMobile, setShowMapMobile] = useState(false);

  // Scroll to top when question changes
  useEffect(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [state.currentIndex]);

  const handleMCQSelect = (idx: number) => {
    if (state.isFinished || (state.mode !== 'exam' && isRevealed)) return;
    dispatch({ type: 'ANSWER', qId: q.id, answer: idx });
  };

  const handleTFSelect = (idx: number, val: boolean) => {
    if (state.isFinished || (state.mode !== 'exam' && isRevealed)) return;
    const current = (state.answers.get(q.id) as boolean[]) || [null, null, null, null];
    const next = [...current];
    next[idx] = val;
    dispatch({ type: 'ANSWER', qId: q.id, answer: next });
  };

  // Navigation
  const handleNext = () => dispatch({ type: 'NEXT' });
  const handlePrev = () => dispatch({ type: 'PREV' });
  const handleReveal = () => dispatch({ type: 'REVEAL', qId: q.id });
  const handleSubmit = () => {
    if (window.confirm(state.mode === 'practice' ? "Bạn muốn kết thúc luyện tập và xem kết quả?" : "Bạn có chắc chắn muốn nộp bài?")) {
      dispatch({ type: 'FINISH' });
      setShowMapMobile(false); 
    }
  };

  const minutes = Math.floor(state.timeRemaining / 60);
  const seconds = state.timeRemaining % 60;
  const timerStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const shouldShowResult = state.isFinished || (state.mode !== 'exam' && isRevealed);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start pb-24 lg:pb-6">
      {/* Main Card */}
      <div className="bg-[#16162ba6] backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col min-h-[50vh]">
        {/* Header */}
        <div className="p-4 border-b border-white/10 bg-white/5 flex flex-col sm:flex-row justify-between sm:items-center gap-2 sticky top-0 z-10 backdrop-blur-xl">
          <div className="flex items-center justify-between w-full sm:w-auto">
             <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold whitespace-nowrap">
                Câu {state.currentIndex + 1}/{total}
                </span>
                <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs">
                {q.type === 'mcq' ? 'Trắc nghiệm' : 'Đúng/Sai'}
                </span>
             </div>
             {state.mode === 'exam' && (
                <div className={`sm:hidden font-mono font-bold text-sm px-2 py-1 rounded-lg border ${state.timeRemaining < 300 ? 'border-red-500/50 text-red-400 bg-red-500/10' : 'border-white/10 bg-white/5 text-cyan-300'}`}>
                {timerStr}
                </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
             <div className="text-xs text-gray-400 font-medium truncate max-w-[150px] sm:max-w-none flex items-center gap-1">
                 <span className="opacity-50">Thí sinh:</span> <span className="text-white font-bold">{state.userName}</span>
             </div>
             {state.mode === 'exam' && (
                <div className={`hidden sm:block font-mono font-bold text-lg px-3 py-1 rounded-lg border ${state.timeRemaining < 300 ? 'border-red-500/50 text-red-400 bg-red-500/10' : 'border-white/10 bg-white/5 text-cyan-300'}`}>
                ⏱ {timerStr}
                </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6">
          <div className="mb-6 text-base md:text-xl font-medium leading-relaxed whitespace-pre-wrap text-white">
            {q.q}
          </div>

          {/* MCQ Options */}
          {q.type === 'mcq' && (
            <div className="space-y-3">
              {q.options?.map((opt, i) => {
                let statusClass = "border-white/10 bg-white/5 hover:bg-white/10 active:bg-white/20";
                
                if (shouldShowResult) {
                    if (i === q.a) {
                        statusClass = "border-green-500 bg-green-500/20";
                    } else if (currentAnswer === i) {
                        statusClass = "border-red-500 bg-red-500/20";
                    } else {
                        statusClass = "border-white/10 bg-white/5 opacity-50";
                    }
                } else {
                    if (currentAnswer === i) {
                        statusClass = "border-cyan-500 bg-cyan-500/20 ring-1 ring-cyan-500";
                    }
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleMCQSelect(i)}
                    className={`w-full p-3 md:p-4 rounded-xl border text-left transition-all ${statusClass} flex items-start group`}
                  >
                    <span className={`flex-shrink-0 w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center mr-3 text-xs md:text-sm font-bold transition-colors ${currentAnswer === i || (shouldShowResult && i === q.a) ? 'bg-white/20' : 'bg-white/5 group-hover:bg-white/10'}`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="mt-0.5 md:mt-1 text-sm md:text-base text-gray-200">{opt}</span>
                    
                    {shouldShowResult && i === q.a && (
                        <span className="ml-auto text-green-400 font-bold">✓</span>
                    )}
                    {shouldShowResult && currentAnswer === i && i !== q.a && (
                        <span className="ml-auto text-red-400 font-bold">✗</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* TF4 Options */}
          {q.type === 'tf4' && (
             <div className="space-y-4">
                 <div className="grid grid-cols-[1fr_50px_50px] md:grid-cols-[1fr_60px_60px] gap-2 border-b border-white/10 pb-2 mb-2">
                     <div className="text-xs text-gray-400 uppercase font-bold">Phát biểu</div>
                     <div className="text-center text-xs text-gray-400 uppercase font-bold">Đúng</div>
                     <div className="text-center text-xs text-gray-400 uppercase font-bold">Sai</div>
                 </div>
                 {q.statements?.map((stmt, i) => {
                     const userVal = (currentAnswer as boolean[] || [])[i];
                     const correctVal = (q.a as boolean[])[i];
                     
                     return (
                         <div key={i} className="grid grid-cols-[1fr_50px_50px] md:grid-cols-[1fr_60px_60px] gap-2 items-center py-3 border-b border-white/5 last:border-0">
                             <div className="text-sm md:text-base text-gray-200">{stmt}</div>
                             
                             {/* True Option */}
                             <button
                                onClick={() => handleTFSelect(i, true)}
                                className={`h-10 w-full rounded flex items-center justify-center transition-colors ${
                                    shouldShowResult 
                                        ? (correctVal === true ? 'bg-green-500/20 text-green-400 border border-green-500/50' : (userVal === true ? 'bg-red-500/20 text-red-400' : 'bg-white/5 opacity-30'))
                                        : (userVal === true ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30' : 'bg-white/5 hover:bg-white/10 active:bg-white/20')
                                }`}
                             >
                                Đ
                             </button>

                             {/* False Option */}
                             <button
                                onClick={() => handleTFSelect(i, false)}
                                className={`h-10 w-full rounded flex items-center justify-center transition-colors ${
                                    shouldShowResult
                                        ? (correctVal === false ? 'bg-green-500/20 text-green-400 border border-green-500/50' : (userVal === false ? 'bg-red-500/20 text-red-400' : 'bg-white/5 opacity-30'))
                                        : (userVal === false ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30' : 'bg-white/5 hover:bg-white/10 active:bg-white/20')
                                }`}
                             >
                                S
                             </button>
                         </div>
                     )
                 })}
             </div>
          )}

          {/* Explanation */}
          {shouldShowResult && q.explain && (
              <div className="mt-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-200 text-sm md:text-base">
                  <h4 className="font-bold text-xs md:text-sm mb-1 uppercase text-blue-400">Giải thích:</h4>
                  <p>{q.explain}</p>
              </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/10 bg-white/5 flex justify-between items-center sticky bottom-0 z-10 backdrop-blur-xl">
            <button 
                onClick={handlePrev} 
                disabled={state.currentIndex === 0}
                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs md:text-sm font-medium"
            >
                Quay lại
            </button>
            
            <div className="flex gap-2">
                {!state.isFinished && state.mode !== 'exam' && !isRevealed && (
                    <button 
                        onClick={handleReveal}
                        className="px-3 md:px-4 py-2 rounded-lg bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border border-yellow-500/30 transition-all text-xs md:text-sm font-bold whitespace-nowrap"
                    >
                        Đáp án
                    </button>
                )}
                
                {state.currentIndex < total - 1 ? (
                    <button 
                        onClick={handleNext}
                        className="px-6 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-500 transition-all text-sm font-bold shadow-lg shadow-cyan-500/20 active:scale-95"
                    >
                        Tiếp
                    </button>
                ) : (
                    <button 
                        onClick={handleSubmit}
                        disabled={state.isFinished}
                        className="px-6 py-2 rounded-lg bg-fuchsia-600 text-white hover:bg-fuchsia-500 transition-all text-sm font-bold shadow-lg shadow-fuchsia-500/20 disabled:opacity-50 active:scale-95"
                    >
                        {state.isFinished ? "Xong" : "Nộp bài"}
                    </button>
                )}
            </div>
        </div>
      </div>

      {/* Sidebar / Question Map */}
      <div className={`fixed inset-x-0 bottom-0 top-20 z-50 lg:z-auto lg:static lg:block transition-transform duration-300 ${showMapMobile ? 'translate-y-0' : 'translate-y-[110%] lg:translate-y-0'}`}>
        <div className="h-full flex flex-col bg-[#16162b] lg:bg-[#16162ba6] lg:backdrop-blur-md border-t lg:border border-white/10 lg:rounded-2xl shadow-2xl lg:h-[calc(100vh-100px)]">
            
            {/* Mobile Header for Map */}
            <div className="lg:hidden flex items-center justify-between p-4 border-b border-white/10 bg-[#16162b]">
                <h3 className="text-sm font-bold text-gray-200">Danh sách câu hỏi</h3>
                <button onClick={() => setShowMapMobile(false)} className="text-gray-400 hover:text-white p-1">
                    ✕
                </button>
            </div>

            {state.isFinished && (
                <div className="p-6 text-center border-b border-white/10">
                    <div className="text-gray-400 text-sm mb-1">Điểm số của bạn</div>
                    <div className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-br from-green-400 to-emerald-600">
                        {state.score.toFixed(1)} / 10
                    </div>
                </div>
            )}

            {/* Scrollable Grid Area - Chạy kéo cho 210 câu */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <h3 className="hidden lg:block text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">Danh sách câu hỏi</h3>
                <div className="grid grid-cols-5 gap-2 pb-2">
                    {state.questions.map((qItem, idx) => {
                        const isCurr = idx === state.currentIndex;
                        const ans = state.answers.get(qItem.id);
                        const hasAns = ans !== undefined && (Array.isArray(ans) ? ans.some(x => x !== null) : true);
                        
                        let bg = "bg-white/5 text-gray-400";
                        if (isCurr) bg = "bg-cyan-500/20 text-cyan-400 border border-cyan-500";
                        else if (hasAns) bg = "bg-blue-500/20 text-blue-300";

                        // Result mode colors
                        if (state.isFinished) {
                            const isCorrect = qItem.type === 'mcq' 
                                ? (ans === qItem.a)
                                : (Array.isArray(qItem.a) && Array.isArray(ans) && qItem.a.every((v, i) => v === ans[i]));
                            
                            if (isCorrect) bg = "bg-green-500 text-white border-green-600";
                            else bg = "bg-red-500 text-white border-red-600";
                            
                            if (isCurr) bg += " ring-2 ring-white";
                        }

                        return (
                            <button
                                key={idx}
                                onClick={() => {
                                    dispatch({ type: 'GOTO', index: idx });
                                    setShowMapMobile(false);
                                }}
                                className={`aspect-square rounded flex items-center justify-center text-xs font-bold transition-all ${bg}`}
                            >
                                {idx + 1}
                            </button>
                        )
                    })}
                </div>
            </div>
            
            {/* Fixed Buttons Area - Khắc phục lỗi nút bị liệt */}
            <div className="p-4 border-t border-white/10 bg-[#16162b] lg:bg-transparent z-50">
                {!state.isFinished && (
                    <button 
                        onClick={handleSubmit}
                        className="w-full mb-2 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-red-400 font-bold text-sm transition-all"
                    >
                        {state.mode === 'practice' ? "Kết thúc & Xem điểm" : "Nộp bài sớm"}
                    </button>
                )}
                
                <button 
                    onClick={() => {
                        if(window.confirm("Thoát bài làm và quay về màn hình chính?")) dispatch({ type: 'HOME' });
                    }}
                    className="w-full py-3 rounded-xl hover:bg-white/5 text-gray-500 text-sm transition-all"
                >
                    Thoát
                </button>
            </div>
        </div>
      </div>
      
      {/* Mobile Map Toggle Button (Fixed bottom right) */}
      <div className="fixed bottom-24 right-4 lg:hidden z-30">
          <button 
            onClick={() => setShowMapMobile(!showMapMobile)}
            className="w-12 h-12 rounded-full bg-cyan-600 text-white shadow-lg flex items-center justify-center border-2 border-white/20 active:scale-95 transition-transform"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
      </div>
    </div>
  );
};

export default function App() {
  const [state, setState] = useState<QuizState>({
    mode: null,
    userName: "",
    questions: [],
    currentIndex: 0,
    answers: new Map(),
    revealed: new Set(),
    isFinished: false,
    score: 0,
    timeRemaining: 0
  });

  const [hasSavedData, setHasSavedData] = useState(false);

  // Load state from local storage on mount
  useEffect(() => {
      try {
          const saved = localStorage.getItem('IT_QUIZ_STATE_V2');
          if (saved) {
              const parsed = JSON.parse(saved);
              // Check if valid state
              if (parsed.mode && !parsed.isFinished && parsed.questions && parsed.questions.length > 0) {
                  setHasSavedData(true);
              }
          }
      } catch (e) {
          console.error("Failed to load state", e);
      }
  }, []);

  // Save state to local storage whenever it changes
  useEffect(() => {
      if (state.mode && !state.isFinished) {
          const stateToSave = {
              ...state,
              answers: Array.from(state.answers.entries()), // Map to array
              revealed: Array.from(state.revealed) // Set to array
          };
          localStorage.setItem('IT_QUIZ_STATE_V2', JSON.stringify(stateToSave));
      } else if (state.mode === null || state.isFinished) {
          localStorage.removeItem('IT_QUIZ_STATE_V2');
          setHasSavedData(false);
      }
  }, [state]);

  // Timer logic for Exam mode
  useEffect(() => {
    let timer: any;
    if (state.mode === 'exam' && !state.isFinished && state.timeRemaining > 0) {
      timer = setInterval(() => {
        setState(prev => {
          if (prev.timeRemaining <= 1) {
             // Calculate score automatically
             let score = 0;
             prev.questions.forEach(q => {
                 const ans = prev.answers.get(q.id);
                 if (q.type === 'mcq') {
                     if (ans === q.a) score += 1;
                 } else if (q.type === 'tf4' && Array.isArray(q.a) && Array.isArray(ans)) {
                     let correctCount = 0;
                     q.a.forEach((val, i) => { if (val === ans[i]) correctCount++; });
                     score += (correctCount * 0.25);
                 }
             });
             return { ...prev, timeRemaining: 0, isFinished: true, score: score }; 
          }
          return { ...prev, timeRemaining: prev.timeRemaining - 1 };
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [state.mode, state.isFinished, state.timeRemaining]);

  const handleContinue = () => {
      try {
          const saved = localStorage.getItem('IT_QUIZ_STATE_V2');
          if (saved) {
              const parsed = JSON.parse(saved);
              setState({
                  ...parsed,
                  answers: new Map(parsed.answers),
                  revealed: new Set(parsed.revealed)
              });
          }
      } catch (e) {
          console.error("Error continuing", e);
          alert("Dữ liệu lưu bị lỗi, vui lòng bắt đầu mới.");
          localStorage.removeItem('IT_QUIZ_STATE_V2');
          setHasSavedData(false);
      }
  };

  const dispatch = (action: any) => {
    setState(prev => {
      switch (action.type) {
        case 'START': {
          const { mode, opts } = action;
          let questions: Question[] = [];
          let time = 0;

          if (mode === 'exam') {
            questions = buildExamSet(QUESTION_BANK);
            time = 45 * 60; // 45 minutes
          } else if (mode === 'full') {
            questions = [...QUESTION_BANK]; 
          } else {
            // Practice
            let pool = QUESTION_BANK;
            if (opts.theme !== 'ALL') pool = pool.filter(q => q.theme === opts.theme);
            if (opts.lesson !== 'ALL') pool = pool.filter(q => q.lesson === opts.lesson);
            if (!opts.includeTF4) pool = pool.filter(q => q.type !== 'tf4');
            questions = shuffle(pool).slice(0, opts.num);
          }

          return {
            mode,
            userName: opts.name,
            questions,
            currentIndex: 0,
            answers: new Map(),
            revealed: new Set(),
            isFinished: false,
            score: 0,
            timeRemaining: time
          };
        }
        case 'ANSWER': {
          const newAns = new Map(prev.answers);
          newAns.set(action.qId, action.answer);
          return { ...prev, answers: newAns };
        }
        case 'NEXT':
           return { ...prev, currentIndex: Math.min(prev.questions.length - 1, prev.currentIndex + 1) };
        case 'PREV':
           return { ...prev, currentIndex: Math.max(0, prev.currentIndex - 1) };
        case 'GOTO':
           return { ...prev, currentIndex: action.index };
        case 'REVEAL': {
           const newRev = new Set(prev.revealed);
           newRev.add(action.qId);
           return { ...prev, revealed: newRev };
        }
        case 'FINISH': {
           // Calculate score
           let rawScore = 0;
           let maxScore = 0; // To normalize to 10
           
           prev.questions.forEach(q => {
               const ans = prev.answers.get(q.id);
               if (q.type === 'mcq') {
                   maxScore += 0.25;
                   if (ans === q.a) rawScore += 0.25;
               } else if (q.type === 'tf4' && Array.isArray(q.a)) {
                   maxScore += 1.0;
                   if (Array.isArray(ans)) {
                       let count = 0;
                       q.a.forEach((val, i) => { if (val === ans[i]) count++; });
                       rawScore += (count * 0.25);
                   }
               }
           });
           
           const finalScore = maxScore > 0 ? (rawScore / maxScore) * 10 : 0;

           return { ...prev, isFinished: true, score: finalScore, timeRemaining: 0 };
        }
        case 'HOME':
           return {
             mode: null,
             userName: "",
             questions: [],
             currentIndex: 0,
             answers: new Map(),
             revealed: new Set(),
             isFinished: false,
             score: 0,
             timeRemaining: 0
           };
        default:
          return prev;
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-gray-200 font-sans selection:bg-cyan-500/30">
        <style>{`
            ::-webkit-scrollbar { width: 8px; }
            ::-webkit-scrollbar-track { bg: #16162b; }
            ::-webkit-scrollbar-thumb { background: #33334d; border-radius: 4px; }
            ::-webkit-scrollbar-thumb:hover { background: #4d4d66; }
            .custom-scrollbar::-webkit-scrollbar { width: 4px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        `}</style>
        
        <header className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-fuchsia-500 z-50"></header>

        <main className="pt-8">
            {!state.mode ? (
                <StartScreen 
                    onStart={(mode, opts) => dispatch({ type: 'START', mode, opts })} 
                    hasSavedData={hasSavedData}
                    onContinue={handleContinue}
                />
            ) : (
                <QuizScreen state={state} dispatch={dispatch} />
            )}
        </main>
    </div>
  );
}