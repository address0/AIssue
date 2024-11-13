import React, { useState } from 'react'
import Image from 'next/image'

// 요약 데이터 타입 정의
type ParsedSummary = {
  overallSummary: string
  coreSummary: string
  userSummaries: Record<string, string> | null
}

type SummaryDetailsProps = {
  parsedSummary: ParsedSummary
}

const SummaryDetails: React.FC<SummaryDetailsProps> = ({ parsedSummary }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev)
  }

  return (
    <div>
      {/* 날짜 및 요약 미리보기 */}
      <div className="flex justify-between items-center">
        <p className="font-semibold text-gray-800">핵심 내용 요약:</p>
        <button onClick={toggleExpand} className="text-[#7498e5] text-xl font-bold">
          <Image
            src={isExpanded ? '/img/closebtn.png' : '/img/plusbtn.png'}
            alt={isExpanded ? 'Close' : 'Expand'}
            width={24}
            height={24}
          />
        </button>
      </div>

      {/* 핵심 내용 요약 (미리보기) */}
      <div className="mt-2">
        <p className="text-gray-700 text-sm leading-relaxed mt-1">
          {parsedSummary.coreSummary}
        </p>
      </div>

      {/* 전체 내용 및 사용자별 내용 요약 (토글로 확장) */}
      {isExpanded && (
        <div className="mt-4">
          {/* 전체 내용 요약 */}
          <div className="mb-4">
            <p className="font-semibold text-gray-800">전체 내용 요약:</p>
            <p className="text-gray-700 text-sm leading-relaxed mt-1">
              {parsedSummary.overallSummary}
            </p>
          </div>

          {/* 사용자별 내용 요약 */}
          <div>
            <p className="font-semibold text-gray-800">사용자별 내용 요약:</p>

            {parsedSummary.userSummaries ? (
              <div className="pl-4 space-y-2 mt-2">
                {Object.entries(parsedSummary.userSummaries).map(([user, summary]) => (
                  <div key={user}>
                    <p className="font-semibold text-gray-800">{user}의 요약:</p>
                    <p className="text-gray-700 text-sm leading-relaxed">{summary}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-700 text-sm leading-relaxed mt-1">
                사용자별 요약은 제공된 정보가 없기 때문에 진행할 수 없습니다.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default SummaryDetails
