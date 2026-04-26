import React from "react";
import CalendarBase from "../components/CalendarBase";
export default function TeamCalendar() {
  return <CalendarBase endpoint="/calendar/team" eyebrow="Manager" title="Team calendar" subtitle="Everyone reporting to you, across resources." testid="team-calendar-page" />;
}
