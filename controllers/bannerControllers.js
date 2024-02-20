const { render } = require("ejs");
const banner = require("../models/bannerModel");


const loadBanner = async (req, res) => {
    try {
      const Banner = await banner.find()
      res.render("admin/banner", { lay: false,Banner});
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  const loadEditBanner = async (req, res) => {
    try {
      const bannerData= await banner.findOne({_id:req.query.id});
      res.render("admin/editBanner", { lay: false,bannerData});
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  const editBanner = async (req, res) => {
    try {
      console.log(req.body);
      const imgf=req.files;
      console.log(imgf);
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ error: "Internal server error" });
    }
  };


  const blockBanner= async(req,res)=>{
    try {
      const banerId = req.body.id;
      console.log(banerId);
      const ban = await banner.findOne({_id:banerId})
      console.log(ban);
      if (ban.status ==true) {
      console.log('working');
        
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
      console.log('working');

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
  }



module.exports = {
    loadBanner,
    loadEditBanner,
    blockBanner,
    editBanner
  };
  