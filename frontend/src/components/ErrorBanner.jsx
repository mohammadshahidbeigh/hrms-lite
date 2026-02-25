export function ErrorBanner({ message, onDismiss }) {
  if (!message) return null;

  return (
    <div className="mb-4 flex items-start justify-between rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
      <p>{message}</p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="ml-4 text-xs font-medium text-rose-700 underline underline-offset-2"
        >
          Dismiss
        </button>
      )}
    </div>
  );
}

