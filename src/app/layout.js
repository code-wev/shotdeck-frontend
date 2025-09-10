
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/shared/Navbar";
import ReduxProvider from "@/providers/ReduxProvider";
import { ToastContainer } from "react-toastify";
import SessionProviders from "@/providers/SessionProvider";
import 'aos/dist/aos.css'; 
import Footer from "@/shared/Footer";
import SmonthScrollingProvider from "@/providers/SmonthScrollingProvider";



export const metadata = {
  title: "Home | FX-References",
  description: "Your ultimate library of movie references and visual effects (FX) references. Browse, search, and discover cinematic shots, FX breakdowns, and film inspirations.",
  keywords: [
    "movie references",
    "film references",
    "FX references",
    "visual effects",
    "cinematic shots",
    "film inspiration",
    "movie shots library",
    "film visual effects",
    "shot reference",
    "FX breakdown",
  ].join(", "),
  author: "FX-References Team",
  openGraph: {
    title: "Home | FX-References",
    description: "Browse the ultimate collection of movie and FX references for filmmakers and VFX artists.",
    url: "https://yourdomain.com/",
    siteName: "FX-References",
    images: [
      {
        url: "https://yourdomain.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "FX-References Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Home | FX-References",
    description: "Discover cinematic shots, movie references, and FX breakdowns in one place.",
    site: "@fxreferences",
    creator: "@fxreferences",
    image: "https://yourdomain.com/og-image.jpg",
  },
};


export default function RootLayout({ children }) {

  return (
    <html lang="en">
      <body
        className=''
      >



      <SessionProviders>
     <ReduxProvider>
    <ToastContainer/>
         <Navbar/>\
         
{/*          
<SmonthScrollingProvider> */}
         <div className="min-h-screen bg-gray-900">
                  {children}
         </div>
     
{/* </SmonthScrollingProvider> */}
        {/* <Footer/> */}

     
   </ReduxProvider>
  
</SessionProviders>














      </body>
    </html>
  );
}
