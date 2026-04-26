import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CalendarBase from "../components/CalendarBase";
import { api } from "../lib/api";

export default function ResourceCalendar() {
  const { resourceId } = useParams();
  const [resource, setResource] = useState(null);
  useEffect(() => {
    (async () => {
      const { data } = await api.get(`/resources/${resourceId}`);
      setResource(data);
    })();
  }, [resourceId]);
  if (!resource) return <div className="text-slate-500">Loading…</div>;
  return (
    <CalendarBase
      endpoint={`/calendar/resource/${resourceId}`}
      eyebrow="Resource"
      title={resource.name}
      subtitle={`${resource.type} · Floor ${resource.floor} · Capacity ${resource.capacity}`}
      testid="resource-calendar-page"
    />
  );
}
