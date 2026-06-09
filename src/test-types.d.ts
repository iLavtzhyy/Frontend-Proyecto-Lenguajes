declare function describe(nombre: string, bloque: () => void): void;
declare function beforeEach(bloque: () => void | Promise<void>): void;
declare function it(nombre: string, bloque: () => void | Promise<void>): void;
declare function expect(valor: unknown): {
  toBeTruthy(): void;
  toEqual(esperado: unknown): void;
  toBe(esperado: unknown): void;
};
