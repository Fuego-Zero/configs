function save(): Promise<number> {
  return Promise.resolve(1);
}

function Panel() {
  return <div />;
}

export function JsxExamples({ onClick }: { onClick: () => void }) {
  return (
    <div>
      <button onClick={onClick} once type="button" data-testid="save" disabled ref={null}>
        Save
      </button>
      <Panel></Panel>
      <button type="button" onClick={save}>
        Async
      </button>
      {["a", "b"].map(label => (
        <span>{label}</span>
      ))}
    </div>
  );
}

export function NestedFactory() {
  function Inner() {
    return <span />;
  }

  return <Inner />;
}
