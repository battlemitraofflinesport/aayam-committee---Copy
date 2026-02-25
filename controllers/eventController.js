/* ===============================
   EVENTS LIST PAGE
================================ */
exports.getEventsPage = (req, res) => {
  const upcomingEvents = [
    { _id: "e1", title: "Upcoming Event 1", shortDescription: "Short info", type: "upcoming", startDate: new Date("2026-10-01"), bannerImage: "" }
  ];
  const pastEvents = [
    { _id: "e2", title: "Past Event 1", shortDescription: "Short info", type: "past", startDate: new Date("2025-01-01"), bannerImage: "" }
  ];

  res.render("events/index", { upcomingEvents, pastEvents });
};

/* ===============================
   EVENT DETAIL PAGE
================================ */
exports.getEventDetail = (req, res) => {
  const event = {
    _id: req.params.id,
    title: "Sample Event",
    type: "past",
    startDate: new Date("2025-01-01"),
    endDate: new Date("2025-01-02"),
    bannerImage: "",
    shortDescription: "Short sample description",
    description: "Sample description goes here.",
    about: "About this sample event.",
    galleryImages: [],
    conductedBy: [{ name: "Admin", email: "admin@example.com" }],
    documents: [{ title: "Schedule.pdf", file: "#", isPublic: true }]
  };

  const isPast = event.type === "past";
  const reviews = [
    { name: "John Doe", message: "Great event!", createdAt: new Date() }
  ];

  res.render("events/show", { event, isPast, reviews });
};
