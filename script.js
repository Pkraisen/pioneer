const cursor = document.createElement("div");
cursor.classList.add("cursor");
document.body.appendChild(cursor);

const notes = ["🎵", "♪", "♫", "🎶"];
let hue = 0;

document.addEventListener("mousemove", (e) => {
  // Move cursor
  cursor.style.left = `${e.clientX}px`;
  cursor.style.top = `${e.clientY}px`;

  // Change color smoothly
  hue = (hue + 3) % 360;
  cursor.style.background = `hsl(${hue}, 100%, 60%)`;

  // Create floating music note
  const note = document.createElement("div");
  note.classList.add("note");
  note.style.left = `${e.clientX}px`;
  note.style.top = `${e.clientY}px`;
  note.textContent = notes[Math.floor(Math.random() * notes.length)];
  note.style.color = `hsl(${hue}, 100%, 70%)`;
  document.body.appendChild(note);

  // Remove note after animation
  setTimeout(() => note.remove(), 1500);
});
