import { describe, test, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

// Sobre el fondo de la app, el texto blanco necesita al menos 50% de
// opacidad para llegar a contraste 4.5:1 (con .5 da ~4.8:1 en el peor
// caso). Las variables --text-muted y --text-subtle del tema ya cumplen.
const ALFA_MINIMA = 0.5;

const raiz = path.resolve(__dirname, '..');

const archivos = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const ruta = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === 'tests' ? [] : archivos(ruta);
    return /\.(jsx|css)$/.test(e.name) ? [ruta] : [];
});

// Solo la propiedad color (no background-color ni border-color)
const TEXTO_BLANCO = /(?<![-\w])color\s*:\s*['"]?rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*(0?\.\d+)\s*\)/g;

describe('Contraste de texto', () => {

    test(`ningún texto blanco usa menos de ${ALFA_MINIMA * 100}% de opacidad`, () => {
        const problemas = archivos(raiz).flatMap((archivo) => {
            const contenido = fs.readFileSync(archivo, 'utf8');
            return [...contenido.matchAll(TEXTO_BLANCO)]
                .filter((m) => parseFloat(m[1]) < ALFA_MINIMA)
                .map((m) => `${path.relative(raiz, archivo)}: ${m[0]}`);
        });

        expect(problemas).toEqual([]);
    });
});
