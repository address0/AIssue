'use client'
import { useQuery } from '@tanstack/react-query'
import { getSummariesChattingList } from '@/api/chatting'
import { usePathname } from 'next/navigation'

// 데이터 타입 정의
type ChatSummary = {
  projectKey: string
  date: string
  summary: string
}

// 파싱된 요약 데이터 타입 정의
type ParsedSummary = {
  overallSummary: string
  coreSummary: string
  userSummaries: Record<string, string> | null // 사용자별 요약이 없을 경우 null
}

export default function SummaryPage() {
  const pathname = usePathname()
  const projectId = pathname.split('/')[2]

  const { data, isLoading, isError, error } = useQuery<ChatSummary[]>({
    queryKey: ['chattingSummaryList', projectId],
    queryFn: () => getSummariesChattingList(projectId),
  })

  const parseSummary = (summary: string): ParsedSummary => {
    const overallSummaryMatch = summary.match(
      /전체 내용 요약:\s([\s\S]*?)핵심 내용 요약:/,
    )
    const coreSummaryMatch = summary.match(
      /핵심 내용 요약:\s([\s\S]*?)(사용자별 내용 요약:|사용자별 요약은 제공된 정보가 없기 때문에 진행할 수 없습니다)/,
    )
    const userSummariesMatch = summary.match(/사용자별 내용 요약:\s([\s\S]*)/)
    const overallSummary = overallSummaryMatch
      ? overallSummaryMatch[1].trim()
      : ''
    const coreSummary = coreSummaryMatch ? coreSummaryMatch[1].trim() : ''
    const userSummaries: Record<string, string> = {}
    if (userSummariesMatch) {
      const userSections = userSummariesMatch[1].split(/-\s*/)
      userSections.forEach((section) => {
        const [rawUser, content] = section.split(/:\s/)
        if (rawUser && content) {
          const user = rawUser.replace(/님님$/, '님').trim()
          userSummaries[user] = content.trim()
        }
      })
    }

    return {
      overallSummary,
      coreSummary,
      userSummaries,
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 text-lg font-semibold text-[#7498e5]">
        채팅 요약을 불러오는 중입니다...
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center p-8 text-lg text-red-500">
        데이터 로드 중 오류가 발생했습니다: {String(error)}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6 bg-[#f8faff] rounded-lg">
      {data && data.length > 0 ? (
        data.map((chatting) => {
          const parsedSummary = parseSummary(chatting.summary)

          return (
            <div
              key={chatting.projectKey}
              className="p-4 border border-[#d0e1ff] rounded-lg bg-white shadow-sm"
            >
              {/* 날짜 */}
              <p className="text-[#7498e5] font-bold mb-4">{chatting.date}</p>

              {/* 전체 내용 요약 */}
              <div className="mb-4">
                <p className="font-semibold text-gray-800">전체 내용 요약:</p>
                <p className="text-gray-700 text-sm leading-relaxed mt-1">
                  {parsedSummary.overallSummary}
                </p>
              </div>

              {/* 핵심 내용 요약 */}
              <div className="mb-4">
                <p className="font-semibold text-gray-800">핵심 내용 요약:</p>
                <p className="text-gray-700 text-sm leading-relaxed mt-1">
                  {parsedSummary.coreSummary}
                </p>
              </div>

              {/* 사용자별 내용 요약 */}
              <div>
                <p className="font-semibold text-gray-800">
                  사용자별 내용 요약:
                </p>

                {parsedSummary.userSummaries ? (
                  <div className="pl-4 space-y-2 mt-2">
                    {Object.entries(parsedSummary.userSummaries).map(
                      ([user, summary]) => (
                        <div key={user}>
                          <p className="font-semibold text-gray-800">
                            {user}의 요약:
                          </p>
                          <p className="text-gray-700 text-sm leading-relaxed">
                            {summary}
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                ) : (
                  <p className="text-gray-700 text-sm leading-relaxed mt-1">
                    사용자별 요약은 제공된 정보가 없기 때문에 진행할 수
                    없습니다.
                  </p>
                )}
              </div>
            </div>
          )
        })
      ) : (
        <div className="text-center text-gray-700">
          채팅을 친 기록이 없습니다. 채팅을 시작해볼까요?
        </div>
      )}
    </div>
  )
}
