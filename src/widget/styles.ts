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
  background: #000000;
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  line-height: 1;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.14);
}

.rw-button:hover {
  background: #2f2d2a;
}

.rw-button[data-active="true"] {
  background: #dc2626;
}

.rw-overlay {
  position: fixed;
  z-index: 2147483001;
  pointer-events: none;
  border: 2px solid #777169;
  background: rgba(119, 113, 105, 0.12);
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
  background: #000000;
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
  background: #fdfcfc;
  color: #000000;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.14);
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
  color: #777169;
  background: #f5f3f1;
  border-radius: 6px;
  padding: 6px 8px;
  overflow-wrap: anywhere;
}

.rw-composer-screenshot-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: #a59f97;
}

.rw-composer-screenshot-status {
  font-size: 12px;
  color: #777169;
  margin-top: -6px;
}

.rw-composer-screenshot-status[data-state="captured"] {
  color: #3b6d58;
}

.rw-composer-screenshot-status[data-state="unavailable"] {
  color: #a59f97;
}

.rw-composer textarea {
  width: 100%;
  min-height: 80px;
  resize: vertical;
  border: 1px solid #ebe8e4;
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 14px;
  font-family: inherit;
  color: #000000;
}

.rw-composer textarea:focus {
  outline: 2px solid #777169;
  outline-offset: 1px;
}

.rw-composer-error {
  font-size: 12px;
  color: #a33e34;
}

.rw-composer-success {
  font-size: 13px;
  color: #3b6d58;
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
  background: #f5f3f1;
  color: #000000;
}

.rw-btn-secondary:hover {
  background: #ebe8e4;
}

.rw-btn-primary {
  background: #000000;
  color: #ffffff;
}

.rw-btn-primary:hover {
  background: #2f2d2a;
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
