import { hubspotFetch } from "./client";

export async function fetchDealsByOwner(weeksBack = 12) {
  const since = new Date();
  since.setDate(since.getDate() - weeksBack * 7);

  const body = {
    filterGroups: [
      {
        filters: [
          { propertyName: "closedate", operator: "GTE", value: since.getTime().toString() },
          { propertyName: "dealstage", operator: "EQ", value: "closedwon" },
        ],
      },
    ],
    properties: [
      "dealname", "amount", "closedate",
      "hubspot_owner_id", "createdate",
    ],
    limit: 200,
  };

  const data = await hubspotFetch<any>("/crm/v3/objects/deals/search", {
    method: "POST",
    body: JSON.stringify(body),
  });

  return data.results || [];
}

export async function fetchOwners() {
  const data = await hubspotFetch<any>("/crm/v3/owners?limit=100");
  return data.results || [];
}

export async function fetchLeadsByOwner(ownerId: string) {
  const body = {
    filterGroups: [
      {
        filters: [
          { propertyName: "hubspot_owner_id", operator: "EQ", value: ownerId },
          { propertyName: "lifecyclestage", operator: "EQ", value: "lead" },
        ],
      },
    ],
    properties: ["createdate", "hubspot_owner_id", "lifecyclestage"],
    limit: 200,
  };

  try {
    const data = await hubspotFetch<any>("/crm/v3/objects/contacts/search", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return data.results || [];
  } catch {
    return [];
  }
}
