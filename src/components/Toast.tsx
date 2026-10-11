import { useToast } from '../lib/actions';
import { IconCheck } from './icons';

export function Toast() {
  const { message, kind, action, hide } = useToast();
  return (
    <div className={`toast ${kind}${message ? ' show' : ''}`} role="status" aria-live="polite">
      {kind === 'success' && <IconCheck width={16} height={16} />}
      <span>{message}</span>
      {action && (
        <button
          type="button"
          onClick={() => {
            hide();
            action.run();
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
