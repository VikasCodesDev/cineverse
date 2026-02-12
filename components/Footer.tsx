import React from "react";
import { FaInstagram, FaXTwitter, FaLinkedin, FaGithub } from "react-icons/fa6";

const Footer = () => {
  return (
    <footer className="w-full py-6 bg-black/55 text-white flex flex-col items-center gap-4">
      
      {/* Social Handles */}
      <div className="flex gap-6">
        
        <a
          href="https://www.instagram.com/vikas01/?hl=en#"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-pink-400 transition duration-300"
        >
          <FaInstagram size={24} />
        </a>

        <a
          href="https://x.com/MishraVika46260"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-blue-400 transition duration-300"
        >
          <FaXTwitter size={24} />
        </a>

        <a
          href="https://www.linkedin.com/in/vikas-mishra0106"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-blue-500 transition duration-300"
        >
          <FaLinkedin size={24} />
        </a>

        {/* GitHub Added */}
        <a
          href="https://github.com/VikasCodesDev"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-400 transition duration-300"
        >
          <FaGithub size={24} />
        </a>

      </div>

      {/* Made By Line */}
      <p className="text-sm text-gray-400">
        © {new Date().getFullYear()} Crafted with{" "}
        <span className="text-pink-500 animate-pulse">❤️</span>{" "}
        and Passion by{" "}
        <a
          href="https://www.linkedin.com/in/vikas-mishra0106"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white font-semibold hover:text-pink-400 transition"
        >
          Vikas
        </a>
      </p>

    </footer>
  );
};

export default Footer;
