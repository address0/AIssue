import React, { useState } from 'react';

interface ParsedSummary {
  overallSummary: string;
  coreSummary: string;
  userSummaries: Record<string, string> | null;
}

interface SummaryDetailsProps {
  parsedSummary: ParsedSummary;
}

const SummaryDetails: React.FC<SummaryDetailsProps> = ({ parsedSummary }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <div>
      {/* 전체 내용 요약 */}
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <p className="font-bold text-[#5B586E] mb-2">✅ 전체 내용 요약</p>
        <p className="text-gray-700 text-sm leading-relaxed">{parsedSummary.overallSummary}</p>
      </div>

      {/* 사용자별 내용 요약 */}
      <div>
        <button
          onClick={toggleExpand}
          className="text-sm text-[#7498e5] font-bold mb-4 inline-flex items-center gap-2"
        >
          {isExpanded ? '간략히 보기' : '사용자별 요약 보기'}
        </button>
        {isExpanded && parsedSummary.userSummaries && (
          <div className="space-y-4">
            {Object.entries(parsedSummary.userSummaries).map(([user, summary]) => (
              <div key={user} className="p-4 bg-[#f6faff] rounded-lg shadow-sm">
                <p className="font-bold text-[#5B586E]">{user}</p>
                <p className="text-gray-700 text-sm leading-relaxed">{summary}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SummaryDetails;
