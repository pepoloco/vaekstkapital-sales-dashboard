import { hubspotFetch } from "./client";

export async function fetchMeetingsByOwner(ownerId: string, weeksBack = 12) {
  const since = new Date();
  since.setDate(since.getDate() - weeksBack * 7);

  const body = {
    filterGroups: [
      {
        filters: [
          { propertyName: "hubspot_owner_id", operator: "EQ", value: ownerId },
          { propertyName: "hs_meeting_start_time", operator: "GTE", value: since.getTime().toString() },
        ],
      },
    ],
    properties: [
      "hs_meeting_title",
      "hs_meeting_start_time",
      "hs_meeting_end_time",
      "hs_internal_meeting_notes",
      "hubspot_owner_id",
    ],
    limit: 200,
  };

  try {
    const data = await hubspotFetch<any>("/crm/v3/objects/meetings/search", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return data.results || [];
  } catch {
    return [];
  }
}

export function classifyMeetingType(
  title = "",
  notes = ""
): "physical" | "teams" | "dinner" | "webinar" {
  const text = (title + " " + notes).toLowerCase();
  if (text.includes("dinner") || text.includes("lunch")) return "dinner";
  if (text.includes("webinar") || text.includes("seminar")) return "webinar";
  if (
    text.includes("teams") ||
    text.includes("zoom") ||
    text.includes("virtual") ||
    text.includes("video") ||
    text.includes("online")
  )
    return "teams";
  return "physical";
}
