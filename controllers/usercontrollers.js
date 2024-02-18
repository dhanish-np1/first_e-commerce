const user = require("../models/usermodel");
const product = require("../models/productmodel");
const bcrypt = require("bcrypt");
const { render } = require("ejs");
const nodemailer = require("nodemailer");
var otp;

// =====================otp expire==================
function otpExpirationTimer() {
  setTimeout(() => {
    const nul = null;
    otp = nul;
    console.log("OTP expired");
  }, 600000);
}

// =====================loadshop==================
const loadShop = async (req, res) => {
  try {
    const products = await product.find({blocked:0}).populate("offer");
    res.render("user/product", {
      lay: true,
      products: products,
      name: req.session.name,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};

// =====================password hashing==================

const securePassword = async (password) => {
  try {
    const passwordhash = await bcrypt.hash(password, 10);
    return passwordhash;
  } catch (error) {
    console.log(error.massage);
  }
};

// =====================loadSign_up==================
const loadSign_up = async (req, res) => {
  try {
    const message = req.session.errorMessage;
    req.session.errorMessage = "";
    res.render("user/usersignup", { lay: false, errorMessage: message });
  } catch (error) {
    console.log(error.massage);
  }
};

// =====================userinsert==================
const generateOTP = async () => {
  return Math.floor(100000 + Math.random() * 900000);
};

const insertUser = async (req, res) => {
  try {
    console.log("hey");
    const email = req.body.email;
    const mobile = req.body.number;
    const password = req.body.password;
    const name = req.body.name;
    const conpass = req.body.conpassword;
    console.log(req.body);
    if (name.length <= 2) {
      return res.json({
        success: false,
        errorMessage: "name should be more than 2 charectors",
      });
    } else {
      // Check if the email is empty
      if (
        email.trim() === "" &&
        mobile.trim() === "" &&
        password.trim() === "" &&
        name.trim() === ""
      ) {
        return res.json({
          success: false,
          errorMessage: "some field is empty",
        });
      } else {
        // Email validation using a regular expression
        var emailPattern = /^[a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
        if (!emailPattern.test(email)) {
          return res.json({
            success: false,
            errorMessage: "please give a valid email Id",
          });
        } else {
          // Mobile number validation (assumes a 10-digit number)
          var mobilePattern = /^\d{10}$/;
          if (!mobilePattern.test(mobile) || mobile === "0000000000") {
            return res.json({
              success: false,
              errorMessage: "please give a valid phone number",
            });
          } else {
            // Password validation (assumes a minimum length of 4 characters)
            const hasUppercase = /[A-Z]/.test(password);
            const hasLowercase = /[a-z]/.test(password);
            const hasNumber = /\d/.test(password);
            const hasSpecialChar = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/.test(
              password
            );

            if (
              password.length < 6 ||
              !(hasUppercase && hasLowercase && hasNumber && hasSpecialChar)
            ) {
              return res.json({
                success: false,
                errorMessage:
                  "password need more than 6 and need special charecters",
              });
            } else {
              if (password !== conpass) {
                return res.json({
                  success: false,
                  errorMessage: "password and conform password is not equal",
                });
              } else {
                // If all validations pass, you can proceed with the signup process
                //check the email which is already exist
                const checkEmail = await user.findOne({
                  email: req.body.email,
                });
                if (checkEmail) {
                  return res.json({
                    success: false,
                    errorMessage: "this email is already exist",
                  });
                } else {
                  const spassword = await securePassword(req.body.password);
                  const User = new user({
                    fullname: req.body.name,
                    email: req.body.email,
                    number: req.body.number,
                    password: spassword,
                    is_verified: 0,
                    is_block: 0,
                  });

                  const savedUser = await User.save(); // Save the user to the databas
                  console.log("User inserted successfully:", savedUser);

                  if (savedUser) {
                    otp = await generateOTP();
                    console.log(otp);
                    req.session.userId = savedUser._id;

                    req.session.email = savedUser.email;
                    //calling email verification
                    sendVerifyMail(req.body.name, req.body.email, otp);
                    otpExpirationTimer();

                    return res.json({
                      success: true,
                      message: "User successfully registered.",
                      userId: savedUser._id,
                      // Add any other relevant information you want to return
                    });
                  }
                }
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

// =====================loadhome==================

const loadHome = async (req, res) => {
  try {
    console.log(req.session);
    const products = await product.find({ blocked: 0 }).populate("offer");
    const log = req.session.user_id;
    console.log(products);
    res.render("user/home", {
      lay: true,
      islogin: log,
      products: products,
      name: req.session.name,
    });
  } catch (error) {
    console.log(error.massage);
  }
};

// =====================loadhome==================

const loadLogin = async (req, res) => {
  try {
    res.render("user/userlogin", { lay: false });
  } catch (error) {
    console.log(error.massage);
  }
};
// =====================loadotp==================

const loadVarify = async (req, res) => {
  try {
    res.render("user/otp", { lay: false });
  } catch (error) {
    console.log(error.massage);
  }
};
// =====================send varify mail==================
const sendVerifyMail = async (name, email, otp) => {
  try {
    console.log("mail sent");
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: "dhanishnp6@gmail.com",
        pass: "uxnd beho hvwz ysmt",
      },
    });

    const mailOption = {
      from: "dhanishnp6@gmail.com",
      to: email,
      subject: "for email verification",
      html: `<h3>Dear ${name},</h3>
                   <p>Use this One Time Password:</p>
                   <h1>${otp}</h1>
                   <p>to verify your FurniCube Account.</p>`,
    };

    const info = await transporter.sendMail(mailOption);
    console.log("Email has been sent to", email, info.response);
  } catch (error) {
    console.error("Error in sendVerifyMail:", error);
  }
};

// =====================sign-up==================
const login = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const userdata = await user.findOne({ email: email });
    if (userdata) {
      const passwordmatch = await bcrypt.compare(password, userdata.password);
      if (passwordmatch && userdata.is_block === 0) {
        if (userdata.is_verified === 0) {
          otp = await generateOTP();
          req.session.name = userdata.fullname;
          req.session.userId = userdata._id;

          sendVerifyMail(req.body.name, req.body.email, otp);
          otpExpirationTimer();
          res.json({ success: true, redirectTo: "/otp" });
        } else {
          const productes = await product.find({ blocked: 0 });
          req.session.user_id = userdata._id;
          req.session.name = userdata.fullname;
          return res.json({
            success: true,
            redirectTo: "/home",
            productes,
            name: req.session.name,
          });
        }
      } else {
        return res.json({
          success: false,
          errorMessage: "Username and password do not match",
        });
      }
    } else {
      return res.json({
        success: false,
        errorMessage: "Username and password do not match",
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const otpVarify = async (req, res) => {
  try {
    const enterdotp = parseInt(req.body.otp);
    const userId = req.session.userId;
    req.session.user_id = console.log(otp);
    if (enterdotp === otp) {
      // Update user's is_verified status to indicate successful verification
      await user.updateOne({ _id: userId }, { $set: { is_verified: 1 } });
      // Clear session variables after successful verification
      req.session.name = true;
      req.session.user_id = userId;
      req.session.userId = null;
      req.session.userOTP = null;
      return res.json({
        success: true,
        message: "otp matched",
      });
    } else {
      return res.json({
        success: false,
        errorMessage: "invalid otp",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const userLogout = async (req, res) => {
  try {
    req.session.name = false;
    req.session.user_id = false;
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

//==================================RESEND OTP===================================================

const resendOtp = async (req, res) => {
  try {
    clearTimeout(otpExpirationTimer);
    otpExpirationTimer();
    console.log("otp resended");
    const newotp = await generateOTP();
    otp = newotp;
    console.log(newotp);
    console.log(otp);
    sendVerifyMail(req.session.name, req.session.email, otp);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

//==================================Forgot password===================================================
const loadForgotPassword = async (req, res) => {
  try {
    res.render("user/forgotPassword", { lay: true, name: req.session.name });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const forgotPassword = async (req, res) => {
  try {
    console.log(req.body);
    console.log(req.session);
    const email = req.body.email;
    const chekEmail = await user.findOne({ email: email });
    if (email.trim() == "") {
      return res.json({
        success: false,
        errorMessage: "plase enter your email",
      });
    }
    if (chekEmail) {
      req.session.email = email;
      otp = await generateOTP();
      sendForgotOtp(email, otp);
      otpExpirationTimer();
      return res.json({ success: true, errorMessage: "" });
    } else {
      res.json({ success: false, errorMessage: "this email not exist" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
const loadOtpForgot = async (req, res) => {
  try {
    res.render("user/forgotPassOtp", { lay: false });
  } catch (error) {
    console.log(error.massage);
  }
};

const sendForgotOtp = async (email, otp) => {
  try {
    console.log("mail sent");
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: "dhanishnp6@gmail.com",
        pass: "uxnd beho hvwz ysmt",
      },
    });

    const mailOption = {
      from: "dhanishnp6@gmail.com",
      to: email,
      subject: "onetime password for change password",
      html: `<h3>Dear,</h3>
                   <p>Use this One Time Password:</p>
                   <h1>${otp}</h1>
                   <p>to change your password.</p>`,
    };

    const info = await transporter.sendMail(mailOption);
    console.log("Email has been sent to", email, info.response);
  } catch (error) {
    console.error("Error in sendVerifyMail:", error);
  }
};

const resendForgotOtp = async (req, res) => {
  try {
    clearTimeout(otpExpirationTimer);
    otpExpirationTimer();
    console.log("otp resended");
    const newotp = await generateOTP();
    otp = newotp;
    console.log(newotp);
    console.log(otp);
    sendForgotOtp(req.session.email, otp);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const varifyForgotOtp = async (req, res) => {
  try {
    const Otp = req.body.otp;
    if (otp == Otp) {
      res.json({ success: true, errorMessage: "" });
    } else {
      res.json({ success: false, errorMessage: "invalid otp" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const loadResetPassword = async (req, res) => {
  try {
    res.render("user/resetPassword", { lay: false, name: req.session.name });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const ResetPassword = async (req, res) => {
  try {
    console.log('working');
    const password = req.body.password;
    const conPassword = req.body.conPassword;
    const userData = await user.findOne({ email: req.session.email });
    console.log(userData);
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/.test(password);
    if (password.trim() === "" || conPassword.trim() === "") {
      return res.json({
        success: false,
        errorMessage: "please fill all fields",
      });
    } else if (
      password.length < 6 ||
      !(hasUppercase && hasLowercase && hasNumber && hasSpecialChar)
    ) {
      return res.json({
        success: false,
        errorMessage:
          "password need more than 6 and need special charecters and uper case and lower case",
      });
    } else if (password !== conPassword) {
      return res.json({
        success: false,
        errorMessage: "password and conform password is not equal",
      });
    }

    const passwordhash = await bcrypt.hash(password, 10);
    const updatedData = await user.updateOne(
      { email: req.session.email },
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
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
module.exports = {
  loadSign_up,
  insertUser,
  loadHome,
  loadLogin,
  loadVarify,
  login,
  securePassword,
  otpVarify,
  loadShop,
  userLogout,
  resendOtp,
  loadForgotPassword,
  forgotPassword,
  loadOtpForgot,
  resendForgotOtp,
  varifyForgotOtp,
  loadResetPassword,
  ResetPassword,
};
