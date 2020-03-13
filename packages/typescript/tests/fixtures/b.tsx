export function Button(props) {
  return <button>{props.children}</button>;
}

export class B {
  render() {
    return <Button>(message)</Button>;
  }
}
