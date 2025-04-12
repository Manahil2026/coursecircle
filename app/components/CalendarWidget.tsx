// CalendarWidget.tsx
"use client";
import React from "react";

const CalendarWidget: React.FC = () => {
  // Dynamic date setup
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.toLocaleString("default", { month: "long" });
  const currentYear = today.getFullYear();
  const currentDayOfWeekIndex = today.getDay(); // 0 (Sun) to 6 (Sat)

  // Get start of the current week (Sunday)
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - currentDayOfWeekIndex);

  // Generate days for the current week
  const daysToShow = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    return {
      day: date.getDate(),
      index: date.getDay(),
      isCurrentDay:
        date.getDate() === currentDay &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear(),
    };
  });

  return (
    <div className="rounded-lg">
      <h2 className="text-base font-semibold mb-4">{`${currentMonth} ${currentYear}`}</h2>
      <div className="grid grid-cols-7 text-center bg-[#AAFF45] rounded-lg">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
          (day, index) => (
            <div
              key={day}
              className={`font-medium py-[3px] ${
                index === currentDayOfWeekIndex
                  ? "bg-black text-white rounded-t-lg"
                  : ""
              }`}
            >
              {day}
            </div>
          )
        )}

        {/* Dynamic day numbers */}
        {daysToShow.map(({ day, index, isCurrentDay }, i) => (
          <div
            key={i}
            className={`font-medium py-1 ${
              isCurrentDay && index === currentDayOfWeekIndex
                ? "bg-black text-white rounded-b-lg"
                : ""
            }`}
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarWidget;