import React, { useEffect } from "react";
import SingleAccount from "../createAccount/SingleAccount.js";
import { clearAllTables, fetchAppWriteData } from "../login/utils.js";

const CreateAdmin = () => {
  // Fetch new appwrite data
  useEffect(() => {
    fetchAppWriteData();
  }, []);

  return <SingleAccount user_Type={"admin"} oneType={true} />;
};

export default CreateAdmin;
