#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const contentRoot = path.resolve(process.cwd(), 'src/content/blog');
const required = ['title', 'date', 'tags', 'slug', 'lang', 'author', 'summary'];
const files = [];
const errors = [];
const warnings = [];
const slugs = new Map();

function visit(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) visit(target);
    else if (entry.isFile() && entry.name.endsWith('.md')) files.push(target);
  }
}

if (!fs.existsSync(contentRoot)) {
  console.error(`Blog content directory not found: ${contentRoot}`);
  process.exit(1);
}

visit(contentRoot);

for (const file of files.sort()) {
  const relative = path.relative(process.cwd(), file);
  const source = fs.readFileSync(file, 'utf8');
  const match = source.match(/^---\n([\s\S]*?)\n---\n/);

  if (!match) {
    errors.push(`${relative}: missing or malformed frontmatter`);
    continue;
  }

  const frontmatter = match[1];
  const values = new Map();
  for (const line of frontmatter.split('\n')) {
    const field = line.match(/^([a-zA-Z][\w-]*):\s*(.*)$/);
    if (field) values.set(field[1], field[2]);
  }

  for (const key of required) {
    if (!values.has(key) || values.get(key) === '') {
      errors.push(`${relative}: missing frontmatter field '${key}'`);
    }
  }

  const rawDate = values.get('date') ?? '';
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+09:00$/.test(rawDate)) {
    errors.push(`${relative}: date must use YYYY-MM-DDTHH:mm:ss+09:00`);
  }

  const rawSlug = values.get('slug') ?? '';
  const slug = rawSlug.replace(/^['"]|['"]$/g, '');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    errors.push(`${relative}: slug must be lowercase kebab-case`);
  } else if (slugs.has(slug)) {
    errors.push(`${relative}: duplicate slug '${slug}' also used by ${slugs.get(slug)}`);
  } else {
    slugs.set(slug, relative);
  }

  const body = source.slice(match[0].length);
  const fenceCount = (body.match(/^```/gm) ?? []).length;
  if (fenceCount % 2 !== 0) errors.push(`${relative}: unclosed fenced code block`);

  const stockClosings = (body.match(/^#{1,3}\s+(정리하면|남는 것|남긴 것|마치며)\s*$/gm) ?? []).length;
  if (stockClosings > 1) {
    warnings.push(`${relative}: repeats stock closing headings ${stockClosings} times`);
  }

  const boldParagraphs = (body.match(/^\*\*[^\n]+\*\*$/gm) ?? []).length;
  if (boldParagraphs > 3) {
    warnings.push(`${relative}: contains ${boldParagraphs} standalone bold paragraphs`);
  }
}

for (const warning of warnings) console.warn(`WARN ${warning}`);
for (const error of errors) console.error(`ERROR ${error}`);

console.log(`Checked ${files.length} posts: ${errors.length} error(s), ${warnings.length} warning(s)`);
process.exit(errors.length === 0 ? 0 : 1);
