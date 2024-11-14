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
import { getMonthlyEpics, updateIssue } from '@/api/project';

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
  const calendarRef = useRef<FullCalendar | null>(null);
  // 현재 활성화된 뷰 상태 추가
  const [activeView, setActiveView] = useState('dayGridMonth');

  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const [tasks, setTasks] = useState<{ id: number; key: string; title: string; color: string; description: string; }[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEventId, setNewEventId] = useState(0);
  const [newEventKey, setNewEventKey] = useState('');
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDescription, setNewEventDescription] = useState('');
  const [newEventColor, setNewEventColor] = useState('#3788d8');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isAllDay, setIsAllDay] = useState(true);
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
        console.log(epics);
        const epicTasks = epics
          .filter((epic) => !epic.startAt)
          .map((epic) => ({
            id: epic.id,
            key: epic.key,
            title: epic.summary,
            color: '#87CEFA',
            description: epic.description,
          }));
  
        setTasks(epicTasks);
  
        const eventsWithDates: CalendarEvent[] = epics
          .filter((epic) => epic.startAt !== null)
          .map((epic) => ({
            title: epic.summary,
            start: epic.startAt ? new Date(epic.startAt) : undefined,
            end: epic.endAt ? new Date(epic.endAt) : undefined,
            allDay: true,
            backgroundColor: '#87CEFA',
            borderColor: '#87CEFA',
            extendedProps: {
              id: epic.id,
              key: epic.key,
              description: epic.description,
            },
          }));
  
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
            backgroundColor: color || '#3788d8',
            borderColor: color || '#3788d8',
            extendedProps: { id, key, description },
          };
        },
      });
    }
  }, []);

  const handleDateClick = (info: DateClickArg) => {
    setSelectedDate(info.date);
    setIsAllDay(activeView === 'dayGridMonth'); // Set all-day flag based on view
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const eventsRef = useRef(events); // 최신 상태 참조
  eventsRef.current = events; // 항상 최신 상태 유지

  const handleAddEvent = () => {
    if (newEventTitle && selectedDate) {
      const newEvent: CalendarEvent = {
        title: newEventTitle,
        start: selectedDate,
        allDay: isAllDay,
        backgroundColor: newEventColor,
        borderColor: newEventColor,
        extendedProps: {
          id: newEventId,
          key: newEventKey,
          description: newEventDescription
        },
      };

      setEvents((prevEvents) => [...prevEvents, newEvent]);
      setIsModalOpen(false);

      const updatedEvents = [...eventsRef.current, newEvent];
      setEvents(updatedEvents);
      eventsRef.current = updatedEvents; // ref도 최신 상태로 유지
      syncTasksWithEvents(updatedEvents); // 동기화

      setIsModalOpen(false);
      setNewEventId(0);
      setNewEventKey('');
      setNewEventTitle('');
      setNewEventColor('#3788d8');
      setNewEventDescription('');
    }
  };

  const handleEventReceive = (info: any) => {
    // info.event.setAllDay(true);
    console.log("Received Event Extended Props:", info.event.extendedProps);
    const isAllDayEvent = activeView === 'dayGridMonth';
    console.log(isAllDayEvent)
    const newEvent: CalendarEvent = {
      title: info.event.title,
      start: info.event.start,
      // allDay: true,
      allDay: isAllDayEvent,
      backgroundColor: info.event.backgroundColor,
      borderColor: info.event.borderColor,
      extendedProps: {
        id: info.event.extendedProps.id,
        key: info.event.extendedProps.key,
        description: info.event.extendedProps.description
      }

    };

    setEvents((prevEvents) => {
      const updatedEvents = prevEvents.filter(
        (event) => !(event.title === newEvent.title && event.start?.getTime() === newEvent.start?.getTime())
      );
      syncTasksWithEvents([...updatedEvents, newEvent]);
      return [...updatedEvents, newEvent];
    });

    setTasks((prevTasks) => prevTasks.filter((task) => task.title !== newEvent.title));
  };

  const handleEventResize = async (resizeInfo: any) => {
    const updatedEvent: CalendarEvent = {
      title: resizeInfo.event.title,
      start: resizeInfo.event.start,
      end: resizeInfo.event.end, // 이벤트 종료일 업데이트
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
      '에픽',
      updatedEvent.start ? updatedEvent.start.toISOString() : null,
      updatedEvent.end ? updatedEvent.end.toISOString() : null
    );

    setEvents((prevEvents) => {
      const updatedEvents = prevEvents.map((event) =>
        event.title === updatedEvent.title ? updatedEvent : event
      );
      return updatedEvents;
    });
  };

  const handleEventDrop = async (dropInfo: any) => {
    const updatedEvent: CalendarEvent = {
      title: dropInfo.event.title,
      start: dropInfo.event.start,
      end: dropInfo.event.end,
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
      '에픽',
      updatedEvent.start ? updatedEvent.start.toISOString() : null,
      updatedEvent.end ? updatedEvent.end.toISOString() : null
    );

    setEvents((prevEvents) => {
      const updatedEvents = prevEvents.map((event) =>
        event.title === updatedEvent.title ? updatedEvent : event
      );
      return updatedEvents;
    });
  };

  const syncTasksWithEvents = (updatedEvents: CalendarEvent[]) => {
    setTasks((prevTasks) =>
      prevTasks.filter((task) => !updatedEvents.some((event) => event.title === task.title))
    );
  };

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
    const day = document.querySelector('.fc-customDay-button');

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
                if (calendarRef.current) {
                  calendarRef.current.getApi().changeView('dayGridMonth');
                  setActiveView('dayGridMonth');
                }
              },
            },
            customWeek: {
              text: 'Week',
              click: () => {
                if (calendarRef.current) {
                  calendarRef.current.getApi().changeView('timeGridWeek');
                  setActiveView('timeGridWeek');
                }
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
      <div id="external-events" className="w-1/4 bg-white rounded-lg shadow p-4 h-full flex flex-col">
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
            <>
              <h2 className="text-xl font-bold mb-4">새 이벤트 추가</h2>
              <div className="mb-4">
                <label className="block mb-1">이벤트 제목:</label>
                <input
                  type="text"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1">이벤트 색상:</label>
                <input
                  type="color"
                  value={newEventColor}
                  onChange={(e) => setNewEventColor(e.target.value)}
                  className="w-full p-2"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button onClick={handleAddEvent} className="px-4 py-2 bg-blue-500 text-white rounded">
                  추가
                </button>
                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-300 rounded">
                  취소
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default CalendarComponent;
