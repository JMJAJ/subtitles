// src/api/Styles.ts
export function classNameFactory(prefix: string) {
    return (...classes: (string | false | null | undefined)[]) =>
      classes.filter(Boolean).map(cls => `${prefix}${cls}`).join(" ");
  }
  