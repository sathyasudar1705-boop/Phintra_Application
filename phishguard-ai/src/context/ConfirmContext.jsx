import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import Button from '../components/common/Button';

const ConfirmContext = createContext(null);

export const ConfirmProvider = ({ children }) => {
  const [state, setState] = useState(null);
  const resolveRef = useRef(null);
  const triggerRef = useRef(null);
  const confirmBtnRef = useRef(null);
  const cancelBtnRef = useRef(null);

  const confirm = useCallback(({ title, description, confirmText = 'Confirm', cancelText = 'Cancel', variant = 'danger', icon: IconOverride } = {}) => {
    triggerRef.current = document.activeElement;
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setState({ title, description, confirmText, cancelText, variant, icon: IconOverride });
    });
  }, []);

  const handleConfirm = () => {
    if (resolveRef.current) resolveRef.current(true);
    setState(null);
    // Restore focus to original trigger
    if (triggerRef.current && triggerRef.current.focus) {
      setTimeout(() => triggerRef.current.focus(), 0);
    }
  };

  const handleCancel = () => {
    if (resolveRef.current) resolveRef.current(false);
    setState(null);
    if (triggerRef.current && triggerRef.current.focus) {
      setTimeout(() => triggerRef.current.focus(), 0);
    }
  };

  // Focus management: focus the cancel button when modal opens
  useEffect(() => {
    if (state && cancelBtnRef.current) {
      cancelBtnRef.current.focus();
    }
  }, [state]);

  // Keyboard handler for Esc
  useEffect(() => {
    if (!state) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleCancel();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [state]);

  const ModalIcon = state?.icon || AlertTriangle;

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      {state && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-modal-title"
          aria-describedby="confirm-modal-desc"
          onClick={handleCancel}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: 99998,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'var(--bg-card)',
              borderRadius: '14px',
              border: '1px solid var(--border-color)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.12)',
              width: '100%',
              maxWidth: '420px',
              padding: '28px',
              textAlign: 'center',
              animation: 'confirmModalIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            {/* Icon */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '16px',
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: state.variant === 'danger' ? 'var(--color-danger-light)' : 'var(--color-primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <ModalIcon
                  size={28}
                  style={{ color: state.variant === 'danger' ? 'var(--color-danger)' : 'var(--color-primary)' }}
                />
              </div>
            </div>

            {/* Title */}
            <h3
              id="confirm-modal-title"
              style={{
                fontSize: '18px',
                fontWeight: '700',
                color: 'var(--text-main)',
                marginBottom: '8px',
                letterSpacing: '-0.02em',
              }}
            >
              {state.title}
            </h3>

            {/* Description */}
            {state.description && (
              <p
                id="confirm-modal-desc"
                style={{
                  fontSize: '14px',
                  color: 'var(--text-light)',
                  marginBottom: '24px',
                  lineHeight: '1.6',
                }}
              >
                {state.description}
              </p>
            )}

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button
                ref={cancelBtnRef}
                variant="outline"
                onClick={handleCancel}
                style={{ flex: 1 }}
              >
                {state.cancelText}
              </Button>
              <Button
                ref={confirmBtnRef}
                variant={state.variant === 'danger' ? 'danger' : 'primary'}
                onClick={handleConfirm}
                style={{ flex: 1 }}
              >
                {state.confirmText}
              </Button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes confirmModalIn {
          from {
            opacity: 0;
            transform: scale(0.92) translateY(8px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </ConfirmContext.Provider>
  );
};

export const useConfirmContext = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirmContext must be used within a ConfirmProvider');
  }
  return context;
};
