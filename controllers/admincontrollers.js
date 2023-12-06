const admin = require("../models/adminmodel");
const user = require("../models/usermodel");
const { render } = require("ejs");
const bcrypt = require("bcrypt");
const category = require("../models/catogerymodel");

const loadAdmin = async (req, res) => {
  try {
    res.render("admin/adminlogin", { lay: false, noteq: "" });
  } catch (error) {
    console.log(error);
  }
};

const loadCatogery = async (req, res) => {
  try {
    const categories = await category.find();
    res.render("admin/category", { lay: false, cats: categories, same: "" });
  } catch (error) {
    console.log(error);
  }
};

const loadUsers = async (req, res) => {
  try {
    const userdata = await user.find();
    res.render("admin/users", { lay: false, users: userdata });
  } catch (error) {
    console.log(error);
  }
};

const loadDashBoard = async (req, res) => {
  try {
    res.render("admin/dashboard", { lay: false });
  } catch (error) {
    console.log(error);
  }
};

const adminLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const userdata = await admin.findOne({ email: email });
    if (userdata) {
      const passwordmatch = await bcrypt.compare(password, userdata.password);
      if (passwordmatch) {
        req.session.admin_id=userdata._id;;
        res.render("admin/dashboard", { lay: false });
        
      } else {
        const unequal = "Email and password is not match";
        res.render("admin/adminlogin", { lay: false, noteq: unequal });
      }
    } else {
      const unequal = "Email and password is not match";
      res.render("admin/adminlogin", { lay: false, noteq: unequal });
    }
  } catch (error) {
    console.log(error.massage);
  }
};
const addCategory = async (req, res) => {
  try {
    console.log("add category")
    const cat = req.body.newcategory;
    const existingCategory = await category.findOne({ name: { $regex: new RegExp('^' + cat + '$', 'i') } });
    if(cat.trim()==""){
      return res.json({
        success: false,
        errorMessage: "please enter a name",
      });
    }else{
      if (existingCategory) {
        return res.json({
          success: false,
          errorMessage: "this catogory is already exist",
        });
      } else {
        const newCategory = new category({
          name: cat,
        });
        
        await newCategory.save();
        return res.json({
          success: true,
        });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error"); // Sending an error response to the client
  }
};

const blockCat = async (req, res) => {
  try {
    const categoryId = req.body.userId;
    const catogorys = await category.findOne({ _id: categoryId });
    if (catogorys.blocked == 0) {
      await category.updateOne(
        { _id: req.body.userId },
        { $set: { blocked: 1 } }
      );
      console.log("catogery blocked");
      return res.json({
        blocked: true,
        success: true,
        statustext: "blocked",
        textcolor: "red",
        btntext: "unblock",
        btncolor: "green",
      });
    } else {
      await category.updateOne(
        { _id: req.body.userId },
        { $set: { blocked: 0 } }
      );
      console.log("catogery unblocked");
      return res.json({
        blocked: true,
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

const editCat = async (req, res) => {
  try {
    
    const categoryId = req.body._id;
    const name = req.body.newname;
    if(name.trim()==""){
      return res.json({
        success: false,
        errorMessage: "please enter a name",
      });
      
    }else{
      const existingCategory = await category.findOne({ name: { $regex: new RegExp('^' + name + '$', 'i') } });
      if (existingCategory) {
        return res.json({
          success: false,
          errorMessage: "this catogory is already exist",
        });
      } else {
         await category.updateOne(
            { _id: categoryId },
            { $set: { name: name } }
          );
        return res.json({
          success: true,
        });
      }
    }

  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const blockUser = async (req, res) => {
  try {
    const userId = req.body.userId;
    const User = await user.findOne({ _id: userId });
    if (User.is_block === 0) {
      req.session = false;
      await user.updateOne({ _id: userId }, { $set: { is_block: 1 } });
      console.log("user blocked");
      return res.json({
        blocked: true,
        success: true,
        statustext: "blocked",
        textcolor: "red",
        btntext: "unblock",
        btncolor: "green",
      });
    } else {
      await user.updateOne({ _id: userId }, { $set: { is_block: 0 } });
      console.log("user unblocked");
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

//==============================ADMIN LOGOUT=====================================

const adminLogout = async (req, res) => {
  try {
    req.session.admin_id = false;
    res.redirect("/admin");
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  loadAdmin,
  loadCatogery,
  loadUsers,
  loadDashBoard,
  adminLogin,
  addCategory,
  blockCat,
  editCat,
  blockUser,
  adminLogout,
};
