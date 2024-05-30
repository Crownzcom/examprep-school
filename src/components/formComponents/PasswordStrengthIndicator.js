import React from "react";
import ProgressBar from "react-bootstrap/ProgressBar";

const PasswordStrengthIndicator = ({ strength }) => {
  const getStrengthColor = () => {
    switch (strength) {
      case 0:
        return "danger"; // Very Weak
      case 1:
        return "warning"; // Weak
      case 2:
        return "info"; // Fair
      case 3:
        return "success"; // Strong
      default:
        return "success"; // Very Strong
    }
  };

  const getStrengthText = () => {
    switch (strength) {
      case 0:
        return "Very Weak";
      case 1:
        return "Weak";
      case 2:
        return "Fair";
      case 3:
        return "Strong";
      default:
        return "Very Strong";
    }
  };

  return (
    <div className="password-strength-indicator">
      <ProgressBar
        now={strength * 25}
        variant={getStrengthColor()}
        label={strength > 0 ? `${getStrengthText()}` : ""}
      />
    </div>
  );
};

export default PasswordStrengthIndicator;
