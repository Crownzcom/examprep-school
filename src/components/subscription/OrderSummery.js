import React from "react";
import './OrderSummery.css'

function OrderSummery() {
    return (
        <div className="OrderSummeryContainer">
            <div className="card">
                <div className="card__header">
                    <img src="../../images/illustration-hero.svg" alt="hero svg" />
                </div>
                <div className="card__body">
                    <div className="card__content">
                        <h1>Order Summary</h1>
                        <p>
                            You can now listen to millions of songs, audiobooks, and podcasts on
                            any device anywhere you like!
                        </p>
                        <div className="card__plan">
                            <div>
                                <img src="../../images/icon-music.svg" alt="music icon" />
                                <div className="card__price">
                                    <h2>Annual Plan</h2>
                                    <p>$59.99/year</p>
                                </div>
                            </div>
                            <a href="#!"> Change</a>
                        </div>
                    </div>
                    <div className="card__footer">
                        <button className="card__payment-btn">Proceed to Payment</button>
                        <button className="card__cancel-btn">Cancel Order</button>
                    </div>
                </div>
            </div>
        </div>

    )
}

export default OrderSummery