import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';

interface HCaptchaProps {
  onVerify: (token: string) => void;
  onError?: (error: string) => void;
  onExpire?: () => void;
  className?: string;
}

export interface HCaptchaRef {
  reset: () => void;
  execute: () => void;
}

const HCaptchaComponent = forwardRef<HCaptchaRef, HCaptchaProps>(
  ({ onVerify, onError, onExpire, className }, ref) => {
    const hcaptchaRef = useRef<HCaptcha>(null);

    useImperativeHandle(ref, () => ({
      reset: () => {
        hcaptchaRef.current?.resetCaptcha();
      },
      execute: () => {
        hcaptchaRef.current?.execute();
      },
    }));

    const handleVerify = (token: string) => {
      onVerify(token);
    };

    const handleError = (error: string) => {
      console.error('hCaptcha error:', error);
      onError?.(error);
    };

    const handleExpire = () => {
      console.log('hCaptcha expired');
      onExpire?.();
    };

    return (
      <div className={className}>
        <HCaptcha
          ref={hcaptchaRef}
          sitekey="1460ad10-9c46-40c6-aa36-5610251ed7ba"
          onVerify={handleVerify}
          onError={handleError}
          onExpire={handleExpire}
          theme="light"
          size="normal"
        />
      </div>
    );
  }
);

HCaptchaComponent.displayName = 'HCaptchaComponent';

export default HCaptchaComponent;
