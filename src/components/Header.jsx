import React, { useState, useEffect, useRef } from "react";
import { Cloud, LogIn, Menu, UserCircle } from "lucide-react"; // Importing necessary icons

const Header = () => {
  const headerRef = useRef(null); // Ref for the header element
  const [gradientX, setGradientX] = useState(50); // Initial X position for gradient center
  const [gradientY, setGradientY] = useState(50); // Initial Y position for gradient center

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (headerRef.current) {
        const rect = headerRef.current.getBoundingClientRect();
        // Calculate mouse position relative to the header element, in percentages
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setGradientX(x);
        setGradientY(y);
      }
    };

    const headerElement = headerRef.current;
    if (headerElement) {
      // Add mousemove event listener to the header
      headerElement.addEventListener("mousemove", handleMouseMove);
    }

    // Cleanup function to remove event listener
    return () => {
      if (headerElement) {
        headerElement.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, []); // Empty dependency array ensures this effect runs once on mount and cleans up on unmount

  return (
    <>
      {/* CSS for the multi-colored glowing cloud animation, the text highlight animation,
          and the cloud icon linear reveal animation. */}
      <style>{`
        @keyframes glowing-cloud {
          0% { filter: drop-shadow(0 0 8px #a78ad8); } /* darkPurple-300 */
          25% { filter: drop-shadow(0 0 10px #c8b5e8); } /* darkPurple-200 */
          50% { filter: drop-shadow(0 0 12px #e5dbf3); } /* darkPurple-100 */
          75% { filter: drop-shadow(0 0 10px #c8b5e8); } /* darkPurple-200 */
          100% { filter: drop-shadow(0 0 8px #a78ad8); } /* darkPurple-300 */
        }
        .cloud-glow {
          animation: glowing-cloud 3s infinite alternate; /* Apply the animation */
        }

        /* Keyframes for linear reveal of the cloud icon */
        @keyframes cloud-linear-reveal {
          0% { clip-path: inset(100% 0 0 0); opacity: 0; } /* Start hidden from top */
          100% { clip-path: inset(0 0 0 0); opacity: 1; } /* Reveal completely */
        }
        .cloud-reveal-animation {
          animation: cloud-linear-reveal 1.5s ease-out forwards; /* 1.5s duration for reveal */
        }

        /* Keyframes for horizontal reveal of the text */
        @keyframes horizontal-text-reveal {
          0% { clip-path: inset(0 100% 0 0); } /* Start hidden from the left */
          100% { clip-path: inset(0 0 0 0); } /* Reveal completely */
        }
        .text-reveal-animation {
          animation: horizontal-text-reveal 2s ease-out forwards; /* Apply the animation for 2 seconds */
        }
      `}</style>

      <header
        ref={headerRef} // Attach ref to the header element
        className="py-4 px-4 shadow-lg backdrop-blur-md relative overflow-hidden"
        style={{
          // Dynamic radial gradient background that follows the mouse cursor.
          // Using Facebook blue, a vibrant purple, and a light pink shade.
          background: `radial-gradient(circle at ${gradientX}% ${gradientY}%, rgba(59, 89, 152, 0.8) 0%, rgba(107, 57, 183, 0.7) 70%, rgba(255, 192, 203, 0.6) 100%)`, // Facebook Blue, darkPurple-500, Light Pink (RGB: 255, 192, 203)
        }}
      >
        {/* Container for content, positioned above the dynamic background */}
        <div className="container mx-auto flex flex-col items-center z-10 relative">
          {/* Subheading with a subtle glow effect */}
          <p
            className="text-center text-white text-xs md:text-sm mb-3"
            style={{ textShadow: "0 0 2px rgba(255,255,255,0.4)" }} // Decreased glow for subheading
          >
            Compare pricing across AWS, Azure, and GCP with ease
          </p>

          <div className="flex items-center justify-between w-full">
            {/* Left section: Cloud Icon and Main Heading */}
            <div className="flex items-center space-x-2">
              {/* Cloud icon with linear reveal animation and continuous multi-color glow */}
              <Cloud className="h-7 w-7 text-white md:h-8 md:w-8 cloud-reveal-animation cloud-glow" />
              {/* Main heading with horizontal reveal animation and NO glow */}
              <h1
                className="text-xl md:text-2xl font-bold tracking-tight text-white text-reveal-animation"
                // Removed textShadow style property
              >
                CloudAsaService
              </h1>
            </div>

            {/* Right section: Login and Profile/Menu Icons */}
            <div className="flex items-center space-x-4">
              {/* Login Icon button with transparent darkPurple hover and lighter focus ring */}
              <button
                className="p-2 rounded-full hover:bg-darkPurple-700/50 focus:outline-none focus:ring-2 focus:ring-darkPurple-300 transition-all duration-200"
                aria-label="Login"
              >
                <LogIn className="h-6 w-6 text-white md:h-7 md:w-7 drop-shadow-lg" />
              </button>

              {/* Profile/Menu Icon button with transparent darkPurple hover and lighter focus ring */}
              <button
                className="p-2 rounded-full hover:bg-darkPurple-700/50 focus:outline-none focus:ring-2 focus:ring-darkPurple-300 transition-all duration-200"
                aria-label="User Profile"
              >
                <UserCircle className="h-6 w-6 text-white md:h-7 md:w-7 drop-shadow-lg" />
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
