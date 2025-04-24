"use client";

import React, { useState, useEffect } from 'react';
import Sidebar_dashboard from "@/app/components/sidebar_dashboard";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

interface Event {
  id: string;
  title: string;
  date: Date;
  color: string;
  description?: string;
  start?: string;
  end?: string;
  isAssignment?: boolean;
  courseId?: string;
}

const colorOptions = [
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Green', value: '#10B981' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Yellow', value: '#F59E0B' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Teal', value: '#14B8A6' }
];

const formatTime = (isoString: string) => {
  const date = new Date(isoString);
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12; // Convert 0 to 12 for 12-hour format
  return `${hours}:${minutes} ${ampm}`;
};

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: '',
    description: '',
    start: '09:00',
    end: '10:00',
    color: '#3B82F6'
  });
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const router = useRouter();
  const { user } = useUser();
  const userRole = user?.publicMetadata?.role; // 'member' or 'prof'

  useEffect(() => {
    // Select today's date by default when the component mounts
    setSelectedDate(new Date());
  }, []);

  useEffect(() => {
    const fetchCalendarData = async () => {
      try {
        // Fetch calendar events
        const eventsResponse = await fetch("/api/calendar");
        const eventsData = await eventsResponse.json();

        // Convert event dates to Date objects
        const formattedEvents = eventsData.map((event: any) => ({
          ...event,
          date: new Date(event.date), // Convert date to Date object
        }));

        // Fetch assignments
        const assignmentsResponse = await fetch("/api/calendar/assignments");
        const assignmentsData = await assignmentsResponse.json();
        console.log("Assignments:", assignmentsData);

        // Map assignments to calendar events
        const assignmentEvents = assignmentsData.map((assignment: any) => ({
          id: assignment.id,
          title: `${assignment.title} (Due)`,
          date: new Date(assignment.dueDate), // Convert dueDate to Date object
          color: "#F59E0B", // Assignments have a default yellow color
          isAssignment: true,
          courseId: assignment.courseId,
        }));

        setEvents([...formattedEvents, ...assignmentEvents]);
      } catch (error) {
        console.error("Error fetching calendar data:", error);
      }
    };

    fetchCalendarData();
  }, []);

  const formatTimeForInput = (isoString: string | undefined | null) => {
    if (!isoString) {
      return "";
    }
    try {
      const date = new Date(isoString);
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      return `${hours}:${minutes}`;
    } catch (error) {
      console.error("Error formatting time for input:", error);
      return "";
    }
  }; 

  const handleEventClick = (event: Event) => {
    if (event.isAssignment) {
      if (userRole === "member") {
        router.push(`/pages/student/view_assignment/${event.courseId}/${event.id}`);
      } else if (userRole === "prof") {
        router.push(`/pages/professor/assignments/${event.courseId}/${event.id}`);
      }
    } else {
      setSelectedEvent(event);
      setNewEvent({
        title: event.title,
        date: new Date(event.date),
        start: event.start ? formatTimeForInput(event.start) : '09:00',
        end: event.end ? formatTimeForInput(event.end) : '10:00',
        description: event.description || "",
        color: event.color || "#3B82F6",
      });
      setShowEventModal(true);
    }
  };

  const handleUpdateEvent = async (updatedEvent: Event) => {
    try {
      const response = await fetch("/api/calendar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedEvent),
      });

      const savedEvent = await response.json();

      // Update the event in the local state
      setEvents(events.map(event => (event.id === savedEvent.id ? { ...savedEvent, date: new Date(savedEvent.date) } : event)));
      setShowEventModal(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };

  const handleSaveEvent = () => {
    if (selectedEvent) {
      handleUpdateEvent({
        ...selectedEvent,
        title: newEvent.title!,
        description: newEvent.description,
        date: selectedDate!,
        start: `${formatDateToYYYYMMDD(selectedDate!)}T${newEvent.start}`, // Combine date and start time
        end: `${formatDateToYYYYMMDD(selectedDate!)}T${newEvent.end}`, // Combine date and end time
        color: newEvent.color!,
      });
    } else {
      handleAddEvent();
    }
  };

  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const firstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const formatDateToYYYYMMDD = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const handleAddEvent = async () => {
    if (selectedDate && newEvent.title) {
      // Create Date objects for the new event, combining the selected date and time
      const [startHours, startMinutes] = newEvent.start!.split(':').map(Number);
      const newEventStart = new Date(selectedDate);
      newEventStart.setHours(startHours, startMinutes, 0, 0);
  
      const [endHours, endMinutes] = newEvent.end!.split(':').map(Number);
      const newEventEnd = new Date(selectedDate);
      newEventEnd.setHours(endHours, endMinutes, 0, 0);
  
      // Check for time conflicts with existing events on the same date
      const hasConflict = events.some(event => {
        if (event.date.toDateString() === selectedDate.toDateString() && event.start && event.end) {
          // Assuming your existing event.start and event.end are ISO 8601 strings
          const existingEventStart = new Date(event.start);
          const existingEventEnd = new Date(event.end);
  
          return (
            (newEventStart >= existingEventStart && newEventStart < existingEventEnd) ||
            (newEventEnd > existingEventStart && newEventEnd <= existingEventEnd) ||
            (newEventStart <= existingEventStart && newEventEnd >= existingEventEnd)
          );
        }
        return false;
      });
  
      if (hasConflict) {
        alert("Time conflict detected! Please choose a different time for your event.");
        return; // Stop the function if there's a conflict
      }
  
      // Proceed with adding the event if no conflict
      const eventToSave = {
        title: newEvent.title,
        description: newEvent.description || "",
        date: selectedDate.toISOString(), // Save date as ISO string
        start: newEventStart.toISOString(), // Save start time as ISO string
        end: newEventEnd.toISOString(), // Save end time as ISO string
        color: newEvent.color || "#3B82F6",
      };
  
      try {
        const response = await fetch("/api/calendar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(eventToSave),
        });
  
        const savedEvent = await response.json();
        setEvents([...events, { ...savedEvent, date: new Date(savedEvent.date) }]); // Convert back to Date object for display
        setShowEventModal(false);
        setNewEvent({
          title: "",
          description: "",
          start: "09:00",
          end: "10:00",
          color: "#3B82F6",
        });
      } catch (error) {
        console.error("Error adding event:", error);
      }
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await fetch("/api/calendar", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });

        setEvents(events.filter(event => event.id !== id));
      } catch (error) {
        console.error("Error deleting event:", error);
      }
    }
  };

  const renderDays = () => {
    const days = [];
    const totalDays = daysInMonth(currentDate);
    const firstDay = firstDayOfMonth(currentDate);

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-gray-100 bg-gray-50/50"></div>);
    }

    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayEvents = events.filter(event => event.date.toDateString() === date.toDateString());

      days.push(
        <div
          key={day}
          className={`h-24 border border-gray-200 p-1 overflow-hidden ${
            isToday(date) ? "bg-blue-50/40" : "hover:bg-gray-50"
          }`}
          onClick={() => setSelectedDate(date)}
        >
          <div className="flex justify-between items-center mb-1">
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${isToday(date) ? "bg-blue-500 text-white" : "text-gray-500"}`}>
              {day}
            </span>
            {dayEvents.length > 0 && (
              <span className="text-xs font-medium text-gray-500 px-1.5 py-0.5 bg-gray-100 rounded-full">
                {dayEvents.length}
              </span>
            )}
          </div>
          <div className="space-y-1">
            {dayEvents.map(event => (
              <div
                key={event.id}
                className="text-xs p-1 rounded truncate flex items-center cursor-pointer"
                style={{ backgroundColor: `${event.color}20`, borderLeft: `3px solid ${event.color}` }}
                onClick={() => handleEventClick(event)}
              >
                <div className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: event.color }}></div>
                <span className="truncate font-medium" style={{ color: event.color }}>
                  {event.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white rounded-xl shadow-md p-4 mb-4">
        <div className="flex items-center space-x-2">
          <h2 className="text-xl font-bold text-gray-800">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <span className="text-sm text-gray-500 ml-2">
            {events.length} Events
          </span>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="bg-gray-100 rounded-lg p-1 flex">
            <button
              onClick={() => setView('month')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${
                view === 'month' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${
                view === 'week' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setView('day')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${
                view === 'day' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Day
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-full hover:bg-gray-100 transition text-gray-700"
              aria-label="Previous month"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={handleToday}
              className="px-3 py-1.5 bg-blue-50 rounded-md hover:bg-blue-100 text-sm font-medium text-blue-600 transition"
            >
              Today
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-full hover:bg-gray-100 transition text-gray-700"
              aria-label="Next month"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          <button
            onClick={() => {
              setShowEventModal(true); // Open the modal
              setSelectedEvent(null); // Ensure no event is selected
              setNewEvent({
                title: "",
                description: "",
                start: "09:00",
                end: "10:00",
                color: "#3B82F6",
              }); // Reset the newEvent state
              setSelectedDate(new Date()); // Optionally reset the selected date
            }}
            className="ml-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center transition shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Event
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 flex-1">
          <div className="grid grid-cols-7 gap-0 text-sm">
            {dayNames.map(day => (
              <div key={day} className="text-center font-medium py-2 text-gray-600 border-b border-gray-100">
                {day}
              </div>
            ))}
            {renderDays()}
          </div>
        </div>
        
        {selectedDate && (
          <div className="bg-white rounded-xl shadow-md p-6 w-80 sticky top-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 text-lg">
                {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </h3>
              <span className="text-sm font-medium px-2 py-1 rounded bg-gray-100 text-gray-700">
                {selectedDate.toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
            </div>
            
            <div className="mb-6">
            <button
                onClick={() => {
                  setSelectedEvent(null); // clear editing mode
                  setNewEvent({
                    title: "",
                    date: selectedDate ?? new Date(),
                    start: "",
                    end: "",
                    description: "",
                    color: "#3B82F6", // default color
                  });
                  setShowEventModal(true);
                }}
                className="flex items-center justify-center w-full py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-sm font-medium transition duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Event
              </button>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {events
                .filter(event => event.date.toDateString() === selectedDate.toDateString())
                .sort((a, b) => (a.start || '').localeCompare(b.start || ''))
                .map(event => (
                  <div
                    key={event.id}
                    className="p-3 rounded-lg hover:bg-gray-50 transition-all duration-200 border border-gray-100 cursor-pointer"
                    style={{ borderLeft: `4px solid ${event.color}` }}
                    onClick={() => handleEventClick(event)}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-gray-800 mb-1">
                        {event.title}
                      </h4>
                      {!event.isAssignment && ( // Only show delete button for user-created events
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent triggering the event click handler
                            handleDeleteEvent(event.id);
                          }}
                          className="text-gray-400 hover:text-red-500 transition-colors duration-200 p-1"
                          aria-label="Delete event"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>

                    {event.start && event.end && (
                      <div className="flex items-center text-xs text-gray-500 mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formatTime(event.start)} - {formatTime(event.end)}
                      </div>
                    )}

                    {event.description && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{event.description}</p>
                    )}
                  </div>
                ))}
                
              {events.filter(event => event.date.toDateString() === selectedDate.toDateString()).length === 0 && (
                <div className="text-center py-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-sm">No events scheduled for this day</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div 
            className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl border border-gray-100 transform transition-all duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">New Event</h3>
              <button
                onClick={() => setShowEventModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-colors duration-200"
                  placeholder="Add title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={selectedDate ? formatDateToYYYYMMDD(selectedDate) : ''}
                  onChange={(e) => {
                    const newDate = new Date(e.target.value);
                    setSelectedDate(newDate);
                  }}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-colors duration-200"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={newEvent.start}
                    onChange={(e) => setNewEvent({ ...newEvent, start: e.target.value })}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-colors duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={newEvent.end}
                    onChange={(e) => setNewEvent({ ...newEvent, end: e.target.value })}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-colors duration-200"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-colors duration-200"
                  rows={3}
                  placeholder="Add a description (optional)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Event Color</label>
                <div className="grid grid-cols-8 gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      className={`w-full aspect-square rounded-md border-2 ${
                        newEvent.color === color.value ? 'border-gray-800' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color.value }}
                      aria-label={color.name}
                      title={color.name}
                      onClick={() => setNewEvent({ ...newEvent, color: color.value })}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowEventModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEvent}
                disabled={!newEvent.title}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors duration-200 ${
                  newEvent.title ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-300 cursor-not-allowed"
                }`}
              >
                {selectedEvent ? "Update Event" : "Save Event"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function CalendarPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar_dashboard />
      <div className="flex-1 p-6 ml-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Calendar</h1>
            <span className="text-sm text-gray-500">
              Plan your schedule and organize your time
            </span>
          </div>
          <Calendar />
        </div>
      </div>
    </div>
  );
}