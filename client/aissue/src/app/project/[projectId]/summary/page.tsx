'use client'
import { useQuery } from '@tanstack/react-query'
import { getSummariesChattingList } from '@/api/chatting'
import { usePathname } from 'next/navigation'
import SummaryDetails from '@/components/SummaryDetails'

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
  userSummaries: Record<string, string> | null
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
    const overallSummary = overallSummaryMatch ? overallSummaryMatch[1].trim() : ''
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
    <div className="flex min-h-screen bg-gray-100">
      <div className="flex-1 p-6 overflow-hidden">
        <div className="flex flex-col gap-4 mb-6">
          <h2 className="text-2xl font-semibold text-[#5B586E]">
            팀원 채팅 기반 회고록
          </h2>
        </div>

        <div className="space-y-4">
          {data && data.length > 0 ? (
            data.map((chatting) => {
              const parsedSummary = parseSummary(chatting.summary)

              return (
                <div
                  key={chatting.projectKey}
                  className="p-4 border border-[#d0e1ff] rounded-lg bg-white shadow-sm"
                >
                  <p className="text-[#7498e5] font-bold">{chatting.date}</p>
                  <SummaryDetails parsedSummary={parsedSummary} />
                </div>
              )
            })
          ) : (
            <div className="text-center text-gray-700">
              채팅을 친 기록이 없습니다. 채팅을 시작해볼까요?
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
