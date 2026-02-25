exports.getHome = (req, res) => {
  const whatWeDoImages = [
    { image: "/assets/sample1.jpg", section: "what_we_do", _id: "1" },
    { image: "/assets/sample2.jpg", section: "what_we_do", _id: "2" }
  ];
  const eventImages = [
    { image: "/assets/sample3.jpg", section: "events", _id: "3" },
    { image: "/assets/sample4.jpg", section: "events", _id: "4" }
  ];

  res.render("home", {
    whatWeDoImages,
    eventImages,
  });
};
