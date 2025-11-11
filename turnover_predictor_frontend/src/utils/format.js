 /**
  * PUBLIC_INTERFACE
  * formatGameLabel - Returns a display label for a game entry.
  * @param {{ opponent: string, date: string }} game
  * @returns {string}
  */
export function formatGameLabel(game) {
  // Expect date as ISO string
  const d = new Date(game.date);
  const datePart = isNaN(d.getTime()) ? game.date : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  return `vs ${game.opponent} — ${datePart}`;
}
