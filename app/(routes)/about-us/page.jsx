import React from 'react';
import Image from 'next/image';

export default function AboutUs() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-primary mb-6">About Us</h1>
      
      <div className="gap-8 items-center">

        <div>
          <p className="text-gray-700 mb-4">
            Welcome to Vabgo.com, real-estate platform that makes it possible to buy/sell/rent commercial properties.Our team of dedicated business enthusiasts and tech experts work tirelessly to bring you a seamless experience in discovering and booking your business locations.With our innovative search features and user-friendly interface, we're revolutionizing the way search for business locations.
          </p>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-semibold text-primary mb-4">Our Mission</h2>
        <p className="text-gray-700">
          To empower Business with the tools and information they need to locate their business locations.
        </p>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-semibold text-primary mb-4">Our Values</h2>
        <ul className="list-disc list-inside text-gray-700">
          <li>Innovation in Business Technology</li>
          <li>Customer-centric approach</li>
          <li>Continuous improvement and learning</li>
        </ul>
      </div>
    </div>
  );
}