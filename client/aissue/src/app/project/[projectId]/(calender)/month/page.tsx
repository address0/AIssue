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

interface CalendarEvent {
  title: string;
  date?: string;
  start?: Date;
  end?: Date; // 추가: 이벤트 종료일
  allDay?: boolean;
  backgroundColor?: string;
  borderColor?: string;
}

const CalendarComponent = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([
    { title: '예시 이벤트', date: '2024-11-15' },
  ]);

  const [tasks, setTasks] = useState([
    { title: '작업 1', color: '#FFB6C1' },
    { title: '작업 2', color: '#FF7F50' },
    { title: '작업 3', color: '#87CEFA' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventColor, setNewEventColor] = useState('#3788d8');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    const containerEl = document.getElementById('external-events');
    if (containerEl) {
      new Draggable(containerEl, {
        itemSelector: '.fc-event',
        eventData: (eventEl) => {
          const title = eventEl.getAttribute('data-title');
          const color = eventEl.getAttribute('data-color');
          return {
            title: title || '새 이벤트',
            backgroundColor: color || '#3788d8',
            borderColor: color || '#3788d8',
          };
        },
      });
    }
  }, []);

  const handleDateClick = (info: DateClickArg) => {
    setSelectedDate(info.date);
    setIsModalOpen(true);
  };

  const eventsRef = useRef(events); // 최신 상태 참조
  eventsRef.current = events; // 항상 최신 상태 유지

  const handleAddEvent = () => {
    if (newEventTitle && selectedDate) {
      const newEvent: CalendarEvent = {
        title: newEventTitle,
        start: selectedDate,
        allDay: true,
        backgroundColor: newEventColor,
        borderColor: newEventColor,
      };

      const updatedEvents = [...eventsRef.current, newEvent];
      setEvents(updatedEvents);
      eventsRef.current = updatedEvents; // ref도 최신 상태로 유지
      syncTasksWithEvents(updatedEvents); // 동기화

      setIsModalOpen(false);
      setNewEventTitle('');
      setNewEventColor('#3788d8');
    }
  };

  const handleEventReceive = (info: any) => {
    info.event.setAllDay(true);

    const newEvent: CalendarEvent = {
      title: info.event.title,
      start: info.event.start,
      allDay: true,
      backgroundColor: info.event.backgroundColor,
      borderColor: info.event.borderColor,
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

  const handleEventResize = (resizeInfo: any) => {
    const updatedEvent: CalendarEvent = {
      title: resizeInfo.event.title,
      start: resizeInfo.event.start,
      end: resizeInfo.event.end, // 이벤트 종료일 업데이트
      allDay: resizeInfo.event.allDay,
      backgroundColor: resizeInfo.event.backgroundColor,
      borderColor: resizeInfo.event.borderColor,
    };

    setEvents((prevEvents) => {
      const updatedEvents = prevEvents.map((event) =>
        event.title === updatedEvent.title ? updatedEvent : event
      );
      return updatedEvents;
    });
  };

  const handleEventDrop = (dropInfo: any) => {
    const updatedEvent: CalendarEvent = {
      title: dropInfo.event.title,
      start: dropInfo.event.start,
      end: dropInfo.event.end,
      allDay: dropInfo.event.allDay,
      backgroundColor: dropInfo.event.backgroundColor,
      borderColor: dropInfo.event.borderColor,
    };

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

  const handleEventClick = (clickInfo: EventClickArg) => {
    if (confirm(`'${clickInfo.event.title}' 이벤트를 삭제하시겠습니까?`)) {
      clickInfo.event.remove();
      const updatedEvents = events.filter((event) => event.title !== clickInfo.event.title);
      setEvents(updatedEvents);
      syncTasksWithEvents(updatedEvents);
    }
  };

  useEffect(() => {
    const toolbarChunks = document.querySelectorAll('.fc-toolbar-chunk');
    if (toolbarChunks[1]) {  // 두 번째 요소가 있는지 확인
      toolbarChunks[1].style.display = 'flex';
      toolbarChunks[1].style.alignItems = 'center';
      toolbarChunks[1].style.gap = '10px';
      toolbarChunks[1].style.justifyContent = 'center'; // 가운데 정렬
    }
  }, [events]); // `events`가 업데이트될 때마다 실행
  
  return (
    <div className="flex h-screen bg-gray-100 p-6 space-x-4">
      <div className="flex-1 bg-white rounded-lg shadow p-6">
        <FullCalendar
          locale="ko"
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'today',
            center: 'prev title next',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
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
      <div id="external-events" className="w-1/4 bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-bold text-blue-600 mb-4">할 일 목록</h3>
        {tasks.map((task, index) => (
          <div
            key={index}
            className="fc-event mb-2 p-2 text-white rounded cursor-grab"
            data-title={task.title}
            data-color={task.color}
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
        shouldCloseOnOverlayClick={false}
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-[1000] pointer-events-auto"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-[999] pointer-events-auto"
      >
        <div className="bg-white p-6 rounded-lg shadow-lg w-96 pointer-events-auto">
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
        </div>
      </Modal>
    </div>
  );
};

export default CalendarComponent;
