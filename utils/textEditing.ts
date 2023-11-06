/** Adds support for hitting the tab key and indenting the text in the box as
 *  opposed to the default action of jumping to the next form element */
export function tabInput(input: HTMLInputElement) {
  const start = input.selectionStart || 0;
  const end = input.selectionEnd || 0;

  // unfortunately breaks undo
  input.value =
    input.value.substring(0, start) + "\t" + input.value.substring(end);

  input.selectionStart = input.selectionEnd = start + 1;
}

export function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
