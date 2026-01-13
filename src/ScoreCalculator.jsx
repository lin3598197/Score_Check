import React, { useState, useEffect } from 'react';
import { Calculator, CheckCircle, AlertTriangle, XCircle, RotateCcw, HelpCircle } from 'lucide-react';

export default function ScoreCalculator() {
  const [exam1, setExam1] = useState('');
  const [exam2, setExam2] = useState('');
  const [participation, setParticipation] = useState('');
  
  // Weights based on user request
  const WEIGHTS = {
    exam1: 0.2,
    exam2: 0.2,
    participation: 0.3,
    final: 0.3
  };

  // Helper to parse input safely
  const parseScore = (val) => {
    if (val === '' || isNaN(val)) return 0;
    return Math.min(100, Math.max(0, parseFloat(val)));
  };

  const s1 = parseScore(exam1);
  const s2 = parseScore(exam2);
  const sPart = parseScore(participation);

  // Current accumulated score based only on exams 1 & 2
  const currentExamWeightedScore = (s1 * WEIGHTS.exam1) + (s2 * WEIGHTS.exam2);
  
  // Score including participation (if entered)
  const currentTotalKnownScore = currentExamWeightedScore + (participation === '' ? 0 : sPart * WEIGHTS.participation);

  // Calculate required final exam score for a specific target (40 or 60)
  // Formula: (Target - CurrentWeighted) / FinalWeight
  const calculateRequiredFinal = (targetTotal) => {
    // If participation is not entered, we assume 0 for conservative calculation, 
    // BUT the UI logic handles the "unknown participation" case separately below.
    // This function assumes 'participation' state is used.
    
    // Total needed from the remaining parts
    const needed = targetTotal - currentTotalKnownScore;
    
    // Required raw score on final exam
    const requiredRaw = needed / WEIGHTS.final;
    
    return Math.ceil(requiredRaw); // Round up to nearest whole number
  };

  // Calculate combined points needed from (Final + Participation) if participation is empty
  // Remaining Weight is 60% (30% + 30%)
  const calculateCombinedNeeded = (targetTotal) => {
    const neededWeighted = targetTotal - currentExamWeightedScore;
    return neededWeighted; // This is the weighted score needed (e.g., 20 points out of the remaining 60 total weight)
  };

  const renderStatus = (targetScore) => {
    // If Participation is EMPTY, we show "Combined Effort" logic
    if (participation === '') {
      const neededWeighted = calculateCombinedNeeded(targetScore);
      
      if (neededWeighted <= 0) {
        return (
          <div className="bg-green-100 text-green-800 p-4 rounded-lg flex items-start gap-3 border border-green-200">
            <CheckCircle className="w-6 h-6 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-lg">已達標！</p>
              <p className="text-sm">光靠前兩次段考就已經拿到 {currentExamWeightedScore.toFixed(1)} 分，超過了 {targetScore} 分門檻。</p>
            </div>
          </div>
        );
      }
      
      const maxPossibleRemaining = 100 * (WEIGHTS.participation + WEIGHTS.final); // 60 points
      
      if (neededWeighted > maxPossibleRemaining) {
         return (
          <div className="bg-red-100 text-red-800 p-4 rounded-lg flex items-start gap-3 border border-red-200">
            <XCircle className="w-6 h-6 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-lg">無法達成</p>
              <p className="text-sm">即使平時與期末都拿滿分，總分也無法到達 {targetScore}。</p>
            </div>
          </div>
        );
      }

      return (
        <div className="bg-blue-50 text-blue-800 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle className="w-5 h-5" />
            <span className="font-bold text-lg">平時 + 期末 合計需求</span>
          </div>
          <p className="mb-2 text-sm">因為您尚未輸入平時成績，以下是剩下 60% 權重中需拿到的總分：</p>
          <div className="bg-white p-3 rounded border border-blue-100 text-center">
            <span className="text-gray-500 text-sm">剩餘總權重 (60分) 中需拿到</span>
            <div className="text-3xl font-bold text-blue-600 my-1">{neededWeighted.toFixed(1)} <span className="text-sm text-gray-400">分</span></div>
            <p className="text-xs text-gray-500">
              平均需在平時與期末各考 <strong>{Math.ceil(neededWeighted / (WEIGHTS.participation + WEIGHTS.final))}</strong> 分
            </p>
          </div>
        </div>
      );
    }

    // If Participation IS entered, we show exact Final Exam requirements
    const required = calculateRequiredFinal(targetScore);
    
    if (required <= 0) {
      return (
        <div className="bg-green-100 text-green-800 p-4 rounded-lg flex items-center gap-3 border border-green-200">
          <CheckCircle className="w-6 h-6" />
          <div>
            <span className="font-bold">恭喜！已經達標</span>
            <p className="text-xs">目前總分已超過 {targetScore}。</p>
          </div>
        </div>
      );
    } else if (required > 100) {
      return (
        <div className="bg-red-100 text-red-800 p-4 rounded-lg flex items-center gap-3 border border-red-200">
          <XCircle className="w-6 h-6" />
          <div>
            <span className="font-bold">不可能達成</span>
            <p className="text-xs">期末考就算考 100 分也無法到達 {targetScore}。</p>
          </div>
        </div>
      );
    } else {
      const isHard = required > 90;
      return (
        <div className={`p-4 rounded-lg flex flex-col gap-1 border ${isHard ? 'bg-orange-50 text-orange-800 border-orange-200' : 'bg-indigo-50 text-indigo-800 border-indigo-200'}`}>
          <div className="flex justify-between items-center">
             <span className="text-sm font-semibold">期末考需要考：</span>
             <span className={`text-3xl font-bold ${isHard ? 'text-orange-600' : 'text-indigo-600'}`}>{required} <span className="text-sm text-gray-500">分</span></span>
          </div>
          {isHard && <p className="text-xs font-medium flex items-center gap-1 mt-1"><AlertTriangle className="w-3 h-3"/> 這將會是一場硬仗！</p>}
        </div>
      );
    }
  };

  const handleReset = () => {
    setExam1('');
    setExam2('');
    setParticipation('');
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-xl overflow-hidden font-sans text-slate-800 my-8 border border-slate-100">
      {/* Header */}
      <div className="bg-slate-800 p-6 text-white flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Calculator className="w-6 h-6" />
            期末成績計算機
          </h1>
          <p className="text-slate-400 text-xs mt-1">權重：兩次段考各20%、平時30%、期末30%</p>
        </div>
        <button onClick={handleReset} className="text-slate-400 hover:text-white transition-colors" title="重置">
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        
        {/* Input Section */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">第一次段考 (20%)</label>
            <input
              type="number"
              value={exam1}
              onChange={(e) => setExam1(e.target.value)}
              placeholder="0-100"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono text-lg text-center"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">第二次段考 (20%)</label>
            <input
              type="number"
              value={exam2}
              onChange={(e) => setExam2(e.target.value)}
              placeholder="0-100"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono text-lg text-center"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex justify-between">
            <span>平時成績 (30%)</span>
            <span className="text-blue-500 normal-case font-normal text-[10px] bg-blue-50 px-2 py-0.5 rounded-full">選填，若不填則計算合計需求</span>
          </label>
          <input
            type="number"
            value={participation}
            onChange={(e) => setParticipation(e.target.value)}
            placeholder="尚未知道可留空"
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-mono text-lg text-center placeholder:text-sm"
          />
        </div>

        <hr className="border-slate-100" />

        {/* Current Status Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">目前已拿到積分</span>
            <span className="font-bold text-slate-800">{currentTotalKnownScore.toFixed(1)} <span className="font-normal text-slate-400">/ 100</span></span>
          </div>
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${currentTotalKnownScore >= 60 ? 'bg-green-500' : currentTotalKnownScore >= 40 ? 'bg-yellow-400' : 'bg-slate-300'}`} 
              style={{ width: `${Math.min(100, currentTotalKnownScore)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-slate-400 px-1">
            <span>0</span>
            <span className={currentTotalKnownScore >= 40 ? "text-yellow-600 font-bold" : ""}>40</span>
            <span className={currentTotalKnownScore >= 60 ? "text-green-600 font-bold" : ""}>60</span>
            <span>100</span>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          {/* Target 60 */}
          <div>
            <h3 className="text-sm font-bold text-slate-700 mb-2">及格門檻 (60分)</h3>
            {renderStatus(60)}
          </div>

          {/* Target 40 */}
          <div>
            <h3 className="text-sm font-bold text-slate-700 mb-2">補考門檻 (40分)</h3>
            {renderStatus(40)}
          </div>
        </div>

      </div>
    </div>
  );
}