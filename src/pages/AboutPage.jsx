import React from 'react';
import { Mail, MessageSquare } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-24 min-h-screen">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-black mb-6 text-text">About <span className="text-terracotta">Shinerva AI</span></h1>
        <p className="text-xl text-text-muted max-w-2xl mx-auto">
          Southeast Asia’s premium AI Text-to-Speech platform. We focus on natural, human-like Indonesian voices for creators, podcasters, and businesses.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-16">
        <div className="bg-surface border border-surface2 p-8 rounded-3xl">
          <h2 className="text-2xl font-bold mb-4 text-text">Our Mission</h2>
          <p className="text-text-muted leading-relaxed">
            We aim to empower Indonesian creators and businesses by providing accessible, high-quality AI voice technology that sounds truly natural, emotional, and authentic. 
          </p>
        </div>
        <div className="bg-surface border border-surface2 p-8 rounded-3xl">
          <h2 className="text-2xl font-bold mb-4 text-text">Contact Us</h2>
          <p className="text-text-muted mb-6">
            Have questions or need a custom solution? Reach out to our team.
          </p>
          <div className="flex flex-col gap-4">
            <a href="mailto:hello.shinerva@gmail.com" className="flex items-center gap-3 text-text hover:text-terracotta transition-colors">
              <Mail className="w-5 h-5" /> hello.shinerva@gmail.com
            </a>
            <a href="https://wa.me/628123456789" className="flex items-center gap-3 text-text hover:text-terracotta transition-colors">
              <MessageSquare className="w-5 h-5" /> WhatsApp Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
