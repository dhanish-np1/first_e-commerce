const admin = require("../models/adminmodel");
const user = require("../models/usermodel");
const { render } = require("ejs");
const bcrypt = require("bcrypt");
const category = require("../models/catogerymodel");
const order = require("../models/orderModel");
const product = require("../models/productmodel");
const Offer = require("../models/offerModel");

// =======================LOAD DASHBOARD=====================================================

const loadDashBoard = async (req, res) => {
  try {
    const users = await user.find({ is_verified: 1 });
    const totalUser = users.length;

    const products = await product.find({ blocked: 0 });
    const totalOrder = await order.find();
    const sales = await order.countDocuments({ status: "delivered" });
    const orderData = await order
      .find({})
      .sort({ date: -1 })
      .populate("products.productId");

    const codCount = await order.countDocuments({
      status: "delivered",
      paymentMethod: "COD",
    });
    const onlinePaymentCount = await order.countDocuments({
      status: "delivered",
      paymentMethod: "online_Payment",
    });
    const walletCount = await order.countDocuments({
      status: "delivered",
      paymentMethod: "Wallet",
    });

    const monthlyOrderCounts = await order.aggregate([
      {
        $match: {
          status: "delivered",
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%m",
              date: "$deliveryDate",
            },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    let data = [];

    if (monthlyOrderCounts.length !== 0) {
      let ind = 0;

      for (let i = 0; i < 12; i++) {
        if (i + 1 < parseInt(monthlyOrderCounts[0]._id)) {
          data.push(0);
        } else {
          if (monthlyOrderCounts[ind]) {
            let count = monthlyOrderCounts[ind].count;
            data.push(count);
          } else {
            data.push(0);
          }
          ind++;
        }
      }
    } else {
      data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    }

    const monthRevenue = await order.aggregate([
      {
        $match: {
          status: "delivered",
        },
      },
      {
        $project: {
          year: { $year: "$deliveryDate" },
          month: { $month: "$deliveryDate" },
          totalAmount: 1,
        },
      },
      {
        $group: {
          _id: { year: "$year", month: "$month" },
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    // Find the latest entry in monthRevenue
    const latestMonthEntry =
      monthRevenue.length !== 0 ? monthRevenue[monthRevenue.length - 1] : null;

    // Get total revenue for the latest month, or set to 0 if no data
    const monRev = latestMonthEntry ? latestMonthEntry.totalRevenue : 0;

    const totalRev = await order.aggregate([
      {
        $match: {
          status: "delivered",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    const totalRevenue = totalRev.length !== 0 ? totalRev[0].totalRevenue : 0;

    let totalCod = await order.aggregate([
      { $match: { status: "Delivered", paymentMethod: "COD" } },

      { $group: { _id: null, total1: { $sum: 1 } } },
    ]);

    let totalOnline = await order.aggregate([
      { $match: { status: "Delivered", paymentMethod: "online_Payment" } },

      { $group: { _id: null, total2: { $sum: 1 } } },
    ]);

    let totalWallet = await order.aggregate([
      { $match: { status: "Delivered", paymentMethod: "Wallet" } },

      { $group: { _id: null, total3: { $sum: 1 } } },
    ]);
    // finding to selling products
    const topProducts = await order.aggregate([
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.productId",
          totalQuantitySold: { $sum: "$products.quantity" },
          productName: { $first: "$products.product_name" },
          image: { $first: "$products.image" },
        },
      },
      { $sort: { totalQuantitySold: -1 } },
      { $limit: 10 },
    ]);
    const topCategery = await order.aggregate([
      { $unwind: "$products" },
      // Perform a lookup to get the category information for each product
      {
        $lookup: {
          from: "product", // Name of the collection containing products
          localField: "products.productId",
          foreignField: "_id",
          as: "product",
        },
      },
      // Unwind the resulting product array
      { $unwind: "$product" },
      // Perform another lookup to get the category information for each product
      {
        $lookup: {
          from: "category", // Name of the collection containing categories
          localField: "product.categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      // Unwind the resulting category array
      { $unwind: "$category" },
      // Group by category and count the number of orders for each category
      {
        $group: {
          _id: "$category._id",
          categoryName: { $first: "$category.name" },
          orderCount: { $sum: 1 },
        },
      },
      // Sort the results by order count in descending order
      { $sort: { orderCount: -1 } },
    ]);
    console.log(topProducts);
    console.log(topCategery);
    totalCod = totalCod.length > 0 ? totalCod[0].total1 : 0;
    totalOnline = totalOnline.length > 0 ? totalOnline[0].total2 : 0;
    totalWallet = totalWallet.length > 0 ? totalWallet[0].total3 : 0;

    res.render("admin/dashboard", {
      lay: false,
      totalUser,
      products,
      totalOrder,
      totalRevenue,
      monRev,
      sales,
      codCount,
      walletCount,
      onlinePaymentCount,
      data,
      orderData,
      totalOnline,
      totalCod,
      totalWallet,
      topProducts,
    });
  } catch (error) {
    console.log(error);
  }
};
// =====================LOAD ADMIN SIDE=======================================================

const loadAdmin = async (req, res) => {
  try {
    res.render("admin/adminlogin", { lay: false, noteq: "" });
  } catch (error) {
    console.log(error);
  }
};
// ============================= LOAD CATEGERY===============================================

const loadCatogery = async (req, res) => {
  try {
    const offer = await Offer.find({ blocked: 0 });
    const categories = await category.find().populate("offer");
    res.render("admin/category", {
      lay: false,
      cats: categories,
      same: "",
      offer,
    });
  } catch (error) {
    console.log(error);
  }
};
// ==========================LOAD USER DATA==================================================

const loadUsers = async (req, res) => {
  try {
    const userdata = await user.find();
    res.render("admin/users", { lay: false, users: userdata });
  } catch (error) {
    console.log(error);
  }
};

// ==========================ADMIN LOGIN==================================================

const adminLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const userdata = await admin.findOne({ email: email });
    if (userdata) {
      const passwordmatch = await bcrypt.compare(password, userdata.password);
      if (passwordmatch) {
        req.session.admin_id = userdata._id;
        res.redirect("/admin/dashboard");
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
// ============================ADD CATEGERY================================================

const addCategory = async (req, res) => {
  try {
    console.log("add category");
    const cat = req.body.newcategory;
    const existingCategory = await category.findOne({
      name: { $regex: new RegExp("^" + cat + "$", "i") },
    });
    if (cat.trim() == "") {
      return res.json({
        success: false,
        errorMessage: "please enter a name",
      });
    } else {
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
          errorMessage: "",
        });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};
// ============================BLOCK CATEGERY================================================

const blockCat = async (req, res) => {
  try {
    const categoryId = req.body.userId;
    const catogorys = await category.findOne({ _id: categoryId });
    if (catogorys.blocked == 0) {
      await category.updateOne(
        { _id: req.body.userId },
        { $set: { blocked: 1 } }
      );
      await product.updateMany(
        { category: catogorys.name },
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
      await product.updateMany(
        { category: catogorys.name },
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
// ========================EDIT CATEGERY====================================================

const editCat = async (req, res) => {
  try {
    console.log("working");
    const categoryId = req.body._id;
    const name = req.body.newname;
    console.log(categoryId);
    if (name.trim() == "") {
      return res.json({
        success: false,
        errorMessage: "please enter a name",
      });
    } else {
      const existingCategory = await category.findOne({
        name: { $regex: new RegExp("^" + name + "$", "i") },
      });
      if (existingCategory) {
        return res.json({
          success: false,
          errorMessage: "this catogory is already exist",
        });
      } else {
        await category.updateOne({ _id: categoryId }, { $set: { name: name } });
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
// ==================== BLOCK USER IN ADMIN SIDE========================================================

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
// ================================LOAD ORDER PAGE============================================
const loadOrder = async (req, res) => {
  try {
    const orders = await order.find();
    res.render("admin/order", { lay: false, orders });
  } catch (error) {
    console.log(error.massage);
  }
};
// ====================================== VIEW ORDER DETAILS IN ADMIN SIDE======================================
const viewOrder = async (req, res) => {
  try {
    const id = req.query.id;
    const orders = await order.findOne({ _id: id });
    console.log(orders);
    res.render("admin/viewOrder", { lay: false, orders });
  } catch (error) {
    console.log(error.massage);
  }
};
// ======================================SORT SALES REPORT======================================
const salesSort = async (req, res) => {
  try {
    const printTime = req.query.time;
    const duration = parseInt(req.query.time);
    let startDate, endDate;
    const currentDate = new Date();
    startDate = new Date(currentDate - duration * 24 * 60 * 60 * 1000);
    endDate = currentDate;
    const orders = await order.aggregate([
      {
        $unwind: "$products",
      },
      {
        $match: {
          status: "delivered",
          deliveryDate: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $sort: { deliveryDate: -1 },
      },
      {
        $lookup: {
          from: "products",
          let: { productId: { $toObjectId: "$products.productId" } },
          pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$productId"] } } }],
          as: "products.productDetails",
        },
      },
      {
        $addFields: {
          "products.productDetails": {
            $arrayElemAt: ["$products.productDetails", 0],
          },
        },
      },
    ]);

    console.log(orders);
    res.render("admin/salesReport", { lay: false, orders, printTime });
  } catch (error) {
    console.log(error.massage);
  }
};
// ======================================DOWNLOAD SALES REPORT======================================
const downloadReport = async (req, res) => {
  try {
    let startDate, endDate;
    let duration;
    duration = parseInt(req.query.time);
    const currentDate = new Date();
    switch (duration) {
      case 1:
      case 7:
        startDate = new Date(currentDate - duration * 24 * 60 * 60 * 1000);
        endDate = currentDate;
        break;
      case 30:
        startDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 1,
          currentDate.getDate()
        );
        endDate = currentDate;
        break;
      case 365:
        startDate = new Date(
          currentDate.getFullYear() - 1,
          currentDate.getMonth(),
          currentDate.getDate()
        );
        endDate = currentDate;
        break;
      default:
        startDate = new Date(currentDate - duration * 24 * 60 * 60 * 1000);
        endDate = currentDate;
    }
    const orderData = await order
      .find({
        status: "delivered",
        deliveryDate: {
          $gte: startDate,
          $lt: endDate,
          $ne: null,
          $type: "date",
        },
      })
      .sort({ date: -1 })
      .populate("products.productId");
    let dateLabel;
    switch (duration) {
      case 1:
        dateLabel = "Daily";
        break;
      case 7:
        dateLabel = "Weekly";
        break;
      case 30:
        dateLabel = "Monthly";
        break;
      case 365:
        dateLabel = "Yearly";
        break;
      default:
        dateLabel = "Custom";
    }
    console.log(orderData);
    console.log(orderData.length);

    res.render("admin/reportPdf", { lay: false, date: dateLabel, orderData });
  } catch (error) {
    console.log(error.massage);
  }
};
// ======================================DASHBOARD WEEKLY CHART======================================
const weeklySalesDataEndpoint = async (req, res) => {
  try {
    console.log("wokign fjsdl very well");
    const weeklySalesData = await order.aggregate([
      {
        $match: {
          status: "delivered",
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%U",
              date: "$deliveryDate",
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    const labels = weeklySalesData.map((item) => `Week ${item._id}`);
    const salesData = weeklySalesData.map((item) => item.count);
    console.log(labels);
    console.log(salesData);

    // Send the formatted data as JSON response
    res.json({ labels, salesData });
  } catch (error) {
    console.error("Error fetching weekly sales data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//==========================================chartFilterWeek==============================================
const chartFilterWeek = async (req, res) => {
  try {
    const totalCodWeek = await order.countDocuments({
      status: "delivered",
      paymentMethod: "COD",
      deliveryDate: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    });
    const totalOnlineWeek = await order.countDocuments({
      status: "delivered",
      paymentMethod: "online_Payment",
      deliveryDate: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    });

    const totalWalletWeek = await order.countDocuments({
      status: "delivered",
      paymentMethod: "Wallet",
      deliveryDate: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    });

    res.json([totalCodWeek, totalOnlineWeek, totalWalletWeek]);
  } catch (error) {
    console.error(error.message);
    res.status(500).sendFile(error500);
  }
};

// ========================================chartFilterMonth===============================================
const chartFilterMonth = async (req, res) => {
  try {
    console.log("hh");
    const totalCodMonth = await order.countDocuments({
      status: "delivered",
      paymentMethod: "COD",
      deliveryDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    });

    const totalOnlineMonth = await order.countDocuments({
      status: "delivered",
      paymentMethod: "online_Payment",
      deliveryDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    });

    const totalWalletMonth = await order.countDocuments({
      status: "delivered",
      paymentMethod: "Wallet",
      deliveryDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    });
    res.json([totalCodMonth, totalOnlineMonth, totalWalletMonth]);
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};
// ======================================DASHBOARD CHART YEAR FILTER======================================
const chartFilterYear = async (req, res) => {
  try {
    const totalCodYear = await order.countDocuments({
      status: "delivered",
      paymentMethod: "COD",
      deliveryDate: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) },
    });

    const totalOnlineYear = await order.countDocuments({
      status: "delivered",
      paymentMethod: "online_Payment",
      deliveryDate: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) },
    });

    const totalWalletYear = await order.countDocuments({
      status: "delivered",
      paymentMethod: "Wallet",
      deliveryDate: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) },
    });
    res.json([totalCodYear, totalOnlineYear, totalWalletYear]);
  } catch (error) {
    console.log(error.message);
    res.render("500");
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
  loadOrder,
  viewOrder,
  salesSort,
  downloadReport,
  weeklySalesDataEndpoint,
  chartFilterWeek,
  chartFilterMonth,
  chartFilterYear,
};
