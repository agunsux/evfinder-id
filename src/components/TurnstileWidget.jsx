import React, { useEffect, useRef } from 'react';

const TurnstileWidget = ({ onVerify, onError }) => {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!siteKey) {
      console.warn('Turnstile site key is missing');
      return;
    }

    // Ensure the Turnstile script is loaded
    if (!window.turnstile) {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      script.onload = renderWidget;
    } else {
      renderWidget();
    }

    function renderWidget() {
      if (containerRef.current && window.turnstile) {
        try {
          widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            callback: function(token) {
              if (onVerify) onVerify(token);
            },
            'error-callback': function() {
              console.error('Turnstile verification failed');
              if (onError) onError();
            },
            theme: localStorage.getItem('theme') === 'dark' ? 'dark' : 'light',
          });
        } catch (e) {
          console.error("Failed to render Turnstile:", e);
        }
      }
    }

    return () => {
      if (widgetIdRef.current !== null && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, onVerify, onError]);

  if (!siteKey) {
    return null; // Don't render if misconfigured to not break UI completely
  }

  return (
    <div className="flex justify-center my-4">
      <div ref={containerRef}></div>
    </div>
  );
};

export default TurnstileWidget;
