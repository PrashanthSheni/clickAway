import React from "react";
import CalendarBase from "../components/CalendarBase";
export default function CalendarView() {
  return <CalendarBase endpoint="/calendar/employee" title="Your calendar" subtitle="All of your bookings across rooms, desks and assets." testid="employee-calendar-page" />;
}
