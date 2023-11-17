const user = require("../models/usermodel")
const bcrypt = require("bcrypt");
const { render } = require("ejs");
const nodemailer = require("nodemailer")
let otp;



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
        res.render('user/usersignup', { lay: false })
    } catch (error) {
        console.log(error.massage)
    }
}

// =====================userinsert==================
const generateOTP = async () => {
    return Math.floor(100000 + Math.random() * 900000);
  };

const insertuser = async (req, res) => {
    const spassword = await securepassword(req.body.password)
    try {
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
            otp= await generateOTP()
            req.session.userId = savedUser._id;
            req.session.userOTP = otp;
            console.log(req.session.userOTP)
            //calling email verification
            sendVerifyMail(req.body.name, req.body.email, otp);
            
            res.render('user/otp', { lay: false,errorMessage:"" })
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: error.message }); // Handle the error and respond with an error status
    }
};


// =====================loadhome==================

const loadhome = async (req, res) => {
    try {

        res.render('user/home', { lay: true })
    } catch (error) {
        console.log(error.massage)
    }
}

// =====================loadhome==================

const loadLogin = async (req, res) => {
    try {
        res.render('user/userlogin', { lay: false })
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
            if (passwordmatch) {
                if (userdata.is_verified === 0) {
                    res.render('user/otp', { lay: false })
                } else {
                    req.session.user_id = userdata._id
                    res.render('user/home', { lay: true })
                }

            } else {
                console.log("incorect password")
            }

        } else {
            console.log("email and password is incorrect")
        }

    } catch (error) {
        console.log(error.massage)
    }
}

const otpvarify=async(req,res)=>{
    try {
        const enterdotp=parseInt(req.body.otp)
        const userId = req.session.userId;
        const sendotp=req.session.userOTP;
        
        if (enterdotp === sendotp ) {
            // Update user's is_verified status to indicate successful verification
            await user.updateOne({ _id: userId }, { $set: { is_verified: 1 } });

            // Clear session variables after successful verification
            req.session.userId = null;
            
            req.session.userOTP = null;

            res.render('user/home',{lay:true});
        } else {
            res.render('user/otp', { lay: false, errorMessage: 'Invalid OTP. Please try again.' });
        }
        
    } catch (error) {
        console.log(error)
    }
}




module.exports = {
    loadsign_up,
    insertuser,
    loadhome,
    loadLogin,
    loadvarify,
    login,
    securepassword,
    otpvarify

}