const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const api = {
  // Get all projects (replaces sessionStorage history)
  getProjects: async () => {
    const res = await fetch(`${BASE_URL}/api/projects`);
    const data = await res.json();
    return data.success ? data.data : [];
  },

  // Save a project after generation
 saveProject: async (entry) => {
  try {
    const res = await fetch(`${BASE_URL}/api/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name:            entry.name,
        city:            entry.city,
        num_floors:      entry.numFloors,
        num_sous_sols:   entry.numSousSols,
        parking:         entry.parking,
        terrain_surface: entry.terrainSurface,
        summary:         entry.summary,
        filled_data:     entry.filledData,
        active_types:    entry.activeTypes,
        report:          entry.report,
        generated_date:  entry.date,
        generated_time:  entry.time,
        total_beds:      entry.summary?.totalBeds || 0,
        total_rooms:     entry.summary?.totalRooms || 0,
        total_area_net:  entry.summary?.totalArea || 0,
        total_area_gross: Math.round((entry.summary?.totalArea || 0) * 1.35),
      }),
    });
    if (!res.ok) {
      console.error("Save failed:", res.status, await res.text());
      return null;
    }
    const data = await res.json();
    return data.success ? data.data : null;
  } catch(e) {
    console.error("Save error:", e);
    return null;
  }
},
  // Delete a project
  deleteProject: async (id) => {
    const res = await fetch(`${BASE_URL}/api/projects/${id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    return data.success;
  },
  generateReport: async (payload) => {
  const res = await fetch(`${BASE_URL}/api/generate-report`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
},
};
