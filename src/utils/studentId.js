export function generateStudentId(name) {
  const letter = (name || 'X').trim()[0].toUpperCase();
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `TSO-${digits}-${letter}`;
}
