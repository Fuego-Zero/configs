export function LegacyWidget({ label, onClick }) {
  return (
    <button type="button" onClick={onClick}>
      {label}
    </button>
  );
}

LegacyWidget.propTypes = {
  label: () => null,
  onClick: () => null,
};
