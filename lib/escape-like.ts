// `%`, `_` y `\` son comodines de ILIKE: se escapan para buscar el texto literal.
export const escapeLike = (value: string) => value.replace(/[\\%_]/g, "\\$&");
