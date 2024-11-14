import React from 'react'

interface Task {
  title: string
  start: Date
  end: Date
}

interface IssueDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  parentSummary: string
  tasks: Task[]
}

const IssueModal: React.FC<IssueDetailsModalProps> = ({
  isOpen,
  onClose,
  title,
  parentSummary,
  tasks,
}) => {
  if (!isOpen) return null

  console.log('Subtasks:', tasks) // 여기서 subtasks 값이 제대로 출력되는지 확인
  console.log('parentSummary:', parentSummary) // 여기서 subtasks 값이 제대로 출력되는지 확인

  // tasks 데이터가 올바르게 전달되었는지 확인
  console.log('Tasks in Modal:', tasks)
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div className="bg-white w-96 rounded-lg p-6 shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500"
        >
          ✕
        </button>

        <h2 className="text-center text-lg font-semibold text-[#7498E5]">
          에픽 : {parentSummary}
        </h2>
        <h3 className="text-center text-lg font-semibold text-teal-600">이슈 : {title}</h3>

        <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
          {tasks.map((task, index) => (
            <div
              key={index}
              className="flex justify-between items-center p-3 bg-gray-50 rounded-md shadow-sm border border-gray-200"
            >
              <div>
                <h3 className="text-sm font-semibold text-orange-600">
                  {task.title}
                </h3>
                <p className="text-xs text-gray-500">
                  Start: {task.start.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">
                  End: {task.end.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-teal-500 text-white py-2 rounded-md font-semibold hover:bg-teal-600 transition"
        >
          작업 수정 하기
        </button>
      </div>
    </div>
  )
}

export default IssueModal
