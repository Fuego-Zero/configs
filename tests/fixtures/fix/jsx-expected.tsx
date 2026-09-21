export function Action({ onClick }: { onClick: () => void }) {
  return <button disabled className="action" type="button" data-testid="action" onClick={onClick} />;
}
