export function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children
        .flat(Infinity)
        .filter(child => child !== null && child !== undefined && child !== false && child !== true)
        .map(child => {
          return typeof child === "object"
            ? child
            : createTextElement(child);
        }),
    },
  };
}

function createTextElement(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
}
