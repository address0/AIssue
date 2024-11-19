/* eslint-disable @typescript-eslint/no-explicit-any */


"use client";

import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
// import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { EventClickArg } from '@fullcalendar/core';
import { Draggable } from '@fullcalendar/interaction';
import Modal from 'react-modal';
import { useRouter } from "next/navigation";
import { createIssue } from '@/api/project';
import { privateAPI } from '@/api/axios';
import { IssueData } from '@/api/project';

interface Subtask {
  id: number;
  key: string;
  summary: string;
  priority: string;
  status: string;
  issuetype: string;
  start_at: string | null;
  end_at: string | null;
}

interface Story {
  id: number;
  key: string;
  summary: string;
  subtasks: Subtask[];
}

interface CalendarEvent {
  title: string;
  start?: Date;
  end?: Date;
  allDay?: boolean;
  backgroundColor?: string;
  borderColor?: string;
  extendedProps: {
    id: number;
    key: string;
    parentSummary: string;
    status: string;
    parentKey: string;
  };
}


const getWeeklyStories = async (projectKey: string): Promise<Story[]> => {
  try {
    const res = await privateAPI.get(`/issues/weekly?project=${projectKey}`);
    return res.data.result as Story[];
  } catch (error) {
    console.error("Error fetching weekly stories:", error);
    throw error;
  }
};

const updateSubtaskAPI = async (
  subtaskId: number,
  start_at: string | null,
  end_at: string | null
): Promise<void> => {
  try {
    const adjustedStartAt = start_at
      ? new Date(new Date(start_at).getTime() + 9 * 60 * 60 * 1000).toISOString()
      : null;
    const adjustedEndAt = end_at
      ? new Date(new Date(end_at).getTime() + 9 * 60 * 60 * 1000).toISOString()
      : null;

    const requestData = {
      issue_id: subtaskId,
      issuetype: "Sub-task",
      start_at: adjustedStartAt,
      end_at: adjustedEndAt,
    };

    const res = await privateAPI.put(`/issues/update/schedule`, requestData);
    console.log("Sub-task updated successfully:", res.data);
  } catch (error) {
    console.error("Sub-task update failed:", error);
    throw error;
  }
};


