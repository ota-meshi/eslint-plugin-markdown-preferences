import { fromMarkdown } from 'mdast-util-from-markdown';

const markdown1 = `foo 
bar`;

const markdown2 = `foo  
bar`;

console.log('=== Test 1: One space ===');
const ast1 = fromMarkdown(markdown1);
console.log(JSON.stringify(ast1, null, 2));

console.log('\n=== Test 2: Two spaces (hard break) ===');
const ast2 = fromMarkdown(markdown2);
console.log(JSON.stringify(ast2, null, 2));
