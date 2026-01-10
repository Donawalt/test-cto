/**
 * Global ambient types for the monorepo.
 * Add shared interfaces or declarations here that should be available globally.
 */

declare global {
  /**
   * Represents a unique ID (string or number).
   */
  type IDEntityId = string | number;

  /**
   * Standard JSON-serializable object.
   */
  interface IJSONObject {
    [key: string]: string | number | boolean | null | IJSONObject | IJSONObject[];
  }

  /**
   * Useful for polymorphic components.
   */
  type AsElement<E extends React.ElementType> = {
    as?: E;
  };
}

export {};
