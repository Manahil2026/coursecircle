"use client";  // Add this line to specify that this is a client component

import React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const Body: React.FC = () => {
  return (
    <div className="text-gray-800">
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between px-6 md:px-12 py-12 bg-white">
        {/* Text Content */}
        <div className="max-w-md">
          <h1 className="text-2xl md:text-3xl font-bold leading-snug mb-4">
            CourseCircle
          </h1>
          <p className="text-base md:text-lg text-gray-600 mb-6">
          An AI-driven platform that simplifies learning, streamlines communication, and keeps students and educators organized.
          </p>
          <button className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 text-lg">
            Get Started
          </button>
        </div>

        {/* Lottie Animation */}
        <div className="mt-8 md:mt-0 md:w-1/2 flex justify-center">
          <DotLottieReact
            src="https://lottie.host/a7b73b8e-bae3-4303-8a05-a6cc6668ef59/qLg4OQ4jAq.lottie"
            loop
            autoplay
            speed={1.5}
            style={{ width: "100%", maxWidth: "600px" }}
          />
        </div>
      </section>

      {/* What We Offer Section */}
      <section className="flex items-center justify-start gap-4 px-1 md:px-1 py-2 bg-gray-100 rounded-md mx-6 md:mx-12">
        <div className="bg-[#B9FF66] font-bold text-base px-4 py-2 rounded-md">
          What We Offer
        </div>
        <p className="text-sm md:text-base text-gray-600">
        Smart, seamless, and AI-powered course management—designed for students and educators alike.
        </p>
      </section>
    </div>
  );
};

export default Body;
