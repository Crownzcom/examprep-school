import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import Packages from './Packages';
import PackagesTest from './PackagesTest';
import { useAuth } from "../../context/AuthContext";

function SelectPackage() {
  const { userInfo } = useAuth();
  const isAdmin = userInfo.labels.includes("admin");

  const location = useLocation();
  const { studentInfo } = location.state || { studentInfo: { userId: '', name: '', educationLevel: '' } }; // Set default values accordingly

  // console.log('Student Info being payed for: ', studentInfo)

  return (
    <>

      {
        isAdmin ?
          <PackagesTest studentInfo={studentInfo}></PackagesTest>
          :
          <Packages studentInfo={studentInfo}></Packages>
      }
    </>
  );
}

export default SelectPackage;
