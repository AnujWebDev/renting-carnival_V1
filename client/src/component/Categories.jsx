import React, { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { getAllCategoryThunk } from "../redux/categorySlice";
import { useDispatch } from "react-redux";

const Categories = () => {
  const [allCategories, setAllCategories] = useState([]);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllCategoryThunk())
      .then((res) => {
        if (res.payload.data.success) {
          let limitCategory = res.payload.data.allCategories
          limitCategory = limitCategory.slice(0, 9)
          setAllCategories(limitCategory);
          console.log("limitCategory", limitCategory)
          console.log("res.payload.data.allCategories", res.payload.data.allCategories)
          setLoading(false);
        }
        return res;
      })
      .catch((err) => {
        return err.response;
      });

  }, []);

  console.log("allCategoirs", allCategories)

  return (
    <div className="w-[90%] mx-auto">
      <h1 className="text-4xl text-[#CDA274] font-bold m-8 text-center">
        Browse The Categories
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {
          allCategories?.map((category, index) => {
            let categoryName = category.name
            categoryName = categoryName.replace(" ", "-")
            return (
              <div>
                <Link to={`/category/${categoryName}`} key={index}>
                  <img
                    className="w-full h-64 object-cover rounded-lg cursor-pointer hover:scale-105 duration-200"
                    src={category?.categoryImages[0]}
                    alt="Bedroom"
                  />
                </Link>
                <div className="text-center m-4 font-bold text-xl">{category?.name}</div>
              </div>
            )
          })
        }
      </div>
      <Link to={'/shop'}>
        <div>
          <p className="text-xl bg-[#CDA274] w-fit text-white  font-bold m-8 mx-auto px-4 py-2 rounded-lg">Show More</p>
        </div>
      </Link>
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div>
          <NavLink to="/furniture">
            <img
              className="w-full h-64 object-cover rounded-lg cursor-pointer hover:scale-105 duration-200"
              src="https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmVkcm9vbXxlbnwwfHwwfHx8MA%3D%3D"
              alt="Bedroom"
            />
          </NavLink>
          <div className="text-center m-4 font-bold text-xl">Furniture</div>
        </div>
        <div>
          <NavLink to="/popular">
            <img
              className="w-full h-64 object-cover rounded-lg cursor-pointer hover:scale-105 duration-200"
              src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZnVybml0dXJlfGVufDB8fDB8fHww"
              alt="Bedroom"
            />
          </NavLink>
          <div className="text-center m-4 font-bold text-xl">Popular</div>
        </div>
        <div>
          <NavLink to="/decorative-items">
            <img
              className="w-full h-64 object-cover rounded-lg cursor-pointer hover:scale-105 duration-200"
              src="https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGZ1cm5pdHVyZXxlbnwwfHwwfHx8MA%3D%3D"
              alt="Bedroom"
            />
          </NavLink>
          <div className="text-center m-4 font-bold text-xl">
            Decorative Items
          </div>
        </div>
        <div>
          <NavLink to="/vehicles">
            <img
              className="w-full h-64 object-cover rounded-lg cursor-pointer hover:scale-105 duration-200"
              src="https://images.unsplash.com/photo-1552642762-f55d06580015?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8dmVoaWNsZXxlbnwwfHwwfHx8MA%3D%3D"
              alt="Bedroom"
            />
          </NavLink>
          <div className="text-center m-4 font-bold text-xl">Vehicles</div>
        </div>
        <div>
          <NavLink to="/home-appliance">
            <img
              className="w-full h-64 object-cover rounded-lg cursor-pointer hover:scale-105 duration-200"
              src="https://images.unsplash.com/photo-1556911220-bff31c812dba?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8a2l0Y2hlbnxlbnwwfHwwfHx8MA%3D%3D"
              alt="Bedroom"
            />
          </NavLink>
          <div className="text-center m-4 font-bold text-xl">Home Appliance</div>
        </div>
      </div> */}
    </div>
  );
};

export default Categories;
