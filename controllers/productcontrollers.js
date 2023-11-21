const { render } = require("ejs");
const product = require("../models/productmodel")
const category=require("../models/catogerymodel")
const Sharp = require('sharp');







//============================LOAD ADD PRODUCT PAGE=============================

const loadAddProduct = async (req, res) => {
    try {
        // let nameAlready = req.session.proNameAlready;
        const data = await category.find({ blocked: 0 });
        console.log(data)
        res.render("admin/addproducts",{lay:false,catData:data});
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};


const loadproducts=async(req,res)=>{
    try {
        res.render('admin/product',{lay:false,products:""})

    } catch (error) {
        console.log(error)
    }

}



const addProduct = async (req, res) => {
  const already = await product.findOne({ name: req.body.name });
  if(!already){
    req.session.proNameAlready = true;
    res.redirect('/admin/addProduct')
  }else{
    let details = req.body;
    const files = await req.files;

    const img = [
      files.image1[0].filename,
      files.image2[0].filename,
      files.image3[0].filename,
      files.image4[0].filename,
    ];

    for (let i = 0; i < img.length; i++) {
      await Sharp("public/products/images/" + img[i])
        .resize(500, 500)
        .toFile("public/products/crop/" + img[i]);
    }

    let products = new product({
      name: details.name,
      price: details.price,
      quantity: details.quantity,
      category: details.category,
      description: details.description,
      blocked: 0,
      "images.image1": files.image1[0].filename,
      "images.image2": files.image2[0].filename,
      "images.image3": files.image3[0].filename,
      "images.image4": files.image4[0].filename,
    });

    let result = await products.save();
    res.redirect("/admin/users");
  }
  };

module.exports = {
    loadAddProduct,
    loadproducts,
    addProduct

}