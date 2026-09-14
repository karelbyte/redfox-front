/// <reference types="@testing-library/jest-dom" />

// jest.setup.js importa '@testing-library/jest-dom' en tiempo de ejecución,
// pero al ser un archivo .js TypeScript no recoge la ampliación de tipos de
// los matchers (toBeInTheDocument, toHaveAttribute...). Esta referencia la
// hace visible en todo el proyecto.
