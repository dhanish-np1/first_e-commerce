const { render } = require("ejs");
const product = require("../models/productmodel");
const category = require("../models/catogerymodel");
const user = require("../models/usermodel");
const address = require("../models/addressModel");
const order = require("../models/orderModel");
const bcrypt = require("bcrypt");



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
    res.render("user/changePassword", { lay: true, name: req.session.name });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const ChangePassword = async (req, res) => {
  try {
    const curPassword = req.body.currentPassword;
    const newPassword = req.body.newPassword;
    const confPassword = req.body.confNewPassword;
    const userId = req.session.user_id;
    const userData = await user.findOne({ _id: userId });
    console.log(userData);
    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasLowercase = /[a-z]/.test(newPassword);
    const hasNumber = /\d/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/.test(
      newPassword
    );
    const passwordmatch = await bcrypt.compare(curPassword, userData.password);
    if (curPassword.trim() === "" || newPassword.trim() === "" || confPassword.trim() === "") {
      return res.json({
        success: false,
        errorMessage: "please fill all fields",
      });

    } else if ((
      newPassword.length < 6 ||
      !(hasUppercase && hasLowercase && hasNumber && hasSpecialChar)
    )) {
      return res.json({
        success: false,
        errorMessage:
          "password need more than 6 and need special charecters and uper case and lower case",
      });
    }else if(newPassword !==confPassword){
      return res.json({
        success: false,
        errorMessage: "password and conform password is not equal",
      });
    }

    if(passwordmatch){
      const passwordhash = await bcrypt.hash(newPassword, 10);
      const updatedData = await user.updateOne(
        { _id: userId },
        {
          $set: { password: passwordhash },
        }
      );
      if (updatedData) {
        return res.json({
          success: true,
          errorMessage: "",
        });
      } else {
        return res.json({
          success: false,
          errorMessage: "somthing went wrong please try again later",
        });
      }
    }else{
      return res.json({
        success: false,
        errorMessage: "curent password is wrong",
      });
    }
    
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const loadAddress = async (req, res) => {
  try {
    const Address = await address.findOne({ user: req.session.user_id })
    res.render("user/Address", { lay: true, Address, name: req.session.name });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const loadAddAddress = async (req, res) => {
  try {
    res.render("user/addAddress", { lay: true, name: req.session.name,page:req.query.page });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const addAddress = async (req, res) => {
  try {
    console.log(req.body);
    const page=req.body.page;
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
                if(updated){
                  return res.json({
                    success: true,
                    errorMessage: "",page
                  });
                }else{
                  return res.json({
                    success: false,
                    errorMessage: "some thing went wrong please try again later",
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
                if(saved){
                  return res.json({
                    success: true,
                    errorMessage: "",page
                  });
                }else{
                  return res.json({
                    success: false,
                    errorMessage: "some thing went wrong please try again later",
                  });
                }
               
              }
            }
          }
        }
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const loadOrders = async (req, res) => {
  try {
    const orders = await order.find({ userId: req.session.user_id });
    res.render("user/orders", { lay: true, name: req.session.name, orders });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
}


const removeAddress =async (req, res) => {
  try {
    const Id = req.body._id;
    const addressId = req.body.addressId;
    const addressData = await address.findOne({ _id:Id });
    console.log(addressData);
    if (addressData) {
     const a= await address.findOneAndUpdate(
        { _id: Id },
        {
          $pull: { address: { _id: addressId } },
        }
      );
      res.json({ success: true });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
}
const loadCoupons = async (req, res) => {
  try {
    res.render("user/coupons", { lay: true, name: req.session.name });
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
  loadOrders,
  ChangePassword,
  removeAddress,
  loadCoupons

};
