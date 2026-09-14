import '@testing-library/jest-dom/vitest'

// jsdom doesn't implement scrollIntoView at all (not even a no-op stub),
// but real browsers do - stub it so components that scroll a field into
// view (e.g. the export-validation focus behavior in App.tsx) don't throw
// in tests.
if (typeof Element !== 'undefined' && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {}
}
