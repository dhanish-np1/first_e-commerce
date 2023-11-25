const user = require("../models/usermodel")
const product = require("../models/productmodel")
const bcrypt = require("bcrypt");
const { render } = require("ejs");
const nodemailer = require("nodemailer")
let otp;


// =====================loadshop==================
const loadshop = async (req, res) => {
    try {
        const products = await product.find()
        res.render('user/product', { lay: true, products: products,name:req.session.name })

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: error.message });
    }
}


// =====================password hashing==================

const securepassword = async (password) => {
    try {
        const passwordhash = await bcrypt.hash(password, 10)
        return passwordhash
    } catch (error) {
        console.log(error.massage)
    }

}


// =====================loadsign_up==================
const loadsign_up = async (req, res) => {
    try {
        const message = req.session.errorMessage;
        req.session.errorMessage = ''
        res.render('user/usersignup', { lay: false, errorMessage: message })
    } catch (error) {
        console.log(error.massage)
    }
}

// =====================userinsert==================
const generateOTP = async () => {
    return Math.floor(100000 + Math.random() * 900000);
};

const insertuser = async (req, res) => {
    try {
        console.log('hey');
        const email = req.body.email;
        const mobile = req.body.number;
        const password = req.body.password;
        const name = req.body.name;
        if (name.length <= 2) {
            req.session.errorMessage = 'name should be more than 2 charecters';
            return res.redirect('/sign-up')
        } else {
            // Check if the email is empty
            if (email.trim() === "" && mobile.trim() === "" && password.trim() === "" && name.trim() === "") {
                req.session.errorMessage = 'some field is empty';
                return res.redirect('/sign-up')

            } else {
                // Email validation using a regular expression
                var emailPattern = /^[a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
                if (!emailPattern.test(email)) {
                    req.session.errorMessage = 'please give a valid email';
                    return res.redirect('/sign-up')
                } else {
                    // Mobile number validation (assumes a 10-digit number)
                    var mobilePattern = /^\d{10}$/;
                    if (!mobilePattern.test(mobile) || mobile === "0000000000") {
                        req.session.errorMessage = 'please give a valid mobile number';
                        return res.redirect('/sign-up')
                    } else {
                        // Password validation (assumes a minimum length of 4 characters)
                        if (password.length < 4) {
                            req.session.errorMessage = 'please give a strong password';
                            return res.redirect('/sign-up')
                        } else {
                            // If all validations pass, you can proceed with the signup process
                            //check the email which is already exist
                            const checkEmail = await user.findOne({ email: req.body.email });
                            if (checkEmail) {
                                req.session.errorMessage = 'this email already exist';
                                return res.redirect('/sign-up')
                            } else {

                                const spassword = await securepassword(req.body.password)
                                const User = new user({
                                    fullname: req.body.name,
                                    email: req.body.email,
                                    number: req.body.number,
                                    password: spassword,
                                    is_verified: 0,
                                    is_admin: 0,
                                    is_block: 0,
                                });

                                const savedUser = await User.save(); // Save the user to the databas
                                console.log('User inserted successfully:', savedUser);

                                if (savedUser) {
                                    console.log(savedUser)
                                    otp = await generateOTP()
                                    req.session.userId = savedUser._id;
                                    req.session.userOTP = otp;
                                    req.session.name=savedUser.fullname
                                    //calling email verification
                                    sendVerifyMail(req.body.name, req.body.email, otp);

                                    res.render('user/otp', { lay: false, errorMessage: "" })
                                }



                            }
                        }
                    }
                }
            }
        }


    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};


// =====================loadhome==================

const loadhome = async (req, res) => {
    try {
        const products = await product.find({ blocked: 0 })
        const log = req.session.user_id
        res.render('user/home', { lay: true, islogin: log, products: products,name:req.session.name })
    } catch (error) {
        console.log(error.massage)
    }
}

// =====================loadhome==================

const loadLogin = async (req, res) => {
    try {
        const data = req.session.errorMessage
        req.session.errorMessage = ''
        res.render('user/userlogin', { lay: false, notmatchpass: data })
    } catch (error) {
        console.log(error.massage)
    }
}


// =====================varify==================
const loadvarify = async (req, res) => {
    try {
        res.render('user/otp', { lay: false })
    } catch (error) {
        console.log(error.massage)
    }
}
// =====================send varify mail==================
const sendVerifyMail = async (name, email, otp) => {
    try {
        console.log("mail sent");
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: 'dhanishnp6@gmail.com',
                pass: 'uxnd beho hvwz ysmt',
            }
        });

        const mailOption = {
            from: 'dhanishnp6@gmail.com',
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

        const userdata = await user.findOne({ email: email })
        if (userdata) {
            const passwordmatch = await bcrypt.compare(password, userdata.password)
            if (passwordmatch && userdata.is_block === 0) {
                if (userdata.is_verified === 0) {
                    
                    otp = await generateOTP()
                    req.session.key=userdata.fullname
                    req.session.name=userdata.fullname
                    req.session.userId = userdata._id;
                    req.session.userOTP = otp;
                    req.session.name=userdata.name
                    sendVerifyMail(req.body.name, req.body.email, otp);
                    res.render('user/otp', { lay: false,errorMessage:'' })

                } else {

                    req.session.user_id = userdata._id;
                    req.session.name=userdata.fullname
                    const productes=await product.find({blocked:0})
                    res.render('user/home', { lay: true ,products:productes,name:req.session.name })
                }

            } else {
                req.session.errorMessage = "user name and password dose not match"
                res.redirect('/login')
            }

        } else {
            req.session.errorMessage = "user name and password dose not match"
            res.redirect('/login')
        }

    } catch (error) {
        console.log(error.massage)
    }
}

const otpvarify = async (req, res) => {
    try {
        const enterdotp = parseInt(req.body.otp)
        const userId = req.session.userId;
        const sendotp = req.session.userOTP;
        if (enterdotp === sendotp) {
            // Update user's is_verified status to indicate successful verification
            await user.updateOne({ _id: userId }, { $set: { is_verified: 1 } });
            const name=user.findOne({name:userId})

            // Clear session variables after successful verification
            req.session.userId = null;
            req.session.name=true;
            req.session.userOTP = null;
            const productes=await product.find({blocked:0})

            res.render('user/home', { lay: true,products:productes,name:req.session.name });
        } else {
            res.render('user/otp', { lay: false, errorMessage: 'Invalid OTP. Please try again.' });
        }

    } catch (error) {
        console.log(error)
    }
}

const userLogout = async (req, res) => {
    try {
        req.session.name = false;
        req.session.otp = false;

        res.redirect("/");
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};




module.exports = {
    loadsign_up,
    insertuser,
    loadhome,
    loadLogin,
    loadvarify,
    login,
    securepassword,
    otpvarify,
    loadshop,
    userLogout

}