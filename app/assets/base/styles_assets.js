import { Dimensions, } from "react-native";
const { width } = Dimensions.get("window");

// Colors
export const blueColor = "#007bff";
export const lightblueColor = "#0095ff";
export const darkBlueColor = "#1976D2";
export const whiteColor = "#FFFFFF";
export const blackColor = "#000000";
export const grayColor = "#757575";
export const bgColor = "#F5F5F5";
export const successColor = "#01a817";
export const dangerColor ="#940000";
export const warningColor ="#e66300"; 


// font Sizes
export const fontSizeBig = width > 768 ? 20 : 18
export const fontSizeNormal = width > 768 ? 16 : 14
export const fontSizeSmall = width > 768 ? 14 : 12