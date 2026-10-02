/**
 * All widget CSS lives here and is injected into the Shadow DOM only —
 * never into document.head — so it can't leak onto the host page.
 * `:host { all: initial }` resets inherited properties (font, color,
 * line-height, etc.) that cross the shadow boundary regardless of
 * encapsulation, so the host page's global styles can't bleed in either.
 */
export const widgetStyles = `
:host {
  all: initial;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color-scheme: light;
}

* {
  box-sizing: border-box;
}

.rw-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 2147483000;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border: none;
  border-radius: 999px;
  background: #111827;
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  line-height: 1;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.rw-button:hover {
  background: #1f2937;
}

.rw-button[data-active="true"] {
  background: #dc2626;
}

.rw-overlay {
  position: fixed;
  z-index: 2147483001;
  pointer-events: none;
  border: 2px solid #2563eb;
  background: rgba(37, 99, 235, 0.12);
  border-radius: 4px;
  transition: all 60ms ease-out;
}

.rw-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2147483002;
  text-align: center;
  padding: 8px 16px;
  background: #111827;
  color: #ffffff;
  font-size: 13px;
}

.rw-composer-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2147483003;
  background: rgba(0, 0, 0, 0.25);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 24px;
}

@media (min-width: 640px) {
  .rw-composer-backdrop {
    align-items: center;
    justify-content: flex-end;
  }
}

.rw-composer {
  width: 100%;
  max-width: 360px;
  background: #ffffff;
  color: #111827;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rw-composer h2 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
}

.rw-composer-target {
  font-size: 12px;
  color: #6b7280;
  background: #f3f4f6;
  border-radius: 6px;
  padding: 6px 8px;
  overflow-wrap: anywhere;
}

.rw-composer textarea {
  width: 100%;
  min-height: 80px;
  resize: vertical;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 14px;
  font-family: inherit;
  color: #111827;
}

.rw-composer textarea:focus {
  outline: 2px solid #2563eb;
  outline-offset: 1px;
}

.rw-composer-error {
  font-size: 12px;
  color: #dc2626;
}

.rw-composer-success {
  font-size: 13px;
  color: #047857;
  font-weight: 500;
}

.rw-composer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.rw-composer-actions button {
  border: none;
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
}

.rw-btn-secondary {
  background: #f3f4f6;
  color: #111827;
}

.rw-btn-secondary:hover {
  background: #e5e7eb;
}

.rw-btn-primary {
  background: #111827;
  color: #ffffff;
}

.rw-btn-primary:hover {
  background: #1f2937;
}

.rw-btn-primary:disabled,
.rw-btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.rw-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}
`;
