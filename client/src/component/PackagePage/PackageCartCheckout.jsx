import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { getPackageCartThunk } from '../../redux/packageCartSlice';
import { BASE_URL, CouponAPI, PackageAPI } from '../../redux/API';
import DefaultNavbar from '../Default_Navbar';
import { ToastContainer } from 'react-toastify';
import toast from "react-hot-toast";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import Footer from '../Footer';

const PackageCartCheckout = () => {
    const dispatch = useDispatch();
    const cart = useSelector((state) => state.cart);
    const cart2 = cart.cart;
    console.log("cart2  ", cart2);
    // console.log("cart ", cart);
    // console.log("cart ", cart._id);

    const [allCart, setAllCart] = useState([]);
    const [detailedCartItems, setdetailedCartItems] = useState([]);
    const [overallTotal, setOverallTotal] = useState(0);
    const [cartId, setCartId] = useState("");

    let packageId = localStorage.getItem("packageId")
    let pricingFormat = localStorage.getItem("pricingFormat")

    const [singlePackageData, setSinglePackageData] = useState()

    const user = JSON.parse(localStorage.getItem("userInfo"));

    const headers = {
        Authorization: `Bearer ${user.accessToken}`,
        "Content-Type": "application/json",
    };


    useEffect(() => {
        // Handling Single Package Call
        const singlePackage = async () => {
            try {
                const response = await axios.get(
                    `${PackageAPI.getSinglePackage}/${packageId}`,
                    {
                        headers: headers,
                    }
                );

                if (response.data.success) {
                    toast.success("Fetched");
                    console.log("Single package data:", response?.data?.package);

                    const packageData = response?.data?.package

                    let total = 0;

                    if (pricingFormat === "halfYearly") {
                        total = packageData.packagePrice[0];
                    } else {
                        total = packageData.packagePrice[1];
                    }

                    setSinglePackageData(packageData)
                    setOverallTotal(total)

                } else {
                    // Notify failure
                    toast.error(response.data.msg);
                }

            } catch (error) {
                console.error("Error editing product:", error);
            }
        }
        singlePackage()
    }, [packageId, pricingFormat]);

    useEffect(() => {
        // Scroll to the top when the component mounts
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }, []);

    useEffect(() => {
        dispatch(getPackageCartThunk())
            .then((res) => {
                setCartId(res.payload.data.cartId);
                console.log(res.payload.data.cartId);
                setAllCart(res.payload.data.cart);
                setdetailedCartItems(res.payload.data.detailedCartItems);

                const total = res.payload.data.detailedCartItems.reduce(
                    (acc, item) => acc + item.itemTotal,
                    0
                );
                // setOverallTotal(total);

                return res;
            })
            .catch((err) => {
                return err.response;
            });
    }, []);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        country: "",
        address: "",
        city: "",
        pinCode: "",
    });

    // Function to handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const placeOrder = async () => {
        let accessToken = await JSON.parse(localStorage.getItem("userInfo"))
            .accessToken;
        try {
            const productsForOrder = cart2.map((item) => ({
                _id: item.product._id,
            }));
            const response = await fetch(`${BASE_URL}/order/create`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    // Pass the form data and possibly cart information
                    ...formData,
                    customer: `${formData.firstName} ${formData.lastName}`,
                    products: productsForOrder, // Add the products from the cart or relevant information
                    totalAmount: overallTotal, // Calculate total amount based on cart
                    shippingLocation: `${formData.address}, ${formData.city}, ${formData.pinCode}`,
                }),
            });

            const data = await response.json();
            if (!data) {
                console.log("error in placing order ");
                toast.error(data)
                return;
            }
            console.log("Order placed:", data);
            toast.success("Order placed successfully!!")

            const cartToDelete = cartId;
            deleteCart(cartToDelete)
            setFormData({
                firstName: "",
                lastName: "",
                email: "",
                phone: "",
                country: "",
                address: "",
                city: "",
                pinCode: "",
            });

            // Handle success/failure or redirect after order placement
        } catch (error) {
            console.error("Error placing order:", error);
            toast.error("Error occurred while placing order!!")
            // Handle error state
        }
    };

    const deleteCart = async (cartId) => {
        try {
            let accessToken = await JSON.parse(localStorage.getItem("userInfo"))
                .accessToken;

            const response = await fetch(
                `https://renting-carnival-api.onrender.com/cart/delete/${cartId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = await response.json();
            if (!data.success) {
                console.log("Error deleting cart");
                toast.error("Error deleting cart");
                return;
            }

            console.log("Cart deleted successfully");
            // Optionally handle success state or UI changes after cart deletion
        } catch (error) {
            console.error("Error occurred while deleting cart:", error);
            toast.error("Error occurred while deleting cart");
            // Handle error state
        }
    };


    const makePayment = async () => {
        const stripe = await loadStripe(
            "pk_test_51OUUpPSAXRW2sHukUtP8nHfxLnDC2pX0pgP0LdWW0BEUdWQh5txtBTux9yPvNiWGQYDyqYBqBOYhn4Ej1Con6LU300fMfqNxOi"
        );
        const body = {
            products: cart2,
            customer: {
                name: "John Doe",
                address: {
                    line1: "123 Main St",
                    city: "New Delhi",
                    state: "Delhi",
                    postal_code: "110043",
                    country: "IN",
                },
            },
            totalPrice: overallTotal
        };

        const user = JSON.parse(localStorage.getItem("userInfo"));

        const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.accessToken}`,
        };

        const res = await fetch(
            `${BASE_URL}/payment/checkout`,
            {
                method: "POST",
                headers: headers,
                body: JSON.stringify(body),
            }
        );

        const session = await res.json();
        const result = stripe.redirectToCheckout({
            sessionId: session.id,
        });

        if (result.error) {
            console.log(result.error);
        }
    };


    const [coupenCode, setCoupenCode] = useState("")
    const [displayStatus, setDisplayStatus] = useState("block")

    const handleCoupenVerification = async (coupenCode) => {
        console.log("entered coupen verification")
        try {
            const response = await axios.get(
                `${CouponAPI.getSingleCoupen}/${coupenCode}`
            );

            console.log("response of coupen verification ", response)

            if (response.data.success) {
                toast.success("Coupen Verfication Successful");
                // window.location.reload();
                // dispatch(getAllProductThunk());

                // Algorithm for appyling discount on price
                // let discount = response?.data?.coupen?.discount / 100 * overallTotal

                let discount = response?.data?.coupen?.discount / 100 * overallTotal

                let discountedPrice = overallTotal - discount
                setOverallTotal(discountedPrice)
                toast.success("Price Updated")

                setCoupenCode("")
                setDisplayStatus("hidden")

            } else {
                // Notify failure
                toast.error(response.data.msg);
            }
        } catch (error) {
            toast.error("Invalid or Expired Coupen")
            console.error("Error fetching coupen details:", error);
            // Handle error, notify user, etc.
        }
    };


    return (
        <>
            <DefaultNavbar />
            <div className="relative">
                <img
                    src="https://images.unsplash.com/photo-1524634126442-357e0eac3c14?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTZ8fHN0b3JlfGVufDB8fDB8fHww"
                    alt="shop"
                    className="w-screen h-80 blur-sm object-cover"
                />
                <h1 className="absolute top-2/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 bg-opacity-70 p-4">
                    <span className="text-white drop-shadow text-4xl font-bold">
                        Checkout
                    </span>
                </h1>
            </div>

            <div className="w-[90%] mx-auto flex flex-wrap my-10">
                <div className="w-full md:w-7/12">
                    <h1 className="text-2xl font-bold text-center my-4">
                        Billing details
                    </h1>
                    <div className="flex flex-wrap justify-between">
                        <div className="text-primary">
                            <div className="text-xs py-2">First Name</div>
                            <input
                                className="outline-none border-primary w-64 rounded-lg"
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                placeholder="First Name"
                                required="true"
                            />
                        </div>
                        <div className="text-primary">
                            <div className="text-xs py-2">Last Name</div>
                            <input
                                className="outline-none border-primary w-64 rounded-lg"
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                placeholder="Last Name"
                                required="true"
                            />
                        </div>
                    </div>
                    <div className="flex flex-wrap justify-between">
                        <div className="text-primary">
                            <div className="text-xs py-2">Email</div>
                            <input
                                className="outline-none border-primary w-64 rounded-lg"
                                type="text"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Email"
                                required="true"
                            />
                        </div>
                        <div className="text-primary">
                            <div className="text-xs py-2">Phone</div>
                            <input
                                className="outline-none border-primary w-64 rounded-lg"
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="Phone"
                                required="true"
                            />
                        </div>
                    </div>
                    <div>
                        <div className="text-primary">
                            <div className="text-xs py-2 ">Country</div>
                            <input
                                className="w-full outline-none border-primary rounded-lg"
                                type="text"
                                name="country"
                                value={formData.country}
                                onChange={handleInputChange}
                                placeholder="Country"
                                required="true"
                            />
                        </div>
                    </div>
                    <div>
                        <div className="text-primary">
                            <div className="text-xs py-2 ">Street Address</div>
                            <input
                                className="w-full outline-none border-primary rounded-lg"
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                placeholder="Address"
                                required="true"
                            />
                        </div>
                    </div>
                    <div>
                        <div className="text-primary">
                            <div className="text-xs py-2 ">City</div>
                            <input
                                className="w-full outline-none border-primary rounded-lg"
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                placeholder="City"
                                required="true"
                            />
                        </div>
                    </div>
                    <div>
                        <div className="text-primary">
                            <div className="text-xs py-2 ">Pin Code</div>
                            <input
                                className="w-full outline-none border-primary rounded-lg"
                                type="text"
                                name="pinCode"
                                value={formData.pinCode}
                                onChange={handleInputChange}
                                placeholder="Pin Code"
                                required="true"
                            />
                        </div>
                    </div>
                </div>
                <div className="bg-primary rounded-lg md:my-0 my-8 mx-auto w-full md:w-4/12 h-max text-white">
                    <div className="text-2xl font-bold text-center p-4">Cart Total</div>
                    <div className="w-[90%] mx-auto font-bold max-w-xs">
                        {cart2 &&
                            cart2.map((card, index) => (
                                <div className="flex justify-between max-w-[200px] mx-auto">
                                    <span>{card.product.name}</span>
                                    <span>{card.product.price}</span>
                                </div>
                            ))}
                    </div>
                    <div className="text-center mt-4 font-bold max-w-xs">
                        Total : {overallTotal}
                    </div>


                    <div className={`flex flex-col gap-4 items-center justify-center mt-6 w-full text-black ${displayStatus}`}>
                        <h2 className="text-sm">Do you have any Coupen Code ?</h2>
                        <input className="w-[45%] rounded-lg p-2" onChange={(e) => setCoupenCode(e.target.value)} value={coupenCode} name="coupenCode" id="coupenCode" />
                        <p className="text-xs bg-white p-2 rounded-lg cursor-pointer hover:scale-[1.06] transition-all duration-200 text-black" onClick={() => handleCoupenVerification(coupenCode)}>Apply</p>
                    </div>



                    <div className="text-center">
                        <button className="text-primary bg-white px-4 py-2 rounded-lg my-6 hover:scale-110 duration-200 block w-fit mx-auto" onClick={makePayment}>
                            Online Payment
                        </button>
                        <button className="text-primary bg-white px-4 py-2 rounded-lg my-6 hover:scale-110 duration-200 block w-fit mx-auto" onClick={placeOrder}>
                            Cash on Delivery
                        </button>
                    </div>
                </div>
            </div>
            <ToastContainer />
            <Footer />
        </>
    );
}

export default PackageCartCheckout
