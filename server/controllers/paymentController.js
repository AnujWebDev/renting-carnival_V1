const stripe = require("stripe")(process.env.STRIPE_SECRET);
const { ErrorHandler } = require("../middleware/errorHandler");
const Cart = require("../models/cartModel");
const Package = require("../models/packageModel");
const User = require("../models/userModel");

const paymentMethod = async (req, res, next) => {
  console.log("Inside paymetn Method")
  const { products, customer, totalPrice } = req.body;

  console.log("porducts body", products)

  const userId = req.user._id;

  // const lineItems = products.map((product) => ({
  //   price_data: {
  //     currency: "inr",
  //     product_data: {
  //       name: product.product.name,
  //     },
  //     unit_amount: Math.round(product.product.price * 100),
  //   },
  //   quantity: product.quantity,
  // }));

  const lineItems = [
    {
      price_data: {
        currency: "inr",
        product_data: {
          name: "Product Name"
        },
        unit_amount: Math.round(totalPrice * 100),
      },
      quantity: 1
    }
  ]

  console.log("line items ", lineItems);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",

    shipping_address_collection: {
      allowed_countries: ["IN"],
    },
    success_url: "https://main.dsct631z4l0hh.amplifyapp.com/",
    cancel_url: "https://main.dsct631z4l0hh.amplifyapp.com/",
  });

  let cart = await Cart.findOne({ user: userId });

  console.log(session.id);

  if (session.id) {
    if (cart) {
      cart.items = [];
      await cart.save();
      console.log("cart deleted");
    }
  }
  return res.json({ id: session.id });
};

const paymentMethodPackage = async (req, res, next) => {
  try {
    const { packageId, package } = req.body;

    const userId = req.user._id;

    const selectedPackage = await Package.findById(packageId);
    if (!selectedPackage) {
      next(new ErrorHandler(400, "package not found"));
    }

    // const lineItems = selectedPackage.durations.map((duration) => ({
    //   price_data: {
    //     currency: "inr",
    //     product_data: {
    //       name: ${selectedPackage.name} - ${duration.durationType} (${duration.price} INR),
    //     },
    //     unit_amount: Math.round(duration.price * 100),
    //   },
    //   quantity: 1,
    // }));


    const lineItems = [
      {
        price_data: {
          currency: "inr",
          product_data: {
            name: `${selectedPackage.name}`,
          },
          unit_amount: Math.round(selectedPackage.price * 100),
        },
        quantity: 1,
      },
    ];

    console.log("line items ", lineItems);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",

      shipping_address_collection: {
        allowed_countries: ["IN"],
      },
      success_url: "https://main.dsct631z4l0hh.amplifyapp.com/",
      cancel_url: "https://main.dsct631z4l0hh.amplifyapp.com/",
    });

    console.log("session ", session.id);

    // if (session.id) {
    //   await User.findByIdAndUpdate(
    //     userId,
    //     { $push: { boughtPackages: selectedPackage._id } },
    //     { new: true }
    //   );
    // }
    res.status(200).json({
      success: true,
      msg: "Package bought",
      id: session.id,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

module.exports = {
  paymentMethod,
  paymentMethodPackage,
};
