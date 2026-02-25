/* ===============================
   VIEW TEAM PAGE
================================ */
const getTeamPage = (req, res) => {
  const sections = [
    {
      _id: "s1",
      title: "Core Team",
      members: [
        { _id: "m1", name: "Alice", image: "", section: "s1" },
        { _id: "m2", name: "Bob", image: "", section: "s1" }
      ]
    }
  ];

  res.render("team", { sections });
};

module.exports = {
  getTeamPage,
};
