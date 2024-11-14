'use client'

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd'
import { getWeeklyStories } from '@/api/project'
import { useQuery } from '@tanstack/react-query'
import LoadingSpinner from '@/static/svg/blue-spinner.svg'
import IssueModal from '@/components/(Modal)/IssueModal/IssueModal'

interface Task {
  title: string;
  start: Date;
  end: Date;
}

interface Story {
  id: string
  title: string
  status: 'To Do' | 'In Progress' | 'Done'
  parent?: { summary: string };
  tasks: Task[];
}

interface Issue {
  id: string
  title: string
  status: 'ToDo' | 'InProgress' | 'Done'
}

const WorkLogPage = () => {
  const pathname = usePathname()
  const projectId = pathname.split('/')[2]
  const [userName, setUserName] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Story | null>(null);
  const [categorizedIssues, setCategorizedIssues] = useState<{
    ToDo: Issue[]
    InProgress: Issue[]
    Done: Issue[]
  }>({
    ToDo: [],
    InProgress: [],
    Done: [],
  })

  const { isLoading, data } = useQuery({
    queryKey: ['weeklyStories', projectId],
    queryFn: () => getWeeklyStories(projectId),
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUserName(sessionStorage.getItem('memberName'))
    }
  }, [])

  useEffect(() => {
    if (data) {
      const stories: Story[] = data
      const issues: Issue[] = stories.map((story) => ({
        id: story.id,
        title: story.title,
        status: mapStatus(story.status),
      }))

      const categorized = {
        ToDo: issues.filter((issue) => issue.status === 'ToDo'),
        InProgress: issues.filter((issue) => issue.status === 'InProgress'),
        Done: issues.filter((issue) => issue.status === 'Done'),
      }

      setCategorizedIssues(categorized)
    }
  }, [data])

  function mapStatus(
    status: 'To Do' | 'In Progress' | 'Done',
  ): 'ToDo' | 'InProgress' | 'Done' {
    switch (status) {
      case 'To Do':
        return 'ToDo'
      case 'In Progress':
        return 'InProgress'
      case 'Done':
        return 'Done'
    }
  }
  const openModal = (issueId: string) => {
    if (data) {
      const story = data.find((story: Story) => story.id === issueId);
      if (story) {
        setSelectedIssue(story);
        setIsModalOpen(true);
      }
    }
  };

  const closeModal = () => {
    setSelectedIssue(null);
    setIsModalOpen(false);
  };
  if (isLoading)
    return (
      <div className="flex justify-center items-center h-full w-full">
        <div className="flex flex-col justify-center items-center gap-y-3">
          <LoadingSpinner className="animate-spin" />
          <p className="font-bold">전체 업무 로그를 불러오는 중입니다.</p>
        </div>
      </div>
    )

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result

    if (!destination) {
      // Optionally handle drops outside droppable areas
      return
    }

    const sourceDroppableId = source.droppableId as
      | 'ToDo'
      | 'InProgress'
      | 'Done'
    const destinationDroppableId = destination.droppableId as
      | 'ToDo'
      | 'InProgress'
      | 'Done'

    const updatedIssues = { ...categorizedIssues }
    const sourceItems = Array.from(updatedIssues[sourceDroppableId])
    const [movedItem] = sourceItems.splice(source.index, 1)

    if (sourceDroppableId === destinationDroppableId) {
      sourceItems.splice(destination.index, 0, movedItem)
      updatedIssues[sourceDroppableId] = sourceItems
    } else {
      movedItem.status = destinationDroppableId
      const destinationItems = Array.from(updatedIssues[destinationDroppableId])
      destinationItems.splice(destination.index, 0, movedItem)

      updatedIssues[sourceDroppableId] = sourceItems
      updatedIssues[destinationDroppableId] = destinationItems
    }

    setCategorizedIssues(updatedIssues)
  }
  console.log("이슈목록:", selectedIssue ? selectedIssue : null)
  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="w-4/5 p-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">
            {projectId} 프로젝트 스프린트 일정
          </h1>
          <div className="flex items-center space-x-2">
            <span className="text-gray-700">{userName}님</span>
          </div>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-3 gap-4">
            {(['ToDo', 'InProgress', 'Done'] as const).map((status) => {
              let headerStyle = ''
              let bgStyle = ''
              if (status === 'ToDo') {
                headerStyle = 'text-[#33675F]'
                bgStyle = 'bg-[#B2E0D9]'
              } else if (status === 'InProgress') {
                headerStyle = 'text-[#F60000]'
                bgStyle = 'bg-[#FACACA]'
              } else if (status === 'Done') {
                headerStyle = 'text-[#000000]'
                bgStyle = 'bg-[#C0C0C0]'
              }

              return (
                <Droppable key={status} droppableId={status}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`p-4 rounded-lg shadow-md ${bgStyle} flex flex-col ${
                        snapshot.isDraggingOver
                          ? 'border-2 solid border-blue-400'
                          : ''
                      }`}
                      style={{ minHeight: '200px' }}
                    >
                      <h2
                        className={`text-xl font-semibold mb-4 text-center ${headerStyle}`}
                      >
                        {status}
                      </h2>
                      <div className="space-y-4 flex-1 px-2 pb-2">
                        {categorizedIssues[status].map((issue, index) => (
                          <Draggable
                            key={issue.id}
                            draggableId={issue.id}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between"
                                style={{
                                  ...provided.draggableProps.style,
                                }}
                                onClick={() => openModal(issue.id)}
                              >
                                <div>
                                  <h3 className="font-semibold text-gray-800">
                                    {issue.title}
                                  </h3>
                                  <p className="text-sm text-gray-500">
                                    {issue.id}
                                  </p>
                                </div>
                                <img
                                  src="/img/avatar.png"
                                  alt="Avatar"
                                  className="w-6 h-6"
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              )
            })}
          </div>
        </DragDropContext>

        {/* Issue Details Modal */}
        {selectedIssue && (
          <IssueModal
            isOpen={isModalOpen}
            onClose={closeModal}
            title={selectedIssue.title}
            parentSummary={selectedIssue.parent?.summary || ''}
            tasks={selectedIssue.tasks} // 여기서 tasks 배열을 그대로 전달
          />
        )}
     
      </div>
    </div>
  )
}

export default WorkLogPage
