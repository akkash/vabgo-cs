import React from 'react';
import Image from 'next/image';

export default function AboutUs() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-primary mb-8">About Vabgo</h1>
      
      <div className="flex flex-col md:flex-row gap-8 items-center mb-12">
        <div className="md:w-1/2">
          <Image
            src="/commercial-office-spaces.jpg"
            alt="Vabgo office"
            width={500}
            height={400}
            className="rounded-lg shadow-lg"
          />
        </div>
        <div className="md:w-1/2">
          <p className="text-lg text-gray-700 mb-4">
            Vabgo.com is India's innovative commercial real estate platform for businesses looking to Buy, Sell, or Rent Commercial properties. Our team of dedicated business enthusiasts and tech experts work tirelessly to bring you a seamless experience in discovering and booking your ideal business locations.
          </p>
          <p className="text-lg text-gray-700">
            With our cutting-edge search features and user-friendly interface, we're revolutionizing the way businesses find their perfect commercial spaces.
          </p>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-3xl font-semibold text-primary mb-4">Our Vision</h2>
        <p className="text-xl text-gray-700">
          To transform the way businesses experience commercial real estate in India.
        </p>
      </div>

      <div className="mb-12">
        <h2 className="text-3xl font-semibold text-primary mb-4">Our Mission</h2>
        <p className="text-xl text-gray-700">
          To be the first choice for businesses in discovering, renting, buying, and selling commercial properties, while digitally enabling them throughout their journey. We achieve this through data-driven insights, innovative technology, and the passion of our people, all while delivering value to our stakeholders.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-center mb-12">
        <div className="md:w-1/2">
          <h2 className="text-3xl font-semibold text-primary mb-4">Our Values</h2>
          <ul className="list-disc list-inside text-xl text-gray-700">
            <li>Innovation in Business Technology</li>
            <li>Customer-centric approach</li>
            <li>Continuous improvement and learning</li>
            <li>Transparency and integrity</li>
            <li>Empowering businesses for success</li>
          </ul>
        </div>
        <div className="md:w-1/2">
          <Image
            src="/images/our-values.jpg"
            alt="Vabgo team collaborating"
            width={600}
            height={400}
            className="rounded-lg shadow-lg"
          />
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-3xl font-semibold text-primary mb-4">Our Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'Property Listings', icon: '🏢' },
            { title: 'Advanced Search', icon: '🔍' },
            { title: 'Virtual Tours', icon: '🖥️' },
            { title: 'Market Analysis', icon: '📊' },
            { title: 'Transaction Support', icon: '🤝' },
            { title: 'Post-Sale Services', icon: '🛠️' },
          ].map((service, index) => (
            <div key={index} className="bg-gray-100 p-4 rounded-lg text-center">
              <div className="text-5xl mb-2">{service.icon}</div>
              <h3 className="text-xl font-semibold">{service.title}</h3>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-center mb-12">
        <div className="md:w-1/2">
          <Image
            src="/images/join-our-team.jpg"
            alt="Vabgo team members"
            width={600}
            height={400}
            className="rounded-lg shadow-lg"
          />
        </div>
        <div className="md:w-1/2">
          <h2 className="text-3xl font-semibold text-primary mb-4">Join Our Team</h2>
          <p className="text-xl text-gray-700 mb-4">
            Are you passionate about real estate and technology? We're always looking for talented individuals to join our innovative team. Explore career opportunities at Vabgo and be part of the revolution in commercial real estate.
          </p>
          <button className="bg-primary text-white text-xl px-8 py-4 rounded-lg hover:bg-primary-dark transition duration-300">
            View Open Positions
          </button>
        </div>
      </div>
    </div>
  );
}
