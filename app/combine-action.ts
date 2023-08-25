"use server";

export async function combineAction(note: string, existingNotes: string) {
  // wait for 1 second
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return existingNotes + "\n" + note;
}