const CalendarComponent = () => {
  const router = useRouter();
  const calendarRef = useRef<FullCalendar | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // const [tasks, setTasks] = useState<{ id: number; key: string; title: string; color: string; description: string; }[]>([]);
  // const [newEventTitle, setNewEventTitle] = useState('');
  // const [newEventColor, setNewEventColor] = useState('#87CEFA');
  // const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  // const [newEventId, setNewEventId] = useState(0);
  // const [newEventKey, setNewEventKey] = useState('');
  // const [newEventParentSummary, setNewEventParentSummary] = useState('');
  // const [newEventStatus, setNewEventStatus] = useState('');
  // const [newEventParentKey, setNewEventParentKey] = useState('');

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [newTaskSummary, setNewTaskSummary] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('Medium');
  const [newTaskStoryPoints, setNewTaskStoryPoints] = useState(4);

  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [newStoryTitle, setNewStoryTitle] = useState('');
  const [newStoryDescription, setNewStoryDescription] = useState('');
  const [newStoryPriority, setNewStoryPriority] = useState('Medium');
  const [newStoryPoints, setNewStoryPoints] = useState(4);

  const fetchStories = async () => {
    const projectKey = sessionStorage.getItem("projectId");
    if (!projectKey) {
      console.warn("프로젝트 키가 없습니다.");
      return;
    }
    try {
      const stories = await getWeeklyStories(projectKey);
      const updatedStories = stories.map((story) => ({
        ...story,
        subtasks: story.subtasks.filter((task) => task.start_at === null),
      }));

      setStories(updatedStories);

      const subtaskEvents = stories.flatMap((story) =>
        story.subtasks
          .filter((task) => task.start_at !== null)
          .map((task) => ({
            title: task.summary,
            start: task.start_at ? new Date(task.start_at) : undefined,
            end: task.end_at ? new Date(task.end_at) : undefined,
            backgroundColor: "#87CEFA",
            borderColor: "#87CEFA",
            extendedProps: {
              id: task.id,
              key: task.key,
              parentSummary: story.summary,
              status: task.status,
              parentKey: story.key
            },
          }))
      );
      console.log(subtaskEvents);
      setEvents(subtaskEvents);

    } catch (error) {
      console.error("Error fetching weekly stories:", error);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  useEffect(() => {
    const containerEl = document.getElementById('external-events');
    if (containerEl) {
      new Draggable(containerEl, {
        itemSelector: '.fc-event',
        eventData: (eventEl) => {
          const id = eventEl.getAttribute("data-id");
          const title = eventEl.getAttribute("data-title");
          const parentSummary = eventEl.getAttribute("data-parent");
          const key = eventEl.getAttribute("data-key");
          const parentKey = eventEl.getAttribute("data-parentKey");
          const status = eventEl.getAttribute("data-status");
          return {
            title,
            extendedProps: {
              id,
              key,
              parentSummary,
              parentKey,
              status
            },
          };
        },
      });
    }
  }, []);

  const handleStoryClick = (story: Story) => {
    setSelectedStory(story);
    setIsTaskModalOpen(true);
  };

  const handleCreateTask = async () => {
    if (!selectedStory) return;

    const projectKey = sessionStorage.getItem("projectId");
    if (!projectKey) {
      console.error("프로젝트 키가 없습니다.");
      return;
    }

    const issueData: IssueData = {
      summary: newTaskSummary,
      description: newTaskDescription,
      issuetype: "Sub-task",
      priority: newTaskPriority as 'Highest' | 'High' | 'Medium' | 'Low' | 'Lowest', // 명시적으로 타입 지정
      story_points: newTaskStoryPoints,
      parent: selectedStory.key,
      start_at: new Date().toISOString(),
      end_at: new Date(new Date().getTime() + 15 * 60 * 1000).toISOString(),
    };

    try {
      await createIssue(projectKey, issueData);
      console.log("Task created successfully:", issueData);
      setIsTaskModalOpen(false);
      setNewTaskSummary('');
      setNewTaskDescription('');
      fetchStories();
    } catch (error) {
      console.error("Task creation failed:", error);
    }
  };

  const handleCreateStory = async () => {
    const projectKey = sessionStorage.getItem("projectId");
    if (!projectKey) {
      console.error("프로젝트 키가 없습니다.");
      return;
    }

    const issueData: IssueData = {
      summary: newStoryTitle,
      description: newStoryDescription,
      issuetype: "Story",
      priority: newStoryPriority as 'Highest' | 'High' | 'Medium' | 'Low' | 'Lowest',
      story_points: newStoryPoints,
    };

    try {
      await createIssue(projectKey, issueData);
      console.log("Story created successfully:", issueData);
      setIsStoryModalOpen(false);
      setNewStoryTitle('');
      setNewStoryDescription('');
      setNewStoryPriority('Medium');
      setNewStoryPoints(4);
      fetchStories();
    } catch (error) {
      console.error("Story creation failed:", error);
    }
  };

  const eventsRef = useRef(events); // 최신 상태 참조
  eventsRef.current = events; // 항상 최신 상태 유지

  // const handleAddEvent = () => {
  //   if (newEventTitle && selectedDate) {
  //     const newEvent: CalendarEvent = {
  //       title: newEventTitle,
  //       start: selectedDate,
  //       backgroundColor: newEventColor,
  //       borderColor: newEventColor,
  //       extendedProps: {
  //         id: newEventId,
  //         key: newEventKey,
  //         parentSummary: newEventParentSummary,
  //         status: newEventStatus,
  //         parentKey: newEventParentKey
  //       },
  //     };

  //     setEvents((prevEvents) => [...prevEvents, newEvent]);
  //     setIsModalOpen(false);

  //     const updatedEvents = [...eventsRef.current, newEvent];
  //     setEvents(updatedEvents);
  //     eventsRef.current = updatedEvents; // ref도 최신 상태로 유지
  //     // syncTasksWithEvents(updatedEvents); // 동기화

  //     setIsModalOpen(false);
  //     setNewEventId(0);
  //     setNewEventKey('');
  //     setNewEventParentSummary('');
  //     setNewEventStatus('');
  //     setNewEventTitle('');
  //     setNewEventColor('#3788d8');
  //   }
  // };

  const handleEventReceive = async (info: any) => {
    try {
      const event = info.event;

      const startDate = event.start ? new Date(event.start).toISOString() : null;
      const endDate = event.end
        ? new Date(event.end).toISOString()
        : startDate
          ? new Date(new Date(event.start!).getTime() + 60 * 60 * 1000).toISOString() // 1시간 추가
          : null;

      const newEvent: CalendarEvent = {
        title: event.title,
        start: event.start ? new Date(event.start) : undefined,
        end: event.end ? new Date(event.end) : undefined,
        backgroundColor: event.backgroundColor,
        borderColor: event.borderColor,
        extendedProps: event.extendedProps as {
          id: number;
          key: string;
          parentSummary: string;
          status: string;
          parentKey: string;
        },
      };

      const { id, key } = newEvent.extendedProps;
      if (!id || !key) {
        throw new Error("Event ID or key is missing");
      }

      await updateSubtaskAPI(id, startDate, endDate);

      setEvents((prevEvents) =>
        prevEvents.filter((event) => event.extendedProps.id !== id).concat(newEvent)
      );

      setStories((prevStories) =>
        prevStories.map((story) => ({
          ...story,
          subtasks: story.subtasks.filter((task) => task.key !== key),
        }))
      );

      console.log("Event successfully updated:", newEvent);
    } catch (error) {
      console.error("Error in handleEventReceive:", error);
    }
  };

  const handleEventResize = async (info: any) => {
    const updatedEvent = info.event;
    try {
      await updateSubtaskAPI(
        updatedEvent.extendedProps.id,
        updatedEvent.start?.toISOString() || null,
        updatedEvent.end?.toISOString() || null
      );

      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.extendedProps.id === updatedEvent.extendedProps.id
            ? {
              ...event,
              start: updatedEvent.start,
              end: updatedEvent.end,
            }
            : event
        )
      );
    } catch (error) {
      console.error("Event resize failed:", error);
    }
  };

  const handleEventDrop = async (info: any) => {
    const updatedEvent: CalendarEvent = {
      title: info.event.title,
      start: info.event.start,
      end: info.event.end,
      allDay: info.event.allDay,
      extendedProps: info.event.extendedProps,
    };

    try {
      await updateSubtaskAPI(
        updatedEvent.extendedProps.id,
        updatedEvent.start?.toISOString() || null,
        updatedEvent.end?.toISOString() || null
      );

      setEvents((prevEvents) => {
        const updatedEvents = prevEvents.map((event) =>
          event.extendedProps.id === updatedEvent.extendedProps.id ? updatedEvent : event
        );
        return updatedEvents;
      });
    } catch (error) {
      console.error("이벤트 업데이트 실패:", error);
    }
  };

  // const syncTasksWithEvents = (updatedEvents: CalendarEvent[]) => {
  //   setTasks((prevTasks) =>
  //     prevTasks.filter((task) => !updatedEvents.some((event) => event.title === task.title))
  //   );
  // };

  const handleEventClick = (info: EventClickArg) => {
    const event = info.event;

    if (
      !event.extendedProps ||
      typeof event.extendedProps.id !== "number" ||
      typeof event.extendedProps.key !== "string"
    ) {
      console.error("Invalid event extendedProps", event.extendedProps);
      return;
    }

    setSelectedEvent({
      title: event.title,
      start: event.start ? new Date(event.start) : undefined,
      end: event.end ? new Date(event.end) : undefined,
      extendedProps: {
        id: event.extendedProps.id,
        key: event.extendedProps.key,
        parentSummary: event.extendedProps.parentSummary || "",
        parentKey: event.extendedProps.parentKey || "",
        status: event.extendedProps.status || "",
      },
    });
    setIsModalOpen(true);
  };

  useEffect(() => {
    const toolbarChunks = document.querySelectorAll('.fc-toolbar-chunk');
    const title = document.querySelector('.fc-toolbar-title');
    const month = document.querySelector('.fc-customMonth-button');
    const week = document.querySelector('.fc-customWeek-button');

    if (title) {
      const titleElement = title as HTMLElement;
      titleElement.style.margin = '2px 5px';
      titleElement.style.color = '#4D86FF';
      titleElement.style.fontWeight = 'bold';
    }
    if (month) {
      const monthElement = month as HTMLElement;
      monthElement.style.background = 'transparent';
      monthElement.style.border = '2px solid';
      monthElement.style.color = '#7498E5';
      monthElement.style.fontWeight = 'bold';
      monthElement.style.fontSize = '1rem'; // Increase font size
      monthElement.style.padding = '5px'; // Remove padding
      monthElement.style.margin = '0 5px'; // Add spacing
      monthElement.style.cursor = 'pointer'; // Change cursor to pointer
    }
    if (week) {
      const weekElement = week as HTMLElement;
      weekElement.style.background = 'transparent';
      weekElement.style.border = '2px solid';
      weekElement.style.color = '#7498E5';
      weekElement.style.fontWeight = 'bold';
      weekElement.style.fontSize = '1rem'; // Increase font size
      weekElement.style.padding = '5px'; // Remove padding
      weekElement.style.margin = '0 5px'; // Add spacing
      weekElement.style.cursor = 'pointer'; // Change cursor to pointer
    }

    if (toolbarChunks[1]) {  // Ensure the second toolbar chunk exists
      const toolbarElement = toolbarChunks[1] as HTMLElement;

      // Center align toolbar elements
      toolbarElement.style.display = 'flex';
      toolbarElement.style.alignItems = 'center';
      toolbarElement.style.gap = '10px';
      toolbarElement.style.justifyContent = 'center';
    }

    // Apply custom styling to 'prev', 'next', and 'today' buttons
    const customButtons = ['.fc-prevButton-button', '.fc-nextButton-button', '.fc-todayButton-button'];
    customButtons.forEach(selector => {
      const button = document.querySelector(selector) as HTMLElement;
      if (button) {
        button.style.background = 'transparent'; // Remove background color
        button.style.border = 'none'; // Remove border
        button.style.color = '#7498E5'; // Set custom color
        button.style.fontWeight = 'bold'; // Set font weight to bold
        button.style.fontSize = '1.2rem'; // Increase font size
        button.style.padding = '0'; // Remove padding
        button.style.margin = '0 5px'; // Add spacing
        button.style.cursor = 'pointer'; // Change cursor to pointer
      }
    });

  }, [events]);

  return (
    <div className="flex min-h-screen overflow-auto bg-gray-100 p-6 space-x-4">
      <div className="flex-1 bg-white rounded-lg shadow p-6">
        <FullCalendar
          ref={calendarRef}
          locale="ko"
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView="timeGridWeek"
          height="auto"
          allDaySlot={false}
          timeZone="local"
          headerToolbar={{
            left: 'todayButton',
            center: 'prevButton title nextButton',
            right: 'customMonth customWeek',
          }}
          customButtons={{
            todayButton: {
              text: 'Today', // Change 'Today' button text to '오늘'
              click: () => {
                if (calendarRef.current) {
                  calendarRef.current.getApi().today(); // Move to today’s date
                }
              },
            },
            prevButton: {
              text: '◀', // Replace with your desired icon or custom HTML
              click: () => {
                if (calendarRef.current) {
                  calendarRef.current.getApi().prev();
                }
              },
            },
            nextButton: {
              text: '▶', // Replace with your desired icon or custom HTML
              click: () => {
                if (calendarRef.current) {
                  calendarRef.current.getApi().next();
                }
              },
            },
            customMonth: {
              text: 'Month',
              click: () => {
                const currentPath = window.location.pathname.replace(/\/(month|week)$/, "");
                router.push(`${currentPath}/month`);
              },
            },
            customWeek: {
              text: 'Week',
              click: () => {
                const currentPath = window.location.pathname.replace(/\/(month|week)$/, "");
                router.push(`${currentPath}/week`);
              },
            },

          }}
          views={{
            timeGridWeek: {
              slotLabelFormat: { hour: "2-digit", minute: "2-digit", hour12: false },
              slotMinTime: "00:00:00", // 오전 9시부터 시작
              slotMaxTime: "24:00:00", // 오후 6시까지만 표시
            },
            timeGridDay: {
              slotMinTime: "09:00:00", // 오전 9시부터 시작
              slotMaxTime: "18:00:00", // 오후 6시까지만 표시
            },
          }}
          selectable={true}
          editable={true}
          droppable={true}
          eventResizableFromStart={true} // 이벤트 시작 시간에서 조정 가능
          events={events}
          eventReceive={handleEventReceive}
          eventResize={handleEventResize} // 추가: 이벤트 길이 조정 핸들러
          eventDrop={handleEventDrop} // 추가: 이벤트 이동 핸들러
          eventClick={handleEventClick}
        />
      </div>
      <div
        id="external-events"
        className="w-1/4 bg-white rounded-lg shadow p-4 h-full flex flex-col hidden md:flex"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-blue-600">Story List</h3>
          <button
            className="text-lg font-bold text-blue-600 cursor-pointer"
            onClick={() => setIsStoryModalOpen(true)}
          >
            +
          </button>
        </div>
        {stories.map((story) => (
          <div key={story.id} className="mb-4">
            <h4
              className="font-bold text-blue-800 mb-2 cursor-pointer"
              onClick={() => handleStoryClick(story)}
            >
              {story.summary}
            </h4>
            {story.subtasks.map((task) => (
              <div
                key={task.id}
                className="fc-event mb-2 p-2 text-white rounded cursor-grab"
                data-id={task.id}
                data-title={task.summary}
                data-parent={story.summary}
                data-key={task.key}
                data-status={task.status}
                data-parentKey={story.key}
                style={{ backgroundColor: '#87CEFA' }}
              >
                {task.summary}
              </div>
            ))}
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        ariaHideApp={false}
        shouldCloseOnOverlayClick={true}
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-[1000] pointer-events-auto"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-[999] pointer-events-auto"
      >
        <div className="bg-white p-6 rounded-lg shadow-lg w-96 pointer-events-auto">
          {selectedEvent && (
            <div>
              <p className="font-bold mb-4">{selectedEvent.extendedProps.key}</p>
              <h2 className="text-xl font-bold mb-4">{selectedEvent.title}</h2>
              <hr className="mb-4"></hr>
              <p className="mb-4">상위 스토리</p>
              <p>{selectedEvent.extendedProps.parentKey}</p>
              <p>{selectedEvent.extendedProps.parentSummary}</p>
            </div>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={isTaskModalOpen}
        onRequestClose={() => setIsTaskModalOpen(false)}
        ariaHideApp={false}
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-[1000] pointer-events-auto"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-[999] pointer-events-auto"
      >
        <div className="bg-white p-6 rounded-lg shadow-lg w-96 pointer-events-auto">
          <h3 className="text-xl font-bold mb-4">{selectedStory?.summary}의 이슈 생성</h3>
          <div className="mb-4">
            <label className="block mb-1">이슈 제목:</label>
            <input
              type="text"
              value={newTaskSummary}
              onChange={(e) => setNewTaskSummary(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">이슈 설명:</label>
            <textarea
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">우선 순위:</label>
            <select
              value={newTaskPriority}
              onChange={(e) => setNewTaskPriority(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="Highest">Highest</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
              <option value="Lowest">Lowest</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-1">Story Points:</label>
            <input
              type="number"
              value={newTaskStoryPoints}
              onChange={(e) => setNewTaskStoryPoints(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleCreateTask}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              생성
            </button>
            <button
              onClick={() => setIsTaskModalOpen(false)}
              className="px-4 py-2 bg-gray-300 rounded"
            >
              취소
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isStoryModalOpen}
        onRequestClose={() => setIsStoryModalOpen(false)}
        ariaHideApp={false}
        shouldCloseOnOverlayClick={true}
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-[1000]"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-[999]"
      >
        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
          <h3 className="text-xl font-bold mb-4">새 Story 생성</h3>
          <div className="mb-4">
            <label className="block mb-1">Story 제목:</label>
            <input
              type="text"
              value={newStoryTitle}
              onChange={(e) => setNewStoryTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Story 설명:</label>
            <textarea
              value={newStoryDescription}
              onChange={(e) => setNewStoryDescription(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">우선 순위:</label>
            <select
              value={newStoryPriority}
              onChange={(e) => setNewStoryPriority(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="Highest">Highest</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
              <option value="Lowest">Lowest</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-1">Story Points:</label>
            <input
              type="number"
              value={newStoryPoints}
              onChange={(e) => setNewStoryPoints(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleCreateStory}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              생성
            </button>
            <button
              onClick={() => setIsStoryModalOpen(false)}
              className="px-4 py-2 bg-gray-300 rounded"
            >
              취소
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default CalendarComponent;
