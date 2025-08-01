
import validator from 'validator';


export function sanitizeName(s) {
  return validator.whitelist(validator.trim(String(s || '')), 'A-Za-z\\s');
}

export function sanitizeEmail(s) {
  const t = validator.trim(String(s || ''));
  return validator.normalizeEmail(t) || t.toLowerCase();
}


export function sanitizeBio(s) {
  let x = validator.trim(String(s || ''));
  x = x.replace(/<[^>]*>/g, '');
  x = validator.whitelist(x, "A-Za-z0-9 \\.,'’\\-\\n");
  return x.slice(0, 500);
}


export function validateProfile({ name, email, bio }) {
  const errors = {};
  const nm = String(name || '').trim();
  const em = String(email || '').trim();
  const bi = String(bio || '');

  if (!/^[A-Za-z\s]{3,50}$/.test(nm)) {
    errors.name = 'Name must be 3–50 alphabetic characters';
  }
  if (!validator.isEmail(em)) {
    errors.email = 'Invalid email address';
  }
  if (bi.length > 500 || !/^[A-Za-z0-9\s\.,'’\-]*$/.test(bi)) {
    errors.bio = 'Bio must be ≤500 and contain only letters, numbers, spaces and basic punctuation';
  }
  return errors;
}
