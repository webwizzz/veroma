"use client";

import React from "react";

export const Footer = () => {
  return (
    <footer className="relative w-full bg-white text-black pt-16 pb-8 md:pt-24 md:pb-12 px-4 md:px-6 flex flex-col items-center border-t border-black/5">
      {/* 4-Column Grid */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8 mb-2">
        
        {/* Column 1: Quick Links */}
        <div className="flex flex-col items-center text-center gap-3">
          <h3 className="font-cormorant italic font-bold text-[22px] md:text-2xl mb-3 tracking-wide">
            Quick Links
          </h3>
          <a href="#" className="font-serif text-sm md:text-[15px] hover:opacity-60 transition-opacity">
            About Us
          </a>
          <a href="#" className="font-serif text-sm md:text-[15px] hover:opacity-60 transition-opacity">
            Fragrances
          </a>
          <a href="#" className="font-serif text-sm md:text-[15px] hover:opacity-60 transition-opacity">
            Contact US
          </a>
        </div>

        {/* Column 2: Address */}
        <div className="flex flex-col items-center text-center gap-3">
          <h3 className="font-cormorant italic font-bold text-[22px] md:text-2xl mb-3 tracking-wide">
            Address
          </h3>
          <p className="font-serif text-sm md:text-[15px] leading-relaxed">
            lorem ipsum,<br />
            142044, delhi, indis
          </p>
        </div>

        {/* Column 3: Socials */}
        <div className="flex flex-col items-center text-center gap-3">
          <h3 className="font-cormorant italic font-bold text-[22px] md:text-2xl mb-3 tracking-wide">
            Socials
          </h3>
          <a href="#" className="font-serif text-sm md:text-[15px] hover:opacity-60 transition-opacity">
            instagram.com
          </a>
          <a href="#" className="font-serif text-sm md:text-[15px] hover:opacity-60 transition-opacity">
            linkedin.com
          </a>
          <a href="#" className="font-serif text-sm md:text-[15px] hover:opacity-60 transition-opacity">
            twitter.com
          </a>
        </div>

        {/* Column 4: Get in Touch */}
        <div className="flex flex-col items-center text-center gap-3">
          <h3 className="font-cormorant italic font-bold text-[22px] md:text-2xl mb-3 tracking-wide">
            Get in Touch
          </h3>
          <div className="relative w-full max-w-[220px] md:max-w-[260px] mt-1">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="w-full bg-[#f4f4f4] border-none rounded-full py-3 md:py-3.5 pl-6 pr-12 text-sm font-serif focus:outline-none focus:ring-1 focus:ring-black/20 placeholder:text-black/80"
            />
            {/* Circular submit button inside the input */}
            <button 
              className="absolute right-1.5 top-1.5 bottom-1.5 aspect-square rounded-full bg-[#d9d9d9] hover:bg-black transition-colors duration-300" 
              aria-label="Submit"
            />
          </div>
        </div>
      </div>

      {/* Giant Logo Bottom */}
      <div className="w-full max-w-7xl mx-auto flex justify-center px-2">
        <img 
          src="/logo.svg" 
          alt="Veroma" 
          className="w-full h-auto object-contain select-none pointer-events-none" 
        />
      </div>
    </footer>
  );
};

export default Footer;
