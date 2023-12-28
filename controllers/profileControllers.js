const { render } = require("ejs");
const product = require("../models/productmodel");
const category = require("../models/catogerymodel");
const user = require("../models/usermodel");
const address = require("../models/addressModel");

const loadProfile = async (req, res) => {
  try {
    console.log(req.session.name);
    // const name= await user.find({_id:req.session.user_id});
    res.render("user/profile", {
      lay: true,
      name: req.session.name,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const loadUserDetailes = async (req, res) => {
  try {
    const userDetails = await user.findOne({ _id: req.session.user_id });
    res.render("user/profile-detailes", {
      lay: true,
      name: req.session.name,
      userDetails,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const editDetails = async (req, res) => {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const number = req.body.number;
    if (name.length <= 2) {
      return res.json({
        success: false,
        errorMessage: "name should be more than 2 charectors",
      });
    } else {
      if (email.trim() === "" && number.trim() === "" && name.trim() === "") {
        return res.json({
          success: false,
          errorMessage: "some field is empty",
        });
      } else {
        const emailPattern = /^[a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
        if (!emailPattern.test(email)) {
          return res.json({
            success: false,
            errorMessage: "please give a valid email Id",
          });
        } else {
          const mobilePattern = /^\d{10}$/;
          if (!mobilePattern.test(number) || number === "0000000000") {
            return res.json({
              success: false,
              errorMessage: "please give a valid phone number",
            });
          } else {
            await user.updateOne(
              { _id: req.body._id },
              {
                $set: {
                  fullname: name,
                  email: email,
                  number: number,
                },
              }
            );
            return res.json({
              success: true,
              redirectTo: "/profile",
              name: req.session.name,
            });
          }
        }
      }
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const loadChangePassword = async (req, res) => {
  try {
    res.render("user/changePassword", { lay: true });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const loadAddress = async (req, res) => {
  try {
    res.render("user/Address", { lay: true });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const loadAddAddress = async (req, res) => {
  try {
    res.render("user/addAddress", { lay: true });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const addAddress = async (req, res) => {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const number = req.body.number;
    const state = req.body.state;
    const pincode = req.body.pincode;
    const houseNum = req.body.houseNum;
    const city = req.body.city;
    if (name.length <= 2) {
      return res.json({
        success: false,
        errorMessage: "name should be more than 2 charectors",
      });
    } else {
      if (
        email.trim() === "" ||
        number.trim() === "" ||
        state.trim() === "" ||
        pincode.trim() === "" ||
        houseNum.trim() === "" ||
        city.trim() === ""
      ) {
        return res.json({
          success: false,
          errorMessage: "Please fill the all field",
        });
      } else {
        const emailPattern = /^[a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
        if (!emailPattern.test(email)) {
          return res.json({
            success: false,
            errorMessage: "Please give a valid email",
          });
        } else {
          const mobilePattern = /^\d{10}$/;
          if (!mobilePattern.test(number) || number === "0000000000") {
            return res.json({
              success: false,
              errorMessage: "please give a valid phone number",
            });
          } else {
            if (pincode.length < 6 || pincode.length > 6) {
              return res.json({
                success: false,
                errorMessage: "please enter a valid pincode",
              });
            } else {
              // after validation
              const userId = req.session.user_id;
              const addressData = await address.findOne({ user: userId });
              if (addressData) {
                const updated = await address.updateOne(
                  { user: userId },
                  {
                    $push: {
                      address: {
                        fullname: name,
                        mobile: number,
                        email: email,
                        houseName: houseNum,
                        city: city,
                        state: state,
                        pin: pincode,
                      },
                    },
                  }
                );

                if (updated) res.redirect("/load-add-address");
                else {
                  return res.json({
                    success: false,
                    errorMessage: "something wrong please try again later",
                  });
                }
              } else {
                const data = new address({
                  user: userId,
                  address: [
                    {
                      fullname: name,
                      mobile: number,
                      email: email,
                      houseName: houseNum,
                      city: city,
                      state: state,
                      pin: pincode,
                    },
                  ],
                });
                const saved = await data.save();

                if (saved) res.json({ success: true });
                else res.json({ failed: true });
              }
            }
          }
        }
      }
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  loadProfile,
  loadUserDetailes,
  editDetails,
  loadChangePassword,
  loadAddress,
  loadAddAddress,
  addAddress,
};
