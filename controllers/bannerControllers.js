const { render } = require("ejs");
const banner = require("../models/bannerModel");

// =======================LOAD BANNER PAGE=====================================================
const loadBanner = async (req, res) => {
  try {
    const Banner = await banner.find();
    res.render("admin/banner", { lay: false, Banner });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
// =================LOAD EDIT BANNER===========================================================

const loadEditBanner = async (req, res) => {
  try {
    const bannerData = await banner.findOne({ _id: req.query.id });
    res.render("admin/editBanner", { lay: false, bannerData });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
// =======================EDIT BANNER=====================================================
const editBanner = async (req, res) => {
  try {
    console.log("working");
    if (req.body.title.trim().length <= 3 || req.body.description.trim() <= 3) {
      return res.json({
        success: false,
        errorMessage: "please fill all the filds properly",
      });
    }
    if (req.file) {
      await banner.updateOne(
        { _id: req.body.banerId },
        {
          $set: {
            title: req.body.title,
            description: req.body.description,
            image: req.file.filename,
          },
        }
      );
      console.log("hai image");
      res.redirect('/admin/banner')
    } else {
      await banner.updateOne(
        { _id: req.body.banerId },
        {
          $set: {
            title: req.body.title,
            description: req.body.description,
          },
        }
      );
      console.log("hai");
      return res.json({ success: false });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
// ===================BLOCK BANNER=========================================================

const blockBanner = async (req, res) => {
  try {
    const banerId = req.body.id;
    console.log(banerId);
    const ban = await banner.findOne({ _id: banerId });
    console.log(ban);
    if (ban.status == true) {
      console.log("working");

      await banner.updateOne({ _id: banerId }, { $set: { status: false } });
      console.log("banner blocked");
      return res.json({
        blocked: true,
        success: true,
        statustext: "blocked",
        textcolor: "red",
        btntext: "unblock",
        btncolor: "green",
      });
    } else {
      console.log("working");

      await banner.updateOne({ _id: banerId }, { $set: { status: true } });
      console.log("banner unblocked");
      return res.json({
        blocked: false,
        success: true,
        statustext: "active",
        textcolor: "green",
        btntext: "block",
        btncolor: "red",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  loadBanner,
  loadEditBanner,
  blockBanner,
  editBanner,
};
