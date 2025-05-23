"use client";

import React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import Image from "next/image";

const Landing_page: React.FC = () => {
  const { isSignedIn, isLoaded } = useUser();

  // Show loading state while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-8 border-t-[#d1e3bb] border-[#73b029] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-t from-[#AAFF45]/15 to-white">
      {/* Logo */}
      <div className="flex items-center justify-between px-6 md:px-6 py-6 gap-3">
        <Image src="/asset/logo_icon.svg" alt="CourseCircle Logo" width={40} height={40} priority />
        <div className="flex gap-3">
          {!isSignedIn ? (
            <SignInButton mode="modal">
              <button className="px-5 py-2 text-lg border border-gray-800 rounded-md hover:bg-gray-100">
                Login
              </button>
            </SignInButton>
          ) : (
            <UserButton
              appearance={{
                elements: {
                  userButtonOuter: "rounded-full border-2 border-gray-800",
                },
              }}
            />
          )}
        </div>
      </div>

      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between px-6 md:px-6 py-6 ">
        {/* Text Content */}
        <div className="max-w-md">
          <h1 className="text-2xl md:text-3xl font-bold leading-snug mb-4">CourseCircle</h1>
          <p className="text-base md:text-lg text-gray-600 mb-6">
            An AI-driven platform that simplifies learning, streamlines communication, and keeps students and educators organized.
          </p>
          <SignUpButton mode="modal">
            <button className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 text-lg">
              Get Started
            </button>
          </SignUpButton>
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
      <section className="mt-8 md:mt-12 px-6 md:px-6">
        <div className="flex flex-col md:flex-row items-center justify-start gap-3 bg-gray-100 rounded-md p-4">
          <div className="bg-[#B9FF66] font-bold text-sm px-3 py-1.5 rounded-md whitespace-nowrap">
            What We Offer
          </div>
          <p className="text-sm text-gray-600 text-center md:text-left">
            Smart, seamless, and AI-powered course management—designed for students and educators alike.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Landing_page;
