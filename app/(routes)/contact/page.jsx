import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, MapPin, Mail, Phone, Clock } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Our Address</h2>
          <p className="mb-2 flex items-center">
            <MapPin className="mr-2" size={18} />
            Tirupur,Tamil Nadu,India 638071
          </p>
          
          <h2 className="text-2xl font-semibold mt-6 mb-4">Contact Information</h2>
          <p className="mb-2 flex items-center">
            <Mail className="mr-2" size={18} />
            mail@vabgo.com
          </p>
          <p className="mb-2 flex items-center">
            <Phone className="mr-2" size={18} />
            +91 96776-02828
          </p>
        </div>
        
        <div>
          <h2 className="text-2xl font-semibold mb-4">Connect With Us</h2>
          <div className="flex space-x-4">
            <a href="https://facebook.com/yourcompany" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
              <Facebook size={24} />
            </a>
            <a href="https://twitter.com/yourcompany" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-600">
              <Twitter size={24} />
            </a>
            <a href="https://instagram.com/yourcompany" target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-800">
              <Instagram size={24} />
            </a>
            <a href="https://linkedin.com/company/yourcompany" target="_blank" rel="noopener noreferrer" className="text-blue-800 hover:text-blue-900">
              <Linkedin size={24} />
            </a>
          </div>
          
          <h2 className="text-2xl font-semibold mt-6 mb-4">Business Hours</h2>
          <p className="mb-2 flex items-center">
            <Clock className="mr-2" size={18} />
            Monday - Friday: 9:00 AM - 5:00 PM
          </p>
          <p className="mb-2 ml-6">Saturday: 10:00 AM - 2:00 PM</p>
          <p className="mb-2 ml-6">Sunday: Closed</p>
        </div>
      </div>
    </div>
  );
}
