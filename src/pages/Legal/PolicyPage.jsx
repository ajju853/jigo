import React from 'react';
import { useParams, Link } from 'react-router-dom';


const Section = ({ title, children }) => (
  <div className="space-y-3 mt-6">
    <h2 className="text-xl font-semibold text-white">{title}</h2>
    <div className="text-gray-300 leading-relaxed">
      {children}
    </div>
  </div>
);

const SubSection = ({ title, children }) => (
  <div className="space-y-2 mt-4">
    <h3 className="text-lg font-medium text-gray-200">{title}</h3>
    {children}
  </div>
);

const PrivacyPolicy = () => (
  <div className="space-y-6">
    <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
    <p className="text-sm text-gray-400">Last Updated: January 2024</p>
    
    <Section title="1. Introduction">
      <p>
        Welcome to Jigo ("we," "our," "us"). We respect your privacy and are committed 
        to protecting your personal data. This Privacy Policy explains how we collect, 
        use, disclose, and safeguard your information when you use our platform.
      </p>
    </Section>
    
    <Section title="2. Information We Collect">
      <div className="space-y-4">
        <SubSection title="2.1 Information You Provide">
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            <li><strong>Account Information:</strong> Name, email, phone number, password</li>
            <li><strong>Profile Information:</strong> Photos, bio, age, gender, location</li>
            <li><strong>Payment Information:</strong> Processed securely by Stripe</li>
            <li><strong>Communications:</strong> Messages, chat history, reviews</li>
          </ul>
        </SubSection>
        
        <SubSection title="2.2 Information Automatically Collected">
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            <li>Device information (IP address, browser, operating system)</li>
            <li>Usage data (pages viewed, features used)</li>
            <li>Approximate location based on IP</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>
        </SubSection>
      </div>
    </Section>
    
    <Section title="3. How We Use Your Information">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="p-4 bg-gray-800/30 rounded-lg">
          <h4 className="font-semibold text-brandPurple mb-2">Core Service</h4>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Account creation and management</li>
            <li>• Service delivery and booking</li>
            <li>• Communication and support</li>
          </ul>
        </div>
        <div className="p-4 bg-gray-800/30 rounded-lg">
          <h4 className="font-semibold text-brandPurple mb-2">Improvement</h4>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Personalization and recommendations</li>
            <li>• Analytics and platform improvement</li>
            <li>• Research and development</li>
          </ul>
        </div>
      </div>
    </Section>
    
    <Section title="4. Contact Us">
      <div className="space-y-2">
        <p><strong>Privacy Team:</strong> privacy@jigoapp.com</p>
        <p><strong>Data Protection Officer:</strong> dpo@jigoapp.com</p>
      </div>
    </Section>
  </div>
);

const TermsOfService = () => (
  <div className="space-y-6">
    <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
    <p className="text-sm text-gray-400">Last Updated: January 2024</p>
    
    <Section title="1. Acceptance of Terms">
      <p>
        By using the Jigo platform, you agree to these Terms of Service. If you do not agree, please do not use our services.
      </p>
    </Section>

    <Section title="2. Eligibility">
      <p>Minimum Age: 18 years old. Identity verification is required.</p>
    </Section>

    <Section title="3. User Conduct">
      <ul className="list-disc list-inside text-gray-300">
        <li>Create complete, accurate profiles</li>
        <li>Communicate respectfully</li>
        <li>Do not harass, threaten, or bully others</li>
      </ul>
    </Section>
  </div>
);

const SafetyGuidelines = () => (
  <div className="space-y-6">
    <h1 className="text-3xl font-bold text-white">Safety Guidelines</h1>
    <p className="text-sm text-gray-400">Last Updated: January 2024</p>
    
    <Section title="1. Introduction">
      <p>Your safety is our priority. Jigo has implemented comprehensive safety measures.</p>
    </Section>

    <Section title="2. Before You Meet">
      <ul className="list-disc list-inside text-gray-300">
        <li>Verify identity through the platform</li>
        <li>Check their profile completion and reviews</li>
        <li>Use in-app messaging only</li>
      </ul>
    </Section>

    <Section title="3. During The Meeting">
      <ul className="list-disc list-inside text-gray-300">
        <li>Meet in a public, well-lit location</li>
        <li>Share your live location with a trusted contact</li>
        <li>Trust your instincts - leave if you feel uncomfortable</li>
      </ul>
    </Section>
  </div>
);

const PolicyPage = () => {
  const { page } = useParams();
  
  const pages = {
    'privacy': PrivacyPolicy,
    'terms': TermsOfService,
    'safety': SafetyGuidelines
  };
  
  const PageComponent = pages[page] || PrivacyPolicy;
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/" className="text-brandPurple hover:text-brandPurple/80">
          &larr; Back to Home
        </Link>
      </div>
      
      <div className="bg-darkSurface p-6 md:p-8 rounded-xl border border-gray-700">
        <PageComponent />
      </div>
    </div>
  );
};

export default PolicyPage;
