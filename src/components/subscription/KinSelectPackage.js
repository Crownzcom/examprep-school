import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import Packages from './Packages';

function KinSelectPackage() {

  const location = useLocation();
  const { studentInfo } = location.state || { studentInfo: { userId: '', name: '', educationLevel: '' } }; // Set default values accordingly

  return (
    <div style={{ marginTop: "" }} >
      <Packages studentInfo={studentInfo}></Packages>
    </div>
  );
}

export default KinSelectPackage;
