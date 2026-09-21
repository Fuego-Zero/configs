export function Action({ onClick }: { onClick: () => void }) {
  return <button onClick={onClick} data-testid="action" disabled className="action" type="button" />;
}
