const admin=require("../models/adminmodel")
const user=require("../models/usermodel")
const { render } = require("ejs");
const bcrypt=require("bcrypt");
const category=require("../models/catogerymodel")

const loadadmin=async(req,res)=>{
    try {
        res.render('admin/adminlogin',{lay:false,noteq:''})

    } catch (error) {
        console.log(error)
    }

}




const loadcatogery=async(req,res)=>{
    try {
        const categories = await category.find();
        res.render('admin/category',{lay:false,cats: categories,same:""})

    } catch (error) {
        console.log(error)
    }

}


const loadusers=async(req,res)=>{
    try {
        const userdata=await user.find()
        res.render('admin/users',{lay:false,users:userdata})

    } catch (error) {
        console.log(error)
    }

}

const loaddashboard=async(req,res)=>{
    try {
        res.render('admin/dashboard',{lay:false})

    } catch (error) {
        console.log(error)
    }

}

const adminlogin=async(req,res)=>{
    try {
        const email=req.body.email;
        const password=req.body.password;

        const userdata=await admin.findOne({email:email})
        if(userdata){
            const passwordmatch=await bcrypt.compare(password,userdata.password)
            if(passwordmatch){
                res.render('admin/dashboard',{lay:false})
            }else{
                const unequal="Email and password is not match"
            res.render('admin/adminlogin',{lay:false,noteq:unequal})
            }
            

        }else{
            const unequal="Email and password is not match"
            res.render('admin/adminlogin',{lay:false,noteq:unequal})
        }
        
    } catch (error) {
        console.log(error.massage)
    }
}
const addcategory = async (req, res) => {
    try {
        const cat = req.body.newcategory;

        // Use findOne to check if the category already exists
        const existingCategory = await category.findOne({ name: cat });

        if (existingCategory) {
            const categories = await category.find();
            const err = "This category name already exists. Please try another one.";
            res.render('admin/category', { lay: false, same: err, cats: categories });
        } else {
            const newCategory = new category({
                name: cat,
                
            });

    
            await newCategory.save();

            const categories = await category.find();
            res.render('admin/category', { lay: false, same: "", cats: categories });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error'); // Sending an error response to the client
    }
};

const blockcat=async(req,res)=>{
    try {
        const categoryId = req.query.id;
        const cato=await category.findOne({_id:categoryId})
        if (cato.blocked == 0) {
            await category.updateOne({ _id: req.query.id }, { $set: { blocked: 1 } });
            res.redirect('/admin/catogery')
          } else {
            await category.updateOne({ _id: req.query.id }, { $set: { blocked: 0 } });
            res.redirect('/admin/catogery')
          }
        
    } catch (error) {
     console.log(error)   
    }
}



const editcat = async (req, res) => {
    try {
      const categoryId = req.body._id;
      const name = req.body.newname;
  
      // Use findOneAndUpdate for atomic updates
      const updatedCategory = await category.findOneAndUpdate(
        { _id: categoryId },
        { $set: { name: name } },
        { new: true } // Return the updated document
      );
        res.redirect('/admin/catogery')
      
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  };


const blockuser=async(req,res)=>{
    try {
        const userId = req.query.id;
        const User=await user.findOne({_id:userId})
        if (User.is_block=== 0) {
            await user.updateOne({ _id: req.query.id }, { $set: { is_block: 1 } });
            res.redirect('/admin/users')
          } else {
            await user.updateOne({ _id: req.query.id }, { $set: { is_block: 0 } });
            res.redirect('/admin/users')
          }

        
    } catch (error) {
        console.log(error)
    }

}










module.exports={
    loadadmin,
    loadcatogery,
    loadusers,
    loaddashboard,
    adminlogin,
    addcategory,
    blockcat,
    editcat,
    blockuser,
    

    
    

}











// const insertadmin = async (req, res) => {
//     const spassword = await securepassword(req.body.password);
//     try {
//       // Assuming you have a model named 'Admin'
//       const Admin = new admin({
//         name: req.body.name,
//         email: req.body.email,
//         password: spassword,
//         is_admin: 0,
//       });
  
//       // Save the user to the database
//       const savedUser = await Admin.save(); // Use 'adminUser' instead of 'User'
//       console.log('User inserted successfully:', savedUser);
  
//       res.status(200).json({ message: 'User inserted successfully', user: savedUser });
//     } catch (error) {
//       console.error('Error inserting user:', error);
//       res.status(500).json({ error: error.message });
//     }
//   };
  