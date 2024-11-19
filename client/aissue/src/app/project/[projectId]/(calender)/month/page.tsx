/* eslint-disable @typescript-eslint/no-explicit-any */


"use client";

import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { EventClickArg } from '@fullcalendar/core';
import { Draggable } from '@fullcalendar/interaction';
import Modal from 'react-modal';
import { getMonthlyEpics, updateIssue, createIssue } from '@/api/project';
import { useRouter } from "next/navigation";
import { IssueData } from '@/api/project';

interface CalendarEvent {
  title: string;
  date?: string;
  start?: Date;
  end?: Date;
  allDay?: boolean;
  backgroundColor?: string;
  borderColor?: string;
  extendedProps: {
    id: number;
    key: string;
    description: string;
  };
}

const CalendarComponent = () => {
  const router = useRouter();
  const calendarRef = useRef<FullCalendar | null>(null);
  // 현재 활성화된 뷰 상태 추가
  // const [activeView, setActiveView] = useState('dayGridMonth');

  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const [tasks, setTasks] = useState<{ id: number; key: string; title: string; color: string; description: string; }[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  // const [newEventId, setNewEventId] = useState(0);
  // const [newEventKey, setNewEventKey] = useState('');
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDescription, setNewEventDescription] = useState('');
  // const [newEventColor, setNewEventColor] = useState('#3788d8');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  // const [isAllDay, setIsAllDay] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  useEffect(() => {
    const fetchEpics = async () => {
      const projectKey = sessionStorage.getItem('projectId');

      if (!projectKey) {
        console.warn('project id가 없습니다.');
        return;
      }

      try {
        const epics = await getMonthlyEpics(projectKey);
        const epicTasks = epics
          .filter((epic) => !epic.start_at)
          .map((epic) => ({
            id: epic.id,
            key: epic.key,
            title: epic.summary,
            color: '#87CEFA',
            description: epic.description,
          }));

        setTasks(epicTasks);

        const eventsWithDates: CalendarEvent[] = epics
          .filter((epic) => epic.start_at !== null)
          .map((epic) => {
            const start = epic.start_at ? new Date(new Date(epic.start_at).setHours(0, 0, 0, 0)) : undefined;
            const end = epic.end_at ? new Date(new Date(epic.end_at).setHours(0, 0, 0, 0)) : undefined;
            return {
              title: epic.summary,
              start,
              end,
              allDay: true,
              backgroundColor: '#87CEFA',
              borderColor: '#87CEFA',
              extendedProps: {
                id: epic.id,
                key: epic.key,
                description: epic.description,
              },
            };
          });
        console.log("생성된 이벤트:", eventsWithDates);
        setEvents(eventsWithDates);

      } catch (error) {
        console.error('Error fetching epics:', error);
      }
    };

    fetchEpics();
  }, []);

  useEffect(() => {
    const containerEl = document.getElementById('external-events');
    if (containerEl) {
      new Draggable(containerEl, {
        itemSelector: '.fc-event',
        eventData: (eventEl) => {
          const id = eventEl.getAttribute('data-id');
          const key = eventEl.getAttribute('data-key');
          const title = eventEl.getAttribute('data-title');
          const color = eventEl.getAttribute('data-color');
          const description = eventEl.getAttribute('data-description');
          return {
            title: title || '새 이벤트',
            backgroundColor: color || '#87CEFA',
            borderColor: color || '#87CEFA',
            extendedProps: { id, key, description },
          };
        },
      });
    }
  }, []);

  const handleDateClick = (info: DateClickArg) => {
    setSelectedDate(info.date);
    // setIsAllDay(activeView === 'dayGridMonth'); // Set all-day flag based on view
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const eventsRef = useRef(events);
  eventsRef.current = events;

  const handleAddEvent = async () => {
    if (!newEventTitle || !selectedDate) {
      alert("제목과 날짜를 입력해주세요.");
      return;
    }

    const projectKey = sessionStorage.getItem('projectId');
    if (!projectKey) {
      console.warn('프로젝트 ID가 없습니다.');
      return;
    }

    const startDate = new Date(selectedDate).toISOString();
    const endDate = new Date(selectedDate);
    endDate.setDate(endDate.getDate() + 1);
    const endAt = endDate.toISOString();

    const issueData: IssueData = {
      summary: newEventTitle,
      description: newEventDescription || "",
      issuetype: "Epic",
      priority: "Medium",
      story_points: 0,
      start_at: startDate,
      end_at: endAt,
    };

    try {
      await createIssue(projectKey, issueData);
      console.log("이슈 생성 성공:", issueData);

      const newEvent: CalendarEvent = {
        title: newEventTitle,
        start: new Date(startDate),
        end: new Date(endAt),
        allDay: true,
        backgroundColor: '#3788d8',
        borderColor: '#3788d8',
        extendedProps: {
          id: 0,
          key: '',
          description: newEventDescription,
        },
      };

      setEvents((prevEvents) => [...prevEvents, newEvent]);
      setIsModalOpen(false);
      resetNewEventFields();
    } catch (error) {
      console.error("이슈 생성 실패:", error);
    }
  };

  const resetNewEventFields = () => {
    setNewEventTitle('');
    setNewEventDescription('');
  };

  const handleEventReceive = async (info: any) => {
    // console.log("Received Event Extended Props:", info.event.extendedProps);
    // const isAllDayEvent = 'dayGridMonth';
    // console.log(isAllDayEvent)
    const newEvent: CalendarEvent = {
      title: info.event.title,
      start: info.event.start
        ? new Date(new Date(info.event.start).setHours(0, 0, 0, 0))
        : undefined,
      end: info.event.end
        ? new Date(new Date(info.event.end).setHours(0, 0, 0, 0))
        : undefined,
      allDay: true,
      backgroundColor: info.event.backgroundColor,
      borderColor: info.event.borderColor,
      extendedProps: {
        id: info.event.extendedProps.id,
        key: info.event.extendedProps.key,
        description: info.event.extendedProps.description
      }
    };

    await updateIssue(
      newEvent.extendedProps.id,
      newEvent.extendedProps.key,
      'Epic',
      newEvent.start ? newEvent.start.toISOString() : null,
      newEvent.end ? newEvent.end.toISOString() : null
    );

    setEvents((prevEvents) =>
      prevEvents.filter((event) => event.extendedProps.id !== newEvent.extendedProps.id).concat(newEvent)
    );

    setTasks((prevTasks) => {
      const updatedTasks = prevTasks.filter(
        (task) => task.key !== newEvent.extendedProps.key
      );
      return updatedTasks;
    });
  };

  const handleEventResize = async (resizeInfo: any) => {
    const updatedEvent: CalendarEvent = {
      title: resizeInfo.event.title,
      start: resizeInfo.event.start
        ? new Date(new Date(resizeInfo.event.start).setHours(0, 0, 0, 0))
        : undefined,
      end: resizeInfo.event.end
        ? new Date(new Date(resizeInfo.event.end).setHours(0, 0, 0, 0))
        : undefined,
      allDay: resizeInfo.event.allDay,
      backgroundColor: resizeInfo.event.backgroundColor,
      borderColor: resizeInfo.event.borderColor,
      extendedProps: {
        id: resizeInfo.event.extendedProps.id,
        key: resizeInfo.event.extendedProps.key,
        description: resizeInfo.event.extendedProps.description
      }
    };

    await updateIssue(
      resizeInfo.event.extendedProps.id,
      resizeInfo.event.extendedProps.key,
      'Epic',
      updatedEvent.start ? updatedEvent.start.toISOString() : null,
      updatedEvent.end ? updatedEvent.end.toISOString() : null
    );

    setEvents((prevEvents) => {
      const updatedEvents = prevEvents.map((event) =>
        event.extendedProps.key === updatedEvent.extendedProps.key ? updatedEvent : event
      );
      return updatedEvents;
    });
  };

  const handleEventDrop = async (dropInfo: any) => {
    const updatedEvent: CalendarEvent = {
      title: dropInfo.event.title,
      start: dropInfo.event.start
        ? new Date(new Date(dropInfo.event.start).setHours(0, 0, 0, 0))
        : undefined,
      end: dropInfo.event.end
        ? new Date(new Date(dropInfo.event.end).setHours(0, 0, 0, 0))
        : undefined,
      allDay: dropInfo.event.allDay,
      backgroundColor: dropInfo.event.backgroundColor,
      borderColor: dropInfo.event.borderColor,
      extendedProps: {
        id: dropInfo.event.extendedProps.id,
        key: dropInfo.event.extendedProps.key,
        description: dropInfo.event.extendedProps.description
      }
    };

    await updateIssue(
      dropInfo.event.extendedProps.id,
      dropInfo.event.extendedProps.key,
      'Epic',
      updatedEvent.start ? updatedEvent.start.toISOString() : null,
      updatedEvent.end ? updatedEvent.end.toISOString() : null
    );

    setEvents((prevEvents) => {
      const updatedEvents = prevEvents.map((event) =>
        event.extendedProps.key === updatedEvent.extendedProps.key ? updatedEvent : event
      );
      return updatedEvents;
    });
  };

  // const syncTasksWithEvents = (updatedEvents: CalendarEvent[]) => {
  //   setTasks((prevTasks) =>
  //     prevTasks.filter((task) => !updatedEvents.some((event) => event.title === task.title))
  //   );
  // };

  const handleEventClick = (info: EventClickArg) => {
    console.log(info.event.extendedProps);
    setSelectedEvent({
      title: info.event.title,
      start: info.event.start ? new Date(info.event.start) : undefined,
      end: info.event.end ? new Date(info.event.end) : undefined,
      backgroundColor: info.event.backgroundColor || '',
      borderColor: info.event.borderColor || '',
      extendedProps: {
        id: info.event.extendedProps.id,
        key: info.event.extendedProps.key,
        description: info.event.extendedProps.description
      }
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
          initialView="dayGridMonth"
          height="auto"
          allDaySlot={false}
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
              slotMinTime: "09:00:00", // 오전 9시부터 시작
              slotMaxTime: "18:00:00", // 오후 6시까지만 표시
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
          dateClick={handleDateClick}
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
        <h3 className="text-lg font-bold text-blue-600 mb-4 text-center">Epic List</h3>
        {tasks.map((task, index) => (
          <div
            key={index}
            className="fc-event mb-2 p-2 text-white rounded cursor-grab"
            data-id={task.id}
            data-key={task.key}
            data-title={task.title}
            data-color={task.color}
            data-description={task.description}
            style={{
              backgroundColor: task.color,
            }}
          >
            {task.title}
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
          {selectedEvent ? (
            <div>
              <p className='font-bold mb-4'>{selectedEvent.extendedProps.key}</p>
              <h2 className="text-xl font-bold mb-4">{selectedEvent.title}</h2>
              <p>{selectedEvent.extendedProps.description}</p>
              <h3 className="text-lg font-bold mt-4">기간</h3>
              <p>
                {selectedEvent.start ? selectedEvent.start.toLocaleDateString() : ''} -{' '}
                {selectedEvent.end ? new Date(new Date(selectedEvent.end).setDate(selectedEvent.end.getDate() - 1)).toLocaleDateString() : ''}
              </p>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-bold mb-4">에픽 생성</h2>
              <div className="mb-4">
                <label className="block mb-1">에픽 제목:</label>
                <input
                  type="text"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="에픽 제목을 입력하세요"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1">에픽 설명:</label>
                <textarea
                  value={newEventDescription}
                  onChange={(e) => setNewEventDescription(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="에픽 설명을 입력하세요"
                ></textarea>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={handleAddEvent}
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  생성
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 rounded"
                >
                  취소
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default CalendarComponent;
