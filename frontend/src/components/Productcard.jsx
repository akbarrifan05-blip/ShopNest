import React from "react";
import { Link } from "react-router-dom";
import "../style/Product.css";

const ProductCard = ({ product }) => {
    return (
        <div className="product-card">
            <img src={product.imageUrl} alt={product.name} className="product-image" />
            <div className="product-details">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-description">{product.description}</p>
                <p className="product-price">Rs. {product.price.toFixed(2)}</p>
                <Link to={`/product/${product._id}`} className="btn">View Details</Link>
            </div>
        </div>
    );
};

export default ProductCard  ;
