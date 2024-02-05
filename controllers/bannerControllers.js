const { render } = require("ejs");

const loadBanner = async (req, res) => {
    try {
      
      console.log("banner");
      res.render("admin/banner", { lay: false});
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ error: "Internal server error" });
    }
  };



module.exports = {
    loadBanner
  };
  