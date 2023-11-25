const { render } = require("ejs");
const product = require("../models/productmodel")
const category = require("../models/catogerymodel")
const Sharp = require('sharp');


//============================LOAD ADD PRODUCT PAGE=============================

const loadProductdetails = async (req, res) => {
  try {
    const id=req.query.id
    const details=await product.findOne({_id:id})
    res.render('user/product-detail',{lay:true,productdet:details,name:req.session.name})
    
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};




//============================LOAD ADD PRODUCT PAGE=============================

const loadAddProduct = async (req, res) => {
  try {
    // let nameAlready = req.session.proNameAlready;
    const data = await category.find({ blocked: 0 });
    res.render("admin/addproducts", { lay: false, catData: data });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};


const loadproducts = async (req, res) => {
  try {
    const products = await product.find()
    res.render('admin/product', { lay: false, products: products })

  } catch (error) {
    console.log(error)
  }

}



const addProduct = async (req, res) => {
  try {
    const already = await product.findOne({ name: req.body.name });
    if (already) {
      req.session.proNameAlready = true;
      res.redirect('/admin/addProduct')
    } else {
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
      res.redirect("/admin/products");
    }
  } catch (error) {
    console.log(error)
  }
};

const blockproduct = async (req, res) => {
  try {
    const productid = req.query.id;
    const products = await product.findOne({ _id: productid })
    if (products.blocked === 0) {
      await product.updateOne({ _id: req.query.id }, { $set: { blocked: 1 } });
      res.redirect('/admin/products')
    } else {

      res.redirect('/admin/products')
    }
  } catch (error) {
    console.log(error)
  }
}

const unblockproduct = async (req, res) => {
  try {
    const productid = req.query.id;
    const products = await product.findOne({ _id: productid })
    if (products.blocked !== 0) {
      await product.updateOne({ _id: req.query.id }, { $set: { blocked: 0 } });
      res.redirect('/admin/products')
    } else {

      res.redirect('/admin/products')
    }

  } catch (error) {
    console.log(error)
  }
}



const loadeditproduct=async(req,res)=>{
  try {
    const productid=req.query.id;
    const products = await product.findOne({ _id: productid })
    const categorys=await category.find()
    res.render('admin/editproducts',{lay:false,products:products,category:categorys})

  } catch (error) {
    console.log(error)
  }
}


const editproduct=async(req,res)=>{
  try {
    const productid = req.query.id;
    const products = await product.findOne({ _id: productid })
    if (products.blocked !== 0) {
      await product.updateOne({ _id: req.query.id }, { $set: { blocked: 0 } });
      res.redirect('/admin/products')
    } else {

      res.redirect('/admin/products')
    }

  } catch (error) {
    console.log(error)
  }
}



module.exports = {
  loadAddProduct,
  loadproducts,
  addProduct,
  blockproduct,
  unblockproduct,
  editproduct,
  loadeditproduct,
  loadProductdetails

}