import React, { useState } from 'react';
import { Calculator, CheckCircle, AlertTriangle, XCircle, RotateCcw, HelpCircle } from 'lucide-react';

export default function ScoreCalculator() {
  const [exam1, setExam1] = useState('');
  const [exam2, setExam2] = useState('');
  const [participation, setParticipation] = useState('');
  const [finalExam, setFinalExam] = useState('');

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
  const sFinal = parseScore(finalExam);

  const partFilled = participation !== '';
  const finalFilled = finalExam !== '';

  // Accumulated score from exams 1 & 2
  const examWeighted = s1 * WEIGHTS.exam1 + s2 * WEIGHTS.exam2;

  // Total known score (add whichever optional fields are filled)
  const knownScore =
    examWeighted +
    (partFilled ? sPart * WEIGHTS.participation : 0) +
    (finalFilled ? sFinal * WEIGHTS.final : 0);

  // Remaining unknown weight
  const unknownWeight =
    (partFilled ? 0 : WEIGHTS.participation) +
    (finalFilled ? 0 : WEIGHTS.final);

  const maxPossibleScore = knownScore + unknownWeight * 100;

  // Calculate the raw score needed on the single unknown component to hit targetTotal
  // Returns null if both or neither are unknown (handled separately in render)
  const calculateRequired = (targetTotal, weight) => {
    const needed = targetTotal - knownScore;
    return Math.ceil(needed / weight);
  };

  // --- renderStatus ---
  // Returns compact status data for a given threshold
  const getRowData = (targetScore) => {
    if (partFilled && finalFilled) {
      return { state: knownScore >= targetScore ? 'safe' : 'done_fail' };
    }
    if (!partFilled && !finalFilled) {
      const neededWeighted = targetScore - examWeighted;
      if (neededWeighted <= 0) return { state: 'safe' };
      if (neededWeighted > 60) return { state: 'impossible' };
      return { state: 'combined', neededWeighted, avgNeeded: Math.ceil(neededWeighted / 0.6) };
    }
    const unknownLabel = !finalFilled ? '期末考' : '平時成績';
    const missingWeight = !finalFilled ? WEIGHTS.final : WEIGHTS.participation;
    const required = calculateRequired(targetScore, missingWeight);
    if (required <= 0) return { state: 'safe', unknownLabel };
    if (required > 100) return { state: 'impossible', unknownLabel };
    return { state: 'need', required, unknownLabel };
  };

  const renderRowRight = (d) => {
    if (d.state === 'safe')
      return <span className="text-green-600 font-bold text-sm flex items-center gap-1"><CheckCircle className="w-4 h-4" /> 已達標</span>;
    if (d.state === 'done_fail')
      return <span className="text-red-600 font-bold text-xs flex items-center gap-1"><XCircle className="w-4 h-4" /> 你完蛋了，砍掉重練吧 😭</span>;
    if (d.state === 'impossible')
      return <span className="text-red-600 font-bold text-xs flex items-center gap-1"><XCircle className="w-4 h-4" /> 滿分都救不了你，你很強耶（誤）👏</span>;
    if (d.state === 'combined')
      return (
        <div className="text-right">
          <div className="text-xs text-slate-400">期末+平時合計需</div>
          <div className="text-xl font-bold text-blue-600">{Math.round(d.neededWeighted)} <span className="text-xs text-gray-400">分</span></div>
          <div className="text-xs text-gray-400">各平均約 {d.avgNeeded} 分</div>
        </div>
      );
    // state === 'need'
    const isHard = d.required > 90;
    return (
      <div className="text-right">
        <div className="text-xs text-slate-400">{d.unknownLabel}需考</div>
        <div className={`text-2xl font-bold ${isHard ? 'text-orange-500' : 'text-indigo-600'}`}>
          {d.required} <span className="text-xs text-gray-400">分</span>
        </div>
        {isHard && <div className="text-xs text-orange-500 flex items-center justify-end gap-0.5"><AlertTriangle className="w-3 h-3" /> 神才考得到，祝你好運 🙏</div>}
      </div>
    );
  };

  const renderResults = () => {
    const d60 = getRowData(60);
    const d40 = getRowData(40);
    const isDead = maxPossibleScore < 40;
    const rowBg = (d) =>
      d.state === 'safe' ? 'bg-green-50' :
      (d.state === 'done_fail' || d.state === 'impossible') ? 'bg-red-50' : 'bg-white';
    return (
      <div className="rounded-xl border border-slate-200 overflow-hidden">
        {/* 頂部死當狀態 banner */}
        {isDead ? (
          <div className="bg-red-600 text-white px-4 py-2 flex items-center gap-2 text-sm font-bold">
            <XCircle className="w-4 h-4" /> 死透透了 💀 滿分都只有 {Math.round(maxPossibleScore)} 分，開始準備重修吧
          </div>
        ) : knownScore < 40 ? (
          <div className="bg-red-100 text-red-800 px-4 py-2 flex items-center gap-2 text-sm font-semibold border-b border-red-200">
            <AlertTriangle className="w-4 h-4" /> 你沒問題嗎？積分還不到 40，死當正在朝你招手 👋
          </div>
        ) : (
          <div className="bg-green-100 text-green-800 px-4 py-2 flex items-center gap-2 text-sm font-semibold border-b border-green-200">
            <CheckCircle className="w-4 h-4" /> 好喔至少不會死當 🎉 — 已超過 40 分安全線
          </div>
        )}
        {/* 及格門檻 60 */}
        <div className={`flex items-center justify-between px-4 py-3 border-b border-slate-100 ${rowBg(d60)}`}>
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">及格門檻</div>
            <div className="text-sm font-bold text-slate-700">60 分</div>
          </div>
          {renderRowRight(d60)}
        </div>
        {/* 補考/死當線 40 */}
        <div className={`flex items-center justify-between px-4 py-3 ${rowBg(d40)}`}>
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">補考 / 死當線</div>
            <div className="text-sm font-bold text-slate-700">40 分</div>
          </div>
          {renderRowRight(d40)}
        </div>
      </div>
    );
  };

  // LEGACY: keep renderStatus signature so JSX below still compiles during refactor
  const renderStatus = (targetScore) => {
    // Case: Both filled → result is final
    if (partFilled && finalFilled) {
      if (knownScore >= targetScore) {
        return (
          <div className="bg-green-100 text-green-800 p-4 rounded-lg flex items-center gap-3 border border-green-200">
            <CheckCircle className="w-6 h-6" />
            <div>
              <span className="font-bold">恭喜！安全下庄</span>
              <p className="text-xs">總分 {Math.round(knownScore)} 分已超過 {targetScore} 分。</p>
            </div>
          </div>
        );
      } else {
        return (
          <div className="bg-red-100 text-red-800 p-4 rounded-lg flex items-center gap-3 border border-red-200">
            <XCircle className="w-6 h-6" />
            <div>
              <span className="font-bold">已無法達成</span>
              <p className="text-xs">所有成績都已填入，總分 {Math.round(knownScore)} 分未達 {targetScore} 分。</p>
            </div>
          </div>
        );
      }
    }

    // Case: Neither filled → combined needed
    if (!partFilled && !finalFilled) {
      const neededWeighted = targetScore - examWeighted;
      if (neededWeighted <= 0) {
        return (
          <div className="bg-green-100 text-green-800 p-4 rounded-lg flex items-start gap-3 border border-green-200">
            <CheckCircle className="w-6 h-6 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-lg">你超電！</p>
              <p className="text-sm">光靠前兩次段考就已拿到 {Math.round(examWeighted)} 分，超過 {targetScore} 分門檻。</p>
            </div>
          </div>
        );
      }
      if (neededWeighted > 60) {
        return (
          <div className="bg-red-100 text-red-800 p-4 rounded-lg flex items-start gap-3 border border-red-200">
            <XCircle className="w-6 h-6 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-lg">哈哈哈哈，你沒救了</p>
              <p className="text-sm">即使平時與期末都拿滿分，總分也無法到達 {targetScore} 分。</p>
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
          <p className="mb-2 text-sm">尚未輸入平時及期末成績，以下是剩餘 60% 中需拿到的總分：</p>
          <div className="bg-white p-3 rounded border border-blue-100 text-center">
            <span className="text-gray-500 text-sm">剩餘總權重 (60分) 中需拿到</span>
            <div className="text-3xl font-bold text-blue-600 my-1">
              {Math.round(neededWeighted)} <span className="text-sm text-gray-400">分</span>
            </div>
            <p className="text-xs text-gray-500">
              平均需在平時與期末各考 <strong>{Math.ceil(neededWeighted / 0.6)}</strong> 分
            </p>
          </div>
        </div>
      );
    }

    // Case: Only ONE is filled → calculate the missing one
    const unknownLabel = !finalFilled ? '期末考' : '平時成績';
    const missingWeight = !finalFilled ? WEIGHTS.final : WEIGHTS.participation;
    const required = calculateRequired(targetScore, missingWeight);

    if (required <= 0) {
      return (
        <div className="bg-green-100 text-green-800 p-4 rounded-lg flex items-center gap-3 border border-green-200">
          <CheckCircle className="w-6 h-6" />
          <div>
            <span className="font-bold">恭喜！安全下庄</span>
            <p className="text-xs">目前積分已超過 {targetScore} 分，{unknownLabel}隨便考都行。</p>
          </div>
        </div>
      );
    } else if (required > 100) {
      return (
        <div className="bg-red-100 text-red-800 p-4 rounded-lg flex items-center gap-3 border border-red-200">
          <XCircle className="w-6 h-6" />
          <div>
            <span className="font-bold">不可能達成</span>
            <p className="text-xs">{unknownLabel}就算考 100 分也無法到達 {targetScore} 分。</p>
          </div>
        </div>
      );
    } else {
      const isHard = required > 90;
      return (
        <div className={`p-4 rounded-lg flex flex-col gap-1 border ${isHard ? 'bg-orange-50 text-orange-800 border-orange-200' : 'bg-indigo-50 text-indigo-800 border-indigo-200'}`}>
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold">{unknownLabel}需要考：</span>
            <span className={`text-3xl font-bold ${isHard ? 'text-orange-600' : 'text-indigo-600'}`}>
              {required} <span className="text-sm text-gray-500">分</span>
            </span>
          </div>
          {isHard && (
            <p className="text-xs font-medium flex items-center gap-1 mt-1">
              <AlertTriangle className="w-3 h-3" /> 這將會是一場硬仗！
            </p>
          )}
        </div>
      );
    }
  };

  // --- renderDeathWarning ---
  const renderDeathWarning = () => {
    if (maxPossibleScore < 40) {
      return (
        <div className="bg-red-100 text-red-900 p-4 rounded-lg flex items-start gap-3 border-2 border-red-400">
          <XCircle className="w-6 h-6 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-lg">死當確定 💀</p>
            <p className="text-sm">
              即使後續全部滿分，最高得分僅 <span className="font-bold">{Math.round(maxPossibleScore)} 分</span>，無法越過 40 分死當線。
            </p>
          </div>
        </div>
      );
    }

    if (knownScore >= 40) {
      return (
        <div className="bg-green-50 text-green-800 p-4 rounded-lg flex items-center gap-3 border border-green-200">
          <CheckCircle className="w-6 h-6 shrink-0" />
          <div>
            <p className="font-bold">死當無虞 🎉</p>
            <p className="text-xs">目前積分已超過 40 分安全線，不會死當。</p>
          </div>
        </div>
      );
    }

    // Still at risk but recoverable
    if (!partFilled && !finalFilled) {
      const neededWeighted = 40 - examWeighted;
      const avgNeeded = Math.ceil(neededWeighted / 0.6);
      return (
        <div className="bg-red-50 text-red-800 p-4 rounded-lg border-2 border-red-300">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-bold">死當警示 ⚠️</span>
          </div>
          <p className="text-sm mb-2">目前積分不足 40 分，仍有死當風險！</p>
          <div className="bg-white p-3 rounded border border-red-100 text-center">
            <span className="text-gray-500 text-xs">平時 + 期末合計（60分佔比中）至少需拿</span>
            <div className="text-3xl font-bold text-red-600 my-1">
              {Math.round(neededWeighted)} <span className="text-sm text-gray-400">分</span>
            </div>
            <p className="text-xs text-gray-500">
              即平時與期末平均各至少 <strong>{avgNeeded}</strong> 分，才能脫離死當
            </p>
          </div>
        </div>
      );
    }

    const unknownLabel = !finalFilled ? '期末考' : '平時成績';
    const missingWeight = !finalFilled ? WEIGHTS.final : WEIGHTS.participation;
    const required = calculateRequired(40, missingWeight);

    return (
      <div className="bg-red-50 text-red-800 p-4 rounded-lg flex flex-col gap-1 border-2 border-red-300">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-bold">死當警示 ⚠️</span>
        </div>
        <p className="text-xs mb-1">目前積分不足 40 分，仍有死當風險！</p>
        <div className="flex justify-between items-center bg-white p-3 rounded border border-red-100">
          <span className="text-sm font-semibold">{unknownLabel}至少要考：</span>
          <span className="text-3xl font-bold text-red-600">
            {required} <span className="text-sm text-gray-500">分</span>
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1">考到這個分數才能脫離死當線（學期成績達40分）</p>
      </div>
    );
  };

  const handleReset = () => {
    setExam1('');
    setExam2('');
    setParticipation('');
    setFinalExam('');
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-xl overflow-hidden font-sans text-slate-800 my-8 border border-slate-100">
      {/* Header */}
      <div className="bg-slate-800 p-6 text-white flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Calculator className="w-6 h-6" />
            菜菜撈撈計算機
          </h1>
          <p className="text-slate-400 text-xs mt-1">菜菜撈撈專用｜兩次段考各20%、平時30%、期末30%</p>
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

        {/* Participation & Final - Interchangeable pair */}
        <div className="rounded-lg border border-purple-200 bg-purple-50 p-3 space-y-3">
          <p className="text-xs text-purple-600 font-semibold text-center">
            以下兩項權重相同（各30%），輸入其中一項即可推算另一項 ↕️
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">期末考 (30%)</label>
              <input
                type="number"
                value={finalExam}
                onChange={(e) => setFinalExam(e.target.value)}
                placeholder="選填"
                className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-mono text-lg text-center"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">平時成績 (30%)</label>
              <input
                type="number"
                value={participation}
                onChange={(e) => setParticipation(e.target.value)}
                placeholder="選填"
                className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-mono text-lg text-center"
              />
            </div>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* Current Status Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">目前已知積分</span>
            <span className="font-bold text-slate-800">{Math.round(knownScore)} <span className="font-normal text-slate-400">/ 100</span></span>
          </div>
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${knownScore >= 60 ? 'bg-green-500' : knownScore >= 40 ? 'bg-yellow-400' : 'bg-slate-300'}`}
              style={{ width: `${Math.min(100, knownScore)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-slate-400 px-1">
            <span>0</span>
            <span className={knownScore >= 40 ? "text-yellow-600 font-bold" : ""}>40</span>
            <span className={knownScore >= 60 ? "text-green-600 font-bold" : ""}>60</span>
            <span>100</span>
          </div>
        </div>

        {/* Results Section */}
        {renderResults()}

      </div>
    </div>
  );
}