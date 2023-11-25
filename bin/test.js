const insertuser = async (req, res) => {
    try {
        console.log('hey');
        const email = req.body.email;
        const mobile = req.body.number;
        const password = req.body.password;
        const name = req.body.name;
        const conPass = req.body.con_password
        if (name.length <= 2) {
            res.json({ name: true })
        } else {
            // Check if the email is empty
            if (email.trim() === "" && mobile.trim() === "" && password.trim() === "" && name.trim() === "" && conPass.trim() === "") {
                res.json({ require: true })
            } else {
                // Email validation using a regular expression
                var emailPattern = /^[a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
                if (!emailPattern.test(email)) {
                    res.json({ emailPatt: true })
                } else {
                    // Mobile number validation (assumes a 10-digit number)
                    var mobilePattern = /^\d{10}$/;
                    if (!mobilePattern.test(mobile) || mobile === "0000000000") {
                        res.json({ mobile: true })
                    } else {
                        // Password validation (assumes a minimum length of 4 characters)
                        if (password.length < 4) {
                            res.json({ password: true })
                        } else {
                            // If all validations pass, you can proceed with the signup process
                            //check the email which is already exist
                            const checkEmail = await User.findOne({ email: req.body.email });
                            if (checkEmail) {
                                res.json({ emailalready: true })
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
                                    console.log(req.session.userOTP)
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






const nsertuser = async (req, res) => {
    const email = req.body.email;
    const mobile = req.body.number;
    const password = req.body.password;
    const name = req.body.name;
    const conPass = req.body.con_password

    if (name.length <= 2) {
        req.session.errorMessage = 'Name should be more than 2 characters';
        return res.redirect('/sign-up')
    }


    try {
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
            console.log(req.session.userOTP)
            //calling email verification
            sendVerifyMail(req.body.name, req.body.email, otp);

            res.render('user/otp', { lay: false, errorMessage: "" })
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: error.message }); // Handle the error and respond with an error status
    }
};