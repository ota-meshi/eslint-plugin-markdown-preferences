const source1 = `foo 
bar`;

console.log('Source 1 bytes:');
for (let i = 0; i < source1.length; i++) {
  const char = source1[i];
  const code = char.charCodeAt(0);
  console.log(`  ${i}: '${char === '\n' ? '\\n' : char}' (${code})`);
}

// The text node has position start offset 0, end offset 8
// Let's see what source1.slice(0, 8) gives us
console.log('\nText node range (0-8):');
console.log(JSON.stringify(source1.slice(0, 8)));

console.log('\nFull source:');
console.log(JSON.stringify(source1));
