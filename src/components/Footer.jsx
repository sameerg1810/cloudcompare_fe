import React, { useState, useEffect, useRef } from "react"; // Added useState, useEffect, useRef
import { Github, Facebook, Instagram, Mail, Phone, MapPin } from "lucide-react"; // Importing necessary icons

const Footer = () => {
  const footerRef = useRef(null); // Ref for the footer element
  const [gradientX, setGradientX] = useState(50); // Initial X position for gradient center
  const [gradientY, setGradientY] = useState(50); // Initial Y position for gradient center

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (footerRef.current) {
        const rect = footerRef.current.getBoundingClientRect();
        // Calculate mouse position relative to the footer element, in percentages
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setGradientX(x);
        setGradientY(y);
      }
    };

    const footerElement = footerRef.current;
    if (footerElement) {
      // Add mousemove event listener to the footer
      footerElement.addEventListener("mousemove", handleMouseMove);
    }

    // Cleanup function to remove the event listener when the component unmounts
    return () => {
      if (footerElement) {
        footerElement.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, []); // Empty dependency array ensures this effect runs once on mount and cleans up on unmount

  return (
    // Applied gradient background with transparency, glass effect (backdrop-blur),
    // using even darker darkPurple shades for the gradient.
    <footer
      ref={footerRef} // Attach ref to the footer element
      className="py-12 shadow-inner backdrop-blur-md relative overflow-hidden"
      style={{
        // Dynamic radial gradient background that follows the mouse cursor.
        // Using black and darkPurple-950 for a darker base.
        background: `radial-gradient(circle at ${gradientX}% ${gradientY}%, rgba(0, 0, 0, 0.8) 0%, rgba(18, 10, 33, 0.7) 70%, rgba(0, 0, 0, 0.6) 100%)`,
      }}
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-10">
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-darkPurple-300 mb-4">
              Quick Links
            </h3>{" "}
            {/* Heading color */}
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-darkPurple-50 hover:text-darkPurple-100 transition-colors duration-200" // Text white, hover lighter purple
                  style={{ textShadow: "0 0 7px rgba(255,255,255,0.6)" }} // Stronger white glow
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-darkPurple-50 hover:text-darkPurple-100 transition-colors duration-200" // Text white, hover lighter purple
                  style={{ textShadow: "0 0 7px rgba(255,255,255,0.6)" }} // Stronger white glow
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-darkPurple-50 hover:text-darkPurple-100 transition-colors duration-200" // Text white, hover lighter purple
                  style={{ textShadow: "0 0 7px rgba(255,255,255,0.6)" }} // Stronger white glow
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-darkPurple-50 hover:text-darkPurple-100 transition-colors duration-200" // Text white, hover lighter purple
                  style={{ textShadow: "0 0 7px rgba(255,255,255,0.6)" }} // Stronger white glow
                >
                  Explore
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-darkPurple-50 hover:text-darkPurple-100 transition-colors duration-200" // Text white, hover lighter purple
                  style={{ textShadow: "0 0 7px rgba(255,255,255,0.6)" }} // Stronger white glow
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold text-darkPurple-300 mb-4">
              Contact Us
            </h3>{" "}
            {/* Heading color */}
            <div className="space-y-2">
              <p
                className="flex items-center text-darkPurple-50" // Text white
                style={{ textShadow: "0 0 7px rgba(255,255,255,0.6)" }} // Stronger white glow
              >
                <Mail className="h-5 w-5 mr-2 text-darkPurple-200 drop-shadow-lg" />{" "}
                support@cloudasaservice.com {/* Icon color */}
              </p>
              <p
                className="flex items-center text-darkPurple-50" // Text white
                style={{ textShadow: "0 0 7px rgba(255,255,255,0.6)" }} // Stronger white glow
              >
                <Phone className="h-5 w-5 mr-2 text-darkPurple-200 drop-shadow-lg" />{" "}
                +1 (555) 123-4567 {/* Icon color */}
              </p>
              <p
                className="flex items-start text-darkPurple-50" // Text white
                style={{ textShadow: "0 0 7px rgba(255,255,255,0.6)" }} // Stronger white glow
              >
                <MapPin className="h-5 w-5 mr-2 text-darkPurple-200 mt-1 drop-shadow-lg" />{" "}
                123 Cloud Street, <br /> San Francisco, CA 94103{" "}
                {/* Icon color */}
              </p>
            </div>
          </div>

          {/* Stay Updated / Email Subscription */}
          <div>
            <h3 className="text-lg font-semibold text-darkPurple-300 mb-4">
              Stay Updated
            </h3>{" "}
            {/* Heading color */}
            <p
              className="text-sm mb-3 text-darkPurple-50" // Text white
              style={{ textShadow: "0 0 7px rgba(255,255,255,0.6)" }} // Stronger white glow
            >
              Subscribe to receive updates on cloud pricing and new features.
            </p>
            <form className="flex flex-col space-y-3">
              <input
                type="email"
                placeholder="Your email address"
                className="p-2 rounded-md bg-darkPurple-800/50 border border-darkPurple-700 text-darkPurple-50 placeholder-darkPurple-200 focus:outline-none focus:ring-2 focus:ring-darkPurple-300" // Input text/placeholder
              />
              <button
                type="submit"
                className="bg-darkPurple-600 hover:bg-darkPurple-500 text-darkPurple-50 font-bold py-2 px-4 rounded-md transition-colors duration-200" // Button bg, hover, text
                style={{ textShadow: "0 0 10px rgba(255,255,255,0.8)" }} // Stronger glow for button text
              >
                Subscribe
              </button>
            </form>
          </div>

          {/* Other Links (About Us, Terms, Cookie, Blog) */}
          <div>
            <h3 className="text-lg font-semibold text-darkPurple-300 mb-4">
              More Info
            </h3>{" "}
            {/* Heading color */}
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-darkPurple-50 hover:text-darkPurple-100 transition-colors duration-200" // Text white, hover lighter purple
                  style={{ textShadow: "0 0 7px rgba(255,255,255,0.6)" }} // Stronger white glow
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-darkPurple-50 hover:text-darkPurple-100 transition-colors duration-200" // Text white, hover lighter purple
                  style={{ textShadow: "0 0 7px rgba(255,255,255,0.6)" }} // Stronger white glow
                >
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-darkPurple-50 hover:text-darkPurple-100 transition-colors duration-200" // Text white, hover lighter purple
                  style={{ textShadow: "0 0 7px rgba(255,255,255,0.6)" }} // Stronger white glow
                >
                  Cookie Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-darkPurple-50 hover:text-darkPurple-100 transition-colors duration-200" // Text white, hover lighter purple
                  style={{ textShadow: "0 0 7px rgba(255,255,255,0.6)" }} // Stronger white glow
                >
                  Blog
                </a>
              </li>
            </ul>
          </div>
        </div>
        <hr className="border-darkPurple-700 my-8" />{" "}
        {/* Updated border color */}
        {/* Social Media Icons */}
        <div className="flex justify-center space-x-6 mb-4">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-darkPurple-200 hover:text-darkPurple-100 transition-colors duration-200 drop-shadow-lg transform hover:scale-110" // Icon color, hover, scale animation
            aria-label="GitHub"
          >
            <Github className="h-7 w-7 md:h-8 md:w-8" />
          </a>
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-darkPurple-200 hover:text-darkPurple-100 transition-colors duration-200 drop-shadow-lg transform hover:scale-110" // Icon color, hover, scale animation
            aria-label="Facebook"
          >
            <Facebook className="h-7 w-7 md:h-8 md:w-8" />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-darkPurple-200 hover:text-darkPurple-100 transition-colors duration-200 drop-shadow-lg transform hover:scale-110" // Icon color, hover, scale animation
            aria-label="Instagram"
          >
            <Instagram className="h-7 w-7 md:h-8 md:w-8" />
          </a>
        </div>
        {/* Copyright Text */}
        <p
          className="text-center text-darkPurple-50 text-sm md:text-base" // Text white
          style={{ textShadow: "0 0 7px rgba(255,255,255,0.6)" }} // Stronger white glow
        >
          &copy; 2025 CloudAsaService. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
