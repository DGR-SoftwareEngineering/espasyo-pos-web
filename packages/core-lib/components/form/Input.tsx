import React, { useState } from "react";
import { 
  InputProps, 
  OutlinedInput, 
  InputAdornment, 
  IconButton 
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

interface CustomInputProps extends InputProps {
  showPasswordToggle?: boolean;
}

export const Input = ({ 
  showPasswordToggle, 
  disabled, 
  endAdornment, 
  sx,
  ...props 
}: CustomInputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((prev) => !prev);
  
  // Logic to determine if we should treat this as a masked field
  const isPasswordField = props.type === "password" || showPasswordToggle;

  return (
    <OutlinedInput
      {...props}
      // Dynamically switch type between 'text' and 'password'
      type={isPasswordField ? (showPassword ? "text" : "password") : props.type}
      fullWidth
      disabled={disabled}
      sx={{
        borderRadius: "12px",
        height: "56px",
        backgroundColor: "#F9FAFB",
        position: "relative",
        
    
        "&:hover .MuiOutlinedInput-notchedOutline": {
          borderColor: "#7F5100", // Espasyo Brown on hover
        },
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": { 
          borderColor: "#7F5100", 
          borderWidth: "2px",
        },
        
        // Error State
        "&.Mui-error .MuiOutlinedInput-notchedOutline": {
          borderColor: "#d32f2f",
          borderWidth: "2px",
        },

        // Chrome Autofill fix: forces the background to stay #F9FAFB
        "& input:-webkit-autofill": { 
          WebkitBoxShadow: "0 0 0 100px #F9FAFB inset",
          WebkitTextFillColor: "inherit",
          borderRadius: "inherit",
        },

        ...sx, // Allows for any specific overrides passed from parent
      }}
      endAdornment={
        showPasswordToggle ? (
          <InputAdornment position="end">
            <IconButton
              aria-label="toggle password visibility"
              onClick={handleClickShowPassword}
              edge="end"
              sx={{ marginRight: "4px" }}
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        ) : (
          endAdornment ?? null 
        )
      }
    />
  );
};