export interface DraggableItem {
  index: number;
}

export function moveUp<T extends DraggableItem>(
  arr: T[],
  destination: number,
  source: number
) {
  for (let index = 0; index < arr.length; index++) {
    const element = arr[index];
    if (index >= destination && index <= source) {
      if (index == source) {
        element.index = destination;
      } else {
        element.index += 1;
      }
    }
  }
}

export function moveDown<T extends DraggableItem>(
  arr: T[],
  destination: number,
  source: number
) {
  for (let index = 0; index < arr.length; index++) {
    const element = arr[index];
    if (index >= source && index <= destination) {
      if (index == source) {
        element.index = destination;
      } else {
        element.index -= 1;
      }
    }
  }
}

export function insertFirst<T extends DraggableItem>(arr: T[], item: T) {
  arr.unshift(item);
  for (let index = 0; index < arr.length; index++) {
    const element = arr[index];
    element.index = index;
  }
}

export function removeItem<T extends DraggableItem>(arr: T[], index: number) {
  const item = arr.splice(index, 1);
  for (let index = 0; index < arr.length; index++) {
    const element = arr[index];
    element.index = index;
  }
  return item;
}

export function insertLast<T extends DraggableItem>(arr: T[], item: T) {
  arr.push(item);
  for (let index = 0; index < arr.length; index++) {
    const element = arr[index];
    element.index = index;
  }
}
