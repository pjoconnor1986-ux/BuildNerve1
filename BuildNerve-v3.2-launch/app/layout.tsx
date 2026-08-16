import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata:Metadata={
 title:{default:"BuildNerve",template:"%s | BuildNerve"},
 description:"AI-powered construction operations for UK contractors",
 applicationName:"BuildNerve"
};

export const viewport:Viewport={
 themeColor:"#0b1725",
 colorScheme:"light"
};

export default function RootLayout({children}:{children:React.ReactNode}){
 return <html lang="en"><body>{children}</body></html>;
}
