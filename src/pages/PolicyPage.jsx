import React from 'react';
import { BookOpen } from 'lucide-react';

const PolicyPage = () => {
  // Simple component since we will route to /policy/:type
  // In a real app we would fetch the markdown or define the text
  const path = window.location.pathname;
  let title = "Digital Service Policy";
  let content = (
    <>
      <p className="mb-4 text-text-muted">
        Shinerva AI is a digital service providing AI voice generation. All services are delivered digitally immediately upon successful payment.
      </p>
      <h3 className="text-xl font-bold mb-2">Usage & Credits</h3>
      <p className="mb-4 text-text-muted">
        Credits purchased are valid according to the respective plan's duration. 
        Credits are automatically consumed upon successful voice generation.
      </p>
      <h3 className="text-xl font-bold mb-2">No Refund Policy</h3>
      <p className="text-text-muted">
        Due to the digital nature of our service, we do not offer refunds after credits have been used or after 7 days from purchase if unused. Please test the service using the Free plan before upgrading.
      </p>
    </>
  );

  if (path.includes('privacy')) {
    title = "Privacy Policy";
    content = <p className="text-text-muted">We respect your privacy. All uploaded text and generated audio are processed securely. We do not sell your personal data.</p>;
  } else if (path.includes('terms')) {
    title = "Terms & Conditions";
    content = <p className="text-text-muted">By using Shinerva AI, you agree to not use the generated voices for illegal, defamatory, or abusive purposes.</p>;
  } else if (path.includes('refund')) {
    title = "Refund Policy";
    content = <p className="text-text-muted">Since Shinerva provides digital products, purchases are non-refundable once credits are used. Please use the Free tier to ensure our voices meet your needs before upgrading.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-24 min-h-screen">
      <div className="bg-surface border border-surface2 p-8 md:p-12 rounded-3xl shadow-xl">
        <div className="flex items-center gap-4 mb-8">
          <BookOpen className="w-8 h-8 text-terracotta" />
          <h1 className="text-3xl md:text-4xl font-black text-text">{title}</h1>
        </div>
        <div className="prose prose-invert max-w-none text-text">
          {content}
        </div>
      </div>
    </div>
  );
};

export default PolicyPage;
