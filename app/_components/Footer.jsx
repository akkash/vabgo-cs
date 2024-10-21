import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <>
      <hr className="border-t border-gray-300 my-8" />
      <footer className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">About Us</h3>
              <p className="text-sm">Vabgo - Find the perfect commercial property for your business with our innovative platform.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="text-sm">
                <li className="mb-2"><Link href="/" className="hover:text-blue-400">Home</Link></li>
                <li className="mb-2"><Link href="/commercial" className="hover:text-blue-400">Listings</Link></li>
                <li className="mb-2"><Link href="/about-us" className="hover:text-blue-400">About</Link></li>
                <li className="mb-2"><Link href="/contact" className="hover:text-blue-400">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <ul className="text-sm">
                <li className="mb-2">Vabgo</li>
                <li className="mb-2">Tirupur 638701</li>
                <li className="mb-2">Phone: +91-96776-02828</li>
                <li className="mb-2">Email: mail@vabgo.com</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-blue-400">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="#" className="hover:text-blue-400">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#" className="hover:text-blue-400">
                  <i className="fab fa-linkedin-in"></i>
                </a>
                <a href="#" className="hover:text-blue-400">
                  <i className="fab fa-instagram"></i>
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm">
            <p>&copy; 2024 Vabgo. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
