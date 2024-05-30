import React from "react";
import { useLocation } from "react-router-dom";
import CustomNavbar from "../Navbar";

function AppContent() {
    const location = useLocation();

    return (
        <>
            {/* {location.pathname !== "/sign-in" && <CustomNavbar />} */}
            {/* Additional content can go here */}
        </>
    );
}

export default AppContent;
