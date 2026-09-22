# Benchmark internacional de apoyo a MIPYMES

Sitio estático para explorar la información de la **Hoja 5** del archivo `(Preliminar) Opciones benchmark (3).xlsx`.

## Qué incluye

- Búsqueda por institución, programa, instrumento y problema.
- Filtros por país o región, institución, categoría y problema.
- Vista general con mapa esquemático y tarjetas de resultados.
- Ficha por institución con todos sus programas e instrumentos.
- Ficha detallada de cada registro con mecanismo operativo, instrumento y problema.
- Diseño adaptable a computadoras, tabletas y teléfonos.
- Paleta visual basada en el documento *Voz del corpus: fenómenos, soluciones y selección*.

## Estructura

```text
benchmark-mipymes-ies/
├── index.html
├── styles.css
├── app.js
├── data.js
├── .nojekyll
└── scripts/
    └── extract_data.py
```

El sitio no usa frameworks ni servicios externos. Puede abrirse con un servidor estático o publicarse directamente en GitHub Pages.

## Ejecutar localmente

Desde la carpeta del repositorio:

```bash
python3 -m http.server 8000
```

Luego abra `http://localhost:8000`.

## Actualizar los datos

Instale `openpyxl` y ejecute:

```bash
python3 scripts/extract_data.py "/ruta/al/archivo.xlsx" data.js
```

El script lee exclusivamente la hoja denominada `Hoja 5` y conserva los ocho campos de origen.

## Publicar con GitHub Pages

1. Cree un repositorio en GitHub y suba estos archivos a la rama `main`.
2. En **Settings → Pages**, seleccione **Deploy from a branch**.
3. Elija la rama `main` y la carpeta `/ (root)`.
4. Guarde los cambios. GitHub mostrará la URL pública cuando termine el despliegue.

## Fuente de datos

Archivo: `(Preliminar) Opciones benchmark (3).xlsx`  
Hoja: `Hoja 5`  
Registros: 48
