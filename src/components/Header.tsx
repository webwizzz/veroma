"use client";


export const Header = () => {
    return (
        <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-8 md:px-12 py-6 md:py-8 pointer-events-none select-none">
            {/* Brand Logo */}
            <div className="pointer-events-auto">
                <a
                    href="#"
                    className="font-cormorant text-2xl md:text-3xl font-medium tracking-[0.1rem] text-black hover:text-black transition-colors duration-300 focus:outline-none"
                >
                    VEROMA
                </a>
            </div>

            {/* Menu Circle Button */}
            <div className="pointer-events-auto">
                <button
                    aria-label="Menu"
                    className="group relative w-9 h-9 rounded-full border-2 border-black flex items-center justify-center hover:scale-105 transition-all duration-500 ease-out focus:outline-none cursor-pointer"
                >
                    {/* Outer Circle Hover Effect */}
                    <div className="absolute inset-0 rounded-full border-2 border-black opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500 ease-out"></div>
                </button>
            </div>
        </header>
    );
};

export default Header;
