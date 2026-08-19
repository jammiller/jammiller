import { readFileSync } from 'fs';

const raw = readFileSync('/tmp/cc-agent/67817589/project/.bolt/blog_output.json', 'utf8');
// Parse the custom format: "--- Article N ---\n{...}\n\n"
const blocks = raw.split(/--- Article \d+ ---\n/).filter(b => b.trim());
const articles = blocks.map(b => JSON.parse(b.trim()));

const ids = [
  'd0832121-c2aa-45b8-995b-923a14675a83',
  '4eb2ad37-2a81-4c86-ab87-30f279971649',
  '1ec02cfc-3aec-4234-bb65-bac51e2c394b',
  '7d4c73c1-6bc2-4a6a-9b76-cfa4d42b1561',
];

let sql = '';
for (let i = 0; i < articles.length; i++) {
  const a = articles[i];
  const id = ids[i];
  // Use dollar-quoting for content, and escape single quotes in other text fields
  const title = a.title.replace(/'/g, "''");
  const excerpt = a.excerpt.replace(/'/g, "''");
  const slug = a.slug;
  const category = a.category.replace(/'/g, "''");
  const tags = `ARRAY[${a.tags.map(t => `'${t.replace(/'/g, "''")}'`).join(',')}]::text[]`;
  
  sql += `UPDATE blog_posts SET title = '${title}', slug = '${slug}', excerpt = '${excerpt}', content = $content${i}$${a.content}$content${i}$, category = '${category}', tags = ${tags}, read_time_minutes = 5, updated_at = now() WHERE id = '${id}';\n`;
}

console.log(sql);
